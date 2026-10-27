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

test("invalid, impossible or future price reference dates never qualify", () => {
  for (const priceAsOf of ["not-a-date", "2026-02-30", "2099-01-01", ""]) {
    const result = calculateDealRun({...valid, priceAsOf});
    assert.equal(result.state, "incomplete", priceAsOf);
  }
});
test("derived arithmetic overflow cannot be classified as a profitable deal", () => {
  const result = calculateDealRun({
    ...valid, sourceTonnes: 1e308, buyerPricePerSaleableTonne: 1e308,
  });
  assert.equal(result.state, "incomplete");
  assert.ok(result.reasons.some(reason => reason.includes("numeric range")));
  assert.equal(result.revenue, 0);
});
test("unsupported material stage and currency fail closed", () => {
  assert.equal(calculateDealRun({...valid, stage: "unknown"}).state, "incomplete");
  assert.equal(calculateDealRun({...valid, currency: "???"}).state, "incomplete");
});
test("finished product cannot carry a hidden processing yield", () => {
  assert.equal(calculateDealRun({...valid, stage: "saleable_product", yieldPct: 50}).state, "incomplete");
});
