import test from "node:test";
import assert from "node:assert/strict";
import {prepareDisclosure as share,prepareBuyerInterest as interest} from "../lib/exchange-consent.mjs";
const H="a".repeat(64);
const offer={id:"O1",sellerTenantId:"SELLER",contentHash:H,state:"authorised_for_disclosure",
 integrityReviewStatus:"sufficient_for_restricted_disclosure",mandateEvidenceId:"MANDATE",
 stockRightsEvidenceId:"TITLE",validUntil:"2026-11-30"};
const principal={authenticated:true,activeMembership:true,tenantId:"SELLER",userId:"S1",permissions:["exchange_disclose"]};
const buyer={tenantId:"BUYER",verified:true,suspended:false,authenticated:true,
 activeMembership:true,userId:"B1",permissions:["exchange_express_interest"]};
const consent={id:"C1",offerId:"O1",offerHash:H,sellerUserId:"S1",recipientTenantId:"BUYER",
 validUntil:"2026-11-20",explicitPermission:true,approvalEventId:"APP1",
 fields:["material_spec","volume","price_terms"]};
const args=()=>({offer,principal,buyer,consent,asOf:"2026-10-27"});
test("restricted disclosure remains nonbinding and exactly recipient scoped",()=>{
 const r=share(args());assert.equal(r.state,"disclosure_candidate");
 assert.equal(r.intent.buyerTenantId,"BUYER");assert.equal(r.intent.authorisesContract,false);
 assert.equal(r.intent.buyerCanViewWithoutFurtherServerChecks,false);
});
test("buyer not verified, wrong tenant, expired seller authority and duplicate consent blocked",()=>{
 assert.equal(share({...args(),buyer:{...buyer,verified:false}}).state,"blocked");
 assert.equal(share({...args(),buyer:{...buyer,tenantId:"SELLER"}}).state,"blocked");
 assert.equal(share({...args(),offer:{...offer,validUntil:"2026-10-20"}}).state,"blocked");
 assert.equal(share({...args(),seenConsentIds:["C1"]}).state,"blocked");
});
test("seller cannot disclose undeclared fields, unauthorised content changes or unscreened offers",()=>{
 assert.equal(share({...args(),consent:{...consent,fields:["bank_account"]}}).state,"blocked");
 assert.equal(share({...args(),offer:{...offer,contentHash:"b".repeat(64)}}).state,"blocked");
 assert.equal(share({...args(),offer:{...offer,integrityReviewStatus:"missing"}}).state,"blocked");
});
test("buyer interest cannot skip disclosure and never becomes binding sale",()=>{
 const result=share(args());
 const r=interest({offer,buyer,disclosure:result.intent,interest:{id:"I1",offerId:"O1",reason:"Request specification"},asOf:"2026-10-27"});
 assert.equal(r.state,"interest_candidate");assert.equal(r.intent.stockReserved,false);
 assert.equal(r.intent.purchaseOrderIssued,false);assert.equal(r.intent.paymentAuthorised,false);
 assert.equal(interest({offer,buyer:{...buyer,tenantId:"OTHER"},disclosure:result.intent,interest:{id:"I1",offerId:"O1",reason:"Request"},asOf:"2026-10-27"}).state,"blocked");
});
