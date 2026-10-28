import test from 'node:test';import assert from 'node:assert/strict';
import {toCustomerDecisionBrief as project} from '../lib/server/customer-brief.mjs';
const malicious={state:'provisional_assessment',internalWeights:{risk:0.8123},privateCostBridge:{ocean:120,port:7},modelSource:'SECRET',knownFacts:{privateBuyer:'CUSTOMER_B'},
 missingFacts:['source_assay'],nextActions:[{code:'verify',description:'Obtain an assay',privateModelWeights:[1,2]}],
 outputs:{gradeAlternatives:[{feedstockGradeCr2o3Pct:30,requiredDryTonnes:1866.67,calculationTrace:'SECRET'}],
  freightBudget:{estimatedZarPerDryT:147.06,estimatedTrips:55,hiddenTruckRate:35},
  purchaseCeiling:[{feedstockGradeCr2o3Pct:30,maximumPurchaseZarPerDryT:500,status:'conditional',privateAcquisitionBridge:999}],
  sourceOfferPosition:{state:'conditional_market_position',targetSaleBasis:'FOT',maximumPurchaseZarPerDryT:500,
    supplierAskingZarPerDryT:400,provisionalMarginPct:5,comparableMarketZarPerDryT:2400,
    priceEvidence:{sourceId:'LICENSED_PRIVATE_ID',observedOn:'2026-10-28',internalFeed:'CONFIDENTIAL'}},
  privateTenantObject:{id:'OTHER_TENANT'}}};
test('allowlisted response contains customer outcomes and material limitation',()=>{const r=project({assessmentId:'A1',caseId:'C1',candidate:malicious});assert.equal(r.outputs.gradeAlternatives[0].requiredDryTonnes,1866.67);assert.equal(r.outputs.purchaseCeiling[0].maximumPurchaseZarPerDryT,500);assert.equal(r.executionPermitted,false);assert.equal(r.limitations.length,3);});
test('internal weights, feed IDs, raw costs and other tenant facts absent at all levels',()=>{const r=project({assessmentId:'A1',caseId:'C1',candidate:malicious});const s=JSON.stringify(r);for(const forbidden of ['internalWeights','privateCostBridge','modelSource','CUSTOMER_B','LICENSED_PRIVATE_ID','calculationTrace','privateAcquisitionBridge','hiddenTruckRate','CONFIDENTIAL','OTHER_TENANT'])assert.equal(s.includes(forbidden),false,forbidden);});
test('additional unknown properties do not appear after schema changes',()=>{const r=project({assessmentId:'A1',caseId:'C1',candidate:{...malicious,newSecret:{rawSource:'DONT_LEAK'},outputs:{...malicious.outputs,newSolverField:'DONT_LEAK'}}});assert.equal(JSON.stringify(r).includes('DONT_LEAK'),false);});
test('blocked or unknown internal state cannot be serialized',()=>{for(const state of ['blocked','READY_TO_EXECUTE','PROFIT_CONFIRMED',''])assert.throws(()=>project({assessmentId:'A1',caseId:'C1',candidate:{state}}));});
test('nonfinite private calculation values are not returned as customer money',()=>{const r=project({assessmentId:'A1',caseId:'C1',candidate:{...malicious,outputs:{...malicious.outputs,freightBudget:{estimatedZarPerDryT:Infinity}}}});assert.equal(r.outputs.freightBudget,null);});
test('no raw internal source IDs in source-offer response',()=>{const r=project({assessmentId:'A1',caseId:'C1',candidate:malicious});assert.notEqual(r.outputs.sourceOfferPosition.priceEvidence.sourceId,malicious.outputs.sourceOfferPosition.priceEvidence.sourceId);});
