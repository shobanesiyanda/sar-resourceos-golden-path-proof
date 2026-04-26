"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import ResourceShell from "../../components/ResourceShell";

const PARCEL_CODE = "PAR-CHR-2026-0001";

type Parcel = {
  id: string;
  parcel_code: string;
  commodity: string | null;
  resource_category: string | null;
  resource_type: string | null;
  material_type: string | null;
  accepted_tons: number | null;
  expected_concentrate_tons: number | null;
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  expected_price_per_ton: number | null;
  indicative_revenue: number | null;
  feedstock_cost_per_ton: number | null;
  transport_to_plant_cost_per_ton: number | null;
  tolling_cost_per_ton: number | null;
  estimated_feedstock_cost: number | null;
  estimated_transport_cost: number | null;
  estimated_tolling_cost: number | null;
  feedstock_assay_cost_per_batch: number | null;
  feedstock_assay_batches: number | null;
  estimated_feedstock_assay_cost: number | null;
  concentrate_assay_cost_per_batch: number | null;
  concentrate_assay_batches: number | null;
  estimated_concentrate_assay_cost: number | null;
  estimated_total_assay_cost: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  economics_basis: string | null;
};

function money(v: number | null | undefined) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
}

function tons(v: number | null | undefined) {
  return Number(v || 0).toFixed(3);
}

function pct(v: number | null | undefined) {
  return `${Number(v || 0).toFixed(1)}%`;
}

function marginState(m: number) {
  if (m < 18) return "Below Target";
  if (m <= 25) return "Target Band";
  return "Strong Route";
}

function marginClass(m: number) {
  if (m < 18) return "border-red-400/40 bg-red-500/15 text-red-200";
  if (m <= 25) return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
}

function financeState(m: number) {
  if (m < 18) return "Blocked";
  return "Pending Gates";
}

function Card(p: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d7ad32]">
        {p.label}
      </p>
      <h3 className="mt-2 text-2xl font-black">{p.title}</h3>
      {p.children}
    </section>
  );
}

function Stat(p: { label: string; value: string; note?: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </p>
      <p
        className={`mt-2 text-3xl font-black ${
          p.gold ? "text-[#f5d778]" : "text-white"
        }`}
      >
        {p.value}
      </p>
      {p.note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p>
      ) : null}
    </div>
  );
}

function Row(p: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
      <p className="text-sm text-slate-400">{p.label}</p>
      <p className="text-right text-sm font-black text-white">{p.value}</p>
    </div>
  );
}

export default function FinancePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", auth.user.id)
        .single();

      if (!profile || profile.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      const { data, error: parcelError } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (parcelError || !data) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      setParcel(data as Parcel);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Finance Control" subtitle="Loading finance...">
        <Card label="Loading" title="Reading Supabase finance data..." />
      </ResourceShell>
    );
  }

  if (error || !parcel) {
    return (
      <ResourceShell title="Finance Control" subtitle="Finance module error">
        <Card label="Error" title="Could not load finance">
          <p className="mt-3 text-red-200">
            {error || "Could not load finance page."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const productTons = parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0;
  const feedstockTons = parcel.feedstock_tons ?? 0;
  const price = parcel.expected_price_per_ton ?? 0;
  const revenue = parcel.indicative_revenue ?? productTons * price;

  const routeCost =
    parcel.estimated_route_cost ??
    Number(parcel.estimated_feedstock_cost || 0) +
      Number(parcel.estimated_transport_cost || 0) +
      Number(parcel.estimated_tolling_cost || 0) +
      Number(parcel.estimated_total_assay_cost || 0);

  const surplus = parcel.estimated_route_surplus ?? revenue - routeCost;
  const margin =
    parcel.estimated_route_margin_percent ??
    (revenue > 0 ? (surplus / revenue) * 100 : 0);

  return (
    <ResourceShell
      title="Finance Control"
      subtitle="Read-only exposure, assay-adjusted route cost, surplus, margin and finance handoff view."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcel.parcel_code} />
        <Stat label="Resource" value={parcel.resource_type || parcel.commodity || "Not Set"} gold />
        <Stat label="Category" value={parcel.resource_category || "Not Set"} />
        <Stat label="Material" value={parcel.material_type || "Not Set"} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Product Tons" value={tons(productTons)} />
        <Stat
          label="Feedstock Required"
          value={tons(feedstockTons)}
          note={`${tons(productTons)}t at ${pct(parcel.expected_yield_percent)} yield`}
          gold
        />
        <Stat label="Selling Price" value={`${money(price)}/t`} />
        <Stat label="Revenue" value={money(revenue)} gold />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Feedstock Cost"
          value={money(parcel.estimated_feedstock_cost)}
          note={`${money(parcel.feedstock_cost_per_ton)}/t × ${tons(feedstockTons)}t`}
        />
        <Stat
          label="Transport Cost"
          value={money(parcel.estimated_transport_cost)}
          note={`${money(parcel.transport_to_plant_cost_per_ton)}/t × ${tons(feedstockTons)}t`}
        />
        <Stat
          label="Tolling Cost"
          value={money(parcel.estimated_tolling_cost)}
          note={`${money(parcel.tolling_cost_per_ton)}/t × ${tons(feedstockTons)}t`}
        />
        <Stat label="Total Assay Cost" value={money(parcel.estimated_total_assay_cost)} gold />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Feedstock Assay"
          value={money(parcel.estimated_feedstock_assay_cost)}
          note={`${money(parcel.feedstock_assay_cost_per_batch)} × ${parcel.feedstock_assay_batches || 0} batches`}
        />
        <Stat
          label="Final Product Assay"
          value={money(parcel.estimated_concentrate_assay_cost)}
          note={`${money(parcel.concentrate_assay_cost_per_batch)} × ${parcel.concentrate_assay_batches || 0} batches`}
        />
        <Stat label="Route Cost" value={money(routeCost)} />
        <Stat label="Surplus" value={money(surplus)} gold />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className={`rounded-3xl border p-5 ${marginClass(margin)}`}>
          <p className="text-xs font-bold uppercase tracking-[0.25em]">
            Margin Control State
          </p>
          <p className="mt-3 text-3xl font-black">{marginState(margin)}</p>
          <p className="mt-2 text-sm leading-6">
            Target control band is 18%–25%. Below 18% remains under review.
          </p>
        </div>

        <Stat label="Route Margin" value={pct(margin)} gold />

        <div className="rounded-3xl border border-red-400/40 bg-red-500/15 p-5 text-red-200">
          <p className="text-xs font-bold uppercase tracking-[0.25em]">
            Finance Handoff
          </p>
          <p className="mt-3 text-3xl font-black">{financeState(margin)}</p>
          <p className="mt-2 text-sm leading-6">
            No finance release until documents, approvals, route, counterparties and operations gates clear.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card label="Finance Exposure" title="Cost and margin breakdown">
          <div className="mt-4">
            <Row label="Revenue" value={money(revenue)} />
            <Row label="Feedstock cost" value={money(parcel.estimated_feedstock_cost)} />
            <Row label="Transport cost" value={money(parcel.estimated_transport_cost)} />
            <Row label="Tolling cost" value={money(parcel.estimated_tolling_cost)} />
            <Row label="Feedstock assay cost" value={money(parcel.estimated_feedstock_assay_cost)} />
            <Row label="Final product assay cost" value={money(parcel.estimated_concentrate_assay_cost)} />
            <Row label="Total assay cost" value={money(parcel.estimated_total_assay_cost)} />
            <Row label="Total route cost" value={money(routeCost)} />
            <Row label="Indicative surplus" value={money(surplus)} />
            <Row label="Route margin" value={pct(margin)} />
          </div>
        </Card>

        <Card label="Control Rule" title="Do not release finance yet">
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
            <p className="text-xl font-black text-red-200">
              Finance handoff remains controlled.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Do not release settlement, purchase funding, dispatch finance or route payment unless all release gates are cleared and the margin basis is commercially approved.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Economics Basis
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {parcel.economics_basis || "No economics basis note captured yet."}
            </p>
          </div>
        </Card>
      </section>

      <Card label="Next Finance Actions" title="Clear before handoff">
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Documents" value="Required" note="Supplier, plant, transport, buyer and assay support must be complete." />
          <Stat label="Approvals" value="Required" note="Supplier, plant and finance approvals must clear." />
          <Stat label="Margin" value={marginState(margin)} note="Route must meet target or be approved by exception." gold />
          <Stat label="Release State" value={financeState(margin)} note="Finance remains controlled until all gates clear." />
        </div>
      </Card>
    </ResourceShell>
  );
    }
