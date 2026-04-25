export const RESOURCE_MAP: Record<string, string[]> = {
  "Ferrous Metals": ["Chrome", "Iron Ore", "Manganese"],
  "Non-Ferrous Metals": ["Copper", "Nickel", "Zinc", "Lead", "Aluminium"],
  "Battery / Energy Minerals": ["Lithium", "Cobalt", "Graphite", "Vanadium"],
  "Precious Metals": ["Gold", "Platinum Group Metals", "Silver"],
  "Bulk Commodities": ["Coal", "Anthracite", "Coke"],
  "Industrial Minerals": ["Silica", "Limestone", "Fluorspar", "Phosphate", "Other"],
};

export const MATERIAL_TYPES = [
  "ROM",
  "Tailings",
  "Dumps",
  "Sweepings",
  "ROM / Tailings / Feedstock",
  "Concentrate",
  "Washed Product",
  "Other",
];

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

const base: ResourceDefault = {
  material: "Other",
  yield: "50",
  price: "1000",
  feedstock: "300",
  transport: "150",
  tolling: "250",
  feedstockAssayRate: "1200",
  feedstockAssayBatches: "1",
  concentrateAssayRate: "1800",
  concentrateAssayBatches: "1",
};

export const RESOURCE_DEFAULTS: Record<string, ResourceDefault> = {
  Chrome: {
    material: "ROM / Tailings / Feedstock",
    yield: "40",
    price: "2400",
    feedstock: "300",
    transport: "150",
    tolling: "350",
    feedstockAssayRate: "1200",
    feedstockAssayBatches: "2",
    concentrateAssayRate: "2200",
    concentrateAssayBatches: "1",
  },
  "Iron Ore": { ...base, material: "ROM", yield: "70", price: "900", feedstock: "300", transport: "120", tolling: "80", feedstockAssayRate: "1500", concentrateAssayRate: "1500" },
  Manganese: { ...base, material: "ROM", yield: "55", price: "1800", feedstock: "500", transport: "150", tolling: "250", feedstockAssayRate: "1500", concentrateAssayRate: "1800" },
  Coal: { ...base, material: "ROM", yield: "65", price: "900", feedstock: "450", transport: "120", tolling: "120", feedstockAssayRate: "900", concentrateAssayRate: "1200" },
  Anthracite: { ...base, material: "ROM", yield: "70", price: "1200", feedstock: "550", transport: "150", tolling: "150", feedstockAssayRate: "900", concentrateAssayRate: "1200" },
  Coke: { ...base, material: "Washed Product", yield: "95", price: "1500", feedstock: "900", tolling: "80", feedstockAssayRate: "900", concentrateAssayRate: "1200" },
  Copper: { ...base, material: "ROM", yield: "8", price: "4500", feedstock: "250", transport: "180", tolling: "600", feedstockAssayRate: "1800", feedstockAssayBatches: "2", concentrateAssayRate: "2500" },
  Nickel: { ...base, material: "ROM", yield: "10", price: "5000", feedstock: "300", transport: "180", tolling: "650", feedstockAssayRate: "1800", feedstockAssayBatches: "2", concentrateAssayRate: "2500" },
  Zinc: { ...base, material: "ROM", yield: "18", price: "2200", feedstock: "250", transport: "160", tolling: "500", feedstockAssayRate: "1600", feedstockAssayBatches: "2", concentrateAssayRate: "2200" },
  Lead: { ...base, material: "ROM", yield: "16", price: "2100", feedstock: "250", transport: "160", tolling: "500", feedstockAssayRate: "1600", feedstockAssayBatches: "2", concentrateAssayRate: "2200" },
  Aluminium: { ...base, material: "ROM", yield: "60", price: "1200", feedstock: "350", tolling: "250", concentrateAssayRate: "1600" },
  Lithium: { ...base, material: "ROM", yield: "20", price: "3500", feedstock: "450", transport: "200", tolling: "700", feedstockAssayRate: "2000", feedstockAssayBatches: "2", concentrateAssayRate: "3000" },
  Cobalt: { ...base, material: "ROM", yield: "10", price: "6000", feedstock: "500", transport: "220", tolling: "800", feedstockAssayRate: "2200", feedstockAssayBatches: "2", concentrateAssayRate: "3200" },
  Graphite: { ...base, material: "ROM", yield: "45", price: "1800", feedstock: "350", transport: "180", tolling: "400", feedstockAssayRate: "1500", concentrateAssayRate: "2200" },
  Vanadium: { ...base, material: "ROM", yield: "15", price: "4200", feedstock: "450", transport: "180", tolling: "700", feedstockAssayRate: "2000", feedstockAssayBatches: "2", concentrateAssayRate: "3000" },
  Gold: { ...base, material: "ROM", yield: "2", price: "10000", feedstock: "500", transport: "180", tolling: "1200", feedstockAssayRate: "2500", feedstockAssayBatches: "3", concentrateAssayRate: "3500", concentrateAssayBatches: "2" },
  "Platinum Group Metals": { ...base, material: "ROM", yield: "3", price: "9000", feedstock: "600", transport: "180", tolling: "1200", feedstockAssayRate: "2500", feedstockAssayBatches: "3", concentrateAssayRate: "3500", concentrateAssayBatches: "2" },
  Silver: { ...base, material: "ROM", yield: "5", price: "5000", feedstock: "450", transport: "170", tolling: "900", feedstockAssayRate: "2200", feedstockAssayBatches: "2", concentrateAssayRate: "3000" },
  Silica: { ...base, material: "ROM", yield: "80", price: "500", feedstock: "120", transport: "100", tolling: "80", feedstockAssayRate: "800", concentrateAssayRate: "1000" },
  Limestone: { ...base, material: "ROM", yield: "85", price: "350", feedstock: "80", transport: "100", tolling: "60", feedstockAssayRate: "700", concentrateAssayRate: "900" },
  Fluorspar: { ...base, material: "ROM", yield: "55", price: "1800", feedstock: "350", tolling: "350", feedstockAssayRate: "1500", concentrateAssayRate: "2200" },
  Phosphate: { ...base, material: "ROM", yield: "60", price: "1000", feedstock: "250", transport: "130", tolling: "250", concentrateAssayRate: "1600" },
  Other: base,
};

export function defaultsFor(resource: string) {
  return RESOURCE_DEFAULTS[resource] || RESOURCE_DEFAULTS.Other;
  }
