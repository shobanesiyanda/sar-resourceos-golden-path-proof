import test from 'node:test';
import assert from 'node:assert/strict';
import {openAmendment,transitionAmendment,commitReadiness} from '../src/amendment-workflow.mjs';
const H='a'.repeat(64),H2='b'.repeat(64);
const document={documentId:'D-1',entityId:'SAR',revisionId:'r3',contentHash:H,status:'issued'};
const policy={editableSectionIds:['s1','s2'],postReviewRoles:['technical_reviewer','document_controller']};
const p=(id,role,minute)=>({authenticated:true,entityId:'SAR',userId:id,roles:[role],
 serverTime:'2026-10-27T12:'+String(minute).padStart(2,'0')+':00Z'});
const start=()=>openAmendment({document,request:{id:'A-1',reason:'Unverified machine capacity',
 purpose:'Update source-linked equipment specification',sectionIds:['s1']},
 principal:p('engineer','document_requester',1),policy});
const pre=r=>transitionAmendment({record:r,principal:p('chief','amendment_preapprover',2),
 command:{type:'preapprove',reason:'Technical correction justified',expectedBaseHash:H}});
const submit=r=>transitionAmendment({record:r,principal:p('engineer','document_requester',3),
 command:{type:'submit',expectedBaseHash:H,newContentHash:H2,changedSectionIds:['s1'],diffSummary:'Revised excavator capacity'}});
const approve=(r,role,id,min)=>transitionAmendment({record:r,principal:p(id,role,min),
 command:{type:'postapprove',reviewRole:role,reason:'Source evidence verified',proposalHash:H2}});
test('preapproval and two independent postreviews are mandatory before commit readiness',()=>{
 const x=start();assert.equal(x.state,'opened');
 assert.equal(commitReadiness({record:x.record,document}).ready,false);
 const a=pre(x.record);assert.equal(a.state,'edit_authorised');
 const s=submit(a.record);assert.equal(s.state,'awaiting_postreview');
 const first=approve(s.record,'technical_reviewer','technical',4);
 assert.equal(first.state,'awaiting_postreview');assert.equal(commitReadiness({record:first.record,document}).ready,false);
 const done=approve(first.record,'document_controller','control',5);
 assert.equal(done.state,'approved_pending_atomic_commit');
 assert.equal(commitReadiness({record:done.record,document}).ready,true);
 assert.equal(commitReadiness({record:done.record,document:{...document,revisionId:'r4'}}).ready,false);
 assert.deepEqual(done.record.events.map(e=>e.seq),[1,2,3,4,5]);
});
test('reason and authorised section scope fail closed',()=>{
 const noReason=openAmendment({document,policy,request:{id:'X',reason:'',purpose:'change',sectionIds:['s1']},principal:p('engineer','document_requester',1)});
 assert.equal(noReason.state,'blocked');
 const illegal=openAmendment({document,policy,request:{id:'X',reason:'needed',purpose:'change',sectionIds:['s3']},principal:p('engineer','document_requester',1)});
 assert.equal(illegal.state,'blocked');
});
test('no author self-approval or unapproved/unscoped edits',()=>{
 const x=start().record;
 assert.equal(transitionAmendment({record:x,principal:p('engineer','amendment_preapprover',2),
  command:{type:'preapprove',reason:'approve self',expectedBaseHash:H}}).state,'blocked');
 assert.equal(submit(x).state,'blocked');
 const a=pre(x).record;
 const wrong=transitionAmendment({record:a,principal:p('engineer','document_requester',3),
  command:{type:'submit',expectedBaseHash:H,newContentHash:H2,changedSectionIds:['s2'],diffSummary:'out of scope'}});
 assert.equal(wrong.state,'blocked');
});
test('postreview rejects self, duplicate, wrong hash and rollback of time',()=>{
 const s=submit(pre(start().record).record).record;
 assert.equal(approve(s,'technical_reviewer','engineer',4).state,'blocked');
 assert.equal(transitionAmendment({record:s,principal:p('technical','technical_reviewer',4),
  command:{type:'postapprove',reviewRole:'technical_reviewer',reason:'ok',proposalHash:H}}).state,'blocked');
 const a=approve(s,'technical_reviewer','technical',4).record;
 assert.equal(approve(a,'technical_reviewer','other',5).state,'blocked');
 assert.equal(approve(a,'document_controller','control',3).state,'blocked');
});
test('rejections and cancellations retain reason, actor, timestamp',()=>{
 const x=start();
 const rejection=transitionAmendment({record:x.record,principal:p('chief','amendment_preapprover',2),
  command:{type:'reject',reason:'Insufficient source proof'}});
 assert.equal(rejection.state,'rejected');
 assert.equal(rejection.record.events[1].actorId,'chief');
 assert.equal(rejection.record.events[1].details.reason,'Insufficient source proof');
 assert.equal(pre(rejection.record).state,'blocked');
});
test('cross-company principal cannot request an amendment',()=>{
 assert.equal(openAmendment({document,policy,request:{id:'x',reason:'yes',purpose:'change',sectionIds:['s1']},
  principal:{...p('engineer','document_requester',1),entityId:'OTHER'}}).state,'blocked');
});
