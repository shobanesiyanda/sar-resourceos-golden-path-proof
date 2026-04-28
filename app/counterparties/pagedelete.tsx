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

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "intermediate_concentrate") {
    return "Intermediate / Saleable Product";
  }
  if (stage === "finished_product") return "Finished Product";
  return stage || "Not captured";
}

function counterpartyState(
  hasCommodity: boolean,
  hasPrice: boolean,
  hasRouteCost: boolean,
  hasPositiveSurplus: boolean
) {
  if (!hasCommodity) return "Counterparty Context Missing";
  if (!hasPrice) return "Buyer Price Not Confirmed";
  if (!hasRouteCost) return "Supplier / Route Cost Not Confirmed";
  if (!hasPositiveSurplus) return "Commercial Review Required";
  return "Counterparty Review Ready";
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

function PartyCard({
  title,
  status,
  note,
  required,
}: {
  title: string;
  status: "Required" | "Future" | "Captured";
  note: string;
  required?: boolean;
}) {
  const captured = status === "Captured";
  const future = status === "Future";

  return (
    <div
      className={
        captured
          ? "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4"
          : future
          ? "rounded-2xl border border-slate-700 bg-slate-900/40 p-4"
          : "rounded-2xl border border-red-400/30 bg-red-500/10 p-4"
      }
    >
      <p
        className={
          captured
            ? "text-sm font-black text-emerald-200"
            : future
            ? "text-sm font-black text-slate-200"
            : "text-sm font-black text-red-200"
        }
      >
        {status} — {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {note}
      </p>

      {required ? (
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7ad32]">
          Release-critical
        </p>
      ) : null}
    </div>
  );
}

export default function PartiesPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadParties() {
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

    loadParties();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Counterparties"
        subtitle="Reading counterparty control context."
      >
        <Card label="Loading" title="Reading saved parcel...">
          <p className="text-sm leading-6 text-slate-400">
            Loading commodity, route and commercial context for counterparty review.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Counterparties"
        subtitle="Counterparty data could not load."
      >
        <Card label="Exception" title="Counterparty context unavailable">
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

  const hasCommodity =
    resource !== "Not captured" &&
    material !== "Not captured";

  const hasPrice = effectivePrice > 0;
  const hasRouteCost = routeCost > 0;
  const hasPositiveSurplus = surplus > 0;

  const status = counterpartyState(
    hasCommodity,
    hasPrice,
    hasRouteCost,
    hasPositiveSurplus
  );

  const supplierRequired =
    stage === "raw_feedstock" ||
    acquisitionCostPerUnit > 0 ||
    acquisitionTotal > 0;

  const processorRequired =
    stage === "raw_feedstock" ||
    processingCostPerUnit > 0 ||
    processingTotal > 0;

  const buyerRequired = hasPrice || revenue > 0;
  const transporterRequired =
    logisticsCostPerUnit > 0 || logisticsTotal > 0;

  return (
    <ResourceShell
      title="Counterparties"
      subtitle="Counterparty control view reading the saved parcel."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={stageLabel(stage)} />
      </section>

      <Card label="Counterparty State" title={status}>
        <div className="grid gap-3">
          <Stat
            label="Current State"
            value={status}
            gold={status === "Counterparty Review Ready"}
            danger={status !== "Counterparty Review Ready"}
            note="This state is based on commodity capture, price confirmation, route cost and commercial surplus."
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

      <Card label="Required Counterparties" title="Route parties">
        <div className="grid gap-3">
          <PartyCard
            title="Supplier / Source"
            status={supplierRequired ? "Required" : "Future"}
            required={supplierRequired}
            note={
              supplierRequired
                ? "Supplier/source must be verified for material ownership, grade, quantity, loading point and authority to sell."
                : "Supplier may not be required where the selected material is already a saleable product sourced from existing stock."
            }
          />

          <PartyCard
            title="Buyer / Offtaker"
            status={buyerRequired ? "Required" : "Required"}
            required
            note="Buyer/offtaker must be verified for price, payment terms, delivery basis, quality acceptance and final destination."
          />

          <PartyCard
            title="Transporter / Logistics"
            status={transporterRequired ? "Required" : "Future"}
            required={transporterRequired}
            note={
              transporterRequired
                ? "Transporter must be verified for route, rate, truck capacity, insurance, driver control and delivery point."
                : "Transporter details become required once logistics cost or movement route is captured."
            }
          />

          <PartyCard
            title="Wash Plant / Processor"
            status={processorRequired ? "Required" : "Future"}
            required={processorRequired}
            note={
              processorRequired
                ? "Processor/tolling partner must be verified for capacity, yield/recovery basis, cost, assay timing and extra charges."
                : "Processor may not be required for already saleable or finished products."
            }
          />

          <PartyCard
            title="Finance / Funding Partner"
            status="Future"
            note="Funding partner verification becomes release-critical when external working capital or investor funding is used."
          />

          <PartyCard
            title="Agent / Mandate Holder"
            status="Future"
            note="Mandate holder or sourcing agent must be captured where a third party introduces the seller, buyer or route."
          />
        </div>
      </Card>

      <Card label="Verification Checklist" title="Counterparty due diligence">
        <div className="grid gap-3">
          <PartyCard
            title="Company details"
            status="Required"
            required
            note="Company name, registration number, contact person, email, phone and physical address."
          />

          <PartyCard
            title="KYC / FICA"
            status="Required"
            required
            note="Company registration documents, director details, tax status, bank confirmation and beneficial ownership where applicable."
          />

          <PartyCard
            title="Commercial authority"
            status="Required"
            required
            note="Confirm the counterparty has authority to sell, buy, process, transport, fund or represent the route."
          />

          <PartyCard
            title="Document readiness"
            status="Required"
            required
            note="Supplier quote, buyer PO, transport quote, plant/tolling quote and quality evidence must be linked to the route."
          />

          <PartyCard
            title="Risk review"
            status="Required"
            required
            note="Check fraud risk, title/control risk, payment risk, logistics risk and quality/assay risk."
          />
        </div>
      </Card>

      <Card label="Commercial Context" title="Values to verify">
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
            label="Effective Buyer Price"
            value={`${money(effectivePrice)}/unit`}
            gold={effectivePrice > 0}
            danger={effectivePrice <= 0}
          />

          <Stat
            label="Revenue"
            value={money(revenue)}
            gold={revenue > 0}
            danger={revenue <= 0}
          />

          <Stat
            label="Route Cost"
            value={money(routeCost)}
            gold={routeCost > 0}
            danger={routeCost <= 0}
          />

          <Stat
            label="Surplus"
            value={money(surplus)}
            gold={surplus > 0}
            danger={surplus <= 0}
          />
        </div>
      </Card>

      <Card label="Next Actions" title="Counterparty build actions">
        <div className="grid gap-3">
          <Stat
            label="Action 1"
            value="Create supplier profile"
            note="Capture source company, contact person, material control, loading point, grade and available tonnage."
          />

          <Stat
            label="Action 2"
            value="Create buyer profile"
            note="Capture buyer, offtake terms, payment terms, delivery basis and quality conditions."
          />

          <Stat
            label="Action 3"
            value="Create logistics profile"
            note="Capture transporter, route, truck capacity, rates, delivery point and dispatch rules."
          />

          <Stat
            label="Action 4"
            value="Create processor profile"
            note="Capture wash plant or processor where the route requires tolling, beneficiation, grading or packaging."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
