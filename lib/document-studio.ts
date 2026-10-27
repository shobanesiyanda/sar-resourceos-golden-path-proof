import { SAR_OFFICIAL_LOGO_DATA_URI } from "./sar-brand-assets.mjs";
/** SAR ResourceOS Document Studio — local draft model only; not a document registry. */
export type DocumentBlockKind = "heading" | "paragraph" | "bullets" | "callout";
export type DocumentClass = "internal" | "confidential" | "counterparty";
export type DocumentBlock = { id: string; kind: DocumentBlockKind; text: string };
export type DocumentTemplateId = "corporate-letter" | "rfq" | "proposal" | "project-brief" | "internal-memo";
export type DocumentDraft = {
  schemaVersion: 1; id: string; templateId: DocumentTemplateId; title: string;
  documentRef: string; division: string; recipient: string; subject: string;
  classification: DocumentClass; date: string; blocks: DocumentBlock[];
};
export const TEMPLATE_CATALOG: { id: DocumentTemplateId; name: string; detail: string; icon: string }[] = [
  { id: "corporate-letter", name: "Corporate letter", detail: "Formal counterparty correspondence", icon: "01" },
  { id: "rfq", name: "Request for quotation", detail: "Controlled scope and supplier enquiries", icon: "02" },
  { id: "proposal", name: "Commercial proposal", detail: "Client-facing solutions and terms", icon: "03" },
  { id: "project-brief", name: "Project feasibility brief", detail: "Structured technical feasibility", icon: "04" },
  { id: "internal-memo", name: "Internal memorandum", detail: "Executive decisions and handoffs", icon: "05" },
];
const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID() : "local-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
const block = (kind: DocumentBlockKind, text: string): DocumentBlock => ({ id: makeId(), kind, text });
const presets: Record<DocumentTemplateId, {title:string;division:string;subject:string;blocks:[DocumentBlockKind,string][]}> = {
  "corporate-letter": {title:"Corporate correspondence",division:"Corporate Office",
    subject:"[Insert the purpose of correspondence]",blocks:[
    ["paragraph","Dear [Counterparty contact],"],
    ["paragraph","[Explain the purpose of this correspondence, supported by authorised facts.]"],
    ["heading","Next steps"],
    ["paragraph","[Describe requested action, responsible person and a verified response deadline.]"],
    ["paragraph","Yours faithfully,\n[Authorised SAR representative — signature and capacity subject to verification]"]]},
  rfq: {title:"Request for quotation",division:"Procurement / Project Development",
    subject:"[Insert goods, equipment or services required]",blocks:[
    ["callout","DRAFT RFQ — This document has not passed technical review, recipient approval or dispatch authorisation."],
    ["heading","1. Scope of supply"],
    ["paragraph","[Insert source-linked technical specification, equipment/material class, location, units and quantities.]"],
    ["heading","2. Technical and compliance requirements"],
    ["bullets","[Evidence-backed quality and performance specification]\n[Certificates / permits / safety documentation]\n[Warranty, installation, mobilisation or service conditions]"],
    ["heading","3. Pricing and delivery schedule"],
    ["paragraph","[Request itemised prices, currency, VAT basis, freight, Incoterm and lead times. Do not invent commercial terms.]"],
    ["heading","4. Response instructions"],
    ["paragraph","[Enter approved submission channel, valid deadline, required attachments and authorised contact.]"]]},
  proposal: {title:"Commercial proposal",division:"Commodity Trading / Mining Services",
    subject:"[Insert project or commercial opportunity]",blocks:[
    ["heading","Executive overview"],["paragraph","[Present the client's requirement and SAR's evidence-supported approach.]"],
    ["heading","Scope and deliverables"],["bullets","[Defined scope]\n[Deliverable and acceptance basis]\n[Relevant exclusions and assumptions]"],
    ["heading","Commercial methodology"],["paragraph","[Insert approved route costs, commercial terms and delivery basis; no unverified prices.]"],
    ["heading","Risk and execution controls"],["paragraph","[Identify permits, resources, technical reviews, quality and funding gates.]"],
    ["heading","Decision / next action"],["paragraph","[Define a non-binding next step pending contract and signatory approval.]"]]},
  "project-brief": {title:"Project feasibility brief",division:"Mining & Contract Services",
    subject:"[Insert prospective project and reference]",blocks:[
    ["callout","DECISION SUPPORT ONLY — Engineering certification and financial commitments are separate approvals."],
    ["heading","Project objectives and evidence"],["paragraph","[Link the controlling tender, SOW, BOQ, drawings and project data versions.]"],
    ["heading","Work breakdown and dependencies"],["bullets","[Scope package / critical-path dependency]\n[Labour / fleet / plant capacity]\n[Required specialist certifications]"],
    ["heading","Simulation assumptions"],["paragraph","[Record each input source, schedule, yield, cost, finance and uncertainty.]"],
    ["heading","Feasibility scenarios"],["paragraph","[Summarise reviewed baseline, downside and sensitivity outputs; attach simulation evidence.]"],
    ["heading","Outstanding decisions"],["paragraph","[Record review authorities, missing documents and the separate approval path.]"]]},
  "internal-memo": {title:"Internal memorandum",division:"Executive Management",
    subject:"[Insert decision or internal matter]",blocks:[
    ["heading","Decision required"],["paragraph","[State the requested decision and deadline.]"],
    ["heading","Evidence and context"],["paragraph","[Present verified operational and commercial facts with traceable sources.]"],
    ["heading","Options and implications"],["bullets","[Option one: cost, risks and benefits]\n[Option two: cost, risks and benefits]"],
    ["heading","Recommendation"],["paragraph","[Proposed course of action, owners and controls; approval not implied.]"]]},
};
export function createDocumentDraft(templateId: DocumentTemplateId = "corporate-letter", deterministic = false): DocumentDraft {
 const p = presets[templateId];
 return { schemaVersion:1,id:deterministic ? "initial-"+templateId : makeId(),templateId,title:p.title,documentRef:"",
   division:p.division,recipient:"",subject:p.subject,classification:templateId==="internal-memo"?"internal":templateId==="project-brief"?"confidential":"counterparty",
   date:new Date().toISOString().slice(0,10),blocks:p.blocks.map(([kind,text],i)=>deterministic ? {id:"initial-"+templateId+"-"+i,kind,text} : block(kind,text)) };
}
export const newBlock = (kind:DocumentBlockKind):DocumentBlock =>
 block(kind,kind==="heading"?"New section":kind==="bullets"?"First item":"");
export function validateDocumentDraft(value:unknown):value is DocumentDraft{
 if(!value || typeof value!=="object" || Array.isArray(value))return false;
 const d=value as Record<string,unknown>;
 const templateNames=TEMPLATE_CATALOG.map(t=>t.id);
 if(d.schemaVersion!==1 || typeof d.id!=="string" || d.id.length>200 ||
  !templateNames.includes(d.templateId as DocumentTemplateId) ||
  typeof d.title!=="string" || !d.title.trim() || d.title.length>240 ||
  typeof d.documentRef!=="string" || d.documentRef.length>120 ||
  typeof d.division!=="string" || d.division.length>200 ||
  typeof d.recipient!=="string" || d.recipient.length>500 ||
  typeof d.subject!=="string" || d.subject.length>600 ||
  !["internal","confidential","counterparty"].includes(d.classification as string) ||
  typeof d.date!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(d.date as string) ||
  !Number.isFinite(Date.parse((d.date as string)+"T00:00:00Z")) ||
  new Date((d.date as string)+"T00:00:00Z").toISOString().slice(0,10)!==d.date ||
  !Array.isArray(d.blocks) || d.blocks.length>250)return false;
 const seen=new Set<string>();
 return d.blocks.every(item=>{
  if(!item || typeof item!=="object" || Array.isArray(item))return false;
  const b=item as DocumentBlock;
  if(typeof b.id!=="string" || !b.id || b.id.length>200 || seen.has(b.id) ||
   !["heading","paragraph","bullets","callout"].includes(b.kind) ||
   typeof b.text!=="string" || b.text.length>20000)return false;
  seen.add(b.id);return true;
 });
}
export function documentReviewGaps(d:DocumentDraft):string[]{
 const gaps:string[]=[];
 if(!d.documentRef.trim()) gaps.push("Document reference has not been assigned");
 if(!d.recipient.trim() && d.classification==="counterparty") gaps.push("Recipient requires verification");
 if(!d.subject.trim()) gaps.push("Subject is required");
 if(d.blocks.length===0 || !d.blocks.some(b=>b.text.trim())) gaps.push("Document body is incomplete");
 if(d.blocks.some(b=>/\[[^\]]{3,}\]/.test(b.text)) || /\[[^\]]{3,}\]/.test(d.subject))
 gaps.push("Template placeholders must be replaced and verified");
 gaps.push("Authenticated review, approval and dispatch evidence are not connected");
 return gaps;
}
const esc=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const rows=(s:string)=>s.split(/\r?\n/).map(line=>esc(line));
export function renderDocumentHtml(d:DocumentDraft):string{
 const pieces=d.blocks.map(b=>{
  const text=rows(b.text);
  if(b.kind==="heading")return "<h2>"+text.join(" ")+"</h2>";
  if(b.kind==="bullets")return "<ul>"+text.filter(x=>x.trim()).map(x=>"<li>"+x+"</li>").join("")+"</ul>";
  if(b.kind==="callout")return '<aside class="notice">'+text.join("<br>")+"</aside>";
  return "<p>"+text.join("<br>")+"</p>";
 }).join("\n");
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(d.title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><style>
@page{size:A4;margin:17mm 18mm}*{box-sizing:border-box}body{margin:0;color:#152033;background:#fff;font:11pt/1.6 Arial,Helvetica,sans-serif}
.top{border-bottom:2px solid #C2A14A;padding-bottom:14px;display:flex;justify-content:space-between}
.brand{font-size:19pt;letter-spacing:.06em;font-weight:700;color:#04111F}.logo{height:65px;width:auto;max-width:250px;object-fit:contain;object-position:left}.legal{font-size:8pt;color:#526274}
.meta{font-size:8pt;color:#4c5e77;text-align:right}.draft{color:#955a00;font-size:8pt;letter-spacing:.07em;font-weight:700}
h1{font-size:24pt;line-height:1.18;color:#04111F;margin:32px 0 6px}h2{font-size:13pt;color:#07192F;margin:23px 0 9px;border-bottom:1px solid #e3e8ee;padding-bottom:5px}
p,li{overflow-wrap:anywhere;white-space:normal}p{margin:0 0 13px}.subject{font-size:12pt;font-weight:bold;margin:0 0 22px}
ul{padding-left:22px}.notice{background:#f7f4e9;border-left:3px solid #C2A14A;padding:12px;margin:14px 0}
.foot{margin-top:38px;border-top:1px solid #dce2e8;padding-top:12px;color:#526274;font-size:8pt}
@media print{.no-print{display:none}.draft{color:#955a00!important}h2,aside{break-after:avoid}}
</style></head><body><header class="top"><div><div class="brand"><img class="logo" src="${SAR_OFFICIAL_LOGO_DATA_URI}" alt="Shobane African Resources official logo"></div><div class="legal">Shobane African Resources (Pty) Ltd</div></div><div class="meta">DOCUMENT STUDIO · DRAFT<br>${esc(d.classification.toUpperCase())}<br><span class="draft">NOT APPROVED FOR ISSUE</span></div></header>
<h1>${esc(d.title)}</h1><p class="subject">${esc(d.subject)}</p><p>Reference: ${esc(d.documentRef||"Unassigned")} &nbsp; | &nbsp; Date: ${esc(d.date)}<br>Division: ${esc(d.division)}${d.recipient?"<br>To: "+esc(d.recipient):""}</p>
<main>${pieces}</main><footer class="foot">Shobane African Resources (Pty) Ltd · ${esc(d.classification)} · ${esc(d.documentRef||"unassigned reference")}<br>WORKING DRAFT — requires SAR approval, verified data and authorised issue. Official SAR brand asset · original website file preserved.</footer></body></html>`;
}
