/**
 * DealScope Auth/AccountOS action boundary — PURE proposal.
 * Trusted fields must be reconstructed by a verified server Auth/session adapter and
 * SELECT against authoritative ds_memberships; no caller-provided JSON is authority.
 * No Supabase backend is connected and this module does NOT authenticate anyone.
 */
export const CUSTOMER_ACTION_ROLES=Object.freeze({
 read_own_workspace:["owner","analyst","buyer","seller","viewer"],
 create_dossier:["owner","analyst","seller"],
 submit_evidence:["owner","analyst","seller"],
 request_free_cycle:["owner","analyst"],
 request_assessment:["owner","analyst"],
 view_dossier:["owner","analyst"],
 request_exchange_listing:["owner","seller"],
 approve_recipient_disclosure:["owner"],
 review_invoices:["owner"],
});
const valid=s=>typeof s==="string"&&s.trim().length>0&&s.length<=160;
const denied=reason=>({state:"denied",reason,grant:null});
export function authorizeCustomerAction({principal,membership,organisation,action,resource}){
 if(!Object.hasOwn(CUSTOMER_ACTION_ROLES,action))return denied("Unknown protected action");
 // The authentication claim, membership, and organisation are distinct trusted reads.
 if(!principal||principal.authenticationVerified!==true||
   principal.source!=="verified-auth-session"||principal.isAnonymous===true||
   !valid(principal.userId)||!valid(principal.sessionId)||
   principal.isRevoked===true||!valid(principal.authenticationEventId))
  return denied("Fresh authenticated named session required");
 if(!membership||membership.source!=="membership-ledger"||
   membership.serverReadVerified!==true||membership.state!=="active"||
   !valid(membership.tenantId)||membership.userId!==principal.userId||
   !CUSTOMER_ACTION_ROLES[action].includes(membership.role))
  return denied("Active, independently loaded tenant membership and action role required");
 if(!organisation||organisation.id!==membership.tenantId||
  !["verified","under_review"].includes(organisation.verificationState)||
  organisation.isSuspended===true)
  return denied("Authenticated organisation state required");
 if(["request_free_cycle","request_assessment","approve_recipient_disclosure","request_exchange_listing"].includes(action) &&
  organisation.verificationState!=="verified")
  return denied("Verified organisation required for commercial actions");
 if(resource){
   if(resource.tenantId!==membership.tenantId ||
     !valid(resource.id) || resource.revoked===true)
    return denied("Resource must belong to same active tenant");
   if(resource.accessMode==="creator_only" && resource.ownerUserId!==principal.userId)
    return denied("Confidential creator-restricted resource");
   if(resource.accessMode!=="creator_only"&&resource.accessMode!=="organisation")
    return denied("Recognised resource access mode required");
 }
 return {state:"authorised_candidate",reason:"Trusted backend must recheck session and membership at persistence/issue",
   grant:{tenantId:membership.tenantId,userId:principal.userId,sessionId:principal.sessionId,
    action,role:membership.role,authEventId:principal.authenticationEventId,serverVerified:true}};
}
