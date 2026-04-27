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

type RouteRow = {
  id?: string;
  parcel_id?: string | null;
  status?: string | null;
  origin?: string | null;
  source_location?: string | null;
  loading_point?: string | null;
  plant?: string | null;
  plant_location?: string | null;
  wash_plant?: string | null;
  destination?: string | null;
  delivery_location?: string | null;
  buyer_location?: string | null;
  buyer?: string | null;
  transporter?: string | null;
  route_name?: string | null;
  notes?: string | null;
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

function routeValue(...items: Array<string | null | undefined>) {
  return items.find((x) => x && String(x).trim().length > 0) || "Not captured";
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

function OperationStep(p: {
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

export default function OperationsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gate, setGate] = useState<Gate | null>(null);
  const [route, setRoute] = useState<RouteRow | null>(null);

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

      const { data: gateData, error: gateError } = await supabase
        .from("release_gate_summary")
        .select("*")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (gateError || !gateData) {
        setError(gateError?.message || "Release gate summary not found.");
        setLoading(false);
        return;
      }

      setGate(gateData as Gate);

      const parcelId = (gateData as Gate).parcel_id;

      let routeQuery = supabase.from("route_chains").select("*").limit(1);

      if (parcelId) {
        routeQuery = routeQuery.eq("parcel_id", parcelId);
      }

      const { data: routeData } = await routeQuery;

      setRoute(routeData && routeData.length > 0 ? (routeData[0] as RouteRow) : null);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell
        title="Operations Control"
        subtitle="Loading central operations release summary..."
      >
        <Card label="Loading" title="Reading release_gate_summary..." />
      </ResourceShell>
    );
  }

  if (error || !gate) {
    return (
      <ResourceShell title="Operations Control" subtitle="Operations module error">
        <Card label="Error" title="Could not load operations">
          <p className="mt-3 text-red-200">
            {error || "Could not load operations."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const operationsBlocked = n(gate.total_open_blockers) > 0;
  const operationsState = operationsBlocked ? "Blocked" : "Ready";

  const origin = route
    ? routeValue(route.origin, route.source_location, route.loading_point)
    : "Not captured";

  const plant = route
    ? routeValue(route.plant, route.plant_location, route.wash_plant)
    : "Not captured";

  const delivery = route
    ? routeValue(route.destination, route.delivery_location, route.buyer_location)
    : "Not captured";

  const transporter = route ? routeValue(route.transporter) : "Not captured";

  return (
    <ResourceShell
      title="Operations Control"
      subtitle="Read-only dispatch, loading, plant handoff, movement and delivery control powered by release_gate_summary."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={gate.parcel_code || PARCEL_CODE} />
        <Stat label="Resource" value={gate.resource_type || "Not Set"} gold />
        <Stat label="Category" value={gate.resource_category || "Not Set"} />
        <Stat label="Material" value={gate.material_type || "Not Set"} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Operations State"
          value={operationsState}
          state={operationsState}
        />
        <Stat
          label="Release Decision"
          value={gate.release_decision || "Hold / Review"}
        />
        <Stat label="Open Blockers" value={String(n(gate.total_open_blockers))} />
        <Stat label="Route Margin" value={pct(gate.estimated_route_margin_percent)} gold />
      </section>

      <Card label="Operations Basis" title="Parcel movement control">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Product Tons" value={tons(gate.product_tons)} />
          <Stat
            label="Feedstock Tons"
            value={tons(gate.feedstock_tons)}
            note={`${pct(gate.expected_yield_percent)} expected yield`}
            gold
          />
          <Stat label="Revenue" value={money(gate.indicative_revenue)} gold />
          <Stat label="Route Cost" value={money(gate.estimated_route_cost)} />
          <Stat label="Surplus" value={money(gate.estimated_route_surplus)} gold />
          <Stat label="Assay Cost" value={money(gate.estimated_total_assay_cost)} />
          <Stat label="Margin State" value={gate.margin_state || "Not Set"} state={gate.margin_state || "Blocked"} />
          <Stat label="Finance Signal" value={operationsBlocked ? "Do Not Release" : "Review"} state={operationsBlocked ? "Blocked" : "Ready"} />
        </div>
      </Card>

      <Card label="Route Movement Chain" title="Origin, plant, delivery and transporter">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Origin / Loading" value={origin} />
          <Stat label="Plant / Tolling" value={plant} />
          <Stat label="Delivery / Offtake" value={delivery} />
          <Stat label="Transporter" value={transporter} />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Route Note
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            {route?.notes ||
              "No operational route note captured yet. Loading point, truck control, seal control, weighbridge evidence and delivery handoff must be controlled before dispatch."}
          </p>
        </div>
      </Card>

      <Card label="Operations Release Control" title={operationsBlocked ? "Do not dispatch yet" : "Dispatch can move to controlled review"}>
        <div className={`mt-5 rounded-3xl border p-5 ${stateClass(operationsState)}`}>
          <p className="text-xl font-black">
            {operationsBlocked
              ? "Operations release remains blocked."
              : "Operations can proceed to controlled dispatch review."}
          </p>
          <p className="mt-3 text-sm leading-7">
            {operationsBlocked
              ? "Do not authorize loading, truck dispatch, plant handoff, weighbridge movement, delivery, settlement or finance handoff until all central release gates are clear."
              : "All central blockers are clear. Dispatch still requires controlled approval, authority and evidence capture."}
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

      <Card label="Operational Step Flow" title="Gate to delivery sequence">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <OperationStep
            step="1. Source / Supplier"
            title="Verify source authority"
            status={n(gate.blocked_counterparties) > 0 ? "Blocked" : "Review"}
            note="Confirm supplier authority, material control, location, KYC/FICA and source evidence before loading."
          />
          <OperationStep
            step="2. Plant / Tolling"
            title="Confirm processing route"
            status={n(gate.blocked_routes) > 0 ? "Blocked" : "Review"}
            note="Confirm plant availability, tolling quote, recovery basis, assay timing and operational handoff."
          />
          <OperationStep
            step="3. Documents"
            title="Complete evidence pack"
            status={n(gate.blocked_documents) > 0 ? "Blocked" : "Review"}
            note="Supplier, plant, transport, buyer, assay and movement evidence must be complete before release."
          />
          <OperationStep
            step="4. Approvals"
            title="Clear release authority"
            status={n(gate.blocked_approvals) > 0 ? "Blocked" : "Review"}
            note="Plant, counterparty, route and finance approvals must be cleared before operational dispatch."
          />
          <OperationStep
            step="5. Loading / Dispatch"
            title="No uncontrolled movement"
            status={operationsBlocked ? "Blocked" : "Ready"}
            note="Loading, dispatch and weighbridge movement must follow the central release decision."
          />
          <OperationStep
            step="6. Finance Handoff"
            title="Controlled handoff only"
            status={operationsBlocked ? "Blocked" : "Ready"}
            note="Settlement and route payments remain blocked until all gates clear and finance review approves release."
          />
        </div>
      </Card>

      <Card label="Central Operations Result" title="Operations follows the release gate engine">
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
            Operations now reads the same central release decision as Dashboard,
            Analytics, Finance and Route Builder. No separate page-level dispatch
            logic is being used.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Back to Dashboard
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
            href="/finance"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Finance
          </Link>
        </div>
      </Card>
    </ResourceShell>
  );
  }
