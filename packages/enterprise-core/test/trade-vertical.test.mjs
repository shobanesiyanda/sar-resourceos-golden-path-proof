import test from 'node:test';import assert from 'node:assert/strict';
import {prepareDispatchCandidate as dispatch,reconcileReceiptCandidate as reconcile} from '../../physical-core/src/fulfilment.mjs';
import {prepareSalesJournalCandidate as journal,prepareSettlementCandidate as settlement} from '../../accounting-core/src/journal.mjs';
import {prepareTradeClosure as close} from '../src/trade-closure.mjs';
const C='Shobane African Resources (Pty) Ltd',T='SAR-ORG';const H='a'.repeat(64),H2='b'.repeat(64);
const order={id:'PO-1',tenantId:T,state:'approved_calloff',signed:true,currency:'ZAR',buyerId:'HMS-TEST',commodity:'chrome',materialForm:'concentrate',qualityBasis:'Cr2O3_dry_t',totalDryT:100};
const parcel={id:'P-1',tenantId:T,sourceId:'SRC1',sourceControlVerified:true,titleEvidenceVerified:true,commodity:'chrome',materialForm:'concentrate',qualityBasis:'Cr2O3_dry_t',availableDryT:100};
const vehicle={id:'SAR-TIP-001',tenantId:T,status:'available',roadworthyVerified:true,insuranceCurrent:true,payloadWetT:34};
const driver={id:'DRV1',active:true,licensedForVehicle:true};
const evidence={verified:true,parcelId:'P-1',sha256:H};
const command={tripId:'TRIP1',approvalEventId:'APRV1',releaseApproved:true,sarControllerVerified:true,wetLoadedT:34,moisturePct:10};
const load=(o={})=>dispatch({company:C,tenantId:T,order,parcel,vehicle,driver,sourceEvidence:evidence,command,seenTripIds:[],...o});
const receipt={id:'RCPT1',tenantId:T,tripId:'TRIP1',calloffId:'PO-1',parcelId:'P-1',buyerId:'HMS-TEST',weighbridgeVerified:true,independentAssayReviewed:true,buyerAccepted:true,sourceSha256:H2,assayRef:'LAB1',wetReceivedT:34,moisturePct:10};
const rec=(o={})=>reconcile({dispatch:load().dispatch,receipt,seenReceiptIds:[],...o});
const invoice={invoiceId:'INV1',receiptId:'RCPT1',calloffId:'PO-1',buyerId:'HMS-TEST',company:C,tenantId:T,currency:'ZAR',invoiceState:'approved_unposted',customerAccepted:true,documentSha256:H,netCents:5000000,vatCents:750000,grossCents:5750000};
const period={id:'2026-10',status:'open'};const accountant={userId:'ACC1',tenantId:T,verified:true,roles:['accounting_preparer']};
const j=(o={})=>journal({tenantId:T,invoice,receipt:rec().receipt,period,actor:accountant,...o});
const posting={id:'GL1',tenantId:T,invoiceId:'INV1',status:'posted',immutableVerified:true,amountCents:5750000};
const bankInstruction={id:'PAY1',tenantId:T,invoiceId:'INV1',bankDetailsVerified:true,duplicatePaymentChecked:true,amountCents:5750000,preparedBy:'TREAS1'};
const approver={userId:'TREAS2',tenantId:T,verified:true,roles:['treasury_authoriser']};
const paid={id:'BANK1',invoiceId:'INV1',tenantId:T,bankVerified:true,reconciledLedgerPostingId:'GL1',amountCents:5750000,sourceSha256:H2};
const closer={userId:'CLOSE1',tenantId:T,verified:true,roles:['trade_closure_reviewer']};
const end=(o={})=>close({tenantId:T,calloffId:'PO-1',receipt:rec().receipt,invoice,journalPosting:posting,bankConfirmation:paid,actor:closer,exceptions:[],...o});
const checks=[
 ['approved SAR company dispatch yields dry tonnes, no side effects',()=>{let x=load();assert.equal(x.state,'dispatch_candidate');assert.equal(x.dispatch.calculatedDryT,30.6);assert.equal(x.dispatch.status,'not_dispatched');assert.equal(x.dispatch.paymentAuthorized,false)}],
 ['unverified seller title never passes dispatch gate',()=>assert.equal(load({parcel:{...parcel,titleEvidenceVerified:false}}).state,'blocked')],
 ['unsigned buyer purchase order cannot initiate dispatch',()=>assert.equal(load({order:{...order,signed:false}}).state,'blocked')],
 ['tenant B cannot enter SAR cargo route',()=>assert.equal(load({vehicle:{...vehicle,tenantId:'TENANT-B'}}).state,'blocked')],
 ['truck cannot exceed wet payload',()=>assert.equal(load({command:{...command,wetLoadedT:34.01}}).state,'blocked')],
 ['same trip replay denied',()=>assert.equal(load({seenTripIds:['TRIP1']}).state,'blocked')],
 ['missing driver qualification denied',()=>assert.equal(load({driver:{...driver,licensedForVehicle:false}}).state,'blocked')],
 ['unknown or over-100% moisture denied',()=>{for(const n of [100,-1,NaN])assert.equal(load({command:{...command,moisturePct:n}}).state,'blocked')}],
 ['insufficient source dry tonnes denied',()=>assert.equal(load({parcel:{...parcel,availableDryT:20}}).state,'blocked')],
 ['verified matching receipt yields provisional acceptance',()=>{let x=rec();assert.equal(x.state,'receipt_candidate');assert.equal(x.receipt.acceptedDryT,30.6);assert.equal(x.receipt.ledgerPosted,false)}],
 ['weighbridge weight mismatch denied',()=>assert.equal(rec({receipt:{...receipt,wetReceivedT:29}}).state,'blocked')],
 ['weighbridge over-loaded mass denied',()=>assert.equal(rec({receipt:{...receipt,wetReceivedT:35}}).state,'blocked')],
 ['receipt buyer mismatch denied',()=>assert.equal(rec({receipt:{...receipt,buyerId:'OTHER'}}).state,'blocked')],
 ['independent assay absent denied',()=>assert.equal(rec({receipt:{...receipt,independentAssayReviewed:false}}).state,'blocked')],
 ['repeat receipt ID denied',()=>assert.equal(rec({seenReceiptIds:['RCPT1']}).state,'blocked')],
 ['buyer accepted sale prepares balanced but unposted GL only',()=>{let x=j();assert.equal(x.state,'journal_candidate');assert.equal(x.journal.totalDebitCents,5750000);assert.equal(x.journal.totalCreditCents,5750000);assert.equal(x.journal.status,'unposted')}],
 ['no source receipt invoice mismatch possible',()=>assert.equal(j({invoice:{...invoice,receiptId:'OTHER'}}).state,'blocked')],
 ['closed accounting period cannot receive new sales journal',()=>assert.equal(j({period:{...period,status:'closed'}}).state,'blocked')],
 ['invoice duplicate cannot create second journal',()=>assert.equal(j({seenSourceIds:['INV1']}).state,'blocked')],
 ['unbalanced invoice cannot enter ledger',()=>assert.equal(j({invoice:{...invoice,grossCents:5750001}}).state,'blocked')],
 ['unverified accountant denied',()=>assert.equal(j({actor:{...accountant,verified:false}}).state,'blocked')],
 ['posted immutable journal and independent treasury authorize only candidate',()=>{let x=settlement({tenantId:T,invoice,journalPosting:posting,bankInstruction,approver});assert.equal(x.state,'settlement_candidate');assert.equal(x.settlement.status,'not_sent_to_bank');assert.equal(x.settlement.paymentConfirmed,false)}],
 ['self-authorised treasury instruction denied',()=>assert.equal(settlement({tenantId:T,invoice,journalPosting:posting,bankInstruction,approver:{...approver,userId:'TREAS1'}}).state,'blocked')],
 ['posting must exist before settlement',()=>assert.equal(settlement({tenantId:T,invoice,journalPosting:{...posting,status:'unposted'},bankInstruction,approver}).state,'blocked')],
 ['supplier bank verification absent denies settlement',()=>assert.equal(settlement({tenantId:T,invoice,journalPosting:posting,bankInstruction:{...bankInstruction,bankDetailsVerified:false},approver}).state,'blocked')],
 ['bank instruction replay rejected',()=>assert.equal(settlement({tenantId:T,invoice,journalPosting:posting,bankInstruction,approver,seenBankInstructionIds:['PAY1']}).state,'blocked')],
 ['all approved source/ledger/bank evidence creates only closure intent',()=>{let x=end();assert.equal(x.state,'closure_intent');assert.equal(x.intent.noLedgerMutation,true);assert.equal(x.intent.noPaymentRelease,true)}],
 ['unreconciled bank cannot close trade',()=>assert.equal(end({bankConfirmation:{...paid,bankVerified:false}}).state,'blocked')],
 ['bank-to-ledger mismatch cannot close trade',()=>assert.equal(end({bankConfirmation:{...paid,reconciledLedgerPostingId:'OTHER'}}).state,'blocked')],
 ['open assay or commercial exceptions prevent close',()=>assert.equal(end({exceptions:['assay_discrepancy']}).state,'blocked')],
 ['cross-tenant closer cannot close',()=>assert.equal(end({actor:{...closer,tenantId:'OTHER'}}).state,'blocked')],
 ['unsupported cross-company invoice denied',()=>assert.equal(j({invoice:{...invoice,company:'Possent Systems'}}).state,'blocked')]
];
for(const [description,fn] of checks)test(description,fn);
