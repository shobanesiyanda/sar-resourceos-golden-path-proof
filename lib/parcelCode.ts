export function resourceCode(resource: string) {
  const map: Record<string, string> = {
    Chrome: "CHR",
    Coal: "COA",
    Gold: "GOL",
    Manganese: "MAN",
    "Iron Ore": "IRO",
    Copper: "COP",
    Aluminium: "ALU",
    Nickel: "NIC",
    Zinc: "ZIN",
    Lead: "LEA",
    Cobalt: "COB",
    Lithium: "LIT",
    Graphite: "GRA",
    Uranium: "URA",
    Platinum: "PLT",
    Palladium: "PAL",
    Rhodium: "RHO",
    Silver: "SIL",
    Vanadium: "VAN",
    Titanium: "TIT",
    "Rare Earths": "REE",
    Silica: "SILC",
    Limestone: "LIM",
    Phosphate: "PHO",
    Gypsum: "GYP",
    Fluorspar: "FLU",

    Maize: "MAI",
    Wheat: "WHE",
    Rice: "RIC",
    Sorghum: "SOR",
    Barley: "BAR",
    Soybeans: "SOY",
    Sunflower: "SUN",
    Canola: "CAN",
    Groundnuts: "GRN",
    Cattle: "CAT",
    Sheep: "SHP",
    Goats: "GOA",
    Poultry: "POU",
    "Raw Sugar": "SUG",
    "Refined Sugar": "SUG",
    Sugarcane: "SGC",
    Molasses: "MOL",
    Coffee: "COF",
    Cocoa: "COC",
    Fertiliser: "FER",
    "Animal Feed": "AFD",
    Seed: "SED",
  };

  return map[resource] || makeFallbackCode(resource);
}

function makeFallbackCode(resource: string) {
  const cleaned = resource
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3);

  return cleaned || "COM";
}

export function workingParcelCode(resource: string, sequence = "0001") {
  const year = new Date().getFullYear();
  return `PAR-${resourceCode(resource)}-${year}-${sequence}`;
}

export function parcelCodeNote(savedCode: string, workingCode: string) {
  if (savedCode === workingCode) {
    return "Saved parcel code matches selected commodity.";
  }

  return `Working commodity code shown as ${workingCode}. Current seed record remains ${savedCode} until the Supabase parcel-code engine is added.`;
    }
