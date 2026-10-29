import test from "node:test";
import assert from "node:assert/strict";
import {prepareDossier,appendEvidenceReview,appendScenario,proposeAssessmentReport} from "../lib/assessment-dossier.mjs";
const H="a".repeat(64),H2="b".repeat(64),T="2026-10-28T12:00:00Z";
const creator={serverVerified:true,tenantId:"ORG1",userId:"U1",action:"create_dossier"};
const assessor={...creator,action:"request_assessment"};
const reviewer={userId:"REVIEWER",independentAttestationTrusted:true,reviewAuthorityEventId:"REV1"};
const claim={id:"CLAIM1",kind:"material_title",assertion:"Customer reports ownership of parcel",sourceHash:H,evidenceState:"user_asserted"};
const create=()=>prepareDossier({grant:creator,caseId:"DOS1",tenantId:"ORG1",customerOwnerId:"U1",
 opportunityType:"commodity_parcel",sourceSetHash:H,claims:[claim],serverTime:T}).record;
const review={claimId:"CLAIM1",eventId:"EV1",sourceReference:"issuer-check-digest",evidenceHash:H2,
 finding:"unverified"};
const scenario={id:"S1",engineOutputHash:H2,engineVersion:"v1",trustedBackendCalculation:true,
 netProfitMinor:-4000,currency:"ZAR",assumptions:[{name:"indicative freight",sourceState:"market_indicative"}]};
const analysed=r=>appendScenario({record:r,grant:assessor,scenario,serverTime:T}).record;
const final=r=>proposeAssessmentReport({record:r,grant:assessor,reportSnapshotHash:H2,serverTime:T,
 actionPlan:[{id:"A1",description:"Obtain and independently check title",ownerRole:"customer",status:"open"}]});
test("customer claims begin unverified, never issuer-authenticated",()=>{
 const x=create();assert.equal(x.claims[0].evidenceState,"user_asserted");
 assert.equal(x.state,"intake_candidate");
});
test("spoofed tenant and fake claim verification fail closed",()=>{
 assert.equal(prepareDossier({grant:{...creator,tenantId:"OTHER"},caseId:"DOS",tenantId:"ORG1",
 customerOwnerId:"U1",opportunityType:"commodity_parcel",sourceSetHash:H,claims:[claim],serverTime:T}).state,"blocked");
 assert.equal(prepareDossier({grant:creator,caseId:"DOS",tenantId:"ORG1",
 customerOwnerId:"U1",opportunityType:"commodity_parcel",sourceSetHash:H,
 claims:[{...claim,evidenceState:"corroborated"}],serverTime:T}).state,"blocked");
});
test("external evidence review requires independent attestation and case scope",()=>{
 const x=create();
 assert.equal(appendEvidenceReview({record:x,grant:assessor,reviewer:{...reviewer,userId:"U1"},review,serverTime:T}).state,"blocked");
 assert.equal(appendEvidenceReview({record:x,grant:{...assessor,tenantId:"OTHER"},reviewer,review,serverTime:T}).state,"blocked");
 const good=appendEvidenceReview({record:x,grant:assessor,reviewer,review,serverTime:T});
 assert.equal(good.state,"review_candidate");assert.equal(good.record.claims[0].evidenceState,"unverified");
 assert.equal(appendEvidenceReview({record:good.record,grant:assessor,reviewer,review,serverTime:T}).state,"blocked");
});
test("corroboration cannot be claimed without verified issuer method",()=>{
 const x=create();
 assert.equal(appendEvidenceReview({record:x,grant:assessor,reviewer,review:{...review,finding:"corroborated"},serverTime:T}).state,"blocked");
 assert.equal(appendEvidenceReview({record:x,grant:assessor,reviewer,review:{
  ...review,finding:"corroborated",issuerReference:"Issuer-confirm-1",method:"issuer_confirmation"},serverTime:T}).state,"review_candidate");
});
test("negative-profit scenario can be assessed without being advertised as profitable",()=>{
 const x=analysed(create());assert.equal(x.scenarios[0].netProfitMinor,-4000);
 const y=final(x);assert.equal(y.state,"report_candidate");
 assert.equal(y.record.report.everyScenarioNonPositive,true);
 assert.equal(y.record.report.transactionCertified,false);
 assert.equal(y.record.report.evidenceSummary.unresolved,1);
});
test("missing economic source and missing action plan block final report",()=>{
 assert.equal(appendScenario({record:create(),grant:assessor,scenario:{...scenario,
 trustedBackendCalculation:false},serverTime:T}).state,"blocked");
 assert.equal(final(create()).state,"blocked");
 assert.equal(proposeAssessmentReport({record:analysed(create()),grant:assessor,
 reportSnapshotHash:H2,actionPlan:[],serverTime:T}).state,"blocked");
});
