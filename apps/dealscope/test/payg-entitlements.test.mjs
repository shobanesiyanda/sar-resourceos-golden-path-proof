import test from 'node:test';
import assert from 'node:assert/strict';
import {createPaygOrder,assessPaidGrant,createWallet,applyGrant,reserveReport,closeReport} from '../lib/payg-entitlements.mjs';
const offer={serviceCode:'DEALSCOPE_DECISION_REPORT',status:'published',priceMinor:29900,reportCredits:1,
 currency:'ZAR',version:'pilot-v1',description:'Structured indicative commercial Deal Run report'};
const base=()=>createPaygOrder({orderId:'P1',organizationId:'TEN-1',customerId:'CUS-1',offer,at:'2026-10-27T18:00:00Z'}).result;
const receipt=()=>({provider:'gateway',providerEventId:'evt1',providerTransactionId:'tx1',
 orderId:'P1',organizationId:'TEN-1',amountMinor:29900,currency:'ZAR',merchantId:'merchant-sar',kind:'payment_captured'});
const proof=()=>({signatureValid:true,providerConfirmed:true,merchantMatched:true,amountMatched:true,orderedServiceMatched:true});
test('published PAYG service price and purchase are required',()=>{
 assert.equal(createPaygOrder({orderId:'P',organizationId:'O',customerId:'U',offer:{...offer,status:'draft'},at:'2026-10-27'}).state,'blocked');
 assert.equal(base().legalMerchant,'Shobane African Resources (Pty) Ltd');
});
test('no entitlement from mere payment claim or mismatch',()=>{
 assert.equal(assessPaidGrant({order:base(),providerReceipt:receipt(),verification:{...proof(),signatureValid:false}}).state,'blocked');
 assert.equal(assessPaidGrant({order:base(),providerReceipt:{...receipt(),amountMinor:1},verification:proof()}).state,'blocked');
 assert.equal(assessPaidGrant({order:base(),providerReceipt:receipt(),verification:proof(),processedEventKeys:['gateway:evt1']}).state,'duplicate');
});
test('one verified purchase, one delivered report, no outcome dependency',()=>{
 const granted=assessPaidGrant({order:base(),providerReceipt:receipt(),verification:proof()});
 assert.equal(granted.state,'grant_candidate');assert.equal(granted.result.dealOutcomeDependent,false);
 const wallet=createWallet({organizationId:'TEN-1',customerId:'CUS-1'}).result;
 const w=applyGrant(wallet,granted.result).result;
 assert.equal(w.creditsAvailable,1);
 assert.equal(applyGrant(w,granted.result).state,'blocked');
 const reserved=reserveReport(w,{organizationId:'TEN-1',customerId:'CUS-1',runId:'run1',analysisScope:'chrome route economics'}).result;
 assert.equal(reserved.creditsReserved,1);assert.equal(reserved.creditsAvailable,0);
 assert.equal(reserveReport(reserved,{organizationId:'TEN-1',customerId:'CUS-1',runId:'run1',analysisScope:'same'}).state,'blocked');
 const delivered=closeReport(reserved,{organizationId:'TEN-1',customerId:'CUS-1',runId:'run1',deliveryState:'delivered',reportRef:'report-1'}).result;
 assert.equal(delivered.creditsConsumed,1);
 assert.equal(delivered.creditsAvailable,0);
 assert.equal(closeReport(delivered,{organizationId:'TEN-1',customerId:'CUS-1',runId:'run1',deliveryState:'delivered',reportRef:'report-1'}).state,'blocked');
});
test('unfulfilled service returns credit and wrong tenant is rejected',()=>{
 const a=assessPaidGrant({order:base(),providerReceipt:receipt(),verification:proof()}).result;
 const w=applyGrant(createWallet({organizationId:'TEN-1',customerId:'CUS-1'}).result,a).result;
 assert.equal(reserveReport(w,{organizationId:'TEN-2',customerId:'CUS-1',runId:'x',analysisScope:'route'}).state,'blocked');
 const r=reserveReport(w,{organizationId:'TEN-1',customerId:'CUS-1',runId:'x',analysisScope:'route'}).result;
 const f=closeReport(r,{organizationId:'TEN-1',customerId:'CUS-1',runId:'x',deliveryState:'failed'}).result;
 assert.equal(f.creditsAvailable,1);assert.equal(f.runs[0].state,'failed_recredited');
});
