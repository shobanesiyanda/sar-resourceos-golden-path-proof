"use client";

import { useEffect, useState } from "react";
import ResourceShell from "./ResourceShell";
import { createClient } from "../lib/supabase/client";

const SEED = "PAR-CHR-2026-0001";

const items = [
  {
    cls: "Hard Commodities",
    cat: "Ferrous Metals",
    res: "Chrome",
    mat: "ROM",
    code: "CHR",
    stage: "raw_feedstock",
    yield: 40,
    price: 2550,
  },
  {
    cls: "Hard Commodities",
    cat: "Energy Minerals",
    res: "Coal",
    mat: "ROM Coal",
    code: "COA",
    stage: "raw_feedstock",
    yield: 70,
    price: 0,
  },
  {
    cls: "Hard Commodities",
    cat: "Precious Metals",
    res: "Gold",
    mat: "Gold Ore",
    code: "GOL",
    stage: "raw_feedstock",
    yield: 3,
    price: 0,
  },
  {
    cls: "Soft Commodities",
    cat: "Grains",
    res: "Maize",
    mat: "White Maize",
    code: "MAI",
    stage: "intermediate_concentrate",
    yield: 100,
    price: 480,
  },
  {
    cls: "Soft Commodities",
    cat: "Agricultural Inputs",
    res: "Fertiliser",
    mat: "Urea",
    code: "FER",
    stage: "intermediate_concentrate",
    yield: 100,
    price: 0,
  },
];

type Form = {
  item: number;
  product: number;
  yieldPct: number;
  marketPrice: number;
  negotiatedPrice: number;
  acquisition: number;
  logistics: number;
  processing: number;
  verification: number;
  note: string;
};

function money(n: number) {
  return `R ${Number(n || 0).toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function stageName(v: string) {
  if (v === "raw_feedstock") return "Raw Feedstock";
  if (v === "intermediate_concentrate") return "Intermediate / Saleable Product";
  if (v === "finished_product") return "Finished Product";
  return "Not captured";
}

function Field({
  label,
  value,
  set,
}: {
  label: string;
  value: number;
  set: (v: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => set(Number(e.target.value || 0))}
        className="mt-3 w-full rounded-3xl border border-slate-800 bg-[#060b16] px-5 py-5 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  gold,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p
        className={
          gold
            ? "mt-3 text-3xl font-black text-[#f5d778]"
            : "mt-3 text-3xl font-black text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}

export default function EconomicsEditTools() {
  const supabase = createClient();

  const [parcelId, setParcelId] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<Form>({
    item: 0,
    product: 250,
    yieldPct: 40,
    marketPrice: 2550,
    negotiatedPrice: 2550,
    acquisition: 0,
    logistics: 0,
    processing: 0,
    verification: 0,
    note: "",
  });

  const selected = items[form.item];
  const parcelCode = `PAR-${selected.code}-2026-0001`;
  const routeQty =
    selected.stage === "raw_feedstock"
      ? form.yieldPct > 0
        ? form.product / (form.yieldPct / 100)
        : 0
      : form.product;

  const price = form.negotiatedPrice || form.marketPrice;
  const revenue = form.product * price;
  const routeCost =
    routeQty * form.acquisition +
    routeQty * form.logistics +
    routeQty * form.processing +
    form.verification;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED)
        .single();

      if (!data) return;

      setParcelId(String(data.id || ""));

      const found = items.find((x) => x.res === data.resource_type) || items[0];

      setForm({
        item: items.indexOf(found),
        product: Number(data.expected_concentrate_tons || data.accepted_tons || 250),
        yieldPct: Number(data.expected_yield_percent || found.yield),
        marketPrice: Number(data.market_reference_price_per_ton || found.price),
        negotiatedPrice: Number(
          data.negotiated_price_per_ton ||
            data.effective_price_per_ton ||
            found.price
        ),
        acquisition: Number(data.feedstock_cost_per_ton || 0),
        logistics: Number(data.transport_to_plant_cost_per_ton || 0),
        processing: Number(data.tolling_cost_per_ton || 0),
        verification: Number(data.estimated_total_assay_cost || 0),
        note: String(data.price_override_note || ""),
      });
    }

    load();
  }, [supabase]);

  async function save() {
    setSaving(true);
    setNotice("");
    setError("");

    if (!parcelId) {
      setError("No parcel record found.");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("parcels")
      .update({
        working_parcel_code: parcelCode,
        commodity_class: selected.cls,
        resource_category: selected.cat,
        resource_type: selected.res,
        material_type: selected.mat,
        material_stage: selected.stage,
        expected_concentrate_tons: form.product,
        feedstock_tons: routeQty,
        expected_yield_percent: form.yieldPct,
        market_reference_price_per_ton: form.marketPrice,
        negotiated_price_per_ton: form.negotiatedPrice,
        effective_price_per_ton: price,
        expected_price_per_ton: price,
        feedstock_cost_per_ton: form.acquisition,
        transport_to_plant_cost_per_ton: form.logistics,
        tolling_cost_per_ton: form.processing,
        price_basis: "market_reference_with_negotiated_override",
        price_override_note: form.note,
      })
      .eq("id", parcelId);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setNotice("Saved.");
    setSaving(false);
  }

  return (
    <ResourceShell
      title="Edit Lead Economics"
      subtitle="Mobile-safe editable economics control."
    >
      <section className="grid gap-4">
        <Stat label="Parcel" value={parcelCode} />
        <Stat label="Class" value={selected.cls} />
        <Stat label="Category" value={selected.cat} />
        <Stat label="Resource" value={selected.res} gold />
        <Stat label="Material" value={selected.mat} />
        <Stat label="Stage" value={stageName(selected.stage)} />
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
          Select Commodity
        </p>

        <select
          value={form.item}
          onChange={(e) => {
            const i = Number(e.target.value);
            const next = items[i];
            setForm((f) => ({
              ...f,
              item: i,
              yieldPct: next.yield,
              marketPrice: next.price,
              negotiatedPrice: next.price,
            }));
          }}
          className="mt-4 w-full rounded-3xl border border-slate-800 bg-[#060b16] px-5 py-5 text-xl font-black text-white"
        >
          {items.map((x, i) => (
            <option key={x.code} value={i}>
              {x.res} - {x.mat}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
          Inputs
        </p>

        <Field label="Product Quantity" value={form.product} set={(v) => setForm({ ...form, product: v })} />
        <Field label="Expected Yield %" value={form.yieldPct} set={(v) => setForm({ ...form, yieldPct: v })} />
        <Field label="Market / Reference Price" value={form.marketPrice} set={(v) => setForm({ ...form, marketPrice: v })} />
        <Field label="Negotiated Price Override" value={form.negotiatedPrice} set={(v) => setForm({ ...form, negotiatedPrice: v })} />
        <Field label="Acquisition Cost / Unit" value={form.acquisition} set={(v) => setForm({ ...form, acquisition: v })} />
        <Field label="Logistics Cost / Unit" value={form.logistics} set={(v) => setForm({ ...form, logistics: v })} />
        <Field label="Processing Cost / Unit" value={form.processing} set={(v) => setForm({ ...form, processing: v })} />
        <Field label="Verification Cost" value={form.verification} set={(v) => setForm({ ...form, verification: v })} />

        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Price note / override reason"
          className="w-full rounded-3xl border border-slate-800 bg-[#060b16] px-5 py-5 text-lg font-bold text-white"
        />

        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="w-full rounded-full bg-[#d7ad32] px-6 py-5 text-lg font-black text-[#07101c]"
        >
          {saving ? "Saving..." : "Save Lead Economics"}
        </button>

        {notice ? <p className="text-emerald-300">{notice}</p> : null}
        {error ? <p className="text-red-300">{error}</p> : null}
      </section>

      <section className="grid gap-4">
        <Stat label="Route Quantity" value={routeQty.toFixed(3)} gold />
        <Stat label="Effective Price" value={`${money(price)}/t`} gold />
        <Stat label="Revenue" value={money(revenue)} />
        <Stat label="Route Cost" value={money(routeCost)} />
        <Stat label="Surplus" value={money(surplus)} gold />
        <Stat label="Margin" value={`${margin.toFixed(1)}%`} gold />
      </section>
    </ResourceShell>
  );
    }
