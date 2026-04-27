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
  estimated_total_assay_cost: number | null;
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

function Step({
  number,
  label,
  title,
  text,
  state,
}: {
  number: number;
  label: string;
  title: string;
  text: string;
  state: string | null | undefined;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            {number}. {label}
          </p>
          <p className="mt-3 text-2xl font-black text-white">{title}</p>
        </div>
        <span className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200">
          {stateLabel(state)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
    </div>
  );
}

export default function OperationsPage() {
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
      <ResourceShell title="Operations Control" subtitle="Loading operations...">
        <Card label="Loading" title="Reading operations data..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const productTons =
    parcel?.expected_concentrate_tons || parcel?.accepted_tons || 0;

  return (
    <ResourceShell
      title="Operations Control"
      subtitle="Read-only dispatch, loading, plant handoff, movement and delivery control using working parcel code."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={code} />
        <Stat label="Resource" value={parcel?.resource_type || "Chrome"} gold />
        <Stat label="Material" value={parcel?.material_type || "ROM"} />
        <Stat label="Operations State" value={stateLabel(gate?.release_state)} />
      </section>

      <Card label="Operations Basis" title="Parcel movement control">
        <div className="space-y-4">
          <Stat
            label="Commodity Class"
            value={parcel?.commodity_class || "Hard Commodities"}
          />
          <Stat
            label="Category"
            value={parcel?.resource_category || "Ferrous Metals"}
          />
          <Stat
            label="Material Stage"
            value={stageLabel(parcel?.material_stage)}
          />
          <Stat label="Product Quantity" value={tons(productTons)} />
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
          <Stat
            label="Verification / Quality Cost"
            value={money(parcel?.estimated_total_assay_cost)}
          />
          <Stat
            label="Surplus"
            value={money(parcel?.estimated_route_surplus)}
            gold
          />
        </div>
      </Card>

      <Card label="Route Movement Chain" title="Origin, plant, delivery and transporter">
        <div className="space-y-4">
          <Stat label="Origin / Loading" value={parcel?.origin_location || "Not captured"} />
          <Stat label="Plant / Processing" value={parcel?.plant_location || "Not captured"} />
          <Stat label="Delivery / Offtake" value={parcel?.delivery_location || "Not captured"} />
          <Stat label="Transporter" value={parcel?.transporter_name || "Not captured"} />
          <Stat
            label="Route Note"
            value={
              parcel?.route_note ||
              "Seed route chain for first live parcel. Plant and document gates still blocked."
            }
          />
        </div>
      </Card>

      <Card label="Operational Step Flow" title="Gate to delivery sequence">
        <div className="space-y-4">
          <Step
            number={1}
            label="Source / Supplier"
            title="Verify source authority"
            text="Confirm supplier authority, material control, location, KYC/FICA and source evidence before loading."
            state={gate?.counterparties_state}
          />
          <Step
            number={2}
            label="Plant / Processing"
            title="Confirm processing route"
            text="Confirm plant availability, tolling or processing quote, recovery basis, quality timing and operational handoff."
            state={gate?.routes_state}
          />
          <Step
            number={3}
            label="Documents"
            title="Complete evidence pack"
            text="Supplier, plant, transport, buyer, assay and movement evidence must be complete before release."
            state={gate?.documents_state}
          />
          <Step
            number={4}
            label="Approvals"
            title="Clear release authority"
            text="Dispatch, movement, settlement and finance authority must be approved before operational action."
            state={gate?.approvals_state}
          />
        </div>
      </Card>

      <Card label="Operations Release Control" title="Do not dispatch yet">
        <div className="space-y-4">
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-2xl font-black text-red-100">
              Operations release remains blocked.
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Do not authorize loading, truck dispatch, plant handoff,
              weighbridge movement, delivery, settlement or finance handoff
              until all central release gates are clear.
            </p>
          </div>

          <Stat label="Central Decision" value={gate?.release_decision || "Hold / Gates Blocked"} />
          <Stat label="Open Blockers" value={gate?.open_blockers ?? 0} />
          <Stat label="Hard Blockers" value={gate?.hard_blockers ?? 0} />
          <Stat label="Pending Blockers" value={gate?.pending_blockers ?? 0} />
        </div>
      </Card>
    </ResourceShell>
  );
  }
