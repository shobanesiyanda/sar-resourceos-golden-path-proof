import { feed, n } from "./EconomicsBlocks";
import { MaterialStage } from "../lib/resourceDefaults";

export type EditForm = {
  commodityClass: string;
  category: string;
  resource: string;
  material: string;
  stage: MaterialStage;
  target: string;
  yield: string;
  marketPrice: string;
  negotiatedPrice: string;
  priceBasis: string;
  overrideNote: string;
  feedstock: string;
  transport: string;
  tolling: string;
  feedstockAssayRate: string;
  feedstockAssayBatches: string;
  concentrateAssayRate: string;
  concentrateAssayBatches: string;
};

export function priceEffective(marketPrice: string, negotiatedPrice: string) {
  const negotiated = n(negotiatedPrice);
  const market = n(marketPrice);
  return negotiated > 0 ? negotiated : market;
}

export function economicsCalc(form: EditForm) {
  const target = n(form.target);
  const y = n(form.yield);
  const effectivePrice = priceEffective(form.marketPrice, form.negotiatedPrice);
  const feedTons = form.stage === "raw_feedstock" ? feed(target, y) : target;

  const feedRate = n(form.feedstock);
  const transRate = n(form.transport);
  const tollRate = n(form.tolling);
  const feedAssayRate = n(form.feedstockAssayRate);
  const feedAssayBatches = n(form.feedstockAssayBatches);
  const prodAssayRate = n(form.concentrateAssayRate);
  const prodAssayBatches = n(form.concentrateAssayBatches);

  const revenue = target * effectivePrice;
  const feedCost = feedTons * feedRate;
  const transCost = feedTons * transRate;
  const tollCost = feedTons * tollRate;
  const routeCost = feedCost + transCost + tollCost;
  const feedAssayCost = feedAssayRate * feedAssayBatches;
  const prodAssayCost = prodAssayRate * prodAssayBatches;
  const assayCost = feedAssayCost + prodAssayCost;
  const surplus = revenue - routeCost - assayCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  return {
    target,
    y,
    effectivePrice,
    feedTons,
    feedRate,
    transRate,
    tollRate,
    feedAssayRate,
    feedAssayBatches,
    prodAssayRate,
    prodAssayBatches,
    revenue,
    feedCost,
    transCost,
    tollCost,
    routeCost,
    feedAssayCost,
    prodAssayCost,
    assayCost,
    surplus,
    margin,
  };
    }
