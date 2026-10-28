/** Private chrome engineering candidate. Never import into a client component. */
const good = v => typeof v==='number' && Number.isFinite(v) && v>0;
const round = n => Math.round(n*100)/100;
const blocked = (reason,missing=[]) => ({state:'blocked',reason,missing});
/** Illustrative mass balance from Cr2O3 grade and Cr2O3 recovery, not plant guarantees. */
export function buildChromeFeedstockScenarios({targetProductDryT,productCr2o3Pct,feedGradesCr2o3Pct,recoveryPct,recoveryEvidence}) {
  if (!good(targetProductDryT)||!good(productCr2o3Pct)||productCr2o3Pct>100||
      !Array.isArray(feedGradesCr2o3Pct)||feedGradesCr2o3Pct.length<1||feedGradesCr2o3Pct.length>30||
      feedGradesCr2o3Pct.some(v=>!good(v)||v>100)) return blocked('Missing or invalid dry-tonne target or chromium grades');
  if (!good(recoveryPct) || recoveryPct>100 || !['hypothetical','plant_testwork'].includes(recoveryEvidence))
    return blocked('Recovery requires a bounded scenario or evidenced plant-testwork assumption',['recoveryPct','recoveryEvidence']);
  const candidates = feedGradesCr2o3Pct.map(feedPct=>{
    const dryFeedT = targetProductDryT*productCr2o3Pct/(feedPct*(recoveryPct/100));
    const massYieldPct = targetProductDryT/dryFeedT*100;
    return {feedGradeCr2o3Pct:feedPct,feedRequiredDryT:round(dryFeedT),massYieldPct:round(massYieldPct),
      validPhysicalBalance:massYieldPct<=100};
  });
  return {state:'scenario_only',recoveryProven:false,assumptionClass:recoveryEvidence,
    targetProductDryT, productCr2o3Pct,candidates,
    warning:'Plant performance and recoverable quantity are unverified. Independent testwork required for commercial qualification.'};
}
/** Distance and vehicle capacity generate a negotiable allowance, never a guaranteed quote. */
export function estimateRoadHaulage({dryTonnes,moisturePct,payloadWetTonnes,billableKmPerTrip,rateZarPerKm,rateBasis}) {
  if (![dryTonnes,payloadWetTonnes,billableKmPerTrip].every(good) ||
      typeof moisturePct!=='number'||!Number.isFinite(moisturePct)||moisturePct<0||moisturePct>=100)
    return blocked('Dry tonnes, billable distance, truck payload and moisture are required');
  const wetTonnes = dryTonnes/(1-moisturePct/100);
  const trips = Math.ceil(wetTonnes/payloadWetTonnes);
  if (!good(rateZarPerKm) || !['quoted','dated_market_indication'].includes(rateBasis))
    return {state:'needs_rate',wetTonnes:round(wetTonnes),trips,
      missing:['rateZarPerKm','rateBasis'],warning:'No rate or zero-cost assumption inserted'};
  const totalZar=trips*billableKmPerTrip*rateZarPerKm;
  if (!Number.isFinite(totalZar)) return blocked('Cost exceeds numeric range');
  return {state:'indicative_budget',wetTonnes:round(wetTonnes),trips,
    totalBudgetZar:round(totalZar),budgetZarPerDryT:round(totalZar/dryTonnes),
    isTransporterQuote:rateBasis==='quoted',isBinding:false};
}
/** No acquisition ceiling while any required economic component is ungrounded. */
export function acquisitionCeiling({saleProductDryT,priceZarPerDryT,feedstockDryT,
  totalTransportZar,processingZar,otherDirectZar,financeZar,targetNetMarginPct}) {
  const amounts={saleProductDryT,priceZarPerDryT,feedstockDryT,totalTransportZar,processingZar,otherDirectZar,financeZar,targetNetMarginPct};
  const missing=Object.entries(amounts).filter(([k,v])=>typeof v!=='number'||!Number.isFinite(v)|| (k==='targetNetMarginPct'?v<0||v>=100:v<0) || (['saleProductDryT','priceZarPerDryT','feedstockDryT'].includes(k)&&v===0)).map(([k])=>k);
  if (missing.length) return blocked('Insufficient substantiated economics for a purchase-price ceiling',missing);
  const revenue = saleProductDryT*priceZarPerDryT;
  const remaining = revenue*(1-targetNetMarginPct/100)-totalTransportZar-processingZar-otherDirectZar-financeZar;
  if (!Number.isFinite(remaining)) return blocked('Calculation outside numeric range');
  return {state:remaining>0?'calculated_ceiling':'not_viable_at_target',
    maxFeedstockPriceZarPerDryT:remaining>0?round(remaining/feedstockDryT):null,
    targetNetMarginPct,verifiedCommercialOffer:false};
}
