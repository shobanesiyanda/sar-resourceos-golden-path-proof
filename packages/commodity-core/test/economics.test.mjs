import test from "node:test";
import assert from "node:assert/strict";
import { calculateDealRun } from "../src/economics.ts";

const valid = {
  commodity: "Chrome concentrate", currency: "ZAR", stage: "saleable_product",
  sourceTonnes: 100, yieldPct: null, buyerPricePerSaleableTonne: 3000,
  acquisitionCostPerSourceTonne: 2200, sourceTransportPerSourceTonne: 50,
  processingCostPerSourceTonne: 0, destinationTransportPerSaleableTonne: 200,
  handlingPerSaleableTonne: 40, feedstockAssayTotal: 0, concentrateAssayTotal: 500,
  financeCostTotal: 1000, otherDirectCostsTotal: 0, targetNetMarginPct: 10,
  priceSource: "buyer PO provided by user", priceAsOf: "2026-10-22",
};
test("qualifies positive economics above target (still unverified)", () => {
  const r = calculateDealRun(valid);
  assert.equal(r.state, "qualified");
  assert.equal(r.revenue, 300000);
  assert.equal(r.directCost, 250500);
  assert.equal(r.netProfitBeforeTax, 49500);
  assert.equal(r.netMarginPct, 16.5);
});
test("raw material yield adjusts SALEABLE quantity, not metallurgical recovery", () => {
  const r = calculateDealRun({...valid,stage:"raw_feedstock",sourceTonnes:200,yieldPct:50});
  assert.equal(r.saleableTonnes,100);
  assert.equal(r.revenue,300000);
});
test("missing price provenance never qualifies", () => {
  const r = calculateDealRun({...valid,priceSource:""});
  assert.equal(r.state, "incomplete");
});
test("negative margins never pass, regardless of target", () => {
  const r = calculateDealRun({...valid,acquisitionCostPerSourceTonne:4000,targetNetMarginPct:0});
  assert.equal(r.state,"rejected");
});
test("negative costs fail closed", () => {
  const r = calculateDealRun({...valid, financeCostTotal:-500});
  assert.equal(r.state, "incomplete");
});
test("raw material without yield fails closed", () => {
  const r = calculateDealRun({...valid,stage:"raw_feedstock",yieldPct:null});
  assert.equal(r.state, "incomplete");
});
