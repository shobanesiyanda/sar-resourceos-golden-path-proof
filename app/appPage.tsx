"use client";

import { useEffect, useState } from "react";
import ResourceShell from "../components/ResourceShell";
import { createClient } from "../lib/supabase/client";

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

function decisionLabel(hasCost: boolean, margin: number) {
  if (!hasCost) return "Costing Incomplete";
  if (margin >= 25) return "Strong Route";
  if (margin >= 18) return "Target Range";
  if (margin >= 15) return "Improve Before Release";
  if (margin > 0) return "Below Target";
  return "Blocked / Incomplete";
}

function stateLabel(hasCost: boolean, surplus: number, margin: number) {
  if (!hasCost) return "Blocked";
  if (surplus <= 0) return "Blocked";
  if (margin < 18) return "Pending";
  return "Review Ready";
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

  const hasCost = routeCost > 0;
  const surplus = hasCost && revenue > 0 ? revenue - routeCost : 0;
  const margin = hasCost && revenue > 0 ? (surplus / revenue) * 100 : 0;

  const hasCommodity =
    commodityClass !== "Not captured" &&
    category !== "Not captured" &&
    resource !== "Not captured" &&
    material !== "Not captured";

  const hasQuantity = productQty > 0;
  const hasPrice = effectivePrice > 0;
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

function StatusPill({ value }: { value: string }) {
  const isBlocked = value === "Blocked";
  const isReady = value === "Review Ready";

  return (
    <span
      className={
        isReady
          ? "inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-200"
          : isBlocked
          ? "inline-flex rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200"
          : "inline-flex rounded-full border border-[#d7ad32]/40 bg-[#d7ad32]/10 px-4 py-2 text-sm font-black text-[#f5d778]"
      }
    >
      {value}
    </span>
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

export default function DashboardPage() {
  const state = useParcel();

  if (state.loading) {
    return (
      <ResourceShell title="Dashboard" subtitle="Reading saved parcel data.">
        <Card label="Loading" title="Reading saved parcel...">
          <p className="text-sm leading-6 text-slate-400">
            Loading current parcel control summary.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell title="Dashboard" subtitle="Data could not load.">
        <Card label="Exception" title="Saved parcel unavailable">
          <p className="text-sm leading-6 text-red-200">
            {state.error || "No active parcel record found."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const model = getModel(state.row);
  const currentState = stateLabel(
    model.hasCost,
    model.surplus,
    model.margin
  );

  const hardBlockers = [
    !model.hasCommodity,
    !model.hasQuantity,
    !model.hasPrice,
    !model.hasCost,
    !model.hasPositiveSurplus,
  ].filter(Boolean).length;

  const pendingBlockers = [
    !model.hasTargetMargin,
    model.stage === "Not captured",
    model.routeQty <= 0,
  ].filter(Boolean).length;

  return (
    <ResourceShell
      title="Dashboard"
      subtitle="Saved parcel control summary and release readiness."
    >
      <Card label="Lead / Opportunity" title="Current lead summary">
        <div className="grid gap-3">
          <Stat label="Parcel" value={model.parcelCode} gold />
          <Stat label="Class" value={model.commodityClass} />
          <Stat label="Resource" value={model.resource} gold />
          <Stat label="Category" value={model.category} />
          <Stat label="Material" value={model.material} />
          <Stat label="Stage" value={stageLabel(model.stage)} />
        </div>
      </Card>

      <Card label="Lead Economics Screening" title="Commercial starting point">
        <div className="grid gap-3">
          <Stat
            label="Product Tons"
            value={
              model.productQty > 0
                ? model.productQty.toFixed(3)
                : "Not captured"
            }
            danger={model.productQty <= 0}
          />

          <Stat
            label="Effective Price"
            value={moneyUnit(model.effectivePrice)}
            gold={model.effectivePrice > 0}
            danger={model.effectivePrice <= 0}
          />

          <Stat
            label="Route Cost"
            value={model.hasCost ? money(model.routeCost) : "Not captured"}
            gold={model.hasCost}
            danger={!model.hasCost}
            note={
              model.hasCost
                ? "Read from saved route-detail costs."
                : "Capture route detail costs before screening margin."
            }
          />

          <Stat
            label="Surplus"
            value={
              model.hasCost && model.revenue > 0
                ? money(model.surplus)
                : "Not captured"
            }
            gold={model.hasPositiveSurplus}
            danger={!model.hasPositiveSurplus}
          />

          <Stat
            label="Margin"
            value={
              model.hasCost && model.revenue > 0
                ? `${model.margin.toFixed(1)}%`
                : "Not captured"
            }
            gold={model.hasTargetMargin}
            danger={!model.hasTargetMargin}
          />
        </div>
      </Card>

      <Card label="Finance Readiness" title={decisionLabel(model.hasCost, model.margin)}>
        <div className="grid gap-3">
          <Stat
            label="Revenue"
            value={model.revenue > 0 ? money(model.revenue) : "Not captured"}
            gold={model.revenue > 0}
            danger={model.revenue <= 0}
          />

          <Stat
            label="Route Cost"
            value={model.hasCost ? money(model.routeCost) : "Not captured"}
            gold={model.hasCost}
            danger={!model.hasCost}
          />

          <Stat
            label="Commercial Surplus"
            value={
              model.hasCost && model.revenue > 0
                ? money(model.surplus)
                : "Not captured"
            }
            gold={model.hasPositiveSurplus}
            danger={!model.hasPositiveSurplus}
          />

          <Stat
            label="Current State"
            value={currentState}
            gold={currentState === "Review Ready"}
            danger={currentState === "Blocked"}
          />
        </div>
      </Card>

      <Card label="Route Cost Build-Up" title="Saved route-detail costs">
        <div className="grid gap-3">
          <Stat
            label="Acquisition / Source Total"
            value={
              model.acquisitionTotal > 0
                ? money(model.acquisitionTotal)
                : "Not captured"
            }
            note={`${moneyUnit(model.acquisitionUnit)} × ${model.routeQty.toFixed(3)} units`}
          />

          <Stat
            label="Transport / Logistics Total"
            value={
              model.logisticsTotal > 0
                ? money(model.logisticsTotal)
                : "Not captured"
            }
            note={`${moneyUnit(model.logisticsUnit)} × ${model.routeQty.toFixed(3)} units`}
          />

          <Stat
            label="Processing / Handling Total"
            value={
              model.processingTotal > 0
                ? money(model.processingTotal)
                : "Not captured"
            }
            note={`${moneyUnit(model.processingUnit)} × ${model.routeQty.toFixed(3)} units`}
          />

          <Stat
            label="Verification / Quality Cost"
            value={
              model.verificationCost > 0
                ? money(model.verificationCost)
                : "Not captured"
            }
          />

          <Stat
            label="Total Route Cost"
            value={model.hasCost ? money(model.routeCost) : "Not captured"}
            gold={model.hasCost}
            danger={!model.hasCost}
          />
        </div>
      </Card>

      <Card label="Release Gate Engine" title="Central blocker summary">
        <div className="grid gap-3">
          <Stat label="Hard Blockers" value={String(hardBlockers)} danger={hardBlockers > 0} gold={hardBlockers === 0} />
          <Stat label="Pending Blockers" value={String(pendingBlockers)} danger={pendingBlockers > 0} gold={pendingBlockers === 0} />
          <Stat label="Total Open" value={String(hardBlockers + pendingBlockers)} danger={hardBlockers + pendingBlockers > 0} gold={hardBlockers + pendingBlockers === 0} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
              Current State
            </p>
            <div className="mt-3">
              <StatusPill value={currentState} />
            </div>
          </div>
        </div>
      </Card>

      <Card label="Release Gates" title="Operational readiness checks">
        <div className="grid gap-3">
          <Gate
            title="Commodity and material captured"
            ready={model.hasCommodity}
            note="Class, category, resource and material must be captured."
          />
          <Gate
            title="Quantity captured"
            ready={model.hasQuantity}
            note="Product quantity must be available."
          />
          <Gate
            title="Effective buyer / offtake price captured"
            ready={model.hasPrice}
            note="Market/reference or negotiated buyer price must be captured."
          />
          <Gate
            title="Route costs captured"
            ready={model.hasCost}
            note="Route detail costs must be saved before margin screening."
          />
          <Gate
            title="Positive surplus"
            ready={model.hasPositiveSurplus}
            note="Route must show a positive commercial surplus before release."
          />
          <Gate
            title="Target margin"
            ready={model.hasTargetMargin}
            note="Target release margin is 18% or higher."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
