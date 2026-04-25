"use client";

import { useEffect, useState } from "react";
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
  route_name: string | null;
  origin_location: string | null;
  plant_location: string | null;
  delivery_location: string | null;
  transport_cost_per_ton: number | null;
  tolling_cost_per_ton: number | null;
  status: string;
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
      : state === "Approved" || state === "Complete"
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

export default function DashboardPage() {
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
          "route_name, origin_location, plant_location, delivery_location, transport_cost_per_ton, tolling_cost_per_ton, status"
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
        <Card label="SAR ResourceOS" title="Loading live Supabase data..." />
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
          <h1 className="mt-3 text-2xl font-black">Live data error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const revenue =
    parcel?.indicative_revenue ??
    Number(parcel?.accepted_tons ?? 0) * Number(parcel?.expected_price_per_ton ?? 0);

  const blockedDocuments = documents.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  const blockedApprovals = approvals.filter(
    (item) => item.status === "Blocked" || item.status === "Pending"
  );

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Executive Control Dashboard">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live Supabase-backed dashboard for chrome parcel control, route readiness,
            documents, approvals, counterparties and finance handoff.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Role</p>
              <p className="mt-2 font-black capitalize">{profile?.role}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Commodity
              </p>
              <p className="mt-2 font-black text-[#d7ad32]">{parcel?.commodity}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Documents
              </p>
              <p className="mt-2 font-black">{documents.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Approvals
              </p>
              <p className="mt-2 font-black">{approvals.length}</p>
            </div>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Lead Parcel
            </p>
            <p className="mt-3 text-2xl font-black">{parcel?.parcel_code}</p>
            <p className="mt-2 text-sm text-slate-400">{parcel?.product_description}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Accepted Tons
            </p>
            <p className="mt-3 text-4xl font-black">{tons(parcel?.accepted_tons)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Indicative Revenue
            </p>
            <p className="mt-3 text-3xl font-black">{money(revenue)}</p>
            <p className="mt-2 text-sm text-slate-400">
              {tons(parcel?.accepted_tons)}t × {money(parcel?.expected_price_per_ton)}/t
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Operator
            </p>
            <p className="mt-3 text-2xl font-black">
              {parcel?.operator_name ?? profile?.full_name}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
              {parcel?.company_name ?? profile?.company_name}
            </p>
          </div>
        </section>

        <Card label="Route Chain" title={route?.route_name ?? "Route chain pending"}>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[
              ["Origin", route?.origin_location ?? "Pending"],
              ["Plant", route?.plant_location ?? "Pending"],
              ["Delivery", route?.delivery_location ?? "Pending"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
                <p className="mt-2 font-black">{value}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
              <div className="mt-2">
                <Badge state={route?.status ?? "Pending"} />
              </div>
            </div>
          </div>
        </Card>

        <section className="mb-6 grid gap-6 xl:grid-cols-2">
          <Card label="Documents" title="Release document register">
            <div className="mt-5 space-y-4">
              {documents.map((item) => (
                <div key={item.document_code} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        {item.document_type}
                      </p>
                      <h3 className="mt-2 font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {item.notes ?? "No document note captured."}
                      </p>
                    </div>
                    <Badge state={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card label="Approvals" title="Approval queue and release gates">
            <div className="mt-5 space-y-4">
              {approvals.map((item) => (
                <div key={item.approval_code} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        {item.approval_type}
                      </p>
                      <h3 className="mt-2 font-black">{item.approval_code}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {item.decision_note ?? "No approval note captured."}
                      </p>
                    </div>
                    <Badge state={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card label="Exceptions / Next Actions" title="Items blocking release">
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {blockedDocuments.map((item) => (
              <div key={item.document_code} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Document
                </p>
                <h3 className="mt-2 font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.notes}</p>
                <div className="mt-3">
                  <Badge state={item.status} />
                </div>
              </div>
            ))}

            {blockedApprovals.map((item) => (
              <div key={item.approval_code} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Approval
                </p>
                <h3 className="mt-2 font-black">{item.approval_type}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.decision_note}
                </p>
                <div className="mt-3">
                  <Badge state={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Finance / Exposure / Margin" title="First parcel finance view">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Revenue</p>
                <p className="mt-2 text-2xl font-black">{money(revenue)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Transport Cost / Ton
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(route?.transport_cost_per_ton)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Tolling Cost / Ton
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(route?.tolling_cost_per_ton)}
                </p>
              </div>
            </div>
          </Card>

          <Card label="Counterparties" title="Linked route parties">
            <div className="mt-5 space-y-4">
              {counterparties.map((item) => (
                <div key={`${item.counterparty_type}-${item.company_name}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        {item.counterparty_type}
                      </p>
                      <h3 className="mt-2 font-black">{item.company_name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.location ?? "Location pending"}
                        {item.province ? `, ${item.province}` : ""}
                      </p>
                    </div>
                    <Badge state={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
  }
