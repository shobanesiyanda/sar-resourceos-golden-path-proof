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

function moneyUnit(value: number) {
  return value > 0 ? `${money(value)}/unit` : "Not captured";
}

function moneyValue(value: number) {
  return value > 0 ? money(value) : "Not captured";
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") return "Intermediate / Saleable Product";
  if (stage === "saleable_product") return "Intermediate / Saleable Product";
  if (stage === "finished_product") return "Finished Product";
  return stage || "Not captured";
}

function marginBand(margin: number) {
  if (margin >= 25) return "Strong Route";
  if (margin >= 18) return "Target Range";
  if (margin >= 15) return "Improve Before Release";
  if (margin > 0) return "Below Target";
  return "Blocked / Incomplete";
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
      {note ? <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p> : null}
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
      <p className="mt-2 text-xs leading-5 text-slate-300">{note}</p>
    </div>
  );
}

function getModel(row: Row) {
  const parcelCode = txt(row.working_parcel_code, txt(row.parcel_code, SEED_CODE));
  const commodityClass = txt(row.commodity_class);
  const category = txt(row.resource_category);
  const resource = txt(row.resource_type);
  const material = txt(row.material_type);
  const stage = txt(row.material_stage);

  const productQty = num(row.expected_concentrate_tons, num(row.accepted_tons, 0));
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
  const routeCost = acquisitionTotal + logisticsTotal + processingTotal + verificationCost;
  const revenue = productQty * effectivePrice;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  const hasCommodity = resource !== "Not captured" && material !== "Not captured";
  const hasQuantity = productQty > 0;
  const hasPrice = effectivePrice > 0;
  const hasCost = routeCost > 0;
  const hasPositiveSurplus = surplus > 0;
  const hasTargetMargin = margin >= 18;

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

function ParcelHeader({ model }: { model: ReturnType<typeof getModel> }) {
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
      setState({ loading: true, error: "", row: null });

      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_CODE)
        .single();

      if (error) {
        setState({ loading: false, error: error.message, row: null });
        return;
      }

      setState({ loading: false, error: "", row: (data || null) as Row | null });
    }

    loadParcel();
  }, [supabase]);

  return state;
}

export default function FinancePage() {
  const state = useParcel();

  if (state.loading) {
    return (
      <ResourceShell title="Finance" subtitle="Reading saved parcel data.">
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
      <ResourceShell title="Finance" subtitle="Data could not load.">
        <Card label="Exception" title="Saved parcel unavailable">
          <p className="text-sm leading-6 text-red-200">
            {state.error || "No active parcel record found."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const model = getModel(state.row);

  return (
    <ResourceShell title="Finance" subtitle="Finance readiness view reading the saved parcel economics.">
      <ParcelHeader model={model} />

      <Card
  label="Finance Readiness"
  title={
    !model.hasCost
      ? "Costing Incomplete"
      : marginBand(model.margin)
  }
>
        <div className="grid gap-3">
          <Stat label="Revenue" value={moneyValue(model.revenue)} gold={model.revenue > 0} danger={model.revenue <= 0} />
          <Stat label="Route Cost" value={moneyValue(model.routeCost)} gold={model.routeCost > 0} danger={model.routeCost <= 0} note="Shows Not captured until acquisition, logistics, processing or verification costs are saved." />
          <Stat label="Surplus" value={model.revenue > 0 ? money(model.surplus) : "Not captured"} gold={model.surplus > 0} danger={model.revenue <= 0 || model.surplus <= 0} />
          <Stat label="Margin" value={model.revenue > 0 ? `${model.margin.toFixed(1)}%` : "Not captured"} gold={model.margin >= 18} danger={model.margin <= 0} />
        </div>
      </Card>

      <Card label="Buyer Price" title="Price basis">
        <div className="grid gap-3">
          <Stat label="Market / Reference Price" value={moneyUnit(model.marketPrice)} />
          <Stat label="Negotiated Buyer Price" value={moneyUnit(model.negotiatedPrice)} />
          <Stat label="Effective Selling Price" value={moneyUnit(model.effectivePrice)} gold={model.effectivePrice > 0} danger={model.effectivePrice <= 0} />
          <Stat label="Product Quantity" value={model.productQty > 0 ? `${model.productQty.toFixed(3)} units` : "Not captured"} />
        </div>
      </Card>

      <Card label="Route Costs" title="Cost evidence">
        <div className="grid gap-3">
          <Stat label="Acquisition Total" value={moneyValue(model.acquisitionTotal)} note={`${moneyUnit(model.acquisitionUnit)} × ${model.routeQty.toFixed(3)} units`} />
          <Stat label="Logistics Total" value={moneyValue(model.logisticsTotal)} note={`${moneyUnit(model.logisticsUnit)} × ${model.routeQty.toFixed(3)} units`} />
          <Stat label="Processing / Tolling Total" value={moneyValue(model.processingTotal)} note={`${moneyUnit(model.processingUnit)} × ${model.routeQty.toFixed(3)} units`} />
          <Stat label="Verification / Quality Cost" value={moneyValue(model.verificationCost)} />
        </div>
      </Card>

      <Card label="Working Capital" title="Operating buffer estimate">
        <div className="grid gap-3">
          <Stat label="Daily Cash Need" value={model.routeCost > 0 ? money(model.routeCost / 5) : "Not captured"} note="Route cost divided by a 5-day operating week." />
          <Stat label="3-Day Buffer" value={model.routeCost > 0 ? money((model.routeCost / 5) * 3) : "Not captured"} />
          <Stat label="4-Day Buffer" value={model.routeCost > 0 ? money((model.routeCost / 5) * 4) : "Not captured"} />
        </div>
      </Card>

    </ResourceShell>
  );
}
