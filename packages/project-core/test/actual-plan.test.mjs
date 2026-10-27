import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileProjectPlan as reconcile} from '../src/actual-plan.mjs';
const baseline={approvalState:'approved',baselineId:'BASE1',projectId:'P1',revisionHash:'revhash',
 currency:'ZAR',tasks:[{id:'A',plannedCost:200,plannedEndDay:2},{id:'B',plannedCost:300,plannedEndDay:4}]};
const actuals=[{eventId:'E1',projectId:'P1',baselineId:'BASE1',taskId:'A',sourceRef:'weighbridge-1',
 verified:true,costIncurred:250,completionPct:100,day:2}];
test('reports over-budget tasks and incomplete overdue work without fabricating cash/GL',()=>{
 const r=reconcile({baseline,actuals,asOfDay:5});
 assert.equal(r.state,'provisional_variance');
 assert.equal(r.totals.plannedCost,500);
 assert.equal(r.totals.actualCost,250);
 assert.equal(r.comparison[0].costVariance,50);
 assert.equal(r.comparison[1].late,true);
 assert.equal(r.comparison[1].unverifiedAbsence,true);
});
test('does not accept unapproved plan, forged physical actual or future evidence',()=>{
 assert.equal(reconcile({baseline:{...baseline,approvalState:'draft'},actuals,asOfDay:5}).state,'blocked');
 assert.equal(reconcile({baseline,actuals:[{...actuals[0],verified:false}],asOfDay:5}).state,'blocked');
 assert.equal(reconcile({baseline,actuals:[{...actuals[0],day:8}],asOfDay:5}).state,'blocked');
});
test('duplicate source event or cross-project state cannot inflate actuals',()=>{
 assert.equal(reconcile({baseline,actuals:[actuals[0],actuals[0]],asOfDay:5}).state,'blocked');
 assert.equal(reconcile({baseline,actuals:[{...actuals[0],projectId:'X'}],asOfDay:5}).state,'blocked');
});
test('no actual progress is not shown as completed, unforecast cash is not invented',()=>{
 const r=reconcile({baseline,actuals:[],asOfDay:1});
 assert.equal(r.state,'provisional_variance');
 assert.equal(r.totals.verifiedComplete,0);
 assert.equal(r.totals.forecastRemainingCost,500);
});
