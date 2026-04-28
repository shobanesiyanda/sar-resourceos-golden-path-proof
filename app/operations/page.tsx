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

function moneyTon(value: number) {
  return `${money(value)}/t`;
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") {
    return "Intermediate / Saleable Product";
  }
  if (stage === "finished_product") return "Finished Product";
  return stage || "Not captured";
}

function operationState(
  routeCost: number,
  margin: number,
  resource: string,
  material: string
) {
  if (!resource || resource === "Not captured") return "Missing Resource";
  if (!material || material === "Not captured") return "Missing Material";
  if (routeCost <= 0) return "Costing Incomplete";
  if (margin < 15) return "Commercial Hold";
  if (margin < 18) return "Improve Before Dispatch";
  return "Ready for Route Review";
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

function CheckItem({
  label,
  ready,
  note,
}: {
  label: string;
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
        {ready ? "Ready" : "Missing"} — {label}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {note}
      </p>
    </div>
  );
}

export default function OperationsPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadOperations() {
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

    loadOperations();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Operations"
        subtitle="Reading operations readiness."
      >
        <Card label="Loading" title="Reading saved parcel...">
          <p className="text-sm leading-6 text-slate-400">
            Loading parcel, route and dispatch readiness data.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Operations"
        subtitle="Operations data could not load."
      >
        <Card label="Exception" title="Operations unavailable">
          <p className="text-sm leading-6 text-red-200">
            {state.error || "No active parcel record found."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const row = state.row;

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

  const acquisitionCostPerUnit = num(row.feedstock_cost_per_ton, 0);
  const logisticsCostPerUnit = num(
    row.transport_to_plant_cost_per_ton,
    0
  );
  const processingCostPerUnit = num(row.tolling_cost_per_ton, 0);
  const verificationCost = num(row.estimated_total_assay_cost, 0);

  const revenue = productQty * effectivePrice;
  const acquisitionTotal = routeQty * acquisitionCostPerUnit;
  const logisticsTotal = routeQty * logisticsCostPerUnit;
  const processingTotal = routeQty * processingCostPerUnit;

  const routeCost =
    acquisitionTotal +
    logisticsTotal +
    processingTotal +
    verificationCost;

  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  const stateLabel = operationState(
    routeCost,
    margin,
    resource,
    material
  );

  const hasCommodity = resource !== "Not captured";
  const hasMaterial = material !== "Not captured";
  const hasQuantity = productQty > 0;
  const hasPrice = effectivePrice > 0;
  const hasRouteCost = routeCost > 0;
  const hasPositiveSurplus = surplus > 0;
  const hasTargetMargin = margin >= 18;

  return (
    <ResourceShell
      title="Operations"
      subtitle="Execution readiness view reading the saved parcel."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={stageLabel(stage)} />
      </section>

      <Card label="Operations State" title={stateLabel}>
        <div className="grid gap-3">
          <Stat
            label="Current State"
            value={stateLabel}
            gold={stateLabel === "Ready for Route Review"}
            danger={
              stateLabel === "Commercial Hold" ||
              stateLabel === "Missing Resource" ||
              stateLabel === "Missing Material"
            }
            note="This state is based on commodity capture, route costing, surplus and margin readiness."
          />

          <Stat
            label="Route Margin"
            value={`${margin.toFixed(1)}%`}
            gold={margin >= 18}
            danger={margin <= 0}
          />

          <Stat
            label="Surplus"
            value={money(surplus)}
            gold={surplus > 0}
            danger={surplus <= 0}
          />
        </div>
      </Card>

      <Card label="Readiness Checklist" title="Dispatch blockers">
        <div className="grid gap-3">
          <CheckItem
            label="Commodity captured"
            ready={hasCommodity}
            note="Commodity / resource must be selected before operations can proceed."
          />

          <CheckItem
            label="Material captured"
            ready={hasMaterial}
            note="Material / product type must be selected before route planning."
          />

          <CheckItem
            label="Quantity captured"
            ready={hasQuantity}
            note="Product quantity must be captured before logistics and dispatch planning."
          />

          <CheckItem
            label="Selling price captured"
            ready={hasPrice}
            note="Effective selling price must be available from market/reference price or negotiated buyer price."
          />

          <CheckItem
            label="Route cost captured"
            ready={hasRouteCost}
            note="Acquisition, logistics, processing and verification cost must be complete."
          />

          <CheckItem
            label="Positive commercial surplus"
            ready={hasPositiveSurplus}
            note="Route should show positive surplus before release review."
          />

          <CheckItem
            label="Target margin reached"
            ready={hasTargetMargin}
            note="Target operating margin is 18% or higher before dispatch release."
          />
        </div>
      </Card>

      <Card label="Operational Quantities" title="Movement basis">
        <div className="grid gap-3">
          <Stat
            label="Product Quantity"
            value={`${productQty.toFixed(3)} units`}
            note="Quantity intended for sale or delivery."
          />

          <Stat
            label={
              stage === "raw_feedstock"
                ? "Feedstock / Route Quantity"
                : "Route Quantity"
            }
            value={`${routeQty.toFixed(3)} units`}
            gold
            note={
              stage === "raw_feedstock"
                ? "Raw feedstock route quantity is derived from yield."
                : "Saleable or finished product routes on product quantity basis."
            }
          />

          <Stat
            label="Effective Price"
            value={moneyTon(effectivePrice)}
          />

          <Stat
            label="Route Cost"
            value={money(routeCost)}
          />
        </div>
      </Card>

      <Card label="Execution Steps" title="Current operating path">
        <div className="grid gap-3">
          <Stat
            label="Step 1"
            value="Route Review"
            note="Confirm source, loading point, route economics, buyer price and route cost."
            gold
          />

          <Stat
            label="Step 2"
            value="Document Readiness"
            note="Confirm supplier, buyer, transport, plant and quality documents before release."
          />

          <Stat
            label="Step 3"
            value="Dispatch Readiness"
            note="Confirm truck, driver, loading point, weighbridge and delivery point."
          />

          <Stat
            label="Step 4"
            value="Movement Control"
            note="Track loading, weighbridge, in-transit, delivery and reconciliation events."
          />
        </div>
      </Card>

      <Card label="Missing Capture" title="Fields still needed later">
        <div className="grid gap-3">
          <Stat
            label="Origin / Loading Point"
            value="Not yet captured"
            note="This will be added in route detail capture."
            danger
          />

          <Stat
            label="Plant / Processing Point"
            value="Not yet captured"
            note="Needed where material requires tolling, washing, processing or packaging."
            danger
          />

          <Stat
            label="Buyer / Delivery Point"
            value="Not yet captured"
            note="Needed for release, dispatch and delivery control."
            danger
          />

          <Stat
            label="Transporter / Truck"
            value="Not yet captured"
            note="Needed before dispatch readiness can be approved."
            danger
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
