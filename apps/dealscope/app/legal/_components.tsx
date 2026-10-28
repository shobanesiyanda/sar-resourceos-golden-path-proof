import Link from "next/link";
import type {ReactNode} from "react";
import "../landing.css";
export const LEGAL_LINKS=[["/legal","Legal operator"],["/terms","Customer terms"],["/privacy","Privacy & POPIA"],["/payments","Payments & refunds"],["/invoicing","Invoicing & VAT"]] as const;
export function LegalShell({eyebrow,title,children}:{eyebrow:string;title:string;children:ReactNode}){
 return <main className="ds-site">
  <div className="ds-preview-bar"><div className="wrap"><strong>Development legal draft — not operational.</strong> These pages are proposed customer disclosures; no live accounts, payments or accepted customer terms.</div></div>
  <header className="ds-header"><div className="wrap ds-header-inner"><Link href="/" className="ds-logo" aria-label="DealScope home">DEALSCOPE<span>.</span></Link><div className="ds-header-actions"><Link href="/" className="ds-btn ds-btn-outline ds-btn-small">Back to DealScope</Link></div></div></header>
  <section className="ds-section"><div className="wrap" style={{maxWidth:950}}>
   <div className="ds-eyebrow">{eyebrow}</div>
   <h1 style={{fontSize:"clamp(2rem,5vw,3.3rem)",lineHeight:1.13,margin:"14px 0 18px"}}>{title}</h1>
   <p style={{fontSize:13,lineHeight:1.8,color:"#bcccd8",maxWidth:780}}>Proposed customer policy, version 28 October 2026. Publication and legal review remain pending. The service is in development, so no account signup, accepted order or payment can arise from these pages.</p>
   <nav aria-label="Legal information" className="ds-legal-nav">{LEGAL_LINKS.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav>
   <div className="ds-legal-content">{children}</div>
  </div></section>
  <footer className="ds-footer"><div className="wrap ds-legal" style={{marginTop:0}}>© 2026 DealScope · Operated by Shobane African Resources (Pty) Ltd · <Link href="/legal">Legal information</Link> · Draft development preview</div></footer>
 </main>
}
export function LegalSection({title,children}:{title:string;children:ReactNode}){return <section style={{marginBottom:30}}><h2 style={{fontSize:"1.25rem",margin:"0 0 12px",color:"#e6c481"}}>{title}</h2><div style={{fontSize:"0.91rem",lineHeight:1.85,color:"#c2ced8"}}>{children}</div></section>}
