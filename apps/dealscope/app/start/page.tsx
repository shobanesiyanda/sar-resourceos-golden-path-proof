"use client";
import Link from "next/link";
import {useState} from "react";
import "../landing.css";
const categories=[
 {id:"originator",label:"Deal originator / intermediary",detail:"Investigate mandates, the claimed stock and buyer credibility, then compare routes."},
 {id:"trader",label:"Commodity trader",detail:"Screen sourcing, grade, delivered cost, pricing, capital exposure and profitability."},
 {id:"company",label:"Mining or supply company",detail:"Maintain your own confidential transaction dossier, supporting documents and reassessment history under role-based access."},
 {id:"buyer",label:"Buyer / off-taker",detail:"Assess the terms and evidence of your own proposed purchase or offtake requirement."}
] as const;
type Role=(typeof categories)[number]["id"];
export default function TrialJourney(){
 const [role,setRole]=useState<Role>("originator");
 const choice=categories.find(x=>x.id===role)!;
 return <main className="ds-site">
  <div className="ds-preview-bar"><div className="wrap"><strong>Account provisioning not live.</strong> This is a preview of the one-free-complete-deal-cycle introduction. No identities, invitations or payments are being collected here.</div></div>
  <header className="ds-header"><div className="wrap ds-header-inner"><Link href="/" className="ds-logo">DEALSCOPE<span>.</span></Link><div className="ds-header-actions"><Link href="/integrity" className="ds-header-signin">Explore integrity checks</Link><Link href="/" className="ds-btn ds-btn-outline ds-btn-small">Back to website</Link></div></div></header>
  <section className="ds-hero" style={{padding:"66px 0 60px"}}><div className="wrap"><div className="ds-eyebrow">GET TO KNOW THE PLATFORM</div><h1 style={{maxWidth:850}}>Your first <em>complete deal assessment</em> — free.</h1><p className="ds-hero-copy">One complete Deal Assistance & Assessment cycle is designed for eligible new people and companies, not a restricted calculator or unrestricted free analyses. Learn the steps for activating your account and assessing your first customer-submitted transaction.</p></div></section>
  <section className="ds-section"><div className="wrap">
   <div className="ds-section-top"><div><div className="ds-eyebrow">STEP 01 · CHOOSE YOUR COMMERCIAL WORKFLOW</div><h2>What brings you to DealScope?</h2></div><p>Select your primary use case to see the relevant first activity. This selection remains in your browser session only.</p></div>
   <div className="ds-feature-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))"}}>
    {categories.map(item=><button key={item.id} type="button" onClick={()=>setRole(item.id)} aria-pressed={role===item.id}
     style={{textAlign:"left",cursor:"pointer",color:"#f4f4ef",fontFamily:"inherit",minHeight:185,
     border:role===item.id?"1px solid #d2ad5b":"1px solid #32485c",background:role===item.id?"#20344b":"#102131",padding:22,borderRadius:9}}>
     <span style={{display:"block",fontSize:11,color:"#d2ad5b",letterSpacing:".12em"}}>{role===item.id?"SELECTED":"SELECT"}</span>
     <strong style={{display:"block",fontSize:17,margin:"14px 0 6px"}}>{item.label}</strong>
     <span style={{color:"#b4c4d0",fontSize:13,lineHeight:1.6}}>{item.detail}</span>
    </button>)}
   </div>
   <div className="ds-trial-card" style={{marginTop:22}}>
    <div className="ds-eyebrow">YOUR RECOMMENDED FIRST ACTIVITY</div>
    <h3 style={{marginTop:12}}>{role==="buyer"?"Review the evidence behind a proposed offer":role==="company"?"Create a permissioned opportunity dossier":role==="trader"?"Compare the economics of a sourced parcel":"Check whether the proposed deal is credible"}</h3>
    <p>{choice.detail}</p>
    <div className="ds-hero-actions"><Link href="/integrity" className="ds-btn ds-btn-gold">Explore the public Deal Integrity self-check →</Link><Link href="/workspace/deals/new" className="ds-btn ds-btn-outline">Open private Deal Intelligence workspace ↗</Link></div>
    <div className="ds-trial-rule">These preview tools do not save customer records or provide live counterparty verification.</div>
   </div>
  </div></section>
  <section className="ds-section ds-section-contrast"><div className="wrap">
   <div className="ds-eyebrow">STEP 02 · ELIGIBILITY & COMPLETE DEAL WORKFLOW</div><h2>How the first full assessment is activated</h2>
   <div className="ds-steps">
    <div className="ds-step"><div className="ds-step-number">01</div><h3>Create identity</h3><p>Register as an eligible person and, where applicable, associate with your legitimate business.</p></div>
    <div className="ds-step"><div className="ds-step-number">02</div><h3>Verify eligibility</h3><p>Verify account control and prior trial history without assuming that a forwarded invitation proves legal authority.</p></div>
    <div className="ds-step"><div className="ds-step-number">03</div><h3>Activate free full assessment</h3><p>Start one complete deal investigation, scenario and commercial-readiness assessment, including the final report; no automatic paid conversion.</p></div>
    <div className="ds-step"><div className="ds-step-number">04</div><h3>Continue by choice</h3><p>After your completed free assessment, explicitly select PAYG, subscription or another offered plan for further deals. No automatic charge.</p></div>
   </div>
  </div></section>
  <section className="ds-section"><div className="wrap ds-faq"><div><div className="ds-eyebrow">ACTIVATION STATUS</div><h2>Account registration and free assessment activation are not yet available.</h2><p style={{color:"#b6c4d2"}}>We will not display a fake account-creation button or accept sensitive records without authenticated storage, deal-cycle introductory entitlements and independently tested tenant security.</p></div>
   <div className="ds-plan"><h3>What is still required?</h3><p>A dedicated DealScope customer identity and isolated database, verified trial eligibility, secure customer invitations, audit history, email verification, role-scoped permissions and real activation/recovery tests.</p><Link href="/">Return to the public site →</Link></div>
  </div></section>
  <footer className="ds-footer"><div className="wrap ds-legal" style={{marginTop:0}}>© 2026 DealScope · Operated by Shobane African Resources (Pty) Ltd · <Link href="/legal">Legal information</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/payments">Refunds</Link> · Development preview: no live registration or payments.</div></footer>
 </main>;
}
