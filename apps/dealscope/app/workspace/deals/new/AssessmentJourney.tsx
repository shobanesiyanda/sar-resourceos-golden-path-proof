"use client";
import {useState} from "react";
import Link from "next/link";
const catalog={
 chrome:{materials:["ROM — low grade","ROM — high grade","Sweepings","Tailings","Fines","Lumpy ore","Concentrate"],roles:[
 "I supply material from a mine or stockpile","I represent a seller / mandate holder",
 "I buy material for direct resale","I buy feedstock to process and sell",
 "I have a buyer contract to fulfil","I produce and sell concentrate"]},
 coal:{materials:["ROM coal","Unwashed coal","Washed coal","Coal fines","Slurry / discard","Screened coal"],roles:[
 "I supply coal from a mine or stockpile","I represent a seller / mandate holder",
 "I buy raw coal for direct resale","I buy coal to wash and sell",
 "I trade washed coal","I have a buyer contract to fulfil"]},
 gold:{materials:["Gold-bearing ore","Concentrate","Doré","Refined bullion"],roles:[
 "I supply mine production","I represent a lawful seller","I buy for direct resale",
 "I intend to process material","I have a buyer contract to fulfil"]},
 diesel:{materials:["Diesel 10ppm","Diesel 50ppm","Bulk diesel supply"],roles:[
 "I am a licensed supplier","I represent a supplier / mandate holder",
 "I am procuring bulk fuel for resale","I have a delivery contract to fulfil"]}
} as const;
type Commodity=keyof typeof catalog;
type Prepared={caseId:string;sourceRevision:number;knownFacts:Record<string,{value:string|number;evidence:string}>;missingFacts:string[];conflicts:{field:string}[]};
type Report={state:string;assessmentId:string;missingFacts?:string[];nextActions?:{code:string;description:string}[];
 outputs?:{gradeAlternatives?:{feedstockGradeCr2o3Pct:number;requiredDryTonnes:number}[];
 freightBudget?:{estimatedZarPerDryT:number;estimatedTrips:number}|null;
 purchaseCeiling?:{feedstockGradeCr2o3Pct:number;maximumPurchaseZarPerDryT:number|null}[]|null}};
const terms=["Terms stated in my contract","EXW","FCA","FOB","CFR","CIF","DAP","DPU","DDP","FOT / ex-warehouse (contract-specific)","Not yet known"];
export default function DealAssessmentJourney(){
 const [commodity,setCommodity]=useState<Commodity>("chrome");
 const [role,setRole]=useState<string>(catalog.chrome.roles[0]);
 const [material,setMaterial]=useState<string>(catalog.chrome.materials[0]);
 const [term,setTerm]=useState(terms[0]);
 const [step,setStep]=useState(0);
 const [mode,setMode]=useState<"upload"|"paste"|"manual">("upload");
 const [files,setFiles]=useState<File[]>([]);
 const [pasted,setPasted]=useState("");
 const [destination,setDestination]=useState("");
 const [quantity,setQuantity]=useState("");
 const [grade,setGrade]=useState("");
 const [buyerPrice,setBuyerPrice]=useState("");
 const [prepared,setPrepared]=useState<Prepared|null>(null);
 const [confirmed,setConfirmed]=useState(false);
 const [report,setReport]=useState<Report|null>(null);
 const [error,setError]=useState("");
 const [working,setWorking]=useState(false);
 const [entryPoint,setEntryPoint]=useState<"sale_contract"|"source_offer">("sale_contract");
 function chooseCommodity(next:Commodity){setCommodity(next);setRole(catalog[next].roles[0]);setMaterial(catalog[next].materials[0])}
 async function capture(){
  setError("");setWorking(true);
  try{
   const data=new FormData();
   data.set("commodity",commodity);data.set("materialForm",material);data.set("commercialRole",role);
   data.set("deliveryTerm",term);data.set("entryPoint",entryPoint);
   data.set("sourceMode",mode);
   if(pasted.trim())data.set("pastedText",pasted);
   if(destination.trim())data.set("deliveryLocation",destination);
   if(quantity.trim())data.set("quantity",quantity);
   if(grade.trim())data.set("productGrade",grade);
   if(buyerPrice.trim())data.set("buyerPrice",buyerPrice);
   files.forEach(file=>data.append("documents",file,file.name));
   const res=await fetch("/api/assessments/intake",{method:"POST",body:data,credentials:"same-origin",cache:"no-store"});
   const body=await res.json();
   if(!res.ok)throw Error(body.message||"Secure intake is not yet available.");
   if(!body.caseId || !body.knownFacts)throw Error("The intake response was incomplete.");
   setPrepared(body);setConfirmed(false);setStep(2);
  }catch(e){setError(e instanceof Error?e.message:"Unable to prepare case.");}
  finally{setWorking(false);}
 }
 async function generate(){
  if(!prepared||!confirmed)return;
  setError("");setWorking(true);
  try{
   const confirmation=await fetch("/api/assessments/confirm",{method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({caseId:prepared.caseId,sourceRevision:prepared.sourceRevision,confirm:true}),
    credentials:"same-origin",cache:"no-store"});
   const confirmedBody=await confirmation.json();
   if(!confirmation.ok)throw Error(confirmedBody.message||"Saved fact confirmation is not available.");
   const res=await fetch("/api/assessments",{method:"POST",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({caseId:prepared.caseId}),
    credentials:"same-origin",cache:"no-store"});
   const body=await res.json();
   if(!res.ok)throw Error(body.message||"Assessment service not yet available.");
   if(!body.assessmentId)throw Error("Assessment was not committed.");
   setReport(body);setStep(3);
  }catch(e){setError(e instanceof Error?e.message:"Assessment could not be generated.");}
  finally{setWorking(false);}
 }
 return <main className="ds-journey"><header className="ds-journey-head">
  <Link href="/" aria-label="DealScope home">Deal<span>Scope</span></Link>
  <div>Private customer workspace · Deal Intelligence</div></header>
  <div className="ds-journey-shell">
   <p className="ds-journey-eyebrow">DEAL INTELLIGENCE</p>
   <h1>Understand your deal. Know your next move.</h1>
   <p>Start with the information you have. DealScope will identify unknowns and produce a decision brief when the evidence supports it.</p>
   <div className="ds-journey-steps" aria-label="Assessment progress">
    {["Deal context","Your information","Confirm facts","Decision brief"].map((s,i)=><div key={s} aria-current={step===i?"step":undefined} className={step===i?"active":""}>{i+1}. {s}</div>)}
   </div>
   {step===0&&<section className="ds-journey-panel">
    <h2>1. Tell us where you are in the value chain</h2>
    <div className="ds-journey-fields">
     <label>Commodity<select value={commodity} onChange={e=>chooseCommodity(e.target.value as Commodity)}>
      {Object.keys(catalog).map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}
     </select></label>
     <label>Contractual delivery terms<select value={term} onChange={e=>setTerm(e.target.value)}>
      {terms.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Your commercial role<select value={role} onChange={e=>setRole(e.target.value)}>
      {catalog[commodity].roles.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Material / product form<select value={material} onChange={e=>setMaterial(e.target.value)}>
      {catalog[commodity].materials.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>What are you starting with?<select value={entryPoint} onChange={e=>setEntryPoint(e.target.value as typeof entryPoint)}>
      <option value="sale_contract">A buyer requirement or offtake contract</option>
      <option value="source_offer">Available stock or a supplier offer</option></select></label>
    </div>
    <button type="button" onClick={()=>setStep(1)}>Continue to my information</button>
   </section>}
   {step===1&&<section className="ds-journey-panel">
    <h2>2. Provide what you already know</h2>
    <p>Choose one method or combine them. You do not need to research freight, processing or market pricing before starting.</p>
    <div className="ds-mode-buttons" role="group" aria-label="How to provide information">
     {(["upload","paste","manual"] as const).map(x=><button className={mode===x?"selected":""} type="button" key={x} onClick={()=>setMode(x)} aria-pressed={mode===x}>{x==="upload"?"Upload documents":x==="paste"?"Paste information":"Enter facts manually"}</button>)}
    </div>
    {mode==="upload"&&<label>Contract, purchase order, quotation, mandate or other evidence
     <input type="file" multiple accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
     <small>Files are processed only after secure storage, scanning and tenant controls have been activated.</small>
    </label>}
    {mode==="paste"&&<label>Copy and paste details from WhatsApp, an email or a document
     <textarea rows={7} value={pasted} onChange={e=>setPasted(e.target.value)} maxLength={15000} placeholder="Paste the buyer requirements, grade, delivery basis and available offer..."/></label>}
    {mode==="manual"&&<div className="ds-journey-fields">
      <label>{entryPoint==="sale_contract"?"Buyer delivery location":"Stockpile or source location"}<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="e.g. City Deep, Johannesburg"/></label>
      <label>{entryPoint==="sale_contract"?"Required product quantity":"Available stock quantity"} (dry tonnes if known)<input type="number" min="0" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="e.g. 1000"/></label>
      <label>{entryPoint==="sale_contract"?"Required product grade":"Source material grade"} (%)<input type="number" min="0" max="100" value={grade} onChange={e=>setGrade(e.target.value)} placeholder="e.g. 42"/></label>
      <label>Known buyer price (R per dry tonne), optional<input type="number" min="0" value={buyerPrice} onChange={e=>setBuyerPrice(e.target.value)} placeholder="Leave blank if unknown"/></label>
    </div>}
    <p className="ds-advisory">DealScope cannot certify stock, mandates or contracts from uploaded documents alone.</p>
    <div className="ds-journey-actions"><button type="button" className="secondary" onClick={()=>setStep(0)}>Back</button>
    <button disabled={working} type="button" onClick={capture}>{working?"Preparing...":"Review the known facts"}</button></div>
   </section>}
   {step===2&&prepared&&<section className="ds-journey-panel">
    <h2>3. Review facts extracted from your sources</h2>
    <p>Confirm what was captured. Contradictions and material unknowns must remain visible.</p>
    <dl>{Object.entries(prepared.knownFacts).map(([k,v])=><div key={k}><dt>{k.replaceAll("_"," ")}</dt><dd>{String(v.value)} <small>Customer supplied</small></dd></div>)}</dl>
    {!!prepared.conflicts?.length&&<p role="alert">Conflicting fields: {prepared.conflicts.map(x=>x.field).join(", ")}. Correct your sources before proceeding.</p>}
    {!!prepared.missingFacts?.length&&<p>Missing: {prepared.missingFacts.join(", ")}.</p>}
    <label className="ds-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I have reviewed these captured facts. This does not certify the underlying deal.</label>
    <div className="ds-journey-actions"><button className="secondary" onClick={()=>setStep(1)}>Edit information</button>
    <button disabled={!confirmed||working||!!prepared.conflicts?.length} onClick={generate}>{working?"Assessing...":"Generate DealScope assessment"}</button></div>
   </section>}
   {step===3&&report&&<section className="ds-journey-panel">
    <h2>4. Your DealScope decision brief</h2>
    <p><strong>{report.state.replaceAll("_"," ")}</strong> · Provisional; not a verified or executable trade.</p>
    {!!report.outputs?.gradeAlternatives?.length&&<div className="ds-journey-table"><h3>Grade-dependent material requirements</h3>
     <table><thead><tr><th>Feedstock grade</th><th>Required dry tonnes</th></tr></thead>
     <tbody>{report.outputs.gradeAlternatives.map(x=><tr key={x.feedstockGradeCr2o3Pct}><td>{x.feedstockGradeCr2o3Pct}%</td><td>{x.requiredDryTonnes.toLocaleString("en-ZA")}</td></tr>)}</tbody></table></div>}
    <h3>Negotiation and next steps</h3>
    {report.outputs?.freightBudget?<p>Indicative freight allowance: R{report.outputs.freightBudget.estimatedZarPerDryT.toLocaleString("en-ZA")}/dry tonne · {report.outputs.freightBudget.estimatedTrips} loads</p>:<p>Freight allowance: evidence required.</p>}
    {report.outputs?.purchaseCeiling?.length?<ul>{report.outputs.purchaseCeiling.map(x=><li key={x.feedstockGradeCr2o3Pct}>{x.feedstockGradeCr2o3Pct}% feedstock: {x.maximumPurchaseZarPerDryT===null?"Price ceiling not established":`Maximum indicative R${x.maximumPurchaseZarPerDryT.toLocaleString("en-ZA")}/dry tonne`}</li>)}</ul>:<p>Acquisition-price ceiling: insufficient substantiated route economics.</p>}
    <ul>{report.nextActions?.map(x=><li key={x.code}>{x.description}</li>)}</ul>
    <button type="button" onClick={()=>{setReport(null);setPrepared(null);setConfirmed(false);setStep(1)}}>Revise this deal</button>
   </section>}
   {!!error&&<p className="ds-error" role="alert">{error}</p>}
  </div></main>;
}
