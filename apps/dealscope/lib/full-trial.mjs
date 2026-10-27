/**
 * DealScope 30-day full-feature trial eligibility contract.
 * PURE DOMAIN: not Auth, server clock attestation, tenant registry, entitlement
 * persistence, offer publication, live issuer verification or billing.
 * Commit grants only in a trusted serializable transaction with unique
 * natural-person and independently verified organisation trial identity keys.
 */
export const DEALSCOPE_FULL_SUITE=Object.freeze([
 "opportunity_discovery","market_intelligence","deal_integrity","evidence_cases",
 "deal_runs","scenario_history","opportunity_watch","seller_workspace",
 "buyer_workspace","commercial_exchange","reporting","document_management"
]);
const id=s=>typeof s==="string"&&s.length>0&&s.length<=200&&!!s.trim();
const instant=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(s)&&
 Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const block=(reason)=>({state:"blocked",reason,grant:null});
const DAYS=30;
export function prepareFullTrial({person,organisation,eligibility,history,requestedAt}){
 if(!person||!organisation||!eligibility||!history||
  !instant(requestedAt)||!id(person.id)||!id(organisation.id)||
  !id(eligibility.reviewEventId)||!id(eligibility.policyVersion)||
  eligibility.trustedIdentityValidated!==true||eligibility.verifiedOrganization!==true||
  eligibility.organisationId!==organisation.id||
  eligibility.personId!==person.id||
  eligibility.independentReviewApproved!==true||
  history.checkedFromAuthoritativeLedger!==true||
  !Array.isArray(history.trialClaims))
  return block("Verified person, entity and authoritative trial history required");
 if(history.trialClaims.some(x=>
   x?.personId===person.id||x?.organisationId===organisation.id))
  return block("Free full-platform trial previously claimed by individual or entity");
 const ms=Date.parse(requestedAt),expires=new Date(ms+DAYS*24*60*60*1000).toISOString();
 return {state:"trial_grant_candidate",reason:"Atomic server-authorised issuance only; full-feature permissions remain subject to normal legal and counterparty verification, not trial feature-gating",
  grant:{personId:person.id,organisationId:organisation.id,days:DAYS,
   startedAt:requestedAt,expiresAt:expires,policyVersion:eligibility.policyVersion,
   eligibilityReviewEventId:eligibility.reviewEventId,capabilities:[...DEALSCOPE_FULL_SUITE],
   requiresPaymentMethod:false,chargeAtExpiry:false,autoConverts:false,
   legalEntity:"Shobane African Resources (Pty) Ltd",state:"candidate_uncommitted"}};
}
/** Evaluated by a server with authenticated user/tenant; never trust a client clock. */
export function readTrialState({grant,actor,at,paidSubscriptionActive=false}){
 if(!grant||!actor||actor.authenticated!==true||actor.activeMembership!==true||
  actor.personId!==grant.personId||actor.organisationId!==grant.organisationId||
  !instant(at)||!instant(grant.startedAt)||!instant(grant.expiresAt)||
  grant.state!=="active"||paidSubscriptionActive!==true&&paidSubscriptionActive!==false)
  return {state:"denied",features:[],readOnly:true};
 if(paidSubscriptionActive)return {state:"paid",features:[...DEALSCOPE_FULL_SUITE],readOnly:false};
 const current=Date.parse(at);
 if(current<Date.parse(grant.startedAt))return {state:"denied",features:[],readOnly:true};
 if(current>=Date.parse(grant.expiresAt))
  return {state:"expired",features:[],readOnly:true,chargeTriggered:false,
   message:"Trial ended: existing permitted documents remain accessible under data-retention rules; continued paid access requires explicit purchase."};
 return {state:"active_full_trial",features:[...DEALSCOPE_FULL_SUITE],
  readOnly:false,chargeTriggered:false,expiresAt:grant.expiresAt};
}
