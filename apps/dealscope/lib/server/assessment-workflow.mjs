/**
 * DealScope protected assessment orchestration — source-only until SAR-owned
 * Auth, storage, market adapters, issuance and entitlement gates are accepted.
 * Never import into a client component. Customer facts are assertions, NOT
 * independent verification. This module produces a candidate decision brief.
 */
import {reconcileDealFacts} from "./deal-facts.mjs";
import {buildChromeFeedstockScenarios,estimateRoadHaulage,acquisitionCeiling} from "./chrome-route-engine.mjs";
import {assessSourceResalePosition} from "./source-offer-engine.mjs";

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
 const route=value(known,"fulfilment_route");
 if(!["direct_trade","process_feedstock","own_stock"].includes(route)){
  return safe("route_choice_required",known,facts.missing,[],{
   gradeAlternatives:[],freightBudget:null,purchaseCeiling:null,
   routeOptions:[
    {code:"direct_trade",label:"Purchase and resell material in the same form"},
    {code:"process_feedstock",label:"Procure feedstock, process, then supply the product"},
    {code:"own_stock",label:"Fulfil using existing stock or owned production"}
   ]},[...nextActions,task("choose_fulfilment_route","Select a route before producing process-dependent quantities or purchase guidance")]);
 }
 if(route==="direct_trade"||route==="own_stock"){
  const qty=entryPoint==="sale_contract"?value(known,"buyer_quantity_dry_t"):value(known,"feedstock_quantity_dry_t");
  const gradePct=entryPoint==="sale_contract"?value(known,"buyer_product_grade_pct"):value(known,"feedstock_grade_pct");
  const outputs={gradeAlternatives:[],freightBudget:null,purchaseCeiling:null,
   directTrade:{minimumProductDryTonnes:entryPoint==="sale_contract"&&positive(qty)?qty:null,
    availableSourceDryTonnes:entryPoint==="source_offer"&&positive(qty)?qty:null,
    estimatedSaleableDryTonnes:null,
    productGradeCr2o3Pct:positive(gradePct)?gradePct:null,
    maximumPurchaseZarPerDryT:null,quantityBasis:"excludes losses and contract allowances",status:"provisional"}};
  if(referenceData.haulage){
   const freight=estimateRoadHaulage(referenceData.haulage);
   if(freight.state==="indicative_budget")outputs.freightBudget={state:"indicative",
    estimatedZarPerDryT:freight.budgetZarPerDryT,estimatedTotalZar:freight.totalBudgetZar,
    estimatedTrips:freight.trips,binding:false};
  }
  const retention=referenceData.directTradeRetentionPct;
  if(positive(qty)&&positive(retention)&&retention<=100){
   if(entryPoint==="sale_contract"){
    outputs.directTrade.minimumProductDryTonnes=Math.ceil(qty/(retention/100)*100)/100;
    outputs.directTrade.quantityBasis="required source quantity conditional on documented direct-route retention";
   }else{
    outputs.directTrade.estimatedSaleableDryTonnes=Math.round(qty*retention)/100;
    outputs.directTrade.quantityBasis="saleable estimate from available source quantity and documented retention";
   }
  }else nextActions.push(task("confirm_quantity_allowance","Confirm loading, moisture and handling allowances before finalising saleable or procurement quantity"));
  const costs=referenceData.costs?.routeCostsComplete===true?referenceData.costs:null;
  const salePrice=value(known,"buyer_price_zar_per_dry_t");
  if(route==="direct_trade"&&entryPoint==="sale_contract"&&positive(qty)&&positive(salePrice)&&
   positive(retention)&&retention<=100&&costs&&outputs.freightBudget){
   const quote=acquisitionCeiling({saleProductDryT:qty,priceZarPerDryT:salePrice,
    feedstockDryT:outputs.directTrade.minimumProductDryTonnes,
    totalTransportZar:outputs.freightBudget.estimatedTotalZar,
    processingZar:costs.processingZar,otherDirectZar:costs.otherDirectZar,
    financeZar:costs.financeZar,targetNetMarginPct:costs.targetNetMarginPct});
   if(quote.state==="calculated_ceiling"){
    outputs.directTrade.maximumPurchaseZarPerDryT=quote.maxFeedstockPriceZarPerDryT;
    outputs.directTrade.status="conditional_purchasing_ceiling";
   }
  }
  if(entryPoint==="source_offer"&&route==="direct_trade"){
   const position=assessSourceResalePosition({
    sourceDryTonnes:qty,sourceCr2o3Pct:gradePct,
    sourceOfferZarPerDryT:value(known,"source_purchase_price_zar_per_dry_t"),
    commodity,materialForm:value(known,"material_form"),
    deliveryBasis:referenceData.targetSaleBasis,
    sourceRetentionPct:referenceData.directTradeRetentionPct,
    marketEvidence:referenceData.saleBenchmark,
    costEvidence:referenceData.sourceOfferCosts,
    assessmentDate:referenceData.assessmentDate
   });
   if(position.valuationIssued){
    outputs.sourceOfferPosition={state:position.state,
     targetSaleBasis:referenceData.targetSaleBasis,
     maximumPurchaseZarPerDryT:position.maximumAcquisitionZarPerDryT,
     supplierAskingZarPerDryT:position.supplierAskingZarPerDryT,
     provisionalNetZar:position.provisionalNetZar,
     provisionalMarginPct:position.provisionalMarginPct,
     comparableMarketZarPerDryT:position.marketReferenceZarPerDryT,
     priceEvidence:position.priceEvidence,confidence:"indicative_not_executable"};
   }else nextActions.push(task("source_offer_valuation_evidence",position.reason));
  }
  if(route==="own_stock")nextActions.push(task("verify_stock_title","Confirm lawful ownership, storage conditions and actual releasable stock"));
  else if(entryPoint==="sale_contract"&&outputs.directTrade.maximumPurchaseZarPerDryT===null)nextActions.push(task("confirm_direct_trade_costs","Confirm buyer price, product retention, full delivery costs and funding to establish a buying ceiling"));
  return safe("provisional_partial",known,facts.missing,[],outputs,nextActions);
 }
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
 const costs=referenceData.costs?.routeCostsComplete===true ? referenceData.costs : null;
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
