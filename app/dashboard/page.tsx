"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import ResourceShell from "../../components/ResourceShell";

const PARCEL_CODE = "PAR-CHR-2026-0001";

type Gate = {
  parcel_id: string | null;
  parcel_code: string | null;
  resource_category: string | null;
  resource_type: string | null;
  material_type: string | null;
  product_tons: number | null;
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  expected_price_per_ton: number | null;
  indicative_revenue: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  estimated_total_assay_cost: number | null;
  total_documents: number | null;
  cleared_documents: number | null;
  pending_documents: number | null;
  blocked_documents: number | null;
  total_approvals: number | null;
  cleared_approvals: number | null;
  pending_approvals: number | null;
  blocked_approvals: number | null;
  total_counterparties: number | null;
  cleared_counterparties: number | null;
  pending_counterparties: number | null;
  blocked_counterparties: number | null;
  total_routes: number | null;
  cleared_routes: number | null;
  pending_routes: number | null;
  blocked_routes: number | null;
  margin_blocker: number | null;
  margin_state: string | null;
  hard_blockers: number | null;
  pending_blockers: number | null;
  total_open_blockers: number | null;
  release_state: string | null;
  release_decision: string | null;
};

function n(v: number | null | undefined) {
  return Number(v || 0);
}

function money(v: number | null | undefined) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n(v));
}

function tons(v: number | null | undefined) {
  return n(v).toFixed(3);
}

function pct(v: number | null | undefined) {
  return `${n(v).toFixed(1)}%`;
}

function stateClass(state: string | null | undefined) {
  const s = String(state || "").toLowerCase();

  if (s.includes("ready") || s.includes("clear") || s.includes("strong")) {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }

  if (s.includes("pending") || s.includes("target")) {
    return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  }

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

function Stat(p: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
  state?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </p>
      <p
        className={[
          "mt-2 text-3xl font-black",
          p.state
            ? ""
            : p.gold
            ? "text-[#f5d778]"
            : "text-white",
        ].join(" ")}
      >
        {p.state ? (
          <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${stateClass(p.state)}`}>
            {p.value}
          </span>
        ) : (
          p.value
        )}
      </p>
      {p.note ? <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p> : null}
    </div>
  );
}

function GateCard(p: {
  title: string;
  cleared: number;
  total: number;
  pending: number;
  blocked: number;
}) {
  const cleared = n(p.cleared);
  const total = n(p.total);
  const pending = n(p.pending);
  const blocked = n(p.blocked);
  const score = total > 0 ? Math.round((cleared / total) * 100) : 0;
  const state = blocked > 0 ? "Blocked" : pending > 0 ? "Pending" : "Ready";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {p.title}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {cleared}/{total}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${stateClass(state)}`}>
          {state}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {blocked > 0
          ? `${blocked} blocked item(s).`
          : pending > 0
          ? `${pending} pending item(s).`
          : "Gate clear."}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={state === "Ready" ? "h-full bg-emerald-300" : "h-full bg-[#d7ad32]"}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gate, setGate] = useState<Gate | null>(null);

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

      const { data, error: gateError } = await supabase
        .from("release_gate_summary")
        .select("*")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (gateError || !data) {
        setError(gateError?.message || "Release gate summary not found.");
        setLoading(false);
        return;
      }

      setGate(data as Gate);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Executive Control Dashboard" subtitle="Loading central release gate summary...">
        <Card label="Loading" title="Reading release_gate_summary..." />
      </ResourceShell>
    );
  }

  if (error || !gate) {
    return (
      <ResourceShell title="Executive Control Dashboard" subtitle="Dashboard module error">
        <Card label="Error" title="Could not load dashboard">
          <p className="mt-3 text-red-200">{error || "Could not load dashboard."}</p>
        </Card>
      </ResourceShell>
    );
  }

  return (
    <ResourceShell
      title="Executive Control Dashboard"
      subtitle="Central control summary now powered by the Supabase release_gate_summary view."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Release State" value={gate.release_state || "Blocked"} state={gate.release_state || "Blocked"} />
        <Stat label="Lead Decision" value={gate.release_decision || "Hold / Review"} />
        <Stat label="Open Blockers" value={String(n(gate.total_open_blockers))} />
        <Stat label="Route Margin" value={pct(gate.estimated_route_margin_percent)} gold />
      </section>

      <Card label="Lead / Opportunity" title="Current lead summary">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Parcel" value={gate.parcel_code || PARCEL_CODE} />
          <Stat label="Resource" value={gate.resource_type || "Not Set"} gold />
          <Stat label="Category" value={gate.resource_category || "Not Set"} />
          <Stat label="Material" value={gate.material_type || "Not Set"} />
        </div>
      </Card>

      <Card label="Lead Economics Screening" title="Commercial starting point">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Target Product Tons" value={tons(gate.product_tons)} />
          <Stat
            label="Feedstock Required"
            value={tons(gate.feedstock_tons)}
            note={`${pct(gate.expected_yield_percent)} yield`}
            gold
          />
          <Stat label="Revenue" value={money(gate.indicative_revenue)} gold />
          <Stat label="Route Cost" value={money(gate.estimated_route_cost)} />
          <Stat label="Surplus" value={money(gate.estimated_route_surplus)} gold />
          <Stat label="Selling Price" value={`${money(gate.expected_price_per_ton)}/t`} />
          <Stat label="Assay Cost" value={money(gate.estimated_total_assay_cost)} />
          <Stat label="Margin State" value={gate.margin_state || "Not Set"} state={gate.margin_state || "Blocked"} />
        </div>

        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(gate.release_state)}`}>
          <p className="text-xs font-black uppercase tracking-[0.25em]">
            Decision
          </p>
          <p className="mt-2 text-2xl font-black">
            {gate.release_decision || "Hold / Review"}
          </p>
          <p className="mt-2 text-sm leading-6">
            This decision is now read from the central release gate summary, not calculated separately on the dashboard.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/economics"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Open Lead Economics
          </Link>
          <Link
            href="/analytics"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Analytics
          </Link>
        </div>
      </Card>

      <Card label="Release Gate Engine" title="Central blocker summary">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Hard Blockers" value={String(n(gate.hard_blockers))} />
          <Stat label="Pending Blockers" value={String(n(gate.pending_blockers))} />
          <Stat label="Total Open" value={String(n(gate.total_open_blockers))} />
          <Stat label="Margin Blocker" value={n(gate.margin_blocker) > 0 ? "Yes" : "No"} />
        </div>
      </Card>

      <Card label="Readiness Gates" title="Evidence, approvals, parties and route">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <GateCard
            title="Documents"
            cleared={n(gate.cleared_documents)}
            total={n(gate.total_documents)}
            pending={n(gate.pending_documents)}
            blocked={n(gate.blocked_documents)}
          />
          <GateCard
            title="Approvals"
            cleared={n(gate.cleared_approvals)}
            total={n(gate.total_approvals)}
            pending={n(gate.pending_approvals)}
            blocked={n(gate.blocked_approvals)}
          />
          <GateCard
            title="Counterparties"
            cleared={n(gate.cleared_counterparties)}
            total={n(gate.total_counterparties)}
            pending={n(gate.pending_counterparties)}
            blocked={n(gate.blocked_counterparties)}
          />
          <GateCard
            title="Routes"
            cleared={n(gate.cleared_routes)}
            total={n(gate.total_routes)}
            pending={n(gate.pending_routes)}
            blocked={n(gate.blocked_routes)}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/documents"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Documents
          </Link>
          <Link
            href="/approvals"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Approvals
          </Link>
          <Link
            href="/counterparties"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Counterparties
          </Link>
          <Link
            href="/route-builder"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Route
          </Link>
        </div>
      </Card>

      <Card label="Supply, Demand and Logistics Intelligence" title="Route corridor signal">
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f5d778]">
              Supply Zone
            </p>
            <p className="mt-2 text-2xl font-black">Rustenburg / North West</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Chrome feedstock, ROM, tailings, dumps and sweepings corridor.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">
              Processing Zone
            </p>
            <p className="mt-2 text-2xl font-black">Wash Plant Corridor</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Tolling, recovery, assay turnaround and plant approval dependency.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
              Demand / Offtake
            </p>
            <p className="mt-2 text-2xl font-black">City Deep Buyer Route</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Buyer-linked movement readiness and export/logistics handoff signal.
            </p>
          </div>
        </div>
      </Card>

      <Card label="Exceptions / Next Actions" title="Clear before release">
        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              1. Lead Economics
            </p>
            <p className="mt-2 text-2xl font-black">Review</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Confirm economics before route spend.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              2. Supplier Evidence
            </p>
            <p className="mt-2 text-2xl font-black">Pending</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Verify source, authority and KYC.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              3. Plant / Tolling
            </p>
            <p className="mt-2 text-2xl font-black">Blocked</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Confirm quote, recovery and assay timing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              4. Finance Release
            </p>
            <p className="mt-2 text-2xl font-black">Blocked</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              No release until all gates clear.
            </p>
          </div>
        </div>
      </Card>
    </ResourceShell>
  );
  }
