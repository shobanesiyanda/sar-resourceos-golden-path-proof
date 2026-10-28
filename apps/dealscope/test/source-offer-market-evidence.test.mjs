import test from "node:test";
import assert from "node:assert/strict";
import {assessSourceResalePosition} from "../lib/server/source-offer-engine.mjs";
import {prepareAssessmentCandidate} from "../lib/server/assessment-workflow.mjs";
const basis="FOT City Deep";
const benchmark={commodity:"chrome",materialForm:"ROM — high grade",deliveryBasis:basis,currency:"ZAR",unit:"dry_t",
 priceZarPerDryT:2300,minGradePct:38,maxGradePct:42,evidenceClass:"dated_market_indication",
 sourceId:"TEST-SYNTHETIC-PRICE-001",observedOn:"2026-10-26",validUntil:"2026-11-02"};
const input={sourceDryTonnes:500,sourceCr2o3Pct:40,sourceOfferZarPerDryT:1600,
 materialForm:"ROM — high grade",deliveryBasis:basis,commodity:"chrome",sourceRetentionPct:98,
 marketEvidence:benchmark,costEvidence:{routeCostsComplete:true,allNonAcquisitionCostsZar:100000,targetNetMarginPct:12},
 assessmentDate:"2026-10-28"};
test("source offer receives conditional market-aligned acquisition ceiling and price provenance",()=>{
 const x=assessSourceResalePosition(input);
 assert.equal(x.state,"conditional_market_position");
 assert.equal(x.saleableDryTonnes,490);
 assert.equal(x.maximumAcquisitionZarPerDryT,1783.52);
 assert.equal(x.provisionalNetZar,227000);
 assert.equal(x.provisionalMarginPct,20.14);
 assert.equal(x.priceEvidence.sourceId,"TEST-SYNTHETIC-PRICE-001");
 assert.equal(x.buyerConfirmed,false);
});
test("source offer without supplier asking price still receives a ceiling, no profit invented",()=>{
 const x=assessSourceResalePosition({...input,sourceOfferZarPerDryT:undefined});
 assert.equal(x.state,"conditional_market_position");
 assert.equal(x.provisionalNetZar,null);
 assert.equal(x.supplierAskingZarPerDryT,null);
});
test("FOT valuation cannot reuse a CIF China market quote",()=>{
 const x=assessSourceResalePosition({...input,marketEvidence:{...benchmark,deliveryBasis:"CIF China"}});
 assert.equal(x.state,"insufficient_evidence");assert.equal(x.valuationIssued,false);
});
test("quote for concentrate does not value direct ROM trading",()=>{
 const x=assessSourceResalePosition({...input,marketEvidence:{...benchmark,materialForm:"Concentrate"}});
 assert.equal(x.valuationIssued,false);
});
test("grade outside quoted band cannot receive same market valuation",()=>{
 const x=assessSourceResalePosition({...input,sourceCr2o3Pct:35});
 assert.equal(x.valuationIssued,false);
});
test("expired or future market dates block a valuation",()=>{
 for(const changed of [{validUntil:"2026-10-27"},{observedOn:"2026-10-30"},{observedOn:"invalid"}]){
  const x=assessSourceResalePosition({...input,marketEvidence:{...benchmark,...changed}});
  assert.equal(x.valuationIssued,false);
 }
});
test("no cost-completeness evidence or retention means no acquisition ceiling",()=>{
 for(const changed of [{costEvidence:{...input.costEvidence,routeCostsComplete:false}},{sourceRetentionPct:undefined}]){
  const x=assessSourceResalePosition({...input,...changed});assert.equal(x.valuationIssued,false);
 }
});
const source={sourceId:"offer1",channel:"pasted_text",facts:{
 commodity:"chrome",material_form:"ROM — high grade",commercial_role:"direct trader",
 fulfilment_route:"direct_trade",source_location:"Mine stockpile",
 feedstock_grade_pct:40,feedstock_quantity_dry_t:500,source_purchase_price_zar_per_dry_t:1600}};
const refs={assessmentDate:"2026-10-28",targetSaleBasis:basis,directTradeRetentionPct:98,
 saleBenchmark:benchmark,sourceOfferCosts:input.costEvidence};
test("submitted supplier offer connects to protected source market evaluation",()=>{
 const result=prepareAssessmentCandidate({entryPoint:"source_offer",sources:[source],referenceData:refs});
 assert.equal(result.outputs.gradeAlternatives.length,0);
 assert.equal(result.outputs.sourceOfferPosition.maximumPurchaseZarPerDryT,1783.52);
 assert.equal(result.outputs.sourceOfferPosition.provisionalMarginPct,20.14);
 assert.equal(result.outputs.sourceOfferPosition.confidence,"indicative_not_executable");
 assert.equal(result.verifiedDeal,false);
});
test("stock-led source quantity is not wrongly inverted into a procurement requirement",()=>{
 const result=prepareAssessmentCandidate({entryPoint:"source_offer",sources:[source],referenceData:refs});
 assert.equal(result.outputs.directTrade.availableSourceDryTonnes,500);
 assert.equal(result.outputs.directTrade.estimatedSaleableDryTonnes,490);
 assert.equal(result.outputs.directTrade.minimumProductDryTonnes,null);
});
test("missing sourced prices return required next action, not fabricated value",()=>{
 const result=prepareAssessmentCandidate({entryPoint:"source_offer",sources:[source],referenceData:{...refs,saleBenchmark:null}});
 assert.equal(result.outputs.sourceOfferPosition,undefined);
 assert.ok(result.nextActions.some(a=>a.code==="source_offer_valuation_evidence"));
});
test("unknown physical route does not presume washing or invent source resale valuation",()=>{
 const unknown={...source,facts:{...source.facts,fulfilment_route:"undecided"}};
 const result=prepareAssessmentCandidate({entryPoint:"source_offer",sources:[unknown],referenceData:refs});
 assert.equal(result.state,"route_choice_required");
 assert.equal(result.outputs.gradeAlternatives.length,0);
});
