import Link from "next/link";
import "../landing.css";

export default function DealScopeLegalInformation(){
 return <main className="ds-site">
  <div className="ds-preview-bar"><div className="wrap"><strong>Development preview.</strong> DealScope is not yet accepting live registration, payments or binding commercial transactions.</div></div>
  <header className="ds-header"><div className="wrap ds-header-inner"><Link href="/" className="ds-logo" aria-label="DealScope home">DEALSCOPE<span>.</span></Link>
   <div className="ds-header-actions"><Link href="/" className="ds-btn ds-btn-outline ds-btn-small">Back to DealScope</Link></div></div></header>
  <section className="ds-section"><div className="wrap" style={{maxWidth:850}}>
   <div className="ds-eyebrow">LEGAL &amp; COMPANY INFORMATION</div>
   <h1 style={{fontSize:"clamp(2.2rem,5vw,3.6rem)",lineHeight:1.12,margin:"14px 0 23px"}}>DealScope legal information.</h1>
   <p className="ds-hero-copy">DealScope is a customer-facing commercial intelligence and deal assessment platform. The brand is operated by an existing registered South African company and is not represented here as a separately incorporated company.</p>
   <div className="ds-trial-card" style={{marginTop:31}}>
    <div className="ds-eyebrow">CURRENT LEGAL OPERATOR</div>
    <h2 style={{fontSize:"clamp(1.25rem,3vw,1.75rem)",margin:"14px 0"}}>Shobane African Resources (Pty) Ltd</h2>
    <p>DealScope is the service brand. The legal operator named above is the current company responsible for the proposed service, subject to verified customer terms and statutory disclosures before transactional launch.</p>
   </div>
   <div className="ds-plan" style={{marginTop:22}}>
    <div className="ds-plan-type">BEFORE TRANSACTIONS GO LIVE</div>
    <h2 style={{fontSize:"1.3rem",margin:"16px 0 4px"}}>Verified statutory and customer information</h2>
    <p>Full company registration particulars, verified business and service-of-documents addresses, telephone and electronic contact details, applicable terms, privacy practices, pricing, payment, cancellation, refunds and dispute procedures must be completed and reviewed before DealScope offers live electronic transactions. We do not publish unverified details or claim that these disclosures are already complete.</p>
    <p>DealScope currently does not register customer accounts, process payments or enter binding Exchange transactions through this development preview.</p>
   </div>
   <p className="ds-hero-copy" style={{marginTop:25}}>For the customer-facing service overview, <Link href="/" style={{color:"#d2ad5b",textDecoration:"underline"}}>return to DealScope</Link>.</p>
  </div></section>
  <footer className="ds-footer"><div className="wrap ds-legal" style={{marginTop:0}}>© 2026 DealScope · Operated by Shobane African Resources (Pty) Ltd · <Link href="/">DealScope home</Link> · Development preview</div></footer>
 </main>;
}
