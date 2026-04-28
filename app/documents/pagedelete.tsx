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

function readinessLabel(
  hasCommodity: boolean,
  hasPrice: boolean,
  hasRouteCost: boolean,
  hasPositiveSurplus: boolean
) {
  if (!hasCommodity) return "Commodity Documents Not Ready";
  if (!hasPrice) return "Buyer Price Evidence Missing";
  if (!hasRouteCost) return "Route Cost Evidence Missing";
  if (!hasPositiveSurplus) return "Commercial Evidence Review";
  return "Document Pack Review Ready";
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

function DocumentItem({
  title,
  status,
  note,
  required,
}: {
  title: string;
  status: "Required" | "Captured" | "Future";
  note: string;
  required?: boolean;
}) {
  const ready = status === "Captured";
  const future = status === "Future";

  return (
    <div
      className={
        ready
          ? "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4"
          : future
          ? "rounded-2xl border border-slate-700 bg-slate-900/40 p-4"
          : "rounded-2xl border border-red-400/30 bg-red-500/10 p-4"
      }
    >
      <p
        className={
          ready
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

export default function DocumentsPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    row: null,
  });

  useEffect(() => {
    async function loadDocuments() {
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

    loadDocuments();
  }, [supabase]);

  if (state.loading) {
    return (
      <ResourceShell
        title="Documents"
        subtitle="Reading document readiness."
      >
        <Card label="Loading" title="Reading saved parcel document state...">
          <p className="text-sm leading-6 text-slate-400">
            Loading parcel, economics and release-readiness evidence.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error || !state.row) {
    return (
      <ResourceShell
        title="Documents"
        subtitle="Document readiness could not load."
      >
        <Card label="Exception" title="Document data unavailable">
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
  const hasRouteCost = routeCost > 0;
  const hasPositiveSurplus = surplus > 0;
  const hasMargin = margin > 0;

  const readiness = readinessLabel(
    hasCommodity,
    hasPrice,
    hasRouteCost,
    hasPositiveSurplus
  );

  const readyCount = [
    hasCommodity,
    hasQuantity,
    hasPrice,
    hasRouteCost,
    hasPositiveSurplus,
    hasMargin,
  ].filter(Boolean).length;

  const totalCoreChecks = 6;
  const missingCount = totalCoreChecks - readyCount;

  return (
    <ResourceShell
      title="Documents"
      subtitle="Document readiness view reading the saved parcel."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} gold />
        <Stat label="Class" value={commodityClass} />
        <Stat label="Category" value={category} />
        <Stat label="Resource" value={resource} />
        <Stat label="Material" value={material} />
        <Stat label="Stage" value={stageLabel(stage)} />
      </section>

      <Card label="Readiness State" title={readiness}>
        <div className="grid gap-3">
          <Stat
            label="Document State"
            value={readiness}
            gold={missingCount === 0}
            danger={missingCount > 0}
            note="This is a live readiness view based on the saved parcel economics and captured commercial fields."
          />

          <Stat
            label="Core Checks Ready"
            value={`${readyCount}/${totalCoreChecks}`}
            gold={readyCount === totalCoreChecks}
            danger={readyCount < totalCoreChecks}
          />

          <Stat
            label="Missing Core Items"
            value={`${missingCount}`}
            gold={missingCount === 0}
            danger={missingCount > 0}
          />
        </div>
      </Card>

      <Card label="Core Evidence" title="Commercial evidence checks">
        <div className="grid gap-3">
          <DocumentItem
            title="Commodity and material capture"
            status={hasCommodity ? "Captured" : "Required"}
            required
            note="Commodity class, category, resource and material must be captured before documents can be released."
          />

          <DocumentItem
            title="Quantity basis"
            status={hasQuantity ? "Captured" : "Required"}
            required
            note={`Product quantity: ${productQty.toFixed(3)} units. Route quantity: ${routeQty.toFixed(3)} units.`}
          />

          <DocumentItem
            title="Buyer price evidence"
            status={hasPrice ? "Captured" : "Required"}
            required
            note={`Effective price captured at ${effectivePrice > 0 ? `R ${effectivePrice.toLocaleString("en-ZA")}` : "R 0"}. Buyer PO or written confirmation still needs document upload later.`}
          />

          <DocumentItem
            title="Route cost evidence"
            status={hasRouteCost ? "Captured" : "Required"}
            required
            note={`Route cost currently calculated at ${money(routeCost)} from acquisition, logistics, processing and verification costs.`}
          />

          <DocumentItem
            title="Commercial surplus evidence"
            status={hasPositiveSurplus ? "Captured" : "Required"}
            required
            note={`Surplus before finance cost: ${money(surplus)}.`}
          />

          <DocumentItem
            title="Margin evidence"
            status={hasMargin ? "Captured" : "Required"}
            required
            note={`Current route margin: ${margin.toFixed(1)}%. Target review range is 18% and above.`}
          />
        </div>
      </Card>

      <Card label="Required Documents" title="Release-critical pack">
        <div className="grid gap-3">
          <DocumentItem
            title="Supplier / source confirmation"
            status="Required"
            required
            note="Supplier quote, material ownership/control confirmation, site/loading point and authority to sell still need a document workflow."
          />

          <DocumentItem
            title="Buyer / offtake confirmation"
            status="Required"
            required
            note="Buyer PO, buyer price, payment terms, delivery basis and acceptance conditions must be uploaded before release."
          />

          <DocumentItem
            title="Transport / logistics quote"
            status="Required"
            required
            note="Transporter quote, route, rate, truck capacity and delivery point must be captured before dispatch."
          />

          <DocumentItem
            title="Plant / processor / tolling quote"
            status={
              stage === "raw_feedstock"
                ? "Required"
                : "Future"
            }
            required={stage === "raw_feedstock"}
            note={
              stage === "raw_feedstock"
                ? "Raw feedstock usually needs plant, processing, tolling, beneficiation or conversion evidence."
                : "Saleable or finished product may not require processing evidence unless route-specific."
            }
          />

          <DocumentItem
            title="Assay / quality evidence"
            status="Required"
            required
            note="Assay, grading, moisture, quality or certificate evidence must be attached before finance or dispatch release."
          />

          <DocumentItem
            title="Approval record"
            status="Required"
            required
            note="Commercial, operations and finance approvals must be recorded before release."
          />
        </div>
      </Card>

      <Card label="Evidence Snapshot" title="Financial evidence values">
        <div className="grid gap-3">
          <Stat
            label="Revenue Evidence"
            value={money(revenue)}
            note="Derived from product quantity and effective selling price."
            gold={revenue > 0}
            danger={revenue <= 0}
          />

          <Stat
            label="Acquisition Cost Evidence"
            value={money(acquisitionTotal)}
            note="Supplier/source commercial evidence required."
          />

          <Stat
            label="Logistics Cost Evidence"
            value={money(logisticsTotal)}
            note="Transport quote or logistics confirmation required."
          />

          <Stat
            label="Processing Cost Evidence"
            value={money(processingTotal)}
            note="Plant/tolling/processing quote required where applicable."
          />

          <Stat
            label="Verification / Quality Evidence"
            value={money(verificationCost)}
            note="Assay, grading, quality or acceptance confirmation required."
          />

          <Stat
            label="Route Cost Evidence"
            value={money(routeCost)}
            gold={routeCost > 0}
            danger={routeCost <= 0}
          />
        </div>
      </Card>

      <Card label="Next Actions" title="Document control actions">
        <div className="grid gap-3">
          <Stat
            label="Action 1"
            value="Create supplier evidence pack"
            note="Supplier, source, ownership/control and loading point evidence."
          />

          <Stat
            label="Action 2"
            value="Create buyer evidence pack"
            note="Buyer PO, price, terms, delivery basis and acceptance conditions."
          />

          <Stat
            label="Action 3"
            value="Create route evidence pack"
            note="Transport, plant/processing, quality and dispatch-readiness documents."
          />

          <Stat
            label="Action 4"
            value="Link approvals"
            note="Documents should feed into approvals and finance readiness before release."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
