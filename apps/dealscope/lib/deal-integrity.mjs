/**
 * DealScope Deal Integrity OS — private, bounded due-diligence assessment.
 * NO criminal determination, blacklist, predictive crime score, live verification,
 * identity assurance, regulatory database access, binding clearance or public badge.
 * Trusted adapters must authenticate source facts and effective reviewer rights.
 */
export const INTEGRITY_CHECKS=Object.freeze([
 {id:"entity_registration",name:"Legal entity",source:"CIPC BizPortal/official disclosure",how:"Obtain registration number and current company disclosure through an authorised CIPC service. Confirm name, status and representatives independently."},
 {id:"representative_authority",name:"Representative authority",source:"Independent company confirmation",how:"Contact the company using independently sourced contact details and request a current signed authority/delegation naming this representative."},
 {id:"selling_mandate",name:"Parcel-specific selling mandate",source:"Stock owner/contract provenance",how:"Trace every mandate to the stock's proven lawful controller. Verify scope, exclusivity, dates, parcel and permitted resale directly with the issuer."},
 {id:"stock_rights",name:"Lawful title and disposal",source:"Ownership/stock acquisition and custody records",how:"Request records supporting the specific lot's lawful title, unencumbered disposition and authorised seller. A mining licence alone does not establish parcel title."},
 {id:"mining_source",name:"Mineral-right and lawful source",source:"DMPR mining right/permit records",how:"Where mined product is claimed, verify the specific operating right, holder, mineral, locality and licence period with the regulator; reconcile actual product provenance separately."},
 {id:"physical_stock",name:"Stock existence and location",source:"Independent site access, stockpile survey/weighbridge",how:"Arrange an authorised independent site inspection, reconcile volumes, location, photographs, movement and weighbridge evidence without exposing confidential location data."},
 {id:"lab_provenance",name:"Assay and sample integrity",source:"Issuing laboratory and custody records",how:"Use the laboratory's official independently obtained contact to validate the report number, sample identifier, analytical scope, dates and chain of custody. Check accreditation scope when claimed."},
 {id:"buyer_entity",name:"Buyer identity and authority",source:"Official company identity and buyer confirmation",how:"Confirm the prospective buyer's legal identity, authorised signatory and procurement channel using known official contacts—not an intermediary's forwarded PO alone."},
 {id:"buyer_commercial_commitment",name:"Buyer price, terms and capacity",source:"Dated buyer PO/confirmations",how:"Verify validity, grade tolerances, quality discounts, volume, payment triggers, delivery basis and finance/credit arrangements directly with the authorised buyer."},
 {id:"payment_instruction",name:"Payment instruction integrity",source:"Verified company banking channel",how:"Before money moves, re-confirm account ownership and changed instructions independently using a trusted callback and the bank's available account verification service."},
 {id:"commercial_chain",name:"Quantities, dates and document consistency",source:"Cross-document provenance and source hashes",how:"Reconcile company, parcel ID, assays, transport, quantities, dates, mandates and price references; document and resolve contradictions against primary sources."},
 {id:"counterparty_contact",name:"Authentic communication channel",source:"Known company contact and domain confirmation",how:"Independently establish the official domain/telephone and check for impersonation, spoofing, urgency and inconsistent signatories."}
]);
const P=Object.freeze(["entity_registration","representative_authority","selling_mandate",
"stock_rights","mining_source","physical_stock","lab_provenance","buyer_entity",
"buyer_commercial_commitment","payment_instruction","commercial_chain","counterparty_contact"]);
const txt=(x,n=600)=>typeof x==="string"&&x.trim().length>0&&x.length<=n;
const hash=(x)=>typeof x==="string"&&/^[0-9a-f]{64}$/i.test(x);
const day=(x)=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+"T00:00:00Z"))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const denied=(reason)=>({state:"blocked",reason,report:null});
const documented=(x)=>x&&txt(x.sourceRef)&&hash(x.sourceHash)&&
 txt(x.sourceLocator)&&day(x.observedOn);
const authenticated=(p,d)=>p?.authenticated===true&&p?.activeMembership===true&&
 p?.tenantId===d.tenantId&&txt(p.userId)&&Array.isArray(p.permissions)&&
 p.permissions.includes("deal_integrity_assess");
export function assessDealIntegrity({dossier,principal,checks=[],asOf,verification}){
 if(!dossier||!authenticated(principal,dossier)||!txt(dossier.id)||!txt(dossier.tenantId)||
 !day(asOf)||!Array.isArray(checks)||checks.length>100)
 return denied("Current tenant membership, bounded evidence and date required");
 const known=new Map(INTEGRITY_CHECKS.map(x=>[x.id,x])),received=new Map();
 for(const c of checks){
  if(!c||!known.has(c.id)||received.has(c.id)||
   !["not_provided","self_asserted","uploaded","independently_corrobated","contradicted"].includes(c.status))
   return denied("Invalid, duplicated or unknown integrity check");
  if(c.status!=="not_provided"&&!documented(c))
   return denied("Evidence claim lacks traceable document/version");
  if(c.status==="independently_corrobated" &&
     (!verification||verification.serverEvidenceBound!==true||
      !Array.isArray(verification.reviewedEvidenceIds)||!verification.reviewedEvidenceIds.includes(c.id)||
      !txt(c.independentVerifierId)||!day(c.verifiedOn)||c.verifiedOn>asOf||
      !txt(c.verificationMethod)||c.observedOn>asOf))
   return denied("Independent corroboration cannot be asserted by untrusted browser inputs");
  if(c.status!=="not_provided"&&c.observedOn>asOf)
   return denied("Future evidence date");
  received.set(c.id,c);
 }
 const findings=[],actions=[],summary={confirmed:0,claimsOnly:0,missing:0,conflicts:0,stale:0};
 for(const id of P){
  const rule=known.get(id),c=received.get(id);
  let state="missing";
  if(c){
   if(c.status==="contradicted")state="material_inconsistency";
   else if(c.status==="independently_corrobated")state="corroborated";
   else if(c.status!=="not_provided")state="unverified_claim";
   if(c.expiresOn!==undefined&&c.expiresOn!==null){
    if(!day(c.expiresOn))return denied("Invalid claim expiry");
    if(c.expiresOn<asOf&&state!=="material_inconsistency")state="stale";
   }
  }
  if(state==="material_inconsistency")summary.conflicts++;
  else if(state==="corroborated")summary.confirmed++;
  else if(state==="missing")summary.missing++;
  else if(state==="stale")summary.stale++;
  else summary.claimsOnly++;
  findings.push({id,title:rule.name,state,sourceRef:c?.sourceRef??null,
   sourceLocator:c?.sourceLocator??null,sourceDate:c?.observedOn??null});
  if(state!=="corroborated")actions.push({id,priority:state==="material_inconsistency"?"stop_and_resolve":
    state==="stale"?"renew_evidence":"investigate",reason:state,how:rule.how,reference:rule.source});
 }
 const hasConflict=summary.conflicts>0;
 const hasGap=summary.missing+summary.claimsOnly+summary.stale>0;
 const stage=hasConflict?"stop_and_resolve":hasGap?"investigate_further":"checks_corrobated_with_residual_risk";
 return {state:"private_guidance_only",reason:null,report:{
  tenantId:dossier.tenantId,dossierId:dossier.id,asOf,stage,
  title:"Deal integrity evidence assessment (not a fraud finding)",
  summary,findings,actions,
  commercialViabilityUnassessed:true,
  licenceToTrade:false,criminalityDetermination:false,verifiedLegitimacy:false,
  publicBadgeAuthorised:false,permissionToPay:false,buyerDisclosureAuthorised:false,
  note:"Corroborated checks reduce uncertainty but never prove the entire transaction lawful, safe, profitable or non-fraudulent. Validate every relevant new issue independently.",
  appealAndCorrectionRequired:true}};
}
