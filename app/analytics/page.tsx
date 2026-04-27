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

      {p.state ? (
        <div className="mt-3">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-black ${stateClass(
              p.state
            )}`}
          >
            {p.value}
          </span>
        </div>
      ) : (
        <p
          className={`mt-2 text-3xl font-black ${
            p.gold ? "text-[#f5d778]" : "text-white"
          }`}
        >
          {p.value}
        </p>
      )}

      {p.note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p>
      ) : null}
    </div>
  );
}

function GateLine(p: {
  label: string;
  total: number;
  cleared: number;
  pending: number;
  blocked: number;
}) {
  const total = n(p.total);
  const cleared = n(p.cleared);
  const pending = n(p.pending);
  const blocked = n(p.blocked);
  const score = total > 0 ? Math.round((cleared / total) * 100) : 0;
  const state = blocked > 0 ? "Blocked" : pending > 0 ? "Pending" : "Ready";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {p.label}
          </p>
          <p className="mt-2 text-2xl font-black">
            {cleared}/{total}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${stateClass(
            state
          )}`}
        >
          {state}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {blocked > 0
          ? `${blocked} blocked.`
          : pending > 0
          ? `${pending} pending.`
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

export default function AnalyticsPage() {
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
      <ResourceShell
        title="Analytics Control"
        subtitle="Loading central release analytics..."
      >
        <Card label="Loading" title="Reading release_gate_summary..." />
      </ResourceShell>
    );
  }

  if (error || !gate) {
    return (
      <ResourceShell title="Analytics Control" subtitle="Analytics module error">
        <Card label="Error" title="Could not load analytics">
          <p className="mt-3 text-red-200">
            {error || "Could not load analytics."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const totalGateItems =
    n(gate.total_documents) +
    n(gate.total_approvals) +
    n(gate.total_counterparties) +
    n(gate.total_routes) +
    1;

  const clearedGateItems =
    n(gate.cleared_documents) +
    n(gate.cleared_approvals) +
    n(gate.cleared_counterparties) +
    n(gate.cleared_routes) +
    (n(gate.margin_blocker) > 0 ? 0 : 1);

  const readiness =
    totalGateItems > 0 ? Math.round((clearedGateItems / totalGateItems) * 100) : 0;

  return (
    <ResourceShell
      title="Analytics Control"
      subtitle="Read-only cockpit now powered by the central release_gate_summary view."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Readiness Score" value={`${readiness}%`} />
        <Stat label="Open Blockers" value={String(n(gate.total_open_blockers))} />
        <Stat label="Hard Blockers" value={String(n(gate.hard_blockers))} />
        <Stat label="Pending Blockers" value={String(n(gate.pending_blockers))} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Release State"
          value={gate.release_state || "Blocked"}
          state={gate.release_state || "Blocked"}
        />
        <Stat label="Release Decision" value={gate.release_decision || "Hold / Review"} />
        <Stat label="Margin State" value={gate.margin_state || "Not Set"} state={gate.margin_state || "Blocked"} />
        <Stat label="Route Margin" value={pct(gate.estimated_route_margin_percent)} gold />
      </section>

      <Card label="Commercial Analytics" title="Revenue and tonnage signal">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Parcel" value={gate.parcel_code || PARCEL_CODE} />
          <Stat label="Resource" value={gate.resource_type || "Not Set"} gold />
          <Stat label="Material" value={gate.material_type || "Not Set"} />
          <Stat label="Category" value={gate.resource_category || "Not Set"} />
          <Stat label="Product Tons" value={tons(gate.product_tons)} />
          <Stat
            label="Feedstock Tons"
            value={tons(gate.feedstock_tons)}
            note={`${pct(gate.expected_yield_percent)} expected yield`}
            gold
          />
          <Stat label="Price / Ton" value={`${money(gate.expected_price_per_ton)}/t`} />
          <Stat label="Revenue" value={money(gate.indicative_revenue)} gold />
        </div>
      </Card>

      <Card label="Exposure Analytics" title="Supabase parcel economics">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Route Cost" value={money(gate.estimated_route_cost)} />
          <Stat label="Assay Cost" value={money(gate.estimated_total_assay_cost)} />
          <Stat label="Surplus" value={money(gate.estimated_route_surplus)} gold />
          <Stat label="Margin" value={pct(gate.estimated_route_margin_percent)} gold />
        </div>

        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(gate.release_state)}`}>
          <p className="text-xs font-black uppercase tracking-[0.25em]">
            Central interpretation
          </p>
          <p className="mt-2 text-2xl font-black">
            {gate.release_decision || "Hold / Review"}
          </p>
          <p className="mt-2 text-sm leading-6">
            Analytics now reads the same release decision as the dashboard. No
            separate page-level decision logic is being used here.
          </p>
        </div>
      </Card>

      <Card label="Gate Analytics" title="Readiness by control family">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <GateLine
            label="Documents"
            cleared={n(gate.cleared_documents)}
            total={n(gate.total_documents)}
            pending={n(gate.pending_documents)}
            blocked={n(gate.blocked_documents)}
          />
          <GateLine
            label="Approvals"
            cleared={n(gate.cleared_approvals)}
            total={n(gate.total_approvals)}
            pending={n(gate.pending_approvals)}
            blocked={n(gate.blocked_approvals)}
          />
          <GateLine
            label="Counterparties"
            cleared={n(gate.cleared_counterparties)}
            total={n(gate.total_counterparties)}
            pending={n(gate.pending_counterparties)}
            blocked={n(gate.blocked_counterparties)}
          />
          <GateLine
            label="Routes"
            cleared={n(gate.cleared_routes)}
            total={n(gate.total_routes)}
            pending={n(gate.pending_routes)}
            blocked={n(gate.blocked_routes)}
          />
        </div>
      </Card>

      <Card label="Control Interpretation" title="Current position">
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Position
            </p>
            <p className="mt-2 text-2xl font-black">
              {gate.release_state === "Ready"
                ? "Commercially ready"
                : gate.release_state === "Pending"
                ? "Commercially visible, pending gates"
                : "Commercially visible, not release ready"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Release status is driven by central blockers and margin control.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Finance Signal
            </p>
            <p className="mt-2 text-2xl font-black">
              {n(gate.total_open_blockers) > 0 ? "Do not release" : "Review release"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Finance handoff must follow the central release gate result.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Next Practical Action
            </p>
            <p className="mt-2 text-2xl font-black">
              {n(gate.hard_blockers) > 0
                ? "Clear hard blockers"
                : n(gate.pending_blockers) > 0
                ? "Clear pending gates"
                : "Prepare release review"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Work from documents, approvals, counterparties and route readiness.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/finance"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Finance
          </Link>
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
        </div>
      </Card>
    </ResourceShell>
  );
  }
