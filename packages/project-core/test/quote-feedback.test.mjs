import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareQuoteScenario} from '../src/quote-feedback.mjs';
const first={id:'EQ',quantity:2,unit:'machine',unitCost:null,predecessors:[]};
const second={id:'HAUL',quantity:10,unit:'trip',unitCost:50,predecessors:['EQ']};
const scenario={projectId:'P1',id:'SIM-1',currency:'ZAR',requirements:[first,second]};
const rfq={id:'RFQ-1',projectId:'P1',version:1,status:'approved_for_dispatch',
 approverId:'A1',approvalEventId:'EV-1',currency:'ZAR',recipients:['V1'],
 lines:[{requirementId:'EQ',quantity:2,unit:'machine'},{requirementId:'HAUL',quantity:10,unit:'trip'}]};
const quote={rfqId:'RFQ-1',vendorId:'V1',messageId:'MSG-1',status:'under_review',
 items:[{requirementId:'EQ',quantity:2,unit:'machine',price:100},
        {requirementId:'HAUL',quantity:10,unit:'trip',price:10}],
 vat:45,delivery:30};
const evidence={validUntil:'2099-12-31',ingestionEventId:'ING-1',sourceSha256:'a'.repeat(64),quotedCurrency:'ZAR'};
const run=(change={})=>prepareQuoteScenario({projectId:'P1',scenario,rfq,quote,evidence,...change});
test('maps received quote to a separately versioned provisional scenario',()=>{
 const r=run();assert.equal(r.status,'provisional_quote');
 assert.equal(r.proposedScenario.id,'SIM-1:quote:ING-1');
 assert.equal(r.comparison.deliveredCostExVat,330);
 assert.equal(r.comparison.indicativeCashExposure,375);
 assert.equal(r.quoteSource.authority,'not_approved');
});
test('keeps baseline prices, dependencies and objects unchanged',()=>{
 const before=structuredClone(scenario);const r=run();
 assert.deepEqual(scenario,before);assert.notStrictEqual(r.proposedScenario.requirements,scenario.requirements);
 assert.notStrictEqual(r.proposedScenario.requirements[1].predecessors,second.predecessors);
 assert.equal(first.unitCost,null);assert.equal(second.unitCost,50);
});
test('allocates freight to both quote lines without changing VAT treatment',()=>{
 const r=run(); const [a,b]=r.proposedScenario.requirements;
 assert.equal(a.unitCost,110);assert.equal(b.unitCost,11);
 assert.equal(a.unitCost*2+b.unitCost*10,330);
 assert.equal(r.comparison.quotedVat,45);
});
test('missing valid incoming source hash blocks scenario feedback',()=>{
 assert.equal(run({evidence:{...evidence,sourceSha256:'wrong'}}).status,'blocked');
});
test('unapproved or quarantined responses cannot affect a scenario',()=>{
 assert.equal(run({rfq:{...rfq,status:'draft'}}).status,'blocked');
 assert.equal(run({quote:{...quote,status:'quarantined'}}).status,'blocked');
});
test('other projects and vendor identities are denied',()=>{
 assert.equal(run({projectId:'P2'}).status,'blocked');
 assert.equal(run({quote:{...quote,vendorId:'OTHER'}}).status,'blocked');
});
test('currency mismatch requires an explicit FX review',()=>{
 assert.equal(run({evidence:{...evidence,quotedCurrency:'USD'}}).status,'blocked');
});
test('missing and duplicate quote lines fail closed',()=>{
 assert.equal(run({quote:{...quote,items:quote.items.slice(0,1)}}).status,'blocked');
 assert.equal(run({quote:{...quote,items:[quote.items[0],quote.items[0]]}}).status,'blocked');
});
test('quantity or units changed by vendor cannot be silently accepted',()=>{
 assert.equal(run({quote:{...quote,items:[{...quote.items[0],quantity:3},quote.items[1]]}}).status,'blocked');
 assert.equal(run({quote:{...quote,items:[{...quote.items[0],unit:'ton'},quote.items[1]]}}).status,'blocked');
});
test('non-finite line extensions are blocked without misreporting profit',()=>{
 assert.equal(run({quote:{...quote,items:[{...quote.items[0],price:1e308},quote.items[1]]}}).status,'blocked');
});
test('zero-value quote lines still allocate known delivery',()=>{
 const zero={...quote,items:quote.items.map(x=>({...x,price:0}))};
 const r=run({quote:zero});assert.equal(r.status,'provisional_quote');
 assert.equal(r.proposedScenario.requirements[0].unitCost,7.5);
 assert.equal(r.proposedScenario.requirements[1].unitCost,1.5);
});
test('missing freight or VAT values block cash exposure claims',()=>{
 assert.equal(run({quote:{...quote,delivery:null}}).status,'blocked');
 assert.equal(run({quote:{...quote,vat:null}}).status,'blocked');
});

test('cross-project scenario cannot be quoted even with a matching RFQ',()=>{
 assert.equal(run({scenario:{...scenario,projectId:'OTHER'}}).status,'blocked');
});
test('expired or impossible quote validity dates block scenario feedback',()=>{
 for(const validUntil of ['2020-01-01','2026-02-30',''])
   assert.equal(run({evidence:{...evidence,validUntil}}).status,'blocked');
});
