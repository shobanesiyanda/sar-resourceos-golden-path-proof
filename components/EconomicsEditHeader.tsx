import {
  Stat,
  marginClass,
  marginState,
  money,
  pct,
  tons,
} from "./EconomicsBlocks";
import { stageLabel } from "../lib/resourceDefaults";
import { EditForm, economicsCalc } from "./EconomicsEditTypes";
import { stageWords } from "./EconomicsEditWords";

export function StageNotice({ form }: { form: EditForm }) {
  return (
    <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f5d778]">
        Material Stage
      </p>
      <p className="mt-2 text-2xl font-black">{stageLabel(form.stage)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {form.stage === "raw_feedstock"
          ? "Raw material uses product quantity divided by yield/recovery."
          : "Saleable and finished products use 100% basis: product quantity equals route quantity."}
      </p>
    </div>
  );
}

export function PricingWarning() {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
      <p className="font-black text-red-200">Pricing control warning</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Market/reference prices are indicative until verified against buyer PO,
        contract, grade, delivery basis, quality terms and payment terms.
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
  const words = stageWords(form);

  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcelCode} />
        <Stat label="Class" value={form.commodityClass} />
        <Stat label="Resource" value={form.resource} gold />
        <Stat label="Material" value={form.material} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Stage" value={stageLabel(form.stage)} />
        <Stat label="Product Quantity" value={tons(c.target)} />
        <Stat
          label={form.stage === "raw_feedstock" ? "Feedstock Required" : words.routeTonsLabel}
          value={tons(c.feedTons)}
          note={form.stage === "raw_feedstock" ? `${tons(c.target)} ÷ ${pct(c.y)} yield` : words.routeTonsNote}
          gold
        />
        <Stat label="Effective Price" value={`${money(c.effectivePrice)}/unit`} gold />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className={`rounded-3xl border p-5 ${marginClass(c.margin)}`}>
          <p className="text-xs font-bold uppercase tracking-[0.25em]">
            Margin Control State
          </p>
          <p className="mt-3 text-3xl font-black">{marginState(c.margin)}</p>
          <p className="mt-2 text-sm leading-6">
            Commodity class, material stage and effective price now control the economics basis.
          </p>
        </div>

        <Stat label="Surplus After Verification" value={money(c.surplus)} gold />
        <Stat label="Total Verification / Quality Cost" value={money(c.assayCost)} />
      </section>
    </>
  );
      }
