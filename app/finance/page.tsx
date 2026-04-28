"use client";

import { useEffect, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

const SEED_CODE = "PAR-CHR-2026-0001";

type ParcelRow = Record<string, unknown>;

type FinanceState = {
  loading: boolean;
  error: string;
  row: ParcelRow | null;
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

function marginLabel(margin: number) {
  if (margin >= 25) return "Strong Route";
  if (margin >= 18) return "Target Range";
  if (margin >= 15) return "Decent / Improve";
  if (margin > 0) return "Below Target";
  return "Blocked / Negative";
}

function readinessLabel(margin: number, surplus: number, routeCost: number) {
  if (routeCost <= 0) return "Costing Incomplete";
  if (surplus <= 0) return "Finance Blocked";
  if (margin >= 18) return "Finance Review Ready";
  if (margin >= 15) return "Improve Before Funding";
  return "Below Finance Threshold";
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

export default function FinancePage() {
  const supabase = createClient();

  const [state, setState] = useState<FinanceState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadFinance() {
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
        row: (data || null) as ParcelRow | null,
      });
    }

    loadFinance();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Finance"
        subtitle="Reading finance control data."
      >
        <Card label="Loading" title="Reading saved parcel economics...">
          <p className="text-sm leading-6 text-slate-400">
            Loading route cost, revenue, surplus and finance readiness.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Finance"
        subtitle="Finance control could not load."
      >
        <Card label="Exception" title="Finance data unavailable">
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
  const materialStage = txt(row.material_stage);

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

  const dailyOperatingCashNeed = routeCost / 5;
  const threeDayBuffer = dailyOperatingCashNeed * 3;
  const fourDayBuffer = dailyOperatingCashNeed * 4;
  const recommendedBuffer = (threeDayBuffer + fourDayBuffer) / 2;

  const financeReadiness = readinessLabel(
    margin,
    surplus,
    routeCost
  );

  const target18Cost = revenue * 0.82;
  const costGap = Math.max(routeCost - target18Cost, 0);

  const targetBuyerPrice =
    margin >= 18 || productQty <= 0
      ? effectivePrice
      : Math.ceil(routeCost / (productQty * 0.82));

  const costReductionUnit =
    routeQty > 0 ? Math.ceil(costGap / routeQty) : 0;

  const blocked = financeReadiness.includes("Blocked");

  return (
    <ResourceShell
      title="Finance"
      subtitle="Finance readiness view reading the saved parcel economics."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={materialStage} />
      </section>

      <Card label="Finance Readiness" title={financeReadiness}>
        <div className="grid gap-3">
          <Stat
            label="Decision"
            value={financeReadiness}
            gold={!blocked}
            danger={blocked}
            note="Readiness is based on route cost, surplus and gross margin."
          />

          <Stat
            label="Margin Band"
            value={marginLabel(margin)}
            gold={margin >= 18}
            danger={margin <= 0}
          />

          <Stat
            label="Gross Margin"
            value={`${margin.toFixed(1)}%`}
            gold={margin >= 18}
            danger={margin <= 0}
          />
        </div>
      </Card>

      <Card label="Revenue" title="Buyer price and revenue">
        <div className="grid gap-3">
          <Stat
            label="Product Quantity"
            value={`${productQty.toFixed(3)} units`}
          />

          <Stat
            label="Market / Reference Price"
            value={moneyTon(marketPrice)}
          />

          <Stat
            label="Negotiated Buyer Price"
            value={moneyTon(negotiatedPrice)}
          />

          <Stat
            label="Effective Selling Price"
            value={moneyTon(effectivePrice)}
            gold
          />

          <Stat
            label="Expected Revenue"
            value={money(revenue)}
            gold
          />
        </div>
      </Card>

      <Card label="Route Cost" title="Cost breakdown">
        <div className="grid gap-3">
          <Stat
            label="Route Quantity"
            value={`${routeQty.toFixed(3)} units`}
          />

          <Stat
            label="Acquisition Total"
            value={money(acquisitionTotal)}
            note={`${moneyTon(acquisitionCostPerUnit)} × ${routeQty.toFixed(3)}`}
          />

          <Stat
            label="Logistics Total"
            value={money(logisticsTotal)}
            note={`${moneyTon(logisticsCostPerUnit)} × ${routeQty.toFixed(3)}`}
          />

          <Stat
            label="Processing / Tolling Total"
            value={money(processingTotal)}
            note={`${moneyTon(processingCostPerUnit)} × ${routeQty.toFixed(3)}`}
          />

          <Stat
            label="Verification / Quality Cost"
            value={money(verificationCost)}
          />

          <Stat
            label="Total Route Cost"
            value={money(routeCost)}
            gold
          />
        </div>
      </Card>

      <Card label="Surplus" title="Commercial result">
        <div className="grid gap-3">
          <Stat
            label="Surplus Before Finance Cost"
            value={money(surplus)}
            gold={surplus > 0}
            danger={surplus <= 0}
          />

          <Stat
            label="Route Margin"
            value={`${margin.toFixed(1)}%`}
            gold={margin >= 18}
            danger={margin <= 0}
          />

          <Stat
            label="Target Buyer Price"
            value={moneyTon(targetBuyerPrice)}
            note="Indicative price needed to move toward an 18% gross margin."
            gold
          />

          <Stat
            label="Cost Reduction Required"
            value={money(costGap)}
            note={`Indicative saving required: ${moneyTon(costReductionUnit)} by route unit.`}
          />
        </div>
      </Card>

      <Card label="Working Capital" title="Operating cash buffer">
        <div className="grid gap-3">
          <Stat
            label="Estimated Daily Cash Need"
            value={money(dailyOperatingCashNeed)}
            note="Route cost divided by a 5-day operating week."
          />

          <Stat
            label="3-Day Buffer"
            value={money(threeDayBuffer)}
          />

          <Stat
            label="4-Day Buffer"
            value={money(fourDayBuffer)}
          />

          <Stat
            label="Recommended Buffer"
            value={money(recommendedBuffer)}
            gold
            note="Midpoint of the 3–4 day operating cash buffer range."
          />
        </div>
      </Card>

      <Card label="Finance Actions" title="Next control actions">
        <div className="grid gap-3">
          <Stat
            label="Action 1"
            value="Confirm buyer price"
            note="Check whether negotiated buyer price is supported by PO, contract or written buyer confirmation."
          />

          <Stat
            label="Action 2"
            value="Confirm route costs"
            note="Validate acquisition, logistics, processing and verification costs before finance release."
          />

          <Stat
            label="Action 3"
            value="Check readiness blockers"
            note="Do not release funding if supplier, buyer, route, plant, transport or documents are incomplete."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
