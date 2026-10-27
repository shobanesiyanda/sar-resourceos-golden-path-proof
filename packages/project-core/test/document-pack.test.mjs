import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareSimulatedProjectDocuments as make} from '../src/document-pack.mjs';
const H='a'.repeat(64);
const sim=(id,k,total,days)=>({id,kind:k,sourceSetHash:H,result:{status:'provisional',scenarioId:id,knownCosts:total-10,
 contingency:10,totalBudget:total,completionDays:days,criticalPath:['A'],tasks:[{id:'A',startDay:0,endDay:days,cost:total-10}]}});
const base=()=>({projectId:'SAR-PJ-01',projectName:'Equipment project',division:'mining_contract_services',date:'2026-10-27',
 currency:'ZAR',inputVersion:'v1',sourceSetHash:H,sources:[{documentId:'BOQ',version:'v1',sha256:H,locator:'p3'}],
 scenarios:[sim('BASE','baseline',200,4),sim('DOWN','downside',260,7)],
 costing:[{requirementId:'A',basis:'assumption',sourceRef:'BOQ p3',reviewed:false}],risks:['Capacity not proved']});
test('requires multi-scenario source consistency',()=>{
 assert.equal(make({...base(),scenarios:[sim('BASE','baseline',200,4)]}).state,'blocked');
 assert.equal(make({...base(),sourceSetHash:'bad'}).state,'blocked');
 assert.equal(make({...base(),scenarios:[sim('BASE','baseline',200,4),{...sim('DOWN','downside',260,7),sourceSetHash:'b'.repeat(64)}]}).state,'blocked');
});
test('prepares separately identifiable, unapproved drafts and scenario differences',()=>{
 const result=make(base());
 assert.equal(result.state,'draft_only'); assert.equal(result.documents.length,2);
 assert.deepEqual(result.documents.map(x=>x.templateId),['project-brief','internal-memo']);
 assert.ok(result.documents.every(d=>d.schemaVersion===1&&d.blocks.length>5));
 assert.notEqual(result.documents[0].documentRef,result.documents[1].documentRef);
 assert.equal(result.comparison[1].costDelta,60);
 assert.ok(result.issues.some(x=>x.includes('Pricing')));
});
test('invalid cost provenance, totals or review states fail closed',()=>{
 assert.equal(make({...base(),costing:[]}).state,'blocked');
 const x=base();x.scenarios[0].result.totalBudget=999;
 assert.equal(make(x).state,'blocked');
 const y=base();y.costing[0].basis='market_proved';
 assert.equal(make(y).state,'blocked');
});
test('RFQ drafts remain unsent and are source-linked',()=>{
 const x=base();
 x.rfq={id:'RFQ-1',projectId:x.projectId,version:1,status:'draft',currency:'ZAR',deadline:'2026-11-30',
  blockers:[],lines:[{requirementId:'A',specification:'Tracked excavator',quantity:1,unit:'unit',documentId:'BOQ',sourceLocator:'p3'}]};
 const out=make(x);
 assert.equal(out.documents.length,3);
 assert.equal(out.documents[2].templateId,'rfq');
 assert.equal(out.documents[2].recipient,'');
 assert.match(out.documents[2].blocks[0].text,/UNSENT/);
 assert.equal(make({...x,rfq:{...x.rfq,blockers:['technical gap']}}).state,'blocked');
 assert.equal(make({...x,rfq:{...x.rfq,lines:[{...x.rfq.lines[0],documentId:'OTHER'}]}}).state,'blocked');
});
test('does not silently accept impossible dates or incomplete simulation',()=>{
 assert.equal(make({...base(),date:'2026-02-30'}).state,'blocked');
 const x=base();x.scenarios[1].result.status='incomplete';
 assert.equal(make(x).state,'blocked');
});
