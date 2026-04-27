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
  "Energy Minerals": [
    "Coal",
    "Uranium",
    "Graphite",
    "Other Energy Mineral",
  ],
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
  "Other Resources": ["Other"],
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

  Other: [
    "ROM",
    "Ore",
    "Tailings",
    "Dumps",
    "Concentrate",
    "Final Product",
    "Other Material",
  ],
};

export const MATERIAL_TYPES = MATERIAL_OPTIONS_BY_RESOURCE.Chrome;

export function materialOptionsFor(resource: string) {
  return MATERIAL_OPTIONS_BY_RESOURCE[resource] || MATERIAL_OPTIONS_BY_RESOURCE.Other;
}

const DEFAULTS: Record<string, ResourceDefault> = {
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

  Manganese: {
    material: "Manganese Ore",
    yield: "85",
    price: "1800",
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
    price: "1300",
    feedstock: "650",
    transport: "250",
    tolling: "180",
    feedstockAssayRate: "1800",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "2200",
    concentrateAssayBatches: "1",
  },

  Copper: {
    material: "Copper Ore",
    yield: "8",
    price: "4500",
    feedstock: "650",
    transport: "250",
    tolling: "500",
    feedstockAssayRate: "2500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "3500",
    concentrateAssayBatches: "1",
  },

  Gold: {
    material: "Gold Ore",
    yield: "3",
    price: "9500",
    feedstock: "1200",
    transport: "300",
    tolling: "850",
    feedstockAssayRate: "3500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "5000",
    concentrateAssayBatches: "1",
  },

  Platinum: {
    material: "PGM Ore",
    yield: "6",
    price: "6200",
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
    price: "6000",
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
    price: "7000",
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
    price: "3500",
    feedstock: "700",
    transport: "240",
    tolling: "450",
    feedstockAssayRate: "2500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "3500",
    concentrateAssayBatches: "1",
  },

  Coal: {
    material: "ROM Coal",
    yield: "70",
    price: "950",
    feedstock: "420",
    transport: "180",
    tolling: "120",
    feedstockAssayRate: "1200",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "1500",
    concentrateAssayBatches: "1",
  },

  Lithium: {
    material: "Spodumene Ore",
    yield: "12",
    price: "5200",
    feedstock: "900",
    transport: "300",
    tolling: "650",
    feedstockAssayRate: "3000",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "4500",
    concentrateAssayBatches: "1",
  },

  Graphite: {
    material: "Graphite Ore",
    yield: "35",
    price: "2500",
    feedstock: "550",
    transport: "220",
    tolling: "350",
    feedstockAssayRate: "2200",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "3000",
    concentrateAssayBatches: "1",
  },

  Cobalt: {
    material: "Cobalt Ore",
    yield: "10",
    price: "5800",
    feedstock: "900",
    transport: "280",
    tolling: "600",
    feedstockAssayRate: "3000",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "4500",
    concentrateAssayBatches: "1",
  },

  Nickel: {
    material: "Nickel Ore",
    yield: "18",
    price: "3900",
    feedstock: "750",
    transport: "260",
    tolling: "500",
    feedstockAssayRate: "2800",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "4000",
    concentrateAssayBatches: "1",
  },

  "Rare Earths": {
    material: "Rare Earth Ore",
    yield: "15",
    price: "6000",
    feedstock: "1000",
    transport: "320",
    tolling: "750",
    feedstockAssayRate: "3500",
    feedstockAssayBatches: "1",
    concentrateAssayRate: "5000",
    concentrateAssayBatches: "1",
  },

  Other: {
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
};

export function defaultsFor(resource: string): ResourceDefault {
  return DEFAULTS[resource] || DEFAULTS.Other;
    }
