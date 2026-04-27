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
  resource_category: string | null;
  resource_type: string | null;
  material_type: string | null;
  commodity_class: string | null;
  material_stage: string | null;
  estimated_route_margin_percent: number | null;
  estimated_route_surplus: number | null;
  estimated_route_cost: number | null;
  effective_price_per_ton: number | null;
  expected_price_per_ton: number | null;
  accepted_tons: number | null;
  expected_concentrate_tons: number | null;
};

type GateRow = {
  parcel_id: string | null;
  release_state: string | null;
  release_decision: string | null;
  open_blockers: number | null;
  hard_blockers: number | null;
  pending_blockers: number | null;
  margin_state: string | null;
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

function Pill({ value }: { value: string }) {
  const safe = value || "Blocked";
  const isGood =
    safe.toLowerCase().includes("approved") ||
    safe.toLowerCase().includes("ready") ||
    safe.toLowerCase().includes("strong");

  return (
    <span
      className={
        isGood
          ? "inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-200"
          : "inline-flex rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200"
      }
    >
      {safe}
    </span>
  );
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
  gold,
}: {
  label: string;
  value: string | number;
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
    </div>
  );
}

export default function DashboardPage() {
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
      <ResourceShell
        title="Executive Control Dashboard"
        subtitle="Loading central control summary..."
      >
        <Card label="Loading" title="Reading live Supabase parcel..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const releaseState = stateLabel(gate?.release_state);
  const leadDecision = gate?.release_decision || "Hold / Gates Blocked";

  const margin =
    gate?.route_margin_percent ??
    parcel?.estimated_route_margin_percent ??
    0;

  return (
    <ResourceShell
      title="Executive Control Dashboard"
      subtitle="Central control summary powered by Supabase release and parcel economics data."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Release State" value={releaseState} />
        <Stat label="Lead Decision" value={leadDecision} />
        <Stat label="Open Blockers" value={gate?.open_blockers ?? 0} />
        <Stat label="Route Margin" value={pct(margin)} gold />
      </section>

      <Card label="Lead / Opportunity" title="Current lead summary">
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
        </div>
      </Card>

      <Card label="Lead Economics Screening" title="Commercial starting point">
        <div className="space-y-4">
          <Stat
            label="Product Tons"
            value={Number(
              parcel?.expected_concentrate_tons || parcel?.accepted_tons || 0
            ).toFixed(3)}
          />
          <Stat
            label="Effective Price"
            value={`${money(
              parcel?.effective_price_per_ton ||
                parcel?.expected_price_per_ton ||
                0
            )}/t`}
            gold
          />
          <Stat label="Route Cost" value={money(parcel?.estimated_route_cost)} />
          <Stat
            label="Surplus"
            value={money(parcel?.estimated_route_surplus)}
            gold
          />
          <Stat label="Margin" value={pct(margin)} gold />
        </div>
      </Card>

      <Card label="Release Gate Engine" title="Central blocker summary">
        <div className="space-y-4">
          <Stat label="Hard Blockers" value={gate?.hard_blockers ?? 0} />
          <Stat label="Pending Blockers" value={gate?.pending_blockers ?? 0} />
          <Stat label="Total Open" value={gate?.open_blockers ?? 0} />
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Current State
            </p>
            <div className="mt-3">
              <Pill value={releaseState} />
            </div>
          </div>
        </div>
      </Card>
    </ResourceShell>
  );
  }
