"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

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
  origin_location: string | null;
  plant_location: string | null;
  delivery_location: string | null;
  transporter_name: string | null;
  route_note: string | null;
  expected_concentrate_tons: number | null;
  accepted_tons: number | null;
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
};

type GateRow = {
  parcel_id: string | null;
  release_state: string | null;
  release_decision: string | null;
  open_blockers: number | null;
  hard_blockers: number | null;
  pending_blockers: number | null;
  margin_blocker: boolean | null;
  route_margin_percent: number | null;
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

function stateText(value: string | null | undefined) {
  if (!value) return "Blocked";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
        {stateText(value)}
      </span>
    </div>
  );
}

export default function RouteBuilderPage() {
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
        title="Route Builder Control Module"
        subtitle="Loading route chain..."
      >
        <Card label="Loading" title="Reading route control data..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const margin =
    gate?.route_margin_percent ?? parcel?.estimated_route_margin_percent ?? 0;
  const releaseDecision = gate?.release_decision || "Hold / Gates Blocked";

  return (
    <ResourceShell
      title="Route Builder Control Module"
      subtitle="Route-chain view powered by central release result and working parcel code."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={code} />
        <Stat label="Resource" value={parcel?.resource_type || "Chrome"} gold />
        <Stat label="Material" value={parcel?.material_type || "ROM"} />
        <Stat label="Route State" value={stateText(gate?.release_state)} />
      </section>

      <Card label="Route Chain" title="Supplier to plant to buyer">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Route Chain
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {parcel?.origin_location || "Not captured"} to{" "}
                {parcel?.plant_location || "plant"} to{" "}
                {parcel?.delivery_location || "buyer"}
              </p>
            </div>
            <span className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200">
              {stateText(gate?.routes_state)}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <Stat label="Origin / Loading" value={parcel?.origin_location || "Not captured"} />
            <Stat label="Plant / Processing" value={parcel?.plant_location || "Not captured"} />
            <Stat label="Delivery / Offtake" value={parcel?.delivery_location || "Not captured"} />
            <Stat label="Transporter" value={parcel?.transporter_name || "Not captured"} />
            <Stat
              label="Route Note"
              value={parcel?.route_note || "Seed route chain for first live parcel. Plant and document gates still blocked."}
            />
          </div>
        </div>
      </Card>

      <Card label="Release Gate Result" title="Route Builder follows the central decision">
        <div className="space-y-4">
          <Stat label="Release Decision" value={releaseDecision} />
          <Stat label="Open Blockers" value={gate?.open_blockers ?? 0} />
          <Stat label="Hard Blockers" value={gate?.hard_blockers ?? 0} />
          <Stat label="Pending Blockers" value={gate?.pending_blockers ?? 0} />
          <Stat
            label="Margin Blocker"
            value={gate?.margin_blocker ? "Yes" : "No"}
          />

          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
              Release Decision
            </p>
            <p className="mt-3 text-2xl font-black text-red-100">
              {releaseDecision}
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Route Builder reads the same central release decision as
              Dashboard, Analytics, Finance and Operations. No separate
              page-level route release logic is used.
            </p>
          </div>
        </div>
      </Card>

      <Card label="Route Economics Basis" title="Tonnage and margin signal">
        <div className="space-y-4">
          <Stat label="Product Quantity" value={tons(parcel?.expected_concentrate_tons || parcel?.accepted_tons)} />
          <Stat
            label={
              parcel?.material_stage === "raw_feedstock"
                ? "Feedstock Required"
                : "Route Product Quantity"
            }
            value={tons(parcel?.feedstock_tons)}
            note={
              parcel?.material_stage === "raw_feedstock"
                ? `${pct(parcel?.expected_yield_percent)} expected yield`
                : "Saleable / finished product basis = product quantity"
            }
            gold
          />
          <Stat label="Route Cost" value={money(parcel?.estimated_route_cost)} />
          <Stat label="Surplus" value={money(parcel?.estimated_route_surplus)} gold />
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

          <GateItem label="Documents" value={gate?.documents_state} />
          <GateItem label="Approvals" value={gate?.approvals_state} />
          <GateItem label="Counterparties" value={gate?.counterparties_state} />
          <GateItem label="Routes" value={gate?.routes_state} />

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
