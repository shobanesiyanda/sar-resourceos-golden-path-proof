"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Profile = {
  full_name: string;
  company_name: string | null;
  role: string;
  is_active: boolean;
};

type Parcel = {
  id: string;
  parcel_code: string;
  commodity: string;
  product_description: string | null;
  accepted_tons: number;
  expected_price_per_ton: number | null;
  indicative_revenue: number | null;
  control_state: string;
  feedstock_tons: number | null;
  feedstock_cost_per_ton: number | null;
  transport_to_plant_cost_per_ton: number | null;
  tolling_cost_per_ton: number | null;
  estimated_feedstock_cost: number | null;
  estimated_transport_cost: number | null;
  estimated_tolling_cost: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  economics_basis: string | null;
};

type RouteChain = {
  route_code: string;
  route_name: string | null;
  origin_location: string | null;
  plant_location: string | null;
  delivery_location: string | null;
  status: string;
  notes: string | null;
};

type Counterparty = {
  counterparty_type: string;
  company_name: string;
  location: string | null;
  province: string | null;
  status: string;
};

type DocumentRecord = {
  document_code: string;
  document_type: string;
  title: string;
  status: string;
};

type ApprovalRecord = {
  approval_code: string;
  approval_type: string;
  status: string;
};

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function tons(value: number | null | undefined) {
  return Number(value ?? 0).toFixed(3);
}

function percent(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function Badge({ state }: { state: string }) {
  const style =
    state === "Blocked"
      ? "border-red-400/40 bg-red-500/15 text-red-200"
      : state === "Held"
      ? "border-orange-400/40 bg-orange-500/15 text-orange-200"
      : state === "Approved" || state === "Complete" || state === "Active"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
      : "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${style}`}>
      {state}
    </span>
  );
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
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string | number;
  note: string;
  tone?: "default" | "gold" | "red" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "text-red-200"
      : tone === "green"
      ? "text-emerald-200"
      : tone === "gold"
      ? "text-[#f5d778]"
      : "text-white";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-3 text-4xl font-black ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
    </div>
  );
}

function InfoBox({
  label,
  value,
  note,
  gold = false,
}: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${gold ? "text-[#f5d778]" : "text-white"}`}>
        {value}
      </p>
      {note ? <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p> : null}
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [route, setRoute] = useState<RouteChain | null>(null);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, company_name, role, is_active")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select(
          "id, parcel_code, commodity, product_description, accepted_tons, expected_price_per_ton, indicative_revenue, control_state, feedstock_tons, feedstock_cost_per_ton, transport_to_plant_cost_per_ton, tolling_cost_per_ton, estimated_feedstock_cost, estimated_transport_cost, estimated_tolling_cost, estimated_route_cost, estimated_route_surplus, estimated_route_margin_percent, economics_basis"
        )
        .eq("parcel_code", "PAR-CHR-2026-0001")
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const { data: routeData } = await supabase
        .from("route_chains")
        .select("route_code, route_name, origin_location, plant_location, delivery_location, status, notes")
        .eq("route_code", "ROUTE-CHR-2026-0001")
        .maybeSingle();

      const { data: counterpartyData } = await supabase
        .from("counterparties")
        .select("counterparty_type, company_name, location, province, status")
        .order("counterparty_type", { ascending: true });

      const { data: documentData } = await supabase
        .from("documents")
        .select("document_code, document_type, title, status")
        .eq("parcel_id", parcelData.id)
        .order("document_code", { ascending: true });

      const { data: approvalData } = await supabase
        .from("approvals")
        .select("approval_code, approval_type, status")
        .eq("parcel_id", parcelData.id)
        .order("approval_code", { ascending: true });

      setProfile(profileData);
      setParcel(parcelData);
      setRoute(routeData ?? null);
      setCounterparties(counterpartyData ?? []);
      setDocuments(documentData ?? []);
      setApprovals(approvalData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading analytics..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <section className="rounded-3xl border border-red-400/30 bg-[#080d18] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-200">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Analytics module error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const concentrateTons = Number(parcel?.accepted_tons ?? 0);
  const pricePerTon = Number(parcel?.expected_price_per_ton ?? 0);
  const revenue = Number(parcel?.indicative_revenue ?? concentrateTons * pricePerTon);

  const feedstockTons = Number(parcel?.feedstock_tons ?? 0);
  const feedstockCost = Number(parcel?.estimated_feedstock_cost ?? 0);
  const transportCost = Number(parcel?.estimated_transport_cost ?? 0);
  const tollingCost = Number(parcel?.estimated_tolling_cost ?? 0);
  const routeCost = Number(parcel?.estimated_route_cost ?? 0);
  const routeSurplus = Number(parcel?.estimated_route_surplus ?? revenue - routeCost);
  const routeMargin = Number(
    parcel?.estimated_route_margin_percent ??
      (revenue > 0 ? (routeSurplus / revenue) * 100 : 0)
  );

  const openDocuments = documents.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const openApprovals = approvals.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const openCounterparties = counterparties.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const readyDocuments = documents.length - openDocuments.length;
  const readyApprovals = approvals.length - openApprovals.length;
  const readyCounterparties = counterparties.length - openCounterparties.length;

  const totalGateItems =
    documents.length + approvals.length + counterparties.length + 1;

  const openGateItems =
    openDocuments.length +
    openApprovals.length +
    openCounterparties.length +
    (route?.status === "Blocked" || route?.status === "Pending" ? 1 : 0);

  const readinessScore =
    totalGateItems > 0
      ? Math.max(0, ((totalGateItems - openGateItems) / totalGateItems) * 100)
      : 0;

  const controlState =
    parcel?.control_state === "Blocked" || openGateItems > 0 ? "Blocked" : "Approved";

  const readinessRows = [
    {
      label: "Document readiness",
      value: `${readyDocuments}/${documents.length}`,
      note: `${openDocuments.length} document items are still Pending or Blocked.`,
      state: openDocuments.length > 0 ? "Blocked" : "Approved",
    },
    {
      label: "Approval readiness",
      value: `${readyApprovals}/${approvals.length}`,
      note: `${openApprovals.length} approval items are still Pending or Blocked.`,
      state: openApprovals.length > 0 ? "Blocked" : "Approved",
    },
    {
      label: "Counterparty readiness",
      value: `${readyCounterparties}/${counterparties.length}`,
      note: `${openCounterparties.length} counterparty records are still Pending or Blocked.`,
      state: openCounterparties.length > 0 ? "Blocked" : "Approved",
    },
    {
      label: "Route readiness",
      value: route?.status ?? "Pending",
      note: route?.notes ?? "Route chain note pending.",
      state: route?.status ?? "Pending",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Analytics Control Module">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live analytics view for parcel readiness, release blockers,
            Supabase-based route exposure, margin control, counterparty readiness
            and finance handoff risk.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]">
              Back to Dashboard
            </Link>

            <Link href="/operations" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300">
              Operations
            </Link>

            <Link href="/finance" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300">
              Finance
            </Link>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Readiness Score"
            value={percent(readinessScore)}
            note="Calculated from route, counterparty, document and approval gates."
            tone={readinessScore >= 80 ? "green" : readinessScore >= 50 ? "gold" : "red"}
          />

          <MetricCard
            label="Open Blockers"
            value={openGateItems}
            note="Total Pending or Blocked items across live control gates."
            tone={openGateItems > 0 ? "red" : "green"}
          />

          <MetricCard
            label="Route Margin"
            value={percent(routeMargin)}
            note="Revenue less Supabase parcel economics costs."
            tone={routeMargin >= 18 ? "green" : routeMargin >= 10 ? "gold" : "red"}
          />

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Control State
            </p>
            <div className="mt-3">
              <Badge state={controlState} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {controlState === "Blocked"
                ? "Route cannot proceed until open gates are cleared."
                : "Route gates are clear."}
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Commercial Analytics" title="Revenue and tonnage signal">
            <div className="mt-5 space-y-4">
              <InfoBox label="Parcel" value={parcel?.parcel_code ?? "Pending"} note={parcel?.commodity ?? "Commodity pending"} />
              <InfoBox label="Concentrate Tons" value={tons(concentrateTons)} />
              <InfoBox label="Feedstock Tons" value={tons(feedstockTons)} />
              <InfoBox
                label="Revenue"
                value={money(revenue)}
                note={`${tons(concentrateTons)}t concentrate × ${money(pricePerTon)}/t`}
              />
            </div>
          </Card>

          <Card label="Exposure Analytics" title="Supabase parcel economics">
            <div className="mt-5 space-y-4">
              <InfoBox label="Feedstock Cost" value={money(feedstockCost)} />
              <InfoBox label="Transport Cost" value={money(transportCost)} />
              <InfoBox label="Tolling Cost" value={money(tollingCost)} />
              <InfoBox label="Route Cost" value={money(routeCost)} />
              <InfoBox label="Indicative Surplus" value={money(routeSurplus)} gold />
            </div>
          </Card>
        </section>

        <Card label="Readiness Analytics" title="Gate readiness breakdown">
          <div className="mt-5 space-y-4">
            {readinessRows.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.label}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{item.value}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.note}</p>
                  </div>
                  <Badge state={item.state} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Control Interpretation" title="What the analytics mean">
            <div className="mt-5 space-y-4">
              <InfoBox
                label="Current Position"
                value="Commercially visible, not release ready"
                note="The main blockers remain document completion, approval clearance and plant readiness."
              />
              <InfoBox
                label="Finance Signal"
                value="Supabase-based economics"
                note="Current Live v1 margin is read from Supabase parcel economics fields."
              />
              <InfoBox
                label="Next Practical Action"
                value="Clear release blockers"
                note="Prioritise supplier source evidence, wash plant tolling quote, buyer offtake pack, transport confirmation and finance handoff approval."
              />
            </div>
          </Card>

          <Card label="Operator" title={profile?.full_name ?? "Operator"}>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Company
              </p>
              <p className="mt-2 text-xl font-black">
                {profile?.company_name ?? "Shobane African Resources"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                The analytics page now reads parcel economics from Supabase.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
  }
