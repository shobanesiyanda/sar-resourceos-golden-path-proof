import test from "node:test";
import assert from "node:assert/strict";
import {prepareContractAcceptance,CONTRACT_OPERATOR} from "../lib/customer-consent.mjs";
const H="b".repeat(64),T="2026-10-28T10:00:00Z";
const grant={serverVerified:true,tenantId:"ORG1",userId:"U1",sessionId:"S1",authEventId:"A1",action:"request_free_cycle"};
const publications=Object.fromEntries(["terms","privacy","payments"].map(kind=>[kind,
 {kind,state:"effective",legalApproved:true,currentSupplier:CONTRACT_OPERATOR,
  version:kind+"-001",sha256:H,effectiveAt:"2026-10-28T09:00:00Z"}]));
const choices={eventId:"CONSENT-1",reviewSessionId:"review1",explicitAgreement:true,
 noPrecheckedConsent:true,customerCorrectedOrConfirmed:true,
 termsViewed:true,privacyViewed:true,paymentsViewed:true,
 acceptedVersions:Object.fromEntries(Object.entries(publications).map(([k,v])=>[k,{version:v.version,sha256:v.sha256}]))};
const scope={legalSupplier:CONTRACT_OPERATOR,tenantId:"ORG1",serviceCode:"COMPLETE_DEAL_ASSESSMENT",
 offerVersion:"free-001",offerState:"published",amountMinor:0,currency:"ZAR",automaticCharge:false,
 requiresPaymentMethod:false,includedCycles:1};
const run=x=>prepareContractAcceptance({grant,publications,choices,scope,serverTime:T,...x});
test("one free full assessment yields nonissued consent candidate only",()=>{
 const x=run({});assert.equal(x.state,"acceptance_candidate");
 assert.equal(x.event.automaticCharge,false);assert.equal(x.event.marketingConsent,false);
});
test("unapproved draft terms and stale policy hashes are rejected",()=>{
 assert.equal(run({publications:{...publications,terms:{...publications.terms,legalApproved:false}}}).state,"blocked");
 assert.equal(run({choices:{...choices,acceptedVersions:{...choices.acceptedVersions,terms:{...choices.acceptedVersions.terms,sha256:"a".repeat(64)}}}}).state,"blocked");
 assert.equal(run({publications:{...publications,payments:{...publications.payments,effectiveAt:"2026-11-01T00:00:00Z"}}}).state,"blocked");
});
test("no unreviewed order or prechecked consent",()=>{
 assert.equal(run({choices:{...choices,explicitAgreement:false}}).state,"blocked");
 assert.equal(run({choices:{...choices,noPrecheckedConsent:false}}).state,"blocked");
 assert.equal(run({priorEventIds:["CONSENT-1"]}).state,"blocked");
});
test("cross-tenant, guessed operator and paid conversion prevented",()=>{
 assert.equal(run({scope:{...scope,tenantId:"OTHER"}}).state,"blocked");
 assert.equal(run({scope:{...scope,legalSupplier:"DealScope (Pty) Ltd"}}).state,"blocked");
 assert.equal(run({scope:{...scope,amountMinor:1}}).state,"blocked");
 assert.equal(run({scope:{...scope,isRecurring:true}}).state,"blocked");
});
test("paid service needs affirmative exact review, no automatic subscription",()=>{
 const paid={...scope,serviceCode:"DEALSCOPE_DECISION_REPORT",amountMinor:23000,
 requiresPaymentMethod:true,includedCycles:0};
 assert.equal(run({scope:paid}).state,"blocked");
 assert.equal(run({scope:paid,choices:{...choices,orderReviewed:true,priceVatAndFeesViewed:true}}).state,"acceptance_candidate");
});
