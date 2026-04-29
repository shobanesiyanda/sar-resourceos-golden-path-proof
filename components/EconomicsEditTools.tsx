"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

const ACTIVE_PARCEL_CODE = "PAR-MAI-2026-0001";

type CommodityStage =
  | "raw_feedstock"
  | "intermediate_concentrate"
  | "saleable_product"
  | "finished_product";

type CatalogueItem = {
  commodityClass: string;
  category: string;
  resource: string;
  material: string;
  stage: CommodityStage;
};

type ParcelRow = Record<string, unknown>;

type FormState = {
  commodityClass: string;
  category: string;
  resource: string;
  material: string;
  stage: CommodityStage;
  productQuantity: number;
  routeQuantity: number;
  marketReferencePrice: number;
  negotiatedBuyerPrice: number;
  acquisitionCost: number;
  logisticsCost: number;
  processingHandlingCost: number;
  verificationQualityCost: number;
  priceNote: string;
};

const CATALOGUE: CatalogueItem[] = [
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "ROM / Tailings / Feedstock", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Tailings 24-26%", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Tailings 26-28%", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome ROM / Tailings 28-30%", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome ROM / Tailings 30-32%", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome ROM / Tailings 32-34%", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Dumps / Sweepings", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Concentrate 38-40%", stage: "intermediate_concentrate" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Concentrate 40-42%", stage: "intermediate_concentrate" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Concentrate 42-44%", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Concentrate 44-46%", stage: "saleable_product" },

  { commodityClass: "Hard Commodities", category: "Coal", resource: "Coal", material: "Thermal Coal ROM", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Coal", resource: "Coal", material: "Thermal Coal Peas", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Coal", resource: "Coal", material: "Thermal Coal Duff", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Coal", resource: "Coal", material: "Export Thermal Coal", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Coal", resource: "Coal", material: "Metallurgical Coal", stage: "saleable_product" },

  { commodityClass: "Hard Commodities", category: "Manganese", resource: "Manganese", material: "Manganese ROM", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Manganese", resource: "Manganese", material: "Manganese Ore 28-30%", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Manganese", resource: "Manganese", material: "Manganese Ore 30-32%", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Manganese", resource: "Manganese", material: "Manganese Ore 32-34%", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Manganese", resource: "Manganese", material: "Manganese Ore 34-36%", stage: "saleable_product" },

  { commodityClass: "Hard Commodities", category: "Iron Ore", resource: "Iron Ore", material: "Iron Ore ROM", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Iron Ore", resource: "Iron Ore", material: "Iron Ore Lump", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Iron Ore", resource: "Iron Ore", material: "Iron Ore Fines", stage: "saleable_product" },

  { commodityClass: "Hard Commodities", category: "Base Metals", resource: "Copper", material: "Copper Ore", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Base Metals", resource: "Copper", material: "Copper Concentrate", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Base Metals", resource: "Nickel", material: "Nickel Ore", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Base Metals", resource: "Nickel", material: "Nickel Concentrate", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Base Metals", resource: "Zinc", material: "Zinc Ore", stage: "raw_feedstock" },
  { commodityClass: "Hard Commodities", category: "Base Metals", resource: "Zinc", material: "Zinc Concentrate", stage: "saleable_product" },

  { commodityClass: "Hard Commodities", category: "Industrial Minerals", resource: "Silica", material: "Silica Sand", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Industrial Minerals", resource: "Limestone", material: "Limestone Aggregate", stage: "saleable_product" },
  { commodityClass: "Hard Commodities", category: "Industrial Minerals", resource: "Aggregate", material: "Crushed Stone", stage: "finished_product" },

  { commodityClass: "Soft Commodities", category: "Grains", resource: "Maize", material: "White Maize", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Maize", material: "Yellow Maize", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Maize", material: "White Maize Grade 1", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Maize", material: "Yellow Maize Grade 1", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Wheat", material: "Milling Wheat", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Wheat", material: "Feed Wheat", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Sorghum", material: "Red Sorghum", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Sorghum", material: "White Sorghum", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Barley", material: "Feed Barley", stage: "saleable_product" },

  { commodityClass: "Soft Commodities", category: "Oilseeds", resource: "Soybeans", material: "Soybeans", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Oilseeds", resource: "Sunflower", material: "Sunflower Seed", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Oilseeds", resource: "Canola", material: "Canola Seed", stage: "saleable_product" },

  { commodityClass: "Soft Commodities", category: "Legumes", resource: "Beans", material: "Dry Beans", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Legumes", resource: "Peas", material: "Field Peas", stage: "saleable_product" },

  { commodityClass: "Soft Commodities", category: "Animal Feed", resource: "Feed Inputs", material: "Maize Feed Grade", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Animal Feed", resource: "Feed Inputs", material: "Soybean Meal", stage: "finished_product" },
  { commodityClass: "Soft Commodities", category: "Animal Feed", resource: "Feed Inputs", material: "Sunflower Cake", stage: "finished_product" },

  { commodityClass: "Agricultural Inputs", category: "Fertiliser", resource: "Urea", material: "Urea 46%", stage: "finished_product" },
  { commodityClass: "Agricultural Inputs", category: "Fertiliser", resource: "MAP", material: "Monoammonium Phosphate", stage: "finished_product" },
  { commodityClass: "Agricultural Inputs", category: "Fertiliser", resource: "LAN", material: "LAN Fertiliser", stage: "finished_product" },
  { commodityClass: "Agricultural Inputs", category: "Fertiliser", resource: "NPK", material: "NPK Blend", stage: "finished_product" },

  { commodityClass: "Finished Products", category: "Packaged Goods", resource: "General Product", material: "Finished Product", stage: "finished_product" },
  { commodityClass: "Finished Products", category: "Building Materials", resource: "Cement", material: "Bagged Cement", stage: "finished_product" },
  { commodityClass: "Finished Products", category: "Building Materials", resource: "Aggregate", material: "Bagged Aggregate", stage: "finished_product" },
];

function num(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function text(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

function stageLabel(stage: CommodityStage | string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") return "Intermediate / Saleable Product";
  if (stage === "saleable_product") return "Saleable Product";
  if (stage === "finished_product") return "Finished Product";
  return "Not captured";
}

function firstOrEmpty(options: string[]) {
  return options[0] || "";
}

function firstItemFor(commodityClass: string, category?: string, resource?: string) {
  return CATALOGUE.find((item) => {
    if (item.commodityClass !== commodityClass) return false;
    if (category && item.category !== category) return false;
    if (resource && item.resource !== resource) return false;
    return true;
  });
}

function getLabels(form: Pick<FormState, "commodityClass" | "category" | "resource" | "material" | "stage">) {
  const commodityClass = form.commodityClass.toLowerCase();
  const resource = form.resource.toLowerCase();
  const category = form.category.toLowerCase();
  const material = form.material.toLowerCase();
  const stage = form.stage;

  const isChrome = resource.includes("chrome") || category.includes("chrome") || material.includes("chrome");
  const isGrain =
    category.includes("grain") ||
    resource.includes("maize") ||
    resource.includes("wheat") ||
    resource.includes("sorghum") ||
    resource.includes("barley") ||
    material.includes("maize") ||
    material.includes("wheat") ||
    material.includes("sorghum") ||
    material.includes("barley");
  const isOilseed =
    category.includes("oilseed") ||
    resource.includes("soy") ||
    resource.includes("sunflower") ||
    resource.includes("canola") ||
    material.includes("soy") ||
    material.includes("sunflower") ||
    material.includes("canola");
  const isSoftCommodity = commodityClass.includes("soft");
  const isFinished = stage === "finished_product" || commodityClass.includes("finished") || commodityClass.includes("agricultural inputs");

  if (isChrome && stage === "raw_feedstock") {
    return {
      quantity: "Feedstock / ROM Tons",
      routeQuantity: "Feedstock Route Tons",
      marketPrice: "Market / Reference Price",
      negotiatedPrice: "Negotiated Buyer Price",
      acquisition: "Feedstock Cost / Ton",
      logistics: "Transport to Plant Cost / Ton",
      processing: "Tolling / Processing Cost / Ton",
      verification: "Assay / Verification Cost",
      note: "Chrome raw feedstock uses ROM, tailings, wash plant, tolling, beneficiation, recovery, yield and assay wording.",
      processingHelp: "Use this only where the route includes wash plant, tolling or processing.",
    };
  }

  if (isChrome && (stage === "intermediate_concentrate" || stage === "saleable_product")) {
    return {
      quantity: "Concentrate Tons",
      routeQuantity: "Delivery Route Tons",
      marketPrice: "Market / Reference Price",
      negotiatedPrice: "Negotiated Buyer Price",
      acquisition: "Concentrate Acquisition Cost / Ton",
      logistics: "Transport / Delivery Cost / Ton",
      processing: "Handling / Storage Cost / Ton",
      verification: "Concentrate Assay Cost",
      note: "Chrome concentrate uses concentrate, buyer/offtake, grade, assay, transport and delivery basis wording.",
      processingHelp: "Do not show raw-feedstock wash/tolling requirements unless this route includes processing.",
    };
  }

  if (isGrain) {
    return {
      quantity: "Product Quantity",
      routeQuantity: "Route Quantity",
      marketPrice: "Market / Reference Price",
      negotiatedPrice: "Negotiated Buyer Price",
      acquisition: "Acquisition / Source Cost / Unit",
      logistics: "Logistics / Handling Cost / Unit",
      processing: "Packaging / Handling Cost / Unit",
      verification: "Quality / Moisture / Grade Evidence Cost",
      note: "Grain saleable product uses supplier/source, grade, quantity, storage, handling, packaging, transport, buyer/offtake and quality evidence wording.",
      processingHelp: "Grain must not show wash plant, tolling, beneficiation, ROM, feedstock yield or concentrate wording.",
    };
  }

  if (isOilseed || isSoftCommodity) {
    return {
      quantity: "Product Quantity",
      routeQuantity: "Route Quantity",
      marketPrice: "Market / Reference Price",
      negotiatedPrice: "Negotiated Buyer Price",
      acquisition: "Source / Supplier Cost / Unit",
      logistics: "Logistics / Handling Cost / Unit",
      processing: "Storage / Packaging / Handling Cost / Unit",
      verification: "Quality / Grade Evidence Cost",
      note: "Soft commodities use source, grade, quantity, storage, handling, packaging, transport, buyer/offtake and quality evidence wording.",
      processingHelp: "Use storage, handling or packaging cost where applicable.",
    };
  }

  if (isFinished) {
    return {
      quantity: "Product Quantity",
      routeQuantity: "Delivery Quantity",
      marketPrice: "Market / Reference Price",
      negotiatedPrice: "Negotiated Buyer Price",
      acquisition: "Product Acquisition Cost / Unit",
      logistics: "Logistics / Delivery Cost / Unit",
      processing: "Packaging / Handling Cost / Unit",
      verification: "Quality / Verification Cost",
      note: "Finished products use product-specific supply, quality, storage, packaging, transport, buyer/offtake and delivery controls.",
      processingHelp: "Use packaging, handling or route-preparation cost where applicable.",
    };
  }

  return {
    quantity: "Product Quantity",
    routeQuantity: "Route Quantity",
    marketPrice: "Market / Reference Price",
    negotiatedPrice: "Negotiated Buyer Price",
    acquisition: "Acquisition / Source Cost / Unit",
    logistics: "Transport / Logistics / Handling Cost / Unit",
    processing: "Processing / Handling Cost / Unit",
    verification: "Verification / Quality Cost",
    note: "Commodity-specific labels are driven from the current selected form state.",
    processingHelp: "This label updates when commodity, material or stage changes.",
  };
}

function getInitialForm(row: ParcelRow | null): FormState {
  const rowClass = text(row?.commodity_class, "Soft Commodities");
  const rowCategory = text(row?.resource_category, "Grains");
  const rowResource = text(row?.resource_type, "Maize");
  const rowMaterial = text(row?.material_type, "White Maize");
  const matchingItem =
    CATALOGUE.find(
      (item) =>
        item.commodityClass === rowClass &&
        item.category === rowCategory &&
        item.resource === rowResource &&
        item.material === rowMaterial
    ) || firstItemFor(rowClass, rowCategory, rowResource) || firstItemFor("Soft Commodities", "Grains", "Maize") || CATALOGUE[0];

  const commodityClass = matchingItem?.commodityClass || rowClass;
  const category = matchingItem?.category || rowCategory;
  const resource = matchingItem?.resource || rowResource;
  const material = matchingItem?.material || rowMaterial;
  const stage = (matchingItem?.stage || text(row?.material_stage, "saleable_product")) as CommodityStage;

  const productQuantity = num(row?.expected_concentrate_tons, num(row?.accepted_tons, 250));
  const routeQuantity = num(row?.feedstock_tons, productQuantity);
  const marketReferencePrice = num(row?.market_reference_price_per_ton, 0);
  const negotiatedBuyerPrice = num(row?.negotiated_price_per_ton, 0);

  return {
    commodityClass,
    category,
    resource,
    material,
    stage,
    productQuantity,
    routeQuantity,
    marketReferencePrice,
    negotiatedBuyerPrice,
    acquisitionCost: num(row?.feedstock_cost_per_ton, 0),
    logisticsCost: num(row?.transport_to_plant_cost_per_ton, 0),
    processingHandlingCost: num(row?.tolling_cost_per_ton, 0),
    verificationQualityCost: num(row?.estimated_total_assay_cost, 0),
    priceNote: text(row?.pricing_note, ""),
  };
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  gold,
  danger,
}: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p
        className={
          danger
            ? "mt-2 text-xl font-black text-red-200"
            : gold
            ? "mt-2 text-xl font-black text-[#f5d778]"
            : "mt-2 text-xl font-black text-white"
        }
      >
        {value}
      </p>
      {note ? <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p> : null}
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
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base font-black text-white outline-none focus:border-[#d7ad32]"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950 text-white">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
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
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>
      <input
        value={String(value)}
        inputMode="decimal"
        onChange={(event) => onChange(num(event.target.value, 0))}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-xl font-black text-white outline-none focus:border-[#d7ad32]"
      />
      {help ? <span className="mt-2 block text-sm leading-6 text-slate-400">{help}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-sm font-black text-slate-300">{label}</span>
      <textarea
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base font-bold text-white outline-none focus:border-[#d7ad32]"
      />
    </label>
  );
}

export function EconomicsEditTools() {
  const supabase = createClient() as any;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(() => getInitialForm(null));

  useEffect(() => {
    async function loadParcel() {
      setLoading(true);
      setError("");
      setMessage("");

      const { data, error: loadError } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", ACTIVE_PARCEL_CODE)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }

      setForm(getInitialForm((data || null) as ParcelRow | null));
      setLoading(false);
    }

    loadParcel();
  }, [supabase]);

  const classOptions = useMemo(() => unique(CATALOGUE.map((item) => item.commodityClass)), []);

  const categoryOptions = useMemo(
    () =>
      unique(
        CATALOGUE.filter((item) => item.commodityClass === form.commodityClass).map((item) => item.category)
      ),
    [form.commodityClass]
  );

  const resourceOptions = useMemo(
    () =>
      unique(
        CATALOGUE.filter(
          (item) => item.commodityClass === form.commodityClass && item.category === form.category
        ).map((item) => item.resource)
      ),
    [form.commodityClass, form.category]
  );

  const materialOptions = useMemo(
    () =>
      unique(
        CATALOGUE.filter(
          (item) =>
            item.commodityClass === form.commodityClass &&
            item.category === form.category &&
            item.resource === form.resource
        ).map((item) => item.material)
      ),
    [form.commodityClass, form.category, form.resource]
  );

  const labels = useMemo(() => getLabels(form), [form]);

  const effectivePrice = form.negotiatedBuyerPrice > 0 ? form.negotiatedBuyerPrice : form.marketReferencePrice;
  const acquisitionTotal = form.routeQuantity * form.acquisitionCost;
  const logisticsTotal = form.routeQuantity * form.logisticsCost;
  const processingTotal = form.routeQuantity * form.processingHandlingCost;
  const routeCost = acquisitionTotal + logisticsTotal + processingTotal + form.verificationQualityCost;
  const revenue = form.productQuantity * effectivePrice;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  function setCommodityClass(value: string) {
    const categories = unique(CATALOGUE.filter((item) => item.commodityClass === value).map((item) => item.category));
    const category = firstOrEmpty(categories);
    const resources = unique(
      CATALOGUE.filter((item) => item.commodityClass === value && item.category === category).map((item) => item.resource)
    );
    const resource = firstOrEmpty(resources);
    const item = firstItemFor(value, category, resource);

    if (!item) return;

    setForm({
      ...form,
      commodityClass: value,
      category,
      resource,
      material: item.material,
      stage: item.stage,
    });
  }

  function setCategory(value: string) {
    const resources = unique(
      CATALOGUE.filter((item) => item.commodityClass === form.commodityClass && item.category === value).map(
        (item) => item.resource
      )
    );
    const resource = firstOrEmpty(resources);
    const item = firstItemFor(form.commodityClass, value, resource);

    if (!item) return;

    setForm({
      ...form,
      category: value,
      resource,
      material: item.material,
      stage: item.stage,
    });
  }

  function setResource(value: string) {
    const item = firstItemFor(form.commodityClass, form.category, value);

    if (!item) return;

    setForm({
      ...form,
      resource: value,
      material: item.material,
      stage: item.stage,
    });
  }

  function setMaterial(value: string) {
    const item = CATALOGUE.find(
      (entry) =>
        entry.commodityClass === form.commodityClass &&
        entry.category === form.category &&
        entry.resource === form.resource &&
        entry.material === value
    );

    setForm({
      ...form,
      material: value,
      stage: item?.stage || form.stage,
    });
  }

  async function saveParcel() {
    setSaving(true);
    setError("");
    setMessage("");

    const payload: any = {
      commodity_class: form.commodityClass,
      resource_category: form.category,
      resource_type: form.resource,
      material_type: form.material,
      material_stage: form.stage,
      expected_concentrate_tons: form.productQuantity,
      accepted_tons: form.productQuantity,
      feedstock_tons: form.routeQuantity,
      market_reference_price_per_ton: form.marketReferencePrice,
      negotiated_price_per_ton: form.negotiatedBuyerPrice,
      effective_price_per_ton: effectivePrice,
      feedstock_cost_per_ton: form.acquisitionCost,
      transport_to_plant_cost_per_ton: form.logisticsCost,
      tolling_cost_per_ton: form.processingHandlingCost,
      estimated_total_assay_cost: form.verificationQualityCost,
      pricing_note: form.priceNote,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase
      .from("parcels")
      .update(payload)
      .eq("parcel_code", ACTIVE_PARCEL_CODE);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setMessage("Saved. Commodity-specific labels and parcel economics updated.");
    setSaving(false);
  }

  if (loading) {
    return (
      <Section label="Economics Editor" title="Loading saved parcel">
        <p className="text-sm leading-6 text-slate-400">Reading current parcel values.</p>
      </Section>
    );
  }

  return (
    <div className="grid gap-5">
      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
          {message}
        </div>
      ) : null}

      <Section label="Commodity Selection" title="Live product pack selector">
        <SelectField
          label="Commodity Class"
          value={form.commodityClass}
          options={classOptions}
          onChange={setCommodityClass}
        />

        <SelectField
          label="Commodity Category"
          value={form.category}
          options={categoryOptions}
          onChange={setCategory}
        />

        <SelectField
          label="Commodity / Resource"
          value={form.resource}
          options={resourceOptions}
          onChange={setResource}
        />

        <SelectField
          label="Material / Product Type"
          value={form.material}
          options={materialOptions}
          onChange={setMaterial}
        />

        <Stat label="Material Stage" value={stageLabel(form.stage)} gold />
        <Stat label="Terminology Control" value="Live" gold note={labels.note} />
      </Section>

      <Section label="Commercial Inputs" title="Commodity-specific editing fields">
        <NumberField
          label={labels.quantity}
          value={form.productQuantity}
          onChange={(value) =>
            setForm({
              ...form,
              productQuantity: value,
              routeQuantity: form.routeQuantity > 0 ? form.routeQuantity : value,
            })
          }
        />

        <NumberField
          label={labels.routeQuantity}
          value={form.routeQuantity}
          onChange={(value) => setForm({ ...form, routeQuantity: value })}
        />

        <NumberField
          label={labels.marketPrice}
          value={form.marketReferencePrice}
          onChange={(value) => setForm({ ...form, marketReferencePrice: value })}
          help="Reference price is advisory. Negotiated buyer price overrides it when captured."
        />

        <NumberField
          label={labels.negotiatedPrice}
          value={form.negotiatedBuyerPrice}
          onChange={(value) => setForm({ ...form, negotiatedBuyerPrice: value })}
          help="Buyer price override used as effective selling price."
        />

        <NumberField
          label={labels.acquisition}
          value={form.acquisitionCost}
          onChange={(value) => setForm({ ...form, acquisitionCost: value })}
        />

        <NumberField
          label={labels.logistics}
          value={form.logisticsCost}
          onChange={(value) => setForm({ ...form, logisticsCost: value })}
        />

        <NumberField
          label={labels.processing}
          value={form.processingHandlingCost}
          onChange={(value) => setForm({ ...form, processingHandlingCost: value })}
          help={labels.processingHelp}
        />

        <NumberField
          label={labels.verification}
          value={form.verificationQualityCost}
          onChange={(value) => setForm({ ...form, verificationQualityCost: value })}
        />

        <TextAreaField
          label="Price note or override reason"
          value={form.priceNote}
          onChange={(value) => setForm({ ...form, priceNote: value })}
        />
      </Section>

      <Section label="Live Result" title="Preview before saving">
        <Stat label="Effective Selling Price" value={money(effectivePrice)} gold={effectivePrice > 0} />
        <Stat label="Acquisition Total" value={money(acquisitionTotal)} />
        <Stat label="Logistics / Handling Total" value={money(logisticsTotal)} />
        <Stat label="Processing / Handling Total" value={money(processingTotal)} />
        <Stat label="Verification / Quality Cost" value={money(form.verificationQualityCost)} />
        <Stat label="Total Route Cost" value={money(routeCost)} gold={routeCost > 0} />
        <Stat label="Revenue" value={money(revenue)} gold={revenue > 0} />
        <Stat label="Surplus" value={money(surplus)} gold={surplus > 0} danger={surplus < 0} />
        <Stat label="Margin" value={`${margin.toFixed(1)}%`} gold={margin >= 18} danger={margin < 0} />

        <button
          type="button"
          onClick={saveParcel}
          disabled={saving}
          className="rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-slate-950 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Parcel Economics"}
        </button>
      </Section>
    </div>
  );
}

export default EconomicsEditTools;
