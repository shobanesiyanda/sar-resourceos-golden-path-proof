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

function CostLine(p: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
      <p className="text-sm leading-6 text-slate-400">{p.label}</p>
      <p className={`text-sm font-black ${p.gold ? "text-[#f5d778]" : "text-white"}`}>
        {p.value}
      </p>
    </div>
  );
}

function GateLine(p: { label: string; blocked: number; pending: number }) {
  const blocked = n(p.blocked);
  const pending = n(p.pending);
  const state = blocked > 0 ? "Blocked" : pending > 0 ? "Pending" : "Clear";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </p>
      <div className="mt-3">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${stateClass(
            state
          )}`}
        >
          {state}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {blocked > 0
          ? `${blocked} hard blocker(s).`
          : pending > 0
          ? `${pending} pending blocker(s).`
          : "No open blocker."}
      </p>
    </div>
  );
}

export default function FinancePage() {
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
        title="Finance Control"
        subtitle="Loading central finance release summary..."
      >
        <Card label="Loading" title="Reading release_gate_summary..." />
      </ResourceShell>
    );
  }

  if (error || !gate) {
    return (
      <ResourceShell title="Finance Control" subtitle="Finance module error">
        <Card label="Error" title="Could not load finance">
          <p className="mt-3 text-red-200">
            {error || "Could not load finance."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const financeBlocked = n(gate.total_open_blockers) > 0;
  const financeState = financeBlocked ? "Blocked" : "Ready";

  return (
    <ResourceShell
      title="Finance Control"
      subtitle="Read-only exposure, assay-adjusted route cost, surplus, margin and finance handoff view powered by release_gate_summary."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={gate.parcel_code || PARCEL_CODE} />
        <Stat label="Resource" value={gate.resource_type || "Not Set"} gold />
        <Stat label="Category" value={gate.resource_category || "Not Set"} />
        <Stat label="Material" value={gate.material_type || "Not Set"} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Finance State" value={financeState} state={financeState} />
        <Stat label="Release Decision" value={gate.release_decision || "Hold / Review"} />
        <Stat label="Open Blockers" value={String(n(gate.total_open_blockers))} />
        <Stat label="Route Margin" value={pct(gate.estimated_route_margin_percent)} gold />
      </section>

      <Card label="Finance Exposure" title="Cost and margin breakdown">
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <CostLine label="Revenue" value={money(gate.indicative_revenue)} gold />
          <CostLine label="Route cost" value={money(gate.estimated_route_cost)} />
          <CostLine label="Assay cost" value={money(gate.estimated_total_assay_cost)} />
          <CostLine label="Indicative surplus" value={money(gate.estimated_route_surplus)} gold />
          <CostLine label="Route margin" value={pct(gate.estimated_route_margin_percent)} gold />
          <CostLine label="Margin state" value={gate.margin_state || "Not Set"} />
          <CostLine label="Selling price" value={`${money(gate.expected_price_per_ton)}/t`} />
          <CostLine label="Product tons" value={tons(gate.product_tons)} />
          <CostLine label="Feedstock tons" value={tons(gate.feedstock_tons)} />
          <CostLine label="Expected yield" value={pct(gate.expected_yield_percent)} />
        </div>
      </Card>

      <Card label="Finance Release Gate" title={financeBlocked ? "Do not release finance yet" : "Finance ready for release review"}>
        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(financeState)}`}>
          <p className="text-xl font-black">
            {financeBlocked
              ? "Finance handoff remains controlled."
              : "Finance handoff can move to controlled review."}
          </p>
          <p className="mt-3 text-sm leading-7">
            {financeBlocked
              ? "Do not release settlement, purchase funding, dispatch finance or route payment until all release gates are cleared and the margin basis is commercially approved."
              : "All central blockers are clear. Finance can proceed only through controlled review and proper authority."}
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <GateLine
            label="Documents"
            blocked={n(gate.blocked_documents)}
            pending={n(gate.pending_documents)}
          />
          <GateLine
            label="Approvals"
            blocked={n(gate.blocked_approvals)}
            pending={n(gate.pending_approvals)}
          />
          <GateLine
            label="Counterparties"
            blocked={n(gate.blocked_counterparties)}
            pending={n(gate.pending_counterparties)}
          />
          <GateLine
            label="Routes"
            blocked={n(gate.blocked_routes)}
            pending={n(gate.pending_routes)}
          />
        </div>
      </Card>

      <Card label="Central Control Result" title="Finance follows the release gate engine">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Hard Blockers" value={String(n(gate.hard_blockers))} />
          <Stat label="Pending Blockers" value={String(n(gate.pending_blockers))} />
          <Stat label="Total Open" value={String(n(gate.total_open_blockers))} />
          <Stat label="Margin Blocker" value={n(gate.margin_blocker) > 0 ? "Yes" : "No"} />
        </div>

        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(gate.release_state)}`}>
          <p className="text-xs font-black uppercase tracking-[0.25em]">
            Release decision
          </p>
          <p className="mt-2 text-2xl font-black">
            {gate.release_decision || "Hold / Review"}
          </p>
          <p className="mt-2 text-sm leading-6">
            Finance now reads the same central release decision as Dashboard and
            Analytics. No separate page-level finance release logic is being used.
          </p>
        </div>
      </Card>

      <Card label="Next Finance Actions" title="Clear before handoff">
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Documents
            </p>
            <p className="mt-2 text-2xl font-black">Required</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Supplier, plant, transport, buyer and assay support must be complete.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Approvals
            </p>
            <p className="mt-2 text-2xl font-black">Required</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Finance release must follow approval and release authority.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Margin Basis
            </p>
            <p className="mt-2 text-2xl font-black">
              {gate.margin_state || "Not Set"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Pricing, route cost, yield and assay costs must remain commercially verified.
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
            href="/analytics"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Analytics
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
