import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePaymentEvent,SAR_LEGAL_ENTITY} from '../lib/payment-event-contract.mjs';
const event={organizationId:'CUSTOMER-1',provider:'SANDBOX',providerEventId:'E1',
 providerTransactionId:'TX1',originalPurchaseId:'ORDER1',kind:'payment_captured',currency:'ZAR',amountMinor:150000};
const base={ownerLegalEntity:SAR_LEGAL_ENTITY,merchantId:'SAR-MERCHANT',
 verification:{signatureVerified:true,merchantId:'SAR-MERCHANT',provider:'SANDBOX'},event,seenEventKeys:[]};
const run=(changes={})=>preparePaymentEvent({...base,...changes});
test('SAR-merchant validated event is only pending reconciliation',()=>{
 const r=run();assert.equal(r.state,'pending_reconciliation');
 assert.equal(r.postingIntent.amountMinor,150000);
 assert.equal(r.postingIntent.entitlementActivationAuthorised,false);
 assert.equal(r.postingIntent.settlementConfirmed,false);
});
test('third-party legal owner cannot collect DealScope funds',()=>{
 assert.equal(run({ownerLegalEntity:'Possent Systems (Pty) Ltd'}).state,'blocked');
});
test('unsigned or wrong merchant events fail closed',()=>{
 assert.equal(run({verification:{...base.verification,signatureVerified:false}}).state,'blocked');
 assert.equal(run({verification:{...base.verification,merchantId:'SOMEONE-ELSE'}}).state,'blocked');
});
test('provider-event replay has a deterministic no-posting outcome',()=>{
 const r=run({seenEventKeys:['SANDBOX:E1']});assert.equal(r.state,'duplicate');
 assert.equal(r.postingIntent,null);
});
test('incorrect amount or currency is never reconciled',()=>{
 assert.equal(run({event:{...event,amountMinor:-1}}).state,'blocked');
 assert.equal(run({event:{...event,amountMinor:Infinity}}).state,'blocked');
 assert.equal(run({event:{...event,currency:'XYZ'}}).state,'blocked');
});
test('refunds require captured-payment reference',()=>{
 assert.equal(run({event:{...event,kind:'refund_confirmed'}}).state,'blocked');
 const r=run({event:{...event,kind:'refund_confirmed',originalCapturedEventId:'CAP1'}});
 assert.equal(r.state,'pending_reconciliation');
});
test('payment event is not authorised without customer tenant and purchase',()=>{
 assert.equal(run({event:{...event,organizationId:''}}).state,'blocked');
 assert.equal(run({event:{...event,originalPurchaseId:''}}).state,'blocked');
});
test('event provider must match cryptographically verified adapter',()=>{
 assert.equal(run({verification:{...base.verification,provider:'OTHER'}}).state,'blocked');
});
