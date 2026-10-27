import test from 'node:test';
import assert from 'node:assert/strict';
import {compareSupplierOffers} from '../src/supplier-comparison.mjs';
const rfq={id:'R1',version:1,status:'approved_for_dispatch',currency:'ZAR',
  recipients:['V1','V2'],lines:[{requirementId:'M1',quantity:2,unit:'machine'}]};
const offer=(vendorId,price,extra={})=>({quote:{rfqId:'R1',status:'under_review',vendorId,
 messageId:'MSG-'+vendorId,items:[{requirementId:'M1',quantity:2,unit:'machine',price}],delivery:100,vat:0},
 sourceSha256:'a'.repeat(64),conditions:{validUntil:'2099-12-31',leadDays:5,depositPct:20,
 technicalComplianceReviewed:true},...extra});
const run=(offers,change={})=>compareSupplierOffers({rfq,offers,asOf:'2026-10-27',...change});
test('compares two like-for-like quotes by landed cost',()=>{
 const r=run([offer('V1',300),offer('V2',250)]);
 assert.equal(r.status,'provisional_comparison');assert.deepEqual(r.ranked.map(x=>x.vendorId),['V2','V1']);
 assert.equal(r.ranked[0].costExVat,600);assert.equal(r.awardAuthorised,false);
});
test('a faster lead time is a tiebreaker, not a fabricated price discount',()=>{
 const slower=offer('V1',300,{conditions:{...offer('V1',300).conditions,leadDays:11}});
 const faster=offer('V2',300);
 assert.deepEqual(run([slower,faster]).ranked.map(x=>x.vendorId),['V2','V1']);
});
test('returns zero valid offers without padding with rejected vendors',()=>{
 const item=offer('V1',100);item.quote.status='quarantined';
 const r=run([item]);assert.equal(r.status,'no_qualifying_offers');
 assert.equal(r.ranked.length,0);assert.equal(r.excluded.length,1);
});
test('past validity dates and missing technical review reject only affected vendor',()=>{
 const a=offer('V1',100,{conditions:{...offer('V1',100).conditions,validUntil:'2026-01-01'}});
 const b=offer('V2',200,{conditions:{...offer('V2',200).conditions,technicalComplianceReviewed:false}});
 const r=run([a,b]);assert.equal(r.ranked.length,0);assert.equal(r.excluded.length,2);
});
test('a foreign or duplicate vendor is not published as eligible',()=>{
 const a=offer('NOT-ON-RFQ',100);
 const r=run([a,offer('V1',200),offer('V1',210)]);
 assert.equal(r.ranked.length,1);assert.equal(r.excluded.length,2);
});
test('quote line quantity and units must match approved scope',()=>{
 const a=offer('V1',100);a.quote.items[0].quantity=3;
 const b=offer('V2',100);b.quote.items[0].unit='ton';
 assert.equal(run([a,b]).ranked.length,0);
});
test('invalid deposit and lead time terms reject the quote',()=>{
 const a=offer('V1',100,{conditions:{...offer('V1',100).conditions,depositPct:150}});
 const b=offer('V2',100,{conditions:{...offer('V2',100).conditions,leadDays:-1}});
 assert.equal(run([a,b]).ranked.length,0);
});
test('nonfinite extended pricing cannot be ranked',()=>{
 assert.equal(run([offer('V1',1e308)]).status,'no_qualifying_offers');
});
test('missing scanned quotation provenance blocks comparison',()=>{
 assert.equal(run([offer('V1',100,{sourceSha256:''})]).ranked.length,0);
});
test('VAT is presented separately from supplier cost',()=>{
 const q=offer('V1',100);q.quote.vat=45;
 const r=run([q]);assert.equal(r.ranked[0].costExVat,300);
 assert.equal(r.ranked[0].cashIncludingVat,345);
});
test('invalid RFQ scope and evaluation dates fail closed',()=>{
 assert.equal(run([offer('V1',100)],{rfq:{...rfq,status:'draft'}}).status,'blocked');
 assert.equal(run([offer('V1',100)],{asOf:'2026-02-30'}).status,'blocked');
});
