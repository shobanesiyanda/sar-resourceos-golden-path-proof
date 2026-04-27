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

function RecommendationPanel({ gate }: { gate: Gate }) {
  const revenue = n(gate.indicative_revenue);
  const surplus = n(gate.estimated_route_surplus);
  const productTons = n(gate.product_tons);
  const feedstockTons = n(gate.feedstock_tons);
  const price = n(gate.expected_price_per_ton);
  const routeCost = n(gate.estimated_route_cost);
  const assayCost = n(gate.estimated_total_assay_cost);

  const minTargetMargin = 18;
  const preferredTargetMargin = 20;

  const minTargetSurplus = revenue * (minTargetMargin / 100);
  const preferredTargetSurplus = revenue * (preferredTargetMargin / 100);

  const minGap = Math.max(0, minTargetSurplus - surplus);
  const preferredGap = Math.max(0, preferredTargetSurplus - surplus);

  const minPriceIncrease = productTons > 0 ? minGap / productTons : 0;
  const preferredPriceIncrease = productTons > 0 ? preferredGap / productTons : 0;

  const minBuyerPrice = price + minPriceIncrease;
  const preferredBuyerPrice = price + preferredPriceIncrease;

  const feedstockReduction = feedstockTons > 0 ? minGap / feedstockTons : 0;
  const maxRouteCost = revenue - assayCost - minTargetSurplus;

  const assayRecoveredSurplus = surplus + assayCost;
  const assayRecoveryGap = Math.max(0, minTargetSurplus - assayRecoveredSurplus);
  const assayRecoveryPriceIncrease =
    productTons > 0 ? assayRecoveryGap / productTons : 0;
  const assayRecoveryBuyerPrice = price + assayRecoveryPriceIncrease;

  if (n(gate.estimated_route_margin_percent) >= minTargetMargin) {
    return (
      <Card label="Margin Decision" title="Margin is inside or above minimum target">
        <div className="mt-5 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-200">
          <p className="text-xl font-black">No margin correction required.</p>
          <p className="mt-3 text-sm leading-7">
            Current margin is {pct(gate.estimated_route_margin_percent)}. Continue
            with evidence, approvals, route and finance gates before release.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card label="Margin Improvement Required" title="Hold / renegotiate before release">
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Current Margin" value={pct(gate.estimated_route_margin_percent)} />
        <Stat label="Minimum Target" value={`${minTargetMargin.toFixed(1)}%`} gold />
        <Stat label="Preferred Target" value={`${preferredTargetMargin.toFixed(1)}%`} gold />
        <Stat label="Decision" value="Hold / Renegotiate" state="Blocked" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Current Surplus" value={money(surplus)} />
        <Stat label="18% Target Surplus" value={money(minTargetSurplus)} gold />
        <Stat label="Gap To 18%" value={money(minGap)} />
        <Stat label="Gap To 20%" value={money(preferredGap)} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f5d778]">
            1. Buyer Price Target
          </p>
          <p className="mt-2 text-2xl font-black">Minimum {money(minBuyerPrice)}/t</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Current buyer price is {money(price)}/t. Increase by about{" "}
            {money(minPriceIncrease)}/t to reach 18%.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Preferred 20% target: {money(preferredBuyerPrice)}/t.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            2. Feedstock Cost Target
          </p>
          <p className="mt-2 text-2xl font-black">{money(feedstockReduction)}/t saving</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Reduce feedstock cost by about {money(feedstockReduction)} per feedstock
            ton across {tons(feedstockTons)} tons.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            3. Route Cost Cap
          </p>
          <p className="mt-2 text-2xl font-black">{money(maxRouteCost)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Current route cost is {money(routeCost)}. Reduce route cost by{" "}
            {money(minGap)} to reach 18%, excluding assay.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            4. Combined Correction
          </p>
          <p className="mt-2 text-2xl font-black">{money(minGap)} total</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Suggested split: plant/tolling {money(minGap * 0.48)}, transport{" "}
            {money(minGap * 0.32)}, feedstock {money(minGap * 0.2)}.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:col-span-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            5. Assay / Handling Recovery
          </p>
          <p className="mt-2 text-2xl font-black">
            Buyer price target becomes {money(assayRecoveryBuyerPrice)}/t
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            If buyer/plant absorbs {money(assayCost)} assay/handling, remaining
            gap to 18% is {money(assayRecoveryGap)}. Required buyer price increase
            drops to about {money(assayRecoveryPriceIncrease)}/t.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function EconomicsPage() {
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
      <ResourceShell title="Lead Economics" subtitle="Loading central lead summary...">
        <Card label="Loading" title="Reading release_gate_summary..." />
      </ResourceShell>
    );
  }

  if (error || !gate) {
    return (
      <ResourceShell title="Lead Economics" subtitle="Lead economics module error">
        <Card label="Error" title="Could not load lead economics">
          <p className="mt-3 text-red-200">
            {error || "Could not load lead economics."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const leadBlocked = n(gate.total_open_blockers) > 0;
  const leadState = leadBlocked ? "Blocked" : "Ready";

  return (
    <ResourceShell
      title="Lead Economics"
      subtitle="Commercial screening engine powered by release_gate_summary, with editable inputs separated into a controlled edit page."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={gate.parcel_code || PARCEL_CODE} />
        <Stat label="Resource" value={gate.resource_type || "Not Set"} gold />
        <Stat label="Category" value={gate.resource_category || "Not Set"} />
        <Stat label="Material" value={gate.material_type || "Not Set"} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lead State" value={leadState} state={leadState} />
        <Stat label="Release Decision" value={gate.release_decision || "Hold / Review"} />
        <Stat label="Open Blockers" value={String(n(gate.total_open_blockers))} />
        <Stat label="Route Margin" value={pct(gate.estimated_route_margin_percent)} gold />
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
          <Stat label="Surplus After Assay" value={money(gate.estimated_route_surplus)} gold />
          <Stat label="Margin State" value={gate.margin_state || "Not Set"} state={gate.margin_state || "Blocked"} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/economics/edit"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Edit Lead Economics
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </Card>

      <RecommendationPanel gate={gate} />

      <Card label="Release Gate Summary" title="Central control result">
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Release State" value={gate.release_state || "Blocked"} state={gate.release_state || "Blocked"} />
          <Stat label="Hard Blockers" value={String(n(gate.hard_blockers))} />
          <Stat label="Pending Blockers" value={String(n(gate.pending_blockers))} />
          <Stat label="Total Open" value={String(n(gate.total_open_blockers))} />
        </div>
      </Card>
    </ResourceShell>
  );
    }
