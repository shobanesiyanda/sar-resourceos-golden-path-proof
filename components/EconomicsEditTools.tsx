"use client";

import { useEffect, useMemo, useState } from "react";
import ResourceShell from "./ResourceShell";
import { createClient } from "../lib/supabase/client";

const SEED_CODE = "PAR-CHR-2026-0001";

type Stage = "raw_feedstock" | "saleable_product" | "finished_product";

type Item = {
  className: "Hard Commodities" | "Soft Commodities";
  group: string;
  resource: string;
  material: string;
  code: string;
  stage: Stage;
  defaultYield: number;
  defaultPrice: number;
  defaultAcquisition: number;
  defaultLogistics: number;
  defaultProcessing: number;
  defaultVerification: number;
};

type FormState = {
  itemIndex: number;
  productQty: number;
  yieldPct: number;
  marketPrice: number;
  negotiatedPrice: number;
  acquisitionCost: number;
  logisticsCost: number;
  processingCost: number;
  verificationCost: number;
  priceNote: string;
};

const ITEMS: Item[] = [
  {
    className: "Hard Commodities",
    group: "Ferrous Metals",
    resource: "Chrome",
    material: "ROM",
    code: "CHR",
    stage: "raw_feedstock",
    defaultYield: 40,
    defaultPrice: 2550,
    defaultAcquisition: 0,
    defaultLogistics: 180,
    defaultProcessing: 350,
    defaultVerification: 3500,
  },
  {
    className: "Hard Commodities",
    group: "Ferrous Metals",
    resource: "Chrome",
    material: "Tailings",
    code: "CHR",
    stage: "raw_feedstock",
    defaultYield: 35,
    defaultPrice: 2550,
    defaultAcquisition: 0,
    defaultLogistics: 180,
    defaultProcessing: 350,
    defaultVerification: 3500,
  },
  {
    className: "Hard Commodities",
    group: "Ferrous Metals",
    resource: "Chrome",
    material: "Concentrate 40/42",
    code: "CHR",
    stage: "saleable_product",
    defaultYield: 100,
    defaultPrice: 2550,
    defaultAcquisition: 0,
    defaultLogistics: 180,
    defaultProcessing: 0,
    defaultVerification: 3500,
  },
  {
    className: "Hard Commodities",
    group: "Energy Minerals",
    resource: "Coal",
    material: "ROM Coal",
    code: "COA",
    stage: "raw_feedstock",
    defaultYield: 70,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 180,
    defaultProcessing: 0,
    defaultVerification: 1200,
  },
  {
    className: "Hard Commodities",
    group: "Energy Minerals",
    resource: "Coal",
    material: "RB1",
    code: "COA",
    stage: "saleable_product",
    defaultYield: 100,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 180,
    defaultProcessing: 0,
    defaultVerification: 1200,
  },
  {
    className: "Hard Commodities",
    group: "Precious Metals",
    resource: "Gold",
    material: "Gold Ore",
    code: "GOL",
    stage: "raw_feedstock",
    defaultYield: 3,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 300,
    defaultProcessing: 0,
    defaultVerification: 3500,
  },
  {
    className: "Hard Commodities",
    group: "Precious Metals",
    resource: "Gold",
    material: "Dore",
    code: "GOL",
    stage: "saleable_product",
    defaultYield: 100,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 300,
    defaultProcessing: 0,
    defaultVerification: 3500,
  },
  {
    className: "Hard Commodities",
    group: "Precious Metals",
    resource: "Gold",
    material: "Bullion",
    code: "GOL",
    stage: "finished_product",
    defaultYield: 100,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 300,
    defaultProcessing: 0,
    defaultVerification: 3500,
  },
  {
    className: "Soft Commodities",
    group: "Grains",
    resource: "Maize",
    material: "White Maize",
    code: "MAI",
    stage: "saleable_product",
    defaultYield: 100,
    defaultPrice: 500,
    defaultAcquisition: 0,
    defaultLogistics: 0,
    defaultProcessing: 0,
    defaultVerification: 0,
  },
  {
    className: "Soft Commodities",
    group: "Grains",
    resource: "Maize",
    material: "Yellow Maize",
    code: "MAI",
    stage: "saleable_product",
    defaultYield: 100,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 0,
    defaultProcessing: 0,
    defaultVerification: 0,
  },
  {
    className: "Soft Commodities",
    group: "Agricultural Inputs",
    resource: "Fertiliser",
    material: "Urea",
    code: "FER",
    stage: "saleable_product",
    defaultYield: 100,
    defaultPrice: 0,
    defaultAcquisition: 0,
    defaultLogistics: 0,
    defaultProcessing: 0,
    defaultVerification: 0,
  },
];

function n(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function s(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function moneyPerTon(value: number) {
  return `${money(value)}/t`;
}

function stageLabel(stage: Stage) {
  if (stage === "raw_feedstock") return "Raw Feedstock";
  if (stage === "saleable_product") return "Intermediate / Saleable Product";
  return "Finished Product";
}

function decisionLabel(margin: number) {
  if (margin >= 25) return "Strong Route";
  if (margin >= 18) return "Target Range";
  if (margin >= 15) return "Decent / Improve";
  if (margin > 0) return "Below Target";
  return "Blocked / Negative";
}

function fullCode(item: Item) {
  return `PAR-${item.code}-2026-0001`;
}

function compactStageForDb(stage: Stage) {
  if (stage === "saleable_product") return "intermediate_concentrate";
  return stage;
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
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">
        {title}
      </h2>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  gold,
}: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p
        className={
          gold
            ? "mt-2 text-xl font-black text-[#f5d778]"
            : "mt-2 text-xl font-black text-white"
        }
      >
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
      ) : null}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={String(value)}
        onChange={(event) => onChange(n(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-lg font-black text-white outline-none focus:border-[#d7ad32]"
      />
      {help ? <p className="mt-2 text-sm leading-6 text-slate-400">{help}</p> : null}
    </div>
  );
}

export default function EconomicsEditTools() {
  const supabase = createClient();

  const [parcelId, setParcelId] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    itemIndex: 0,
    productQty: 250,
    yieldPct: 40,
    marketPrice: 2550,
    negotiatedPrice: 2550,
    acquisitionCost: 0,
    logisticsCost: 180,
    processingCost: 350,
    verificationCost: 3500,
    priceNote: "",
  });

  const item = ITEMS[form.itemIndex] || ITEMS[0];

  const routeQty =
    item.stage === "raw_feedstock" && form.yieldPct > 0
      ? form.productQty / (form.yieldPct / 100)
      : form.productQty;

  const effectivePrice =
    form.negotiatedPrice > 0 ? form.negotiatedPrice : form.marketPrice;

  const revenue = form.productQty * effectivePrice;
  const acquisitionTotal = routeQty * form.acquisitionCost;
  const logisticsTotal = routeQty * form.logisticsCost;
  const processingTotal = routeQty * form.processingCost;
  const routeCost =
    acquisitionTotal + logisticsTotal + processingTotal + form.verificationCost;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  const target18Surplus = revenue * 0.18;
  const target18Cost = Math.max(revenue - target18Surplus, 0);
  const costGapTo18 = Math.max(routeCost - target18Cost, 0);
  const targetPrice18 =
    form.productQty > 0 ? routeCost / (form.productQty * 0.82) : 0;

  const recommendedBuyerPrice =
    margin >= 18 ? effectivePrice : Math.ceil(targetPrice18);

  const recommendedCostReduction = Math.ceil(costGapTo18);
  const recommendedPerRouteTon =
    routeQty > 0 ? Math.ceil(costGapTo18 / routeQty) : 0;

  const parcelCode = fullCode(item);

  const groupedOptions = useMemo(() => {
    return ITEMS.map((x, index) => ({
      index,
      label: `${x.className} / ${x.group} / ${x.resource} - ${x.material}`,
    }));
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_CODE)
        .single();

      if (!data) return;

      const foundIndex = ITEMS.findIndex(
        (x) =>
          x.resource === data.resource_type &&
          x.material === data.material_type
      );

      const nextIndex = foundIndex >= 0 ? foundIndex : 0;
      const nextItem = ITEMS[nextIndex];

      setParcelId(String(data.id || ""));

      setForm({
        itemIndex: nextIndex,
        productQty: n(data.expected_concentrate_tons, n(data.accepted_tons, 250)),
        yieldPct: n(data.expected_yield_percent, nextItem.defaultYield),
        marketPrice: n(data.market_reference_price_per_ton, nextItem.defaultPrice),
        negotiatedPrice: n(
          data.negotiated_price_per_ton,
          n(data.effective_price_per_ton, nextItem.defaultPrice)
        ),
        acquisitionCost: n(data.feedstock_cost_per_ton, nextItem.defaultAcquisition),
        logisticsCost: n(
          data.transport_to_plant_cost_per_ton,
          nextItem.defaultLogistics
        ),
        processingCost: n(data.tolling_cost_per_ton, nextItem.defaultProcessing),
        verificationCost: n(
          data.estimated_total_assay_cost,
          nextItem.defaultVerification
        ),
        priceNote: s(data.price_override_note, ""),
      });
    }

    load();
  }, [supabase]);

  function changeItem(index: number) {
    const next = ITEMS[index] || ITEMS[0];

    setForm((current) => ({
      ...current,
      itemIndex: index,
      yieldPct: next.defaultYield,
      marketPrice: next.defaultPrice,
      negotiatedPrice: next.defaultPrice,
      acquisitionCost: next.defaultAcquisition,
      logisticsCost: next.defaultLogistics,
      processingCost: next.defaultProcessing,
      verificationCost: next.defaultVerification,
    }));
  }

  async function save() {
    setSaving(true);
    setNotice("");
    setError("");

    if (!parcelId) {
      setError("No active parcel record found.");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("parcels")
      .update({
        working_parcel_code: parcelCode,
        commodity_class: item.className,
        resource_category: item.group,
        resource_type: item.resource,
        material_type: item.material,
        material_stage: compactStageForDb(item.stage),
        expected_concentrate_tons: form.productQty,
        feedstock_tons: routeQty,
        expected_yield_percent: form.yieldPct,
        market_reference_price_per_ton: form.marketPrice,
        negotiated_price_per_ton: form.negotiatedPrice,
        effective_price_per_ton: effectivePrice,
        expected_price_per_ton: effectivePrice,
        feedstock_cost_per_ton: form.acquisitionCost,
        transport_to_plant_cost_per_ton: form.logisticsCost,
        tolling_cost_per_ton: form.processingCost,
        price_basis: "market_reference_with_negotiated_override",
        price_override_note: form.priceNote,
      })
      .eq("id", parcelId);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setNotice("Lead economics saved.");
    setSaving(false);
  }

  return (
    <ResourceShell
      title="Edit Lead Economics"
      subtitle="Editable economics with commodity-specific parcel code, market price and negotiated price override."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={parcelCode} />
        <Stat label="Class" value={item.className} />
        <Stat label="Category" value={item.group} />
        <Stat label="Resource" value={item.resource} gold />
        <Stat label="Material" value={item.material} />
        <Stat label="Stage" value={stageLabel(item.stage)} />
      </section>

      <Card label="Select Commodity" title="Commodity and product">
        <select
          value={form.itemIndex}
          onChange={(event) => changeItem(n(event.target.value))}
          className="w-full rounded-2xl border border-slate-700 bg-[#060b16] px-4 py-3 text-base font-black text-white outline-none focus:border-[#d7ad32]"
        >
          {groupedOptions.map((option) => (
            <option key={option.index} value={option.index}>
              {option.label}
            </option>
          ))}
        </select>
      </Card>

      <Card label="Inputs" title="Route economics">
        <div className="space-y-3">
          <NumField
            label="Product Quantity"
            value={form.productQty}
            onChange={(value) => setForm({ ...form, productQty: value })}
          />
          <NumField
            label="Expected Yield %"
            value={form.yieldPct}
            onChange={(value) => setForm({ ...form, yieldPct: value })}
            help={
              item.stage === "raw_feedstock"
                ? "Used to calculate feedstock required."
                : "Saleable product uses 100% basis."
            }
          />
          <NumField
            label="Market / Reference Price"
            value={form.marketPrice}
            onChange={(value) => setForm({ ...form, marketPrice: value })}
            help="Future live market feed value. Editable for now."
          />
          <NumField
            label="Negotiated Buyer Price"
            value={form.negotiatedPrice}
            onChange={(value) => setForm({ ...form, negotiatedPrice: value })}
            help="Buyer price override used as effective selling price."
          />
          <NumField
            label="Acquisition Cost / Unit"
            value={form.acquisitionCost}
            onChange={(value) => setForm({ ...form, acquisitionCost: value })}
          />
          <NumField
            label="Logistics / Handling Cost / Unit"
            value={form.logisticsCost}
            onChange={(value) => setForm({ ...form, logisticsCost: value })}
          />
          <NumField
            label="Processing / Tolling Cost / Unit"
            value={form.processingCost}
            onChange={(value) => setForm({ ...form, processingCost: value })}
          />
          <NumField
            label="Verification / Quality Cost"
            value={form.verificationCost}
            onChange={(value) => setForm({ ...form, verificationCost: value })}
          />

          <textarea
            value={form.priceNote}
            onChange={(event) =>
              setForm({ ...form, priceNote: event.target.value })
            }
            placeholder="Price note or override reason"
            className="w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-sm font-bold leading-6 text-white outline-none focus:border-[#d7ad32]"
          />

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Lead Economics"}
          </button>

          {notice ? (
            <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-black text-emerald-200">
              {notice}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-black text-red-200">
              {error}
            </p>
          ) : null}
        </div>
      </Card>

      <Card label="Live Result" title="Calculated economics">
        <div className="grid gap-3">
          <Stat
            label={item.stage === "raw_feedstock" ? "Feedstock Required" : "Route Quantity"}
            value={routeQty.toFixed(3)}
            gold
          />
          <Stat label="Effective Price" value={moneyPerTon(effectivePrice)} gold />
          <Stat label="Revenue" value={money(revenue)} />
          <Stat label="Acquisition Total" value={money(acquisitionTotal)} />
          <Stat label="Logistics Total" value={money(logisticsTotal)} />
          <Stat label="Processing Total" value={money(processingTotal)} />
          <Stat label="Verification Cost" value={money(form.verificationCost)} />
          <Stat label="Route Cost" value={money(routeCost)} />
          <Stat label="Surplus" value={money(surplus)} gold />
          <Stat label="Margin" value={`${margin.toFixed(1)}%`} gold />
          <Stat label="Decision" value={decisionLabel(margin)} />
        </div>
      </Card>

      <Card label="Recommendations" title="Indicative improvement targets">
        <div className="grid gap-3">
          <Stat
            label="Target Buyer Price"
            value={moneyPerTon(recommendedBuyerPrice)}
            note="Indicative price needed to move toward an 18% gross margin."
            gold
          />
          <Stat
            label="Total Cost Reduction Needed"
            value={money(recommendedCostReduction)}
            note="Estimated reduction needed across acquisition, logistics, processing or verification costs."
          />
          <Stat
            label="Cost Reduction / Route Unit"
            value={moneyPerTon(recommendedPerRouteTon)}
            note="Indicative saving required per route ton or product unit."
          />
          <Stat
            label="Commercial Actions"
            value="Negotiate price, cost or charges"
            note="Reduce acquisition cost, reduce logistics, reduce processing/tolling, push buyer price, or move verification/handling charges to plant or buyer side."
          />
        </div>
      </Card>
    </ResourceShell>
  );
  }
