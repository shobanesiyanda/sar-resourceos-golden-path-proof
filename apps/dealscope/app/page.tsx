import Link from "next/link";
import "./landing.css";
const capabilities=[
 ["01","Weekly Market Intelligence","Understand grade-specific commodity prices, benchmark dates, price bases and relevant market changes before negotiating.","/market-intelligence"],
 ["02","Buyer Contract Feasibility","Bring your offtake contract. Assess required material quantities, viable procurement ceilings, logistics and funding conditions.","/start"],
 ["03","Supplier Offer Assessment","Have stock or a supplier quote? Compare its grade, saleable quantity and price against relevant market evidence.","/start"],
 ["04","Transport Negotiation Guidance","Understand indicative truck requirements, route allowances and the freight costs your deal needs to support.","/start"],
 ["05","Deal Integrity & Verification","Investigate authority, stock ownership, documentation, contradictory evidence and payment warning signs.","/integrity"],
 ["06","Decision & Reassessment","Receive an evidence-qualified assessment and revise your transaction when price, source, logistics or documents change.","/start"]
];
const steps=[
 ["01","Select your commodity and role","Choose the material, delivery obligations and where you stand in its value chain."],
 ["02","Provide the facts you have","Upload a contract or offer, paste an email or message, or enter your available deal details."],
 ["03","Review the evidence and assess","Confirm the captured facts. DealScope identifies missing evidence and evaluates supported scenarios privately."],
 ["04","Negotiate and decide","Receive conditional quantities, buying limits, commercial risks and next actions—not our proprietary formulas."]
];
export default function PublicDealScopeHome(){
 return <main className="ds-site">
  <div className="ds-preview-bar" role="status"><div className="wrap"><strong>Product development preview.</strong> The public website and one-free-full-deal-cycle offer are being engineered. Registration, independent verification, market feeds and paid assessments are not yet live.</div></div>
  <header className="ds-header"><div className="wrap ds-header-inner">
   <Link href="/" className="ds-logo" aria-label="DealScope home">DEALSCOPE<span>.</span></Link>
   <nav className="ds-nav" aria-label="Website navigation">
    <a href="#platform">Platform</a><a href="#journey">How it works</a><a href="#pricing">Plans</a><Link href="/integrity">Deal Integrity</Link>
   </nav>
   <div className="ds-header-actions"><Link className="ds-header-signin" href="/start">Sign in</Link><Link href="/start" className="ds-btn ds-btn-gold ds-btn-small">Explore free Deal Assessment</Link></div>
  </div></header>
  <section className="ds-hero"><div className="wrap ds-hero-grid">
   <div>
    <div className="ds-eyebrow"><span className="ds-dot"/> COMMERCIAL INTELLIGENCE. REAL-WORLD DUE DILIGENCE.</div>
    <h1>Know what you&apos;re <em>dealing with</em> before you commit.</h1>
    <p className="ds-hero-copy">Bring your contract, supplier offer or stock details. Understand how much material you need, what you can afford to pay, indicative delivery costs, what could prevent the deal from working—and what to verify before committing money.</p>
    <div className="ds-hero-actions">
     <Link href="/start" className="ds-btn ds-btn-gold">Get your first full Deal Assessment free <span aria-hidden>→</span></Link>
     <Link href="/market-intelligence" className="ds-btn ds-btn-outline">Explore Weekly Market Intelligence <span aria-hidden>↗</span></Link>
    </div>
    <p className="ds-hero-trust"><strong>1 complete deal cycle</strong> · Integrity, viability, readiness and a final report · No automatic paid conversion</p>
    <div className="ds-hero-context">Two connected services: weekly commodity Market Intelligence and private customer-submitted Deal Intelligence. Built for producers, mandate holders, suppliers and traders.</div>
   </div>
   <div className="ds-demo" aria-label="Illustrative deal decision brief, not a verified customer assessment">
    <div className="ds-demo-top"><span>DEALSCOPE / INTELLIGENCE BRIEF</span><span className="ds-demo-chip">ILLUSTRATIVE ONLY</span></div>
    <div className="ds-demo-label">Example: Customer-submitted chrome concentrate contract</div>
    <div className="ds-demo-head">A deal worth investigating—or walking away from?</div>
    <div className="ds-demo-metric"><div><small>DEAL INTEGRITY</small><strong>Investigate further</strong></div><span className="ds-dot-warning"/></div>
    <div className="ds-demo-detail"><span>Stock ownership</span><strong>Supporting proof required</strong></div>
    <div className="ds-demo-detail"><span>Lab report</span><strong>Issuer confirmation pending</strong></div>
    <div className="ds-demo-detail"><span>Buyer terms</span><strong>Not independently confirmed</strong></div>
    <div className="ds-demo-divider"/>
    <div className="ds-demo-next"><small>NEXT BEST ACTION</small><p>Verify the parcel-specific selling mandate directly with the lawful stock controller before accepting the offer.</p></div>
    <div className="ds-demo-bottom">Evidence before commitment. No fraud finding or guaranteed transaction.</div>
   </div>
  </div></section>
  <section className="ds-proofbar"><div className="wrap ds-proofbar-grid">
   <span>Is the stock real?</span><span>Is the mandate genuine?</span><span>Will the numbers work?</span><span>What should I verify next?</span>
  </div></section>
  <section className="ds-section" id="platform"><div className="wrap">
   <div className="ds-section-top"><div><div className="ds-eyebrow">ONE CONNECTED PLATFORM</div><h2>Know the market. Know your own deal.</h2></div><p>Our weekly Market Intelligence service informs pricing decisions. Deal Intelligence works from your proposed transaction to evaluate material, logistics, financial exposure, supporting evidence and next actions. Neither service sources deals or matches buyers and sellers.</p></div>
   <div className="ds-feature-grid">{capabilities.map(([number,title,copy,href])=><Link href={href} key={number} className="ds-feature">
    <div className="ds-feature-number">{number}</div><h3>{title}</h3><p>{copy}</p><span>Explore capability <span aria-hidden>↗</span></span>
   </Link>)}</div>
  </div></section>
  <section className="ds-section ds-section-contrast" id="journey"><div className="wrap">
   <div className="ds-eyebrow">FROM CUSTOMER INFORMATION TO COMMERCIAL DECISION</div>
   <div className="ds-section-top"><h2>Before you spend on that commodity deal, know where you stand.</h2><p>A forwarded offer may look attractive. DealScope is designed to help you understand what you are buying into before spending on travel, samples, transport or commercial commitments.</p></div>
   <div className="ds-steps">{steps.map(([number,title,copy])=><div className="ds-step" key={number}><div className="ds-step-number">{number}</div><h3>{title}</h3><p>{copy}</p></div>)}</div>
  </div></section>
  <section className="ds-section ds-trial-section" id="trial"><div className="wrap ds-trial-grid">
   <div><div className="ds-eyebrow">EXPERIENCE THE COMPLETE PLATFORM</div><h2>One complete deal. The full assessment.</h2><p>Our introductory offer gives each eligible new person or organisation one complete Deal Assistance & Assessment cycle: investigate the claims, model the economics, identify what remains before commitment and receive a full report. One complete assessment, not unlimited free analyses.</p><div className="ds-trial-points"><span>One complete assisted deal cycle</span><span>Eligible first-time customers</span><span>No automatic paid conversion</span></div><Link href="/start" className="ds-btn ds-btn-gold">See how your free assessment works <span aria-hidden>→</span></Link></div>
   <div className="ds-trial-card"><div className="ds-trial-number">1<span>deal</span></div><h3>Your starting point</h3><p>Experience the full end-to-end assessment of one opportunity before choosing a paid option. Account verification and independently evidenced services are subject to real provider and platform readiness.</p><div className="ds-trial-rule">Preview notice: free assessments and customer accounts cannot yet be activated.</div></div>
  </div></section>
  <section className="ds-section" id="pricing"><div className="wrap"><div className="ds-section-top"><div><div className="ds-eyebrow">FLEXIBLE COMMERCIAL ACCESS</div><h2>Choose how you work.</h2></div><p>One full introductory deal-cycle assessment, pay-as-you-go and subscription models support different transaction volumes. Commercial prices and offer terms will be published only after approval.</p></div>
   <div className="ds-plans"><div className="ds-plan"><div className="ds-plan-type">INTRODUCTION</div><h3>First full assessment</h3><p className="ds-plan-price">1 complete deal — free</p><p>Experience a full, evidence-guided Deal Assistance & Assessment cycle. Additional free cycles require an approved offer.</p><Link href="/start">Explore your first assessment ↗</Link></div>
   <div className="ds-plan ds-plan-featured"><div className="ds-plan-type">FLEXIBLE USE</div><h3>Pay as you go</h3><p className="ds-plan-price">Per Deal Run</p><p>Use defined analyses when opportunities arise, whether the result is positive or negative.</p><Link href="/start">See access options ↗</Link></div>
   <div className="ds-plan"><div className="ds-plan-type">REPEAT TEAMS</div><h3>Subscriptions</h3><p className="ds-plan-price">Essential / Professional</p><p>Ongoing intelligence, saved workspaces and team-level access for frequent analysis.</p><Link href="/start">Explore plans ↗</Link></div></div>
  </div></section>
  <section className="ds-section ds-section-contrast"><div className="wrap ds-faq"><div><div className="ds-eyebrow">COMMON QUESTIONS</div><h2>Confidence comes from evidence, not promises.</h2></div>
   <div><details><summary>Does DealScope guarantee a deal is genuine?</summary><p>No. It explains the available evidence, contradictions, uncertainties and independent checks needed. Automated findings cannot certify a company, mandate, stockpile or buyer as legitimate.</p></details>
    <details><summary>Can I analyse a deal that turns out to be unprofitable?</summary><p>Yes. A useful assessment can show why a deal should not proceed. DealScope evaluates the customer's proposed transaction and does not publish or market customer deals.</p></details>
    <details><summary>What happens after my free assessment?</summary><p>No automatic charge when the complete report is delivered. Further new deal assessments require a separately chosen paid entitlement or specifically approved promotional offer. Permitted records remain accessible under applicable retention rules.</p></details>
    <details><summary>Does DealScope find customers or transactions for me?</summary><p>No. Bring your own deal, stock or contract for private assessment. Market Intelligence helps you understand relevant prices, not discover or match a buyer or seller.</p></details></div>
  </div></section>
  <section className="ds-bottom-cta"><div className="wrap"><div className="ds-eyebrow">START WITH THE RIGHT QUESTIONS</div><h2>Better informed deals start here.</h2><p>Understand the evidence. Know the risks. Model the economics.</p><div className="ds-hero-actions"><Link className="ds-btn ds-btn-gold" href="/start">Explore your free full deal assessment →</Link><Link className="ds-btn ds-btn-outline" href="/market-intelligence">Explore Market Intelligence →</Link></div></div></section>
  <footer className="ds-footer"><div className="wrap ds-footer-grid"><div><Link href="/" className="ds-logo">DEALSCOPE<span>.</span></Link><p>DealScope — weekly market intelligence and private, evidence-led commodity deal assessment.</p></div><div><strong>Explore</strong><Link href="/integrity">Deal Integrity</Link><Link href="/workspace/deals/new">Assess My Deal</Link><Link href="/market-intelligence">Market Intelligence</Link></div><div><strong>Access</strong><Link href="/start">Free assessment onboarding</Link><a href="#pricing">Plans and pricing</a><a href="#trial">Free assessment</a></div></div><div className="wrap ds-legal">© 2026 DealScope · Operated by Shobane African Resources (Pty) Ltd · <Link href="/legal">Legal information</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/payments">Payments &amp; refunds</Link> · <Link href="/invoicing">Invoicing</Link> · Development preview: registration and transactions not yet active</div></footer>
 </main>;
}
