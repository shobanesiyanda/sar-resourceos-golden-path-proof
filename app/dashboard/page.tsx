"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Profile = {
  full_name: string;
  email: string;
  company_name: string | null;
  role: string;
  is_active: boolean;
};

type Parcel = {
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

type Counterparty = {
  counterparty_type: string;
  company_name: string;
  location: string | null;
  province: string | null;
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
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${style}`}
    >
      {state}
    </span>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [routeChain, setRouteChain] = useState<RouteChain | null>(null);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);

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
        .select("full_name, email, company_name, role, is_active")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.is_active !== true) {
        setError("Profile not found or inactive. Check Supabase profiles table.");
        setLoading(false);
        return;
      }

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select(
          "parcel_code, commodity, product_description, accepted_tons, expected_price_per_ton, indicative_revenue, control_state, operator_name, company_name"
        )
        .eq("parcel_code", "PAR-CHR-2026-0001")
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found. Check Supabase parcels table.");
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

      const { data: counterpartyData } = await supabase
        .from("counterparties")
        .select("counterparty_type, company_name, location, province, status")
        .order("counterparty_type", { ascending: true });

      setProfile(profileData);
      setParcel(parcelData);
      setRouteChain(routeData ?? null);
      setCounterparties(counterpartyData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">
            Loading live Supabase data...
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Loading profile, parcel, route chain and counterparties.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-200">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Live data error</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
        </div>
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

  const revenue =
    parcel?.indicative_revenue ??
    Number(parcel?.accepted_tons ?? 0) *
      Number(parcel?.expected_price_per_ton ?? 0);

  const opportunityCards = [
    {
      title: "Parcel Intake",
      state: parcel?.control_state ?? "Pending",
      note: `${parcel?.parcel_code ?? "No parcel"} • ${tons(
        parcel?.accepted_tons
      )}t`,
    },
    {
      title: "Supplier Verification",
      state: supplier?.status ?? "Pending",
      note: supplier?.company_name ?? "No supplier linked",
    },
    {
      title: "Plant Readiness",
      state: washPlant?.status ?? "Pending",
      note: washPlant?.company_name ?? "No wash plant linked",
    },
  ];

  const readinessFlow = [
    {
      title: "Supplier",
      state: supplier?.status ?? "Pending",
      note: supplier?.company_name ?? "Supplier pending",
    },
    {
      title: "Wash Plant",
      state: washPlant?.status ?? "Pending",
      note: washPlant?.company_name ?? "Plant pending",
    },
    {
      title: "Buyer",
      state: buyer?.status ?? "Pending",
      note: buyer?.company_name ?? "Buyer pending",
    },
    {
      title: "Transporter",
      state: transporter?.status ?? "Pending",
      note: transporter?.company_name ?? "Transporter pending",
    },
    {
      title: "Finance",
      state: parcel?.control_state ?? "Pending",
      note: "Finance handoff follows route and document readiness.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
            Executive Control Dashboard
          </h1>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
            Live Supabase-backed dashboard for chrome parcel control, route
            readiness, counterparties, approvals and finance handoff.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Role
              </div>
              <div className="mt-2 font-black capitalize">{profile?.role}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Commodity
              </div>
              <div className="mt-2 font-black text-[#d7ad32]">
                {parcel?.commodity}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Mode
              </div>
              <div className="mt-2 font-black">Live v1</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Status
              </div>
              <div className="mt-2">
                <Badge state={parcel?.control_state ?? "Pending"} />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Lead Parcel
            </p>
            <div className="mt-3 text-2xl font-black">
              {parcel?.parcel_code}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {parcel?.product_description}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Accepted Tons
            </p>
            <div className="mt-3 text-4xl font-black">
              {tons(parcel?.accepted_tons)}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Loaded from Supabase parcels.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Indicative Revenue
            </p>
            <div className="mt-3 text-3xl font-black">{money(revenue)}</div>
            <p className="mt-2 text-sm text-slate-400">
              {tons(parcel?.accepted_tons)}t ×{" "}
              {money(parcel?.expected_price_per_ton)}/t
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Operator
            </p>
            <div className="mt-3 text-2xl font-black">
              {parcel?.operator_name ?? profile?.full_name}
            </div>
            <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
              {parcel?.company_name ?? profile?.company_name}
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
              Opportunity Cards
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Open commercial workstreams
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {opportunityCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">{card.title}</h3>
                    <Badge state={card.state} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {card.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
              Readiness / Route Flow
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Supplier → Plant → Buyer → Finance
            </h2>

            <div className="mt-5 space-y-4">
              {readinessFlow.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black">{item.title}</div>
                    <Badge state={item.state} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            Route Chain
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {routeChain?.route_name ?? "Route chain pending"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Origin
              </p>
              <p className="mt-2 font-black">
                {routeChain?.origin_location ?? "Pending"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Plant
              </p>
              <p className="mt-2 font-black">
                {routeChain?.plant_location ?? "Pending"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Delivery
              </p>
              <p className="mt-2 font-black">
                {routeChain?.delivery_location ?? "Pending"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Status
              </p>
              <div className="mt-2">
                <Badge state={routeChain?.status ?? "Pending"} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
              Finance / Exposure / Margin
            </p>
            <h2 className="mt-2 text-2xl font-black">
              First parcel finance view
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-black">{money(revenue)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Transport Cost / Ton
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(routeChain?.transport_cost_per_ton)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Tolling Cost / Ton
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(routeChain?.tolling_cost_per_ton)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
              Counterparties
            </p>
            <h2 className="mt-2 text-2xl font-black">Linked route parties</h2>

            <div className="mt-5 space-y-4">
              {counterparties.map((item) => (
                <div
                  key={`${item.counterparty_type}-${item.company_name}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
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
          </div>
        </section>
      </div>
    </main>
  );
  }
