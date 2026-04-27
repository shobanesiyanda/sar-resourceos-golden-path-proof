import {
  Card,
  Field,
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
} from "./EconomicsBlocks";
import {
  RESOURCE_MAP,
  stageLabel,
  MaterialStage,
} from "../lib/resourceDefaults";

export type EditForm = {
  category: string;
  resource: string;
  material: string;
  stage: MaterialStage;
  target: string;
  yield: string;
  marketPrice: string;
  negotiatedPrice: string;
  priceBasis: string;
  overrideNote: string;
  feedstock: string;
  transport: string;
  tolling: string;
  feedstockAssayRate: string;
  feedstockAssayBatches: string;
  concentrateAssayRate: string;
  concentrateAssayBatches: string;
};

function stageWords(stage: MaterialStage) {
  if (stage === "finished_product") {
    return {
      feedstockCostLabel: "Acquisition Cost / Product Ton",
      feedstockCostHelp:
        "Purchase or acquisition cost per finished product ton. Use 0 only if acquisition cost is handled outside this route model.",
      transportLabel: "Transport / Security / Handling Cost / Product Ton",
      transportHelp:
        "Transport, security, handling, custody or delivery cost per finished product ton.",
      tollingLabel: "Refining / Processing Cost / Product Ton",
      tollingHelp:
        "Refining, processing or conversion cost per finished product ton. Use 0 if no further processing applies.",
      feedstockAssayLabel: "Source / Ownership Verification Cost / Batch",
      feedstockAssayHelp:
        "Verification, source-of-funds, ownership, custody or authentication cost per batch.",
      finalAssayLabel: "Final Assay / Purity Verification Cost / Batch",
      finalAssayHelp:
        "Final assay, purity, certificate, refinery, verification or quality confirmation cost per batch.",
      routeCostLabel: "Product Route Cost Before Verification",
      feedstockCostPreview: "Acquisition Cost",
      transportPreview: "Transport / Security / Handling",
      tollingPreview: "Refining / Processing",
      feedstockAssayPreview: "Source Verification Cost",
      finalAssayPreview: "Final Purity Verification Cost",
      feedstockRequiredNote: "Finished product basis = product tons",
    };
  }

  if (stage === "intermediate_concentrate") {
    return {
      feedstockCostLabel: "Product Acquisition Cost / Product Ton",
      feedstockCostHelp:
        "Acquisition cost per saleable intermediate product ton. Use 0 if cost is handled outside this model.",
      transportLabel: "Transport / Handling Cost / Product Ton",
      transportHelp:
        "Transport, loading, handling or delivery cost per saleable product ton.",
      tollingLabel: "Additional Processing Cost / Product Ton",
      tollingHelp:
        "Additional processing, upgrade or blending cost per product ton. Use 0 if already saleable.",
      feedstockAssayLabel: "Source / Product Verification Cost / Batch",
      feedstockAssayHelp:
        "Source, grade or product verification cost per batch.",
      finalAssayLabel: "Final Product Assay Cost / Batch",
      finalAssayHelp:
        "Final product assay or quality confirmation cost per batch.",
      routeCostLabel: "Product Route Cost Before Assay",
      feedstockCostPreview: "Product Acquisition Cost",
      transportPreview: "Transport / Handling Cost",
      tollingPreview: "Additional Processing Cost",
      feedstockAssayPreview: "Source / Product Verification Cost",
      finalAssayPreview: "Final Product Assay Cost",
      feedstockRequiredNote: "Saleable product basis = product tons",
    };
  }

  return {
    feedstockCostLabel: "Feedstock Cost / Feedstock Ton",
    feedstockCostHelp: "Cost per required feedstock ton.",
    transportLabel: "Transport To Plant Cost / Feedstock Ton",
    transportHelp: "Transport cost per required feedstock ton.",
    tollingLabel: "Tolling Cost / Feedstock Ton",
    tollingHelp: "Plant tolling or processing cost per required feedstock ton.",
    feedstockAssayLabel: "Feedstock Assay Cost / Batch",
    feedstockAssayHelp: "ROM, ore, tailings or feedstock assay cost per batch.",
    finalAssayLabel: "Final Product Assay Cost / Batch",
    finalAssayHelp: "Final product assay, verification or quality cost per batch.",
    routeCostLabel: "Route Cost Before Assay",
    feedstockCostPreview: "Feedstock Cost",
    transportPreview: "Transport Cost",
    tollingPreview: "Tolling Cost",
    feedstockAssayPreview: "Feedstock Assay Cost",
    finalAssayPreview: "Final Product Assay Cost",
    feedstockRequiredNote: "Raw feedstock uses yield recovery",
  };
}

export function priceEffective(marketPrice: string, negotiatedPrice: string) {
  const negotiated = n(negotiatedPrice);
  const market = n(marketPrice);
  return negotiated > 0 ? negotiated : market;
}

export function economicsCalc(form: EditForm) {
  const target = n(form.target);
  const y = n(form.yield);
  const effectivePrice = priceEffective(form.marketPrice, form.negotiatedPrice);

  const feedTons =
    form.stage === "raw_feedstock" ? feed(target, y) : target;

  const feedRate = n(form.feedstock);
  const transRate = n(form.transport);
  const tollRate = n(form.tolling);
  const feedAssayRate = n(form.feedstockAssayRate);
  const feedAssayBatches = n(form.feedstockAssayBatches);
  const prodAssayRate = n(form.concentrateAssayRate);
  const prodAssayBatches = n(form.concentrateAssayBatches);

  const revenue = target * effectivePrice;
  const feedCost = feedTons * feedRate;
  const transCost = feedTons * transRate;
  const tollCost = feedTons * tollRate;
  const routeCost = feedCost + transCost + tollCost;
  const feedAssayCost = feedAssayRate * feedAssayBatches;
  const prodAssayCost = prodAssayRate * prodAssayBatches;
  const assayCost = feedAssayCost + prodAssayCost;
  const surplus = revenue - routeCost - assayCost;
  const margin = revenue > 0 ? (surplus / revenue) * 100 : 0;

  return {
    target,
    y,
    effectivePrice,
    feedTons,
    feedRate,
    transRate,
    tollRate,
    feedAssayRate,
    feedAssayBatches,
    prodAssayRate,
    prodAssayBatches,
    revenue,
    feedCost,
    transCost,
    tollCost,
    routeCost,
    feedAssayCost,
    prodAssayCost,
    assayCost,
    surplus,
    margin,
  };
}

export function StageNotice({ form }: { form: EditForm }) {
  return (
    <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f5d778]">
        Material Stage
      </p>
      <p className="mt-2 text-2xl font-black">
        {stageLabel(form.stage)}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {form.stage === "raw_feedstock"
          ? "Raw feedstock uses product tons divided by yield."
          : "Intermediate and finished products use 100% basis: product tons equal route tons."}
      </p>
    </div>
  );
}

export function PricingWarning() {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
      <p className="font-black text-red-200">
        Pricing control warning
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Market/reference prices are indicative until verified against buyer PO,
        contract, grade, delivery basis, assay terms and payment terms.
      </p>
    </div>
  );
}

export function HeaderStats({
  parcelCode,
  form,
}: {
  parcelCode: string;
  form: EditForm;
}) {
  const c = economicsCalc(form);
  const words = stageWords(form.stage);

  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcelCode} />
        <Stat label="Resource" value={form.resource} gold />
        <Stat label="Material" value={form.material} />
        <Stat label="Stage" value={stageLabel(form.stage)} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Product Tons" value={tons(c.target)} />
        <Stat
          label={
            form.stage === "raw_feedstock"
              ? "Feedstock Required"
              : "Route Product Tons"
          }
          value={tons(c.feedTons)}
          note={
            form.stage === "raw_feedstock"
              ? `${tons(c.target)}t ÷ ${pct(c.y)} yield`
              : words.feedstockRequiredNote
          }
          gold
        />
        <Stat
          label="Effective Price"
          value={`${money(c.effectivePrice)}/t`}
          gold
        />
        <Stat label="Route Margin" value={pct(c.margin)} gold />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className={`rounded-3xl border p-5 ${marginClass(c.margin)}`}>
          <p className="text-xs font-bold uppercase tracking-[0.25em]">
            Margin Control State
          </p>
          <p className="mt-3 text-3xl font-black">
            {marginState(c.margin)}
          </p>
          <p className="mt-2 text-sm leading-6">
            Material stage controls tonnage basis. Effective price controls revenue.
          </p>
        </div>

        <Stat label="Surplus After Verification" value={money(c.surplus)} gold />
        <Stat label="Total Verification / Assay Cost" value={money(c.assayCost)} />
      </section>
    </>
  );
}

export function InputControls({
  form,
  isAdmin,
  saving,
  notice,
  error,
  resourceOptions,
  materialOptions,
  setField,
  save,
}: {
  form: EditForm;
  isAdmin: boolean;
  saving: boolean;
  notice: string;
  error: string;
  resourceOptions: string[];
  materialOptions: string[];
  setField: (key: keyof EditForm, value: string) => void;
  save: () => void;
}) {
  const c = economicsCalc(form);
  const words = stageWords(form.stage);

  return (
    <Card label="Input Controls" title="Set resource and economics">
      {!isAdmin ? (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="font-black text-red-200">
            Admin access required
          </p>
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
          help="Changing this applies resource defaults and material options."
        />

        <SelectField
          label="Material Type"
          value={form.material}
          options={materialOptions}
          onChange={(v) => setField("material", v)}
          help="Material stage now controls exact yield logic."
        />

        <StageNotice form={form} />

        <WarningCard
          resource={form.resource}
          material={form.material}
          yieldPercent={form.yield}
          price={String(c.effectivePrice)}
        />

        <Field
          label="Target / Product Tons"
          value={form.target}
          onChange={(v) => setField("target", v)}
          help="The product tons you want to produce, buy, sell or route."
        />

        <Field
          label="Expected Yield %"
          value={form.yield}
          onChange={(v) => setField("yield", v)}
          help={
            form.stage === "raw_feedstock"
              ? "Used to calculate feedstock required."
              : "Use 100% for saleable or finished product basis."
          }
        />

        <Stat
          label={
            form.stage === "raw_feedstock"
              ? "Auto Feedstock Required"
              : "Auto Route Product Tons"
          }
          value={tons(c.feedTons)}
          note={
            form.stage === "raw_feedstock"
              ? `${tons(c.target)}t ÷ ${pct(c.y)} yield`
              : words.feedstockRequiredNote
          }
          gold
        />

        <Field
          label="Market / Reference Price"
          value={form.marketPrice}
          onChange={(v) => setField("marketPrice", v)}
          help="Future live-feed price. For now, enter manually if available."
        />

        <Field
          label="Negotiated / Contract Price"
          value={form.negotiatedPrice}
          onChange={(v) => setField("negotiatedPrice", v)}
          help="Buyer PO or negotiated price. This overrides market/reference price."
        />

        <Stat
          label="Effective Selling Price"
          value={`${money(c.effectivePrice)}/t`}
          note="Negotiated price if entered; otherwise market/reference price."
          gold
        />

        <SelectField
          label="Price Basis"
          value={form.priceBasis}
          options={[
            "Live Feed / Indicative",
            "Buyer PO / Contract / Manual Negotiation",
            "Manual Negotiation",
            "Supplier Quote",
            "Market Reference",
          ]}
          onChange={(v) => setField("priceBasis", v)}
          help="Basis used for the effective selling price."
        />

        <Field
          label="Override / Price Note"
          value={form.overrideNote}
          onChange={(v) => setField("overrideNote", v)}
          help="Record buyer, contract, grade, assay or payment-term reason."
        />

        <PricingWarning />

        <Field
          label={words.feedstockCostLabel}
          value={form.feedstock}
          onChange={(v) => setField("feedstock", v)}
          help={words.feedstockCostHelp}
        />

        <Field
          label={words.transportLabel}
          value={form.transport}
          onChange={(v) => setField("transport", v)}
          help={words.transportHelp}
        />

        <Field
          label={words.tollingLabel}
          value={form.tolling}
          onChange={(v) => setField("tolling", v)}
          help={words.tollingHelp}
        />

        <Field
          label={words.feedstockAssayLabel}
          value={form.feedstockAssayRate}
          onChange={(v) => setField("feedstockAssayRate", v)}
          help={words.feedstockAssayHelp}
        />

        <Field
          label={
            form.stage === "finished_product"
              ? "Source / Verification Batches"
              : "Feedstock Assay Batches"
          }
          value={form.feedstockAssayBatches}
          onChange={(v) => setField("feedstockAssayBatches", v)}
          help="Number of source, feedstock, verification or assay batches."
        />

        <Field
          label={words.finalAssayLabel}
          value={form.concentrateAssayRate}
          onChange={(v) => setField("concentrateAssayRate", v)}
          help={words.finalAssayHelp}
        />

        <Field
          label={
            form.stage === "finished_product"
              ? "Final Verification Batches"
              : "Final Product Assay Batches"
          }
          value={form.concentrateAssayBatches}
          onChange={(v) => setField("concentrateAssayBatches", v)}
          help="Number of final verification, assay or quality batches."
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
  );
}

export function LivePreview({ form }: { form: EditForm }) {
  const c = economicsCalc(form);
  const words = stageWords(form.stage);

  return (
    <Card label="Live Preview" title="Effective economics result">
      <div className="mt-5 space-y-4">
        <Stat label="Material Stage" value={stageLabel(form.stage)} />
        <Stat label="Product Tons" value={tons(c.target)} />

        <Stat
          label={
            form.stage === "raw_feedstock"
              ? "Feedstock Required"
              : "Route Product Tons"
          }
          value={tons(c.feedTons)}
          note={
            form.stage === "raw_feedstock"
              ? `${tons(c.target)}t ÷ ${pct(c.y)} yield`
              : words.feedstockRequiredNote
          }
          gold
        />

        <Stat
          label="Market / Reference Price"
          value={`${money(n(form.marketPrice))}/t`}
        />

        <Stat
          label="Negotiated Price"
          value={`${money(n(form.negotiatedPrice))}/t`}
        />

        <Stat
          label="Effective Selling Price"
          value={`${money(c.effectivePrice)}/t`}
          gold
        />

        <Stat
          label="Revenue"
          value={money(c.revenue)}
          note={`${tons(c.target)}t × ${money(c.effectivePrice)}/t`}
        />

        <Stat label={words.feedstockCostPreview} value={money(c.feedCost)} />
        <Stat label={words.transportPreview} value={money(c.transCost)} />
        <Stat label={words.tollingPreview} value={money(c.tollCost)} />
        <Stat label={words.routeCostLabel} value={money(c.routeCost)} />
        <Stat label={words.feedstockAssayPreview} value={money(c.feedAssayCost)} />
        <Stat label={words.finalAssayPreview} value={money(c.prodAssayCost)} />
        <Stat label="Total Verification / Assay Cost" value={money(c.assayCost)} gold />
        <Stat label="Surplus After Verification" value={money(c.surplus)} gold />
        <Stat label="Route Margin" value={pct(c.margin)} gold />
      </div>
    </Card>
  );
    }
