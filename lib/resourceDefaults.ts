export type CommodityClass = "Hard Commodities" | "Soft Commodities";

export type MaterialStage =
  | "raw_feedstock"
  | "intermediate_concentrate"
  | "finished_product";

export type ResourceDefault = {
  material: string;
  yield: string;
  price: string;
  feedstock: string;
  transport: string;
  tolling: string;
  feedstockAssayRate: string;
  feedstockAssayBatches: string;
  concentrateAssayRate: string;
  concentrateAssayBatches: string;
};

export type MaterialDefault = ResourceDefault & {
  stage: MaterialStage;
  priceBasis: string;
};

export const COMMODITY_CLASSES: CommodityClass[] = [
  "Hard Commodities",
  "Soft Commodities",
];

export const COMMODITY_GROUPS_BY_CLASS: Record<CommodityClass, string[]> = {
  "Hard Commodities": [
    "Ferrous Metals",
    "Non-Ferrous Metals",
    "Precious Metals",
    "Energy Minerals",
    "Battery / Critical Minerals",
    "Industrial Minerals",
  ],
  "Soft Commodities": [
    "Grains",
    "Oilseeds",
    "Livestock",
    "Sugar",
    "Coffee / Cocoa",
    "Agricultural Inputs",
    "Other Soft Commodities",
  ],
};

export const RESOURCE_MAP: Record<string, string[]> = {
  "Ferrous Metals": [
    "Chrome",
    "Manganese",
    "Iron Ore",
    "Vanadium",
    "Titanium",
    "Other Ferrous",
  ],
  "Non-Ferrous Metals": [
    "Copper",
    "Aluminium",
    "Nickel",
    "Zinc",
    "Lead",
    "Cobalt",
    "Other Non-Ferrous",
  ],
  "Precious Metals": [
    "Gold",
    "Platinum",
    "Palladium",
    "Rhodium",
    "Silver",
    "Other Precious",
  ],
  "Energy Minerals": ["Coal", "Uranium", "Graphite", "Other Energy Mineral"],
  "Battery / Critical Minerals": [
    "Lithium",
    "Graphite",
    "Cobalt",
    "Nickel",
    "Rare Earths",
    "Other Critical Mineral",
  ],
  "Industrial Minerals": [
    "Silica",
    "Limestone",
    "Phosphate",
    "Gypsum",
    "Fluorspar",
    "Other Industrial Mineral",
  ],
  Grains: ["Maize", "Wheat", "Rice", "Sorghum", "Barley", "Other Grain"],
  Oilseeds: ["Soybeans", "Sunflower", "Canola", "Groundnuts", "Other Oilseed"],
  Livestock: ["Cattle", "Sheep", "Goats", "Poultry", "Other Livestock"],
  Sugar: ["Raw Sugar", "Refined Sugar", "Sugarcane", "Molasses"],
  "Coffee / Cocoa": ["Coffee", "Cocoa", "Other Coffee / Cocoa"],
  "Agricultural Inputs": ["Fertiliser", "Animal Feed", "Seed", "Other Agricultural Input"],
  "Other Soft Commodities": ["Other Soft Commodity"],
};

export const MATERIAL_OPTIONS_BY_RESOURCE: Record<string, string[]> = {
  Chrome: [
    "ROM",
    "Tailings",
    "Dumps",
    "Sweepings",
    "Lumpy Ore",
    "Chrome Concentrate 40–42%",
    "Chrome Concentrate 42–44%",
    "Other Chrome Material",
  ],
  Manganese: [
    "Manganese Ore",
    "Mn Lumpy",
    "Mn Fines",
    "Mn Concentrate",
    "Low-Grade Mn Ore",
    "Other Manganese Material",
  ],
  "Iron Ore": [
    "Iron Ore ROM",
    "Iron Ore Fines",
    "Iron Ore Lump",
    "Iron Ore Concentrate",
    "Magnetite",
    "Hematite",
    "Other Iron Ore Material",
  ],
  Vanadium: [
    "Vanadium Ore",
    "Vanadium-bearing Magnetite",
    "Vanadium Concentrate",
    "Vanadium Slag",
    "Other Vanadium Material",
  ],
  Titanium: [
    "Titanium Ore",
    "Ilmenite",
    "Rutile",
    "Titanium Concentrate",
    "Heavy Mineral Sands",
    "Other Titanium Material",
  ],
  Copper: [
    "Copper Ore",
    "Copper Concentrate",
    "Copper Cathode",
    "Copper Scrap",
    "Copper Tailings",
    "Other Copper Material",
  ],
  Aluminium: [
    "Bauxite",
    "Alumina",
    "Aluminium Ingots",
    "Aluminium Scrap",
    "Other Aluminium Material",
  ],
  Nickel: [
    "Nickel Ore",
    "Nickel Concentrate",
    "Nickel Laterite",
    "Nickel Sulphide Ore",
    "Other Nickel Material",
  ],
  Zinc: [
    "Zinc Ore",
    "Zinc Concentrate",
    "Zinc Ingots",
    "Zinc Tailings",
    "Other Zinc Material",
  ],
  Lead: [
    "Lead Ore",
    "Lead Concentrate",
    "Lead Ingots",
    "Lead Scrap",
    "Other Lead Material",
  ],
  Cobalt: [
    "Cobalt Ore",
    "Cobalt Concentrate",
    "Cobalt Hydroxide",
    "Cobalt-bearing Tailings",
    "Other Cobalt Material",
  ],
  Gold: [
    "Gold Ore",
    "Gold Tailings",
    "Gold-bearing Dumps",
    "Gold Concentrate",
    "Doré",
    "Bullion",
    "Other Gold Material",
  ],
  Platinum: [
    "PGM Ore",
    "PGM Concentrate",
    "Platinum-bearing Tailings",
    "UG2 Ore",
    "Merensky Ore",
    "Other PGM Material",
  ],
  Palladium: [
    "PGM Ore",
    "PGM Concentrate",
    "Palladium-bearing Material",
    "Other Palladium Material",
  ],
  Rhodium: [
    "PGM Ore",
    "PGM Concentrate",
    "Rhodium-bearing Material",
    "Other Rhodium Material",
  ],
  Silver: [
    "Silver Ore",
    "Silver Concentrate",
    "Silver Doré",
    "Silver Bullion",
    "Other Silver Material",
  ],
  Coal: [
    "ROM Coal",
    "Washed Coal",
    "Peas",
    "Nuts",
    "Duff",
    "RB1",
    "RB2",
    "RB3",
    "Anthracite",
    "Other Coal Product",
  ],
  Uranium: [
    "Uranium Ore",
    "Uranium Concentrate",
    "U3O8",
    "Uranium-bearing Tailings",
    "Other Uranium Material",
  ],
  Graphite: [
    "Graphite Ore",
    "Graphite Concentrate",
    "Flake Graphite",
    "Amorphous Graphite",
    "Battery-grade Graphite",
    "Other Graphite Material",
  ],
  Lithium: [
    "Spodumene Ore",
    "Spodumene Concentrate",
    "Lithium-bearing Pegmatite",
    "Lithium Tailings",
    "Lithium Carbonate",
    "Lithium Hydroxide",
    "Other Lithium Material",
  ],
  "Rare Earths": [
    "Rare Earth Ore",
    "Monazite",
    "Bastnaesite",
    "Rare Earth Concentrate",
    "Mixed Rare Earth Oxide",
    "Other Rare Earth Material",
  ],
  Silica: [
    "Silica Sand",
    "High-Purity Silica",
    "Quartz",
    "Silica Rock",
    "Other Silica Material",
  ],
  Limestone: [
    "Limestone Rock",
    "Crushed Limestone",
    "Agricultural Lime",
    "Industrial Limestone",
    "Other Limestone Material",
  ],
  Phosphate: [
    "Phosphate Rock",
    "Phosphate Concentrate",
    "Low-Grade Phosphate",
    "Other Phosphate Material",
  ],
  Gypsum: [
    "Gypsum Rock",
    "Crushed Gypsum",
    "Agricultural Gypsum",
    "Other Gypsum Material",
  ],
  Fluorspar: [
    "Fluorspar Ore",
    "Acid Grade Fluorspar",
    "Metallurgical Grade Fluorspar",
    "Fluorspar Concentrate",
    "Other Fluorspar Material",
  ],

  Maize: ["White Maize", "Yellow Maize", "Maize Meal", "Other Maize Product"],
  Wheat: ["Milling Wheat", "Feed Wheat", "Wheat Flour", "Other Wheat Product"],
  Rice: ["Paddy Rice", "Milled Rice", "Broken Rice", "Other Rice Product"],
  Sorghum: ["White Sorghum", "Red Sorghum", "Feed Sorghum", "Other Sorghum Product"],
  Barley: ["Malting Barley", "Feed Barley", "Other Barley Product"],
  Soybeans: ["Soybeans", "Soybean Meal", "Soybean Oil", "Other Soy Product"],
  Sunflower: ["Sunflower Seed", "Sunflower Oil", "Sunflower Cake", "Other Sunflower Product"],
  Canola: ["Canola Seed", "Canola Oil", "Canola Meal", "Other Canola Product"],
  Groundnuts: ["Raw Groundnuts", "Processed Groundnuts", "Other Groundnut Product"],
  Cattle: ["Live Cattle", "Beef Carcass", "Beef Cuts", "Other Cattle Product"],
  Sheep: ["Live Sheep", "Mutton Carcass", "Wool", "Other Sheep Product"],
  Goats: ["Live Goats", "Goat Meat", "Other Goat Product"],
  Poultry: ["Live Poultry", "Frozen Chicken", "Eggs", "Other Poultry Product"],
  "Raw Sugar": ["Raw Sugar", "Brown Sugar", "Other Raw Sugar Product"],
  "Refined Sugar": ["White Sugar", "Refined Sugar", "Icing Sugar", "Other Refined Sugar Product"],
  Sugarcane: ["Standing Sugarcane", "Harvested Sugarcane", "Other Sugarcane Product"],
  Molasses: ["Molasses", "Other Molasses Product"],
  Coffee: ["Green Coffee Beans", "Roasted Coffee Beans", "Ground Coffee", "Instant Coffee"],
  Cocoa: ["Cocoa Beans", "Cocoa Powder", "Cocoa Butter", "Other Cocoa Product"],
  Fertiliser: ["Urea", "MAP", "DAP", "LAN", "NPK Blend", "Other Fertiliser"],
  "Animal Feed": ["Cattle Feed", "Poultry Feed", "Pig Feed", "Other Animal Feed"],
  Seed: ["Maize Seed", "Vegetable Seed", "Pasture Seed", "Other Seed"],

  Other: ["Raw Material", "Intermediate Product", "Finished Product", "Other Material"],
};

export const MATERIAL_TYPES = MATERIAL_OPTIONS_BY_RESOURCE.Chrome;

export function materialOptionsFor(resource: string) {
  return MATERIAL_OPTIONS_BY_RESOURCE[resource] || MATERIAL_OPTIONS_BY_RESOURCE.Other;
}

export function commodityClassForGroup(group: string): CommodityClass {
  if (COMMODITY_GROUPS_BY_CLASS["Soft Commodities"].includes(group)) {
    return "Soft Commodities";
  }
  return "Hard Commodities";
}

export function groupsForClass(commodityClass: CommodityClass) {
  return COMMODITY_GROUPS_BY_CLASS[commodityClass];
}

export function firstGroupForClass(commodityClass: CommodityClass) {
  return COMMODITY_GROUPS_BY_CLASS[commodityClass][0];
}

export function firstResourceForGroup(group: string) {
  return RESOURCE_MAP[group]?.[0] || "Other";
}

const BASE_DEFAULTS: Record<string, ResourceDefault> = {
  Chrome: {
    material: "ROM",
    yield: "40",
    price: "2400",
    feedstock: "250",
    transport: "150",
    tolling: "400",
    feedstockAssayRate: "1500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "2000",
    concentrateAssayBatches: "1",
  },
  Coal: {
    material: "ROM Coal",
    yield: "70",
    price: "0",
    feedstock: "420",
    transport: "180",
    tolling: "120",
    feedstockAssayRate: "1200",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "1500",
    concentrateAssayBatches: "1",
  },
  Gold: {
    material: "Gold Ore",
    yield: "3",
    price: "0",
    feedstock: "1200",
    transport: "300",
    tolling: "850",
    feedstockAssayRate: "3500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "5000",
    concentrateAssayBatches: "1",
  },
  Copper: {
    material: "Copper Ore",
    yield: "8",
    price: "0",
    feedstock: "650",
    transport: "250",
    tolling: "500",
    feedstockAssayRate: "2500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "3500",
    concentrateAssayBatches: "1",
  },
  Manganese: {
    material: "Manganese Ore",
    yield: "85",
    price: "0",
    feedstock: "900",
    transport: "220",
    tolling: "150",
    feedstockAssayRate: "1800",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "2200",
    concentrateAssayBatches: "1",
  },
  "Iron Ore": {
    material: "Iron Ore ROM",
    yield: "75",
    price: "0",
    feedstock: "650",
    transport: "250",
    tolling: "180",
    feedstockAssayRate: "1800",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "2200",
    concentrateAssayBatches: "1",
  },
  Lithium: {
    material: "Spodumene Ore",
    yield: "12",
    price: "0",
    feedstock: "900",
    transport: "300",
    tolling: "650",
    feedstockAssayRate: "3000",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "4500",
    concentrateAssayBatches: "1",
  },
  Platinum: {
    material: "PGM Ore",
    yield: "6",
    price: "0",
    feedstock: "1000",
    transport: "280",
    tolling: "750",
    feedstockAssayRate: "3500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "5000",
    concentrateAssayBatches: "1",
  },
  Palladium: {
    material: "PGM Ore",
    yield: "6",
    price: "0",
    feedstock: "1000",
    transport: "280",
    tolling: "750",
    feedstockAssayRate: "3500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "5000",
    concentrateAssayBatches: "1",
  },
  Rhodium: {
    material: "PGM Ore",
    yield: "6",
    price: "0",
    feedstock: "1000",
    transport: "280",
    tolling: "750",
    feedstockAssayRate: "3500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "5000",
    concentrateAssayBatches: "1",
  },
  Silver: {
    material: "Silver Ore",
    yield: "10",
    price: "0",
    feedstock: "700",
    transport: "240",
    tolling: "450",
    feedstockAssayRate: "2500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "3500",
    concentrateAssayBatches: "1",
  },
  Other: {
    material: "Raw Material",
    yield: "100",
    price: "0",
    feedstock: "0",
    transport: "0",
    tolling: "0",
    feedstockAssayRate: "0",
    feedstockAssayBatches: "0",
    concentrateAssayRate: "0",
    concentrateAssayBatches: "0",
  },
};

const HARD_DEFAULT_ALIASES = [
  "Vanadium",
  "Titanium",
  "Aluminium",
  "Nickel",
  "Zinc",
  "Lead",
  "Cobalt",
  "Uranium",
  "Graphite",
  "Rare Earths",
  "Silica",
  "Limestone",
  "Phosphate",
  "Gypsum",
  "Fluorspar",
];

const SOFT_DEFAULTS: ResourceDefault = {
  material: "Intermediate Product",
  yield: "100",
  price: "0",
  feedstock: "0",
  transport: "0",
  tolling: "0",
  feedstockAssayRate: "0",
  feedstockAssayBatches: "0",
  concentrateAssayRate: "0",
  concentrateAssayBatches: "0",
};

export function defaultsFor(resource: string): ResourceDefault {
  if (BASE_DEFAULTS[resource]) return BASE_DEFAULTS[resource];

  if (HARD_DEFAULT_ALIASES.includes(resource)) {
    return {
      ...BASE_DEFAULTS.Other,
      material: materialOptionsFor(resource)[0],
      yield: "40",
      transport: "200",
      feedstockAssayRate: "1500",
      feedstockAssayBatches: "1",
      concentrateAssayRate: "2000",
      concentrateAssayBatches: "1",
    };
  }

  return {
    ...SOFT_DEFAULTS,
    material: materialOptionsFor(resource)[0],
  };
}

const FINISHED_MATERIALS = [
  "Bullion",
  "Doré",
  "Silver Bullion",
  "Silver Doré",
  "Copper Cathode",
  "Aluminium Ingots",
  "Zinc Ingots",
  "Lead Ingots",
  "Lithium Carbonate",
  "Lithium Hydroxide",
  "U3O8",
  "Mixed Rare Earth Oxide",
  "Battery-grade Graphite",
  "White Sugar",
  "Refined Sugar",
  "Icing Sugar",
  "Maize Meal",
  "Wheat Flour",
  "Milled Rice",
  "Sunflower Oil",
  "Soybean Oil",
  "Canola Oil",
  "Beef Cuts",
  "Frozen Chicken",
  "Ground Coffee",
  "Instant Coffee",
  "Cocoa Powder",
  "Cocoa Butter",
  "Finished Product",
];

const INTERMEDIATE_MATERIALS = [
  "Chrome Concentrate 40–42%",
  "Chrome Concentrate 42–44%",
  "Mn Concentrate",
  "Iron Ore Concentrate",
  "Vanadium Concentrate",
  "Titanium Concentrate",
  "Copper Concentrate",
  "Nickel Concentrate",
  "Zinc Concentrate",
  "Lead Concentrate",
  "Cobalt Concentrate",
  "Gold Concentrate",
  "PGM Concentrate",
  "Silver Concentrate",
  "Uranium Concentrate",
  "Graphite Concentrate",
  "Spodumene Concentrate",
  "Rare Earth Concentrate",
  "Fluorspar Concentrate",
  "Washed Coal",
  "Peas",
  "Nuts",
  "Duff",
  "RB1",
  "RB2",
  "RB3",
  "Anthracite",
  "White Maize",
  "Yellow Maize",
  "Milling Wheat",
  "Feed Wheat",
  "Paddy Rice",
  "Broken Rice",
  "White Sorghum",
  "Red Sorghum",
  "Feed Sorghum",
  "Malting Barley",
  "Feed Barley",
  "Soybeans",
  "Soybean Meal",
  "Sunflower Seed",
  "Sunflower Cake",
  "Canola Seed",
  "Canola Meal",
  "Raw Groundnuts",
  "Processed Groundnuts",
  "Live Cattle",
  "Beef Carcass",
  "Live Sheep",
  "Mutton Carcass",
  "Wool",
  "Live Goats",
  "Goat Meat",
  "Live Poultry",
  "Eggs",
  "Raw Sugar",
  "Brown Sugar",
  "Molasses",
  "Green Coffee Beans",
  "Roasted Coffee Beans",
  "Cocoa Beans",
  "Urea",
  "MAP",
  "DAP",
  "LAN",
  "NPK Blend",
  "Cattle Feed",
  "Poultry Feed",
  "Pig Feed",
  "Maize Seed",
  "Vegetable Seed",
  "Pasture Seed",
  "Intermediate Product",
];

export function materialStageFor(material: string): MaterialStage {
  if (FINISHED_MATERIALS.includes(material)) return "finished_product";
  if (INTERMEDIATE_MATERIALS.includes(material)) return "intermediate_concentrate";
  return "raw_feedstock";
}

export function stageLabel(stage: MaterialStage) {
  if (stage === "finished_product") return "Finished Product";
  if (stage === "intermediate_concentrate") return "Intermediate / Saleable Product";
  return "Raw Feedstock";
}

export function materialDefaultFor(resource: string, material: string): MaterialDefault {
  const base = defaultsFor(resource);
  const stage = materialStageFor(material);

  if (stage === "finished_product") {
    return {
      ...base,
      material,
      stage,
      yield: "100",
      price: "0",
      feedstock: "0",
      tolling: "0",
      priceBasis: "Market feed or negotiated contract price required",
    };
  }

  if (stage === "intermediate_concentrate") {
    return {
      ...base,
      material,
      stage,
      yield: "100",
      price: material.includes("Chrome Concentrate") ? base.price : "0",
      feedstock: "0",
      tolling: "0",
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  if (resource === "Gold" && material === "Gold Tailings") {
    return {
      ...base,
      material,
      stage,
      yield: "2",
      price: "0",
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  if (resource === "Chrome" && material === "Tailings") {
    return {
      ...base,
      material,
      stage,
      yield: "35",
      price: base.price,
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  if (resource === "Chrome" && material === "Dumps") {
    return {
      ...base,
      material,
      stage,
      yield: "35",
      price: base.price,
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  if (resource === "Chrome" && material === "Sweepings") {
    return {
      ...base,
      material,
      stage,
      yield: "32",
      price: base.price,
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  if (resource === "Coal" && material === "ROM Coal") {
    return {
      ...base,
      material,
      stage,
      yield: "70",
      price: "0",
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  if (resource === "Sugarcane" && material === "Standing Sugarcane") {
    return {
      ...base,
      material,
      stage,
      yield: "100",
      price: "0",
      priceBasis: "Market feed or negotiated buyer price",
    };
  }

  return {
    ...base,
    material,
    stage,
    priceBasis: "Market feed or negotiated buyer price",
  };
  }
