"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {INTEGRITY_CHECKS} from "../../lib/deal-integrity.mjs";

type SelfCheck="unchecked"|"claim_received"|"claimed_independently_checked"|"inconsistent";
const options:{value:SelfCheck;label:string}[]=[
 {value:"unchecked",label:"Not checked"},
 {value:"claim_received",label:"Document / verbal claim received"},
 {value:"claimed_independently_checked",label:"I independently checked with the issuer"},
 {value:"inconsistent",label:"Unresolved inconsistency"}
];
export default function IntegrityGuidance(){
 const [statuses,setStatuses]=useState<Record<string,SelfCheck>>({});
 const summary=useMemo(()=>{
  const total=INTEGRITY_CHECKS.length;
  const conflict=INTEGRITY_CHECKS.filter(c=>statuses[c.id]==="inconsistent").length;
  const selfReported=INTEGRITY_CHECKS.filter(c=>statuses[c.id]==="claimed_independently_checked").length;
  const unverified=INTEGRITY_CHECKS.filter(c=>statuses[c.id]==="claim_received").length;
  const missing=total-conflict-selfReported-unverified;
  return {conflict,selfReported,unverified,missing,total};
 },[statuses]);
 const outcome=summary.conflict?"STOP & RESOLVE CONTRADICTIONS":
  summary.unverified+summary.missing?"INVESTIGATE BEFORE COMMITMENT":
  "CONTINUE INDEPENDENT DUE DILIGENCE";
 return <main>
  <header className="top"><div className="wrap topInner">
   <Link className="brand" href="/">DEALSCOPE<span className="dot">.</span></Link>
   <nav><Link href="/">Deal Runs</Link><Link href="/exchange">Commercial Exchange</Link></nav>
  </div></header>
  <section className="hero"><div className="wrap">
   <p className="eyebrow">Deal Integrity / Guided diligence</p>
   <h1>Is the deal <span>credible enough</span> to investigate further?</h1>
   <p className="lead">A transaction may look profitable while its stock, mandates, laboratory evidence, buyer authority or banking instructions remain unverified. Investigate the evidence before committing capital.</p>
   <div className="notice" role="note"><strong>Development self-check — not an actual verification service.</strong> Your selections are not independently checked, stored, sent or shared. Do not enter people's names, IDs, banking details or confidential deal records here. No finding proves fraud, safety or legal legitimacy.</div>
  </div></section>
  <section className="wrap workspace">
   <div className="sectionLabel">Private self-assessment · no backend, payments or information upload</div>
   <div className="layout">
    <div style={{display:"grid",gap:14}}>
     {INTEGRITY_CHECKS.map((c,i)=><section key={c.id} className="panel" aria-label={c.name}>
      <p className="eyebrow">Check {String(i+1).padStart(2,"0")} / {String(INTEGRITY_CHECKS.length).padStart(2,"0")}</p>
      <h2 style={{marginTop:8}}>{c.name}</h2>
      <p className="muted"><strong>Investigate:</strong> {c.how}</p>
      <p className="fine" style={{margin:"10px 0"}}>Potential independent evidence: {c.source}</p>
      <label style={{display:"block",marginTop:16,fontSize:13}} htmlFor={"check-"+c.id}>Your current evidence status</label>
      <select id={"check-"+c.id} value={statuses[c.id]??"unchecked"} onChange={e=>setStatuses(prev=>({...prev,[c.id]:e.target.value as SelfCheck}))} style={{marginTop:8}}>
       {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {(statuses[c.id]??"unchecked")!=="claimed_independently_checked" &&
       <p className="fine" style={{marginBottom:0}}>Next action: {c.how}</p>}
     </section>)}
    </div>
    <aside className="panel outcome" style={{position:"sticky",top:12}}>
     <h2>Evidence overview</h2>
     <div className="state incomplete" role="status">{outcome}</div>
     <dl>
      <div><dt>Unresolved inconsistencies</dt><dd>{summary.conflict}</dd></div>
      <div><dt>Unchecked items</dt><dd>{summary.missing}</dd></div>
      <div><dt>Claims / uploaded information only</dt><dd>{summary.unverified}</dd></div>
      <div><dt>Reported independently checked by you</dt><dd>{summary.selfReported}</dd></div>
     </dl>
     <p className="fine">This self-check uses your own selections, not authenticated issuer responses or DealScope-confirmed evidence. Even all items marked independently checked cannot certify a legitimate transaction, title, counterparty capacity or authority to pay.</p>
     <button onClick={()=>setStatuses({})} className="outlineLink" style={{cursor:"pointer",background:"transparent",width:"100%"}}>Clear self-check</button>
     <p className="fine">Full DealScope platform engineering includes privately stored evidence, regulator/laboratory verification interfaces where permitted, versioned assessments, paid Deal Runs, monitoring, negotiation and consent-gated Exchange. Those production capabilities are not activated in this preview.</p>
    </aside>
   </div>
  </section>
  <footer className="foot"><div className="wrap">DealScope · Full Commercial Intelligence and Exchange Suite · Development preview</div></footer>
 </main>;
}
