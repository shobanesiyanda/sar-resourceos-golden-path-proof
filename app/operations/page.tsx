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

export default function OperationsPage() {
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
          "route_code, route_name, origin_location, plant_location, delivery_location, transport_cost_per_ton, tolling_cost_per_ton, status, notes"
        )
        .eq("route_code", "ROUTE-CHR-2026-0001")
        .maybeSingle();

      const { data: counterpartyData } = await supabase
        .from("counterparties")
        .select("counterparty_type, company_name, location, province, status")
        .order("counterparty_type", { ascending: true });

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
        <Card label="SAR ResourceOS" title="Loading operations control..." />
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
          <h1 className="mt-3 text-2xl font-black">Operations module error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const supplier = counterparties.find(
    (item) => item.counterparty_type === "Supplier"
  );

  const washPlant = counterparties.find(
    (item) => item.counterparty_type === "Wash Plant"
  );

  const buyer = counterparties.find((item) => item.counterparty_type === "Buyer");

  const transporter = counterparties.find(
    (item) => item.counterparty_type === "Transporter"
  );

  const blockedDocuments = documents.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const blockedApprovals = approvals.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const dispatchBlocked =
    parcel?.control_state === "Blocked" ||
    route?.status === "Blocked" ||
    blockedDocuments.length > 0 ||
    blockedApprovals.length > 0;

  const revenue =
    parcel?.indicative_revenue ??
    Number(parcel?.accepted_tons ?? 0) *
      Number(parcel?.expected_price_per_ton ?? 0);

  const operationsSteps = [
    {
      label: "Source Confirmation",
      title: supplier?.company_name ?? "Supplier pending",
      note: "Supplier source, material availability and commercial terms must be verified.",
      state: supplier?.status ?? "Pending",
    },
    {
      label: "Plant Readiness",
      title: washPlant?.company_name ?? "Wash plant pending",
      note: "Tolling quote, throughput, recovery basis and assay timing must be confirmed.",
      state: washPlant?.status ?? "Pending",
    },
    {
      label: "Truck Allocation",
      title: transporter?.company_name ?? "Transporter pending",
      note: "Truck availability, rate, loading plan and route timing must be confirmed.",
      state: transporter?.status ?? "Pending",
    },
    {
      label: "Buyer Delivery",
      title: buyer?.company_name ?? "Buyer pending",
      note: "Buyer delivery and offtake support must be ready before dispatch release.",
      state: buyer?.status ?? "Pending",
    },
    {
      label: "Finance Handoff",
      title: "Settlement readiness",
      note: "Finance handoff remains blocked until document and approval gates are cleared.",
      state: dispatchBlocked ? "Blocked" : "Approved",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Operations / Dispatch Control">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live dispatch readiness page for parcel movement, loading control,
            weighbridge readiness, delivery tracking, evidence control and finance
            handoff.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/route-builder"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Route Builder
            </Link>

            <Link
              href="/counterparties"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Counterparties
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
            <p className="mt-3 text-4xl font-black">
              {tons(parcel?.accepted_tons)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Indicative Revenue
            </p>
            <p className="mt-3 text-3xl font-black">{money(revenue)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Dispatch State
            </p>
            <div className="mt-3">
              <Badge state={dispatchBlocked ? "Blocked" : "Approved"} />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {dispatchBlocked ? "Release gates still open." : "Ready for release."}
            </p>
          </div>
        </section>

        <Card
          label="Dispatch Release Gate"
          title={dispatchBlocked ? "Dispatch blocked" : "Dispatch ready"}
        >
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Control Rule
                </p>
                <h3 className="mt-2 text-xl font-black">
                  {dispatchBlocked
                    ? "Do not release trucks yet."
                    : "Truck release may proceed."}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Dispatch can only proceed when supplier, plant, buyer,
                  transporter, documents and approvals are no longer Pending or
                  Blocked.
                </p>
              </div>

              <Badge state={dispatchBlocked ? "Blocked" : "Approved"} />
            </div>
          </div>
        </Card>

        <Card label="Operations Flow" title="Gate → Loading → Weighbridge → Delivery">
          <div className="mt-5 space-y-4">
            {operationsSteps.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.label}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.note}
                    </p>
                  </div>

                  <Badge state={item.state} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Open Release Blockers" title="Documents and approvals">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Document blockers
                </p>
                <p className="mt-2 text-3xl font-black text-[#f5d778]">
                  {blockedDocuments.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Approval blockers
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
                  Clear plant tolling, supplier verification, transport support
                  and finance approval before dispatch release.
                </p>
              </div>
            </div>
          </Card>

          <Card label="Route Movement" title={route?.route_name ?? "Route pending"}>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Origin
                </p>
                <p className="mt-2 text-xl font-black">
                  {route?.origin_location ?? "Pending"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Wash Plant
                </p>
                <p className="mt-2 text-xl font-black">
                  {route?.plant_location ?? "Pending"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Delivery
                </p>
                <p className="mt-2 text-xl font-black">
                  {route?.delivery_location ?? "Pending"}
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
              The operations page is currently a live read-only dispatch control
              view. The next phase can add actual dispatch records, truck release
              forms, weighbridge entries and evidence uploads.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
  }
