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
  return `${money(value)}/unit`;
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") {
    return "Intermediate / Saleable Product";
  }
  if (stage === "finished_product") return "Finished Product";
  return stage || "Not captured";
}

function routeState(
  hasCommodity: boolean,
  hasQuantity: boolean,
  hasPrice: boolean,
  hasCost: boolean,
  margin: number
) {
  if (!hasCommodity) return "Missing Commodity";
  if (!hasQuantity) return "Missing Quantity";
  if (!hasPrice) return "Missing Buyer Price";
  if (!hasCost) return "Route Cost Incomplete";
  if (margin < 15) return "Commercial Hold";
  if (margin < 18) return "Improve Route";
  return "Route Review Ready";
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

export default function RouteBuilderPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadRoute() {
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

    loadRoute();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Route Builder"
        subtitle="Reading saved parcel route context."
      >
        <Card label="Loading" title="Reading route control data...">
          <p className="text-sm leading-6 text-slate-400">
            Loading saved parcel, route quantity, price, cost and readiness.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Route Builder"
        subtitle="Route data could not load."
      >
        <Card label="Exception" title="Route builder unavailable">
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

  const costPerProductUnit =
    productQty > 0 ? routeCost / productQty : 0;

  const grossSurplusPerProductUnit =
    productQty > 0 ? surplus / productQty : 0;

  const hasCommodity =
    resource !== "Not captured" &&
    material !== "Not captured";

  const hasQuantity = productQty > 0;
  const hasPrice = effectivePrice > 0;
  const hasCost = routeCost > 0;
  const hasPositiveSurplus = surplus > 0;
  const hasTargetMargin = margin >= 18;

  const currentRouteState = routeState(
    hasCommodity,
    hasQuantity,
    hasPrice,
    hasCost,
    margin
  );

  const routeNeedsProcessing =
    stage === "raw_feedstock" ||
    processingCostPerUnit > 0 ||
    processingTotal > 0;

  return (
    <ResourceShell
      title="Route Builder"
      subtitle="Route builder view reading the saved parcel economics."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={stageLabel(stage)} />
      </section>

      <Card label="Route State" title={currentRouteState}>
        <div className="grid gap-3">
          <Stat
            label="Current State"
            value={currentRouteState}
            gold={currentRouteState === "Route Review Ready"}
            danger={currentRouteState !== "Route Review Ready"}
            note="Route state is based on commodity, quantity, buyer price, route cost and margin."
          />

          <Stat
            label="Margin"
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

      <Card label="Route Quantity" title="Movement basis">
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
                ? "Raw feedstock route quantity is calculated from yield."
                : "Saleable or finished product routes on product quantity basis."
            }
          />

          <Stat
            label="Cost / Product Unit"
            value={moneyUnit(costPerProductUnit)}
          />

          <Stat
            label="Surplus / Product Unit"
            value={moneyUnit(grossSurplusPerProductUnit)}
            gold={grossSurplusPerProductUnit > 0}
            danger={grossSurplusPerProductUnit <= 0}
          />
        </div>
      </Card>

      <Card label="Route Cost" title="Route cost build-up">
        <div className="grid gap-3">
          <Stat
            label="Acquisition"
            value={money(acquisitionTotal)}
            note={`${moneyUnit(acquisitionCostPerUnit)} × ${routeQty.toFixed(3)}`}
          />

          <Stat
            label="Logistics / Handling"
            value={money(logisticsTotal)}
            note={`${moneyUnit(logisticsCostPerUnit)} × ${routeQty.toFixed(3)}`}
          />

          <Stat
            label="Processing / Tolling"
            value={money(processingTotal)}
            note={`${moneyUnit(processingCostPerUnit)} × ${routeQty.toFixed(3)}`}
          />

          <Stat
            label="Verification / Quality"
            value={money(verificationCost)}
          />

          <Stat
            label="Total Route Cost"
            value={money(routeCost)}
            gold={routeCost > 0}
            danger={routeCost <= 0}
          />
        </div>
      </Card>

      <Card label="Buyer Route" title="Revenue basis">
        <div className="grid gap-3">
          <Stat
            label="Market / Reference Price"
            value={moneyUnit(marketPrice)}
          />

          <Stat
            label="Negotiated Buyer Price"
            value={moneyUnit(negotiatedPrice)}
          />

          <Stat
            label="Effective Selling Price"
            value={moneyUnit(effectivePrice)}
            gold={effectivePrice > 0}
            danger={effectivePrice <= 0}
          />

          <Stat
            label="Expected Revenue"
            value={money(revenue)}
            gold={revenue > 0}
            danger={revenue <= 0}
          />
        </div>
      </Card>

      <Card label="Route Gates" title="Readiness checks">
        <div className="grid gap-3">
          <Gate
            title="Commodity and material selected"
            ready={hasCommodity}
            note="Route cannot proceed without commodity, resource and material."
          />

          <Gate
            title="Quantity captured"
            ready={hasQuantity}
            note="Product and route quantity must be available for logistics and finance."
          />

          <Gate
            title="Buyer price captured"
            ready={hasPrice}
            note="Market/reference price or negotiated buyer price must be captured."
          />

          <Gate
            title="Route costs captured"
            ready={hasCost}
            note="Acquisition, logistics, processing and verification costs must be complete."
          />

          <Gate
            title="Positive surplus"
            ready={hasPositiveSurplus}
            note="Route should show positive surplus before release review."
          />

          <Gate
            title="Target margin"
            ready={hasTargetMargin}
            note="Route should target 18% or higher gross margin before release."
          />
        </div>
      </Card>

      <Card label="Route Capture Still Needed" title="Next route fields">
        <div className="grid gap-3">
          <Stat
            label="Origin / Loading Point"
            value="Not yet captured"
            note="Add source site, loading point, stockpile or warehouse."
            danger
          />

          <Stat
            label="Processing / Plant Point"
            value={routeNeedsProcessing ? "Required" : "Optional"}
            note={
              routeNeedsProcessing
                ? "This route appears to need plant, tolling or processing control."
                : "This material may route as saleable or finished product without processing."
            }
            danger={routeNeedsProcessing}
          />

          <Stat
            label="Buyer / Delivery Point"
            value="Not yet captured"
            note="Add buyer site, delivery point, port, depot or offtake location."
            danger
          />

          <Stat
            label="Transporter / Trucking"
            value="Not yet captured"
            note="Add transporter, vehicle type, rate basis and movement capacity."
            danger
          />

          <Stat
            label="Delivery Basis"
            value="Not yet captured"
            note="Add Ex-works, FOT, FOB, CIF or other route basis."
            danger
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
