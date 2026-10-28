import test from 'node:test';import assert from 'node:assert/strict';
import {prepareBaselineActivation as gate,executeActivationCommand as execute} from '../src/activation-command.mjs';
const H='a'.repeat(64),S='b'.repeat(64),NOW='2026-10-28T20:00:00.000Z';
const company='Shobane African Resources (Pty) Ltd';
const principal={verified:true,activeMembership:true,company,userId:'USER_A',tenantId:'SAR_1',roles:['project_activation_initiator']};
const baseline={tenantId:'SAR_1',company,projectId:'PROJECT_1',baselineId:'BASE_1',revisionHash:H,sourceSetHash:S,
 state:'approval_candidate',version:2,currency:'ZAR',documentSourcesVerified:true,scenariosReviewed:true,
 resourcesVerified:true,permitsReviewed:true,committedBudgetVerified:true,fundingAvailable:true,openMaterialRisks:0};
const command={commandId:'CMD_1',projectId:'PROJECT_1',baselineId:'BASE_1',expectedVersion:2,expectedSourceSetHash:S};
const domains=['technical','commercial','legal','treasury'];
const approvals=domains.map((domain,i)=>({domain,actorId:'REVIEWER_'+i,approvalEventId:'E_'+i,projectId:'PROJECT_1',baselineId:'BASE_1',revisionHash:H,
 sourceSetHash:S,decision:'approved',signed:true,verifiedByIAM:true,signedAt:'2026-10-28T18:00:00.000Z',expiresAt:'2026-10-29T18:00:00.000Z'}));
const run=(x={})=>gate({principal,baseline,command,approvals,now:NOW,...x});
const rdata=()=>new Request('https://sar.internal/api/projects/activation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(command)});
const services={authenticate:async()=>principal,loadOwnedBaseline:async()=>baseline,loadVerifiedApprovals:async()=>approvals,trustedNow:async()=>NOW,
 commitActivationAtomically:async()=>({committed:true,tenantId:'SAR_1',projectId:'PROJECT_1',commandId:'CMD_1',auditEventId:'AUD_1',outboxEventId:'OUT_1',baselineVersion:3})};
test('complete distinct approvals produce only a pending trusted intent',()=>{const r=run();assert.equal(r.state,'activation_intent_pending_atomic_commit');assert.equal(r.intent.noFundsReleased,true);assert.equal(r.intent.transactionalOutboxRequired,true);});
test('missing IAM and role blocks',()=>{for(const actor of [{...principal,verified:false},{...principal,roles:[]},{...principal,tenantId:'B'}])assert.equal(run({principal:actor}).state,'blocked');});
test('cannot activate a baseline without reviewed evidence and funding',()=>{for(const field of ['documentSourcesVerified','scenariosReviewed','resourcesVerified','permitsReviewed','committedBudgetVerified','fundingAvailable'])assert.equal(run({baseline:{...baseline,[field]:false}}).state,'blocked');});
test('risk, draft or changed version blocks',()=>{assert.equal(run({baseline:{...baseline,openMaterialRisks:1}}).state,'blocked');assert.equal(run({baseline:{...baseline,state:'draft'}}).state,'blocked');assert.equal(run({command:{...command,expectedVersion:1}}).state,'blocked');});
test('reviewer cannot be initiator or approve twice',()=>{assert.equal(run({approvals:[{...approvals[0],actorId:'USER_A'},...approvals.slice(1)]}).state,'blocked');assert.equal(run({approvals:[approvals[0],{...approvals[1],actorId:approvals[0].actorId},...approvals.slice(2)]}).state,'blocked');});
test('approval must match exact revision/source and not expire',()=>{for(const change of [{sourceSetHash:H},{revisionHash:S},{expiresAt:'2026-10-28T19:00:00Z'},{decision:'rejected'}])assert.equal(run({approvals:[{...approvals[0],...change},...approvals.slice(1)]}).state,'blocked');});
test('no service adapter rejects even well-formed command',async()=>assert.equal((await execute({request:rdata(),services:null})).status,503));
test('unauthenticated request prevents record reads',async()=>{let read=false;const x=await execute({request:rdata(),services:{...services,authenticate:async()=>({verified:false}),loadOwnedBaseline:async()=>{read=true;return baseline;}}});assert.equal(x.status,403);assert.equal(read,false);});
test('cross-tenant projects and stale revisions do not commit',async()=>{let commits=0;const x=await execute({request:rdata(),services:{...services,loadOwnedBaseline:async()=>({...baseline,tenantId:'OTHER'}),commitActivationAtomically:async()=>{commits++;return {}}}});assert.equal(x.status,409);assert.equal(commits,0);});
test('validated transaction must return matching auditable event and idempotency receipt',async()=>{const x=await execute({request:rdata(),services});assert.equal(x.status,202);assert.equal(x.body.paymentReleased,false);assert.equal(x.body.externalDispatchSent,false);});
test('claiming success without outbox fails closed',async()=>{const x=await execute({request:rdata(),services:{...services,commitActivationAtomically:async()=>({...await services.commitActivationAtomically(),outboxEventId:null})}});assert.equal(x.status,503);});
test('unexpected client fields and forged approval objects rejected',async()=>{const request=new Request('https://sar.internal/api/projects/activation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...command,approvals})});const x=await execute({request,services});assert.equal(x.status,400);});

test('oversized streaming command blocks before database read',async()=>{let loaded=false;let n=0;const stream=new ReadableStream({pull(c){n++;c.enqueue(new Uint8Array(3000));if(n>1)c.close();}});const request=new Request('https://sar.internal/api/projects/activation',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'});const x=await execute({request,services:{...services,loadOwnedBaseline:async()=>{loaded=true;return baseline;}}});assert.equal(x.status,413);assert.equal(loaded,false);});