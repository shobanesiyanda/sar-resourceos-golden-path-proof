"use client";

import { useEffect, useMemo, useState } from "react";
import ResourceShell from "./ResourceShell";
import { createClient } from "../lib/supabase/client";

const SEED_CODE = "PAR-CHR-2026-0001";

type CommodityClass = "Hard Commodities" | "Soft Commodities";
type Stage = "raw_feedstock" | "saleable_product" | "finished_product";

type Material = {
  name: string;
  stage: Stage;
  yieldPct: number;
  price: number;
  acquisition: number;
  logistics: number;
  processing: number;
  verification: number;
};

type Resource = {
  cls: CommodityClass;
  category: string;
  resource: string;
  code: string;
  materials: Material[];
};

type FormState = {
  cls: CommodityClass;
  category: string;
  resource: string;
  material: string;
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

const RESOURCES: Resource[] = [
  {
    cls: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Chrome",
    code: "CHR",
    materials: [
      {
        name: "ROM",
        stage: "raw_feedstock",
        yieldPct: 40,
        price: 2550,
        acquisition: 0,
        logistics: 180,
        processing: 350,
        verification: 3500,
      },
      {
        name: "Tailings",
        stage: "raw_feedstock",
        yieldPct: 35,
        price: 2550,
        acquisition: 0,
        logistics: 180,
        processing: 350,
        verification: 3500,
      },
      {
        name: "Concentrate 40/42",
        stage: "saleable_product",
        yieldPct: 100,
        price: 2550,
        acquisition: 0,
        logistics: 180,
        processing: 0,
        verification: 3500,
      },
      {
        name: "Concentrate 42/44",
        stage: "saleable_product",
        yieldPct: 100,
        price: 2800,
        acquisition: 0,
        logistics: 180,
        processing: 0,
        verification: 3500,
      },
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Energy Minerals",
    resource: "Coal",
    code: "COA",
    materials: [
      {
        name: "ROM Coal",
        stage: "raw_feedstock",
        yieldPct: 70,
        price: 0,
        acquisition: 0,
        logistics: 180,
        processing: 0,
        verification: 1200,
      },
      {
        name: "RB1",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 180,
        processing: 0,
        verification: 1200,
      },
      {
        name: "RB2",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 180,
        processing: 0,
        verification: 1200,
      },
      {
        name: "RB3",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 180,
        processing: 0,
        verification: 1200,
      },
    ],
  },
  {
    cls: "Hard Commodities",
    category: "Precious Metals",
    resource: "Gold",
    code: "GOL",
    materials: [
      {
        name: "Gold Ore",
        stage: "raw_feedstock",
        yieldPct: 3,
        price: 0,
        acquisition: 0,
        logistics: 300,
        processing: 0,
        verification: 3500,
      },
      {
        name: "Dore",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 300,
        processing: 0,
        verification: 3500,
      },
      {
        name: "Bullion",
        stage: "finished_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 300,
        processing: 0,
        verification: 3500,
      },
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Grains",
    resource: "Maize",
    code: "MAI",
    materials: [
      {
        name: "White Maize",
        stage: "saleable_product",
        yieldPct: 100,
        price: 500,
        acquisition: 0,
        logistics: 0,
        processing: 0,
        verification: 0,
      },
      {
        name: "Yellow Maize",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 0,
        processing: 0,
        verification: 0,
      },
    ],
  },
  {
    cls: "Soft Commodities",
    category: "Agricultural Inputs",
    resource: "Fertiliser",
    code: "FER",
    materials: [
      {
        name: "Urea",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 0,
        processing: 0,
        verification: 0,
      },
      {
        name: "MAP",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 0,
        processing: 0,
        verification: 0,
      },
      {
        name: "LAN",
        stage: "saleable_product",
        yieldPct: 100,
        price: 0,
        acquisition: 0,
        logistics: 0,
        processing: 0,
        verification: 0,
      },
    ],
  },
];

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function toText(value: unknown, fallback = "") {
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

function stageForDb(stage: Stage) {
  if (stage === "saleable_product") return "intermediate_concentrate";
  return stage;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function firstResourceFor(cls: CommodityClass, category?: string) {
  return (
    RESOURCES.find(
      (item) =>
        item.cls === cls &&
        (!category || item.category === category)
    ) || RESOURCES[0]
  );
}

function findResource(form: FormState) {
  return (
    RESOURCES.find(
      (item) =>
        item.cls === form.cls &&
        item.category === form.category &&
        item.resource === form.resource
    ) || firstResourceFor(form.cls, form.category)
  );
}

function findMaterial(resource: Resource, materialName: string) {
  return (
    resource.materials.find((item) => item.name === materialName) ||
    resource.materials[0]
  );
}

function parcelCode(resource: Resource) {
  return `PAR-${resource.code}-2026-0001`;
}

function decisionLabel(margin: number) {
  if (margin >= 25) return "Strong Route";
  if (margin >= 18) return "Target Range";
  if (margin >= 15) return "Decent / Improve";
  if (margin > 0) return "Below Target";
  return "Blocked / Negative";
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
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-base font-black text-white outline-none focus:border-[#d7ad32]"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
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
        onChange={(event) => onChange(toNumber(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#060b16] px-4 py-3 text-lg font-black text-white outline-none focus:border-[#d7ad32]"
      />
      {help ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {help}
        </p>
      ) : null}
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
    cls: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Chrome",
    material: "ROM",
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

  const resource = findResource(form);
  const material = findMaterial(resource, form.material);
  const workingParcelCode = parcelCode(resource);

  const categories = useMemo(() => {
    return unique(
      RESOURCES.filter((item) => item.cls === form.cls).map(
        (item) => item.category
      )
    );
  }, [form.cls]);

  const resourceOptions = useMemo(() => {
    return RESOURCES.filter(
      (item) =>
        item.cls === form.cls &&
        item.category === form.category
    ).map((item) => item.resource);
  }, [form.cls, form.category]);

  const materialOptions = useMemo(() => {
    return resource.materials.map((item) => item.name);
  }, [resource]);

  const routeQty =
    material.stage === "raw_feedstock" && form.yieldPct > 0
      ? form.productQty / (form.yieldPct / 100)
      : form.productQty;

  const effectivePrice =
    form.negotiatedPrice > 0 ? form.negotiatedPrice : form.marketPrice;

  const revenue = form.productQty * effectivePrice;
  const acquisitionTotal = routeQty * form.acquisitionCost;
  const logisticsTotal = routeQty * form.logisticsCost;
  const processingTotal = routeQty * form.processingCost;
  const routeCost =
    acquisitionTotal +
    logisticsTotal +
    processingTotal +
    form.verificationCost;
  const surplus = revenue - routeCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  const target18Cost = revenue * 0.82;
  const costGapTo18 = Math.max(routeCost - target18Cost, 0);
  const recommendedBuyerPrice =
    margin >= 18 || form.productQty <= 0
      ? effectivePrice
      : Math.ceil(routeCost / (form.productQty * 0.82));
  const recommendedCostReduction = Math.ceil(costGapTo18);
  const recommendedPerRouteUnit =
    routeQty > 0 ? Math.ceil(costGapTo18 / routeQty) : 0;

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_CODE)
        .single();

      if (!data) return;

      const row = data as Record<string, unknown>;

      const rowResource =
        RESOURCES.find(
          (item) =>
            item.resource === row.resource_type &&
            item.materials.some(
              (mat) => mat.name === row.material_type
            )
        ) || RESOURCES[0];

      const rowMaterial =
        rowResource.materials.find(
          (mat) => mat.name === row.material_type
        ) || rowResource.materials[0];

      setParcelId(String(row.id || ""));

      setForm({
        cls: rowResource.cls,
        category: rowResource.category,
        resource: rowResource.resource,
        material: rowMaterial.name,
        productQty: toNumber(
          row.expected_concentrate_tons,
          toNumber(row.accepted_tons, 250)
        ),
        yieldPct: toNumber(
          row.expected_yield_percent,
          rowMaterial.yieldPct
        ),
        marketPrice: toNumber(
          row.market_reference_price_per_ton,
          rowMaterial.price
        ),
        negotiatedPrice: toNumber(
          row.negotiated_price_per_ton,
          toNumber(row.effective_price_per_ton, rowMaterial.price)
        ),
        acquisitionCost: toNumber(
          row.feedstock_cost_per_ton,
          rowMaterial.acquisition
        ),
        logisticsCost: toNumber(
          row.transport_to_plant_cost_per_ton,
          rowMaterial.logistics
        ),
        processingCost: toNumber(
          row.tolling_cost_per_ton,
          rowMaterial.processing
        ),
        verificationCost: toNumber(
          row.estimated_total_assay_cost,
          rowMaterial.verification
        ),
        priceNote: toText(row.price_override_note, ""),
      });
    }

    load();
  }, [supabase]);

  function applyClass(nextClass: string) {
    const nextResource = firstResourceFor(nextClass as CommodityClass);
    const nextMaterial = nextResource.materials[0];

    setForm((current) => ({
      ...current,
      cls: nextResource.cls,
      category: nextResource.category,
      resource: nextResource.resource,
      material: nextMaterial.name,
      yieldPct: nextMaterial.yieldPct,
      marketPrice: nextMaterial.price,
      negotiatedPrice: nextMaterial.price,
      acquisitionCost: nextMaterial.acquisition,
      logisticsCost: nextMaterial.logistics,
      processingCost: nextMaterial.processing,
      verificationCost: nextMaterial.verification,
      priceNote: "",
    }));
  }

  function applyCategory(nextCategory: string) {
    const nextResource = firstResourceFor(form.cls, nextCategory);
    const nextMaterial = nextResource.materials[0];

    setForm((current) => ({
      ...current,
      category: nextResource.category,
      resource: nextResource.resource,
      material: nextMaterial.name,
      yieldPct: nextMaterial.yieldPct,
      marketPrice: nextMaterial.price,
      negotiatedPrice: nextMaterial.price,
      acquisitionCost: nextMaterial.acquisition,
      logisticsCost: nextMaterial.logistics,
      processingCost: nextMaterial.processing,
      verificationCost: nextMaterial.verification,
      priceNote: "",
    }));
  }

  function applyResource(nextResourceName: string) {
    const nextResource =
      RESOURCES.find(
        (item) =>
          item.cls === form.cls &&
          item.category === form.category &&
          item.resource === nextResourceName
      ) || resource;

    const nextMaterial = nextResource.materials[0];

    setForm((current) => ({
      ...current,
      resource: nextResource.resource,
      material: nextMaterial.name,
      yieldPct: nextMaterial.yieldPct,
      marketPrice: nextMaterial.price,
      negotiatedPrice: nextMaterial.price,
      acquisitionCost: nextMaterial.acquisition,
      logisticsCost: nextMaterial.logistics,
      processingCost: nextMaterial.processing,
      verificationCost: nextMaterial.verification,
      priceNote: "",
    }));
  }

  function applyMaterial(nextMaterialName: string) {
    const nextMaterial =
      resource.materials.find(
        (item) => item.name === nextMaterialName
      ) || material;

    setForm((current) => ({
      ...current,
      material: nextMaterial.name,
      yieldPct: nextMaterial.yieldPct,
      marketPrice: nextMaterial.price,
      negotiatedPrice: nextMaterial.price,
      acquisitionCost: nextMaterial.acquisition,
      logisticsCost: nextMaterial.logistics,
      processingCost: nextMaterial.processing,
      verificationCost: nextMaterial.verification,
      priceNote: "",
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
        working_parcel_code: workingParcelCode,
        commodity_class: form.cls,
        resource_category: form.category,
        resource_type: form.resource,
        material_type: form.material,
        material_stage: stageForDb(material.stage),
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
      subtitle="Editable economics with cascading commodity selection and negotiated price override."
    >
      <section className="grid gap-3">
        <Stat label="Parcel" value={workingParcelCode} />
        <Stat label="Class" value={form.cls} />
        <Stat label="Category" value={form.category} />
        <Stat label="Resource" value={form.resource} gold />
        <Stat label="Material" value={form.material} />
        <Stat label="Stage" value={stageLabel(material.stage)} />
      </section>

      <Card label="Commodity Selection" title="Select route material">
        <div className="space-y-3">
          <SelectField
            label="Commodity Class"
            value={form.cls}
            options={["Hard Commodities", "Soft Commodities"]}
            onChange={applyClass}
          />

          <SelectField
            label="Commodity Category"
            value={form.category}
            options={categories}
            onChange={applyCategory}
          />

          <SelectField
            label="Commodity / Resource"
            value={form.resource}
            options={resourceOptions}
            onChange={applyResource}
          />

          <SelectField
            label="Material / Product Type"
            value={form.material}
            options={materialOptions}
            onChange={applyMaterial}
          />
        </div>
      </Card>

      <Card label="Live Result" title="Calculated economics">
        <div className="grid gap-3">
          <Stat
            label={
              material.stage === "raw_feedstock"
                ? "Feedstock Required"
                : "Route Quantity"
            }
            value={routeQty.toFixed(3)}
            gold
          />
          <Stat
            label="Effective Price"
            value={moneyPerTon(effectivePrice)}
            gold
          />
          <Stat label="Revenue" value={money(revenue)} />
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
            value={moneyPerTon(recommendedPerRouteUnit)}
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
