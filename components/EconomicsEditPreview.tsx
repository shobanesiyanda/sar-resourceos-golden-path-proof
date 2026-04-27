import {
  Card,
  Stat,
  money,
  n,
  pct,
  tons,
} from "./EconomicsBlocks";
import { stageLabel } from "../lib/resourceDefaults";
import { EditForm, economicsCalc } from "./EconomicsEditTypes";
import { stageWords } from "./EconomicsEditWords";

export function LivePreview({ form }: { form: EditForm }) {
  const c = economicsCalc(form);
  const words = stageWords(form);

  return (
    <Card label="Live Preview" title="Effective economics result">
      <div className="mt-5 space-y-4">
        <Stat label="Commodity Class" value={form.commodityClass} />
        <Stat label="Commodity Group" value={form.category} />
        <Stat label="Material Stage" value={stageLabel(form.stage)} />
        <Stat label="Product Quantity" value={tons(c.target)} />

        <Stat
          label={form.stage === "raw_feedstock" ? "Feedstock Required" : words.routeTonsLabel}
          value={tons(c.feedTons)}
          note={form.stage === "raw_feedstock" ? `${tons(c.target)} ÷ ${pct(c.y)} yield` : words.routeTonsNote}
          gold
        />

        <Stat label="Market / Reference Price" value={`${money(n(form.marketPrice))}/unit`} />
        <Stat label="Negotiated Price" value={`${money(n(form.negotiatedPrice))}/unit`} />
        <Stat label="Effective Selling Price" value={`${money(c.effectivePrice)}/unit`} gold />
        <Stat label="Revenue" value={money(c.revenue)} note={`${tons(c.target)} × ${money(c.effectivePrice)}/unit`} />
        <Stat label={words.feedstockCostPreview} value={money(c.feedCost)} />
        <Stat label={words.transportPreview} value={money(c.transCost)} />
        <Stat label={words.tollingPreview} value={money(c.tollCost)} />
        <Stat label={words.routeCostLabel} value={money(c.routeCost)} />
        <Stat label={words.feedstockAssayPreview} value={money(c.feedAssayCost)} />
        <Stat label={words.finalAssayPreview} value={money(c.prodAssayCost)} />
        <Stat label="Total Verification / Quality Cost" value={money(c.assayCost)} gold />
        <Stat label="Surplus After Verification" value={money(c.surplus)} gold />
        <Stat label="Route Margin" value={pct(c.margin)} gold />
      </div>
    </Card>
  );
          }
