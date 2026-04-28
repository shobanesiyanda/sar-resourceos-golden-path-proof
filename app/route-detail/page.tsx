"use client";

import { useEffect, useMemo, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

const SEED_CODE = "PAR-CHR-2026-0001";

type Row = Record<string, unknown>;

type LoadState = {
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
  row: Row | null;
};

type RouteForm = {
  supplier_source_name: string;
  origin_loading_point: string;
  storage_handling_location: string;
  processing_handling_basis: string;
  transporter_name: string;
  buyer_offtake_name: string;
  buyer_delivery_point: string;
  delivery_basis: string;
  quality_grade_evidence_note: string;
  route_notes: string;
  feedstock_cost_per_ton: string;
  transport_to_plant_cost_per_ton: string;
  tolling_cost_per_ton: string;
  estimated_total_assay_cost: string;
};

const EMPTY_FORM: RouteForm = {
  supplier_source_name: "",
  origin_loading_point: "",
  storage_handling_location: "",
  processing_handling_basis: "",
  transporter_name: "",
  buyer_offtake_name: "",
  buyer_delivery_point: "",
  delivery_basis: "",
  quality_grade_evidence_note: "",
  route_notes: "",
  feedstock_cost_per_ton: "",
  transport_to_plant_cost_per_ton: "",
  tolling_cost_per_ton: "",
  estimated_total_assay_cost: "",
};

function num(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function txt(value: unknown, fallback = "Not captured") {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function formTxt(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

function moneyValue(value: number) {
  return value > 0 ? money(value) : "Not captured";
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate" || stage === "saleable_product") {
    return "Intermediate / Saleable Product";
  }
  if (stage === "finished_product") return "Finished Product";
  return stage || "Not captured";
}

function isRawFeedstock(stage: string) {
  return stage === "raw_feedstock";
}

function isSaleable(stage: string) {
  return stage === "intermediate_concentrate" || stage === "saleable_product";
}

function isFinished(stage: string) {
  return stage === "finished_product";
}

function isChrome(resource: string, material: string) {
  return `${resource} ${material}`.toLowerCase().includes("chrome");
}

function isGrain(resource: string, category: string, material: string) {
  const text = `${resource} ${category} ${material}`.toLowerCase();
  return (
    text.includes("maize") ||
    text.includes("grain") ||
    text.includes("wheat") ||
    text.includes("sorghum") ||
    text.includes("soy") ||
    text.includes("sugar")
  );
}

function routeTerms(model: ReturnType<typeof getModel>) {
  const raw = isRawFeedstock(model.stage);
  const saleable = isSaleable(model.stage);
  const finished = isFinished(model.stage);
  const chrome = isChrome(model.resource, model.material);
  const grain = isGrain(model.resource, model.category, model.material);

  if (chrome && raw) {
    return {
      profileTitle: "Chrome raw feedstock route capture",
      sourceLabel: "Supplier / Feedstock Source",
      originLabel: "ROM / Tailings Loading Point",
      storageLabel: "Stockpile / Loading Control",
      handlingLabel: "Wash Plant / Tolling Basis",
      transporterLabel: "Transporter / Logistics Provider",
      buyerLabel: "Buyer / Offtake",
      deliveryPointLabel: "Buyer / Delivery Point",
      deliveryBasisLabel: "Delivery Basis",
      qualityLabel: "Assay / Grade / Recovery Evidence",
      notesLabel: "Route Notes",
      sourceCostLabel: "Feedstock Cost / Unit",
      transportCostLabel: "Transport Cost / Unit",
      processingCostLabel: "Wash Plant / Tolling Cost / Unit",
      verificationCostLabel: "Assay / Verification Cost",
      handlingRequired: true,
      qualityHelp: "Capture Cr2O3 grade, recovery/yield basis, sampling support and assay reference.",
    };
  }

  if (chrome && (saleable || finished)) {
    return {
      profileTitle: "Chrome concentrate route capture",
      sourceLabel: "Supplier / Concentrate Source",
      originLabel: "Stockpile / Loading Point",
      storageLabel: "Stockpile / Handling",
      handlingLabel: "Processing / Tolling Basis",
      transporterLabel: "Transporter / Logistics Provider",
      buyerLabel: "Buyer / Offtake",
      deliveryPointLabel: "Buyer / Delivery Point",
      deliveryBasisLabel: "Delivery Basis",
      qualityLabel: "Grade / Assay Evidence",
      notesLabel: "Route Notes",
      sourceCostLabel: "Concentrate Acquisition Cost / Unit",
      transportCostLabel: "Transport Cost / Unit",
      processingCostLabel: "Processing Cost / Unit",
      verificationCostLabel: "Assay / Verification Cost",
      handlingRequired: false,
      qualityHelp: "Capture concentrate grade, assay support, moisture if applicable and buyer acceptance basis.",
    };
  }

  if (grain) {
    return {
      profileTitle: "Grain saleable product route capture",
      sourceLabel: "Supplier / Grain Source",
      originLabel: "Origin / Loading Point",
      storageLabel: "Storage / Handling Location",
      handlingLabel: "Packaging / Handling Basis",
      transporterLabel: "Transporter / Logistics Provider",
      buyerLabel: "Buyer / Offtake",
      deliveryPointLabel: "Buyer / Delivery Point",
      deliveryBasisLabel: "Delivery Basis",
      qualityLabel: "Quality / Moisture / Grade Evidence",
      notesLabel: "Route Notes",
      sourceCostLabel: "Acquisition / Source Cost / Unit",
      transportCostLabel: "Transport / Logistics / Handling Cost / Unit",
      processingCostLabel: "Packaging / Handling Cost / Unit",
      verificationCostLabel: "Verification / Quality Cost",
      handlingRequired: false,
      qualityHelp: "Capture grade, moisture, quality evidence, storage condition and buyer acceptance basis.",
    };
  }

  if (finished) {
    return {
      profileTitle: "Finished product route capture",
      sourceLabel: "Supplier / Product Source",
      originLabel: "Origin / Loading Point",
      storageLabel: "Storage / Packaging Location",
      handlingLabel: "Packaging / Handling Basis",
      transporterLabel: "Transporter / Logistics Provider",
      buyerLabel: "Buyer / Offtake",
      deliveryPointLabel: "Buyer / Delivery Point",
      deliveryBasisLabel: "Delivery Basis",
      qualityLabel: "Product Quality Evidence",
      notesLabel: "Route Notes",
      sourceCostLabel: "Product Acquisition Cost / Unit",
      transportCostLabel: "Transport / Logistics Cost / Unit",
      processingCostLabel: "Packaging / Handling Cost / Unit",
      verificationCostLabel: "Quality / Verification Cost",
      handlingRequired: false,
      qualityHelp: "Capture product specification, quality evidence, packaging condition and buyer acceptance basis.",
    };
  }

  return {
    profileTitle: raw ? "Raw material route capture" : "Saleable product route capture",
    sourceLabel: "Supplier / Source",
    originLabel: "Origin / Loading Point",
    storageLabel: "Storage / Handling Location",
    handlingLabel: raw ? "Processing / Plant Basis" : "Processing / Handling Basis",
    transporterLabel: "Transporter / Logistics Provider",
    buyerLabel: "Buyer / Offtake",
    deliveryPointLabel: "Buyer / Delivery Point",
    deliveryBasisLabel: "Delivery Basis",
    qualityLabel: "Quality / Grade Evidence",
    notesLabel: "Route Notes",
    sourceCostLabel: "Acquisition / Source Cost / Unit",
    transportCostLabel: "Transport / Logistics Cost / Unit",
    processingCostLabel: raw ? "Processing Cost / Unit" : "Processing / Handling Cost / Unit",
    verificationCostLabel: "Verification / Quality Cost",
    handlingRequired: raw,
    qualityHelp: "Capture the quality, grade, specification or acceptance basis required for the selected material.",
  };
}

function getModel(row: Row) {
  const parcelCode = txt(row.working_parcel_code, txt(row.parcel_code, SEED_CODE));
  const databaseParcelCode = txt(row.parcel_code, SEED_CODE);
  const commodityClass = txt(row.commodity_class);
  const category = txt(row.resource_category);
  const resource = txt(row.resource_type);
  const material = txt(row.material_type);
  const stage = txt(row.material_stage);
  const productQty = num(row.expected_concentrate_tons, num(row.accepted_tons, 0));
  const routeQty = num(row.feedstock_tons, productQty);
  const marketPrice = num(row.market_reference_price_per_ton, 0);
  const negotiatedPrice = num(row.negotiated_price_per_ton, 0);
  const effectivePrice = num(row.effective_price_per_ton, negotiatedPrice > 0 ? negotiatedPrice : marketPrice);
  const acquisitionUnit = num(row.feedstock_cost_per_ton, 0);
  const logisticsUnit = num(row.transport_to_plant_cost_per_ton, 0);
  const processingUnit = num(row.tolling_cost_per_ton, 0);
  const verificationCost = num(row.estimated_total_assay_cost, 0);
  const acquisitionTotal = routeQty * acquisitionUnit;
  const logisticsTotal = routeQty * logisticsUnit;
  const processingTotal = routeQty * processingUnit;
  const routeCost = acquisitionTotal + logisticsTotal + processingTotal + verificationCost;
  const revenue = productQty * effectivePrice;
  const hasCost = routeCost > 0;
  const surplus = hasCost && revenue > 0 ? revenue - routeCost : 0;
  const margin = hasCost && revenue > 0 ? (surplus / revenue) * 100 : 0;

  return {
    parcelCode,
    databaseParcelCode,
    commodityClass,
    category,
    resource,
    material,
    stage,
    productQty,
    routeQty,
    marketPrice,
    negotiatedPrice,
    effectivePrice,
    acquisitionUnit,
    logisticsUnit,
    processingUnit,
    verificationCost,
    acquisitionTotal,
    logisticsTotal,
    processingTotal,
    routeCost,
    revenue,
    surplus,
    margin,
    hasCost,
  };
}

function formFromRow(row: Row): RouteForm {
  return {
    supplier_source_name: formTxt(row.supplier_source_name),
    origin_loading_point: formTxt(row.origin_loading_point),
    storage_handling_location: formTxt(row.storage_handling_location),
    processing_handling_basis: formTxt(row.processing_handling_basis),
    transporter_name: formTxt(row.transporter_name),
    buyer_offtake_name: formTxt(row.buyer_offtake_name),
    buyer_delivery_point: formTxt(row.buyer_delivery_point),
    delivery_basis: formTxt(row.delivery_basis),
    quality_grade_evidence_note: formTxt(row.quality_grade_evidence_note),
    route_notes: formTxt(row.route_notes),
    feedstock_cost_per_ton: formTxt(row.feedstock_cost_per_ton),
    transport_to_plant_cost_per_ton: formTxt(row.transport_to_plant_cost_per_ton),
    tolling_cost_per_ton: formTxt(row.tolling_cost_per_ton),
    estimated_total_assay_cost: formTxt(row.estimated_total_assay_cost),
  };
}

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function Card({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">{label}</p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">{title}</h2>
      <div className="mt-4">{children}</div>
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

function InputField({ label, value, onChange, placeholder, help }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; help?: string }) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || ""} className="mt-3 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-lg font-black text-white outline-none placeholder:text-slate-600 focus:border-[#d7ad32]" />
      {help ? <span className="mt-2 block text-sm leading-6 text-slate-400">{help}</span> : null}
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, help }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; help?: string }) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || ""} rows={4} className="mt-3 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-base font-bold leading-7 text-white outline-none placeholder:text-slate-600 focus:border-[#d7ad32]" />
      {help ? <span className="mt-2 block text-sm leading-6 text-slate-400">{help}</span> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-lg font-black text-white outline-none focus:border-[#d7ad32]">
        <option value="">Select basis</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default function RouteDetailPage() {
  const supabase = createClient();
  const [state, setState] = useState<LoadState>({ loading: true, saving: false, error: "", success: "", row: null });
  const [form, setForm] = useState<RouteForm>(EMPTY_FORM);

  useEffect(() => {
    async function loadParcel() {
      setState({ loading: true, saving: false, error: "", success: "", row: null });
      const { data, error } = await supabase.from("parcels").select("*").eq("parcel_code", SEED_CODE).single();

      if (error) {
        setState({ loading: false, saving: false, error: error.message, success: "", row: null });
        return;
      }

      const nextRow = (data || null) as Row | null;
      setState({ loading: false, saving: false, error: "", success: "", row: nextRow });
      if (nextRow) setForm(formFromRow(nextRow));
    }

    loadParcel();
  }, [supabase]);

  const model = useMemo(() => (state.row ? getModel(state.row) : null), [state.row]);
  const terms = useMemo(() => (model ? routeTerms(model) : null), [model]);

  function updateForm<K extends keyof RouteForm>(key: K, value: RouteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveRouteDetails() {
    if (!model) return;

    setState((current) => ({ ...current, saving: true, error: "", success: "" }));

    const payload = {
      supplier_source_name: form.supplier_source_name.trim() || null,
      origin_loading_point: form.origin_loading_point.trim() || null,
      storage_handling_location: form.storage_handling_location.trim() || null,
      processing_handling_basis: form.processing_handling_basis.trim() || null,
      transporter_name: form.transporter_name.trim() || null,
      buyer_offtake_name: form.buyer_offtake_name.trim() || null,
      buyer_delivery_point: form.buyer_delivery_point.trim() || null,
      delivery_basis: form.delivery_basis.trim() || null,
      quality_grade_evidence_note: form.quality_grade_evidence_note.trim() || null,
      route_notes: form.route_notes.trim() || null,
      feedstock_cost_per_ton: numberOrNull(form.feedstock_cost_per_ton),
      transport_to_plant_cost_per_ton: numberOrNull(form.transport_to_plant_cost_per_ton),
      tolling_cost_per_ton: numberOrNull(form.tolling_cost_per_ton),
      estimated_total_assay_cost: numberOrNull(form.estimated_total_assay_cost),
    };

    const { data, error } = await supabase.from("parcels").update(payload).eq("parcel_code", model.databaseParcelCode).select("*").single();

    if (error) {
      setState((current) => ({ ...current, saving: false, error: error.message, success: "" }));
      return;
    }

    const nextRow = (data || null) as Row | null;
    setState({ loading: false, saving: false, error: "", success: "Route detail saved successfully.", row: nextRow });
    if (nextRow) setForm(formFromRow(nextRow));
  }

  if (state.loading) {
    return (
      <ResourceShell title="Route Detail" subtitle="Loading route detail capture.">
        <Card label="Loading" title="Reading saved parcel...">
          <p className="text-sm leading-6 text-slate-400">Loading active parcel and route detail fields.</p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error && !state.row) {
    return (
      <ResourceShell title="Route Detail" subtitle="Route detail capture could not load.">
        <Card label="Exception" title="Saved parcel unavailable">
          <p className="text-sm leading-6 text-red-200">{state.error}</p>
        </Card>
      </ResourceShell>
    );
  }

  if (!model || !terms) {
    return (
      <ResourceShell title="Route Detail" subtitle="Route detail capture could not load.">
        <Card label="Exception" title="No active parcel">
          <p className="text-sm leading-6 text-red-200">No active parcel record found.</p>
        </Card>
      </ResourceShell>
    );
  }

  return (
    <ResourceShell title="Route Detail" subtitle="Commodity-specific route detail capture.">
      <section className="grid gap-3">
        <Stat label="Parcel" value={model.parcelCode} gold />
        <Stat label="Class" value={model.commodityClass} />
        <Stat label="Category" value={model.category} />
        <Stat label="Resource" value={model.resource} />
        <Stat label="Material" value={model.material} />
        <Stat label="Stage" value={stageLabel(model.stage)} />
      </section>

      <Card label="Capture Mode" title={terms.profileTitle}>
        <div className="grid gap-3">
          <Stat label="Route Quantity" value={model.routeQty > 0 ? `${model.routeQty.toFixed(3)} units` : "Not captured"} gold={model.routeQty > 0} />
          <Stat label="Current Route Cost" value={moneyValue(model.routeCost)} gold={model.hasCost} danger={!model.hasCost} />
          <Stat label="Revenue" value={model.revenue > 0 ? money(model.revenue) : "Not captured"} gold={model.revenue > 0} danger={model.revenue <= 0} />
        </div>
      </Card>

      <Card label="Route Parties" title="Source, logistics and buyer">
        <div className="grid gap-3">
          <InputField label={terms.sourceLabel} value={form.supplier_source_name} onChange={(value) => updateForm("supplier_source_name", value)} placeholder="Supplier, source company, mine, silo, stock owner or product source" />
          <InputField label={terms.originLabel} value={form.origin_loading_point} onChange={(value) => updateForm("origin_loading_point", value)} placeholder="Origin, site, silo, warehouse, stockpile or loading point" />
          <InputField label={terms.storageLabel} value={form.storage_handling_location} onChange={(value) => updateForm("storage_handling_location", value)} placeholder="Storage, stockpile, warehouse, silo, yard or handling point" />
          <InputField label={terms.transporterLabel} value={form.transporter_name} onChange={(value) => updateForm("transporter_name", value)} placeholder="Transporter or logistics provider" />
          <InputField label={terms.buyerLabel} value={form.buyer_offtake_name} onChange={(value) => updateForm("buyer_offtake_name", value)} placeholder="Buyer, offtaker, depot, processor or receiving counterparty" />
          <InputField label={terms.deliveryPointLabel} value={form.buyer_delivery_point} onChange={(value) => updateForm("buyer_delivery_point", value)} placeholder="Delivery point, buyer site, depot, silo, warehouse, port or yard" />
          <SelectField label={terms.deliveryBasisLabel} value={form.delivery_basis} onChange={(value) => updateForm("delivery_basis", value)} options={["Ex-works", "FOT", "FOB", "Delivered", "Delivered to buyer site", "Delivered to depot", "Delivered to silo", "Delivered to port", "CIF", "Route-specific"]} />
        </div>
      </Card>

      <Card label="Route Basis" title="Handling and quality controls">
        <div className="grid gap-3">
          <TextAreaField label={terms.handlingLabel} value={form.processing_handling_basis} onChange={(value) => updateForm("processing_handling_basis", value)} placeholder="Capture route-specific processing, packaging, handling, tolling or plant basis only where applicable" help={terms.handlingRequired ? "Required for this route type." : "Route-specific only. Leave blank if not applicable."} />
          <TextAreaField label={terms.qualityLabel} value={form.quality_grade_evidence_note} onChange={(value) => updateForm("quality_grade_evidence_note", value)} placeholder="Grade, quality, moisture, assay, specification, sampling, certificate or buyer acceptance notes" help={terms.qualityHelp} />
          <TextAreaField label={terms.notesLabel} value={form.route_notes} onChange={(value) => updateForm("route_notes", value)} placeholder="Any operational notes, commercial assumptions, blockers or release comments" />
        </div>
      </Card>

      <Card label="Route Costs" title="Commodity-specific cost capture">
        <div className="grid gap-3">
          <InputField label={terms.sourceCostLabel} value={form.feedstock_cost_per_ton} onChange={(value) => updateForm("feedstock_cost_per_ton", value)} placeholder="0" help="Saved to feedstock_cost_per_ton." />
          <InputField label={terms.transportCostLabel} value={form.transport_to_plant_cost_per_ton} onChange={(value) => updateForm("transport_to_plant_cost_per_ton", value)} placeholder="0" help="Saved to transport_to_plant_cost_per_ton." />
          <InputField label={terms.processingCostLabel} value={form.tolling_cost_per_ton} onChange={(value) => updateForm("tolling_cost_per_ton", value)} placeholder="0" help="Saved to tolling_cost_per_ton and relabelled by commodity/stage." />
          <InputField label={terms.verificationCostLabel} value={form.estimated_total_assay_cost} onChange={(value) => updateForm("estimated_total_assay_cost", value)} placeholder="0" help="Saved to estimated_total_assay_cost." />
        </div>
      </Card>

      <Card label="Live Result" title="Preview before saving">
        <div className="grid gap-3">
          <Stat label="Source Cost / Unit" value={numberOrNull(form.feedstock_cost_per_ton) ? money(numberOrNull(form.feedstock_cost_per_ton) || 0) : "Not captured"} />
          <Stat label="Transport Cost / Unit" value={numberOrNull(form.transport_to_plant_cost_per_ton) ? money(numberOrNull(form.transport_to_plant_cost_per_ton) || 0) : "Not captured"} />
          <Stat label="Processing / Handling Cost / Unit" value={numberOrNull(form.tolling_cost_per_ton) ? money(numberOrNull(form.tolling_cost_per_ton) || 0) : "Not captured"} />
          <Stat label="Verification / Quality Cost" value={numberOrNull(form.estimated_total_assay_cost) ? money(numberOrNull(form.estimated_total_assay_cost) || 0) : "Not captured"} />
        </div>
      </Card>

      {state.error ? (
        <Card label="Save Error" title="Route detail was not saved">
          <p className="text-sm leading-6 text-red-200">{state.error}</p>
        </Card>
      ) : null}

      {state.success ? (
        <Card label="Saved" title="Route detail saved">
          <p className="text-sm leading-6 text-emerald-200">{state.success}</p>
        </Card>
      ) : null}

      <button type="button" onClick={saveRouteDetails} disabled={state.saving} className="w-full rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-slate-950 shadow-xl disabled:opacity-60">
        {state.saving ? "Saving Route Detail..." : "Save Route Detail"}
      </button>
    </ResourceShell>
  );
}
