/**
 * DealScope full assisted deal-cycle trial — one complete case per eligible
 * individual/entity; optional second only with separate independent approval.
 * Pure contract; all actors, server dates, event proofs, exact document hashes,
 * tenant membership and atomic ledger must be verified by trusted backend.
 */
export const REQUIRED_STAGES=Object.freeze([
 "intake_and_dossier","integrity_investigation","scenario_viability",
 "readiness_and_action_plan","complete_assessment_report"
]);
const valid=x=>typeof x==="string"&&x.trim().length>0&&x.length<=160;
const hash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/i.test(x);
const at=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}T/.test(x)&&!Number.isNaN(Date.parse(x));
const fail=reason=>({state:"blocked",reason,record:null});
const owner=(r,p)=>p?.authenticated===true&&p.membershipActive===true&&p.userId===r.personId&&p.tenantId===r.tenantId;
export function prepareCycleTrial({person,organisation,eligibility,history,offer,serverTime}){
 if(!person||!organisation||!eligibility||!history||!offer||!at(serverTime)||
  !valid(person.id)||!valid(organisation.id)||!valid(eligibility.reviewEventId)||
  !valid(eligibility.policyVersion)||eligibility.personId!==person.id||
  eligibility.organisationId!==organisation.id||eligibility.verifiedPerson!==true||
  eligibility.verifiedOrganisation!==true||eligibility.authorisedRepresentative!==true||
  eligibility.independentReviewApproved!==true||
  history.verifiedLedgerRead!==true||!Array.isArray(history.previousClaims)||
  offer.state!=="published"||offer.serviceCode!=="COMPLETE_DEAL_ASSESSMENT"||
  !valid(offer.version)||offer.includedCycles!==1||offer.priceMinor!==0||
  offer.autoConverts!==false||offer.paymentMethodRequired!==false)
  return fail("Published one-cycle offer, identity proof, eligibility and verified trial history required");
 if(history.previousClaims.some(x=>x?.personId===person.id||x?.organisationId===organisation.id))
  return fail("Introductory full-cycle offer previously claimed by person or organisation");
 return {state:"grant_candidate",reason:"Only atomic server-side transaction may grant",
  record:{personId:person.id,tenantId:organisation.id,policyVersion:eligibility.policyVersion,
   reviewEventId:eligibility.reviewEventId,offerVersion:offer.version,
   status:"candidate",cyclesGranted:1,cyclesRemaining:1,cyclesReserved:0,cyclesCompleted:0,
   cases:[],requiredStages:[...REQUIRED_STAGES],grantedAt:serverTime,
   autoConverts:false,automaticCharge:false,daysLimit:null}};
}
export function proposeSecondCycle({record,approval,approver,serverTime}){
 if(!record||!approval||!approver||!at(serverTime)||record.status!=="active"||
 record.cyclesGranted!==1||!valid(approval.id)||!valid(approval.reason)||
 !valid(approval.campaignVersion)||!valid(approval.validUntil)||
 !at(approval.validUntil)||Date.parse(serverTime)>=Date.parse(approval.validUntil)||
 approval.extraCycles!==1||approval.policyVersion!==record.policyVersion||
 approver.authenticated!==true||!Array.isArray(approver.roles)||
 !approver.roles.includes("trial_campaign_approver")||approver.userId===record.personId||
 approval.approvedBy!==approver.userId)
 return fail("Second cycle requires independent non-expired campaign approval");
 return {state:"extra_cycle_candidate",reason:"Check campaign signature, uniqueness and atomic ledger before grant",
  record:{...record,cyclesGranted:2,cyclesRemaining:record.cyclesRemaining+1,
   campaignApprovalId:approval.id,campaignVersion:approval.campaignVersion}};
}
export function reserveDealCycle({record,principal,caseFile,serverTime}){
 if(!record||!caseFile||!at(serverTime)||!owner(record,principal)||
 record.status!=="active"||!Number.isSafeInteger(record.cyclesRemaining)||
 record.cyclesRemaining<1||!valid(caseFile.id)||!hash(caseFile.sourceSetHash)||
 caseFile.tenantId!==record.tenantId||caseFile.ownerId!==record.personId||
 !Array.isArray(record.cases)||record.cases.some(c=>c.id===caseFile.id))
 return fail("One independent opportunity, current tenant and available cycle required");
 return {state:"reserved_candidate",reason:"Server must atomically reserve one complete dossier, not one calculation",
  record:{...record,cyclesRemaining:record.cyclesRemaining-1,
   cyclesReserved:record.cyclesReserved+1,
   cases:[...record.cases,{id:caseFile.id,originalSourceHash:caseFile.sourceSetHash,
    stagesDone:[],stageEventIds:[],state:"in_progress",reservedAt:serverTime}]}};
}
export function recordCycleStage({record,principal,caseId,stage,evidence,serverTime}){
 if(!record||!owner(record,principal)||record.status!=="active"||!at(serverTime)||
 !Array.isArray(record.cases)||!valid(caseId)||!REQUIRED_STAGES.includes(stage)||
 !evidence||evidence.trustedBackendVerified!==true||!valid(evidence.eventId)||
 !hash(evidence.evidenceHash))
 return fail("Authenticated, evidence-attested assessment stage required");
 if(record.cases.some(c=>c.stageEventIds?.includes(evidence.eventId)||
  c.deliveryEventId===evidence.eventId||c.failureEventId===evidence.eventId))
 return fail("An event cannot attest multiple assessment steps");
 const pos=record.cases.findIndex(c=>c.id===caseId),old=record.cases[pos];
 if(!old||old.state!=="in_progress"||!Array.isArray(old.stagesDone)||
 stage!==REQUIRED_STAGES[old.stagesDone.length]||
 stage===REQUIRED_STAGES[REQUIRED_STAGES.length-1])
 return fail("Ordered stages only, final issuance needs actual delivery proof");
 const next={...old,stagesDone:[...old.stagesDone,stage],
  stageEventIds:[...(old.stageEventIds??[]),evidence.eventId],
  lastAttestationEventId:evidence.eventId,lastEvidenceHash:evidence.evidenceHash};
 return {state:"stage_candidate",reason:"Only authenticated transaction may append event",
  record:{...record,cases:record.cases.map((c,i)=>i===pos?next:c)}};
}
export function deliverCycle({record,principal,caseId,delivery,serverTime}){
 if(!record||!owner(record,principal)||record.status!=="active"||!at(serverTime)||
 !Array.isArray(record.cases)||!valid(caseId)||!delivery||
 delivery.backendConfirmed!==true||!valid(delivery.reportId)||
 !valid(delivery.eventId)||!hash(delivery.reportHash)||delivery.caseId!==caseId)
 return fail("Exact issued report and verified delivery event required");
 const pos=record.cases.findIndex(c=>c.id===caseId),old=record.cases[pos];
 if(!old||old.state!=="in_progress"||
 JSON.stringify(old.stagesDone)!==JSON.stringify(REQUIRED_STAGES.slice(0,-1))||
 record.cyclesReserved<1)
 return fail("A full assessment cannot be consumed before its stages and final report");
 if(record.cases.some(c=>c.stageEventIds?.includes(delivery.eventId)||
  c.deliveryEventId===delivery.eventId||c.failureEventId===delivery.eventId))
 return fail("Report delivery event must not be replayed");
 const next={...old,state:"delivered",reportId:delivery.reportId,reportHash:delivery.reportHash,
  deliveryEventId:delivery.eventId,deliveredAt:serverTime,
  stagesDone:[...old.stagesDone,REQUIRED_STAGES[REQUIRED_STAGES.length-1]]};
 return {state:"delivered_candidate",reason:"No success fee or billing event; issuance is one complete free service",
  record:{...record,cyclesReserved:record.cyclesReserved-1,
   cyclesCompleted:record.cyclesCompleted+1,
   cases:record.cases.map((c,i)=>i===pos?next:c)}};
}
export function restoreFailedCycle({record,principal,caseId,reason,failureEvidence}){
 if(!record||!owner(record,principal)||record.status!=="active"||
 !valid(caseId)||!valid(reason)||!Array.isArray(record.cases)||
 !failureEvidence||failureEvidence.trustedBackendVerified!==true||
 failureEvidence.verifiedFailure!==true||failureEvidence.caseId!==caseId||
 !valid(failureEvidence.eventId)||!hash(failureEvidence.evidenceHash))
 return fail("Independently attested service failure and same tenant required");
 if(record.cases.some(c=>c.stageEventIds?.includes(failureEvidence.eventId)||
  c.deliveryEventId===failureEvidence.eventId||c.failureEventId===failureEvidence.eventId))
 return fail("Failure event must not be replayed");
 const pos=record.cases.findIndex(c=>c.id===caseId),old=record.cases[pos];
 if(!old||old.state!=="in_progress"||record.cyclesReserved<1)
 return fail("Only an incomplete reserved case can restore one free cycle");
 return {state:"restore_candidate",reason:"Server must authenticate failure and apply one idempotent compensating entry",
  record:{...record,cyclesRemaining:record.cyclesRemaining+1,
   cyclesReserved:record.cyclesReserved-1,
   cases:record.cases.map((c,i)=>i===pos?{...c,state:"failed_recredited",
    failureReason:reason,failureEventId:failureEvidence.eventId,
    failureEvidenceHash:failureEvidence.evidenceHash}:c)}};
}
export function readCycleTrial({record,principal}){
 if(!record||!owner(record,principal)||record.status!=="active")
 return {state:"denied",remaining:0};
 return {state:record.cyclesRemaining>0?"free_cycle_available":
  record.cyclesReserved>0?"free_cycle_in_progress":"free_cycle_completed",
  remaining:record.cyclesRemaining,completed:record.cyclesCompleted,automaticCharge:false};
}
