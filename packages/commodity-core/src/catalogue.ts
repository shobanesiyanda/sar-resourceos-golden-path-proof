export type ProductCatalogueRow = {
  product_code: string;
  commodity_class: string;
  category: string;
  resource: string;
  material_type: string;
  material_stage: string;
  unit_of_measure: string;
  terminology_family: string | null;

  quantity_label: string | null;
  route_quantity_label: string | null;
  market_price_label: string | null;
  negotiated_price_label: string | null;
  acquisition_cost_label: string | null;
  logistics_cost_label: string | null;
  processing_cost_label: string | null;
  verification_cost_label: string | null;

  source_label: string | null;
  storage_label: string | null;
  quality_label: string | null;
  delivery_label: string | null;

  is_active?: boolean | null;
};

export type ProductCatalogueOption = {
  productCode: string;
  commodityClass: string;
  category: string;
  resource: string;
  materialType: string;
  materialStage: string;
  unitOfMeasure: string;
  terminologyFamily: string;

  quantityLabel: string;
  routeQuantityLabel: string;
  marketPriceLabel: string;
  negotiatedPriceLabel: string;
  acquisitionCostLabel: string;
  logisticsCostLabel: string;
  processingCostLabel: string;
  verificationCostLabel: string;

  sourceLabel: string;
  storageLabel: string;
  qualityLabel: string;
  deliveryLabel: string;
};

export const fallbackProductCatalogue: ProductCatalogueOption[] = [
  {
    productCode: "PRD-CHR-ROM-3032",
    commodityClass: "Hard Commodities",
    category: "Chrome",
    resource: "Chrome",
    materialType: "Chrome ROM / Tailings 30-32%",
    materialStage: "raw_feedstock",
    unitOfMeasure: "ton",
    terminologyFamily: "chrome_raw_feedstock",
    quantityLabel: "Feedstock / ROM Tons",
    routeQuantityLabel: "Feedstock Route Tons",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Feedstock Cost / Ton",
    logisticsCostLabel: "Transport to Plant Cost / Ton",
    processingCostLabel: "Tolling / Processing Cost / Ton",
    verificationCostLabel: "Assay / Verification Cost",
    sourceLabel: "Supplier / Feedstock Source",
    storageLabel: "Stockpile / Loading Point",
    qualityLabel: "Feedstock Grade / Cr2O3 Evidence",
    deliveryLabel: "Wash Plant / Delivery Point",
  },
  {
    productCode: "PRD-CHR-CON-4244",
    commodityClass: "Hard Commodities",
    category: "Chrome",
    resource: "Chrome",
    materialType: "Chrome Concentrate 42-44%",
    materialStage: "saleable_product",
    unitOfMeasure: "ton",
    terminologyFamily: "chrome_concentrate",
    quantityLabel: "Concentrate Tons",
    routeQuantityLabel: "Delivery Route Tons",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Concentrate Acquisition Cost / Ton",
    logisticsCostLabel: "Transport / Delivery Cost / Ton",
    processingCostLabel: "Handling / Storage Cost / Ton",
    verificationCostLabel: "Concentrate Assay Cost",
    sourceLabel: "Concentrate Supplier",
    storageLabel: "Storage / Stockpile Point",
    qualityLabel: "Concentrate Grade / Assay Evidence",
    deliveryLabel: "Buyer / Offtake Delivery Point",
  },
  {
    productCode: "PRD-COAL-RB1",
    commodityClass: "Hard Commodities",
    category: "Coal",
    resource: "Coal",
    materialType: "RB1 Export Coal",
    materialStage: "saleable_product",
    unitOfMeasure: "ton",
    terminologyFamily: "coal_saleable_product",
    quantityLabel: "Coal Product Tons",
    routeQuantityLabel: "Delivery Route Tons",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Coal Product Acquisition Cost / Ton",
    logisticsCostLabel: "Transport / Delivery Cost / Ton",
    processingCostLabel: "Handling / Screening / Storage Cost / Ton",
    verificationCostLabel: "Coal Quality / Lab Analysis Cost",
    sourceLabel: "Coal Supplier",
    storageLabel: "Stockpile / Siding / Storage Point",
    qualityLabel: "RB Grade / CV / Ash / Sulphur Evidence",
    deliveryLabel: "Buyer / Export / Delivery Point",
  },
  {
    productCode: "PRD-COAL-RB3",
    commodityClass: "Hard Commodities",
    category: "Coal",
    resource: "Coal",
    materialType: "RB3 Export Coal",
    materialStage: "saleable_product",
    unitOfMeasure: "ton",
    terminologyFamily: "coal_saleable_product",
    quantityLabel: "Coal Product Tons",
    routeQuantityLabel: "Delivery Route Tons",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Coal Product Cost / Ton",
    logisticsCostLabel: "Transport Cost / Ton",
    processingCostLabel: "Handling Cost / Ton",
    verificationCostLabel: "Coal Lab Cost",
    sourceLabel: "Coal Supplier",
    storageLabel: "Coal Stockpile",
    qualityLabel: "RB Grade Evidence",
    deliveryLabel: "Buyer Delivery Point",
  },
  {
    productCode: "PRD-MAI-WHITE",
    commodityClass: "Soft Commodities",
    category: "Grains",
    resource: "Maize",
    materialType: "White Maize",
    materialStage: "saleable_product",
    unitOfMeasure: "ton",
    terminologyFamily: "grain_saleable_product",
    quantityLabel: "Product Quantity",
    routeQuantityLabel: "Route Quantity",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Acquisition / Source Cost / Unit",
    logisticsCostLabel: "Logistics / Handling Cost / Unit",
    processingCostLabel: "Packaging / Handling Cost / Unit",
    verificationCostLabel: "Quality / Moisture / Grade Evidence Cost",
    sourceLabel: "Supplier / Grain Source",
    storageLabel: "Storage / Handling Location",
    qualityLabel: "Quality / Moisture / Grade Evidence",
    deliveryLabel: "Buyer / Offtake Delivery Point",
  },
  {
    productCode: "PRD-MAI-YELLOW",
    commodityClass: "Soft Commodities",
    category: "Grains",
    resource: "Maize",
    materialType: "Yellow Maize",
    materialStage: "saleable_product",
    unitOfMeasure: "ton",
    terminologyFamily: "grain_saleable_product",
    quantityLabel: "Product Quantity",
    routeQuantityLabel: "Route Quantity",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Acquisition / Source Cost / Unit",
    logisticsCostLabel: "Logistics / Handling Cost / Unit",
    processingCostLabel: "Packaging / Handling Cost / Unit",
    verificationCostLabel: "Quality / Moisture / Grade Evidence Cost",
    sourceLabel: "Supplier / Grain Source",
    storageLabel: "Storage / Handling Location",
    qualityLabel: "Quality / Moisture / Grade Evidence",
    deliveryLabel: "Buyer / Offtake Delivery Point",
  },
  {
    productCode: "PRD-GOLD-ORE",
    commodityClass: "Hard Commodities",
    category: "Precious Metals",
    resource: "Gold",
    materialType: "Gold Ore",
    materialStage: "raw_feedstock",
    unitOfMeasure: "ton",
    terminologyFamily: "precious_metal_raw_feedstock",
    quantityLabel: "Ore / Feedstock Quantity",
    routeQuantityLabel: "Route Quantity",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Ore / Feedstock Cost / Unit",
    logisticsCostLabel: "Secure Transport Cost / Unit",
    processingCostLabel: "Processing / Handling Cost / Unit",
    verificationCostLabel: "Assay / Grade Verification Cost",
    sourceLabel: "Supplier / Ore Source",
    storageLabel: "Secure Storage Point",
    qualityLabel: "Assay / Grade Evidence",
    deliveryLabel: "Processor / Buyer Delivery Point",
  },
  {
    productCode: "PRD-LITH-SPOD-CON",
    commodityClass: "Hard Commodities",
    category: "Battery Minerals",
    resource: "Lithium",
    materialType: "Lithium Spodumene Concentrate",
    materialStage: "saleable_product",
    unitOfMeasure: "ton",
    terminologyFamily: "battery_mineral_saleable_product",
    quantityLabel: "Saleable Product Quantity",
    routeQuantityLabel: "Delivery Route Quantity",
    marketPriceLabel: "Market / Reference Price",
    negotiatedPriceLabel: "Negotiated Buyer Price",
    acquisitionCostLabel: "Product Acquisition Cost / Unit",
    logisticsCostLabel: "Transport / Delivery Cost / Unit",
    processingCostLabel: "Handling / Storage Cost / Unit",
    verificationCostLabel: "Assay / Grade Verification Cost",
    sourceLabel: "Supplier / Product Source",
    storageLabel: "Storage / Handling Point",
    qualityLabel: "Assay / Grade Evidence",
    deliveryLabel: "Buyer / Offtake Delivery Point",
  },
];

function cleanText(value: string | null | undefined, fallback: string): string {
  const cleaned = typeof value === "string" ? value.trim() : "";
  return cleaned.length > 0 ? cleaned : fallback;
}

export function normaliseProductCatalogueRow(
  row: ProductCatalogueRow
): ProductCatalogueOption {
  return {
    productCode: cleanText(row.product_code, "UNKNOWN"),
    commodityClass: cleanText(row.commodity_class, "Unclassified"),
    category: cleanText(row.category, "Uncategorised"),
    resource: cleanText(row.resource, "Unknown Resource"),
    materialType: cleanText(row.material_type, "Unknown Product"),
    materialStage: cleanText(row.material_stage, "saleable_product"),
    unitOfMeasure: cleanText(row.unit_of_measure, "unit"),
    terminologyFamily: cleanText(row.terminology_family, "generic_product"),

    quantityLabel: cleanText(row.quantity_label, "Product Quantity"),
    routeQuantityLabel: cleanText(row.route_quantity_label, "Route Quantity"),
    marketPriceLabel: cleanText(row.market_price_label, "Market / Reference Price"),
    negotiatedPriceLabel: cleanText(row.negotiated_price_label, "Negotiated Buyer Price"),
    acquisitionCostLabel: cleanText(row.acquisition_cost_label, "Acquisition Cost / Unit"),
    logisticsCostLabel: cleanText(row.logistics_cost_label, "Logistics Cost / Unit"),
    processingCostLabel: cleanText(row.processing_cost_label, "Processing / Handling Cost / Unit"),
    verificationCostLabel: cleanText(row.verification_cost_label, "Verification / Quality Cost"),

    sourceLabel: cleanText(row.source_label, "Supplier / Source"),
    storageLabel: cleanText(row.storage_label, "Storage / Handling Location"),
    qualityLabel: cleanText(row.quality_label, "Quality / Evidence"),
    deliveryLabel: cleanText(row.delivery_label, "Buyer / Delivery Point"),
  };
}

export function findProductCatalogueOption(
  catalogue: ProductCatalogueOption[],
  productCode?: string | null
): ProductCatalogueOption {
  if (!productCode) return catalogue[0] ?? fallbackProductCatalogue[0];

  return (
    catalogue.find((item) => item.productCode === productCode) ??
    fallbackProductCatalogue.find((item) => item.productCode === productCode) ??
    catalogue[0] ??
    fallbackProductCatalogue[0]
  );
}

export function getCategoriesForClass(
  catalogue: ProductCatalogueOption[],
  commodityClass: string
): string[] {
  return Array.from(
    new Set(
      catalogue
        .filter((item) => item.commodityClass === commodityClass)
        .map((item) => item.category)
    )
  );
}

export function getResourcesForCategory(
  catalogue: ProductCatalogueOption[],
  commodityClass: string,
  category: string
): string[] {
  return Array.from(
    new Set(
      catalogue
        .filter(
          (item) =>
            item.commodityClass === commodityClass &&
            item.category === category
        )
        .map((item) => item.resource)
    )
  );
}

export function getProductsForResource(
  catalogue: ProductCatalogueOption[],
  commodityClass: string,
  category: string,
  resource: string
): ProductCatalogueOption[] {
  return catalogue.filter(
    (item) =>
      item.commodityClass === commodityClass &&
      item.category === category &&
      item.resource === resource
  );
}

export async function fetchProductCatalogue(supabase: any): Promise<{
  catalogue: ProductCatalogueOption[];
  source: "database" | "fallback";
  errorMessage: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("product_catalogue")
      .select(
        "product_code, commodity_class, category, resource, material_type, material_stage, unit_of_measure, terminology_family, quantity_label, route_quantity_label, market_price_label, negotiated_price_label, acquisition_cost_label, logistics_cost_label, processing_cost_label, verification_cost_label, source_label, storage_label, quality_label, delivery_label, is_active"
      )
      .eq("is_active", true)
      .order("commodity_class", { ascending: true })
      .order("category", { ascending: true })
      .order("resource", { ascending: true })
      .order("material_type", { ascending: true });

    if (error) {
      return {
        catalogue: fallbackProductCatalogue,
        source: "fallback",
        errorMessage: error.message,
      };
    }

    const rows = Array.isArray(data) ? (data as ProductCatalogueRow[]) : [];

    if (rows.length === 0) {
      return {
        catalogue: fallbackProductCatalogue,
        source: "fallback",
        errorMessage: "No active product catalogue records found.",
      };
    }

    return {
      catalogue: rows.map(normaliseProductCatalogueRow),
      source: "database",
      errorMessage: null,
    };
  } catch (error) {
    return {
      catalogue: fallbackProductCatalogue,
      source: "fallback",
      errorMessage:
        error instanceof Error ? error.message : "Unknown catalogue load error.",
    };
  }
  }
