import {prepareAssessmentCandidate} from "./assessment-workflow.mjs";
const stopped=(status,code)=>({status,body:{status:code},cacheControl:"no-store"});
const caseIdValid=s=>typeof s==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(s);
/**
 * Trusted server invocation. Client submits only caseId, never identities,
 * purported verification, costs, market references, or source records.
 * Service adapter must provide tenant-scoped, persisted sources and references.
 */
export async function executeAssessmentRequest({request,services}){
 if(!services) return stopped(503,"not_activated");
 if(!["authenticate","readOwnedCase","loadInternalReferences","persistCandidate"].every(k=>typeof services[k]==="function"))
  return stopped(503,"not_activated");
 let auth;
 try{auth=await services.authenticate(request);}catch{return stopped(401,"authentication_required");}
 if(!auth?.verified||!auth?.activeMembership||!auth?.tenantId||!auth?.userId||
    auth.entitledToAssessment!==true||auth.currentLegalAcceptance!==true)
  return stopped(403,"assessment_access_not_granted");
 const length=Number(request.headers?.get?.("content-length")||0);
 if(!Number.isFinite(length)||length>8192)return stopped(413,"request_too_large");
 let data;
 try{data=await request.json();}catch{return stopped(400,"invalid_request");}
 if(!data||Object.keys(data).length!==1||!caseIdValid(data.caseId))
  return stopped(400,"case_reference_required");
 let owned;
 try{owned=await services.readOwnedCase({tenantId:auth.tenantId,userId:auth.userId,caseId:data.caseId});}
 catch{return stopped(503,"assessment_storage_unavailable");}
 if(!owned||owned.tenantId!==auth.tenantId||owned.ownerUserId!==auth.userId||
   owned.customerFactsConfirmed!==true||owned.sourcePersisted!==true||!owned.entryPoint||
   !Array.isArray(owned.sources))
   return stopped(404,"case_not_available");
 let referenceData;
 try{referenceData=await services.loadInternalReferences({ownedCase:owned,tenantId:auth.tenantId});}
 catch{return stopped(503,"reference_data_unavailable");}
 const candidate=prepareAssessmentCandidate({entryPoint:owned.entryPoint,sources:owned.sources,referenceData});
 if(candidate.state==="blocked")return stopped(422,"invalid_case_facts");
 let saved;
 try{saved=await services.persistCandidate({tenantId:auth.tenantId,userId:auth.userId,caseId:data.caseId,candidate,sourceRevision:owned.sourceRevision});}
 catch{return stopped(503,"assessment_storage_unavailable");}
 if(!saved?.committed||saved.tenantId!==auth.tenantId||saved.caseId!==data.caseId||
    !caseIdValid(saved.assessmentId))return stopped(503,"assessment_not_committed");
 return {status:200,cacheControl:"no-store",body:{
  assessmentId:saved.assessmentId,caseId:data.caseId,
  ...candidate,reportIssued:false,assessmentKind:"provisional",executionPermitted:false
 }};
}
