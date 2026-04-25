"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { MATERIAL_TYPES, RESOURCE_MAP, defaultsFor } from "../../lib/resourceDefaults";

const PARCEL_CODE = "PAR-CHR-2026-0001";

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

function n(v: string) {
  const x = Number(v.replace(",", ".").trim());
  return Number.isFinite(x) ? x : 0;
}

function money(v: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function tons(v: number) {
  return Number(v || 0).toFixed(3);
}

function pct(v: number) {
  return `${Number(v || 0).toFixed(1)}%`;
}

function feed(target: number, y: number) {
  return y > 0 ? target / (y / 100) : 0;
}

function marginState(m: number) {
  if (m < 18) return "Below Target";
  if (m <= 25) return "Target Band";
  return "Strong Route";
}

function marginClass(m: number) {
  if (m < 18) return "border-red-400/40 bg-red-500/15 text-red-200";
  if (m <= 25) return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
}

function Card(p: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">{p.label}</p>
      <h2 className="mt-2 text-2xl font-black">{p.title}</h2>
      {p.children}
    </section>
  );
}

function Stat(p: { label: string; value: string; note?: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{p.label}</p>
      <p className={`mt-2 text-3xl font-black ${p.gold ? "text-[#f5d778]" : "text-white"}`}>{p.value}</p>
      {p.note ? <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p> : null}
    </div>
  );
}

function Field(p: { label: string; value: string; help: string; onChange: (v: string) => void }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{p.label}</span>
      <input
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        inputMode="decimal"
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
      />
      <span className="mt-2 block text-sm leading-6 text-slate-400">{p.help}</span>
    </label>
  );
}

function SelectField(p: { label: string; value: string; options: string[]; help: string; onChange: (v: string) => void }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{p.label}</span>
      <select
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-xl font-black text-white outline-none focus:border-[#d7ad32]"
      >
        {p.options.map((item) => (
          <option key={item} value={item} className="bg-[#050914] text-white">{item}</option>
        ))}
      </select>
      <span className="mt-2 block text-sm leading-6 text-slate-400">{p.help}</span>
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
      const resource = parcel.resource_type && options.includes(parcel.resource_type) ? parcel.resource_type : options[0];
      const defs = defaultsFor(resource);

      const startingYield =
        parcel.expected_yield_percent ??
        (parcel.feedstock_tons && parcel.feedstock_tons > 0
          ? (parcel.accepted_tons / parcel.feedstock_tons) * 100
          : defs.yield);

      setIsAdmin(profile.role === "admin");
      setParcelId(parcel.id);
      setParcelCode(parcel.parcel_code || PARCEL_CODE);

      setForm({
        category,
        resource,
        material: parcel.material_type || defs.material,
        target: String(parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0),
        yield: String(startingYield),
        price: String(parcel.expected_price_per_ton ?? defs.price),
        feedstock: String(parcel.feedstock_cost_per_ton ?? defs.feedstock),
        transport: String(parcel.transport_to_plant_cost_per_ton ?? defs.transport),
        tolling: String(parcel.tolling_cost_per_ton ?? defs.tolling),
        feedstockAssayRate: String(parcel.feedstock_assay_cost_per_batch ?? defs.feedstockAssayRate),
        feedstockAssayBatches: String(parcel.feedstock_assay_batches ?? defs.feedstockAssayBatches),
        concentrateAssayRate: String(parcel.concentrate_assay_cost_per_batch ?? defs.concentrateAssayRate),
        concentrateAssayBatches: String(parcel.concentrate_assay_batches ?? defs.concentrateAssayBatches),
      });

      setLoading(false);
    }

    load();
  }, [supabase]);

  const target = n(form.target);
  const y = n(form.yield);
  const price = n(form.price);
  const feedRate = n(form.feedstock);
  const transRate = n(form.transport);
  const tollRate = n(form.tolling);
  const feedAssayRate = n(form.feedstockAssayRate);
  const feedAssayBatches = n(form.feedstockAssayBatches);
  const prodAssayRate = n(form.concentrateAssayRate);
  const prodAssayBatches = n(form.concentrateAssayBatches);

  const feedTons = feed(target, y);
  const revenue = target * price;
  const feedCost = feedTons * feedRate;
  const transCost = feedTons * transRate;
  const tollCost = feedTons * tollRate;
  const feedAssayCost = feedAssayRate * feedAssayBatches;
  const prodAssayCost = prodAssayRate * prodAssayBatches;
  const assayCost = feedAssayCost + prodAssayCost;
  const routeCost = feedCost + transCost + tollCost + assayCost;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  function applyDefaults(resource: string, category?: string) {
    const defs = defaultsFor(resource);

    setForm((old) => ({
      ...old,
      category: category || old.category,
      resource,
      material: defs.material,
      yield: defs.yield,
      price: defs.price,
      feedstock: defs.feedstock,
      transport: defs.transport,
      tolling: defs.tolling,
      feedstockAssayRate: defs.feedstockAssayRate,
      feedstockAssayBatches: defs.feedstockAssayBatches,
      concentrateAssayRate: defs.concentrateAssayRate,
      concentrateAssayBatches: defs.concentrateAssayBatches,
    }));
  }

  function setField(key: keyof FormState, value: string) {
    if (key === "category") {
      applyDefaults(RESOURCE_MAP[value]?.[0] || "Other", value);
      return;
    }

    if (key === "resource") {
      applyDefaults(value);
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
      feedstock_tons: feedTons,
      expected_yield_percent: y,
      expected_concentrate_tons: target,
      accepted_tons: target,
      expected_price_per_ton: price,
      feedstock_cost_per_ton: feedRate,
      transport_to_plant_cost_per_ton: transRate,
      tolling_cost_per_ton: tollRate,
      estimated_feedstock_cost: feedCost,
      estimated_transport_cost: transCost,
      estimated_tolling_cost: tollCost,
      feedstock_assay_cost_per_batch: feedAssayRate,
      feedstock_assay_batches: feedAssayBatches,
      estimated_feedstock_assay_cost: feedAssayCost,
      concentrate_assay_cost_per_batch: prodAssayRate,
      concentrate_assay_batches: prodAssayBatches,
      estimated_concentrate_assay_cost: prodAssayCost,
      estimated_total_assay_cost: assayCost,
      estimated_route_cost: routeCost,
      estimated_route_surplus: surplus,
      estimated_route_margin_percent: margin,
      economics_basis:
        "Resource-specific defaults applied from selected resource. Feedstock required calculated automatically from target product tons and expected yield. Feedstock assay and final product assay are separated and included in route cost.",
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
    return <main className="min-h-screen bg-[#050914] px-5 py-28 text-white"><Card label="SAR ResourceOS" title="Loading economics..." /></main>;
  }

  if (error && !parcelId) {
    return <main className="min-h-screen bg-[#050914] px-5 py-28 text-white"><Card label="SAR ResourceOS" title="Economics module error"><p className="mt-3 text-red-200">{error}</p></Card></main>;
  }

  const resourceOptions = RESOURCE_MAP[form.category] || ["Other"];

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Resource Economics Calculator">
          <p className="mt-3 text-sm leading-7 text-slate-300">Resource defaults now change by commodity. You can still override every number manually.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]">Back to Dashboard</Link>
            <Link href="/finance" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300">Finance</Link>
            <Link href="/analytics" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300">Analytics</Link>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Category" value={form.category} />
          <Stat label="Resource" value={form.resource} gold />
          <Stat label="Material" value={form.material} />
          <Stat label="Parcel" value={parcelCode} />
          <Stat label="Target Product Tons" value={tons(target)} />
          <Stat label="Feedstock Required" value={tons(feedTons)} note={`${tons(target)}t ÷ ${pct(y)} yield`} gold />
          <Stat label="Revenue" value={money(revenue)} gold />
          <Stat label="Route Cost" value={money(routeCost)} />
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-3xl border p-5 ${marginClass(margin)}`}>
            <p className="text-xs font-bold uppercase tracking-[0.25em]">Margin Control State</p>
            <p className="mt-3 text-3xl font-black">{marginState(margin)}</p>
            <p className="mt-2 text-sm leading-6">Below 18% = review/block. 18%–25% = target band. Above 25% = strong route.</p>
          </div>
          <Stat label="Route Margin" value={pct(margin)} gold />
          <Stat label="Indicative Surplus" value={money(surplus)} gold />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Input Controls" title="Set resource and economics">
            {!isAdmin ? <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4"><p className="font-black text-red-200">Admin access required</p></div> : null}

            <div className="mt-5 space-y-4">
              <SelectField label="Resource Category" value={form.category} options={Object.keys(RESOURCE_MAP)} onChange={(v) => setField("category", v)} help="Broad commodity class." />
              <SelectField label="Resource / Commodity" value={form.resource} options={resourceOptions} onChange={(v) => setField("resource", v)} help="Changing this applies default assumptions." />
              <SelectField label="Material Type" value={form.material} options={MATERIAL_TYPES} onChange={(v) => setField("material", v)} help="Material form entering or leaving the route." />

              <Field label="Target / Yielded Product Tons" value={form.target} onChange={(v) => setField("target", v)} help="The product tons you want to produce or sell." />
              <Field label="Expected Yield %" value={form.yield} onChange={(v) => setField("yield", v)} help="Default changes by resource. You can override it." />
              <Stat label="Auto Feedstock Required" value={tons(feedTons)} note={`${tons(target)}t ÷ ${pct(y)} yield`} gold />

              <Field label="Selling Price / Product Ton" value={form.price} onChange={(v) => setField("price", v)} help="Default changes by resource. You can override it." />
              <Field label="Feedstock Cost / Feedstock Ton" value={form.feedstock} onChange={(v) => setField("feedstock", v)} help="Cost per required feedstock ton." />
              <Field label="Transport To Plant Cost / Feedstock Ton" value={form.transport} onChange={(v) => setField("transport", v)} help="Transport cost per required feedstock ton." />
              <Field label="Tolling Cost / Feedstock Ton" value={form.tolling} onChange={(v) => setField("tolling", v)} help="Plant tolling or processing cost per required feedstock ton." />

              <Field label="Feedstock Assay Cost / Batch" value={form.feedstockAssayRate} onChange={(v) => setField("feedstockAssayRate", v)} help="ROM, tailings or feedstock assay cost per batch." />
              <Field label="Feedstock Assay Batches" value={form.feedstockAssayBatches} onChange={(v) => setField("feedstockAssayBatches", v)} help="Number of feedstock assay batches." />
              <Field label="Final Product Assay Cost / Batch" value={form.concentrateAssayRate} onChange={(v) => setField("concentrateAssayRate", v)} help="Final product assay cost per batch." />
              <Field label="Final Product Assay Batches" value={form.concentrateAssayBatches} onChange={(v) => setField("concentrateAssayBatches", v)} help="Number of final product assay batches." />

              <button type="button" onClick={save} disabled={!isAdmin || saving} className="w-full rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? "Saving..." : "Save Resource Economics"}
              </button>

              {notice ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">{notice}</p> : null}
              {error ? <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</p> : null}
            </div>
          </Card>

          <Card label="Live Preview" title="Resource-adjusted route result">
            <div className="mt-5 space-y-4">
              <Stat label="Target Product Tons" value={tons(target)} />
              <Stat label="Feedstock Required" value={tons(feedTons)} note={`${tons(target)}t ÷ ${pct(y)} yield`} gold />
              <Stat label="Revenue" value={money(revenue)} note={`${tons(target)}t × ${money(price)}/t`} />
              <Stat label="Feedstock Cost" value={money(feedCost)} />
              <Stat label="Transport Cost" value={money(transCost)} />
              <Stat label="Tolling Cost" value={money(tollCost)} />
              <Stat label="Feedstock Assay Cost" value={money(feedAssayCost)} note={`${money(feedAssayRate)} × ${feedAssayBatches} batches`} />
              <Stat label="Final Product Assay Cost" value={money(prodAssayCost)} note={`${money(prodAssayRate)} × ${prodAssayBatches} batches`} />
              <Stat label="Total Assay Cost" value={money(assayCost)} gold />
              <Stat label="Total Route Cost" value={money(routeCost)} />
              <Stat label="Indicative Surplus" value={money(surplus)} gold />
              <Stat label="Route Margin" value={pct(margin)} gold />
            </div>
          </Card>
        </section>

        <Card label="Control Note" title="Resource assumptions basis">
          <p className="mt-3 text-sm leading-7 text-slate-300">Resource-specific defaults are starter assumptions only. They are not live market prices. Changing resource applies a default yield, price, feedstock cost, transport cost, tolling cost and assay basis. Manual override remains available.</p>
        </Card>
      </div>
    </main>
  );
    }
