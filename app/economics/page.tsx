"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Profile = {
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
  feedstock_assay_cost_per_batch: number | null;
  feedstock_assay_batches: number | null;
  estimated_feedstock_assay_cost: number | null;
  concentrate_assay_cost_per_batch: number | null;
  concentrate_assay_batches: number | null;
  estimated_concentrate_assay_cost: number | null;
  estimated_total_assay_cost: number | null;
  estimated_route_cost: number | null;
  estimated_route_surplus: number | null;
  estimated_route_margin_percent: number | null;
  economics_basis: string | null;
};

type FormState = {
  target: string;
  yield: string;
  price: string;
  feedstock: string;
  transport: string;
  tolling: string;
  feedstockAssayRate: string;
  feedstockAssayBatches: string;
  concentrateAssayRate: string;
  concentrateAssayBatches: string;
};

const PARCEL_CODE = "PAR-CHR-2026-0001";

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

function pct(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function num(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function requiredFeed(target: number, yieldPercent: number) {
  if (yieldPercent <= 0) return 0;
  return target / (yieldPercent / 100);
}

function marginState(margin: number) {
  if (margin < 18) return "Below Target";
  if (margin <= 25) return "Target Band";
  return "Strong Route";
}

function marginStyle(margin: number) {
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

function Stat({
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
      <p className={`mt-2 text-3xl font-black ${gold ? "text-[#f5d778]" : "text-white"}`}>
        {value}
      </p>
      {note ? <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p> : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
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
      <span className="mt-2 block text-sm leading-6 text-slate-400">{help}</span>
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

  const [form, setForm] = useState<FormState>({
    target: "",
    yield: "",
    price: "",
    feedstock: "",
    transport: "",
    tolling: "",
    feedstockAssayRate: "",
    feedstockAssayBatches: "",
    concentrateAssayRate: "",
    concentrateAssayBatches: "",
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
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const typedParcel = parcelData as Parcel;

      const startingYield =
        typedParcel.expected_yield_percent ??
        (typedParcel.feedstock_tons && typedParcel.feedstock_tons > 0
          ? (typedParcel.accepted_tons / typedParcel.feedstock_tons) * 100
          : 0);

      setProfile(profileData);
      setParcel(typedParcel);

      setForm({
        target: String(typedParcel.expected_concentrate_tons ?? typedParcel.accepted_tons ?? 0),
        yield: String(startingYield),
        price: String(typedParcel.expected_price_per_ton ?? ""),
        feedstock: String(typedParcel.feedstock_cost_per_ton ?? ""),
        transport: String(typedParcel.transport_to_plant_cost_per_ton ?? ""),
        tolling: String(typedParcel.tolling_cost_per_ton ?? ""),
        feedstockAssayRate: String(typedParcel.feedstock_assay_cost_per_batch ?? "0"),
        feedstockAssayBatches: String(typedParcel.feedstock_assay_batches ?? "0"),
        concentrateAssayRate: String(typedParcel.concentrate_assay_cost_per_batch ?? "0"),
        concentrateAssayBatches: String(typedParcel.concentrate_assay_batches ?? "0"),
      });

      setLoading(false);
    }

    load();
  }, [supabase]);

  const targetTons = num(form.target);
  const yieldPercent = num(form.yield);
  const price = num(form.price);
  const feedRate = num(form.feedstock);
  const transportRate = num(form.transport);
  const tollingRate = num(form.tolling);

  const feedAssayRate = num(form.feedstockAssayRate);
  const feedAssayBatches = num(form.feedstockAssayBatches);
  const concentrateAssayRate = num(form.concentrateAssayRate);
  const concentrateAssayBatches = num(form.concentrateAssayBatches);

  const feedstockTons = requiredFeed(targetTons, yieldPercent);
  const revenue = targetTons * price;

  const feedstockCost = feedstockTons * feedRate;
  const transportCost = feedstockTons * transportRate;
  const tollingCost = feedstockTons * tollingRate;

  const feedstockAssayCost = feedAssayRate * feedAssayBatches;
  const concentrateAssayCost = concentrateAssayRate * concentrateAssayBatches;
  const totalAssayCost = feedstockAssayCost + concentrateAssayCost;

  const routeCost = feedstockCost + transportCost + tollingCost + totalAssayCost;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  function setField(key: keyof FormState, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function saveEconomics() {
    if (!parcel) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      feedstock_tons: feedstockTons,
      expected_yield_percent: yieldPercent,
      expected_concentrate_tons: targetTons,
      accepted_tons: targetTons,
      expected_price_per_ton: price,

      feedstock_cost_per_ton: feedRate,
      transport_to_plant_cost_per_ton: transportRate,
      tolling_cost_per_ton: tollingRate,

      estimated_feedstock_cost: feedstockCost,
      estimated_transport_cost: transportCost,
      estimated_tolling_cost: tollingCost,

      feedstock_assay_cost_per_batch: feedAssayRate,
      feedstock_assay_batches: feedAssayBatches,
      estimated_feedstock_assay_cost: feedstockAssayCost,

      concentrate_assay_cost_per_batch: concentrateAssayRate,
      concentrate_assay_batches: concentrateAssayBatches,
      estimated_concentrate_assay_cost: concentrateAssayCost,

      estimated_total_assay_cost: totalAssayCost,
      estimated_route_cost: routeCost,
      estimated_route_surplus: surplus,
      estimated_route_margin_percent: margin,

      economics_basis:
        "Feedstock required calculated automatically from target concentrate tons and expected yield percentage. Feedstock assay and concentrate assay are costed separately and included in total route cost.",
    };

    const { data, error: updateError } = await supabase
      .from("parcels")
      .update(payload)
      .eq("id", parcel.id)
      .select("*")
      .single();

    if (updateError || !data) {
      setError(updateError?.message ?? "Could not save parcel economics.");
      setSaving(false);
      return;
    }

    setParcel(data as Parcel);
    setMessage("Assay-adjusted economics saved to Supabase.");
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

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Auto Feedstock + Split Assay Calculator">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Enter target concentrate tons and expected yield. ResourceOS calculates
            required feedstock automatically and separates feedstock assay from concentrate assay.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]">
              Back to Dashboard
            </Link>
            <Link href="/finance" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300">
              Finance
            </Link>
            <Link href="/analytics" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300">
              Analytics
            </Link>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Parcel" value={parcel?.parcel_code ?? "Pending"} note={parcel?.commodity ?? ""} />
          <Stat label="Target Concentrate" value={tons(targetTons)} />
          <Stat label="Feedstock Required" value={tons(feedstockTons)} note={`${tons(targetTons)}t ÷ ${pct(yieldPercent)} yield`} gold />
          <Stat label="Revenue" value={money(revenue)} gold />
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-3xl border p-5 ${marginStyle(margin)}`}>
            <p className="text-xs font-bold uppercase tracking-[0.25em]">
              Margin Control State
            </p>
            <p className="mt-3 text-3xl font-black">{marginState(margin)}</p>
            <p className="mt-2 text-sm leading-6">
              Below 18% = review/block. 18%–25% = target band. Above 25% = strong route.
            </p>
          </div>
          <Stat label="Route Margin" value={pct(margin)} gold />
          <Stat label="Indicative Surplus" value={money(surplus)} gold />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Input Controls" title="Set output, route costs and assay costs">
            {!isAdmin ? (
              <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-black text-red-200">Admin access required</p>
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <Input label="Target / Yielded Concentrate Tons" value={form.target} onChange={(v) => setField("target", v)} help="The concentrate tons you want to produce or sell." />
              <Input label="Expected Yield %" value={form.yield} onChange={(v) => setField("yield", v)} help="Expected concentrate output percentage from feedstock tons." />
              <Stat label="Auto Calculated Feedstock Required" value={tons(feedstockTons)} note={`${tons(targetTons)}t ÷ ${pct(yieldPercent)} yield`} gold />
              <Input label="Selling Price / Concentrate Ton" value={form.price} onChange={(v) => setField("price", v)} help="Selling price per yielded concentrate ton." />
              <Input label="Feedstock Cost / Feedstock Ton" value={form.feedstock} onChange={(v) => setField("feedstock", v)} help="Cost per required feedstock ton." />
              <Input label="Transport To Plant Cost / Feedstock Ton" value={form.transport} onChange={(v) => setField("transport", v)} help="Transport cost per required feedstock ton." />
              <Input label="Tolling Cost / Feedstock Ton" value={form.tolling} onChange={(v) => setField("tolling", v)} help="Plant tolling or processing cost per required feedstock ton." />
              <Input label="Feedstock Assay Cost / Batch" value={form.feedstockAssayRate} onChange={(v) => setField("feedstockAssayRate", v)} help="ROM, tailings or feedstock assay cost per batch." />
              <Input label="Feedstock Assay Batches" value={form.feedstockAssayBatches} onChange={(v) => setField("feedstockAssayBatches", v)} help="Number of feedstock assay batches." />
              <Input label="Concentrate Assay Cost / Batch" value={form.concentrateAssayRate} onChange={(v) => setField("concentrateAssayRate", v)} help="Final concentrate assay cost per batch." />
              <Input label="Concentrate Assay Batches" value={form.concentrateAssayBatches} onChange={(v) => setField("concentrateAssayBatches", v)} help="Number of concentrate assay batches." />

              <button
                type="button"
                onClick={saveEconomics}
                disabled={!isAdmin || saving}
                className="w-full rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Assay-Adjusted Economics"}
              </button>

              {message ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">{message}</p> : null}
              {error ? <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</p> : null}
            </div>
          </Card>

          <Card label="Live Calculation Preview" title="Assay-adjusted route result">
            <div className="mt-5 space-y-4">
              <Stat label="Target Concentrate Tons" value={tons(targetTons)} />
              <Stat label="Feedstock Required" value={tons(feedstockTons)} note={`${tons(targetTons)}t ÷ ${pct(yieldPercent)} yield`} gold />
              <Stat label="Indicative Revenue" value={money(revenue)} note={`${tons(targetTons)}t × ${money(price)}/t`} />
              <Stat label="Feedstock Cost" value={money(feedstockCost)} />
              <Stat label="Transport Cost" value={money(transportCost)} />
              <Stat label="Tolling Cost" value={money(tollingCost)} />
              <Stat label="Feedstock Assay Cost" value={money(feedstockAssayCost)} note={`${money(feedAssayRate)} × ${feedAssayBatches} batches`} />
              <Stat label="Concentrate Assay Cost" value={money(concentrateAssayCost)} note={`${money(concentrateAssayRate)} × ${concentrateAssayBatches} batches`} />
              <Stat label="Total Assay Cost" value={money(totalAssayCost)} gold />
              <Stat label="Total Route Cost" value={money(routeCost)} />
              <Stat label="Indicative Surplus" value={money(surplus)} gold />
              <Stat label="Route Margin" value={pct(margin)} gold />
            </div>
          </Card>
        </section>

        <Card label="Control Note" title="Economics basis">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Feedstock required is calculated automatically from target concentrate tons and expected yield percentage.
            Feedstock assay and concentrate assay are costed separately and added into total route cost.
          </p>
        </Card>
      </div>
    </main>
  );
  }
