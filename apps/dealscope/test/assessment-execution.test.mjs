import test from "node:test";
import assert from "node:assert/strict";
import {prepareAssistedStart,prepareAssistedCompletion} from "../lib/assessment-execution.mjs";
import {prepareCycleTrial,REQUIRED_STAGES,recordCycleStage} from "../lib/deal-cycle-trial.mjs";
import {appendScenario,proposeAssessmentReport} from "../lib/assessment-dossier.mjs";
const H="a".repeat(64),T="2026-10-28T12:00:00Z";
const principal={source:"verified-auth-session",authenticationVerified:true,userId:"U1",sessionId:"S1",authenticationEventId:"AUTH1",isAnonymous:false};
const membership={source:"membership-ledger",serverReadVerified:true,tenantId:"ORG1",userId:"U1",state:"active",role:"owner"};
const organisation={id:"ORG1",verificationState:"verified"};
const contractAcceptance={source:"accepted-policy-ledger",persistedAndCurrent:true,tenantId:"ORG1",userId:"U1",
 legalSupplier:"Shobane African Resources (Pty) Ltd",serviceCode:"COMPLETE_DEAL_ASSESSMENT",
 automaticCharge:false,acceptanceEventId:"CONSENT1",policies:{terms:"v1",privacy:"v1",payments:"v1"}};
const record=prepareCycleTrial({person:{id:"U1"},organisation:{id:"ORG1"},
 eligibility:{personId:"U1",organisationId:"ORG1",verifiedPerson:true,verifiedOrganisation:true,
  authorisedRepresentative:true,independentReviewApproved:true,reviewEventId:"REV1",policyVersion:"v1"},
 history:{verifiedLedgerRead:true,previousClaims:[]},
 offer:{state:"published",serviceCode:"COMPLETE_DEAL_ASSESSMENT",version:"v1",
  includedCycles:1,priceMinor:0,autoConverts:false,paymentMethodRequired:false},
 serverTime:T}).record;
const entitlement={...record,status:"active"};
const caseInput={caseId:"CASE1",tenantId:"ORG1",customerOwnerId:"U1",
 opportunityType:"commodity_parcel",sourceSetHash:H,claims:[
  {id:"CL1",kind:"stock_location",assertion:"Seller says there is stock",sourceHash:H,evidenceState:"user_asserted"}]};
const base={principal,membership,organisation,contractAcceptance,entitlement,caseInput,serverTime:T,transactionId:"T1"};
test("first dossier and one complete cycle become one uncommitted atomic pair",()=>{
 const x=prepareAssistedStart(base);assert.equal(x.state,"start_candidate");
 assert.equal(x.mutations.trialEntitlement.cyclesReserved,1);
 assert.equal(x.mutations.trialEntitlement.cyclesRemaining,0);
 assert.equal(x.mutations.automaticCharge,false);assert.equal(x.mutations.committed,false);
});
test("legal acceptance must actually be persisted, not a mock check",()=>{
 assert.equal(prepareAssistedStart({...base,contractAcceptance:{...contractAcceptance,persistedAndCurrent:false}}).state,"blocked");
 assert.equal(prepareAssistedStart({...base,contractAcceptance:{...contractAcceptance,source:"browser_submit"}}).state,"blocked");
});
test("no second free dossier or cross-tenant reservation",()=>{
 const x=prepareAssistedStart(base).mutations.trialEntitlement;
 assert.equal(prepareAssistedStart({...base,entitlement:x,caseInput:{...caseInput,caseId:"CASE2"}}).state,"blocked");
 assert.equal(prepareAssistedStart({...base,caseInput:{...caseInput,tenantId:"ORG2"}}).state,"blocked");
});
test("no completion without source-attested stages and actual recipient report",()=>{
 const started=prepareAssistedStart(base).mutations;
 const grant={serverVerified:true,tenantId:"ORG1",userId:"U1",action:"request_assessment"};
 const scenario={id:"S1",engineOutputHash:H,engineVersion:"v1",
  trustedBackendCalculation:true,netProfitMinor:-100,currency:"ZAR",
  assumptions:[{name:"quoted cost",sourceState:"customer_claim"}]};
 const analysed=appendScenario({record:started.caseFile,grant,scenario,serverTime:T}).record;
 const report=proposeAssessmentReport({record:analysed,grant,reportSnapshotHash:H,serverTime:T,
  actionPlan:[{id:"A1",description:"Check available stock",ownerRole:"customer",status:"open"}]}).record;
 const delivery={backendConfirmed:true,caseId:"CASE1",reportId:"REPORT1",reportHash:H,
  eventId:"DEL1",issuerAuditEventId:"AUD1",protectedReportStored:true,actualRecipientConfirmed:true};
 const finish={grant,caseFile:report,entitlement:started.trialEntitlement,delivery,serverTime:T,transactionId:"T2"};
 assert.equal(prepareAssistedCompletion(finish).state,"blocked");
 let current=started.trialEntitlement;
 for(const stage of REQUIRED_STAGES.slice(0,-1)){
  const p={authenticated:true,membershipActive:true,userId:"U1",tenantId:"ORG1"};
  const e={trustedBackendVerified:true,eventId:"EV-"+stage,evidenceHash:H};
  const y=recordCycleStage({record:current,principal:p,caseId:"CASE1",stage,evidence:e,serverTime:T});
  assert.equal(y.state,"stage_candidate");current=y.record;
 }
 const good=prepareAssistedCompletion({...finish,entitlement:current});
 assert.equal(good.state,"completion_candidate");assert.equal(good.mutations.trialEntitlement.cyclesCompleted,1);
 assert.equal(good.mutations.caseFile.report.status,"issued_candidate");
 assert.equal(prepareAssistedCompletion({...finish,entitlement:current,
  delivery:{...delivery,reportHash:"b".repeat(64)}}).state,"blocked");
});
