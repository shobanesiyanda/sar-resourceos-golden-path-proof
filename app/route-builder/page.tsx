"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

function GateItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <span className="mt-3 inline-flex rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200">
        {stateLabel(value)}
      </span>
    </div>
  );
}

export default function RouteBuilderPage() {
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
      <ResourceShell
        title="Route Builder Control Module"
        subtitle="Loading route chain..."
      >
        <Card label="Loading" title="Reading route control data..." />
      </ResourceShell>
    );
  }

  if (!parcel || !gate) {
    return (
      <ResourceShell
        title="Route Builder Control Module"
        subtitle="No active parcel found."
      >
        <Card label="No Data" title="Active parcel could not be loaded." />
      </ResourceShell>
    );
  }

  const margin =
    gate.routeMarginPercent || parcel.estimatedMarginPercent || 0;

  return (
    <ResourceShell
      title="Route Builder Control Module"
      subtitle="Route-chain view powered by central release result and active working parcel."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcel.parcelCode} />
        <Stat label="Resource" value={parcel.resource} gold />
        <Stat label="Material" value={parcel.material} />
        <Stat label="Route State" value={stateLabel(gate.releaseState)} />
      </section>

      <Card label="Route Identity" title="Commodity and material basis">
        <div className="space-y-4">
          <Stat label="Commodity Class" value={parcel.commodityClass} />
          <Stat label="Category" value={parcel.category} />
          <Stat label="Material Stage" value={stageLabel(parcel.materialStage)} />
        </div>
      </Card>

      <Card label="Route Chain" title="Supplier to plant to buyer">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Route Chain
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {parcel.originLocation} to {parcel.plantLocation} to{" "}
                {parcel.deliveryLocation}
              </p>
            </div>
            <span className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200">
              {stateLabel(gate.routesState)}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <Stat label="Origin / Loading" value={parcel.originLocation} />
            <Stat label="Plant / Processing" value={parcel.plantLocation} />
            <Stat label="Delivery / Offtake" value={parcel.deliveryLocation} />
            <Stat label="Transporter" value={parcel.transporterName} />
            <Stat label="Route Note" value={parcel.routeNote} />
          </div>
        </div>
      </Card>

      <Card label="Release Gate Result" title="Route Builder follows the central decision">
        <div className="space-y-4">
          <Stat label="Release Decision" value={gate.releaseDecision} />
          <Stat label="Open Blockers" value={gate.openBlockers} />
          <Stat label="Hard Blockers" value={gate.hardBlockers} />
          <Stat label="Pending Blockers" value={gate.pendingBlockers} />
          <Stat label="Margin Blocker" value={gate.marginBlocker ? "Yes" : "No"} />

          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
              Release Decision
            </p>
            <p className="mt-3 text-2xl font-black text-red-100">
              {gate.releaseDecision}
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Route Builder reads the same central release decision as Dashboard,
              Analytics, Finance and Operations.
            </p>
          </div>
        </div>
      </Card>

      <Card label="Route Economics Basis" title="Tonnage and margin signal">
        <div className="space-y-4">
          <Stat label="Product Quantity" value={tons(parcel.productQuantity)} />
          <Stat
            label={
              parcel.materialStage === "raw_feedstock"
                ? "Feedstock Required"
                : "Route Product Quantity"
            }
            value={tons(parcel.routeQuantity)}
            note={
              parcel.materialStage === "raw_feedstock"
                ? `${pct(parcel.expectedYieldPercent)} expected yield`
                : "Saleable / finished product basis = product quantity"
            }
            gold
          />
          <Stat label="Route Cost" value={money(parcel.estimatedRouteCost)} />
          <Stat label="Surplus" value={money(parcel.estimatedSurplus)} gold />
          <Stat label="Route Margin" value={pct(margin)} gold />
        </div>
      </Card>

      <Card label="Central Route Control" title="Route cannot proceed yet">
        <div className="space-y-4">
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-2xl font-black text-red-100">
              Route release remains blocked.
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Do not authorize loading, plant dispatch, buyer movement,
              transport release or finance handoff until the central release
              gate result is clear.
            </p>
          </div>

          <GateItem label="Documents" value={gate.documentsState} />
          <GateItem label="Approvals" value={gate.approvalsState} />
          <GateItem label="Counterparties" value={gate.counterpartiesState} />
          <GateItem label="Routes" value={gate.routesState} />

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard"
              className="rounded-full bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/documents"
              className="rounded-full border border-slate-700 px-5 py-3 text-sm font-black text-white"
            >
              Documents
            </Link>
          </div>
        </div>
      </Card>
    </ResourceShell>
  );
}
