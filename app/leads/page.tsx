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
  expected_concentrate_tons: number | null;
  accepted_tons: number | null;
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  market_reference_price_per_ton: number | null;
  negotiated_price_per_ton: number | null;
  effective_price_per_ton: number | null;
  expected_price_per_ton: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  estimated_total_assay_cost: number | null;
  price_basis: string | null;
  price_override_note: string | null;
};

type GateRow = {
  parcel_id: string | null;
  release_state: string | null;
  release_decision: string | null;
  open_blockers: number | null;
  hard_blockers: number | null;
  pending_blockers: number | null;
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

function stageText(value: string | null | undefined) {
  if (value === "raw_feedstock") return "Raw Feedstock";
  if (value === "intermediate_concentrate") {
    return "Intermediate / Saleable Product";
  }
  if (value === "finished_product") return "Finished Product";
  return stateText(value);
}

function marginState(value: number | null | undefined) {
  const n = Number(value || 0);
  if (n >= 25) return "Strong Route";
  if (n >= 18) return "Target Range";
  if (n >= 15) return "Below Target";
  if (n > 0) return "Weak Route";
  return "Blocked / No Price";
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

export default function LeadsPage() {
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
      <ResourceShell title="Lead Economics" subtitle="Loading lead record...">
        <Card label="Loading" title="Reading lead economics..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const productTons =
    parcel?.expected_concentrate_tons || parcel?.accepted_tons || 0;
  const effectivePrice =
    parcel?.effective_price_per_ton || parcel?.expected_price_per_ton || 0;
  const margin = parcel?.estimated_route_margin_percent || 0;

  return (
    <ResourceShell
      title="Lead Economics"
      subtitle="Commercial screening engine reading working parcel code, commodity class, material stage and structured price-basis fields."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={code} />
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
      </section>

      <Card label="Lead / Opportunity" title="Current lead summary">
        <div className="space-y-4">
          <Stat label="Parcel" value={code} />
          <Stat
            label="Commodity Class"
            value={parcel?.commodity_class || "Hard Commodities"}
          />
          <Stat
            label="Category"
            value={parcel?.resource_category || "Ferrous Metals"}
          />
          <Stat
            label="Resource"
            value={parcel?.resource_type || "Chrome"}
            gold
          />
          <Stat label="Material" value={parcel?.material_type || "ROM"} />
          <Stat
            label="Material Stage"
            value={stageText(parcel?.material_stage)}
          />
          <Stat label="Lead State" value={stateText(gate?.release_state)} />
          <Stat
            label="Release Decision"
            value={gate?.release_decision || "Hold / Gates Blocked"}
          />
          <Stat label="Open Blockers" value={gate?.open_blockers ?? 0} />
        </div>
      </Card>

      <Card label="Lead Economics Screening" title="Commercial starting point">
        <div className="space-y-4">
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
                ? `${tons(productTons)} ÷ ${pct(
                    parcel?.expected_yield_percent
                  )} yield`
                : "Saleable / finished product basis = product quantity"
            }
            gold
          />

          <Stat
            label="Market / Reference Price"
            value={`${money(parcel?.market_reference_price_per_ton)}/t`}
          />
          <Stat
            label="Negotiated Price"
            value={`${money(parcel?.negotiated_price_per_ton)}/t`}
          />
          <Stat
            label="Effective Price"
            value={`${money(effectivePrice)}/t`}
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
          <Stat label="Route Margin" value={pct(margin)} gold />
          <Stat label="Margin State" value={marginState(margin)} />
        </div>
      </Card>

      <Card label="Price Control" title="Price basis and override note">
        <div className="space-y-4">
          <Stat
            label="Price Basis"
            value={parcel?.price_basis || "Not captured"}
          />

          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Override / Price Note
            </p>
            <p className="mt-3 text-base leading-7 text-slate-300">
              {parcel?.price_override_note || "No price note captured."}
            </p>
          </div>

          <Link
            href="/economics/edit"
            className="inline-flex w-full justify-center rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c]"
          >
            Edit Lead Economics
          </Link>
        </div>
      </Card>
    </ResourceShell>
  );
  }
