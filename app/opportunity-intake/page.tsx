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

function LeadStep(p: {
  step: string;
  title: string;
  status: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {p.step}
          </p>
          <h4 className="mt-2 text-xl font-black">{p.title}</h4>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${stateClass(
            p.status
          )}`}
        >
          {p.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{p.note}</p>
    </div>
  );
}

export default function OpportunityIntakePage() {
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
        title="Lead Economics"
        subtitle="Loading central lead release summary..."
      >
        <Card label="Loading" title="Reading release_gate_summary..." />
      </ResourceShell>
    );
  }

  if (error || !gate) {
    return (
      <ResourceShell title="Lead Economics" subtitle="Leads module error">
        <Card label="Error" title="Could not load leads">
          <p className="mt-3 text-red-200">
            {error || "Could not load leads."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const leadBlocked = n(gate.total_open_blockers) > 0;
  const leadState = leadBlocked ? "Blocked" : "Ready";
  const commercialStatus =
    n(gate.margin_blocker) > 0
      ? "Below Target"
      : leadBlocked
      ? "Commercially Visible"
      : "Ready for Review";

  return (
    <ResourceShell
      title="Lead Economics"
      subtitle="Commercial starting point for resource leads, feedstock required, yield, assay cost, route cost, surplus and margin."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={gate.parcel_code || PARCEL_CODE} />
        <Stat label="Resource" value={gate.resource_type || "Not Set"} gold />
        <Stat label="Category" value={gate.resource_category || "Not Set"} />
        <Stat label="Material" value={gate.material_type || "Not Set"} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lead State" value={leadState} state={leadState} />
        <Stat label="Commercial Status" value={commercialStatus} />
        <Stat label="Release Decision" value={gate.release_decision || "Hold / Review"} />
        <Stat label="Open Blockers" value={String(n(gate.total_open_blockers))} />
      </section>

      <Card label="Lead Economics Screening" title="Commercial starting point">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Product Tons" value={tons(gate.product_tons)} />
          <Stat
            label="Feedstock Required"
            value={tons(gate.feedstock_tons)}
            note={`${pct(gate.expected_yield_percent)} expected yield`}
            gold
          />
          <Stat label="Selling Price" value={`${money(gate.expected_price_per_ton)}/t`} />
          <Stat label="Revenue" value={money(gate.indicative_revenue)} gold />
          <Stat label="Route Cost" value={money(gate.estimated_route_cost)} />
          <Stat label="Assay Cost" value={money(gate.estimated_total_assay_cost)} />
          <Stat label="Surplus" value={money(gate.estimated_route_surplus)} gold />
          <Stat label="Route Margin" value={pct(gate.estimated_route_margin_percent)} gold />
        </div>

        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(gate.margin_state)}`}>
          <p className="text-xs font-black uppercase tracking-[0.25em]">
            Margin state
          </p>
          <p className="mt-2 text-2xl font-black">
            {gate.margin_state || "Not Set"}
          </p>
          <p className="mt-2 text-sm leading-7">
            Lead economics must be commercially screened before route spend,
            supplier engagement, plant commitment, dispatch or finance handoff.
          </p>
        </div>
      </Card>

      <Card label="Lead Control Result" title="Central release gate summary">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Release State" value={gate.release_state || "Blocked"} state={gate.release_state || "Blocked"} />
          <Stat label="Hard Blockers" value={String(n(gate.hard_blockers))} />
          <Stat label="Pending Blockers" value={String(n(gate.pending_blockers))} />
          <Stat label="Total Open" value={String(n(gate.total_open_blockers))} />
        </div>

        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(gate.release_state)}`}>
          <p className="text-xs font-black uppercase tracking-[0.25em]">
            Release decision
          </p>
          <p className="mt-2 text-2xl font-black">
            {gate.release_decision || "Hold / Review"}
          </p>
          <p className="mt-2 text-sm leading-6">
            Leads now reads the same central release decision as Dashboard,
            Analytics, Finance, Route Builder and Operations. No separate
            page-level lead decision logic is being used.
          </p>
        </div>
      </Card>

      <Card label="Readiness Gates" title="What blocks this lead from release">
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

      <Card label="Lead Intake Discipline" title="Screen before route commitment">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <LeadStep
            step="1. Resource"
            title="Confirm commodity and material"
            status={gate.resource_type && gate.material_type ? "Ready" : "Pending"}
            note="Resource category, resource type and material type must be captured before economics are relied on."
          />
          <LeadStep
            step="2. Yield"
            title="Validate recovery basis"
            status={n(gate.expected_yield_percent) > 0 ? "Review" : "Blocked"}
            note="Yield must be supported by sample history, assay, plant recovery basis or verified supplier/plant evidence."
          />
          <LeadStep
            step="3. Pricing"
            title="Confirm buyer price"
            status={n(gate.expected_price_per_ton) > 0 ? "Review" : "Blocked"}
            note="Selling price must be tied to buyer/offtake support, FOT/FOB basis, grade band and payment terms."
          />
          <LeadStep
            step="4. Route Cost"
            title="Confirm cost stack"
            status={n(gate.estimated_route_cost) > 0 ? "Review" : "Blocked"}
            note="Feedstock, transport, tolling, assay and route charges must be verified before route commitment."
          />
          <LeadStep
            step="5. Evidence"
            title="Complete release documents"
            status={n(gate.blocked_documents) > 0 ? "Blocked" : "Review"}
            note="Supplier, plant, transport, buyer, assay and movement evidence must be complete before release."
          />
          <LeadStep
            step="6. Decision"
            title="Hold until gates clear"
            status={leadBlocked ? "Blocked" : "Ready"}
            note="Lead may be commercially visible, but it must not move to uncontrolled route spend or finance release."
          />
        </div>
      </Card>

      <Card label="Next Lead Actions" title="Move only through controlled modules">
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/economics"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Economics
          </Link>
          <Link
            href="/route-builder"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Route Builder
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
