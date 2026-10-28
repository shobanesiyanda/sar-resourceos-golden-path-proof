import Link from "next/link";
import "../landing.css";
export const metadata={
 title:"Weekly Commodity Market Intelligence | DealScope",
 description:"Grade-specific commodity market reference prices, dated price basis, market movements and decision context. No deal sourcing or matching.",
 robots:{index:false,follow:false}
};
const insights=[
 ["Grade-specific prices","Compare relevant published or licensed assessments for the actual commodity, product form and quality—not an unrelated material."],
 ["Comparable transaction basis","See the price date, geographic market, unit, currency and incoterm or contract-defined delivery basis before negotiating."],
 ["Weekly market context","Understand movements, supply and demand developments, volatility and uncertainty; distinguish confirmed offtake terms from market indications."],
 ["Decision-ready references","Use appropriately sourced benchmarks to question a supplier offer or evaluate a buyer contract in the private Deal Intelligence service."]
];
export default function MarketIntelligencePublic(){
 return <main className="ds-site">
 <div className="ds-preview-bar"><div className="wrap"><strong>Market Intelligence development preview.</strong> Live market feeds, price subscriptions and payments are not activated. No executable commodity quotations are displayed.</div></div>
 <header className="ds-header"><div className="wrap ds-header-inner">
 <Link href="/" className="ds-logo">DEALSCOPE<span>.</span></Link>
 <div className="ds-header-actions"><Link href="/" className="ds-header-signin">Home</Link>
 <Link href="/start" className="ds-btn ds-btn-outline ds-btn-small">Assess my deal</Link></div>
 </div></header>
 <section className="ds-hero"><div className="wrap"><div className="ds-eyebrow">SERVICE 01 · WEEKLY MARKET INTELLIGENCE</div>
 <h1>Know the market <em>before you negotiate.</em></h1>
 <p className="ds-hero-copy">Weekly, dated commodity-price intelligence helps you understand the context behind an offer. DealScope distinguishes grades, product forms, destinations and delivery bases so you can ask better commercial questions.</p>
 <div className="ds-hero-actions"><Link href="/start" className="ds-btn ds-btn-gold">Explore Deal Intelligence ↗</Link></div>
 <p className="ds-hero-trust">Price references are not promises of a buyer, seller, live executable offer or guaranteed margin.</p>
 </div></section>
 <section className="ds-section" id="value"><div className="wrap">
 <div className="ds-section-top"><div><div className="ds-eyebrow">WHAT CUSTOMERS GET</div><h2>Information worth negotiating with.</h2></div>
 <p>Market Intelligence is separate from your private submitted-deal assessment. It can provide dated evidence to that service without publishing your documents or exposing proprietary calculations.</p></div>
 <div className="ds-feature-grid">{insights.map(([title,description],i)=>
 <div className="ds-feature" key={title}><div className="ds-feature-number">0{i+1}</div><h3>{title}</h3><p>{description}</p></div>)}</div>
 </div></section>
 <section className="ds-section ds-section-contrast"><div className="wrap ds-faq">
 <div><div className="ds-eyebrow">PRICE EVIDENCE</div><h2>Data must be comparable to be useful.</h2></div>
 <div><p>Chrome ROM is not chrome concentrate. A CIF China price is not a local FOT quotation. A historical market indication is not a binding buyer purchase order. These differences are preserved before any comparison is presented.</p>
 <p>Coverage depends on licensed or authorised sources, benchmark methodology and commodity-specific technical requirements. No current market feed has passed production acceptance.</p></div>
 </div></section>
 <section className="ds-bottom-cta"><div className="wrap">
 <div className="ds-eyebrow">SERVICE 02 · PRIVATE DEAL INTELLIGENCE</div>
 <h2>Already have a deal?</h2><p>Bring your contract, source offer or stock information to assess quantity, purchase limits, logistics, profitability and risk.</p>
 <div className="ds-hero-actions"><Link href="/start" className="ds-btn ds-btn-gold">Explore deal assessment ↗</Link></div>
 </div></section>
 <footer className="ds-footer"><div className="wrap ds-legal">© 2026 DealScope · Operated by Shobane African Resources (Pty) Ltd · <Link href="/legal">Legal information</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · Development preview: feeds and subscriptions inactive.</div></footer>
 </main>;
}
