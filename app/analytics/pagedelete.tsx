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

function marginBand(margin: number) {
  if (margin >= 25) return "Strong Margin";
  if (margin >= 18) return "Target Margin";
  if (margin >= 15) return "Watch / Improve";
  if (margin > 0) return "Weak Margin";
  return "Negative Margin";
}

function materialStageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") {
    return "Intermediate / Saleable Product";
  }
  if (stage === "finished_product") return "Finished Product";
  return stage || "Not captured";
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

export default function AnalyticsPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadAnalytics() {
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

    loadAnalytics();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Analytics"
        subtitle="Reading saved parcel analytics."
      >
        <Card label="Loading" title="Reading analytics data...">
          <p className="text-sm leading-6 text-slate-400">
            Loading margin, price, cost and route decision signals.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Analytics"
        subtitle="Analytics data could not load."
      >
        <Card label="Exception" title="Analytics unavailable">
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

  const acquisitionShare =
    routeCost > 0 ? (acquisitionTotal / routeCost) * 100 : 0;
  const logisticsShare =
    routeCost > 0 ? (logisticsTotal / routeCost) * 100 : 0;
  const processingShare =
    routeCost > 0 ? (processingTotal / routeCost) * 100 : 0;
  const verificationShare =
    routeCost > 0 ? (verificationCost / routeCost) * 100 : 0;

  const costGapTo18 = Math.max(routeCost - revenue * 0.82, 0);

  const targetBuyerPrice =
    margin >= 18 || productQty <= 0
      ? effectivePrice
      : Math.ceil(routeCost / (productQty * 0.82));

  const costReductionUnit =
    routeQty > 0 ? Math.ceil(costGapTo18 / routeQty) : 0;

  const buyerPriceGap =
    targetBuyerPrice > effectivePrice
      ? targetBuyerPrice - effectivePrice
      : 0;

  const largestCostDriver = [
    {
      name: "Acquisition",
      value: acquisitionTotal,
      share: acquisitionShare,
    },
    {
      name: "Logistics",
      value: logisticsTotal,
      share: logisticsShare,
    },
    {
      name: "Processing",
      value: processingTotal,
      share: processingShare,
    },
    {
      name: "Verification",
      value: verificationCost,
      share: verificationShare,
    },
  ].sort((a, b) => b.value - a.value)[0];

  const priceSource =
    negotiatedPrice > 0
      ? "Negotiated buyer price"
      : marketPrice > 0
      ? "Market / reference price"
      : "No price captured";

  const marginDanger = margin <= 0;
  const marginGood = margin >= 18;

  return (
    <ResourceShell
      title="Analytics"
      subtitle="Decision analytics reading the saved parcel economics."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={materialStageLabel(stage)} />
      </section>

      <Card label="Decision Signal" title={marginBand(margin)}>
        <div className="grid gap-3">
          <Stat
            label="Margin Band"
            value={marginBand(margin)}
            gold={marginGood}
            danger={marginDanger}
          />

          <Stat
            label="Route Margin"
            value={`${margin.toFixed(1)}%`}
            gold={marginGood}
            danger={marginDanger}
          />

          <Stat
            label="Surplus"
            value={money(surplus)}
            gold={surplus > 0}
            danger={surplus <= 0}
          />

          <Stat
            label="Decision Flag"
            value={
              margin >= 18
                ? "Route can proceed to readiness review"
                : "Improve before release"
            }
            gold={margin >= 18}
            danger={margin < 15}
          />
        </div>
      </Card>

      <Card label="Price Analytics" title="Price basis and buyer gap">
        <div className="grid gap-3">
          <Stat label="Price Source" value={priceSource} />

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
            label="Target Buyer Price"
            value={moneyTon(targetBuyerPrice)}
            note="Indicative price required to move toward an 18% gross margin."
            gold
          />

          <Stat
            label="Buyer Price Gap"
            value={moneyTon(buyerPriceGap)}
            note="Additional buyer price needed if margin is below target."
            danger={buyerPriceGap > 0}
          />
        </div>
      </Card>

      <Card label="Cost Drivers" title="Route cost analysis">
        <div className="grid gap-3">
          <Stat
            label="Largest Cost Driver"
            value={largestCostDriver.name}
            note={`${money(largestCostDriver.value)} / ${largestCostDriver.share.toFixed(1)}% of route cost`}
            gold
          />

          <Stat
            label="Acquisition Share"
            value={`${acquisitionShare.toFixed(1)}%`}
            note={money(acquisitionTotal)}
          />

          <Stat
            label="Logistics Share"
            value={`${logisticsShare.toFixed(1)}%`}
            note={money(logisticsTotal)}
          />

          <Stat
            label="Processing Share"
            value={`${processingShare.toFixed(1)}%`}
            note={money(processingTotal)}
          />

          <Stat
            label="Verification Share"
            value={`${verificationShare.toFixed(1)}%`}
            note={money(verificationCost)}
          />
        </div>
      </Card>

      <Card label="Improvement Targets" title="Commercial recommendations">
        <div className="grid gap-3">
          <Stat
            label="Cost Reduction Needed"
            value={money(costGapTo18)}
            note="Estimated total cost reduction required to reach approximately 18% margin."
            danger={costGapTo18 > 0}
          />

          <Stat
            label="Cost Reduction / Route Unit"
            value={moneyTon(costReductionUnit)}
            note="Indicative saving needed per route unit."
          />

          <Stat
            label="Price Action"
            value={
              buyerPriceGap > 0
                ? "Push buyer price upward"
                : "Buyer price acceptable"
            }
            note={
              buyerPriceGap > 0
                ? `Target increase: ${moneyTon(buyerPriceGap)}`
                : "No immediate buyer price increase required by current model."
            }
            gold={buyerPriceGap <= 0}
            danger={buyerPriceGap > 0}
          />

          <Stat
            label="Cost Action"
            value={
              costGapTo18 > 0
                ? "Reduce route costs"
                : "Route cost acceptable"
            }
            note="Review acquisition, logistics, processing and verification charges."
            gold={costGapTo18 <= 0}
            danger={costGapTo18 > 0}
          />
        </div>
      </Card>

      <Card label="Exposure Summary" title="Commercial exposure">
        <div className="grid gap-3">
          <Stat
            label="Product Quantity"
            value={`${productQty.toFixed(3)} units`}
          />

          <Stat
            label="Route Quantity"
            value={`${routeQty.toFixed(3)} units`}
          />

          <Stat
            label="Revenue"
            value={money(revenue)}
            gold
          />

          <Stat
            label="Route Cost"
            value={money(routeCost)}
          />

          <Stat
            label="Cost / Product Unit"
            value={
              productQty > 0
                ? moneyTon(routeCost / productQty)
                : moneyTon(0)
            }
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
