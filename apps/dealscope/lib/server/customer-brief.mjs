/** DealScope proprietary output security boundary.
 * An internal assessment candidate MUST NEVER be serialized directly to HTTP/PDF.
 * Customer receives only explicitly allowlisted, bounded result fields.
 */
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const numberOrNull=n=>finite(n)?n:null;
const short=s=>typeof s==='string'?s.slice(0,300):'';
const list=a=>Array.isArray(a)?a.slice(0,30):[];
const candidateStates=new Set(['fact_conflicts','specialist_input_invalid','specialist_pending',
 'route_choice_required','provisional_partial','provisional_assessment','needs_facts']);
export function toCustomerDecisionBrief({assessmentId,caseId,candidate}){
 if(!assessmentId||!caseId||!candidate||!candidateStates.has(candidate.state))
   throw new Error('internal_assessment_result_not_publishable');
 const o=candidate.outputs||{};
 const outputs={
   gradeAlternatives:list(o.gradeAlternatives).map(x=>({
    feedstockGradeCr2o3Pct:numberOrNull(x.feedstockGradeCr2o3Pct),
    requiredDryTonnes:numberOrNull(x.requiredDryTonnes),
    confidence:'conditional_plant_performance'})),
   routeOptions:list(o.routeOptions).map(x=>({code:short(x.code),label:short(x.label)})),
   freightBudget:o.freightBudget&&finite(o.freightBudget.estimatedZarPerDryT)?{
    estimatedZarPerDryT:o.freightBudget.estimatedZarPerDryT,
    estimatedTrips:numberOrNull(o.freightBudget.estimatedTrips),state:'indicative'}:null,
   purchaseCeiling:Array.isArray(o.purchaseCeiling)?list(o.purchaseCeiling).map(x=>({
    feedstockGradeCr2o3Pct:numberOrNull(x.feedstockGradeCr2o3Pct),
    maximumPurchaseZarPerDryT:numberOrNull(x.maximumPurchaseZarPerDryT),
    status:['conditional','insufficient_cost_evidence','unviable_at_target'].includes(x.status)?x.status:'insufficient_cost_evidence'})):null,
   directTrade:o.directTrade?{
    minimumProductDryTonnes:numberOrNull(o.directTrade.minimumProductDryTonnes),
    availableSourceDryTonnes:numberOrNull(o.directTrade.availableSourceDryTonnes),
    estimatedSaleableDryTonnes:numberOrNull(o.directTrade.estimatedSaleableDryTonnes),
    maximumPurchaseZarPerDryT:numberOrNull(o.directTrade.maximumPurchaseZarPerDryT),
    quantityBasis:short(o.directTrade.quantityBasis),
    status:['provisional','conditional_purchasing_ceiling'].includes(o.directTrade.status)?o.directTrade.status:'provisional'}:null,
   sourceOfferPosition:o.sourceOfferPosition?{
    state:['conditional_market_position','not_viable_at_target'].includes(o.sourceOfferPosition.state)?o.sourceOfferPosition.state:'insufficient_evidence',
    targetSaleBasis:short(o.sourceOfferPosition.targetSaleBasis),
    maximumPurchaseZarPerDryT:numberOrNull(o.sourceOfferPosition.maximumPurchaseZarPerDryT),
    supplierAskingZarPerDryT:numberOrNull(o.sourceOfferPosition.supplierAskingZarPerDryT),
    provisionalMarginPct:numberOrNull(o.sourceOfferPosition.provisionalMarginPct),
    comparableMarketZarPerDryT:numberOrNull(o.sourceOfferPosition.comparableMarketZarPerDryT),
    priceEvidence:{sourceId:'Dated market reference (source rights restricted)',
      observedOn:short(o.sourceOfferPosition.priceEvidence?.observedOn)}
   }:null
 };
 const missingFacts=list(candidate.missingFacts).map(short);
 const nextActions=list(candidate.nextActions).map(x=>({code:short(x.code),description:short(x.description)}));
 const limitations=['Customer-submitted facts are not independently verified.',
   'Calculations are indicative, not a buyer commitment or authorization to trade.',
   'Prices and rates are conditional on dated, permitted reference evidence.'];
 const brief={assessmentId:short(assessmentId),caseId:short(caseId),
  state:candidate.state,decisionState:'provisional_not_executable',
  evidenceState:'customer_reported_unverified',missingFacts,nextActions,outputs,
  limitations,reportIssued:false,assessmentKind:'provisional',executionPermitted:false};
 return brief;
}
