import test from "node:test";
import assert from "node:assert/strict";
import {prepareFullTrial,readTrialState,DEALSCOPE_FULL_SUITE} from "../lib/full-trial.mjs";
const person={id:"PERSON1"},organisation={id:"ORG1"};
const eligibility={reviewEventId:"REV1",policyVersion:"V1",trustedIdentityValidated:true,
 verifiedOrganization:true,independentReviewApproved:true,organisationId:"ORG1",personId:"PERSON1"};
const history={checkedFromAuthoritativeLedger:true,trialClaims:[]};
const request=()=>prepareFullTrial({person,organisation,eligibility,history,requestedAt:"2026-10-27T20:00:00Z"});
test("30 complete days with all full-suite capabilities, without payment or automatic renewal",()=>{
 const x=request();assert.equal(x.state,"trial_grant_candidate");
 assert.equal(x.grant.days,30);assert.equal(x.grant.expiresAt,"2026-11-26T20:00:00.000Z");
 assert.equal(x.grant.requiresPaymentMethod,false);assert.equal(x.grant.chargeAtExpiry,false);
 assert.deepEqual(x.grant.capabilities,[...DEALSCOPE_FULL_SUITE]);
});
test("claims cannot be repeated by person or entity",()=>{
 assert.equal(prepareFullTrial({person,organisation,eligibility,
 history:{...history,trialClaims:[{personId:"PERSON1",organisationId:"OLD"}]},requestedAt:"2026-10-27T20:00:00Z"}).state,"blocked");
 assert.equal(prepareFullTrial({person,organisation,eligibility,
 history:{...history,trialClaims:[{personId:"OTHER",organisationId:"ORG1"}]},requestedAt:"2026-10-27T20:00:00Z"}).state,"blocked");
});
test("unverified identities and unverified ledger history cannot mint trials",()=>{
 assert.equal(prepareFullTrial({person,organisation,eligibility:{...eligibility,trustedIdentityValidated:false},history,requestedAt:"2026-10-27T20:00:00Z"}).state,"blocked");
 assert.equal(prepareFullTrial({person,organisation,eligibility,history:{...history,checkedFromAuthoritativeLedger:false},requestedAt:"2026-10-27T20:00:00Z"}).state,"blocked");
});
test("active trial is full; expiry is read-only with zero automatic charge",()=>{
 const grant={...request().grant,state:"active"};
 const actor={authenticated:true,activeMembership:true,personId:"PERSON1",organisationId:"ORG1"};
 const inside=readTrialState({grant,actor,at:"2026-11-24T08:00:00Z"});
 assert.equal(inside.state,"active_full_trial");
 assert.equal(inside.features.length,DEALSCOPE_FULL_SUITE.length);
 const ended=readTrialState({grant,actor,at:"2026-11-26T20:00:00Z"});
 assert.equal(ended.state,"expired");assert.equal(ended.readOnly,true);assert.equal(ended.chargeTriggered,false);
});
test("other tenant can't read trial; paid status requires explicit paid record",()=>{
 const grant={...request().grant,state:"active"};
 assert.equal(readTrialState({grant,actor:{authenticated:true,activeMembership:true,personId:"PERSON1",organisationId:"ORG2"},at:"2026-11-01T10:00:00Z"}).state,"denied");
 assert.equal(readTrialState({grant,actor:{authenticated:true,activeMembership:true,personId:"PERSON1",organisationId:"ORG1"},at:"2026-11-29T10:00:00Z",paidSubscriptionActive:true}).state,"paid");
});
