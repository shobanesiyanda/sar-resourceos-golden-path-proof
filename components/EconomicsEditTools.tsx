"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import ResourceShell from "./ResourceShell";
import { createClient } from "../lib/supabase/client";

const SEED_CODE = "PAR-CHR-2026-0001";

type CommodityClass = "Hard Commodities" | "Soft Commodities";

type Stage =
  | "raw_feedstock"
  | "saleable_product"
  | "finished_product";

type Material = {
  name: string;
  stage: Stage;
  yieldPct: number;
  price: number;
  acquisition: number;
  logistics: number;
  processing: number;
  verification: number;
};

type Resource = {
  cls: CommodityClass;
  category: string;
  resource: string;
  code: string;
  materials: Material[];
};

type FormState = {
  cls: CommodityClass;
  category: string;
  resource: string;
  material: string;
  productQty: number;
  yieldPct: number;
  marketPrice: number;
  negotiatedPrice: number;
  acquisitionCost: number;
  logisticsCost: number;
  processingCost: number;
  verificationCost: number;
  priceNote: string;
};

function mat(
  name: string,
  stage: Stage,
  yieldPct: number,
  price = 0,
  acquisition = 0,
  logistics = 0,
  processing = 0,
  verification = 0
): Material {
  return {
    name,
    stage,
    yieldPct,
    price,
    acquisition,
    logistics,
    processing,
    verification,
  };
}

const RESOURCES: Resource[] = [
  {
    cls: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Chrome",
    code: "CHR",
    materials: [
      mat("ROM", "raw_feedstock", 40, 2550, 0, 180, 350, 3500),
      mat("Tailings", "raw_feedstock", 35, 2550, 0, 180, 350, 3500),
      mat("LG Chrome Ore", "raw_feedstock", 45, 2550, 0, 180, 350, 3500),
      mat("MG Chrome Ore", "raw_feedstock", 50, 2550, 0, 180, 350, 3500),
      mat("Chrome Lumpy Ore", "saleable_product", 100, 0, 0, 180, 0, 3500),
      mat("Chrome Fines", "saleable_product", 100, 0, 0, 180, 0, 3500),
      mat("Chrome Concentrate 38/40", "saleable_product", 100, 2300, 0, 180, 0, 3500),
      mat("Chrome Concentrate 40/42", "saleable_product", 100, 2550, 0, 180, 0, 3500),
      mat("Chrome Concentrate 42/44", "saleable_product", 100, 2800, 0, 180, 0, 3500),
      mat("Foundry Chrome Sand", "finished_product", 100, 0, 0, 180, 0, 3500),
      mat("Metallurgical Chrome", "finished_product", 100, 0, 0, 180, 0, 3500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Manganese",
    code: "MAN",
    materials: [
      mat("ROM Manganese", "raw_feedstock", 55, 0, 0, 180, 250, 2500),
      mat("Manganese Tailings", "raw_feedstock", 35, 0, 0, 180, 250, 2500),
      mat("Mn Ore 28/30", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Mn Ore 32/34", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Mn Ore 36/38", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Mn Ore 40/42", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Manganese Lump", "finished_product", 100, 0, 0, 180, 0, 2500),
      mat("Manganese Fines", "finished_product", 100, 0, 0, 180, 0, 2500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Iron Ore",
    code: "IRO",
    materials: [
      mat("ROM Iron Ore", "raw_feedstock", 70, 0, 0, 180, 250, 2500),
      mat("Iron Ore Fines", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Iron Ore Lump", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Iron Ore Concentrate", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Magnetite", "saleable_product", 100, 0, 0, 180, 0, 2500),
      mat("Hematite", "saleable_product", 100, 0, 0, 180, 0, 2500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Energy Minerals",
    resource: "Coal",
    code: "COA",
    materials: [
      mat("ROM Coal", "raw_feedstock", 70, 0, 0, 180, 0, 1200),
      mat("RB1", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("RB2", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("RB3", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("Peas", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("Nuts", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("Duff", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("Anthracite", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("Thermal Coal", "saleable_product", 100, 0, 0, 180, 0, 1200),
      mat("Metallurgical Coal", "saleable_product", 100, 0, 0, 180, 0, 1200),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Energy Minerals",
    resource: "Uranium",
    code: "URA",
    materials: [
      mat("Uranium Ore", "raw_feedstock", 5, 0, 0, 300, 500, 5000),
      mat("Uranium Concentrate", "saleable_product", 100, 0, 0, 300, 0, 5000),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Precious Metals",
    resource: "Gold",
    code: "GOL",
    materials: [
      mat("Gold Ore", "raw_feedstock", 3, 0, 0, 300, 0, 3500),
      mat("Gold Tailings", "raw_feedstock", 2, 0, 0, 300, 0, 3500),
      mat("Gold Concentrate", "saleable_product", 100, 0, 0, 300, 0, 3500),
      mat("Dore", "saleable_product", 100, 0, 0, 300, 0, 3500),
      mat("Bullion", "finished_product", 100, 0, 0, 300, 0, 3500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Precious Metals",
    resource: "Silver",
    code: "SILV",
    materials: [
      mat("Silver Ore", "raw_feedstock", 5, 0, 0, 300, 0, 3500),
      mat("Silver Concentrate", "saleable_product", 100, 0, 0, 300, 0, 3500),
      mat("Silver Bullion", "finished_product", 100, 0, 0, 300, 0, 3500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "PGMs",
    resource: "Platinum Group Metals",
    code: "PGM",
    materials: [
      mat("PGM Ore", "raw_feedstock", 5, 0, 0, 250, 350, 3500),
      mat("PGM Tailings", "raw_feedstock", 3, 0, 0, 250, 350, 3500),
      mat("PGM Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3500),
      mat("Platinum", "finished_product", 100, 0, 0, 250, 0, 3500),
      mat("Palladium", "finished_product", 100, 0, 0, 250, 0, 3500),
      mat("Rhodium", "finished_product", 100, 0, 0, 250, 0, 3500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Base Metals",
    resource: "Copper",
    code: "COP",
    materials: [
      mat("Copper Ore", "raw_feedstock", 8, 0, 0, 250, 350, 3000),
      mat("Copper Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3000),
      mat("Copper Cathode", "finished_product", 100, 0, 0, 250, 0, 3000),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Base Metals",
    resource: "Nickel",
    code: "NIC",
    materials: [
      mat("Nickel Ore", "raw_feedstock", 8, 0, 0, 250, 350, 3000),
      mat("Nickel Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3000),
      mat("Nickel Matte", "finished_product", 100, 0, 0, 250, 0, 3000),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Base Metals",
    resource: "Zinc",
    code: "ZIN",
    materials: [
      mat("Zinc Ore", "raw_feedstock", 8, 0, 0, 250, 350, 3000),
      mat("Zinc Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3000),
      mat("Zinc Metal", "finished_product", 100, 0, 0, 250, 0, 3000),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Base Metals",
    resource: "Lead",
    code: "LEA",
    materials: [
      mat("Lead Ore", "raw_feedstock", 8, 0, 0, 250, 350, 3000),
      mat("Lead Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3000),
      mat("Lead Metal", "finished_product", 100, 0, 0, 250, 0, 3000),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Battery / Strategic Minerals",
    resource: "Lithium",
    code: "LIT",
    materials: [
      mat("Spodumene Ore", "raw_feedstock", 55, 0, 0, 250, 400, 3500),
      mat("Spodumene Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3500),
      mat("Lithium Carbonate", "finished_product", 100, 0, 0, 250, 0, 3500),
      mat("Lithium Hydroxide", "finished_product", 100, 0, 0, 250, 0, 3500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Battery / Strategic Minerals",
    resource: "Cobalt",
    code: "COB",
    materials: [
      mat("Cobalt Ore", "raw_feedstock", 8, 0, 0, 250, 400, 3500),
      mat("Cobalt Concentrate", "saleable_product", 100, 0, 0, 250, 0, 3500),
      mat("Cobalt Hydroxide", "finished_product", 100, 0, 0, 250, 0, 3500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Battery / Strategic Minerals",
    resource: "Graphite",
    code: "GRA",
    materials: [
      mat("Graphite Ore", "raw_feedstock", 50, 0, 0, 200, 300, 2500),
      mat("Graphite Concentrate", "saleable_product", 100, 0, 0, 200, 0, 2500),
      mat("Flake Graphite", "finished_product", 100, 0, 0, 200, 0, 2500),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Industrial Minerals",
    resource: "Silica",
    code: "SLC",
    materials: [
      mat("Silica Sand", "saleable_product", 100, 0, 0, 150, 0, 1200),
      mat("Quartz", "saleable_product", 100, 0, 0, 150, 0, 1200),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Industrial Minerals",
    resource: "Limestone",
    code: "LIM",
    materials: [
      mat("Limestone ROM", "raw_feedstock", 85, 0, 0, 150, 150, 1200),
      mat("Limestone Aggregate", "saleable_product", 100, 0, 0, 150, 0, 1200),
      mat("Agricultural Lime", "finished_product", 100, 0, 0, 150, 0, 1200),
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Construction Materials",
    resource: "Aggregates",
    code: "AGG",
    materials: [
      mat("Crusher Run", "saleable_product", 100, 0, 0, 120, 0, 800),
      mat("Road Stone", "saleable_product", 100, 0, 0, 120, 0, 800),
      mat("Building Sand", "saleable_product", 100, 0, 0, 120, 0, 800),
      mat("Plaster Sand", "saleable_product", 100, 0, 0, 120, 0, 800),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Grains",
    resource: "Maize",
    code: "MAI",
    materials: [
      mat("White Maize", "saleable_product", 100, 500),
      mat("Yellow Maize", "saleable_product", 100),
      mat("Feed Maize", "saleable_product", 100),
      mat("Maize Meal", "finished_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Grains",
    resource: "Wheat",
    code: "WHE",
    materials: [
      mat("Milling Wheat", "saleable_product", 100),
      mat("Feed Wheat", "saleable_product", 100),
      mat("Wheat Flour", "finished_product", 100),
      mat("Bran", "finished_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Grains",
    resource: "Sorghum",
    code: "SOR",
    materials: [
      mat("White Sorghum", "saleable_product", 100),
      mat("Red Sorghum", "saleable_product", 100),
      mat("Feed Sorghum", "saleable_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Oilseeds",
    resource: "Soya Beans",
    code: "SOY",
    materials: [
      mat("Soya Beans", "saleable_product", 100),
      mat("Soya Meal", "finished_product", 100),
      mat("Soya Oil", "finished_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Oilseeds",
    resource: "Sunflower",
    code: "SUN",
    materials: [
      mat("Sunflower Seed", "saleable_product", 100),
      mat("Sunflower Oil", "finished_product", 100),
      mat("Sunflower Cake", "finished_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Pulses",
    resource: "Beans",
    code: "BEA",
    materials: [
      mat("Dry Beans", "saleable_product", 100),
      mat("Sugar Beans", "saleable_product", 100),
      mat("Cowpeas", "saleable_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Sugar",
    resource: "Sugar",
    code: "SUG",
    materials: [
      mat("Raw Sugar", "saleable_product", 100),
      mat("Refined Sugar", "finished_product", 100),
      mat("Molasses", "saleable_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Agricultural Inputs",
    resource: "Fertiliser",
    code: "FER",
    materials: [
      mat("Urea", "saleable_product", 100),
      mat("MAP", "saleable_product", 100),
      mat("DAP", "saleable_product", 100),
      mat("LAN", "saleable_product", 100),
      mat("NPK", "saleable_product", 100),
      mat("Potash", "saleable_product", 100),
      mat("Ammonium Sulphate", "saleable_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Animal Feed",
    resource: "Feed Inputs",
    code: "FED",
    materials: [
      mat("Feed Maize", "saleable_product", 100),
      mat("Soya Meal", "saleable_product", 100),
      mat("Sunflower Cake", "saleable_product", 100),
      mat("Molasses", "saleable_product", 100),
      mat("Lucerne", "saleable_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Livestock Products",
    resource: "Beef",
    code: "BEE",
    materials: [
      mat("Live Cattle", "raw_feedstock", 55),
      mat("Carcass Beef", "saleable_product", 100),
      mat("Boxed Beef", "finished_product", 100),
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Livestock Products",
    resource: "Poultry",
    code: "POU",
    materials: [
      mat("Live Broilers", "raw_feedstock", 72),
      mat("Whole Chicken", "saleable_product", 100),
      mat("IQF Portions", "finished_product", 100),
    ],
  },
];

function num(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function txt(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function moneyTon(value: number) {
  return `${money(value)}/t`;
}

function stageLabel(stage: Stage) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "saleable_product") {
    return "Intermediate / Saleable Product";
  }
  return "Finished Product";
}

function dbStage(stage: Stage) {
  if (stage === "saleable_product") return "intermediate_concentrate";
  return stage;
}

function firstResource(cls: CommodityClass, category?: string) {
  return (
    RESOURCES.find(
      (x) => x.cls === cls && (!category || x.category === category)
    ) || RESOURCES[0]
  );
}

function getResource(form: FormState) {
  return (
    RESOURCES.find(
      (x) =>
        x.cls === form.cls &&
        x.category === form.category &&
        x.resource === form.resource
    ) || firstResource(form.cls, form.category)
  );
}

function getMaterial(resource: Resource, materialName: string) {
  return (
    resource.materials.find((x) => x.name === materialName) ||
    resource.materials[0]
  );
}

function parcelCode(resource: Resource) {
  return `PAR-${resource.code}-2026-0001`;
}

function decisionLabel(margin: number) {
  if (margin >= 25) return "Strong Route";
  if (margin >= 18) return "Target Range";
  if (margin >= 15) return "Decent / Improve";
  if (margin > 0) return "Below Target";
  return "Blocked / Negative";
  }
function Card({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  gold,
}: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p
        className={
          gold
            ? "mt-2 text-xl font-black text-[#f5d778]"
            : "mt-2 text-xl font-black text-white"
        }
      >
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-base font-black text-white outline-none focus:border-[#d7ad32]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={String(value)}
        onChange={(event) => onChange(num(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-lg font-black text-white outline-none focus:border-[#d7ad32]"
      />
      {help ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export default function EconomicsEditTools() {
  const supabase = createClient();

  const [parcelId, setParcelId] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    cls: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Chrome",
    material: "ROM",
    productQty: 250,
    yieldPct: 40,
    marketPrice: 2550,
    negotiatedPrice: 2550,
    acquisitionCost: 0,
    logisticsCost: 180,
    processingCost: 350,
    verificationCost: 3500,
    priceNote: "",
  });

  const resource = getResource(form);
  const material = getMaterial(resource, form.material);
  const workingParcelCode = parcelCode(resource);

  const categories = useMemo(
    () =>
      uniq(
        RESOURCES.filter((item) => item.cls === form.cls).map(
          (item) => item.category
        )
      ),
    [form.cls]
  );

  const resourceOptions = useMemo(
    () =>
      RESOURCES.filter(
        (item) =>
          item.cls === form.cls &&
          item.category === form.category
      ).map((item) => item.resource),
    [form.cls, form.category]
  );

  const materialOptions = useMemo(
    () => resource.materials.map((item) => item.name),
    [resource]
  );

  const routeQty =
    material.stage === "raw_feedstock" && form.yieldPct > 0
      ? form.productQty / (form.yieldPct / 100)
      : form.productQty;

  const effectivePrice =
    form.negotiatedPrice > 0
      ? form.negotiatedPrice
      : form.marketPrice;

  const revenue = form.productQty * effectivePrice;
  const acquisitionTotal = routeQty * form.acquisitionCost;
  const logisticsTotal = routeQty * form.logisticsCost;
  const processingTotal = routeQty * form.processingCost;
  const routeCost =
    acquisitionTotal +
    logisticsTotal +
    processingTotal +
    form.verificationCost;

  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;
  const costGap = Math.max(routeCost - revenue * 0.82, 0);

  const targetBuyerPrice =
    margin >= 18 || form.productQty <= 0
      ? effectivePrice
      : Math.ceil(routeCost / (form.productQty * 0.82));

  const costReduction = Math.ceil(costGap);

  const costReductionUnit =
    routeQty > 0 ? Math.ceil(costGap / routeQty) : 0;

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_CODE)
        .single();

      if (!data) return;

      const row = data as Record<string, unknown>;

      const rowResource =
        RESOURCES.find(
          (item) =>
            item.resource === row.resource_type &&
            item.materials.some(
              (mat) => mat.name === row.material_type
            )
        ) || RESOURCES[0];

      const rowMaterial =
        rowResource.materials.find(
          (mat) => mat.name === row.material_type
        ) || rowResource.materials[0];

      setParcelId(String(row.id || ""));

      setForm({
        cls: rowResource.cls,
        category: rowResource.category,
        resource: rowResource.resource,
        material: rowMaterial.name,
        productQty: num(
          row.expected_concentrate_tons,
          num(row.accepted_tons, 250)
        ),
        yieldPct: num(
          row.expected_yield_percent,
          rowMaterial.yieldPct
        ),
        marketPrice: num(
          row.market_reference_price_per_ton,
          rowMaterial.price
        ),
        negotiatedPrice: num(
          row.negotiated_price_per_ton,
          num(row.effective_price_per_ton, rowMaterial.price)
        ),
        acquisitionCost: num(
          row.feedstock_cost_per_ton,
          rowMaterial.acquisition
        ),
        logisticsCost: num(
          row.transport_to_plant_cost_per_ton,
          rowMaterial.logistics
        ),
        processingCost: num(
          row.tolling_cost_per_ton,
          rowMaterial.processing
        ),
        verificationCost: num(
          row.estimated_total_assay_cost,
          rowMaterial.verification
        ),
        priceNote: txt(row.price_override_note, ""),
      });
    }

    load();
  }, [supabase]);

  function resetFromResource(nextResource: Resource) {
    const nextMaterial = nextResource.materials[0];

    setForm((current) => ({
      ...current,
      cls: nextResource.cls,
      category: nextResource.category,
      resource: nextResource.resource,
      material: nextMaterial.name,
      yieldPct: nextMaterial.yieldPct,
      marketPrice: nextMaterial.price,
      negotiatedPrice: nextMaterial.price,
      acquisitionCost: nextMaterial.acquisition,
      logisticsCost: nextMaterial.logistics,
      processingCost: nextMaterial.processing,
      verificationCost: nextMaterial.verification,
      priceNote: "",
    }));
  }

  function applyClass(value: string) {
    const nextResource = firstResource(value as CommodityClass);
    resetFromResource(nextResource);
  }

  function applyCategory(value: string) {
    const nextResource = firstResource(form.cls, value);
    resetFromResource(nextResource);
  }

  function applyResource(value: string) {
    const nextResource =
      RESOURCES.find(
        (item) =>
          item.cls === form.cls &&
          item.category === form.category &&
          item.resource === value
      ) || resource;

    resetFromResource(nextResource);
  }

  function applyMaterial(value: string) {
    const nextMaterial =
      resource.materials.find((item) => item.name === value) ||
      material;

    setForm((current) => ({
      ...current,
      material: nextMaterial.name,
      yieldPct: nextMaterial.yieldPct,
      marketPrice: nextMaterial.price,
      negotiatedPrice: nextMaterial.price,
      acquisitionCost: nextMaterial.acquisition,
      logisticsCost: nextMaterial.logistics,
      processingCost: nextMaterial.processing,
      verificationCost: nextMaterial.verification,
      priceNote: "",
    }));
  }

  async function save() {
    setSaving(true);
    setNotice("");
    setError("");

    if (!parcelId) {
      setError("No active parcel record found.");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("parcels")
      .update({
        working_parcel_code: workingParcelCode,
        commodity_class: form.cls,
        resource_category: form.category,
        resource_type: form.resource,
        material_type: form.material,
        material_stage: dbStage(material.stage),

        expected_concentrate_tons: form.productQty,
        accepted_tons: form.productQty,
        feedstock_tons: routeQty,
        expected_yield_percent: form.yieldPct,

        market_reference_price_per_ton: form.marketPrice,
        negotiated_price_per_ton: form.negotiatedPrice,
        effective_price_per_ton: effectivePrice,
        expected_price_per_ton: effectivePrice,
        price_basis: "market_reference_with_negotiated_override",
        price_override_note: form.priceNote,

        feedstock_cost_per_ton: form.acquisitionCost,
        transport_to_plant_cost_per_ton: form.logisticsCost,
        tolling_cost_per_ton: form.processingCost,
      })
      .eq("id", parcelId);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setNotice("Lead economics saved.");
    setSaving(false);
  }

  return (
    <ResourceShell
      title="Edit Lead Economics"
      subtitle="Cascading commodity selection with editable economics controls."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={workingParcelCode} />
        <Stat label="Class" value={form.cls} />
        <Stat label="Category" value={form.category} />
        <Stat label="Resource" value={form.resource} gold />
        <Stat label="Material" value={form.material} />
        <Stat label="Stage" value={stageLabel(material.stage)} />
      </section>

      <Card label="Commodity Selection" title="Select route material">
        <div className="space-y-3">
          <SelectField
            label="Commodity Class"
            value={form.cls}
            options={["Hard Commodities", "Soft Commodities"]}
            onChange={applyClass}
          />

          <SelectField
            label="Commodity Category"
            value={form.category}
            options={categories}
            onChange={applyCategory}
          />

          <SelectField
            label="Commodity / Resource"
            value={form.resource}
            options={resourceOptions}
            onChange={applyResource}
          />

          <SelectField
            label="Material / Product Type"
            value={form.material}
            options={materialOptions}
            onChange={applyMaterial}
          />
        </div>
      </Card>

      <Card label="Editable Economics" title="Input controls">
        <div className="space-y-3">
          <NumField
            label="Product Quantity"
            value={form.productQty}
            onChange={(value) =>
              setForm({ ...form, productQty: value })
            }
          />

          {material.stage === "raw_feedstock" ? (
            <NumField
              label="Expected Yield %"
              value={form.yieldPct}
              onChange={(value) =>
                setForm({ ...form, yieldPct: value })
              }
              help="Used to calculate feedstock required from raw material."
            />
          ) : null}

          <NumField
            label="Market / Reference Price"
            value={form.marketPrice}
            onChange={(value) =>
              setForm({ ...form, marketPrice: value })
            }
            help="Future live market feed value. Editable for negotiated routes."
          />

          <NumField
            label="Negotiated Buyer Price"
            value={form.negotiatedPrice}
            onChange={(value) =>
              setForm({ ...form, negotiatedPrice: value })
            }
            help="Buyer price override used as effective selling price."
          />

          <NumField
            label="Acquisition Cost / Unit"
            value={form.acquisitionCost}
            onChange={(value) =>
              setForm({ ...form, acquisitionCost: value })
            }
          />

          <NumField
            label="Logistics / Handling Cost / Unit"
            value={form.logisticsCost}
            onChange={(value) =>
              setForm({ ...form, logisticsCost: value })
            }
          />

          <NumField
            label="Verification / Quality Cost"
            value={form.verificationCost}
            onChange={(value) =>
              setForm({ ...form, verificationCost: value })
            }
          />

          <textarea
            value={form.priceNote}
            onChange={(event) =>
              setForm({ ...form, priceNote: event.target.value })
            }
            placeholder="Price note or override reason"
            className="w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-sm font-bold leading-6 text-white outline-none focus:border-[#d7ad32]"
          />

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Lead Economics"}
          </button>

          {notice ? (
            <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-black text-emerald-200">
              {notice}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-black text-red-200">
              {error}
            </p>
          ) : null}
        </div>
      </Card>

      <Card label="Live Result" title="Calculated economics">
        <div className="grid gap-3">
          <Stat
            label={
              material.stage === "raw_feedstock"
                ? "Feedstock Required"
                : "Route Quantity"
            }
            value={routeQty.toFixed(3)}
            gold
          />

          <Stat
            label="Effective Price"
            value={moneyTon(effectivePrice)}
            gold
          />

          <Stat label="Revenue" value={money(revenue)} />
          <Stat label="Route Cost" value={money(routeCost)} />
          <Stat label="Surplus" value={money(surplus)} gold />
          <Stat label="Margin" value={`${margin.toFixed(1)}%`} gold />
          <Stat label="Decision" value={decisionLabel(margin)} />
        </div>
      </Card>

      <Card label="Recommendations" title="Indicative improvement targets">
        <div className="grid gap-3">
          <Stat
            label="Target Buyer Price"
            value={moneyTon(targetBuyerPrice)}
            note="Indicative price needed to move toward an 18% gross margin."
            gold
          />

          <Stat
            label="Total Cost Reduction Needed"
            value={money(costReduction)}
            note="Estimated reduction needed across acquisition, logistics, processing or verification costs."
          />

          <Stat
            label="Cost Reduction / Route Unit"
            value={moneyTon(costReductionUnit)}
            note="Indicative saving required per route ton or product unit."
          />

          <Stat
            label="Commercial Actions"
            value="Negotiate price, cost or charges"
            note="Reduce acquisition cost, reduce logistics, reduce processing/tolling, push buyer price, or move verification/handling charges to plant or buyer side."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
