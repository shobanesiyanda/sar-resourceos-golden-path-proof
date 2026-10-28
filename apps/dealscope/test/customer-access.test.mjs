import test from "node:test";
import assert from "node:assert/strict";
import {authorizeCustomerAction} from "../lib/customer-access.mjs";
const principal={source:"verified-auth-session",authenticationVerified:true,userId:"U1",
 sessionId:"S1",authenticationEventId:"AUTH1",isAnonymous:false};
const membership={source:"membership-ledger",serverReadVerified:true,
 tenantId:"ORG1",userId:"U1",state:"active",role:"owner"};
const organisation={id:"ORG1",verificationState:"verified"};
const base={principal,membership,organisation,action:"request_free_cycle"};
const check=x=>authorizeCustomerAction({...base,...x});
test("named verified customer membership permits scoped candidate only",()=>{
 const x=check({});assert.equal(x.state,"authorised_candidate");assert.equal(x.grant.tenantId,"ORG1");
});
test("no claims from client-supplied fake authentication or role metadata",()=>{
 assert.equal(check({principal:{...principal,source:"user_metadata"}}).state,"denied");
 assert.equal(check({membership:{...membership,source:"user_metadata"}}).state,"denied");
 assert.equal(check({principal:{...principal,authenticationVerified:false}}).state,"denied");
 assert.equal(check({principal:{...principal,isAnonymous:true}}).state,"denied");
});
test("cross tenant and revoked account denied",()=>{
 assert.equal(check({membership:{...membership,userId:"U2"}}).state,"denied");
 assert.equal(check({membership:{...membership,state:"revoked"}}).state,"denied");
 assert.equal(check({organisation:{...organisation,isSuspended:true}}).state,"denied");
 assert.equal(check({principal:{...principal,isRevoked:true}}).state,"denied");
});
test("privilege escalation, under-review organisation and unknown action denied",()=>{
 assert.equal(check({membership:{...membership,role:"viewer"}}).state,"denied");
 assert.equal(check({organisation:{...organisation,verificationState:"under_review"}}).state,"denied");
 assert.equal(check({action:"delete_everything"}).state,"denied");
});
test("resource-specific restrictions apply even if membership is active",()=>{
 const resource={id:"DOS1",tenantId:"ORG1",accessMode:"creator_only",ownerUserId:"U1"};
 assert.equal(check({action:"view_dossier",resource}).state,"authorised_candidate");
 assert.equal(check({action:"view_dossier",resource:{...resource,tenantId:"ORG2"}}).state,"denied");
 assert.equal(check({action:"view_dossier",resource:{...resource,ownerUserId:"U2"}}).state,"denied");
});
test("buyer and seller cannot approve disclosures without owner role",()=>{
 assert.equal(check({membership:{...membership,role:"buyer"},action:"approve_recipient_disclosure"}).state,"denied");
 assert.equal(check({membership:{...membership,role:"seller"},action:"request_exchange_listing"}).state,"authorised_candidate");
});
