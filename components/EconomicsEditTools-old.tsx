"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

const ACTIVE_PARCEL_CODE = "PAR-MAI-2026-0001";

type Stage = "raw_feedstock" | "intermediate_concentrate" | "saleable_product" | "finished_product";
type Row = Record<string, unknown>;

type CatalogueItem = {
  commodityClass: string;
  category: string;
  resource: string;
  material: string;
  stage: Stage;
};

type FormState = {
  commodityClass: string;
  category: string;
  resource: string;
  material: string;
  stage: Stage;
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
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Concentrate 40-42%", stage: "intermediate_concentrate" },
  { commodityClass: "Hard Commodities", category: "Chrome", resource: "Chrome", material: "Chrome Concentrate 42-44%", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Maize", material: "White Maize", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Maize", material: "Yellow Maize", stage: "saleable_product" },
  { commodityClass: "Soft Commodities", category: "Grains", resource: "Wheat", material: "Milling Wheat", stage: "saleable_product" },
  { commodityClass: "Finished Products", category: "Packaged Goods", resource: "General Product", material: "Finished Product", stage: "finished_product" },
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

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") return "Intermediate / Saleable Product";
  if (stage === "saleable_product") return "Saleable Product";
  if (stage === "finished_product") return "Finished Product";
  return "Not captured";
}

function labelsFor(form: Pick<FormState, "commodityClass" | "category" | "resource" | "material" | "stage">) {
  const category = form.category.toLowerCase();
  const resource = form.resource.toLowerCase();
  const material = form.material.toLowerCase();
  const isChrome = category.includes("chrome") || resource.includes("chrome") || material.includes("chrome");
  const isGrain = category.includes("grain") || resource.includes("maize") || resource.includes("wheat") || material.includes("maize") || material.includes("wheat");

  if (isChrome && form.stage === "raw_feedstock") {
    return {
      quantity: "Feedstock / ROM Tons",
      routeQuantity: "Feedstock Route Tons",
      marketPrice: "Market / Reference Price",
      negotiatedPrice: "Negotiated Buyer Price",
      acquisition: "Feedstock Cost / Ton",
      logistics: "Transport to Plant Cost / Ton",
      processing: "Tolling / Processing Cost / Ton",
      verification: "Assay / Verification Cost",
      note: "Chrome raw feedstock uses ROM, tailings, wash plant, tolling, beneficiation, yield and assay wording.",
      processingHelp: "Use this only where the route includes wash plant, tolling or processing.",
    };
  }

  if (isChrome) {
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
      processingHelp: "Do not show raw-feedstock wash/tolling requirements unless the route includes processing.",
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

  if (form.stage === "finished_product" || form.commodityClass === "Finished Products") {
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
    note: "Labels are recalculated from the current selected commodity, material and stage.",
    processingHelp: "This label updates when the commodity selection changes.",
  };
}

function initialForm(row: Row | null): FormState {
  const productQuantity = num(row?.expected_concentrate_tons, num(row?.accepted_tons, 250));
  return {
    commodityClass: txt(row?.commodity_class, "Soft Commodities"),
    category: txt(row?.resource_category, "Grains"),
    resource: txt(row?.resource_type, "Maize"),
    material: txt(row?.material_type, "White Maize"),
    stage: txt(row?.material_stage, "saleable_product") as Stage,
    productQuantity,
    routeQuantity: num(row?.feedstock_tons, productQuantity),
    marketReferencePrice: num(row?.market_reference_price_per_ton, 0),
    negotiatedBuyerPrice: num(row?.negotiated_price_per_ton, 0),
    acquisitionCost: num(row?.feedstock_cost_per_ton, 0),
    logisticsCost: num(row?.transport_to_plant_cost_per_ton, 0),
    processingHandlingCost: num(row?.tolling_cost_per_ton, 0),
    verificationQualityCost: num(row?.estimated_total_assay_cost, 0),
    priceNote: txt(row?.pricing_note, ""),
  };
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">{label}</p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Stat({ label, value, note, gold, danger }: { label: string; value: string; note?: string; gold?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={danger ? "mt-2 text-xl font-black text-red-200" : gold ? "mt-2 text-xl font-black text-[#f5d778]" : "mt-2 text-xl font-black text-white"}>{value}</p>
      {note ? <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p> : null}
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base font-black text-white outline-none focus:border-[#d7ad32]">
        {options.map((option) => <option key={option} value={option} className="bg-slate-950 text-white">{option}</option>)}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange, help }: { label: string; value: number; onChange: (value: number) => void; help?: string }) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <input value={String(value)} inputMode="decimal" onChange={(e) => onChange(num(e.target.value, 0))} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-xl font-black text-white outline-none focus:border-[#d7ad32]" />
      {help ? <span className="mt-2 block text-sm leading-6 text-slate-400">{help}</span> : null}
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-sm font-black text-slate-300">{label}</span>
      <textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base font-bold text-white outline-none focus:border-[#d7ad32]" />
    </label>
  );
}

export function EconomicsEditTools() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(() => initialForm(null));

  useEffect(() => {
    async function loadParcel() {
      setLoading(true);
      setError("");
      const { data, error: loadError } = await supabase.from("parcels").select("*").eq("parcel_code", ACTIVE_PARCEL_CODE).single();
      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }
      setForm(initialForm((data || null) as Row | null));
      setLoading(false);
    }
    loadParcel();
  }, [supabase]);

  const classOptions = useMemo(() => unique(CATALOGUE.map((i) => i.commodityClass)), []);
  const categoryOptions = useMemo(() => unique(CATALOGUE.filter((i) => i.commodityClass === form.commodityClass).map((i) => i.category)), [form.commodityClass]);
  const resourceOptions = useMemo(() => unique(CATALOGUE.filter((i) => i.commodityClass === form.commodityClass && i.category === form.category).map((i) => i.resource)), [form.commodityClass, form.category]);
  const materialOptions = useMemo(() => unique(CATALOGUE.filter((i) => i.commodityClass === form.commodityClass && i.category === form.category && i.resource === form.resource).map((i) => i.material)), [form.commodityClass, form.category, form.resource]);
  const labels = useMemo(() => labelsFor(form), [form]);

  const effectivePrice = form.negotiatedBuyerPrice > 0 ? form.negotiatedBuyerPrice : form.marketReferencePrice;
  const acquisitionTotal = form.routeQuantity * form.acquisitionCost;
  const logisticsTotal = form.routeQuantity * form.logisticsCost;
  const processingTotal = form.routeQuantity * form.processingHandlingCost;
  const routeCost = acquisitionTotal + logisticsTotal + processingTotal + form.verificationQualityCost;
  const revenue = form.productQuantity * effectivePrice;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  function setByItem(item: CatalogueItem, patch: Partial<FormState> = {}) {
    setForm({ ...form, ...patch, commodityClass: item.commodityClass, category: item.category, resource: item.resource, material: item.material, stage: item.stage });
  }

  function selectClass(value: string) {
    const item = CATALOGUE.find((i) => i.commodityClass === value);
    if (item) setByItem(item);
  }

  function selectCategory(value: string) {
    const item = CATALOGUE.find((i) => i.commodityClass === form.commodityClass && i.category === value);
    if (item) setByItem(item);
  }

  function selectResource(value: string) {
    const item = CATALOGUE.find((i) => i.commodityClass === form.commodityClass && i.category === form.category && i.resource === value);
    if (item) setByItem(item);
  }

  function selectMaterial(value: string) {
    const item = CATALOGUE.find((i) => i.commodityClass === form.commodityClass && i.category === form.category && i.resource === form.resource && i.material === value);
    if (item) setByItem(item);
  }

  async function saveParcel() {
    setSaving(true);
    setError("");
    setMessage("");

    const { error: saveError } = await supabase.from("parcels").update({
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
    }).eq("parcel_code", ACTIVE_PARCEL_CODE);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setMessage("Saved. Commodity-specific labels and parcel economics updated.");
    setSaving(false);
  }

  if (loading) {
    return <Section label="Economics Editor" title="Loading saved parcel"><p className="text-sm leading-6 text-slate-400">Reading current parcel values.</p></Section>;
  }

  return (
    <div className="grid gap-5">
      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">{message}</div> : null}

      <Section label="Commodity Selection" title="Live product pack selector">
        <SelectField label="Commodity Class" value={form.commodityClass} options={classOptions} onChange={selectClass} />
        <SelectField label="Commodity Category" value={form.category} options={categoryOptions} onChange={selectCategory} />
        <SelectField label="Commodity / Resource" value={form.resource} options={resourceOptions} onChange={selectResource} />
        <SelectField label="Material / Product Type" value={form.material} options={materialOptions} onChange={selectMaterial} />
        <Stat label="Material Stage" value={stageLabel(form.stage)} gold />
        <Stat label="Terminology Control" value="Live" gold note={labels.note} />
      </Section>

      <Section label="Commercial Inputs" title="Commodity-specific editing fields">
        <NumberField label={labels.quantity} value={form.productQuantity} onChange={(v) => setForm({ ...form, productQuantity: v, routeQuantity: form.routeQuantity > 0 ? form.routeQuantity : v })} />
        <NumberField label={labels.routeQuantity} value={form.routeQuantity} onChange={(v) => setForm({ ...form, routeQuantity: v })} />
        <NumberField label={labels.marketPrice} value={form.marketReferencePrice} onChange={(v) => setForm({ ...form, marketReferencePrice: v })} help="Reference price is advisory. Negotiated buyer price overrides it when captured." />
        <NumberField label={labels.negotiatedPrice} value={form.negotiatedBuyerPrice} onChange={(v) => setForm({ ...form, negotiatedBuyerPrice: v })} help="Buyer price override used as effective selling price." />
        <NumberField label={labels.acquisition} value={form.acquisitionCost} onChange={(v) => setForm({ ...form, acquisitionCost: v })} />
        <NumberField label={labels.logistics} value={form.logisticsCost} onChange={(v) => setForm({ ...form, logisticsCost: v })} />
        <NumberField label={labels.processing} value={form.processingHandlingCost} onChange={(v) => setForm({ ...form, processingHandlingCost: v })} help={labels.processingHelp} />
        <NumberField label={labels.verification} value={form.verificationQualityCost} onChange={(v) => setForm({ ...form, verificationQualityCost: v })} />
        <TextAreaField label="Price note or override reason" value={form.priceNote} onChange={(v) => setForm({ ...form, priceNote: v })} />
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
        <button type="button" onClick={saveParcel} disabled={saving} className="rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-slate-950 disabled:opacity-60">{saving ? "Saving..." : "Save Parcel Economics"}</button>
      </Section>
    </div>
  );
}

export default EconomicsEditTools;
