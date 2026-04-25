"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

const PARCEL_CODE = "PAR-CHR-2026-0001";

const RESOURCE_MAP: Record<string, string[]> = {
  "Ferrous Metals": ["Chrome", "Iron Ore", "Manganese"],
  "Non-Ferrous Metals": ["Copper", "Nickel", "Zinc", "Lead", "Aluminium"],
  "Battery / Energy Minerals": ["Lithium", "Cobalt", "Graphite", "Vanadium"],
  "Precious Metals": ["Gold", "Platinum Group Metals", "Silver"],
  "Bulk Commodities": ["Coal", "Anthracite", "Coke"],
  "Industrial Minerals": ["Silica", "Limestone", "Fluorspar", "Phosphate", "Other"],
};

const MATERIAL_TYPES = [
  "ROM",
  "Tailings",
  "Dumps",
  "Sweepings",
  "ROM / Tailings / Feedstock",
  "Concentrate",
  "Washed Product",
  "Other",
];

type FormState = {
  category: string;
  resource: string;
  material: string;
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

function n(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function tons(value: number) {
  return Number(value || 0).toFixed(3);
}

function pct(value: number) {
  return `${Number(value || 0).toFixed(1)}%`;
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

function marginClass(margin: number) {
  if (margin < 18) return "border-red-400/40 bg-red-500/15 text-red-200";
  if (margin <= 25) return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
}

function Card(props: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
        {props.label}
      </p>
      <h2 className="mt-2 text-2xl font-black">{props.title}</h2>
      {props.children}
    </section>
  );
}

function Stat(props: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {props.label}
      </p>
      <p
        className={`mt-2 text-3xl font-black ${
          props.gold ? "text-[#f5d778]" : "text-white"
        }`}
      >
        {props.value}
      </p>
      {props.note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{props.note}</p>
      ) : null}
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  help: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {props.label}
      </span>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        inputMode="decimal"
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
      />
      <span className="mt-2 block text-sm leading-6 text-slate-400">
        {props.help}
      </span>
    </label>
  );
}

function SelectField(props: {
  label: string;
  value: string;
  options: string[];
  help: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {props.label}
      </span>
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-xl font-black text-white outline-none focus:border-[#d7ad32]"
      >
        {props.options.map((item) => (
          <option key={item} value={item} className="bg-[#050914] text-white">
            {item}
          </option>
        ))}
      </select>
      <span className="mt-2 block text-sm leading-6 text-slate-400">
        {props.help}
      </span>
    </label>
  );
}

export default function EconomicsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [parcelId, setParcelId] = useState("");
  const [parcelCode, setParcelCode] = useState(PARCEL_CODE);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    category: "Ferrous Metals",
    resource: "Chrome",
    material: "ROM / Tailings / Feedstock",
    target: "",
    yield: "",
    price: "",
    feedstock: "",
    transport: "",
    tolling: "",
    feedstockAssayRate: "0",
    feedstockAssayBatches: "0",
    concentrateAssayRate: "0",
    concentrateAssayBatches: "0",
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (!profile || profile.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      const { data: parcel, error: parcelError } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (parcelError || !parcel) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const category = parcel.resource_category || "Ferrous Metals";
      const options = RESOURCE_MAP[category] || RESOURCE_MAP["Ferrous Metals"];
      const resource =
        parcel.resource_type && options.includes(parcel.resource_type)
          ? parcel.resource_type
          : options[0];

      const startingYield =
        parcel.expected_yield_percent ??
        (parcel.feedstock_tons && parcel.feedstock_tons > 0
          ? (parcel.accepted_tons / parcel.feedstock_tons) * 100
          : 0);

      setIsAdmin(profile.role === "admin");
      setParcelId(parcel.id);
      setParcelCode(parcel.parcel_code || PARCEL_CODE);

      setForm({
        category,
        resource,
        material: parcel.material_type || "ROM / Tailings / Feedstock",
        target: String(parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0),
        yield: String(startingYield),
        price: String(parcel.expected_price_per_ton ?? ""),
        feedstock: String(parcel.feedstock_cost_per_ton ?? ""),
        transport: String(parcel.transport_to_plant_cost_per_ton ?? ""),
        tolling: String(parcel.tolling_cost_per_ton ?? ""),
        feedstockAssayRate: String(parcel.feedstock_assay_cost_per_batch ?? "0"),
        feedstockAssayBatches: String(parcel.feedstock_assay_batches ?? "0"),
        concentrateAssayRate: String(parcel.concentrate_assay_cost_per_batch ?? "0"),
        concentrateAssayBatches: String(parcel.concentrate_assay_batches ?? "0"),
      });

      setLoading(false);
    }

    load();
  }, [supabase]);

  const target = n(form.target);
  const yieldPercent = n(form.yield);
  const price = n(form.price);
  const feedRate = n(form.feedstock);
  const transportRate = n(form.transport);
  const tollingRate = n(form.tolling);
  const feedAssayRate = n(form.feedstockAssayRate);
  const feedAssayBatches = n(form.feedstockAssayBatches);
  const concAssayRate = n(form.concentrateAssayRate);
  const concAssayBatches = n(form.concentrateAssayBatches);

  const feedstockTons = requiredFeed(target, yieldPercent);
  const revenue = target * price;
  const feedstockCost = feedstockTons * feedRate;
  const transportCost = feedstockTons * transportRate;
  const tollingCost = feedstockTons * tollingRate;
  const feedstockAssayCost = feedAssayRate * feedAssayBatches;
  const concentrateAssayCost = concAssayRate * concAssayBatches;
  const totalAssayCost = feedstockAssayCost + concentrateAssayCost;
  const routeCost = feedstockCost + transportCost + tollingCost + totalAssayCost;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  function setField(key: keyof FormState, value: string) {
    if (key === "category") {
      const firstResource = RESOURCE_MAP[value]?.[0] || "Other";
      setForm((old) => ({ ...old, category: value, resource: firstResource }));
      return;
    }

    setForm((old) => ({ ...old, [key]: value }));
  }

  async function save() {
    if (!parcelId) return;

    setSaving(true);
    setNotice("");
    setError("");

    const payload = {
      resource_category: form.category,
      resource_type: form.resource,
      material_type: form.material,
      commodity: form.resource,

      feedstock_tons: feedstockTons,
      expected_yield_percent: yieldPercent,
      expected_concentrate_tons: target,
      accepted_tons: target,
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

      concentrate_assay_cost_per_batch: concAssayRate,
      concentrate_assay_batches: concAssayBatches,
      estimated_concentrate_assay_cost: concentrateAssayCost,

      estimated_total_assay_cost: totalAssayCost,
      estimated_route_cost: routeCost,
      estimated_route_surplus: surplus,
      estimated_route_margin_percent: margin,

      economics_basis:
        "Resource category, resource type and material type selected from dropdowns. Feedstock required calculated automatically from target product tons and expected yield. Feedstock assay and final product assay are separated and included in route cost.",
    };

    const { error: saveError } = await supabase
      .from("parcels")
      .update(payload)
      .eq("id", parcelId);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setNotice("Resource economics saved to Supabase.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading economics..." />
      </main>
    );
  }

  if (error && !parcelId) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Economics module error">
          <p className="mt-3 text-red-200">{error}</p>
        </Card>
      </main>
    );
  }

  const resourceOptions = RESOURCE_MAP[form.category] || ["Other"];

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Resource Economics Calculator">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Select the resource category, resource, material type, yield, costs and assay basis.
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
          <Stat label="Category" value={form.category} />
          <Stat label="Resource" value={form.resource} gold />
          <Stat label="Material" value={form.material} />
          <Stat label="Parcel" value={parcelCode} />
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Target Product Tons" value={tons(target)} />
          <Stat label="Feedstock Required" value={tons(feedstockTons)} note={`${tons(target)}t ÷ ${pct(yieldPercent)} yield`} gold />
          <Stat label="Revenue" value={money(revenue)} gold />
          <Stat label="Route Cost" value={money(routeCost)} />
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-3xl border p-5 ${marginClass(margin)}`}>
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
          <Card label="Input Controls" title="Set resource and economics">
            {!isAdmin ? (
              <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-black text-red-200">Admin access required</p>
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <SelectField label="Resource Category" value={form.category} options={Object.keys(RESOURCE_MAP)} onChange={(v) => setField("category", v)} help="Broad commodity class." />
              <SelectField label="Resource / Commodity" value={form.resource} options={resourceOptions} onChange={(v) => setField("resource", v)} help="Specific traded or processed resource." />
              <SelectField label="Material Type" value={form.material} options={MATERIAL_TYPES} onChange={(v) => setField("material", v)} help="Material form entering or leaving the route." />

              <Field label="Target / Yielded Product Tons" value={form.target} onChange={(v) => setField("target", v)} help="The product tons you want to produce or sell." />
              <Field label="Expected Yield %" value={form.yield} onChange={(v) => setField("yield", v)} help="Expected product output percentage from feedstock tons." />
              <Stat label="Auto Calculated Feedstock Required" value={tons(feedstockTons)} note={`${tons(target)}t ÷ ${pct(yieldPercent)} yield`} gold />

              <Field label="Selling Price / Product Ton" value={form.price} onChange={(v) => setField("price", v)} help="Selling price per yielded product ton." />
              <Field label="Feedstock Cost / Feedstock Ton" value={form.feedstock} onChange={(v) => setField("feedstock", v)} help="Cost per required feedstock ton." />
              <Field label="Transport To Plant Cost / Feedstock Ton" value={form.transport} onChange={(v) => setField("transport", v)} help="Transport cost per required feedstock ton." />
              <Field label="Tolling Cost / Feedstock Ton" value={form.tolling} onChange={(v) => setField("tolling", v)} help="Plant tolling or processing cost per required feedstock ton." />

              <Field label="Feedstock Assay Cost / Batch" value={form.feedstockAssayRate} onChange={(v) => setField("feedstockAssayRate", v)} help="ROM, tailings or feedstock assay cost per batch." />
              <Field label="Feedstock Assay Batches" value={form.feedstockAssayBatches} onChange={(v) => setField("feedstockAssayBatches", v)} help="Number of feedstock assay batches." />
              <Field label="Final Product Assay Cost / Batch" value={form.concentrateAssayRate} onChange={(v) => setField("concentrateAssayRate", v)} help="Final product assay cost per batch." />
              <Field label="Final Product Assay Batches" value={form.concentrateAssayBatches} onChange={(v) => setField("concentrateAssayBatches", v)} help="Number of final product assay batches." />

              <button
                type="button"
                onClick={save}
                disabled={!isAdmin || saving}
                className="w-full rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Resource Economics"}
              </button>

              {notice ? (
                <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
                  {notice}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                  {error}
                </p>
              ) : null}
            </div>
          </Card>

          <Card label="Live Preview" title="Assay-adjusted route result">
            <div className="mt-5 space-y-4">
              <Stat label="Target Product Tons" value={tons(target)} />
              <Stat label="Feedstock Required" value={tons(feedstockTons)} note={`${tons(target)}t ÷ ${pct(yieldPercent)} yield`} gold />
              <Stat label="Revenue" value={money(revenue)} note={`${tons(target)}t × ${money(price)}/t`} />
              <Stat label="Feedstock Cost" value={money(feedstockCost)} />
              <Stat label="Transport Cost" value={money(transportCost)} />
              <Stat label="Tolling Cost" value={money(tollingCost)} />
              <Stat label="Feedstock Assay Cost" value={money(feedstockAssayCost)} note={`${money(feedAssayRate)} × ${feedAssayBatches} batches`} />
              <Stat label="Final Product Assay Cost" value={money(concentrateAssayCost)} note={`${money(concAssayRate)} × ${concAssayBatches} batches`} />
              <Stat label="Total Assay Cost" value={money(totalAssayCost)} gold />
              <Stat label="Total Route Cost" value={money(routeCost)} />
              <Stat label="Indicative Surplus" value={money(surplus)} gold />
              <Stat label="Route Margin" value={pct(margin)} gold />
            </div>
          </Card>
        </section>

        <Card label="Control Note" title="Resource economics basis">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Resource category, resource and material type are selected by dropdown. Feedstock required is calculated automatically from target product tons and expected yield. Feedstock assay and final product assay are separated and included in route cost.
          </p>
        </Card>
      </div>
    </main>
  );
  }
