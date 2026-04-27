import {
  Card,
  Field,
  SelectField,
  Stat,
  WarningCard,
  money,
  pct,
  tons,
} from "./EconomicsBlocks";
import { RESOURCE_MAP } from "../lib/resourceDefaults";
import { EditForm, economicsCalc } from "./EconomicsEditTypes";
import {
  COMMODITY_CLASS_OPTIONS,
  groupOptionsForClass,
  stageWords,
} from "./EconomicsEditWords";
import { PricingWarning, StageNotice } from "./EconomicsEditHeader";

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
  const words = stageWords(form);
  const groupOptions = groupOptionsForClass(form.commodityClass);

  return (
    <Card label="Input Controls" title="Set commodity and economics">
      {!isAdmin ? (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="font-black text-red-200">Admin access required</p>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <SelectField label="Commodity Class" value={form.commodityClass} options={COMMODITY_CLASS_OPTIONS} onChange={(v) => setField("commodityClass", v)} help="Top-level commodity classification." />
        <SelectField label="Commodity Group" value={form.category} options={groupOptions} onChange={(v) => setField("category", v)} help="Group inside hard or soft commodities." />
        <SelectField label="Commodity / Resource" value={form.resource} options={resourceOptions} onChange={(v) => setField("resource", v)} help="Changing this applies resource defaults and material options." />
        <SelectField label="Material / Product Type" value={form.material} options={materialOptions} onChange={(v) => setField("material", v)} help="Material stage controls yield and wording." />

        <StageNotice form={form} />

        <WarningCard resource={form.resource} material={form.material} yieldPercent={form.yield} price={String(c.effectivePrice)} />

        <Field label="Target Product Quantity" value={form.target} onChange={(v) => setField("target", v)} help="The tons or units you want to produce, buy, sell or route." />
        <Field label="Expected Yield / Recovery %" value={form.yield} onChange={(v) => setField("yield", v)} help={form.stage === "raw_feedstock" ? "Used to calculate raw material or feedstock required." : "Use 100% for saleable or finished product basis."} />

        <Stat
          label={form.stage === "raw_feedstock" ? "Auto Feedstock Required" : words.routeTonsLabel}
          value={tons(c.feedTons)}
          note={form.stage === "raw_feedstock" ? `${tons(c.target)} ÷ ${pct(c.y)} yield` : words.routeTonsNote}
          gold
        />

        <Field label="Market / Reference Price" value={form.marketPrice} onChange={(v) => setField("marketPrice", v)} help="Future live-feed price. For now, enter manually if available." />
        <Field label="Negotiated / Contract Price" value={form.negotiatedPrice} onChange={(v) => setField("negotiatedPrice", v)} help="Buyer PO or negotiated price. This overrides market/reference price." />

        <Stat label="Effective Selling Price" value={`${money(c.effectivePrice)}/unit`} note="Negotiated price if entered; otherwise market/reference price." gold />

        <SelectField
          label="Price Basis"
          value={form.priceBasis}
          options={["Live Feed / Indicative", "Buyer PO / Contract / Manual Negotiation", "Manual Negotiation", "Supplier Quote", "Market Reference"]}
          onChange={(v) => setField("priceBasis", v)}
          help="Basis used for the effective selling price."
        />

        <Field label="Override / Price Note" value={form.overrideNote} onChange={(v) => setField("overrideNote", v)} help="Record buyer, contract, grade, quality, delivery or payment-term reason." />

        <PricingWarning />

        <Field label={words.feedstockCostLabel} value={form.feedstock} onChange={(v) => setField("feedstock", v)} help={words.feedstockCostHelp} />
        <Field label={words.transportLabel} value={form.transport} onChange={(v) => setField("transport", v)} help={words.transportHelp} />
        <Field label={words.tollingLabel} value={form.tolling} onChange={(v) => setField("tolling", v)} help={words.tollingHelp} />
        <Field label={words.feedstockAssayLabel} value={form.feedstockAssayRate} onChange={(v) => setField("feedstockAssayRate", v)} help={words.feedstockAssayHelp} />
        <Field label={words.batchLabel} value={form.feedstockAssayBatches} onChange={(v) => setField("feedstockAssayBatches", v)} help="Number of source, quality, verification or assay batches." />
        <Field label={words.finalAssayLabel} value={form.concentrateAssayRate} onChange={(v) => setField("concentrateAssayRate", v)} help={words.finalAssayHelp} />
        <Field label={words.finalBatchLabel} value={form.concentrateAssayBatches} onChange={(v) => setField("concentrateAssayBatches", v)} help="Number of final quality, verification or assay batches." />

        <button
          type="button"
          onClick={save}
          disabled={!isAdmin || saving}
          className="w-full rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Lead Economics"}
        </button>

        {notice ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">{notice}</p> : null}
        {error ? <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</p> : null}
      </div>
    </Card>
  );
      }
