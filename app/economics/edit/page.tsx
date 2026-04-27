"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import ResourceShell from "../../../components/ResourceShell";
import {
  CommodityClass,
  RESOURCE_MAP,
  commodityClassForGroup,
  defaultsFor,
  firstGroupForClass,
  firstResourceForGroup,
  materialDefaultFor,
  materialOptionsFor,
} from "../../../lib/resourceDefaults";
import { Card } from "../../../components/EconomicsBlocks";
import {
  EditForm,
  HeaderStats,
  InputControls,
  LivePreview,
  economicsCalc,
} from "../../../components/EconomicsEditTools";
import {
  parcelCodeNote,
  workingParcelCode,
} from "../../../lib/parcelCode";

const SEED_PARCEL_CODE = "PAR-CHR-2026-0001";

function asString(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function asNumberString(value: unknown, fallback = "0") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeCommodityClass(value: unknown, category: string): CommodityClass {
  if (value === "Soft Commodities") return "Soft Commodities";
  if (value === "Hard Commodities") return "Hard Commodities";
  return commodityClassForGroup(category);
}

export default function EditEconomicsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [parcelId, setParcelId] = useState("");
  const [savedParcelCode, setSavedParcelCode] = useState(SEED_PARCEL_CODE);
  const [storedWorkingParcelCode, setStoredWorkingParcelCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<EditForm>({
    commodityClass: "Hard Commodities",
    category: "Ferrous Metals",
    resource: "Chrome",
    material: "ROM",
    stage: "raw_feedstock",
    target: "",
    yield: "",
    marketPrice: "0",
    negotiatedPrice: "",
    priceBasis: "Manual / Contract",
    overrideNote: "",
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
        .eq("parcel_code", SEED_PARCEL_CODE)
        .single();

      if (parcelError || !parcel) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const category = asString(parcel.resource_category, "Ferrous Metals");
      const commodityClass = safeCommodityClass(parcel.commodity_class, category);

      const resources =
        RESOURCE_MAP[category] || RESOURCE_MAP["Ferrous Metals"];

      const resource =
        parcel.resource_type && resources.includes(parcel.resource_type)
          ? parcel.resource_type
          : resources[0];

      const materials = materialOptionsFor(resource);
      const base = defaultsFor(resource);

      const material =
        parcel.material_type && materials.includes(parcel.material_type)
          ? parcel.material_type
          : base.material;

      const md = materialDefaultFor(resource, material);

      const productTons =
        parcel.expected_concentrate_tons ?? parcel.accepted_tons ?? 0;

      const savedStage =
        parcel.material_stage === "finished_product" ||
        parcel.material_stage === "intermediate_concentrate" ||
        parcel.material_stage === "raw_feedstock"
          ? parcel.material_stage
          : md.stage;

      const savedYield =
        savedStage === "raw_feedstock"
          ? asNumberString(parcel.expected_yield_percent, md.yield)
          : "100";

      const marketPrice = asNumberString(
        parcel.market_reference_price_per_ton,
        asNumberString(parcel.expected_price_per_ton, md.price)
      );

      const negotiatedPrice = asNumberString(
        parcel.negotiated_price_per_ton,
        asNumberString(parcel.expected_price_per_ton, "")
      );

      setIsAdmin(profile.role === "admin");
      setParcelId(parcel.id);
      setSavedParcelCode(parcel.parcel_code || SEED_PARCEL_CODE);
      setStoredWorkingParcelCode(asString(parcel.working_parcel_code, ""));

      setForm({
        commodityClass,
        category,
        resource,
        material,
        stage: savedStage,
        target: String(productTons),
        yield: savedYield,
        marketPrice,
        negotiatedPrice,
        priceBasis: asString(
          parcel.price_basis,
          "Buyer PO / Contract / Manual Negotiation"
        ),
        overrideNote: asString(
          parcel.price_override_note,
          parcel.economics_basis ||
            "Effective selling price uses negotiated price if entered, otherwise market/reference price."
        ),
        feedstock: asNumberString(
          parcel.feedstock_cost_per_ton,
          md.feedstock
        ),
        transport: asNumberString(
          parcel.transport_to_plant_cost_per_ton,
          md.transport
        ),
        tolling: asNumberString(
          parcel.tolling_cost_per_ton,
          md.tolling
        ),
        feedstockAssayRate: asNumberString(
          parcel.feedstock_assay_cost_per_batch,
          md.feedstockAssayRate
        ),
        feedstockAssayBatches: asNumberString(
          parcel.feedstock_assay_batches,
          md.feedstockAssayBatches
        ),
        concentrateAssayRate: asNumberString(
          parcel.concentrate_assay_cost_per_batch,
          md.concentrateAssayRate
        ),
        concentrateAssayBatches: asNumberString(
          parcel.concentrate_assay_batches,
          md.concentrateAssayBatches
        ),
      });

      setLoading(false);
    }

    load();
  }, [supabase]);

  function applyResourceDefaults(
    resource: string,
    category?: string,
    commodityClass?: CommodityClass
  ) {
    const base = defaultsFor(resource);
    const materials = materialOptionsFor(resource);
    const material = materials.includes(base.material)
      ? base.material
      : materials[0];

    const md = materialDefaultFor(resource, material);

    setForm((old) => ({
      ...old,
      commodityClass: commodityClass || old.commodityClass,
      category: category || old.category,
      resource,
      material,
      stage: md.stage,
      yield: md.yield,
      marketPrice: md.price,
      negotiatedPrice: "",
      priceBasis: md.priceBasis,
      overrideNote: "",
      feedstock: md.feedstock,
      transport: md.transport,
      tolling: md.tolling,
      feedstockAssayRate: md.feedstockAssayRate,
      feedstockAssayBatches: md.feedstockAssayBatches,
      concentrateAssayRate: md.concentrateAssayRate,
      concentrateAssayBatches: md.concentrateAssayBatches,
    }));
  }

  function applyMaterialDefaults(material: string) {
    const md = materialDefaultFor(form.resource, material);

    setForm((old) => ({
      ...old,
      material,
      stage: md.stage,
      yield: md.yield,
      marketPrice: md.price,
      negotiatedPrice: "",
      priceBasis: md.priceBasis,
      overrideNote: "",
      feedstock: md.feedstock,
      transport: md.transport,
      tolling: md.tolling,
      feedstockAssayRate: md.feedstockAssayRate,
      feedstockAssayBatches: md.feedstockAssayBatches,
      concentrateAssayRate: md.concentrateAssayRate,
      concentrateAssayBatches: md.concentrateAssayBatches,
    }));
  }

  function setField(key: keyof EditForm, value: string) {
    if (key === "commodityClass") {
      const nextClass =
        value === "Soft Commodities"
          ? "Soft Commodities"
          : "Hard Commodities";

      const nextGroup = firstGroupForClass(nextClass);
      const nextResource = firstResourceForGroup(nextGroup);

      applyResourceDefaults(nextResource, nextGroup, nextClass);
      return;
    }

    if (key === "category") {
      const nextResource = firstResourceForGroup(value);
      applyResourceDefaults(nextResource, value);
      return;
    }

    if (key === "resource") {
      applyResourceDefaults(value);
      return;
    }

    if (key === "material") {
      applyMaterialDefaults(value);
      return;
    }

    setForm((old) => ({ ...old, [key]: value }));
  }

  async function save() {
    if (!parcelId) return;

    setSaving(true);
    setNotice("");
    setError("");

    const c = economicsCalc(form);
    const workingCode = workingParcelCode(form.resource);

    const payload = {
      commodity_class: form.commodityClass,
      material_stage: form.stage,
      working_parcel_code: workingCode,

      market_reference_price_per_ton: Number(form.marketPrice || 0),
      negotiated_price_per_ton: Number(form.negotiatedPrice || 0),
      effective_price_per_ton: c.effectivePrice,
      price_basis: form.priceBasis,
      price_override_note: form.overrideNote,

      resource_category: form.category,
      resource_type: form.resource,
      material_type: form.material,
      commodity: form.resource,

      feedstock_tons: c.feedTons,
      expected_yield_percent: c.y,
      expected_concentrate_tons: c.target,
      accepted_tons: c.target,
      expected_price_per_ton: c.effectivePrice,

      feedstock_cost_per_ton: c.feedRate,
      transport_to_plant_cost_per_ton: c.transRate,
      tolling_cost_per_ton: c.tollRate,

      estimated_feedstock_cost: c.feedCost,
      estimated_transport_cost: c.transCost,
      estimated_tolling_cost: c.tollCost,

      feedstock_assay_cost_per_batch: c.feedAssayRate,
      feedstock_assay_batches: c.feedAssayBatches,
      estimated_feedstock_assay_cost: c.feedAssayCost,

      concentrate_assay_cost_per_batch: c.prodAssayRate,
      concentrate_assay_batches: c.prodAssayBatches,
      estimated_concentrate_assay_cost: c.prodAssayCost,

      estimated_total_assay_cost: c.assayCost,
      estimated_route_cost: c.routeCost,
      estimated_route_surplus: c.surplus,
      estimated_route_margin_percent: c.margin,

      economics_basis: [
        `Working parcel code: ${workingCode}.`,
        `Saved seed parcel code: ${savedParcelCode}.`,
        `Commodity class: ${form.commodityClass}.`,
        `Commodity group: ${form.category}.`,
        `Material stage: ${form.stage}.`,
        `Price basis: ${form.priceBasis}.`,
        `Market/reference price: ${form.marketPrice}.`,
        `Negotiated price: ${form.negotiatedPrice}.`,
        `Effective selling price: ${c.effectivePrice}.`,
        form.overrideNote ? `Note: ${form.overrideNote}` : "",
        "Market/reference prices are indicative until verified against buyer PO, contract, grade, quality, delivery basis and payment terms.",
      ]
        .filter(Boolean)
        .join(" "),
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

    setStoredWorkingParcelCode(workingCode);
    setNotice("Lead economics and structured price-basis fields saved.");
    setSaving(false);
  }

  if (loading) {
    return (
      <ResourceShell
        title="Edit Lead Economics"
        subtitle="Loading editable economics..."
      >
        <Card label="Loading" title="Reading parcel economics..." />
      </ResourceShell>
    );
  }

  if (error && !parcelId) {
    return (
      <ResourceShell
        title="Edit Lead Economics"
        subtitle="Economics module error"
      >
        <Card label="Error" title="Could not load editable economics">
          <p className="mt-3 text-red-200">{error}</p>
        </Card>
      </ResourceShell>
    );
  }

  const resourceOptions = RESOURCE_MAP[form.category] || ["Other"];
  const materialOptions = materialOptionsFor(form.resource);
  const displayedParcelCode = workingParcelCode(form.resource);
  const displayedParcelNote = parcelCodeNote(
    savedParcelCode,
    displayedParcelCode
  );

  return (
    <ResourceShell
      title="Edit Lead Economics"
      subtitle="Editable economics with structured price-basis persistence, material-stage logic and commodity-specific working parcel code."
    >
      <HeaderStats parcelCode={displayedParcelCode} form={form} />

      <section className="grid gap-6 xl:grid-cols-2">
        <InputControls
          form={form}
          isAdmin={isAdmin}
          saving={saving}
          notice={notice}
          error={error}
          resourceOptions={resourceOptions}
          materialOptions={materialOptions}
          setField={setField}
          save={save}
        />

        <LivePreview form={form} />
      </section>

      <Card
        label="Structured Persistence"
        title="Price basis and parcel code now save as real fields"
      >
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f5d778]">
              Displayed Working Code
            </p>
            <p className="mt-2 text-3xl font-black">
              {displayedParcelCode}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {displayedParcelNote}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-950/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Last Stored Working Code
            </p>
            <p className="mt-2 text-2xl font-black">
              {storedWorkingParcelCode || "Not saved yet"}
            </p>
          </div>

          <p className="text-sm leading-7 text-slate-300">
            This build stores commodity class, material stage, working parcel
            code, market/reference price, negotiated price, effective price,
            price basis and override note as structured Supabase fields. The
            original seed parcel code remains unchanged until the full parcel
            code engine is added across all modules.
          </p>
        </div>
      </Card>

      <Card
        label="Control Note"
        title="Commodity taxonomy and product wording locked"
      >
        <p className="mt-3 text-sm leading-7 text-slate-300">
          The economics engine starts with Hard Commodities and Soft
          Commodities, then narrows into commodity group, commodity/resource,
          material/product type and material stage. Raw materials use yield
          recovery. Saleable and finished products use 100% route basis.
          Effective selling price uses negotiated price when entered, otherwise
          market/reference price.
        </p>
      </Card>
    </ResourceShell>
  );
  }
