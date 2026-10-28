"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateDealRun, type DealRunInput } from "../../../../packages/commodity-core/src/economics";
import { fallbackProductCatalogue } from "../../../../packages/commodity-core/src/catalogue";

const initial: DealRunInput = {
  commodity: "", currency: "ZAR", stage: "saleable_product", sourceTonnes: 0,
  yieldPct: null, buyerPricePerSaleableTonne: 0, acquisitionCostPerSourceTonne: 0,
  sourceTransportPerSourceTonne: 0, processingCostPerSourceTonne: 0,
  destinationTransportPerSaleableTonne: 0, handlingPerSaleableTonne: 0,
  feedstockAssayTotal: 0, concentrateAssayTotal: 0, financeCostTotal: 0,
  otherDirectCostsTotal: 0, targetNetMarginPct: 10, priceSource: "", priceAsOf: "",
};

type NumericField = Exclude<keyof DealRunInput, "commodity" | "currency" | "stage" | "priceSource" | "priceAsOf">;
const fields: {key:NumericField; label:string;help?:string}[] = [
  { key: "sourceTonnes", label: "Source tonnes" },
  { key: "yieldPct", label: "Mass yield (%)", help: "Only for ROM/feedstock. This is not metallurgical recovery." },
  { key: "buyerPricePerSaleableTonne", label: "Buyer price / saleable tonne" },
  { key: "acquisitionCostPerSourceTonne", label: "Acquisition cost / source tonne" },
  { key: "sourceTransportPerSourceTonne", label: "Source transport / source tonne" },
  { key: "processingCostPerSourceTonne", label: "Processing / source tonne" },
  { key: "destinationTransportPerSaleableTonne", label: "Delivery transport / saleable tonne" },
  { key: "handlingPerSaleableTonne", label: "Handling / saleable tonne" },
  { key: "feedstockAssayTotal", label: "Feedstock assay total" },
  { key: "concentrateAssayTotal", label: "Product assay total" },
  { key: "financeCostTotal", label: "Finance costs total" },
  { key: "otherDirectCostsTotal", label: "Other directly attributable costs" },
  { key: "targetNetMarginPct", label: "Target pre-tax net margin (%)" },
];

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {style:"currency",currency:currency || "ZAR",maximumFractionDigits:2}).format(value);
}
export default function DealRunPreview() {
  const [input, setInput] = useState<DealRunInput>(initial);
  const result = useMemo(() => calculateDealRun(input), [input]);
  function numberField(key: NumericField, value: string) {
    setInput(previous => ({...previous, [key]: value.trim() === "" ? (key === "yieldPct" ? null : NaN) : Number(value)}));
  }
  return <main>
    <header className="top"><div className="wrap topInner"><Link href="/" className="brand">DEALSCOPE<span className="dot">.</span></Link><nav><Link href="#analyse">Deal Runs</Link><Link href="/integrity">Deal Integrity</Link><Link href="/exchange">Commercial Exchange</Link></nav></div></header>
    <section className="hero"><div className="wrap">
      <p className="eyebrow">Multi-commodity commercial intelligence</p>
      <h1>Discover the economics.<br/><span>Control the transaction.</span></h1>
      <p className="lead">Full commercial intelligence, Deal Integrity, opportunity discovery, repeat scenario analysis and a consent-governed Commercial Exchange. Analyse the economics—and investigate whether the parties, stock and evidence justify proceeding.</p>
      <div className="notice">Migration preview — no live market feeds, account registration, payment collection, buyer disclosure or transaction execution.</div>
    </div></section>
    <section className="wrap workspace" id="analyse">
      <div className="sectionLabel">Deal Run | self-entered scenario</div>
      <div className="layout">
        <div className="panel">
          <h2>Route and evidence</h2>
          <p className="muted">No fabricated market prices. Provide a buyer-price reference and date to complete the arithmetic screen.</p>
          <div className="formGrid">
            <label>Commodity / product
              <select value={input.commodity} onChange={e => setInput(p=>({...p,commodity:e.target.value}))}>
                <option value="">Select material</option>
                {fallbackProductCatalogue.map(p => <option key={p.productCode} value={p.productCode}>{p.resource} — {p.materialType}</option>)}
              </select>
            </label>
            <label>Material stage
              <select value={input.stage} onChange={e=>setInput(p=>({...p,stage:e.target.value as DealRunInput["stage"],yieldPct:e.target.value==="saleable_product"?null:p.yieldPct}))}>
                <option value="saleable_product">Saleable / finished product</option><option value="raw_feedstock">Raw feedstock / ROM</option>
              </select>
            </label>
            <label>Currency
              <select value={input.currency} onChange={e=>setInput(p=>({...p,currency:e.target.value}))}><option value="ZAR">ZAR</option><option value="USD">USD</option></select>
            </label>
            <label>Buyer-price reference / source
              <input value={input.priceSource} placeholder="PO, written indication or data source" onChange={e=>setInput(p=>({...p,priceSource:e.target.value}))}/>
            </label>
            <label>Buyer-price reference date
              <input type="date" value={input.priceAsOf} onChange={e=>setInput(p=>({...p,priceAsOf:e.target.value}))}/>
            </label>
          </div>
          <h2 className="subhead">Economics</h2>
          <div className="formGrid">
            {fields.filter(f=>input.stage==="raw_feedstock"||f.key!=="yieldPct").map(f=>(
              <label key={f.key}>{f.label}
                <input type="number" min="0" step="any" value={input[f.key] ?? ""} onChange={e=>numberField(f.key,e.target.value)}/>
                {f.help && <small>{f.help}</small>}
              </label>))}
          </div>
        </div>
        <aside className="panel outcome">
          <h2>Commercial screen</h2>
          <div className={"state "+result.state}>
            {result.state==="qualified"?"Economics pass — inputs unverified":result.state==="rejected"?"Does not meet target":"Insufficient evidence / inputs"}
          </div>
          <dl>
            <div><dt>Source quantity</dt><dd>{result.sourceTonnes.toLocaleString("en-ZA")} t</dd></div>
            <div><dt>Saleable quantity</dt><dd>{result.saleableTonnes.toLocaleString("en-ZA",{maximumFractionDigits:2})} t</dd></div>
            <div><dt>Sales value</dt><dd>{money(result.revenue,input.currency)}</dd></div>
            <div><dt>Total attributable costs</dt><dd>{money(result.directCost,input.currency)}</dd></div>
            <div><dt>Gross margin</dt><dd>{result.grossMarginPct.toFixed(2)}%</dd></div>
            <div><dt>Pre-tax net profit</dt><dd>{money(result.netProfitBeforeTax,input.currency)}</dd></div>
            <div><dt>Pre-tax net margin</dt><dd>{result.netMarginPct.toFixed(2)}%</dd></div>
            <div><dt>Max source acquisition price for target</dt><dd>{money(result.acquisitionCostCeilingPerSourceTonne,input.currency)} / t</dd></div>
          </dl>
          {result.reasons.length>0 && <div className="reasons"><strong>Screening findings</strong><ul>{result.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul></div>}
          <p className="fine">This is a calculation, not a verified market price, buyer commitment or approved trade. Evidence, counterparty verification, approvals and cash settlement remain separate release gates.</p>
          <Link href="/exchange" className="outlineLink">Commercial Exchange access rules →</Link>
        </aside>
      </div>
    </section>
    <footer className="foot"><div className="wrap">DealScope · Development calculator preview · <Link href="/legal">Legal information</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/payments">Payment rights</Link></div></footer>
  </main>;
}
