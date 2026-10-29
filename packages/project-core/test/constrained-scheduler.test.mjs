import test from 'node:test';
import assert from 'node:assert/strict';
import {scheduleConstrainedProject} from '../src/constrained-scheduler.mjs';
const job=(id,resources=[{poolId:'truck',units:1}],more={})=>({id,verified:true,
 sourceDocumentId:'DOC',sourceLocator:'BOQ:1',durationDays:3,earliestStartDay:0,
 baseCost:100,predecessors:[],resources,...more});
const run=(packages,pools=[{id:'truck',capacity:1}],extra={})=>
 scheduleConstrainedProject({projectId:'P1',packages,pools,horizonDays:60,...extra});
test('one shared truck serializes otherwise parallel work packages',()=>{
 const r=run([job('A'),job('B')]);assert.equal(r.state,'provisional_schedule');
 assert.deepEqual(r.tasks.map(t=>t.startDay),[0,3]);assert.equal(r.finishDay,6);
 assert.equal(r.bottlenecks[0].extraDays,3);
});
test('sufficient fleet permits parallel work and shortens completion',()=>{
 const r=run([job('A'),job('B')],[{id:'truck',capacity:2}]);
 assert.deepEqual(r.tasks.map(t=>t.startDay),[0,0]);assert.equal(r.finishDay,3);
});
test('dependency waits even where capacity is free',()=>{
 const r=run([job('A'),job('B',[],{predecessors:['A']})]);
 assert.equal(r.tasks[1].startDay,3);
});
test('verified separate equipment pools permit parallel tasks',()=>{
 const r=run([job('A'),job('B',[{poolId:'excavator',units:1}])],
  [{id:'truck',capacity:1},{id:'excavator',capacity:1}]);
 assert.equal(r.finishDay,3);
});
test('demand above available capacity fails safely',()=>{
 assert.equal(run([job('A',[{poolId:'truck',units:3}])]).state,'incomplete');
});
test('insufficient horizon cannot fabricate a completion date',()=>{
 assert.equal(run([job('A'),job('B')],undefined,{horizonDays:4}).state,'incomplete');
});
test('cycles and unknown predecessors are rejected',()=>{
 assert.equal(run([job('A',undefined,{predecessors:['A']})]).state,'incomplete');
 assert.equal(run([job('A',undefined,{predecessors:['X']})]).state,'incomplete');
});
test('unverified project documents cannot drive capacity scheduling',()=>{
 assert.equal(run([job('A',undefined,{verified:false})]).state,'incomplete');
});
test('work-package cost staging respects resource constrained starts',()=>{
 const r=run([job('A'),job('B')]);
 assert.deepEqual(r.indicativeCostsByDay,[{day:0,amount:100},{day:3,amount:100}]);
});
test('cost shock raises staged costs without inventing a cash-flow forecast',()=>{
 const r=run([job('A')],undefined,{priceFactor:1.5});
 assert.equal(r.totalBaseCost,150);assert.equal(r.state,'provisional_schedule');
});
test('nonfinite cost shocks fail closed',()=>{
 assert.equal(run([job('A',undefined,{baseCost:1e308})],undefined,{priceFactor:1e308}).state,'incomplete');
});

test('duplicate demand entries cannot bypass pool capacity',()=>{
 assert.equal(run([job('A',[{poolId:'truck',units:1},{poolId:'truck',units:1}])]).state,'incomplete');
});
