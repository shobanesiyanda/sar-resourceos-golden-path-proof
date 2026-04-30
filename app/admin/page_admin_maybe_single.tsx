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

function adminState(
  hasCommodity: boolean,
  hasPrice: boolean,
  hasCost: boolean,
  margin: number
) {
  if (!hasCommodity) return "System Data Incomplete";
  if (!hasPrice) return "Price Control Missing";
  if (!hasCost) return "Cost Control Missing";
  if (margin < 15) return "Commercial Rules Review";
  return "Admin Control Review Ready";
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

function ControlItem({
  title,
  state,
  note,
}: {
  title: string;
  state: "Active" | "Needed" | "Future";
  note: string;
}) {
  const active = state === "Active";
  const needed = state === "Needed";

  return (
    <div
      className={
        active
          ? "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4"
          : needed
          ? "rounded-2xl border border-red-400/30 bg-red-500/10 p-4"
          : "rounded-2xl border border-slate-700 bg-slate-900/40 p-4"
      }
    >
      <p
        className={
          active
            ? "text-sm font-black text-emerald-200"
            : needed
            ? "text-sm font-black text-red-200"
            : "text-sm font-black text-slate-200"
        }
      >
        {state} — {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {note}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadAdmin() {
      setState({
        loading: true,
        error: "",
        row: null,
      });

      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_CODE)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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

    loadAdmin();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Admin"
        subtitle="Reading system control context."
      >
        <Card label="Loading" title="Reading admin control data...">
          <p className="text-sm leading-6 text-slate-400">
            Loading saved parcel, control fields and system readiness.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Admin"
        subtitle="Admin control data could not load."
      >
        <Card label="Exception" title="Admin control unavailable">
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

  const hasQuantity = productQty > 0;
  const hasPrice = effectivePrice > 0;
  const hasCost = routeCost > 0;
  const hasPositiveSurplus = surplus > 0;
  const hasTargetMargin = margin >= 18;

  const currentAdminState = adminState(
    hasCommodity,
    hasPrice,
    hasCost,
    margin
  );

  return (
    <ResourceShell
      title="Admin"
      subtitle="System administration control view reading the saved parcel."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={stageLabel(stage)} />
      </section>

      <Card label="Admin State" title={currentAdminState}>
        <div className="grid gap-3">
          <Stat
            label="Current State"
            value={currentAdminState}
            gold={currentAdminState === "Admin Control Review Ready"}
            danger={currentAdminState !== "Admin Control Review Ready"}
            note="Admin state checks whether the saved parcel has key system-control fields captured."
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

      <Card label="System Controls" title="Current active controls">
        <div className="grid gap-3">
          <ControlItem
            title="Auth shell"
            state="Active"
            note="Logged-out home, login and signed-in mobile shell have been stabilised."
          />

          <ControlItem
            title="Single mobile navigation"
            state="Active"
            note="Duplicate global navigation has been removed. Internal pages use one mobile nav."
          />

          <ControlItem
            title="Economics editor"
            state="Active"
            note="Cascading commodity selector, editable economics fields and yield-stage logic are active."
          />

          <ControlItem
            title="Saved parcel reading"
            state="Active"
            note="Dashboard, Leads, Route and priority pages read the saved parcel context."
          />

          <ControlItem
            title="Commodity catalogue"
            state="Active"
            note="Expanded hard and soft commodity catalogue is available in the economics editor."
          />
        </div>
      </Card>

      <Card label="System Gaps" title="Controls still needed">
        <div className="grid gap-3">
          <ControlItem
            title="Role-based access"
            state="Needed"
            note="Admin, finance, operations, approver, field-agent and read-only role rules still need enforcement."
          />

          <ControlItem
            title="Catalogue database"
            state="Needed"
            note="Current commodity catalogue is still code-based. Later it should move into Supabase tables with admin management."
          />

          <ControlItem
            title="Audit log"
            state="Needed"
            note="Changes to economics, approvals, documents and finance release should write audit events."
          />

          <ControlItem
            title="Approval persistence"
            state="Needed"
            note="Approval states are currently readiness views. Later they must write approval decision records."
          />

          <ControlItem
            title="Document registry"
            state="Needed"
            note="Document readiness is currently logic-based. Later it must link to uploaded files and document statuses."
          />

          <ControlItem
            title="Counterparty database"
            state="Needed"
            note="Counterparty page currently reads route context. Supplier, buyer, transporter and plant records still need tables."
          />
        </div>
      </Card>

      <Card label="Data Integrity" title="Saved parcel controls">
        <div className="grid gap-3">
          <Stat
            label="Commodity Captured"
            value={hasCommodity ? "Yes" : "No"}
            gold={hasCommodity}
            danger={!hasCommodity}
          />

          <Stat
            label="Quantity Captured"
            value={hasQuantity ? "Yes" : "No"}
            gold={hasQuantity}
            danger={!hasQuantity}
          />

          <Stat
            label="Effective Price Captured"
            value={hasPrice ? "Yes" : "No"}
            gold={hasPrice}
            danger={!hasPrice}
          />

          <Stat
            label="Route Cost Captured"
            value={hasCost ? "Yes" : "No"}
            gold={hasCost}
            danger={!hasCost}
          />

          <Stat
            label="Positive Surplus"
            value={hasPositiveSurplus ? "Yes" : "No"}
            gold={hasPositiveSurplus}
            danger={!hasPositiveSurplus}
          />

          <Stat
            label="Target Margin"
            value={hasTargetMargin ? "Yes" : "No"}
            gold={hasTargetMargin}
            danger={!hasTargetMargin}
          />
        </div>
      </Card>

      <Card label="Admin Values" title="Current controlled parcel">
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
            label="Market / Reference Price"
            value={money(marketPrice)}
          />

          <Stat
            label="Negotiated Buyer Price"
            value={money(negotiatedPrice)}
          />

          <Stat
            label="Effective Selling Price"
            value={money(effectivePrice)}
            gold={effectivePrice > 0}
            danger={effectivePrice <= 0}
          />

          <Stat
            label="Route Cost"
            value={money(routeCost)}
            gold={routeCost > 0}
            danger={routeCost <= 0}
          />
        </div>
      </Card>

      <Card label="Next Admin Build" title="Future admin controls">
        <div className="grid gap-3">
          <ControlItem
            title="Users and roles"
            state="Future"
            note="Create a role-control layer for Admin, Finance, Operations, Approver, Field Agent and Viewer."
          />

          <ControlItem
            title="Settings"
            state="Future"
            note="Move margin thresholds, release gates and document requirements into configurable settings."
          />

          <ControlItem
            title="Catalogue manager"
            state="Future"
            note="Admin should eventually manage commodity categories, resources, materials and default assumptions."
          />

          <ControlItem
            title="Audit events"
            state="Future"
            note="Every save, approval, document change and finance release should create an immutable audit record."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
