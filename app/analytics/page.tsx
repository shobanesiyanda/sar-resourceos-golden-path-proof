"use client";

import { useEffect, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";
import { stageLabel, stateLabel } from "../../lib/displayLabels";

const SEED_PARCEL_CODE = "PAR-CHR-2026-0001";

type ParcelRow = {
  id: string;
  parcel_code: string | null;
  working_parcel_code: string | null;
  commodity_class: string | null;
  resource_category: string | null;
  resource_type: string | null;
  material_type: string | null;
  material_stage: string | null;
  expected_concentrate_tons: number | null;
  accepted_tons: number | null;
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  market_reference_price_per_ton: number | null;
  negotiated_price_per_ton: number | null;
  effective_price_per_ton: number | null;
  expected_price_per_ton: number | null;
  estimated_route_cost: number | null;
  estimated_total_assay_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  price_basis: string | null;
};

type GateRow = {
  parcel_id: string | null;
  release_state: string | null;
  release_decision: string | null;
  readiness_score: number | null;
  open_blockers: number | null;
  hard_blockers: number | null;
  pending_blockers: number | null;
  documents_required: number | null;
  documents_complete: number | null;
  documents_blockers: number | null;
  documents_state: string | null;
  approvals_required: number | null;
  approvals_complete: number | null;
  approvals_blockers: number | null;
  approvals_state: string | null;
  counterparties_required: number | null;
  counterparties_complete: number | null;
  counterparties_blockers: number | null;
  counterparties_state: string | null;
  routes_required: number | null;
  routes_complete: number | null;
  routes_blockers: number | null;
  routes_state: string | null;
  margin_state: string | null;
  margin_blocker: boolean | null;
  route_margin_percent: number | null;
};

function displayParcelCode(parcel: ParcelRow | null) {
  return parcel?.working_parcel_code || parcel?.parcel_code || SEED_PARCEL_CODE;
}

function money(value: number | null | undefined) {
  const n = Number(value || 0);
  return `R ${n.toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function pct(value: number | null | undefined) {
  const n = Number(value || 0);
  return `${n.toFixed(1)}%`;
}

function tons(value: number | null | undefined) {
  const n = Number(value || 0);
  return n.toFixed(3);
}

function Card({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-white">
        {title}
      </h2>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  gold,
}: {
  label: string;
  value: string | number;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p
        className={
          gold
            ? "mt-3 text-3xl font-black text-[#f5d778]"
            : "mt-3 text-3xl font-black text-white"
        }
      >
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
      ) : null}
    </div>
  );
}

function GateFamily({
  label,
  complete,
  required,
  blockers,
  state,
}: {
  label: string;
  complete: number | null | undefined;
  required: number | null | undefined;
  blockers: number | null | undefined;
  state: string | null | undefined;
}) {
  const done = Number(complete || 0);
  const total = Number(required || 0);
  const pctDone = total > 0 ? Math.min(100, (done / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-white">
            {done}/{total}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {Number(blockers || 0)} blocker(s).
          </p>
        </div>
        <span className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200">
          {stateLabel(state)}
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-[#d7ad32]"
          style={{ width: `${pctDone}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [parcel, setParcel] = useState<ParcelRow | null>(null);
  const [gate, setGate] = useState<GateRow | null>(null);

  useEffect(() => {
    async function load() {
      const { data: parcelData } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_PARCEL_CODE)
        .single();

      if (parcelData) {
        setParcel(parcelData as ParcelRow);

        const { data: gateData } = await supabase
          .from("release_gate_summary")
          .select("*")
          .eq("parcel_id", parcelData.id)
          .single();

        if (gateData) setGate(gateData as GateRow);
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Analytics Control" subtitle="Loading analytics...">
        <Card label="Loading" title="Reading analytics data..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const productTons =
    parcel?.expected_concentrate_tons || parcel?.accepted_tons || 0;
  const effectivePrice =
    parcel?.effective_price_per_ton || parcel?.expected_price_per_ton || 0;
  const revenue = productTons * effectivePrice;

  const margin =
    gate?.route_margin_percent ?? parcel?.estimated_route_margin_percent ?? 0;

  const releaseDecision = gate?.release_decision || "Hold / Gates Blocked";

  return (
    <ResourceShell
      title="Analytics Control"
      subtitle="Read-only cockpit powered by the central release gate summary and working parcel code."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Readiness Score" value={pct(gate?.readiness_score)} />
        <Stat label="Open Blockers" value={gate?.open_blockers ?? 0} />
        <Stat label="Hard Blockers" value={gate?.hard_blockers ?? 0} />
        <Stat label="Pending Blockers" value={gate?.pending_blockers ?? 0} />
        <Stat label="Release State" value={stateLabel(gate?.release_state)} />
      </section>

      <Card label="Commercial Analytics" title="Revenue and tonnage signal">
        <div className="space-y-4">
          <Stat label="Parcel" value={code} />
          <Stat
            label="Class"
            value={parcel?.commodity_class || "Hard Commodities"}
          />
          <Stat
            label="Resource"
            value={parcel?.resource_type || "Chrome"}
            gold
          />
          <Stat
            label="Category"
            value={parcel?.resource_category || "Ferrous Metals"}
          />
          <Stat label="Material" value={parcel?.material_type || "ROM"} />
          <Stat
            label="Stage"
            value={stageLabel(parcel?.material_stage)}
          />
          <Stat label="Product Quantity" value={tons(productTons)} />
          <Stat label="Route Quantity" value={tons(parcel?.feedstock_tons)} gold />
          <Stat label="Effective Price" value={`${money(effectivePrice)}/t`} />
          <Stat label="Revenue" value={money(revenue)} gold />
        </div>
      </Card>

      <Card label="Exposure Analytics" title="Supabase parcel economics">
        <div className="space-y-4">
          <Stat label="Route Cost" value={money(parcel?.estimated_route_cost)} />
          <Stat
            label="Verification / Quality Cost"
            value={money(parcel?.estimated_total_assay_cost)}
          />
          <Stat
            label="Surplus"
            value={money(parcel?.estimated_route_surplus)}
            gold
          />
          <Stat label="Margin" value={pct(margin)} gold />
          <Stat label="Margin State" value={gate?.margin_state || "Not captured"} />
          <Stat label="Price Basis" value={parcel?.price_basis || "Not captured"} />
        </div>

        <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
            Central Interpretation
          </p>
          <p className="mt-3 text-2xl font-black text-red-100">
            {releaseDecision}
          </p>
          <p className="mt-3 text-sm leading-7 text-red-100/80">
            Analytics reads the same release decision as Dashboard, Finance,
            Route Builder and Operations. No separate page-level decision logic
            is used here.
          </p>
        </div>
      </Card>

      <Card label="Gate Analytics" title="Readiness by control family">
        <div className="space-y-4">
          <GateFamily
            label="Documents"
            complete={gate?.documents_complete}
            required={gate?.documents_required}
            blockers={gate?.documents_blockers}
            state={gate?.documents_state}
          />
          <GateFamily
            label="Approvals"
            complete={gate?.approvals_complete}
            required={gate?.approvals_required}
            blockers={gate?.approvals_blockers}
            state={gate?.approvals_state}
          />
          <GateFamily
            label="Counterparties"
            complete={gate?.counterparties_complete}
            required={gate?.counterparties_required}
            blockers={gate?.counterparties_blockers}
            state={gate?.counterparties_state}
          />
          <GateFamily
            label="Routes"
            complete={gate?.routes_complete}
            required={gate?.routes_required}
            blockers={gate?.routes_blockers}
            state={gate?.routes_state}
          />
        </div>
      </Card>
    </ResourceShell>
  );
  }
