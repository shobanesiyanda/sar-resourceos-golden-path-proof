const stopped=(status,code)=>({status,body:{status:code},cacheControl:"no-store"});
const caseIdValid=s=>typeof s==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(s);
/** Independent saved confirmation; a local checkbox cannot grant case approval. */
export async function executeConfirmationRequest({request,services}){
 if(!services||!["authenticate","readOwnedCase","persistFactConfirmation"].every(k=>typeof services[k]==="function"))
  return stopped(503,"not_activated");
 let auth;try{auth=await services.authenticate(request);}catch{return stopped(401,"authentication_required");}
 if(!auth?.verified||!auth?.activeMembership||!auth?.tenantId||!auth?.userId||
  auth.entitledToAssessment!==true||auth.currentLegalAcceptance!==true)
  return stopped(403,"assessment_access_not_granted");
 const length=Number(request.headers?.get?.("content-length")||0);
 if(!Number.isFinite(length)||length>2048)return stopped(413,"request_too_large");
 let data;try{data=await request.json();}catch{return stopped(400,"invalid_request");}
 if(!data||Object.keys(data).sort().join(",")!=="caseId,confirm,sourceRevision"||
  !caseIdValid(data.caseId)||data.confirm!==true||
  !Number.isSafeInteger(data.sourceRevision)||data.sourceRevision<1)
  return stopped(400,"confirmation_reference_required");
 let owned;try{owned=await services.readOwnedCase({tenantId:auth.tenantId,userId:auth.userId,caseId:data.caseId});}
 catch{return stopped(503,"secure_case_storage_unavailable");}
 if(!owned||owned.tenantId!==auth.tenantId||owned.ownerUserId!==auth.userId)
  return stopped(404,"case_not_available");
 if(owned.sourceRevision!==data.sourceRevision)return stopped(409,"facts_revision_changed");
 if(!owned.sourcePersisted||!Array.isArray(owned.sources)||!owned.sources.length)
  return stopped(409,"intake_not_committed");
 if(owned.conflicts?.length)return stopped(409,"resolve_conflicting_sources");
 let saved;try{saved=await services.persistFactConfirmation({
  caseId:data.caseId,tenantId:auth.tenantId,userId:auth.userId,sourceRevision:data.sourceRevision
 });}catch{return stopped(503,"confirmation_storage_unavailable");}
 if(!saved?.committed||saved.tenantId!==auth.tenantId||
  saved.caseId!==data.caseId||saved.sourceRevision!==data.sourceRevision)
  return stopped(503,"confirmation_not_committed");
 return {status:200,cacheControl:"no-store",body:{
  status:"facts_customer_confirmed",caseId:data.caseId,sourceRevision:data.sourceRevision,
  independentlyVerified:false
 }};
}
