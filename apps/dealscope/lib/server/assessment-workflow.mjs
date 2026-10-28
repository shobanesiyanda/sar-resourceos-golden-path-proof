/**
 * DealScope protected assessment orchestration — source-only until SAR-owned
 * Auth, storage, market adapters, issuance and entitlement gates are accepted.
 * Never import into a client component. Customer facts are assertions, NOT
 * independent verification. This module produces a candidate decision brief.
 */
import {reconcileDealFacts} from "./deal-facts.mjs";
import {buildChromeFeedstockScenarios,estimateRoadHaulage,acquisitionCeiling} from "./chrome-route-engine.mjs";

const clean=v=>typeof v==="string" && v.trim().length>0 && v.length<=300;
const positive=v=>typeof v==="number" && Number.isFinite(v) && v>0;
const value=(known,key)=>known[key]?.value;
const safe=(state,known,missing,conflicts,outputs,nextActions)=>({
  state,dealStatus:"provisional_unverified",knownFacts:Object.fromEntries(
    Object.entries(known).map(([key,f])=>[key,{value:f.value,evidence:"customer_asserted",sourceIds:f.sourceIds}])),
  missingFacts:missing,conflicts,outputs,nextActions,verifiedDeal:false,approvedToTrade:false
});
const task=(code,description)=>({code,description,status:"required"});
/**
 * Only trusted server adapters may supply referenceData. An HTTP client must
 * never be able to set the referenceData fields or claim trusted verification.
 */
export function prepareAssessmentCandidate({entryPoint,sources,referenceData={}}){
 const facts=reconcileDealFacts({entryPoint,sources});
 if(facts.state==="blocked")return {state:"blocked",reason:facts.reason};
 const known=facts.known;
 if(facts.conflicts.length) return safe("fact_conflicts",known,facts.missing,facts.conflicts,
   {gradeAlternatives:[],freightBudget:null,purchaseCeiling:null},[task("resolve_conflicts","Confirm conflicting source facts before assessment")]);
 const commodity=String(value(known,"commodity")||"").toLowerCase();
 const nextActions=[];
 if(facts.missing.length) nextActions.push(task("complete_critical_facts","Confirm missing transaction facts"));
 if(commodity!=="chrome")return safe("specialist_pending",known,facts.missing,[],
   {gradeAlternatives:[],freightBudget:null,purchaseCeiling:null},
   [...nextActions,task("activate_specialist","A validated commodity-specific assessment engine is required")]);
 const outputs={gradeAlternatives:[],freightBudget:null,purchaseCeiling:null};
 const quantity=value(known,"buyer_quantity_dry_t");
 const productGrade=value(known,"buyer_product_grade_pct");
 let grade;
 if(positive(quantity)&&positive(productGrade)&&entryPoint==="sale_contract"){
  const recovery=referenceData.recovery;
  grade=buildChromeFeedstockScenarios({
   targetProductDryT:quantity,productCr2o3Pct:productGrade,
   feedGradesCr2o3Pct:Array.isArray(referenceData.feedGrades)?referenceData.feedGrades:[28,29,30,31],
   recoveryPct:recovery?.pct,recoveryEvidence:recovery?.evidence
  });
  if(grade.state==="scenario_only"){
   outputs.gradeAlternatives=grade.candidates.filter(x=>x.validPhysicalBalance).map(x=>({
    feedstockGradeCr2o3Pct:x.feedGradeCr2o3Pct,requiredDryTonnes:x.feedRequiredDryT,
    confidence:"conditional_plant_performance"
   }));
  }else nextActions.push(task("verify_plant_recovery","Obtain plant-specific metallurgical recovery evidence or an expressly labelled scenario"));
 }else if(entryPoint==="source_offer"){
  nextActions.push(task("market_sale_reference","Obtain dated comparable saleable-product market evidence before calculating the resale position"));
 }
 if(referenceData.haulage){
  const h=estimateRoadHaulage(referenceData.haulage);
  if(h.state==="indicative_budget")outputs.freightBudget={
    state:"indicative",estimatedZarPerDryT:h.budgetZarPerDryT,
    estimatedTotalZar:h.totalBudgetZar,estimatedTrips:h.trips,binding:false
  };
  else nextActions.push(task("haulage_evidence","Confirm road distance, payload, moisture and a dated per-kilometre rate"));
 }else nextActions.push(task("haulage_evidence","Obtain the route and current comparable transporter-rate evidence"));
 const costs=referenceData.costs;
 if(grade?.state==="scenario_only"&&outputs.gradeAlternatives.length&&
    positive(value(known,"buyer_price_zar_per_dry_t"))&&costs&&
    outputs.freightBudget?.state==="indicative"){
  outputs.purchaseCeiling=outputs.gradeAlternatives.map(opt=>{
   const c=acquisitionCeiling({
    saleProductDryT:quantity,priceZarPerDryT:value(known,"buyer_price_zar_per_dry_t"),
    feedstockDryT:opt.requiredDryTonnes,totalTransportZar:outputs.freightBudget.estimatedTotalZar,
    processingZar:costs.processingZar,otherDirectZar:costs.otherDirectZar,
    financeZar:costs.financeZar,targetNetMarginPct:costs.targetNetMarginPct
   });
   return {feedstockGradeCr2o3Pct:opt.feedstockGradeCr2o3Pct,
    maximumPurchaseZarPerDryT:c.state==="calculated_ceiling"?c.maxFeedstockPriceZarPerDryT:null,
    status:c.state==="calculated_ceiling"?"conditional":c.state==="blocked"?"insufficient_cost_evidence":"unviable_at_target"};
  });
 }else nextActions.push(task("price_and_cost_evidence","Confirm sale-price basis, applicable direct route costs and financing before a purchasing ceiling can be issued"));
 const state=facts.missing.length?"needs_facts":outputs.purchaseCeiling?.some(x=>x.status==="conditional")?"provisional_assessment":"provisional_partial";
 return safe(state,known,facts.missing,[],outputs,nextActions);
}
