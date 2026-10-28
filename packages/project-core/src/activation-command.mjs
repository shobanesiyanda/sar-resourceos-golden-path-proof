/** SAR ResourceOS P09 baseline activation. Never an autonomous project start.
 * Only the SAR-owned trusted server may supply principal, current state and approvals.
 * Output is an intent for a single atomic transaction (event + audit + outbox), not a write.
 */
const company='Shobane African Resources (Pty) Ltd';
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const name=x=>typeof x==='string'&&x.length<=120&&/^[a-zA-Z0-9][a-zA-Z0-9_:-]*$/.test(x);
const domains=['technical','commercial','legal','treasury'];
const blocked=(reason)=>({state:'blocked',reason,intent:null});
export function prepareBaselineActivation({principal,baseline,approvals,command,now}){
 if(!principal||principal.verified!==true||principal.activeMembership!==true||principal.company!==company||
    !name(principal.userId)||!name(principal.tenantId)||!Array.isArray(principal.roles)||
    !principal.roles.includes('project_activation_initiator'))return blocked('trusted_actor_authority_required');
 if(!baseline||baseline.tenantId!==principal.tenantId||baseline.company!==company||
    !name(baseline.projectId)||!name(baseline.baselineId)||!hash(baseline.revisionHash)||
    !hash(baseline.sourceSetHash)||baseline.state!=='approval_candidate'||
    !Number.isSafeInteger(baseline.version)||baseline.version<1||
    !['ZAR','USD'].includes(baseline.currency)||
    baseline.documentSourcesVerified!==true||baseline.scenariosReviewed!==true||
    baseline.resourcesVerified!==true||baseline.permitsReviewed!==true||
    baseline.committedBudgetVerified!==true||baseline.fundingAvailable!==true||
    baseline.openMaterialRisks!==0)return blocked('complete_approved_project_evidence_required');
 if(!command||!name(command.commandId)||!name(command.projectId)||
    command.projectId!==baseline.projectId||command.baselineId!==baseline.baselineId||
    command.expectedVersion!==baseline.version||!Number.isSafeInteger(command.expectedVersion)||
    !hash(command.expectedSourceSetHash)||command.expectedSourceSetHash!==baseline.sourceSetHash)
    return blocked('stale_or_invalid_command_revision');
 const time=Date.parse(now||'');if(typeof now!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(now)||!Number.isFinite(time)||new Date(time).toISOString()!==now)
    return blocked('trusted_utc_time_required');
 if(!Array.isArray(approvals)||approvals.length!==domains.length)return blocked('four_independent_approvals_required');
 const byDomain=new Map(); const actorSet=new Set(); const eventSet=new Set();
 for(const a of approvals){
   if(!a||!domains.includes(a.domain)||byDomain.has(a.domain)||!name(a.actorId)||
      a.actorId===principal.userId||actorSet.has(a.actorId)||!name(a.approvalEventId)||
      eventSet.has(a.approvalEventId)||a.signed!==true||a.verifiedByIAM!==true||
      a.projectId!==baseline.projectId||a.baselineId!==baseline.baselineId||
      a.revisionHash!==baseline.revisionHash||a.sourceSetHash!==baseline.sourceSetHash||
      a.decision!=='approved'||!Number.isFinite(Date.parse(a.signedAt))||
      !Number.isFinite(Date.parse(a.expiresAt))||Date.parse(a.signedAt)>time||
      Date.parse(a.expiresAt)<time)return blocked('independent_current_revision_approval_required');
   byDomain.set(a.domain,a);actorSet.add(a.actorId);eventSet.add(a.approvalEventId);
 }
 if(byDomain.size!==domains.length)return blocked('approval_domain_incomplete');
 const intent={eventType:'sar.resourceos.project_activation_intent.v1',commandId:command.commandId,
   tenantId:principal.tenantId,company,projectId:baseline.projectId,baselineId:baseline.baselineId,
   sourceSetHash:baseline.sourceSetHash,revisionHash:baseline.revisionHash,
   expectedVersion:baseline.version,initiatorId:principal.userId,approvedAt:now,
   approvalEventIds:domains.map(d=>byDomain.get(d).approvalEventId),
   targetState:'pending_trusted_atomic_commit',transactionalAuditRequired:true,
   transactionalOutboxRequired:true,noFundsReleased:true,noExternalDispatch:true};
 return {state:'activation_intent_pending_atomic_commit',reason:'independent_gates_satisfied',intent};
}
/** HTTP command coordinator; all services MUST be authenticated trusted SAR adapters.
 * No service => 503. No live mutation is possible from this module alone.
 */
export async function executeActivationCommand({request,services}){
 const no=(status,code)=>({status,body:{status:code},cacheControl:'no-store'});
 if(!services||!['authenticate','loadOwnedBaseline','loadVerifiedApprovals','commitActivationAtomically','trustedNow']
    .every(n=>typeof services[n]==='function'))return no(503,'sar_project_service_not_activated');
 let actor;try{actor=await services.authenticate(request);}catch{return no(401,'authentication_required');}
 if(!actor?.verified||!actor.activeMembership)return no(403,'trusted_membership_required');
 const contentType=request?.headers?.get?.('content-type')||'';
 if(!/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?\s*$/i.test(contentType))return no(415,'invalid_content_type');
 const length=request.headers.get('content-length');
 if(length!==null&&(!Number.isSafeInteger(Number(length))||Number(length)<0))return no(400,'invalid_content_length');
 if(length!==null&&Number(length)>4096)return no(413,'request_too_large');
 if(!request.body?.getReader)return no(400,'invalid_request');
 let raw;
 const reader=request.body.getReader(),chunks=[];let size=0;
 try{
   while(true){const {done,value}=await reader.read();if(done)break;
     if(!(value instanceof Uint8Array))throw new Error('invalid chunk');
     size+=value.byteLength;if(size>4096)break;chunks.push(value);}
   if(size>4096){await reader.cancel().catch(()=>{});return no(413,'request_too_large');}
   if(size===0)return no(400,'invalid_request');
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 }catch{return no(400,'invalid_request');}finally{reader.releaseLock();}
 let command;try{command=JSON.parse(raw);}catch{return no(400,'invalid_json');}
 if(!command||typeof command!=='object'||Array.isArray(command)||
    Object.keys(command).sort().join(',')!=='baselineId,commandId,expectedSourceSetHash,expectedVersion,projectId')
    return no(400,'invalid_command_fields');
 let baseline,approvals,time;
 try{baseline=await services.loadOwnedBaseline({tenantId:actor.tenantId,projectId:command.projectId,
       baselineId:command.baselineId,userId:actor.userId});
     approvals=await services.loadVerifiedApprovals({tenantId:actor.tenantId,projectId:command.projectId,
       baselineId:command.baselineId,sourceSetHash:baseline?.sourceSetHash});
     time=await services.trustedNow();}
 catch{return no(503,'authoritative_project_records_unavailable');}
 const gate=prepareBaselineActivation({principal:actor,baseline,approvals,command,now:time});
 if(gate.state!=='activation_intent_pending_atomic_commit')return no(409,gate.reason);
 let result;try{result=await services.commitActivationAtomically({intent:gate.intent,
    expectedVersion:gate.intent.expectedVersion,
    requireSingleTransaction:['baseline_state','audit_event','outbox_event','idempotency_record']});}
 catch{return no(503,'atomic_write_unavailable');}
 if(!result||result.committed!==true||result.tenantId!==actor.tenantId||
    result.commandId!==command.commandId||result.projectId!==command.projectId||
    !name(result.auditEventId)||!name(result.outboxEventId)||
    result.baselineVersion!==command.expectedVersion+1)return no(503,'atomic_commit_not_verified');
 return {status:202,cacheControl:'no-store',body:{status:'accepted_for_authorised_project_control',
   projectId:command.projectId,commandId:command.commandId,version:result.baselineVersion,
   paymentReleased:false,externalDispatchSent:false}};
}
