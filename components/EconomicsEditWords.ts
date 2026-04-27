import { EditForm } from "./EconomicsEditTypes";

export const COMMODITY_CLASS_OPTIONS: string[] = [
  "Hard Commodities",
  "Soft Commodities",
];

export const HARD_GROUP_OPTIONS: string[] = [
  "Ferrous Metals",
  "Non-Ferrous Metals",
  "Precious Metals",
  "Energy Minerals",
  "Battery / Critical Minerals",
  "Industrial Minerals",
];

export const SOFT_GROUP_OPTIONS: string[] = [
  "Grains",
  "Oilseeds",
  "Livestock",
  "Sugar",
  "Coffee / Cocoa",
  "Agricultural Inputs",
  "Other Soft Commodities",
];

export function groupOptionsForClass(commodityClass: string): string[] {
  if (commodityClass === "Soft Commodities") return SOFT_GROUP_OPTIONS;
  return HARD_GROUP_OPTIONS;
}

function isSoftCommodity(commodityClass: string) {
  return commodityClass === "Soft Commodities";
}

function isCoalProduct(resource: string) {
  return resource === "Coal";
}

export function stageWords(form: EditForm) {
  if (isSoftCommodity(form.commodityClass)) {
    return {
      feedstockCostLabel: "Product Acquisition Cost / Product Unit",
      feedstockCostHelp: "Purchase or acquisition cost per traded product unit or ton.",
      transportLabel: "Logistics / Handling Cost / Product Unit",
      transportHelp: "Transport, storage, handling, loading or delivery cost per product unit or ton.",
      tollingLabel: "Processing / Packaging Cost / Product Unit",
      tollingHelp: "Processing, packaging, cleaning, grading or conversion cost per product unit or ton.",
      feedstockAssayLabel: "Quality / Compliance Verification Cost / Batch",
      feedstockAssayHelp: "Quality, grading, origin, certificate or compliance verification cost per batch.",
      finalAssayLabel: "Final Quality Confirmation Cost / Batch",
      finalAssayHelp: "Final quality, grading, moisture, certificate or acceptance confirmation cost per batch.",
      routeCostLabel: "Product Route Cost Before Verification",
      feedstockCostPreview: "Product Acquisition Cost",
      transportPreview: "Logistics / Handling Cost",
      tollingPreview: "Processing / Packaging Cost",
      feedstockAssayPreview: "Quality / Compliance Verification Cost",
      finalAssayPreview: "Final Quality Confirmation Cost",
      batchLabel: "Quality / Verification Batches",
      finalBatchLabel: "Final Quality Batches",
      routeTonsLabel: "Route Product Units",
      routeTonsNote: "Soft commodity saleable basis = product units",
    };
  }

  if (isCoalProduct(form.resource) && form.stage !== "raw_feedstock") {
    return {
      feedstockCostLabel: "Coal Product Acquisition Cost / Ton",
      feedstockCostHelp: "Supplier purchase cost per saleable coal product ton.",
      transportLabel: "Coal Transport / Handling Cost / Ton",
      transportHelp: "Transport, siding, loading, handling or delivery cost per coal product ton.",
      tollingLabel: "Blending / Screening Cost / Ton",
      tollingHelp: "Optional blending, screening or upgrade cost per coal product ton. Use 0 if already saleable.",
      feedstockAssayLabel: "Coal Quality / Product Verification Cost / Batch",
      feedstockAssayHelp: "Coal quality verification cost per batch, including CV, ash, sulphur, moisture and sizing where applicable.",
      finalAssayLabel: "Final Coal Quality Confirmation Cost / Batch",
      finalAssayHelp: "Final buyer/spec confirmation or certificate cost per coal batch.",
      routeCostLabel: "Coal Route Cost Before Quality Verification",
      feedstockCostPreview: "Coal Product Acquisition Cost",
      transportPreview: "Coal Transport / Handling",
      tollingPreview: "Blending / Screening Cost",
      feedstockAssayPreview: "Coal Quality Verification Cost",
      finalAssayPreview: "Final Coal Quality Cost",
      batchLabel: "Coal Quality Batches",
      finalBatchLabel: "Final Coal Verification Batches",
      routeTonsLabel: "Route Product Tons",
      routeTonsNote: "Saleable coal product basis = product tons",
    };
  }

  if (form.stage === "finished_product") {
    return {
      feedstockCostLabel: "Acquisition Cost / Product Ton",
      feedstockCostHelp: "Purchase or acquisition cost per finished product ton. Use 0 only if acquisition cost is handled outside this route model.",
      transportLabel: "Transport / Security / Handling Cost / Product Ton",
      transportHelp: "Transport, security, handling, custody or delivery cost per finished product ton.",
      tollingLabel: "Refining / Processing Cost / Product Ton",
      tollingHelp: "Refining, processing or conversion cost per finished product ton. Use 0 if no further processing applies.",
      feedstockAssayLabel: "Source / Ownership Verification Cost / Batch",
      feedstockAssayHelp: "Verification, source-of-funds, ownership, custody or authentication cost per batch.",
      finalAssayLabel: "Final Assay / Purity Verification Cost / Batch",
      finalAssayHelp: "Final assay, purity, certificate, refinery, verification or quality confirmation cost per batch.",
      routeCostLabel: "Product Route Cost Before Verification",
      feedstockCostPreview: "Acquisition Cost",
      transportPreview: "Transport / Security / Handling",
      tollingPreview: "Refining / Processing",
      feedstockAssayPreview: "Source Verification Cost",
      finalAssayPreview: "Final Purity Verification Cost",
      batchLabel: "Source / Verification Batches",
      finalBatchLabel: "Final Verification Batches",
      routeTonsLabel: "Route Product Tons",
      routeTonsNote: "Finished product basis = product tons",
    };
  }

  if (form.stage === "intermediate_concentrate") {
    return {
      feedstockCostLabel: "Product Acquisition Cost / Product Ton",
      feedstockCostHelp: "Acquisition cost per saleable intermediate product ton. Use 0 if cost is handled outside this model.",
      transportLabel: "Transport / Handling Cost / Product Ton",
      transportHelp: "Transport, loading, handling or delivery cost per saleable product ton.",
      tollingLabel: "Additional Processing Cost / Product Ton",
      tollingHelp: "Additional processing, upgrade or blending cost per product ton. Use 0 if already saleable.",
      feedstockAssayLabel: "Product Verification Cost / Batch",
      feedstockAssayHelp: "Source, grade or product verification cost per batch.",
      finalAssayLabel: "Final Product Quality Cost / Batch",
      finalAssayHelp: "Final product assay, certificate or quality confirmation cost per batch.",
      routeCostLabel: "Product Route Cost Before Verification",
      feedstockCostPreview: "Product Acquisition Cost",
      transportPreview: "Transport / Handling Cost",
      tollingPreview: "Additional Processing Cost",
      feedstockAssayPreview: "Product Verification Cost",
      finalAssayPreview: "Final Product Quality Cost",
      batchLabel: "Product Verification Batches",
      finalBatchLabel: "Final Product Quality Batches",
      routeTonsLabel: "Route Product Tons",
      routeTonsNote: "Saleable product basis = product tons",
    };
  }

  return {
    feedstockCostLabel: "Feedstock Cost / Feedstock Ton",
    feedstockCostHelp: "Cost per required feedstock ton.",
    transportLabel: "Transport To Plant Cost / Feedstock Ton",
    transportHelp: "Transport cost per required feedstock ton.",
    tollingLabel: "Tolling / Processing Cost / Feedstock Ton",
    tollingHelp: "Plant tolling, washing, processing or beneficiation cost per required feedstock ton.",
    feedstockAssayLabel: "Feedstock Assay Cost / Batch",
    feedstockAssayHelp: "ROM, ore, tailings or feedstock assay cost per batch.",
    finalAssayLabel: "Final Product Assay Cost / Batch",
    finalAssayHelp: "Final product assay, verification or quality cost per batch.",
    routeCostLabel: "Route Cost Before Assay",
    feedstockCostPreview: "Feedstock Cost",
    transportPreview: "Transport Cost",
    tollingPreview: "Tolling / Processing Cost",
    feedstockAssayPreview: "Feedstock Assay Cost",
    finalAssayPreview: "Final Product Assay Cost",
    batchLabel: "Feedstock Assay Batches",
    finalBatchLabel: "Final Product Assay Batches",
    routeTonsLabel: "Feedstock Required",
    routeTonsNote: "Raw feedstock uses yield recovery",
  };
        }
