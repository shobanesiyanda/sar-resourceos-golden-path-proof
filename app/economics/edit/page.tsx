"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import ResourceShell from "../../../components/ResourceShell";
import {
  RESOURCE_MAP,
  defaultsFor,
  materialOptionsFor,
} from "../../../lib/resourceDefaults";
import {
  Card,
  Field,
  FormState,
  SelectField,
  Stat,
  WarningCard,
  feed,
  marginClass,
  marginState,
  money,
  n,
  pct,
  tons,
} from "../../../components/EconomicsBlocks";

const PARCEL_CODE = "PAR-CHR-2026-0001";

export default function EditEconomicsPage() {
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
    material: "ROM",
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
      const resources = RESOURCE_MAP[category] || RESOURCE_MAP["Ferrous Metals"];
      const resource =
        parcel.resource_type && resources.includes(parcel.resource_type)
          ? parcel.resource_type
          : resources[0];

      const materials = materialOptionsFor(resource);
      const defs = defaultsFor(resource);
      const material =
        parcel.material_type && materials.includes(parcel.material_type)
          ? parcel.material_type
          : defs.material;

      const productTons = parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0;

      const startingYield =
        parcel.expected_yield_percent ??
        (parcel.feedstock_tons && parcel.feedstock_tons > 0
          ? (productTons / parcel.feedstock_tons) * 100
          : defs.yield);

      setIsAdmin(profile.role === "admin");
      setParcelId(parcel.id);
      setParcelCode(parcel.parcel_code || PARCEL_CODE);

      setForm({
        category,
        resource,
        material,
        target: String(productTons),
        yield: String(startingYield),
        price: String(parcel.expected_price_per_ton ?? defs.price),
        feedstock: String(parcel.feedstock_cost_per_ton ?? defs.feedstock),
        transport: String(parcel.transport_to_plant_cost_per_ton ?? defs.transport),
        tolling: String(parcel.tolling_cost_per_ton ?? defs.tolling),
        feedstockAssayRate: String(
          parcel.feedstock_assay_cost_per_batch ?? defs.feedstockAssayRate
        ),
        feedstockAssayBatches: String(
          parcel.feedstock_assay_batches ?? defs.feedstockAssayBatches
        ),
        concentrateAssayRate: String(
          parcel.concentrate_assay_cost_per_batch ?? defs.concentrateAssayRate
        ),
        concentrateAssayBatches: String(
          parcel.concentrate_assay_batches ?? defs.concentrateAssayBatches
        ),
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
  const routeCost = feedCost + transCost + tollCost;
  const feedAssayCost = feedAssayRate * feedAssayBatches;
  const prodAssayCost = prodAssayRate * prodAssayBatches;
  const assayCost = feedAssayCost + prodAssayCost;
  const surplus = revenue - routeCost - assayCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  function applyDefaults(resource: string, category?: string) {
    const defs = defaultsFor(resource);
    const materials = materialOptionsFor(resource);

    setForm((old) => ({
      ...old,
      category: category || old.category,
      resource,
      material: materials.includes(defs.material) ? defs.material : materials[0],
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
      indicative_revenue: revenue,
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
        "Editable lead economics updated. Feedstock required is calculated automatically from product tons and yield. Route cost excludes assay; assay is stored separately and deducted from surplus and margin.",
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

    setNotice("Lead economics saved to Supabase.");
    setSaving(false);
  }

  if (loading) {
    return (
      <ResourceShell title="Edit Lead Economics" subtitle="Loading editable economics...">
        <Card label="Loading" title="Reading parcel economics..." />
      </ResourceShell>
    );
  }

  if (error && !parcelId) {
    return (
      <ResourceShell title="Edit Lead Economics" subtitle="Economics module error">
        <Card label="Error" title="Could not load editable economics">
          <p className="mt-3 text-red-200">{error}</p>
        </Card>
      </ResourceShell>
    );
  }

  const resourceOptions = RESOURCE_MAP[form.category] || ["Other"];
  const materialOptions = materialOptionsFor(form.resource);

  return (
    <ResourceShell
      title="Edit Lead Economics"
      subtitle="Editable commercial screening inputs for resource, material type, yield, price, route cost, assay cost, surplus and margin."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcelCode} />
        <Stat label="Resource" value={form.resource} gold />
        <Stat label="Material" value={form.material} />
        <Stat label="Decision" value={marginState(margin)} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Product Tons" value={tons(target)} />
        <Stat
          label="Feedstock Required"
          value={tons(feedTons)}
          note={`${tons(target)}t ÷ ${pct(y)} yield`}
          gold
        />
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
            Route cost excludes assay. Assay is deducted separately from surplus and margin.
          </p>
        </div>

        <Stat label="Route Margin" value={pct(margin)} gold />
        <Stat label="Surplus After Assay" value={money(surplus)} gold />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card label="Input Controls" title="Set resource and economics">
          {!isAdmin ? (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
              <p className="font-black text-red-200">Admin access required</p>
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            <SelectField
              label="Resource Category"
              value={form.category}
              options={Object.keys(RESOURCE_MAP)}
              onChange={(v) => setField("category", v)}
              help="Broad commodity class."
            />

            <SelectField
              label="Resource / Commodity"
              value={form.resource}
              options={resourceOptions}
              onChange={(v) => setField("resource", v)}
              help="Changing this applies resource-specific defaults and material options."
            />

            <SelectField
              label="Material Type"
              value={form.material}
              options={materialOptions}
              onChange={(v) => setField("material", v)}
              help="Material options now change by selected resource."
            />

            <WarningCard
              resource={form.resource}
              material={form.material}
              yieldPercent={form.yield}
              price={form.price}
            />

            <Field
              label="Target / Yielded Product Tons"
              value={form.target}
              onChange={(v) => setField("target", v)}
              help="The product tons you want to produce or sell."
            />

            <Field
              label="Expected Yield %"
              value={form.yield}
              onChange={(v) => setField("yield", v)}
              help="Used to calculate feedstock required automatically."
            />

            <Stat
              label="Auto Feedstock Required"
              value={tons(feedTons)}
              note={`${tons(target)}t ÷ ${pct(y)} yield`}
              gold
            />

            <Field
              label="Selling Price / Product Ton"
              value={form.price}
              onChange={(v) => setField("price", v)}
              help="Buyer price per final product ton."
            />

            <Field
              label="Feedstock Cost / Feedstock Ton"
              value={form.feedstock}
              onChange={(v) => setField("feedstock", v)}
              help="Cost per required feedstock ton."
            />

            <Field
              label="Transport To Plant Cost / Feedstock Ton"
              value={form.transport}
              onChange={(v) => setField("transport", v)}
              help="Transport cost per required feedstock ton."
            />

            <Field
              label="Tolling Cost / Feedstock Ton"
              value={form.tolling}
              onChange={(v) => setField("tolling", v)}
              help="Plant tolling or processing cost per required feedstock ton."
            />

            <Field
              label="Feedstock Assay Cost / Batch"
              value={form.feedstockAssayRate}
              onChange={(v) => setField("feedstockAssayRate", v)}
              help="ROM, ore, tailings or feedstock assay cost per batch."
            />

            <Field
              label="Feedstock Assay Batches"
              value={form.feedstockAssayBatches}
              onChange={(v) => setField("feedstockAssayBatches", v)}
              help="Number of feedstock assay batches."
            />

            <Field
              label="Final Product Assay Cost / Batch"
              value={form.concentrateAssayRate}
              onChange={(v) => setField("concentrateAssayRate", v)}
              help="Final product assay cost per batch."
            />

            <Field
              label="Final Product Assay Batches"
              value={form.concentrateAssayBatches}
              onChange={(v) => setField("concentrateAssayBatches", v)}
              help="Number of final product assay batches."
            />

            <button
              type="button"
              onClick={save}
              disabled={!isAdmin || saving}
              className="w-full rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Lead Economics"}
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

        <Card label="Live Preview" title="Resource-adjusted route result">
          <div className="mt-5 space-y-4">
            <Stat label="Product Tons" value={tons(target)} />
            <Stat
              label="Feedstock Required"
              value={tons(feedTons)}
              note={`${tons(target)}t ÷ ${pct(y)} yield`}
              gold
            />
            <Stat
              label="Revenue"
              value={money(revenue)}
              note={`${tons(target)}t × ${money(price)}/t`}
            />
            <Stat label="Feedstock Cost" value={money(feedCost)} />
            <Stat label="Transport Cost" value={money(transCost)} />
            <Stat label="Tolling Cost" value={money(tollCost)} />
            <Stat label="Route Cost Before Assay" value={money(routeCost)} />
            <Stat
              label="Feedstock Assay Cost"
              value={money(feedAssayCost)}
              note={`${money(feedAssayRate)} × ${feedAssayBatches} batches`}
            />
            <Stat
              label="Final Product Assay Cost"
              value={money(prodAssayCost)}
              note={`${money(prodAssayRate)} × ${prodAssayBatches} batches`}
            />
            <Stat label="Total Assay Cost" value={money(assayCost)} gold />
            <Stat label="Surplus After Assay" value={money(surplus)} gold />
            <Stat label="Route Margin" value={pct(margin)} gold />
          </div>
        </Card>
      </section>

      <Card label="Control Note" title="Editable economics basis">
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This edit page updates the parcel economics source fields. The central
          release gate summary then feeds Dashboard, Lead Economics, Route Builder,
          Operations, Finance and Analytics.
        </p>
      </Card>
    </ResourceShell>
  );
}
