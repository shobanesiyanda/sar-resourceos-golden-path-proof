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
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
};

type StatusRow = { status: string | null };

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

function openCount(rows: StatusRow[]) {
  return rows.filter((r) => r.status === "Pending" || r.status === "Blocked")
    .length;
}

function readyCount(rows: StatusRow[]) {
  return rows.filter((r) => r.status === "Approved" || r.status === "Complete")
    .length;
}

function score(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function marginState(m: number) {
  if (m < 18) return "Below Target";
  if (m <= 25) return "Target Band";
  return "Strong Route";
}

function controlState(open: number, margin: number) {
  if (open > 0 || margin < 18) return "Blocked";
  return "Ready";
}

function decisionText(open: number, margin: number) {
  if (margin < 18) return "Commercially visible, not release ready";
  if (open > 0) return "Economics acceptable, gates still open";
  return "Ready for controlled release review";
}

function stateClass(state: string) {
  if (state === "Ready") return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  if (state === "Target Band") return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-red-400/40 bg-red-500/15 text-red-200";
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
      <p className={`mt-2 text-3xl font-black ${p.gold ? "text-[#f5d778]" : "text-white"}`}>
        {p.value}
      </p>
      {p.note ? <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p> : null}
    </div>
  );
}

function Gate(p: {
  label: string;
  ready: number;
  total: number;
  open: number;
}) {
  const s = score(p.ready, p.total);
  const blocked = p.open > 0;
  return (
    <div
      className={[
        "rounded-2xl border p-4",
        blocked
          ? "border-red-400/30 bg-red-500/10"
          : "border-emerald-400/30 bg-emerald-500/10",
      ].join(" ")}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">
        {p.ready}/{p.total}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {blocked ? `${p.open} item(s) still Pending or Blocked.` : "Gate cleared."}
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={blocked ? "h-full bg-red-300" : "h-full bg-emerald-300"}
          style={{ width: `${s}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [documents, setDocuments] = useState<StatusRow[]>([]);
  const [approvals, setApprovals] = useState<StatusRow[]>([]);
  const [counterparties, setCounterparties] = useState<StatusRow[]>([]);
  const [routes, setRoutes] = useState<StatusRow[]>([]);

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

      const { data: routeData } = await supabase
        .from("route_chains")
        .select("status")
        .eq("route_code", "ROUTE-CHR-2026-0001");

      setParcel(parcelData as Parcel);
      setDocuments((docs as StatusRow[]) || []);
      setApprovals((apps as StatusRow[]) || []);
      setCounterparties((parties as StatusRow[]) || []);
      setRoutes((routeData as StatusRow[]) || []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Analytics Control" subtitle="Loading analytics...">
        <Card label="Loading" title="Reading Supabase analytics data..." />
      </ResourceShell>
    );
  }

  if (error || !parcel) {
    return (
      <ResourceShell title="Analytics Control" subtitle="Analytics module error">
        <Card label="Error" title="Could not load analytics">
          <p className="mt-3 text-red-200">{error || "Could not load analytics page."}</p>
        </Card>
      </ResourceShell>
    );
  }

  const productTons = parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0;
  const revenue =
    parcel.indicative_revenue ||
    productTons * Number(parcel.expected_price_per_ton || 0);

  const routeCost = Number(parcel.estimated_route_cost || 0);
  const surplus = Number(parcel.estimated_route_surplus || revenue - routeCost);
  const margin = Number(
    parcel.estimated_route_margin_percent ||
      (revenue > 0 ? (surplus / revenue) * 100 : 0)
  );

  const docReady = readyCount(documents);
  const appReady = readyCount(approvals);
  const partyReady = readyCount(counterparties);
  const routeReady = readyCount(routes);

  const docOpen = openCount(documents);
  const appOpen = openCount(approvals);
  const partyOpen = openCount(counterparties);
  const routeOpen = openCount(routes);

  const totalItems =
    documents.length + approvals.length + counterparties.length + routes.length + 1;

  const readyItems =
    docReady +
    appReady +
    partyReady +
    routeReady +
    (margin >= 18 ? 1 : 0);

  const openTotal = docOpen + appOpen + partyOpen + routeOpen + (margin < 18 ? 1 : 0);
  const readiness = score(readyItems, totalItems);
  const state = controlState(openTotal, margin);
  const mState = marginState(margin);

  return (
    <ResourceShell
      title="Analytics Control"
      subtitle="Read-only cockpit for readiness, margin signal, blocker count, route economics and release-control interpretation."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Readiness Score" value={`${readiness}%`} gold={readiness >= 80} />
        <Stat label="Open Blockers" value={String(openTotal)} />
        <Stat label="Route Margin" value={pct(margin)} gold />
        <Stat label="Control State" value={state} />
      </section>

      <Card label="Current Position" title={decisionText(openTotal, margin)}>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Parcel" value={parcel.parcel_code} />
          <Stat label="Resource" value={parcel.resource_type || parcel.commodity || "Not Set"} gold />
          <Stat label="Material" value={parcel.material_type || "Not Set"} />
          <Stat label="Feedstock Required" value={tons(parcel.feedstock_tons)} />
        </div>
      </Card>

      <Card label="Readiness Analytics" title="Release-gate breakdown">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Gate label="Document Readiness" ready={docReady} total={documents.length} open={docOpen} />
          <Gate label="Approval Readiness" ready={appReady} total={approvals.length} open={appOpen} />
          <Gate label="Counterparty Readiness" ready={partyReady} total={counterparties.length} open={partyOpen} />
          <Gate label="Route Readiness" ready={routeReady} total={routes.length} open={routeOpen} />
        </div>
      </Card>

      <Card label="Commercial Analytics" title="Revenue, cost and margin signal">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Product Tons" value={tons(productTons)} />
          <Stat label="Revenue" value={money(revenue)} gold />
          <Stat label="Route Cost" value={money(routeCost)} />
          <Stat label="Surplus" value={money(surplus)} gold />
        </div>

        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(mState)}`}>
          <p className="text-xs font-bold uppercase tracking-[0.25em]">
            Margin Signal
          </p>
          <p className="mt-3 text-3xl font-black">{mState}</p>
          <p className="mt-2 text-sm leading-6">
            Target margin control band is 18%–25%. Below target should remain under review or require exception approval.
          </p>
        </div>
      </Card>

      <Card label="Risk Interpretation" title="What the analytics mean">
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Current Position
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {decisionText(openTotal, margin)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The parcel is commercially visible but cannot release while required gates remain open.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Main Blockers
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {openTotal} open item(s)
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Documents, approvals, counterparty verification, route readiness and margin control are read together.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Next Practical Action
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              Clear release blockers
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Prioritise supplier evidence, plant tolling support, transport confirmation, buyer support and finance approval.
            </p>
          </div>
        </div>
      </Card>

      <Card label="Control Note" title="Analytics is advisory until release rules are enforced">
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This page currently reads live Supabase records and interprets readiness. The next production phase will enforce release-gate rules, approval authority, audit events and exception controls.
        </p>
      </Card>
    </ResourceShell>
  );
                     }
