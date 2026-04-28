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

function approvalState(
  hasCommodity: boolean,
  hasQuantity: boolean,
  hasPrice: boolean,
  hasCost: boolean,
  surplus: number,
  margin: number
) {
  if (!hasCommodity) return "Blocked — Commodity Missing";
  if (!hasQuantity) return "Blocked — Quantity Missing";
  if (!hasPrice) return "Blocked — Buyer Price Missing";
  if (!hasCost) return "Blocked — Route Cost Missing";
  if (surplus <= 0) return "Blocked — Negative Surplus";
  if (margin < 15) return "Held — Commercial Risk";
  if (margin < 18) return "Review — Improve Margin";
  return "Approval Review Ready";
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
        {ready ? "Pass" : "Blocked"} — {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {note}
      </p>
    </div>
  );
}

function ApprovalCard({
  title,
  state,
  note,
}: {
  title: string;
  state: "Pending" | "Ready" | "Blocked" | "Future";
  note: string;
}) {
  const ready = state === "Ready";
  const blocked = state === "Blocked";

  return (
    <div
      className={
        ready
          ? "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4"
          : blocked
          ? "rounded-2xl border border-red-400/30 bg-red-500/10 p-4"
          : "rounded-2xl border border-slate-700 bg-slate-900/40 p-4"
      }
    >
      <p
        className={
          ready
            ? "text-sm font-black text-emerald-200"
            : blocked
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

export default function ApprovalsPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadApprovals() {
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

    loadApprovals();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Approvals"
        subtitle="Reading approval readiness."
      >
        <Card label="Loading" title="Reading approval control data...">
          <p className="text-sm leading-6 text-slate-400">
            Loading saved parcel, margin, cost and release gates.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Approvals"
        subtitle="Approval data could not load."
      >
        <Card label="Exception" title="Approval queue unavailable">
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

  const currentApprovalState = approvalState(
    hasCommodity,
    hasQuantity,
    hasPrice,
    hasCost,
    surplus,
    margin
  );

  const readyForApproval =
    hasCommodity &&
    hasQuantity &&
    hasPrice &&
    hasCost &&
    hasPositiveSurplus &&
    hasTargetMargin;

  const commercialApprovalState =
    readyForApproval ? "Ready" : margin >= 15 ? "Pending" : "Blocked";

  const operationsApprovalState =
    hasCommodity && hasQuantity && hasCost ? "Pending" : "Blocked";

  const financeApprovalState =
    readyForApproval ? "Ready" : hasPositiveSurplus ? "Pending" : "Blocked";

  const documentApprovalState =
    hasCommodity && hasPrice && hasCost ? "Pending" : "Blocked";

  return (
    <ResourceShell
      title="Approvals"
      subtitle="Approval readiness view reading the saved parcel economics."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={stageLabel(stage)} />
      </section>

      <Card label="Approval State" title={currentApprovalState}>
        <div className="grid gap-3">
          <Stat
            label="Current Approval State"
            value={currentApprovalState}
            gold={readyForApproval}
            danger={!readyForApproval}
            note="This state is based on commodity, quantity, price, route cost, surplus and margin."
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

      <Card label="Release Gates" title="Approval gate checks">
        <div className="grid gap-3">
          <Gate
            title="Commodity and material selected"
            ready={hasCommodity}
            note="Approvals cannot start without commodity, resource and material."
          />

          <Gate
            title="Quantity captured"
            ready={hasQuantity}
            note="Product and route quantity must be available."
          />

          <Gate
            title="Buyer price captured"
            ready={hasPrice}
            note="Market/reference price or negotiated buyer price must be captured."
          />

          <Gate
            title="Route cost captured"
            ready={hasCost}
            note="Acquisition, logistics, processing and verification costs must be complete."
          />

          <Gate
            title="Positive surplus"
            ready={hasPositiveSurplus}
            note="Route should show positive commercial surplus before approval."
          />

          <Gate
            title="Target margin reached"
            ready={hasTargetMargin}
            note="Approval target is 18% or higher gross margin."
          />
        </div>
      </Card>

      <Card label="Approval Queue" title="Role-based approvals">
        <div className="grid gap-3">
          <ApprovalCard
            title="Commercial Approval"
            state={commercialApprovalState}
            note="Commercial approver checks buyer price, source cost, margin and counterparty risk."
          />

          <ApprovalCard
            title="Operations Approval"
            state={operationsApprovalState}
            note="Operations approver checks material, quantity, route basis, movement readiness and dispatch blockers."
          />

          <ApprovalCard
            title="Document Approval"
            state={documentApprovalState}
            note="Document approver checks supplier, buyer, transport, plant and quality evidence."
          />

          <ApprovalCard
            title="Finance Approval"
            state={financeApprovalState}
            note="Finance approver checks route cost, funding need, surplus, margin and payment readiness."
          />

          <ApprovalCard
            title="Executive Override"
            state="Future"
            note="Executive override is only for exceptions and should require audit notes and approval reason."
          />
        </div>
      </Card>

      <Card label="Approval Values" title="Commercial basis">
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
            label="Effective Selling Price"
            value={moneyUnit(effectivePrice)}
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

      <Card label="Next Actions" title="Approval control actions">
        <div className="grid gap-3">
          <Stat
            label="Action 1"
            value="Confirm documents"
            note="Supplier, buyer, route, plant, transport and quality evidence must support the route."
          />

          <Stat
            label="Action 2"
            value="Confirm counterparties"
            note="All release-critical counterparties must be verified before approval."
          />

          <Stat
            label="Action 3"
            value="Confirm finance readiness"
            note="Finance approval should only proceed if route cost, surplus and margin are acceptable."
          />

          <Stat
            label="Action 4"
            value="Record approval decision"
            note="Final implementation should write approval state, approver, timestamp and audit notes."
          />
        </div>
      </Card>
    </ResourceShell>
  );
        }
