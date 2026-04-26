"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  expected_concentrate_tons: number | null;
  accepted_tons: number | null;
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  expected_price_per_ton: number | null;
  indicative_revenue: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
};

type StatusRow = { status: string | null };
type RouteRow = {
  route_name: string | null;
  origin_location: string | null;
  plant_location: string | null;
  delivery_location: string | null;
  status: string | null;
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
  if (m < 18) return "Hold / Below Target";
  if (m <= 25) return "Proceed to Verification";
  return "Strong Lead";
}

function marginClass(m: number) {
  if (m < 18) return "border-red-400/40 bg-red-500/15 text-red-200";
  if (m <= 25) return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
}

function countOpen(rows: StatusRow[]) {
  return rows.filter((r) => r.status === "Blocked" || r.status === "Pending").length;
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
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{p.label}</p>
      <p className={`mt-2 text-3xl font-black ${p.gold ? "text-[#f5d778]" : "text-white"}`}>
        {p.value}
      </p>
      {p.note ? <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p> : null}
    </div>
  );
}

function ActionLink(p: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={p.href}
      className="inline-flex rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
    >
      {p.children}
    </Link>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [route, setRoute] = useState<RouteRow | null>(null);
  const [documents, setDocuments] = useState<StatusRow[]>([]);
  const [approvals, setApprovals] = useState<StatusRow[]>([]);
  const [counterparties, setCounterparties] = useState<StatusRow[]>([]);

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

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const { data: routeData } = await supabase
        .from("route_chains")
        .select("route_name, origin_location, plant_location, delivery_location, status")
        .eq("route_code", "ROUTE-CHR-2026-0001")
        .maybeSingle();

      const { data: docs } = await supabase
        .from("documents")
        .select("status")
        .eq("parcel_id", parcelData.id);

      const { data: apps } = await supabase
        .from("approvals")
        .select("status")
        .eq("parcel_id", parcelData.id);

      const { data: parties } = await supabase
        .from("counterparties")
        .select("status");

      setParcel(parcelData as Parcel);
      setRoute((routeData as RouteRow) || null);
      setDocuments((docs as StatusRow[]) || []);
      setApprovals((apps as StatusRow[]) || []);
      setCounterparties((parties as StatusRow[]) || []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Executive Control Dashboard" subtitle="Loading live control state...">
        <Card label="Loading" title="Reading Supabase control data..." />
      </ResourceShell>
    );
  }

  if (error || !parcel) {
    return (
      <ResourceShell title="Executive Control Dashboard" subtitle="Dashboard error">
        <Card label="Error" title="Could not load dashboard">
          <p className="mt-3 text-red-200">{error || "Unknown dashboard error."}</p>
        </Card>
      </ResourceShell>
    );
  }

  const productTons = parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0;
  const margin = Number(parcel.estimated_route_margin_percent || 0);
  const revenue =
    parcel.indicative_revenue ||
    productTons * Number(parcel.expected_price_per_ton || 0);

  const openDocs = countOpen(documents);
  const openApprovals = countOpen(approvals);
  const openParties = countOpen(counterparties);
  const openRoute = route?.status === "Blocked" || route?.status === "Pending" ? 1 : 0;
  const openTotal = openDocs + openApprovals + openParties + openRoute;
  const controlState = openTotal > 0 || margin < 18 ? "Blocked" : "Ready";

  return (
    <ResourceShell
      title="Executive Control Dashboard"
      subtitle="Clean control summary for lead economics, route readiness, demand/logistics intelligence, finance exposure and next actions."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Control State" value={controlState} gold={controlState !== "Blocked"} />
        <Stat label="Lead Decision" value={marginState(margin)} />
        <Stat label="Open Blockers" value={String(openTotal)} />
        <Stat label="Route Margin" value={pct(margin)} gold />
      </section>

      <Card label="Lead / Opportunity" title="Current lead summary">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Parcel" value={parcel.parcel_code} />
          <Stat label="Resource" value={parcel.resource_type || parcel.commodity || "Not set"} gold />
          <Stat label="Category" value={parcel.resource_category || "Not set"} />
          <Stat label="Material" value={parcel.material_type || "Not set"} />
        </div>
      </Card>

      <Card label="Lead Economics Screening" title="Commercial starting point">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Target Product Tons" value={tons(productTons)} />
          <Stat label="Feedstock Required" value={tons(parcel.feedstock_tons)} note={`${pct(parcel.expected_yield_percent)} yield`} gold />
          <Stat label="Revenue" value={money(revenue)} gold />
          <Stat label="Route Cost" value={money(parcel.estimated_route_cost)} />
          <Stat label="Surplus" value={money(parcel.estimated_route_surplus)} gold />
          <Stat label="Selling Price" value={`${money(parcel.expected_price_per_ton)}/t`} />
          <div className={`rounded-2xl border p-4 ${marginClass(margin)}`}>
            <p className="text-xs uppercase tracking-[0.25em]">Decision</p>
            <p className="mt-2 text-2xl font-black">{marginState(margin)}</p>
            <p className="mt-2 text-sm leading-6">Screen before route verification.</p>
          </div>
        </div>

        <div className="mt-5">
          <ActionLink href="/economics">Open Lead Economics</ActionLink>
        </div>
      </Card>

      <Card label="Route Readiness" title="Route and release summary">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Origin" value={route?.origin_location || "Pending"} />
          <Stat label="Plant / Tolling" value={route?.plant_location || "Pending"} />
          <Stat label="Delivery / Offtake" value={route?.delivery_location || "Pending"} />
          <Stat label="Route State" value={route?.status || "Pending"} gold={route?.status === "Approved"} />
          <Stat label="Documents Open" value={`${openDocs}/${documents.length}`} />
          <Stat label="Approvals Open" value={`${openApprovals}/${approvals.length}`} />
          <Stat label="Counterparties Open" value={`${openParties}/${counterparties.length}`} />
          <Stat label="Finance Gate" value={margin < 18 ? "Blocked" : "Pending"} />
        </div>
      </Card>

      <Card label="Global Route & Demand Heat Map" title="Supply, demand and logistics intelligence">
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 xl:col-span-2">
            <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#050914] p-5">
              <div className="absolute left-[12%] top-[30%] h-20 w-20 rounded-full bg-[#d7ad32]/20 blur-xl" />
              <div className="absolute left-[45%] top-[42%] h-24 w-24 rounded-full bg-blue-400/10 blur-xl" />
              <div className="absolute right-[12%] top-[56%] h-20 w-20 rounded-full bg-emerald-400/10 blur-xl" />

              <div className="relative grid h-full gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#f5d778]">Supply Zone</p>
                  <h4 className="mt-2 text-xl font-black">Rustenburg / North West</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Chrome feedstock, ROM, tailings, dumps and sweepings corridor.</p>
                </div>

                <div className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200">Processing Zone</p>
                  <h4 className="mt-2 text-xl font-black">Wash Plant Corridor</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Tolling, recovery, assay turnaround and plant approval dependency.</p>
                </div>

                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Demand / Offtake</p>
                  <h4 className="mt-2 text-xl font-black">City Deep / Export Handoff</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Buyer demand, delivery handoff and finance settlement trigger point.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Stat label="Market Price Feed" value="Planned" note="External commodity price integration not yet live." />
            <Stat label="Weather Feed" value="Planned" note="Route-weather risk feed not yet live." />
            <Stat label="Shipping / Logistics" value="Planned" note="Corridor, port and demand-supply feed not yet live." />
          </div>
        </div>
      </Card>

      <Card label="Finance Snapshot" title="Exposure and margin">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Revenue" value={money(revenue)} gold />
          <Stat label="Route Cost" value={money(parcel.estimated_route_cost)} />
          <Stat label="Surplus" value={money(parcel.estimated_route_surplus)} gold />
          <Stat label="Margin" value={pct(margin)} />
        </div>
        <div className="mt-5">
          <ActionLink href="/finance">Open Finance Control</ActionLink>
        </div>
      </Card>

      <Card label="Exceptions / Next Actions" title="Clear before release">
        <div id="more" className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="1. Lead Economics" value={margin < 18 ? "Review" : "Proceed"} note="Confirm economics before route spend." />
          <Stat label="2. Supplier Evidence" value={openParties > 0 ? "Pending" : "Clear"} note="Verify source, authority and KYC." />
          <Stat label="3. Plant / Tolling" value={route?.status || "Pending"} note="Confirm quote, recovery, assay timing." />
          <Stat label="4. Finance Release" value={controlState} note="No release until all gates clear." />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionLink href="/documents">Documents</ActionLink>
          <ActionLink href="/approvals">Approvals</ActionLink>
          <ActionLink href="/counterparties">Counterparties</ActionLink>
          <ActionLink href="/analytics">Analytics</ActionLink>
        </div>
      </Card>
    </ResourceShell>
  );
                  }
