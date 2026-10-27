/**
 * SAR document amendment domain contract.
 * Pure functions only: no editing, identity attestation, storage, approval grant,
 * document publishing, external communication or cryptographic hashing here.
 * All principal, policy, canonical hash, time and compare-and-swap data MUST
 * be obtained/verified by a trusted server enforcing SAR-bound IAM and DoA.
 */
const present=(v,max=1000)=>typeof v==="string"&&v.trim().length>0&&v.length<=max;
const sha=v=>typeof v==="string"&&/^[a-f0-9]{64}$/i.test(v);
const when=v=>present(v,50)&&!Number.isNaN(Date.parse(v))&&/^\d{4}-\d{2}-\d{2}T/.test(v);
const deny=(reason)=>({state:"blocked",reason,record:null});
const clone=x=>JSON.parse(JSON.stringify(x));
const actor=(p,role,entity)=>p?.authenticated===true&&present(p.userId,120)&&p.entityId===entity&&
  Array.isArray(p.roles)&&p.roles.includes(role)&&when(p.serverTime);
const logged=(r,p,type,details)=>({...r,events:[...r.events,{seq:r.events.length+1,type,
 actorId:p.userId,at:p.serverTime,details}],updatedAt:p.serverTime});
const later=(r,p)=>when(p?.serverTime)&&Date.parse(p.serverTime)>Date.parse(r.updatedAt);
const noReentry=(r,p)=>p.userId!==r.requesterId;
const IDs=(x)=>Array.isArray(x)&&x.length>0&&x.length<=100&&
 x.every(s=>present(s,120))&&new Set(x).size===x.length;

/** Opens a *request*, never edits the approved document. */
export function openAmendment({document,request,principal,policy}){
 if(!document||!request||!principal||!policy)return deny("Document, request, authenticated principal and trusted policy required");
 if(!actor(principal,"document_requester",document.entityId)||!present(document.documentId,120)||
   !present(document.revisionId,120)||!sha(document.contentHash)||!["approved","issued"].includes(document.status))
  return deny("Authoritative issued/approved source document and authenticated requester required");
 if(!present(request.id,120)||!present(request.reason,2500)||!present(request.purpose,1200)||
   !IDs(request.sectionIds)||!IDs(policy.editableSectionIds)||!IDs(policy.postReviewRoles)||
   !policy.postReviewRoles.every(x=>["technical_reviewer","commercial_reviewer","document_controller","legal_reviewer"].includes(x))||
   request.sectionIds.some(x=>!policy.editableSectionIds.includes(x)))return deny("Specific justification and policy-permitted section scope required");
 const r={schemaVersion:1,id:request.id,documentId:document.documentId,entityId:document.entityId,
  baseRevisionId:document.revisionId,baseContentHash:document.contentHash,
  allowedSectionIds:[...request.sectionIds],requiredReviewRoles:[...policy.postReviewRoles],
  requesterId:principal.userId,reason:request.reason,purpose:request.purpose,
  status:"awaiting_preapproval",preapprovedBy:null,preapprovalEvent:null,
  proposal:null,reviews:[],updatedAt:principal.serverTime,events:[]};
 return {state:"opened",reason:null,record:logged(r,principal,"amendment_requested",
   {reason:request.reason,purpose:request.purpose,sections:request.sectionIds,baseHash:document.contentHash})};
}
/** A state transition, not a verified identity provider or a document writer. */
export function transitionAmendment({record,command,principal}){
 if(!record||record.schemaVersion!==1||!command||!principal||!Array.isArray(record.events)||
   !Array.isArray(record.allowedSectionIds)||!Array.isArray(record.requiredReviewRoles)||
   !later(record,principal))return deny("Invalid state, event history or non-monotonic trusted time");
 const r=clone(record);
 const authorised=(role)=>actor(principal,role,r.entityId);
 if(command.type==="preapprove"){
  if(r.status!=="awaiting_preapproval"||!authorised("amendment_preapprover")||!noReentry(r,principal)||
   !present(command.reason,2500)||command.expectedBaseHash!==r.baseContentHash)
   return deny("Independent preapproval, reason and exact original revision required");
  r.preapprovedBy=principal.userId;r.preapprovalEvent=r.events.length+1;r.status="edit_authorised";
  return {state:r.status,reason:null,record:logged(r,principal,"scope_preapproved",
   {reason:command.reason,sections:r.allowedSectionIds,baseHash:r.baseContentHash})};
 }
 if(command.type==="submit"){
  if(r.status!=="edit_authorised"||principal.authenticated!==true||principal.entityId!==r.entityId||
     principal.userId!==r.requesterId||!sha(command.newContentHash)||command.newContentHash===r.baseContentHash||
     !present(command.diffSummary,2500)||!IDs(command.changedSectionIds)||
     command.changedSectionIds.some(x=>!r.allowedSectionIds.includes(x))||
     command.expectedBaseHash!==r.baseContentHash)
   return deny("Only authorised author can submit changes within preapproved sections and unchanged base");
  r.proposal={hash:command.newContentHash,changedSectionIds:[...command.changedSectionIds],
   diffSummary:command.diffSummary,submittedAt:principal.serverTime};
  r.reviews=[];r.status="awaiting_postreview";
  return {state:r.status,reason:null,record:logged(r,principal,"draft_submitted",
   {hash:r.proposal.hash,sections:r.proposal.changedSectionIds,diffSummary:command.diffSummary})};
 }
 if(command.type==="postapprove"){
  if(r.status!=="awaiting_postreview"||!noReentry(r,principal)||!present(command.reason,2500)||
     command.proposalHash!==r.proposal?.hash||!r.requiredReviewRoles.includes(command.reviewRole)||
     !authorised(command.reviewRole)||r.reviews.some(x=>x.role===command.reviewRole||x.actorId===principal.userId))
   return deny("Independent role-specific review of exact candidate hash required");
  r.reviews.push({role:command.reviewRole,actorId:principal.userId,
   hash:r.proposal.hash,at:principal.serverTime,reason:command.reason});
  const complete=r.requiredReviewRoles.every(role=>r.reviews.some(x=>x.role===role));
  r.status=complete?"approved_pending_atomic_commit":"awaiting_postreview";
  return {state:r.status,reason:null,record:logged(r,principal,"candidate_postapproved",
   {role:command.reviewRole,hash:r.proposal.hash,reason:command.reason})};
 }
 if(command.type==="reject"){
  const reviewRole=command.reviewRole;
  if(!["awaiting_preapproval","awaiting_postreview"].includes(r.status)||
     !present(command.reason,2500)||!noReentry(r,principal)||
     !(r.status==="awaiting_preapproval"?authorised("amendment_preapprover"):
       r.requiredReviewRoles.includes(reviewRole)&&authorised(reviewRole)))
   return deny("Only an independent authorised reviewer may reject with a reason");
  r.status="rejected";
  return {state:r.status,reason:null,record:logged(r,principal,"amendment_rejected",
   {reason:command.reason,role:reviewRole??"amendment_preapprover"})};
 }
 if(command.type==="cancel"){
  if(!["awaiting_preapproval","edit_authorised","awaiting_postreview"].includes(r.status)||
   principal.authenticated!==true||principal.entityId!==r.entityId||principal.userId!==r.requesterId||
   !present(command.reason,2500))
   return deny("Cancellation requires original requester and reason");
  r.status="cancelled";
  return {state:r.status,reason:null,record:logged(r,principal,"request_cancelled",{reason:command.reason})};
 }
 return deny("Unknown or forbidden amendment operation");
}
/** Permissionless indication only; atomic database writer MUST independently verify full ledger. */
export function commitReadiness({record,document}){
 if(record?.status!=="approved_pending_atomic_commit"||!document||
  document.entityId!==record.entityId||document.documentId!==record.documentId||
  document.revisionId!==record.baseRevisionId||document.contentHash!==record.baseContentHash||
  !record.proposal||!sha(record.proposal.hash)||
  !record.requiredReviewRoles?.every(role=>record.reviews?.some(x=>
    x.role===role&&x.hash===record.proposal.hash&&x.actorId!==record.requesterId)) )
  return {ready:false,reason:"Changed base, incomplete review, invalid proposal or mismatched identity"};
 return {ready:true,reason:"Candidate only: atomic server-side compare-and-swap and immutable issued revision still required",
  documentId:record.documentId,expectedRevisionId:record.baseRevisionId,
  expectedContentHash:record.baseContentHash,candidateHash:record.proposal.hash};
}
