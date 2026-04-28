"use client";

import { useEffect, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

const SEED_CODE = "PAR-CHR-2026-0001";

type Row = Record<string, unknown>;

type LoadState = {
  loading: boolean;
  error: string;
  row: Row | null;
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

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function moneyValue(value: number) {
  return value > 0 ? money(value) : "Not captured";
}

function moneyUnit(value: number) {
  return value > 0 ? `${money(value)}/unit` : "Not captured";
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";

  if (
    stage === "intermediate_concentrate" ||
    stage === "saleable_product"
  ) {
    return "Intermediate / Saleable Product";
  }

  if (stage === "finished_product") return "Finished Product";

  return stage || "Not captured";
}

function isRawFeedstock(stage: string) {
  return stage === "raw_feedstock";
}

function isSaleable(stage: string) {
  return (
    stage === "intermediate_concentrate" ||
    stage === "saleable_product"
  );
}

function isFinished(stage: string) {
  return stage === "finished_product";
}

function isChrome(resource: string, material: string) {
  const text = `${resource} ${material}`.toLowerCase();
  return text.includes("chrome");
}

function isGrain(resource: string, category: string, material: string) {
  const text = `${resource} ${category} ${material}`.toLowerCase();
  return (
    text.includes("maize") ||
    text.includes("wheat") ||
    text.includes("sorghum") ||
    text.includes("grain")
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
      sourceLabel: "Supplier / Feedstock Source",
      sourceNote:
        "Verify material control, grade, stockpile, loading point, recovery basis and authority to sell.",
      qualityLabel: "Assay / Grade Evidence",
      qualityNote:
        "Assay, Cr2O3 grade, recovery/yield basis and sampling support are release-critical.",
      processingLabel: "Wash Plant / Tolling",
      processingValue: "Required",
      processingRequired: true,
      processingNote:
        "Chrome raw feedstock requires beneficiation, wash plant or tolling confirmation where the route depends on processing.",
      storageLabel: "Stockpile / Loading Control",
      deliveryLabel: "Buyer / Offtake Delivery Basis",
      forbidden: "",
    };
  }

  if (chrome && (saleable || finished)) {
    return {
      sourceLabel: "Supplier / Concentrate Source",
      sourceNote:
        "Verify concentrate availability, grade, assay support, loading point and seller authority.",
      qualityLabel: "Grade / Assay Evidence",
      qualityNote:
        "Confirm concentrate grade, assay, moisture where applicable and buyer acceptance basis.",
      processingLabel: "Processing / Tolling",
      processingValue: "Route-specific only",
      processingRequired: false,
      processingNote:
        "Do not require wash plant or tolling unless this specific concentrate route includes further processing.",
      storageLabel: "Stockpile / Handling",
      deliveryLabel: "Buyer / Offtake Delivery Basis",
      forbidden: "",
    };
  }

  if (grain || model.resource.toLowerCase().includes("maize")) {
    return {
      sourceLabel: "Supplier / Grain Source",
      sourceNote:
        "Verify supplier/source, grade, quantity, storage location, loading point and authority to sell.",
      qualityLabel: "Quality / Moisture / Grade Evidence",
      qualityNote:
        "For grain, confirm grade, moisture, quality evidence, storage condition and buyer acceptance basis.",
      processingLabel: "Packaging / Handling",
      processingValue: "Route-specific only",
      processingRequired: false,
      processingNote:
        "Grain saleable product should not show wash plant, tolling, beneficiation, ROM, feedstock yield or concentrate wording.",
      storageLabel: "Storage / Handling",
      deliveryLabel: "Buyer / Offtake Delivery Basis",
      forbidden:
        "Wash Plant / Tolling / Beneficiation wording is hidden for maize and grain saleable products.",
    };
  }

  if (finished) {
    return {
      sourceLabel: "Supplier / Product Source",
      sourceNote:
        "Verify supplier, product specification, available quantity, storage, packaging and authority to sell.",
      qualityLabel: "Product Quality Evidence",
      qualityNote:
        "Confirm product specification, quality evidence, packaging condition and buyer acceptance basis.",
      processingLabel: "Packaging / Handling",
      processingValue: "Route-specific only",
      processingRequired: false,
      processingNote:
        "Finished products should focus on product-specific quality, storage, packaging, transport and delivery controls.",
      storageLabel: "Storage / Packaging",
      deliveryLabel: "Buyer / Offtake Delivery Basis",
      forbidden: "",
    };
  }

  return {
    sourceLabel: "Supplier / Source",
    sourceNote:
      "Verify source, available quantity, loading point, commercial authority and supporting evidence.",
    qualityLabel: "Quality / Grade Evidence",
    qualityNote:
      "Confirm the quality, grade, specification or acceptance basis required for the selected product.",
    processingLabel: raw ? "Processing / Plant" : "Processing / Handling",
    processingValue: raw ? "Required" : "Route-specific only",
    processingRequired: raw,
    processingNote: raw
      ? "Raw material routes require processing or conversion basis where applicable."
      : "Processing or handling only applies where the selected route requires it.",
    storageLabel: "Storage / Handling",
    deliveryLabel: "Buyer / Delivery Basis",
    forbidden: "",
  };
}

function Card({
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

      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function Gate({
  title,
  ready,
  note,
}: {
  title: string;
  ready: boolean;
  note: string;
}) {
  return (
    <div
      className={
        ready
          ? "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4"
          : "rounded-2xl border border-red-400/30 bg-red-500/10 p-4"
      }
    >
      <p
        className={
          ready
            ? "text-sm font-black text-emerald-200"
            : "text-sm font-black text-red-200"
        }
      >
        {ready ? "Ready" : "Blocked"} — {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {note}
      </p>
    </div>
  );
}

function getModel(row: Row) {
  const parcelCode = txt(
    row.working_parcel_code,
    txt(row.parcel_code, SEED_CODE)
  );

  const commodityClass = txt(row.commodity_class);
  const category = txt(row.resource_category);
  const resource = txt(row.resource_type);
  const material = txt(row.material_type);
  const stage = txt(row.material_stage);

  const productQty = num(
    row.expected_concentrate_tons,
    num(row.accepted_tons, 0)
  );

  const routeQty = num(row.feedstock_tons, productQty);

  const marketPrice = num(row.market_reference_price_per_ton, 0);
  const negotiatedPrice = num(row.negotiated_price_per_ton, 0);

  const effectivePrice = num(
    row.effective_price_per_ton,
    negotiatedPrice > 0 ? negotiatedPrice : marketPrice
  );

  const acquisitionUnit = num(row.feedstock_cost_per_ton, 0);
  const logisticsUnit = num(row.transport_to_plant_cost_per_ton, 0);
  const processingUnit = num(row.tolling_cost_per_ton, 0);
  const verificationCost = num(row.estimated_total_assay_cost, 0);

  const acquisitionTotal = routeQty * acquisitionUnit;
  const logisticsTotal = routeQty * logisticsUnit;
  const processingTotal = routeQty * processingUnit;

  const routeCost =
    acquisitionTotal +
    logisticsTotal +
    processingTotal +
    verificationCost;

  const revenue = productQty * effectivePrice;

  const hasCommodity =
    resource !== "Not captured" &&
    material !== "Not captured";

  const hasQuantity = productQty > 0;
  const hasPrice = effectivePrice > 0;
  const hasCost = routeCost > 0;

  const surplus =
    hasCost && revenue > 0 ? revenue - routeCost : 0;

  const margin =
    hasCost && revenue > 0 ? (surplus / revenue) * 100 : 0;

  const hasPositiveSurplus = hasCost && surplus > 0;
  const hasTargetMargin = hasCost && margin >= 18;

  return {
    parcelCode,
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
    hasCommodity,
    hasQuantity,
    hasPrice,
    hasCost,
    hasPositiveSurplus,
    hasTargetMargin,
  };
}

function ParcelHeader({
  model,
}: {
  model: ReturnType<typeof getModel>;
}) {
  return (
    <section className="grid gap-3">
      <Stat label="Parcel" value={model.parcelCode} gold />
      <Stat label="Class" value={model.commodityClass} />
      <Stat label="Category" value={model.category} />
      <Stat label="Resource" value={model.resource} />
      <Stat label="Material" value={model.material} />
      <Stat label="Stage" value={stageLabel(model.stage)} />
    </section>
  );
}

function useParcel() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadParcel() {
      setState({
        loading: true,
        error: "",
        row: null,
      });

      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_CODE)
        .single();

      if (error) {
        setState({
          loading: false,
          error: error.message,
          row: null,
        });
        return;
      }

      setState({
        loading: false,
        error: "",
        row: (data || null) as Row | null,
      });
    }

    loadParcel();
  }, [supabase]);

  return state;
}

export default function DocumentsPage() {
  const state = useParcel();

  if (state.loading) {
    return (
      <ResourceShell
        title="Documents"
        subtitle="Reading saved parcel data."
      >
        <Card label="Loading" title="Reading saved parcel...">
          <p className="text-sm leading-6 text-slate-400">
            Loading the current saved parcel context from Supabase.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Documents"
        subtitle="Data could not load."
      >
        <Card label="Exception" title="Saved parcel unavailable">
          <p className="text-sm leading-6 text-red-200">
            {state.error || "No active parcel record found."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const model = getModel(state.row);
  const terms = routeTerms(model);

  return (
    <ResourceShell
      title="Documents"
      subtitle="Commodity-specific document readiness reading the saved parcel."
    >
      <ParcelHeader model={model} />

      <Card
        label="Document Readiness"
        title={
          model.hasPositiveSurplus
            ? "Document Pack Review Ready"
            : "Documents Not Ready"
        }
      >
        <div className="grid gap-3">
          <Gate title="Commodity and material evidence" ready={model.hasCommodity} note="Commodity, resource and material must be captured." />
          <Gate title="Quantity evidence" ready={model.hasQuantity} note="Product and route quantity must be captured." />
          <Gate title="Buyer / offtake price evidence" ready={model.hasPrice} note="Buyer price, PO or written confirmation must support the model." />
          <Gate title="Route cost evidence" ready={model.hasCost} note="Supplier, transport, handling and route-specific cost evidence must be supported." />
          <Gate title="Positive surplus evidence" ready={model.hasPositiveSurplus} note="Commercial surplus should be positive before release." />
        </div>
      </Card>

      <Card label="Required Documents" title="Commodity-specific evidence pack">
        <div className="grid gap-3">
          <Stat label={terms.sourceLabel} value="Required" danger note={terms.sourceNote} />
          <Stat label="Buyer / Offtake Confirmation" value="Required" danger note="Buyer, offtake terms, payment terms, delivery basis and acceptance conditions must be confirmed." />
          <Stat label="Transport / Logistics Quote" value="Required" danger note="Transporter, route, rate, vehicle basis and delivery point must be captured." />
          <Stat label={terms.storageLabel} value="Required" danger note="Confirm storage, stockpile, warehouse, silo, handling or packaging condition as relevant to the selected commodity." />
          <Stat label={terms.qualityLabel} value="Required" danger note={terms.qualityNote} />
          <Stat label={terms.processingLabel} value={terms.processingValue} danger={terms.processingRequired} note={terms.processingNote} />
        </div>
      </Card>

      <Card label="Evidence Snapshot" title="Saved commercial values">
        <div className="grid gap-3">
          <Stat label="Revenue" value={model.revenue > 0 ? money(model.revenue) : "Not captured"} />
          <Stat label="Route Cost" value={moneyValue(model.routeCost)} />
          <Stat label="Surplus" value={model.hasCost && model.revenue > 0 ? money(model.surplus) : "Not captured"} />
          <Stat label="Margin" value={model.hasCost && model.revenue > 0 ? `${model.margin.toFixed(1)}%` : "Not captured"} />
          {terms.forbidden ? <Stat label="Terminology Control" value="Active" gold note={terms.forbidden} /> : null}
        </div>
      </Card>

    </ResourceShell>
  );
}
