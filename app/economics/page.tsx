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
  feedstock_tons: number | null;
  expected_yield_percent: number | null;
  expected_concentrate_tons: number | null;
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

type EconomicsForm = {
  feedstock_tons: string;
  expected_yield_percent: string;
  expected_price_per_ton: string;
  feedstock_cost_per_ton: string;
  transport_to_plant_cost_per_ton: string;
  tolling_cost_per_ton: string;
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

function toNumber(value: string) {
  const clean = value.replace(",", ".").trim();
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

function marginState(margin: number) {
  if (margin < 18) return "Below Target";
  if (margin <= 25) return "Target Band";
  return "Strong Route";
}

function marginClass(margin: number) {
  if (margin < 18) return "border-red-400/40 bg-red-500/15 text-red-200";
  if (margin <= 25) return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
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

function StatBox({
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
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-black ${
          gold ? "text-[#f5d778]" : "text-white"
        }`}
      >
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
      ) : null}
    </div>
  );
}

function InputBox({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
      />

      {help ? (
        <span className="mt-2 block text-sm leading-6 text-slate-400">
          {help}
        </span>
      ) : null}
    </label>
  );
}

export default function EconomicsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);

  const [form, setForm] = useState<EconomicsForm>({
    feedstock_tons: "",
    expected_yield_percent: "",
    expected_price_per_ton: "",
    feedstock_cost_per_ton: "",
    transport_to_plant_cost_per_ton: "",
    tolling_cost_per_ton: "",
  });

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
          "id, parcel_code, commodity, accepted_tons, expected_price_per_ton, indicative_revenue, feedstock_tons, expected_yield_percent, expected_concentrate_tons, feedstock_cost_per_ton, transport_to_plant_cost_per_ton, tolling_cost_per_ton, estimated_feedstock_cost, estimated_transport_cost, estimated_tolling_cost, estimated_route_cost, estimated_route_surplus, estimated_route_margin_percent, economics_basis"
        )
        .eq("parcel_code", "PAR-CHR-2026-0001")
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const startingYield =
        parcelData.expected_yield_percent ??
        (parcelData.feedstock_tons && parcelData.feedstock_tons > 0
          ? (parcelData.accepted_tons / parcelData.feedstock_tons) * 100
          : 0);

      setProfile(profileData);
      setParcel(parcelData);

      setForm({
        feedstock_tons: String(parcelData.feedstock_tons ?? ""),
        expected_yield_percent: String(startingYield),
        expected_price_per_ton: String(parcelData.expected_price_per_ton ?? ""),
        feedstock_cost_per_ton: String(parcelData.feedstock_cost_per_ton ?? ""),
        transport_to_plant_cost_per_ton: String(
          parcelData.transport_to_plant_cost_per_ton ?? ""
        ),
        tolling_cost_per_ton: String(parcelData.tolling_cost_per_ton ?? ""),
      });

      setLoading(false);
    }

    load();
  }, [supabase]);

  const feedstockTons = toNumber(form.feedstock_tons);
  const yieldPercent = toNumber(form.expected_yield_percent);
  const pricePerTon = toNumber(form.expected_price_per_ton);
  const feedstockRate = toNumber(form.feedstock_cost_per_ton);
  const transportRate = toNumber(form.transport_to_plant_cost_per_ton);
  const tollingRate = toNumber(form.tolling_cost_per_ton);

  const concentrateTons = feedstockTons * (yieldPercent / 100);
  const revenue = concentrateTons * pricePerTon;

  const feedstockCost = feedstockTons * feedstockRate;
  const transportCost = feedstockTons * transportRate;
  const tollingCost = feedstockTons * tollingRate;
  const routeCost = feedstockCost + transportCost + tollingCost;
  const routeSurplus = revenue - routeCost;
  const routeMargin = revenue > 0 ? (routeSurplus / revenue) * 100 : 0;

  async function saveEconomics() {
    if (!parcel) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      feedstock_tons: feedstockTons,
      expected_yield_percent: yieldPercent,
      expected_concentrate_tons: concentrateTons,
      accepted_tons: concentrateTons,
      expected_price_per_ton: pricePerTon,
      feedstock_cost_per_ton: feedstockRate,
      transport_to_plant_cost_per_ton: transportRate,
      tolling_cost_per_ton: tollingRate,
      estimated_feedstock_cost: feedstockCost,
      estimated_transport_cost: transportCost,
      estimated_tolling_cost: tollingCost,
      estimated_route_cost: routeCost,
      estimated_route_surplus: routeSurplus,
      estimated_route_margin_percent: routeMargin,
      economics_basis:
        "Revenue calculated on yielded concentrate tons. Yielded concentrate tons calculated from feedstock tons and expected yield percentage. Feedstock, transport-to-plant and tolling costs calculated on feedstock tons.",
    };

    const { data, error: updateError } = await supabase
      .from("parcels")
      .update(payload)
      .eq("id", parcel.id)
      .select(
        "id, parcel_code, commodity, accepted_tons, expected_price_per_ton, indicative_revenue, feedstock_tons, expected_yield_percent, expected_concentrate_tons, feedstock_cost_per_ton, transport_to_plant_cost_per_ton, tolling_cost_per_ton, estimated_feedstock_cost, estimated_transport_cost, estimated_tolling_cost, estimated_route_cost, estimated_route_surplus, estimated_route_margin_percent, economics_basis"
      )
      .single();

    if (updateError || !data) {
      setError(updateError?.message ?? "Could not save parcel economics.");
      setSaving(false);
      return;
    }

    setParcel(data);
    setMessage("Yield and parcel economics saved to Supabase.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading economics..." />
      </main>
    );
  }

  if (error && !parcel) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Economics module error">
          <p className="mt-3 text-red-200">{error}</p>
        </Card>
      </main>
    );
  }

  const isAdmin = profile?.role === "admin";
  const state = marginState(routeMargin);

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Editable Yield & Parcel Economics">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Update feedstock tons, expected yield, concentrate output, selling
            price and feedstock-based route costs directly from the app.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/finance"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Finance
            </Link>

            <Link
              href="/analytics"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Analytics
            </Link>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatBox
            label="Parcel"
            value={parcel?.parcel_code ?? "Pending"}
            note={parcel?.commodity ?? "Commodity pending"}
          />
          <StatBox label="Feedstock Tons" value={tons(feedstockTons)} />
          <StatBox label="Yielded Concentrate" value={tons(concentrateTons)} />
          <StatBox label="Revenue" value={money(revenue)} gold />
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-3xl border p-5 ${marginClass(routeMargin)}`}>
            <p className="text-xs font-bold uppercase tracking-[0.25em]">
              Margin Control State
            </p>
            <p className="mt-3 text-3xl font-black">{state}</p>
            <p className="mt-2 text-sm leading-6">
              Below 18% = review/block. 18%–25% = target band. Above 25% =
              strong route.
            </p>
          </div>

          <StatBox label="Route Margin" value={percent(routeMargin)} gold />
          <StatBox label="Indicative Surplus" value={money(routeSurplus)} gold />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Input Controls" title="Edit yield and route economics">
            {!isAdmin ? (
              <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-black text-red-200">Admin access required</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Your profile must have role admin to update parcel economics.
                </p>
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <InputBox
                label="Feedstock Tons"
                value={form.feedstock_tons}
                onChange={(value) =>
                  setForm((old) => ({ ...old, feedstock_tons: value }))
                }
                help="Raw feedstock tons loaded into the route."
              />

              <InputBox
                label="Expected Yield %"
                value={form.expected_yield_percent}
                onChange={(value) =>
                  setForm((old) => ({ ...old, expected_yield_percent: value }))
                }
                help="Expected concentrate output percentage from feedstock tons."
              />

              <InputBox
                label="Selling Price / Concentrate Ton"
                value={form.expected_price_per_ton}
                onChange={(value) =>
                  setForm((old) => ({ ...old, expected_price_per_ton: value }))
                }
                help="Selling price per yielded concentrate ton."
              />

              <InputBox
                label="Feedstock Cost / Feedstock Ton"
                value={form.feedstock_cost_per_ton}
                onChange={(value) =>
                  setForm((old) => ({ ...old, feedstock_cost_per_ton: value }))
                }
                help="Cost per feedstock ton."
              />

              <InputBox
                label="Transport To Plant Cost / Feedstock Ton"
                value={form.transport_to_plant_cost_per_ton}
                onChange={(value) =>
                  setForm((old) => ({
                    ...old,
                    transport_to_plant_cost_per_ton: value,
                  }))
                }
                help="Transport cost per feedstock ton from source to plant."
              />

              <InputBox
                label="Tolling Cost / Feedstock Ton"
                value={form.tolling_cost_per_ton}
                onChange={(value) =>
                  setForm((old) => ({ ...old, tolling_cost_per_ton: value }))
                }
                help="Plant tolling or processing cost per feedstock ton."
              />

              <button
                type="button"
                onClick={saveEconomics}
                disabled={!isAdmin || saving}
                className="w-full rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Yield & Economics to Supabase"}
              </button>

              {message ? (
                <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
                  {message}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                  {error}
                </p>
              ) : null}
            </div>
          </Card>

          <Card label="Live Calculation Preview" title="Calculated route result">
            <div className="mt-5 space-y-4">
              <StatBox
                label="Yielded Concentrate Tons"
                value={tons(concentrateTons)}
                note={`${tons(feedstockTons)}t feedstock × ${percent(
                  yieldPercent
                )} yield`}
              />

              <StatBox
                label="Indicative Revenue"
                value={money(revenue)}
                note={`${tons(concentrateTons)}t concentrate × ${money(
                  pricePerTon
                )}/t`}
              />

              <StatBox
                label="Feedstock Cost"
                value={money(feedstockCost)}
                note={`${money(feedstockRate)}/t × ${tons(
                  feedstockTons
                )}t feedstock`}
              />

              <StatBox
                label="Transport Cost"
                value={money(transportCost)}
                note={`${money(transportRate)}/t × ${tons(
                  feedstockTons
                )}t feedstock`}
              />

              <StatBox
                label="Tolling Cost"
                value={money(tollingCost)}
                note={`${money(tollingRate)}/t × ${tons(
                  feedstockTons
                )}t feedstock`}
              />

              <StatBox label="Total Route Cost" value={money(routeCost)} />
              <StatBox label="Indicative Surplus" value={money(routeSurplus)} gold />
              <StatBox label="Route Margin" value={percent(routeMargin)} gold />
            </div>
          </Card>
        </section>

        <Card label="Control Note" title="Economics basis">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Revenue is calculated by Supabase from accepted concentrate tons and
            selling price. This page updates the yielded concentrate tons,
            accepted tons, yield percentage, selling price and feedstock-based
            route costs. It does not write directly to the generated revenue
            column.
          </p>
        </Card>
      </div>
    </main>
  );
  }
