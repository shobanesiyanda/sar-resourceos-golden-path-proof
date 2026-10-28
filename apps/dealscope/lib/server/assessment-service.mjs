import {readBoundedJson,BodyIntakeError} from "./bounded-body.mjs";
import {registryVersion} from "../specialist-registry.mjs";
import {prepareAssessmentCandidate} from "./assessment-workflow.mjs";
import {toCustomerDecisionBrief} from "./customer-brief.mjs";
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
 let data;try{data=await readBoundedJson(request,8192);}
 catch(error){return stopped(error instanceof BodyIntakeError?error.status:400,error instanceof BodyIntakeError?error.code:"invalid_request");}
 if(!data||Object.keys(data).length!==1||!caseIdValid(data.caseId))
  return stopped(400,"case_reference_required");
 let owned;
 try{owned=await services.readOwnedCase({tenantId:auth.tenantId,userId:auth.userId,caseId:data.caseId});}
 catch{return stopped(503,"assessment_storage_unavailable");}
 if(!owned||owned.tenantId!==auth.tenantId||owned.ownerUserId!==auth.userId||
   owned.customerFactsConfirmed!==true||owned.sourcePersisted!==true||
   !Number.isSafeInteger(owned.sourceRevision)||owned.sourceRevision<1||
   owned.confirmedSourceRevision!==owned.sourceRevision||!owned.entryPoint||
   !Array.isArray(owned.sources))
   return stopped(404,"case_not_available");
 if(owned.registryVersion!==registryVersion)return stopped(409,"case_specialist_registry_revision_required");
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
 let brief;
 try{brief=toCustomerDecisionBrief({assessmentId:saved.assessmentId,caseId:data.caseId,candidate});}
 catch{return stopped(503,"customer_projection_failed");}
 return {status:200,cacheControl:"no-store",body:brief};
}
