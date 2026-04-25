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
  accepted_tons: number;
  expected_price_per_ton: number | null;
  indicative_revenue: number | null;
  control_state: string;
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

export default function RouteBuilderPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [route, setRoute] = useState<RouteChain | null>(null);
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
          "id, parcel_code, commodity, accepted_tons, expected_price_per_ton, indicative_revenue, control_state"
        )
        .eq("parcel_code", "PAR-CHR-2026-0001")
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const { data: routeData, error: routeError } = await supabase
        .from("route_chains")
        .select(
          "route_code, route_name, origin_location, plant_location, delivery_location, transport_cost_per_ton, tolling_cost_per_ton, estimated_margin_per_ton, status, notes"
        )
        .eq("route_code", "ROUTE-CHR-2026-0001")
        .maybeSingle();

      if (routeError) {
        setError("Route chain could not be loaded.");
        setLoading(false);
        return;
      }

      const { data: counterpartyData } = await supabase
        .from("counterparties")
        .select("counterparty_type, company_name, location, province, status")
        .order("counterparty_type", { ascending: true });

      setProfile(profileData);
      setParcel(parcelData);
      setRoute(routeData ?? null);
      setCounterparties(counterpartyData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading route builder..." />
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
          <h1 className="mt-3 text-2xl font-black">Route Builder module error</h1>
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

  const concentrateTons = Number(parcel?.accepted_tons ?? 0);
  const pricePerTon = Number(parcel?.expected_price_per_ton ?? 0);
  const revenue =
    parcel?.indicative_revenue ?? concentrateTons * pricePerTon;

  const feedstockTons = 108;
  const feedstockCostPerTon = 150;
  const transportToPlantCostPerTon = Number(route?.transport_cost_per_ton ?? 150);
  const tollingCostPerTon = Number(route?.tolling_cost_per_ton ?? 350);

  const feedstockCost = feedstockTons * feedstockCostPerTon;
  const transportCost = feedstockTons * transportToPlantCostPerTon;
  const tollingCost = feedstockTons * tollingCostPerTon;

  const routeCost = feedstockCost + transportCost + tollingCost;
  const routeSurplus = revenue - routeCost;
  const routeMargin = revenue > 0 ? (routeSurplus / revenue) * 100 : 0;

  const chainItems = [
    {
      label: "Supplier",
      title: supplier?.company_name ?? "Supplier pending",
      location: supplier?.location ?? route?.origin_location ?? "Origin pending",
      status: supplier?.status ?? "Pending",
    },
    {
      label: "Wash Plant",
      title: washPlant?.company_name ?? "Wash plant pending",
      location: washPlant?.location ?? route?.plant_location ?? "Plant pending",
      status: washPlant?.status ?? "Pending",
    },
    {
      label: "Buyer",
      title: buyer?.company_name ?? "Buyer pending",
      location: buyer?.location ?? route?.delivery_location ?? "Delivery pending",
      status: buyer?.status ?? "Pending",
    },
    {
      label: "Transporter",
      title: transporter?.company_name ?? "Transporter pending",
      location: transporter?.location ?? "Route transport pending",
      status: transporter?.status ?? "Pending",
    },
    {
      label: "Finance",
      title: "Finance handoff",
      location: "Blocked until route and documents clear",
      status: parcel?.control_state ?? "Pending",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Route Builder Control Module">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live route-chain view linking supplier, wash plant, buyer,
            transporter and finance handoff for the first chrome parcel.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/counterparties"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Counterparties
            </Link>

            <Link
              href="/finance"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Finance
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
              Concentrate Tons
            </p>
            <p className="mt-3 text-4xl font-black">{tons(concentrateTons)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Feedstock Tons
            </p>
            <p className="mt-3 text-4xl font-black">{tons(feedstockTons)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Route Status
            </p>
            <div className="mt-3">
              <Badge state={route?.status ?? "Pending"} />
            </div>
          </div>
        </section>

        <Card label="Route Chain" title={route?.route_name ?? "Route chain pending"}>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
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
                Plant
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

          <p className="mt-5 text-sm leading-7 text-slate-400">
            {route?.notes ?? "No route note captured."}
          </p>
        </Card>

        <Card label="Route Flow" title="Supplier → Plant → Buyer → Transporter → Finance">
          <div className="mt-5 space-y-4">
            {chainItems.map((item) => (
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
                      {item.location}
                    </p>
                  </div>

                  <Badge state={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Route Economics" title="Feedstock-based first parcel view">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Indicative Revenue
                </p>
                <p className="mt-2 text-3xl font-black">{money(revenue)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {tons(concentrateTons)}t concentrate × {money(pricePerTon)}/t
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Feedstock Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(feedstockCost)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {money(feedstockCostPerTon)}/t × {tons(feedstockTons)}t feedstock
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Transport Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(transportCost)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {money(transportToPlantCostPerTon)}/t × {tons(feedstockTons)}t feedstock
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Tolling Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(tollingCost)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {money(tollingCostPerTon)}/t × {tons(feedstockTons)}t feedstock
                </p>
              </div>
            </div>
          </Card>

          <Card label="Margin Control" title="Corrected route surplus">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Route Cost
                </p>
                <p className="mt-2 text-3xl font-black">{money(routeCost)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Indicative Surplus
                </p>
                <p className="mt-2 text-3xl font-black text-[#f5d778]">
                  {money(routeSurplus)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Route Margin
                </p>
                <p className="mt-2 text-3xl font-black text-[#f5d778]">
                  {percent(routeMargin)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Control Note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Revenue is calculated on concentrate tons. Feedstock,
                  transport-to-plant and tolling costs are calculated on
                  feedstock tons.
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
          </div>
        </Card>
      </div>
    </main>
  );
    }
