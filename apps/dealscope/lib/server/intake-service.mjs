import {readBoundedForm,BodyIntakeError} from "./bounded-body.mjs";
import {verifyMaterialRoute} from "../specialist-registry.mjs";
import {normaliseManualDealIntake} from "./manual-intake-normalizer.mjs";
import {reconcileDealFacts} from "./deal-facts.mjs";
const blocked=(status,code)=>({status,body:{status:code},cacheControl:"no-store"});
const required=["authenticate","persistAndExtractIntake"];
const validString=v=>typeof v==="string"&&v.trim().length>0&&v.length<=300;
const validCase=s=>typeof s==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(s);
/**
 * Server-side intake contract. All extracted facts remain customer claims.
 * Adapter MUST scan, hash, quarantine as necessary, encrypt and persist
 * uploaded documents before considering case creation committed.
 */
export async function executeIntakeRequest({request,services}){
 if(!services||!required.every(k=>typeof services[k]==="function"))return blocked(503,"not_activated");
 let auth;try{auth=await services.authenticate(request);}catch{return blocked(401,"authentication_required");}
 if(!auth?.verified||!auth?.activeMembership||!auth?.tenantId||!auth?.userId||
  auth.entitledToAssessment!==true||auth.currentLegalAcceptance!==true)
  return blocked(403,"assessment_access_not_granted");
 let form;try{form=await readBoundedForm(request,15728640);}
 catch(error){return blocked(error instanceof BodyIntakeError?error.status:400,error instanceof BodyIntakeError?error.code:"invalid_intake");}
 const commodity=form.get("commodity"), entryPoint=form.get("entryPoint");
 const materialForm=form.get("materialForm"), commercialRole=form.get("commercialRole");
 const deliveryTerm=form.get("deliveryTerm");
 const fulfilmentRoute=form.get("fulfilmentRoute")||"undecided";
 if(!["sale_contract","source_offer"].includes(entryPoint)||
  !validString(materialForm)||!validString(commercialRole)||!validString(deliveryTerm)||
  !["undecided","direct_trade","process_feedstock","own_stock"].includes(fulfilmentRoute))
  return blocked(422,"deal_context_incomplete");
 const capability=verifyMaterialRoute({commodity,materialForm,route:fulfilmentRoute,entryPoint});
 if(!capability.valid)return blocked(422,capability.reason);
 const documents=form.getAll("documents");
 if(documents.length>5)return blocked(413,"too_many_documents");
 const validExt=/\.(pdf|docx|txt|png|jpg|jpeg)$/i;
 for(const file of documents){
  if(!file||typeof file.name!=="string"||!validExt.test(file.name)||
   typeof file.size!=="number"||file.size<1||file.size>10485760)
   return blocked(415,"unsupported_document");
 }
 const pasted=form.get("pastedText"),quantity=form.get("quantity"),grade=form.get("productGrade");
 if(typeof pasted==="string"&&pasted.length>15000)return blocked(413,"pasted_information_too_large");
 const manualPresent=[form.get("deliveryLocation"),quantity,grade,form.get("buyerPrice"),form.get("sourcePrice")].some(v=>validString(v));
 if(documents.length===0&&!(typeof pasted==="string"&&pasted.trim())&&!manualPresent)
  return blocked(422,"no_information_supplied");
 const normalised=normaliseManualDealIntake({entryPoint,
  context:{commodity,materialForm:capability.canonicalMaterialForm,commercialRole,deliveryTerm,fulfilmentRoute},
  manual:{deliveryLocation:form.get("deliveryLocation"),quantity,grade,
   buyerPrice:form.get("buyerPrice"),sourcePrice:form.get("sourcePrice")}});
 if(normalised.state!=="customer_claims_prepared")return blocked(422,"invalid_manual_facts");
 let persisted;
 try{
  persisted=await services.persistAndExtractIntake({
   tenantId:auth.tenantId,userId:auth.userId,
   context:{commodity,entryPoint,materialForm:capability.canonicalMaterialForm,
    commercialRole,deliveryTerm,fulfilmentRoute,
    registryVersion:capability.registryVersion,materialStage:capability.materialStage,
    assessmentCapability:capability.capability},
   sources:{documents,pastedText:typeof pasted==="string"?pasted:"",manual:{
    deliveryLocation:form.get("deliveryLocation"),quantity,grade,
    buyerPrice:form.get("buyerPrice"),sourcePrice:form.get("sourcePrice")},
    structuredCustomerFacts:normalised.sourceFacts}
  });
 }catch{return blocked(503,"secure_intake_unavailable");}
 if(!persisted?.committed||persisted.registryVersion!==capability.registryVersion||
   persisted.tenantId!==auth.tenantId||
   persisted.ownerUserId!==auth.userId||!validCase(persisted.caseId)||
   !Number.isSafeInteger(persisted.sourceRevision)||persisted.sourceRevision<1||
   !Array.isArray(persisted.sources))return blocked(503,"intake_not_committed");
 const facts=reconcileDealFacts({entryPoint,sources:persisted.sources});
 if(facts.state==="blocked")return blocked(422,"invalid_extracted_facts");
 return {status:200,cacheControl:"no-store",body:{
  caseId:persisted.caseId,sourceRevision:persisted.sourceRevision,
  registryVersion:persisted.registryVersion,
  knownFacts:facts.known,missingFacts:facts.missing,conflicts:facts.conflicts,
  customerFactsConfirmed:false,independentlyVerified:false
 }};
}
