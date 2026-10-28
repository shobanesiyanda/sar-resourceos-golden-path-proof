/**
 * DealScope customer-owned one-case assessment dossier — pure, nonpersistent.
 * It does not verify real stock, assay, ownership or an issuer. Every external
 * evidence attestation must originate from an independently trusted provider
 * adapter and approved staff review; NEVER from browser-provided "verified" flags.
 */
export const CLAIM_KINDS=["seller_identity","buyer_identity","selling_mandate",
 "material_title","stock_location","assay","payment_authority","other"];
const valid=s=>typeof s==="string"&&s.trim().length>0&&s.length<=500;
const digest=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const time=s=>typeof s==="string"&&Number.isFinite(Date.parse(s));
const stop=(reason)=>({state:"blocked",reason,record:null});
const clone=v=>JSON.parse(JSON.stringify(v));
function access(grant,tenantId,action){
 return grant?.serverVerified===true&&grant.tenantId===tenantId&&valid(grant.userId)&&
 grant.action===action;
}
export function prepareDossier({grant,caseId,tenantId,customerOwnerId,
 opportunityType,sourceSetHash,claims,serverTime}){
 if(!access(grant,tenantId,"create_dossier")||!valid(caseId)||
 !valid(customerOwnerId)||customerOwnerId!==grant.userId||
 !["commodity_parcel","mining_contract","procurement_supply","other"].includes(opportunityType)||
 !digest(sourceSetHash)||!time(serverTime)||
 !Array.isArray(claims)||claims.length<1||claims.length>100)
 return stop("Authorised tenant, named source set and bounded customer-supplied claims required");
 const ids=new Set();
 for(const c of claims){
  if(!c||!valid(c.id)||ids.has(c.id)||!CLAIM_KINDS.includes(c.kind)||
   !valid(c.assertion)||!digest(c.sourceHash)||
   c.evidenceState!=="user_asserted")return stop("No duplicate, unowned or automatically verified claims");
  ids.add(c.id);
 }
 const record={id:caseId,tenantId,customerOwnerId,opportunityType,sourceSetHash,
   state:"intake_candidate",createdAt:serverTime,version:1,
   claims:claims.map(x=>({id:x.id,kind:x.kind,assertion:x.assertion,
     sourceHash:x.sourceHash,evidenceState:"user_asserted",reviews:[]})),
   scenarios:[],actions:[],report:null,usedReviewEvents:[]};
 return {state:"dossier_candidate",reason:"Backend must enforce verified ownership, safe storage and unique case ID",record};
}
export function appendEvidenceReview({record,grant,reviewer,review,serverTime}){
 if(!record||!access(grant,record.tenantId,"request_assessment")||
 !reviewer||reviewer.independentAttestationTrusted!==true||
 !valid(reviewer.userId)||reviewer.userId===record.customerOwnerId||
 !valid(reviewer.reviewAuthorityEventId)||!review||
 !valid(review.eventId)||!valid(review.claimId)||!valid(review.sourceReference)||
 !digest(review.evidenceHash)||!time(serverTime)||
 !["unverified","corroborated","contradicted"].includes(review.finding)||
 (review.finding==="corroborated"&&(!valid(review.issuerReference)||
 !["issuer_confirmation","laboratory_confirmation","physical_inspection","verified_registry"].includes(review.method)))||
 (review.finding==="contradicted"&&!valid(review.explanation))||
 !["intake_candidate","investigation"].includes(record.state)||
 record.usedReviewEvents?.includes(review.eventId))
 return stop("Independent attested evidence review and unique claim event required");
 const i=record.claims?.findIndex(c=>c.id===review.claimId);
 if(i===undefined||i<0||record.claims[i].evidenceState!=="user_asserted")
 return stop("Only once per still-unreviewed customer claim; corrections need a new version");
 const next=clone(record);
 next.claims[i].evidenceState=review.finding;
 next.claims[i].reviews.push({eventId:review.eventId,reviewerId:reviewer.userId,
  reviewerAuthorityEventId:reviewer.reviewAuthorityEventId,evidenceHash:review.evidenceHash,
  sourceReference:review.sourceReference,issuerReference:review.issuerReference??null,
  method:review.method??"no_independent_check",finding:review.finding,
  explanation:review.explanation??null,reviewedAt:serverTime});
 next.usedReviewEvents.push(review.eventId);next.state="investigation";next.version++;
 return {state:"review_candidate",reason:"No issuer/stock validity claim before independent underlying verification",record:next};
}
export function appendScenario({record,grant,scenario,serverTime}){
 if(!record||!access(grant,record.tenantId,"request_assessment")||
 !["intake_candidate","investigation","scenario_review"].includes(record.state)||
 !scenario||!valid(scenario.id)||!digest(scenario.engineOutputHash)||
 !valid(scenario.engineVersion)||scenario.trustedBackendCalculation!==true||
 !Number.isSafeInteger(scenario.netProfitMinor)||!valid(scenario.currency)||
 scenario.currency!=="ZAR"||
 !Array.isArray(scenario.assumptions)||scenario.assumptions.length<1||
 scenario.assumptions.some(a=>!valid(a.name)||!valid(a.sourceState)||
 !["customer_claim","market_indicative","independently_corroborated"].includes(a.sourceState))||
 !time(serverTime)||record.scenarios?.some(s=>s.id===scenario.id))
 return stop("Unique source-stated economics scenario and trusted calculator result required");
 const next=clone(record);
 next.scenarios.push({id:scenario.id,engineOutputHash:scenario.engineOutputHash,
  engineVersion:scenario.engineVersion,netProfitMinor:scenario.netProfitMinor,currency:"ZAR",
  assumptions:scenario.assumptions.map(a=>({name:a.name,sourceState:a.sourceState})),
  isGuaranteed:false,calculatedAt:serverTime});
 next.version++;next.state="scenario_review";
 return {state:"scenario_candidate",reason:"Calculated profit is not evidence of buyer or stock verification",record:next};
}
export function proposeAssessmentReport({record,grant,actionPlan,reportSnapshotHash,serverTime}){
 if(!record||!access(grant,record.tenantId,"request_assessment")||
 !["scenario_review","investigation"].includes(record.state)||
 !Array.isArray(record.claims)||record.claims.length<1||
 !Array.isArray(record.scenarios)||record.scenarios.length<1||
 !Array.isArray(actionPlan)||actionPlan.length<1||
 actionPlan.some(a=>!valid(a.id)||!valid(a.description)||!valid(a.ownerRole)||
 !["open","ready"].includes(a.status))||
 !digest(reportSnapshotHash)||!time(serverTime)||record.report)
 return stop("Customer review, viable report structure, scenarios and action plan required");
 const verified=record.claims.filter(c=>c.evidenceState==="corroborated").length;
 const contradicted=record.claims.filter(c=>c.evidenceState==="contradicted").length;
 const unresolved=record.claims.length-verified-contradicted;
 const negative=record.scenarios.every(s=>s.netProfitMinor<=0);
 const next=clone(record);
 next.actions=actionPlan.map(a=>({...a}));
 next.report={status:"draft_candidate",reportSnapshotHash,scenarioCount:next.scenarios.length,
  evidenceSummary:{corroborated:verified,contradicted,unresolved},
  everyScenarioNonPositive:negative,transactionCertified:false,
  externalVerificationCertified:false,issuedAt:null};
 next.state="report_ready_candidate";next.version++;
 return {state:"report_candidate",reason:"Actual final delivery only via independent report issuance proof and cycle ledger",record:next};
}
