/** Shared calculation kernel. No identity, market feed, DB or payment access. */
export type CommodityStage = "raw_feedstock" | "saleable_product";

export type DealRunInput = {
  commodity: string;
  currency: string;
  stage: CommodityStage;
  sourceTonnes: number;
  yieldPct: number | null;
  buyerPricePerSaleableTonne: number;
  acquisitionCostPerSourceTonne: number;
  sourceTransportPerSourceTonne: number;
  processingCostPerSourceTonne: number;
  destinationTransportPerSaleableTonne: number;
  handlingPerSaleableTonne: number;
  feedstockAssayTotal: number;
  concentrateAssayTotal: number;
  financeCostTotal: number;
  otherDirectCostsTotal: number;
  targetNetMarginPct: number;
  priceSource: string;
  priceAsOf: string;
};

export type DealRunResult = {
  state: "qualified" | "rejected" | "incomplete";
  reasons: string[];
  sourceTonnes: number;
  saleableTonnes: number;
  revenue: number;
  directCost: number;
  grossSurplus: number;
  grossMarginPct: number;
  netProfitBeforeTax: number;
  netMarginPct: number;
  acquisitionCostCeilingPerSourceTonne: number;
};

function finiteNonNegative(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

export function calculateDealRun(input: DealRunInput): DealRunResult {
  const reasons: string[] = [];
  if (!input.commodity.trim()) reasons.push("Commodity selection is required.");
  if (!input.currency.trim()) reasons.push("Currency is required.");
  if (!finiteNonNegative(input.sourceTonnes) || input.sourceTonnes === 0) reasons.push("A positive source quantity is required.");
  if (!finiteNonNegative(input.buyerPricePerSaleableTonne) || input.buyerPricePerSaleableTonne === 0) reasons.push("A positive supported buyer price is required.");
  const costs = [
    input.acquisitionCostPerSourceTonne, input.sourceTransportPerSourceTonne,
    input.processingCostPerSourceTonne, input.destinationTransportPerSaleableTonne,
    input.handlingPerSaleableTonne, input.feedstockAssayTotal,
    input.concentrateAssayTotal, input.financeCostTotal, input.otherDirectCostsTotal,
  ];
  if (costs.some(x => !finiteNonNegative(x))) reasons.push("All direct costs must be nonnegative finite amounts.");
  if (!Number.isFinite(input.targetNetMarginPct) || input.targetNetMarginPct < 0 || input.targetNetMarginPct >= 100)
    reasons.push("Target net margin must be at least 0% and less than 100%.");
  if (input.stage === "raw_feedstock" && (input.yieldPct === null || !Number.isFinite(input.yieldPct) || input.yieldPct <= 0 || input.yieldPct > 100))
    reasons.push("Raw feedstock requires a valid mass yield between 0% and 100%.");
  if (!input.priceSource.trim() || !input.priceAsOf.trim())
    reasons.push("Buyer-price source and reference date are required before qualifying a deal.");

  const sourceTonnes = finiteNonNegative(input.sourceTonnes) ? input.sourceTonnes : 0;
  const ratio = input.stage === "saleable_product" ? 1 : Number(input.yieldPct || 0) / 100;
  const saleableTonnes = sourceTonnes * ratio;
  if (reasons.length || saleableTonnes <= 0) {
    return { state: "incomplete", reasons, sourceTonnes, saleableTonnes, revenue: 0, directCost: 0,
      grossSurplus: 0, grossMarginPct: 0, netProfitBeforeTax: 0, netMarginPct: 0,
      acquisitionCostCeilingPerSourceTonne: 0 };
  }
  const revenue = saleableTonnes * input.buyerPricePerSaleableTonne;
  const acquisitionCost = sourceTonnes * input.acquisitionCostPerSourceTonne;
  const sourceTransport = sourceTonnes * input.sourceTransportPerSourceTonne;
  const processing = sourceTonnes * input.processingCostPerSourceTonne;
  const destinationTransport = saleableTonnes * input.destinationTransportPerSaleableTonne;
  const handling = saleableTonnes * input.handlingPerSaleableTonne;
  const lab = input.feedstockAssayTotal + input.concentrateAssayTotal;
  const grossCost = acquisitionCost + sourceTransport + processing + destinationTransport + handling + lab;
  const grossSurplus = revenue - grossCost;
  const directCost = grossCost + input.financeCostTotal + input.otherDirectCostsTotal;
  const netProfitBeforeTax = revenue - directCost;
  const netMarginPct = revenue > 0 ? netProfitBeforeTax / revenue * 100 : 0;
  const grossMarginPct = revenue > 0 ? grossSurplus / revenue * 100 : 0;
  const nonAcquisition = directCost - acquisitionCost;
  const acquisitionCostCeilingPerSourceTonne = Math.max(0, (revenue * (1 - input.targetNetMarginPct / 100) - nonAcquisition) / sourceTonnes);
  if (netProfitBeforeTax <= 0) reasons.push("Not profitable after direct and finance costs.");
  if (netMarginPct < input.targetNetMarginPct) reasons.push("Net margin below target.");
  return { state: reasons.length ? "rejected" : "qualified", reasons, sourceTonnes, saleableTonnes,
    revenue, directCost, grossSurplus, grossMarginPct, netProfitBeforeTax, netMarginPct,
    acquisitionCostCeilingPerSourceTonne };
}
