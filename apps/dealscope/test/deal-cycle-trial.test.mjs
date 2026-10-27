import test from "node:test";
import assert from "node:assert/strict";
import {REQUIRED_STAGES,prepareCycleTrial,proposeSecondCycle,reserveDealCycle,recordCycleStage,deliverCycle,restoreFailedCycle,readCycleTrial} from "../lib/deal-cycle-trial.mjs";
const H="a".repeat(64),RPT="b".repeat(64),T="2026-10-28T00:00:00Z";
const person={id:"p1"},organisation={id:"o1"};
const eligibility={personId:"p1",organisationId:"o1",verifiedPerson:true,verifiedOrganisation:true,
 authorisedRepresentative:true,independentReviewApproved:true,reviewEventId:"rev",policyVersion:"v2"};
const offer={serviceCode:"COMPLETE_DEAL_ASSESSMENT",version:"v2",state:"published",includedCycles:1,
 priceMinor:0,autoConverts:false,paymentMethodRequired:false};
const history={verifiedLedgerRead:true,previousClaims:[]};
const prepare=()=>prepareCycleTrial({person,organisation,eligibility,history,offer,serverTime:T});
const active=()=>({...prepare().record,status:"active"});
const principal={authenticated:true,membershipActive:true,userId:"p1",tenantId:"o1"};
const caseFile={id:"d1",tenantId:"o1",ownerId:"p1",sourceSetHash:H};
const reserve=r=>reserveDealCycle({record:r,principal,caseFile,serverTime:T});
test("one full non-time-bound deal, no autocharge and no two default credits",()=>{
 const x=prepare();assert.equal(x.state,"grant_candidate");
 assert.equal(x.record.cyclesGranted,1);assert.equal(x.record.daysLimit,null);
 assert.equal(x.record.automaticCharge,false);assert.equal(x.record.autoConverts,false);
 assert.deepEqual(x.record.requiredStages,[...REQUIRED_STAGES]);
});
test("deny repeat claims, unverified person, and wrong published offer",()=>{
 assert.equal(prepareCycleTrial({person,organisation,eligibility,history:{...history,previousClaims:[{personId:"p1"}]},offer,serverTime:T}).state,"blocked");
 assert.equal(prepareCycleTrial({person,organisation,eligibility,history:{...history,previousClaims:[{organisationId:"o1"}]},offer,serverTime:T}).state,"blocked");
 assert.equal(prepareCycleTrial({person,organisation,eligibility:{...eligibility,verifiedPerson:false},history,offer,serverTime:T}).state,"blocked");
 assert.equal(prepareCycleTrial({person,organisation,eligibility,history,offer:{...offer,includedCycles:2},serverTime:T}).state,"blocked");
});
test("second cycle only through independent approved promotion",()=>{
 assert.equal(proposeSecondCycle({record:active(),approval:{},approver:principal,serverTime:T}).state,"blocked");
 const approver={authenticated:true,userId:"staff",roles:["trial_campaign_approver"]};
 const approval={id:"offer2",reason:"approved onboarding campaign",campaignVersion:"promo",
  validUntil:"2026-11-09T00:00:00Z",extraCycles:1,policyVersion:"v2",approvedBy:"staff"};
 const result=proposeSecondCycle({record:active(),approval,approver,serverTime:T});
 assert.equal(result.state,"extra_cycle_candidate");assert.equal(result.record.cyclesGranted,2);
 assert.equal(proposeSecondCycle({record:result.record,approval,approver,serverTime:T}).state,"blocked");
});
test("reserving a full case exhausts only credit; different case cannot begin",()=>{
 let r=reserve(active());assert.equal(r.state,"reserved_candidate");
 assert.equal(r.record.cyclesRemaining,0);assert.equal(r.record.cyclesReserved,1);
 assert.equal(reserve(r.record).state,"blocked");
 assert.equal(reserveDealCycle({record:r.record,principal,caseFile:{...caseFile,id:"d2"},serverTime:T}).state,"blocked");
});
test("stage audit and actual final report mandatory; no consumption for unfinished cases",()=>{
 let r=reserve(active()).record;
 const delivery={backendConfirmed:true,reportId:"report",eventId:"delivery",reportHash:RPT,caseId:"d1"};
 assert.equal(deliverCycle({record:r,principal,caseId:"d1",delivery,serverTime:T}).state,"blocked");
 for(const stage of REQUIRED_STAGES.slice(0,-1)){
  const p=recordCycleStage({record:r,principal,caseId:"d1",stage,
   evidence:{trustedBackendVerified:true,eventId:"event-"+stage,evidenceHash:H},serverTime:T});
  assert.equal(p.state,"stage_candidate");r=p.record;
 }
 const done=deliverCycle({record:r,principal,caseId:"d1",delivery,serverTime:T});
 assert.equal(done.state,"delivered_candidate");
 assert.equal(done.record.cyclesCompleted,1);
 assert.equal(readCycleTrial({record:done.record,principal}).state,"free_cycle_completed");
 assert.equal(deliverCycle({record:done.record,principal,caseId:"d1",delivery,serverTime:T}).state,"blocked");
});
test("wrong tenant, bogus verified stages, missing report and fraudulent re-use blocked",()=>{
 const r=reserve(active()).record;
 assert.equal(reserveDealCycle({record:active(),principal:{...principal,tenantId:"x"},caseFile,serverTime:T}).state,"blocked");
 assert.equal(recordCycleStage({record:r,principal,caseId:"d1",stage:REQUIRED_STAGES[0],
   evidence:{trustedBackendVerified:false,eventId:"evt",evidenceHash:H},serverTime:T}).state,"blocked");
 assert.equal(readCycleTrial({record:r,principal:{...principal,userId:"attacker"}}).state,"denied");
});
test("failed undelivered service is restored exactly once",()=>{
 const r=reserve(active()).record;
 const v=restoreFailedCycle({record:r,principal,caseId:"d1",reason:"Unable to deliver agreed service"});
 assert.equal(v.state,"restore_candidate");assert.equal(v.record.cyclesRemaining,1);
 assert.equal(restoreFailedCycle({record:v.record,principal,caseId:"d1",reason:"again"}).state,"blocked");
});
