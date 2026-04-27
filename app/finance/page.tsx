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
  market_reference_price_per_ton: number | null;
  negotiated_price_per_ton: number | null;
  effective_price_per_ton: number | null;
  expected_price_per_ton: number | null;
  feedstock_cost_per_ton: number | null;
  transport_to_plant_cost_per_ton: number | null;
  tolling_cost_per_ton: number | null;
  estimated_feedstock_cost: number | null;
  estimated_transport_cost: number | null;
  estimated_tolling_cost: number | null;
  estimated_total_assay_cost: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  price_basis: string | null;
};

type GateRow = {
  parcel_id: string | null;
  release_state: string | null;
  release_decision: string | null;
  open_blockers: number | null;
  hard_blockers: number | null;
  pending_blockers: number | null;
  documents_state: string | null;
  approvals_state: string | null;
  counterparties_state: string | null;
  routes_state: string | null;
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

function GateStat({
  label,
  state,
  note,
}: {
  label: string;
  state: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <span className="mt-3 inline-flex rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200">
        {state}
      </span>
      <p className="mt-3 text-sm leading-6 text-slate-400">{note}</p>
    </div>
  );
}

export default function FinancePage() {
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
      <ResourceShell title="Finance Control" subtitle="Loading finance view...">
        <Card label="Loading" title="Reading finance control data..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const productTons =
    parcel?.expected_concentrate_tons || parcel?.accepted_tons || 0;
  const effectivePrice =
    parcel?.effective_price_per_ton || parcel?.expected_price_per_ton || 0;
  const margin = parcel?.estimated_route_margin_percent || 0;
  const financeState = stateLabel(gate?.release_state);
  const decision = gate?.release_decision || "Hold / Gates Blocked";

  return (
    <ResourceShell
      title="Finance Control"
      subtitle="Read-only exposure, route cost, margin and release-control view using working parcel code."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={code} />
        <Stat label="Resource" value={parcel?.resource_type || "Chrome"} gold />
        <Stat label="Material" value={parcel?.material_type || "ROM"} />
        <Stat label="Finance State" value={financeState} />
      </section>

      <Card label="Finance Exposure" title="Cost and margin breakdown">
        <div className="space-y-4">
          <Stat label="Commodity Class" value={parcel?.commodity_class || "Hard Commodities"} />
          <Stat label="Category" value={parcel?.resource_category || "Ferrous Metals"} />
          <Stat label="Material Stage" value={stageLabel(parcel?.material_stage)} />
          <Stat label="Revenue" value={money(productTons * effectivePrice)} gold />
          <Stat label="Product Quantity" value={tons(productTons)} />
          <Stat label="Effective Price" value={`${money(effectivePrice)}/t`} />
          <Stat label="Price Basis" value={parcel?.price_basis || "Not captured"} />
          <Stat label="Feedstock / Acquisition Cost" value={money(parcel?.estimated_feedstock_cost)} />
          <Stat label="Transport / Logistics Cost" value={money(parcel?.estimated_transport_cost)} />
          <Stat label="Tolling / Processing Cost" value={money(parcel?.estimated_tolling_cost)} />
          <Stat label="Verification / Quality Cost" value={money(parcel?.estimated_total_assay_cost)} />
          <Stat label="Route Cost" value={money(parcel?.estimated_route_cost)} />
          <Stat label="Indicative Surplus" value={money(parcel?.estimated_route_surplus)} gold />
          <Stat label="Route Margin" value={pct(margin)} gold />
        </div>
      </Card>

      <Card label="Finance Release Gate" title="Finance follows the release gate engine">
        <div className="space-y-4">
          <Stat label="Central Decision" value={decision} />
          <Stat label="Open Blockers" value={gate?.open_blockers ?? 0} />
          <Stat label="Hard Blockers" value={gate?.hard_blockers ?? 0} />
          <Stat label="Pending Blockers" value={gate?.pending_blockers ?? 0} />

          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
              Finance Control Rule
            </p>
            <p className="mt-3 text-2xl font-black text-red-100">
              Do not release finance yet
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Do not release settlement, purchase funding, dispatch funding or
              transport payment until the central release gate result is clear.
            </p>
          </div>
        </div>
      </Card>

      <Card label="Readiness Families" title="Hard blocker position">
        <div className="space-y-4">
          <GateStat
            label="Documents"
            state={stateLabel(gate?.documents_state)}
            note="Document evidence must be complete before finance release."
          />
          <GateStat
            label="Approvals"
            state={stateLabel(gate?.approvals_state)}
            note="Approval authority must be cleared before payment action."
          />
          <GateStat
            label="Counterparties"
            state={stateLabel(gate?.counterparties_state)}
            note="Supplier, buyer, plant and transporter controls must be verified."
          />
          <GateStat
            label="Routes"
            state={stateLabel(gate?.routes_state)}
            note="Route chain and movement basis must be confirmed before dispatch."
          />
        </div>
      </Card>
    </ResourceShell>
  );
  }
