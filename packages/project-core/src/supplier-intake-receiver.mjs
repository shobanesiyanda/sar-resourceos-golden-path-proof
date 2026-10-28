/** ResourceOS receiver of SAR corporate website preliminary supplier leads.
 * No personal data included in this command envelope; resolution requires
 * a separate authenticated SAR data-access path and source record hash check.
 * This module never authorises commodity ownership, campaigns or payment.
 */
const COMPANY='Shobane African Resources (Pty) Ltd';
const valid=x=>typeof x==='string'&&x.length>0&&x.length<=200;
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const fail=(reason)=>({state:'blocked',reason,intent:null});
export function prepareResourceOSWebsiteIntake({event,sourceAttestation,principal,alreadySeen=[]}){
 if(!Array.isArray(alreadySeen))return fail('trusted_idempotency_index_required');
 if(!sourceAttestation||sourceAttestation.verifiedTransport!==true||
    sourceAttestation.issuer!=='sar-website'||sourceAttestation.company!==COMPANY||
    sourceAttestation.verifiedConsent!==true||sourceAttestation.verifiedOriginalSource!==true)
  return fail('verified_sar_website_channel_consent_and_source_required');
 if(!principal||principal.verified!==true||principal.company!==COMPANY||
    principal.activeMembership!==true||!valid(principal.userId)||
    !Array.isArray(principal.roles)||!principal.roles.includes('supplier_intake_reviewer'))
  return fail('authorised_sar_intake_reviewer_required');
 if(!event||event.eventType!=='sar.website.supplier_submitted.v1'||
    event.sourceSystem!=='sar-website'||event.targetState!=='unverified_intake'||
    !valid(event.eventId)||!valid(event.sourceId)||!valid(event.idempotencyKey)||
    event.idempotencyKey!=='sar-web-intake:'+event.eventId||!hash(event.sourceHash)||
    !valid(event.consentVersion)||!valid(event.reviewedBy)||
    !valid(event.category)||!valid(event.riskState)||
    !['standard_review','enhanced_review_cleared'].includes(event.riskState)||
    !Number.isFinite(Date.parse(event.receivedAt))||!Number.isFinite(Date.parse(event.reviewedAt))||
    Date.parse(event.reviewedAt)<Date.parse(event.receivedAt))
  return fail('invalid_or_unreviewed_website_handoff');
 if(event.sourceId!==sourceAttestation.sourceId||
    event.sourceHash!==sourceAttestation.originalSourceHash||
    event.eventId!==sourceAttestation.reviewEventId||
    event.consentVersion!==sourceAttestation.consentVersion||
    event.reviewedBy!==principal.userId)
  return fail('source_revision_or_reviewer_mismatch');
 if(alreadySeen.includes(event.idempotencyKey))return {state:'duplicate',reason:'already_received',intent:null};
 return {state:'candidate_for_atomic_recording',reason:'requires_trusted_intake_writer',
  intent:{kind:'sar.resourceos.unverified_supplier_intake.v1',
   eventId:event.eventId,idempotencyKey:event.idempotencyKey,
   sourceSystem:'sar-website',sourceRef:event.sourceId,sourceHash:event.sourceHash,
   consentVersion:event.consentVersion,category:event.category,riskState:event.riskState,
   reviewedBy:event.reviewedBy,company:COMPANY,resourceState:'unverified_intake',
   approvedCampaign:false,stockOwnershipVerified:false,purchaseApproved:false,
   financialReleaseApproved:false,requiresAtomicAuditOutbox:true}};
}
