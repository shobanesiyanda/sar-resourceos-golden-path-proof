"use client";

import { useEffect, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";
import { stageLabel, stateLabel } from "../../lib/displayLabels";
import { ActiveGate, ActiveParcel, loadActiveParcel } from "../../lib/activeParcel";

function money(value: number | null | undefined) {
  const n = Number(value || 0);
  return `R ${n.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
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
  const [parcel, setParcel] = useState<ActiveParcel | null>(null);
  const [gate, setGate] = useState<ActiveGate | null>(null);

  useEffect(() => {
    async function load() {
      const result = await loadActiveParcel(supabase);
      setParcel(result.parcel);
      setGate(result.gate);
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

  if (!parcel || !gate) {
    return (
      <ResourceShell title="Finance Control" subtitle="No active parcel found.">
        <Card label="No Data" title="Active parcel could not be loaded." />
      </ResourceShell>
    );
  }

  const revenue = parcel.productQuantity * parcel.effectivePrice;
  const margin =
    gate.routeMarginPercent || parcel.estimatedMarginPercent || 0;

  return (
    <ResourceShell
      title="Finance Control"
      subtitle="Read-only exposure, route cost, margin and release-control view using the active working parcel."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcel.parcelCode} />
        <Stat label="Resource" value={parcel.resource} gold />
        <Stat label="Material" value={parcel.material} />
        <Stat label="Finance State" value={stateLabel(gate.releaseState)} />
      </section>

      <Card label="Finance Exposure" title="Cost and margin breakdown">
        <div className="space-y-4">
          <Stat label="Commodity Class" value={parcel.commodityClass} />
          <Stat label="Category" value={parcel.category} />
          <Stat label="Material Stage" value={stageLabel(parcel.materialStage)} />
          <Stat label="Revenue" value={money(revenue)} gold />
          <Stat label="Product Quantity" value={tons(parcel.productQuantity)} />
          <Stat label="Effective Price" value={`${money(parcel.effectivePrice)}/t`} />
          <Stat label="Price Basis" value={parcel.priceBasis} />
          <Stat label="Feedstock / Acquisition Cost" value={money(parcel.estimatedFeedstockCost)} />
          <Stat label="Transport / Logistics Cost" value={money(parcel.estimatedTransportCost)} />
          <Stat label="Tolling / Processing Cost" value={money(parcel.estimatedTollingCost)} />
          <Stat label="Verification / Quality Cost" value={money(parcel.estimatedAssayCost)} />
          <Stat label="Route Cost" value={money(parcel.estimatedRouteCost)} />
          <Stat label="Indicative Surplus" value={money(parcel.estimatedSurplus)} gold />
          <Stat label="Route Margin" value={pct(margin)} gold />
        </div>
      </Card>

      <Card label="Finance Release Gate" title="Finance follows the release gate engine">
        <div className="space-y-4">
          <Stat label="Central Decision" value={gate.releaseDecision} />
          <Stat label="Open Blockers" value={gate.openBlockers} />
          <Stat label="Hard Blockers" value={gate.hardBlockers} />
          <Stat label="Pending Blockers" value={gate.pendingBlockers} />

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
            state={stateLabel(gate.documentsState)}
            note="Document evidence must be complete before finance release."
          />
          <GateStat
            label="Approvals"
            state={stateLabel(gate.approvalsState)}
            note="Approval authority must be cleared before payment action."
          />
          <GateStat
            label="Counterparties"
            state={stateLabel(gate.counterpartiesState)}
            note="Supplier, buyer, plant and transporter controls must be verified."
          />
          <GateStat
            label="Routes"
            state={stateLabel(gate.routesState)}
            note="Route chain and movement basis must be confirmed before dispatch."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
