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
  operator_name: string | null;
  company_name: string | null;
};

type RouteChain = {
  route_code: string;
  route_name: string | null;
  origin_location: string | null;
  plant_location: string | null;
  delivery_location: string | null;
  transport_cost_per_ton: number | null;
  tolling_cost_per_ton: number | null;
  estimated_margin_per_ton: number | null;
  status: string;
  notes: string | null;
};

type DocumentRecord = {
  document_code: string;
  document_type: string;
  title: string;
  status: string;
  notes: string | null;
};

type ApprovalRecord = {
  approval_code: string;
  approval_type: string;
  status: string;
  decision_note: string | null;
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
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${style}`}
    >
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

export default function FinancePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [route, setRoute] = useState<RouteChain | null>(null);
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
          "id, parcel_code, commodity, product_description, accepted_tons, expected_price_per_ton, indicative_revenue, control_state, operator_name, company_name"
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
        .select(
          "route_code, route_name, origin_location, plant_location, delivery_location, transport_cost_per_ton, tolling_cost_per_ton, estimated_margin_per_ton, status, notes"
        )
        .eq("route_code", "ROUTE-CHR-2026-0001")
        .maybeSingle();

      const { data: documentData } = await supabase
        .from("documents")
        .select("document_code, document_type, title, status, notes")
        .eq("parcel_id", parcelData.id)
        .order("document_code", { ascending: true });

      const { data: approvalData } = await supabase
        .from("approvals")
        .select("approval_code, approval_type, status, decision_note")
        .eq("parcel_id", parcelData.id)
        .order("approval_code", { ascending: true });

      setProfile(profileData);
      setParcel(parcelData);
      setRoute(routeData ?? null);
      setDocuments(documentData ?? []);
      setApprovals(approvalData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading finance control..." />
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
          <h1 className="mt-3 text-2xl font-black">Finance module error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const acceptedTons = Number(parcel?.accepted_tons ?? 0);
  const pricePerTon = Number(parcel?.expected_price_per_ton ?? 0);

  const revenue =
    parcel?.indicative_revenue ?? acceptedTons * pricePerTon;

  const transportCostPerTon = Number(route?.transport_cost_per_ton ?? 0);
  const tollingCostPerTon = Number(route?.tolling_cost_per_ton ?? 0);

  const transportCost = transportCostPerTon * acceptedTons;
  const tollingCost = tollingCostPerTon * acceptedTons;
  const routeCost = transportCost + tollingCost;

  const routeSurplus = revenue - routeCost;
  const routeMargin = revenue > 0 ? (routeSurplus / revenue) * 100 : 0;

  const blockedDocuments = documents.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const blockedApprovals = approvals.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const financeBlocked =
    parcel?.control_state === "Blocked" ||
    route?.status === "Blocked" ||
    blockedDocuments.length > 0 ||
    blockedApprovals.length > 0;

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Finance / Exposure / Margin">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live finance-control page for first parcel revenue, route exposure,
            transport and tolling cost, indicative surplus, margin and handoff
            readiness.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/operations"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Operations
            </Link>

            <Link
              href="/route-builder"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Route Builder
            </Link>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Parcel
            </p>
            <p className="mt-3 text-2xl font-black">{parcel?.parcel_code}</p>
            <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
              {parcel?.commodity}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Accepted Tons
            </p>
            <p className="mt-3 text-4xl font-black">{tons(acceptedTons)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Price / Ton
            </p>
            <p className="mt-3 text-3xl font-black">{money(pricePerTon)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Finance State
            </p>
            <div className="mt-3">
              <Badge state={financeBlocked ? "Blocked" : "Approved"} />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {financeBlocked ? "Handoff blocked." : "Handoff ready."}
            </p>
          </div>
        </section>

        <Card
          label="Finance Release Gate"
          title={financeBlocked ? "Finance handoff blocked" : "Finance handoff ready"}
        >
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Control Rule
                </p>
                <h3 className="mt-2 text-xl font-black">
                  {financeBlocked
                    ? "Do not release settlement or finance handoff yet."
                    : "Finance handoff may proceed."}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Finance handoff only becomes ready when route, document,
                  approval and dispatch release gates are no longer Pending or
                  Blocked.
                </p>
              </div>

              <Badge state={financeBlocked ? "Blocked" : "Approved"} />
            </div>
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Revenue" title="First parcel revenue view">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Indicative Revenue
                </p>
                <p className="mt-2 text-4xl font-black">{money(revenue)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {tons(acceptedTons)}t × {money(pricePerTon)}/t
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Product
                </p>
                <p className="mt-2 text-xl font-black">
                  {parcel?.product_description ?? "Product description pending"}
                </p>
              </div>
            </div>
          </Card>

          <Card label="Exposure" title="Route cost exposure">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Transport Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(transportCost)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {money(transportCostPerTon)}/t × {tons(acceptedTons)}t
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Tolling Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(tollingCost)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {money(tollingCostPerTon)}/t × {tons(acceptedTons)}t
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Route Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(routeCost)}</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Margin" title="Indicative route surplus">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Surplus Before Other Costs
                </p>
                <p className="mt-2 text-4xl font-black text-[#f5d778]">
                  {money(routeSurplus)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Route Margin
                </p>
                <p className="mt-2 text-4xl font-black text-[#f5d778]">
                  {percent(routeMargin)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Control Note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This is an indicative route view only. It currently deducts
                  transport and tolling from loaded parcel revenue. Feedstock,
                  funding cost, assay adjustment, overhead and settlement items
                  can be added in the next finance pass.
                </p>
              </div>
            </div>
          </Card>

          <Card label="Open Finance Blockers" title="Items preventing handoff">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Document Blockers
                </p>
                <p className="mt-2 text-3xl font-black text-[#f5d778]">
                  {blockedDocuments.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Approval Blockers
                </p>
                <p className="mt-2 text-3xl font-black text-red-200">
                  {blockedApprovals.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Next Action
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Clear supplier KYC/source evidence, plant tolling quote,
                  transport support, buyer offtake pack and finance approval
                  before settlement handoff.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <Card label="Operator" title={profile?.full_name ?? "Operator"}>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Company
            </p>
            <p className="mt-2 text-xl font-black">
              {profile?.company_name ?? "Shobane African Resources"}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The finance page is currently a live read-only exposure and margin
              view. The next phase can add finance approvals, settlement records,
              funding drawdowns, payment release controls and parcel-level P&L.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
  }
