/**
 * Protected commodity source-offer / direct-resale economics.
 * Evidence is loaded by a trusted server adapter; no public price lookup,
 * client authentication, or executable buyer commitment is implemented here.
 */
const pos=v=>typeof v==="number"&&Number.isFinite(v)&&v>0;
const finiteNonneg=v=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
const round=v=>Math.round(v*100)/100;
const validDate=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&
  Number.isFinite(Date.parse(d+"T00:00:00Z"))&&new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d;
const reject=(reason)=>({state:"insufficient_evidence",reason,valuationIssued:false});
/**
 * No deriving an EXW/FOT procurement price from an unmatched CIF or FOB price:
 * market evidence must already be normalized on a documented comparable basis.
 */
export function assessSourceResalePosition({
  sourceDryTonnes,sourceCr2o3Pct,sourceOfferZarPerDryT,
  materialForm,deliveryBasis,commodity,sourceRetentionPct,
  marketEvidence,costEvidence,assessmentDate
}){
 if(!pos(sourceDryTonnes)||!pos(sourceCr2o3Pct)||sourceCr2o3Pct>100||
   typeof commodity!=="string"||!commodity.trim()||
   typeof materialForm!=="string"||!materialForm.trim()||
   typeof deliveryBasis!=="string"||!deliveryBasis.trim())
  return reject("Source, grade, material and delivery context required");
 if(!pos(sourceRetentionPct)||sourceRetentionPct>100)
  return reject("Verified or explicitly assumed product retention is required");
 if(sourceOfferZarPerDryT!==undefined&&sourceOfferZarPerDryT!==null&&!finiteNonneg(sourceOfferZarPerDryT))
  return reject("Invalid supplier asking price");
 if(!marketEvidence||marketEvidence.commodity!==commodity||
   marketEvidence.materialForm!==materialForm||
   marketEvidence.deliveryBasis!==deliveryBasis||
   marketEvidence.currency!=="ZAR"||marketEvidence.unit!=="dry_t"||
   !pos(marketEvidence.priceZarPerDryT)||
   !pos(marketEvidence.minGradePct)||!pos(marketEvidence.maxGradePct)||
   sourceCr2o3Pct<marketEvidence.minGradePct||sourceCr2o3Pct>marketEvidence.maxGradePct||
   !["dated_market_indication","confirmed_buyer_po"].includes(marketEvidence.evidenceClass)||
   typeof marketEvidence.sourceId!=="string"||!marketEvidence.sourceId.trim())
  return reject("No comparable sourced market price for the exact material, grade and delivery basis");
 if(!validDate(assessmentDate)||!validDate(marketEvidence.observedOn)||
    !validDate(marketEvidence.validUntil)||marketEvidence.observedOn>assessmentDate||
    marketEvidence.validUntil<assessmentDate||marketEvidence.validUntil<marketEvidence.observedOn)
  return reject("Market reference is expired, future-dated or missing a validity period");
 if(!costEvidence||costEvidence.routeCostsComplete!==true||
   !finiteNonneg(costEvidence.allNonAcquisitionCostsZar)||
   !finiteNonneg(costEvidence.targetNetMarginPct)||costEvidence.targetNetMarginPct>=100)
  return reject("All non-acquisition route and funding costs must be evidenced");
 const saleableDryTonnes=sourceDryTonnes*sourceRetentionPct/100;
 const salesZar=saleableDryTonnes*marketEvidence.priceZarPerDryT;
 const ceiling=(salesZar*(1-costEvidence.targetNetMarginPct/100)-costEvidence.allNonAcquisitionCostsZar)/sourceDryTonnes;
 if(!Number.isFinite(saleableDryTonnes)||!Number.isFinite(salesZar)||!Number.isFinite(ceiling))
  return reject("Financial results outside valid numeric range");
 const offered=sourceOfferZarPerDryT;
 const cost=offered===null||offered===undefined?null:sourceDryTonnes*offered+costEvidence.allNonAcquisitionCostsZar;
 const net=cost===null?null:salesZar-cost;
 return {state:ceiling>0?"conditional_market_position":"not_viable_at_target",
   valuationIssued:true,sourceDryTonnes:round(sourceDryTonnes),saleableDryTonnes:round(saleableDryTonnes),
   marketReferenceZarPerDryT:marketEvidence.priceZarPerDryT,
   maximumAcquisitionZarPerDryT:ceiling>0?round(ceiling):null,
   supplierAskingZarPerDryT:offered??null,
   provisionalNetZar:net===null?null:round(net),
   provisionalMarginPct:net===null?null:round(net/salesZar*100),
   priceEvidence:{sourceId:marketEvidence.sourceId,observedOn:marketEvidence.observedOn,
     validUntil:marketEvidence.validUntil,evidenceClass:marketEvidence.evidenceClass,
     deliveryBasis,materialForm,qualityBandPct:[marketEvidence.minGradePct,marketEvidence.maxGradePct]},
   caveat:"Indicative market comparability is not a buyer purchase order, verified stock or binding transaction.",
   buyerConfirmed:false,transactionVerified:false};
}
