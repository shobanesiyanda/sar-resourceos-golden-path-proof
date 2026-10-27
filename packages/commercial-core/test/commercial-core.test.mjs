import test from "node:test";
import assert from "node:assert/strict";
import {exportParity} from "../src/pricing.ts";
import {assessCandidate} from "../src/screening.ts";
const parity={currency:"USD",fxZarPerUsd:18,cifChinaPerTonne:200,oceanPerTonne:30,
 marineInsurancePerTonne:2,portPerTonne:8,inlandPerTonne:12,
 handlingPerTonne:3,assayPerTonne:1,financePerTonne:2,otherRoutePerTonne:4,
 buyerPricePerTonne:null,source:"dated indicative evidence",asOf:"2026-10-20"};
const deal={id:"D1",tenantId:"T1",currency:"ZAR",acquisitionCost:700,
 additionalDirectCosts:80,financingCost:20,buyerRevenue:1000,requiredNetMarginPct:10,
 priceSource:"confirmed buyer PO",buyerVerified:true,materialVerified:true,
 acquisitionAvailabilityVerified:true,priceValidUntil:"2099-01-01",capitalCeiling:800};
test("CIF to FOB to FOT in ZAR",()=>{
 const r=exportParity(parity);
 assert.equal(r.state,"indicative");assert.equal(r.cifZar,3600);
 assert.equal(r.fobZar,3024);assert.equal(r.fotZar,2484);
});
test("export parity must never manufacture a buyer PO",()=>assert.equal(exportParity(parity).confirmedBuyerPriceZar,null));
test("missing source or FX invalidates calculation",()=>{
 assert.equal(exportParity({...parity,source:""}).state,"incomplete");
 assert.equal(exportParity({...parity,fxZarPerUsd:0}).state,"incomplete");
});
test("impossible and future as-of dates fail without throwing",()=>{
 for(const asOf of ["2026-02-30","2099-01-01","garbage",undefined]){
 assert.equal(exportParity({...parity,asOf}).state,"incomplete");
 }
});
test("valid profit candidate visible to owner tenant only",()=>{
 assert.equal(assessCandidate(deal,"T1").visibility,"qualified");
 assert.equal(assessCandidate(deal,"T2").visibility,"denied");
});
test("break-even, loss and below-target opportunities are rejected",()=>{
 for(const patch of [{acquisitionCost:900},{acquisitionCost:1100},{requiredNetMarginPct:25}]){
 assert.equal(assessCandidate({...deal,...patch},"T1").visibility,"rejected");
 }
});
test("verification or capital limits block publication",()=>{
 assert.equal(assessCandidate({...deal,buyerVerified:false},"T1").visibility,"rejected");
 assert.equal(assessCandidate({...deal,capitalCeiling:500},"T1").visibility,"rejected");
});
test("malformed expiry is rejected without an exception",()=>{
 for(const priceValidUntil of ["bogus","2026-02-30",""]){
 assert.equal(assessCandidate({...deal,priceValidUntil},"T1").visibility,"rejected");
 }
});
test("derived overflow never presents an opportunity",()=>{
 assert.equal(assessCandidate({...deal,buyerRevenue:1e308,additionalDirectCosts:1e308,financingCost:1e308},"T1").visibility,"rejected");
});
test("future price validity does not imply a real buyer commitment",()=>{
 assert.equal(assessCandidate({...deal,buyerVerified:false,priceValidUntil:"2099-01-01"},"T1").visibility,"rejected");
});
