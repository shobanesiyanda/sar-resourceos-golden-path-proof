/**
 * DealScope Opportunity Intelligence Lifecycle — immutable commercial comparison,
 * evidence-expiry watch notices and reassessment intentions.
 * Pure untrusted-data boundary: NO Auth/RLS, source attestation, external
 * pricing retrieval, push notifications, persistence, billing or trade.
 */
const valid=(n)=>typeof n==="number"&&Number.isFinite(n)&&n>=0;
const present=(s,max=180)=>typeof s==="string"&&s.trim().length>0&&s.length<=max;
const sha=(s)=>typeof s==="string"&&/^[a-f0-9]{64}$/i.test(s);
const date=(s)=>present(s,35)&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 Number.isFinite(Date.parse(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
const fail=(issue)=>({state:"blocked",issues:[issue],comparison:null,notices:[]});
const validRun=(r)=>r&&present(r.id)&&sha(r.inputHash)&&sha(r.sourceSetHash)&&
 Number.isSafeInteger(r.version)&&r.version>0&&date(r.asOf)&&
 ["user_input_indicative","evidence_review_pending","evidence_reviewed"].includes(r.evidenceTier)&&
 r.result&&["qualified","rejected","incomplete"].includes(r.result.state)&&
 [r.result.revenue,r.result.directCost,r.result.netProfitBeforeTax,r.result.netMarginPct,
  r.result.acquisitionCostCeilingPerSourceTonne].every(n=>typeof n==="number"&&Number.isFinite(n));
function authorise(d,p){
 return d&&p?.authenticated===true&&p.tenantId===d.tenantId&&
  present(p.userId)&&Array.isArray(p.permissions)&&p.permissions.includes("deal_run_read")&&
  p.membershipActive===true&&present(d.id)&&present(d.tenantId);
}
/** Immutable comparison of two precomputed scenarios, never a commercial verification. */
export function compareDealRunHistory({dossier,principal,baseId,currentId}){
 if(!authorise(dossier,principal)||!Array.isArray(dossier.runs)||
   dossier.runs.length>1000||!present(baseId)||!present(currentId)||baseId===currentId)
  return fail("Authenticated same-tenant dossier and distinct versions required");
 const a=dossier.runs.find(r=>r.id===baseId),b=dossier.runs.find(r=>r.id===currentId);
 if(!validRun(a)||!validRun(b)||b.version<=a.version||b.asOf<a.asOf||
    a.currency!==b.currency||!["ZAR","USD"].includes(a.currency)||
    a.commodity!==b.commodity||a.stage!==b.stage||!present(a.commodity)||
    !["saleable_product","raw_feedstock"].includes(a.stage))
  return fail("Two compatible, ordered, source-linked scenario calculations required");
 const changes={
  revenue:b.result.revenue-a.result.revenue,
  attributableCosts:b.result.directCost-a.result.directCost,
  preTaxNetProfit:b.result.netProfitBeforeTax-a.result.netProfitBeforeTax,
  netMarginPoints:b.result.netMarginPct-a.result.netMarginPct,
  acquisitionCeilingPerSourceTonne:
   b.result.acquisitionCostCeilingPerSourceTonne-a.result.acquisitionCostCeilingPerSourceTonne
 };
 if(Object.values(changes).some(v=>!Number.isFinite(v)))return fail("Arithmetic overflow");
 const newInputs=a.inputHash!==b.inputHash,sourceChanged=a.sourceSetHash!==b.sourceSetHash;
 const changed=Object.values(changes).some(x=>x!==0)||newInputs||sourceChanged;
 return {state:changed?"changed":"unchanged",issues:[],
  comparison:{dossierId:dossier.id,tenantId:dossier.tenantId,
   baseId,currentId,currency:a.currency,changes,
   evidenceTierBefore:a.evidenceTier,evidenceTierAfter:b.evidenceTier,
   oldState:a.result.state,newState:b.result.state,sourceChanged,
   inputsChanged:newInputs,asOf:b.asOf,
   publicQualified:false, // Never qualify a publicly-listed opportunity by comparison alone.
   paidServiceDelivered:false // No billable report or usage entitlement created by arithmetic.
  },notices:changed?["Review changed evidence, cost assumptions and buyer/mandate validity before acting"]:[]};
}
/** Watches externally observed, source-linked evidence without buying analyses. */
export function assessOpportunityWatch({dossier,principal,evidence,asOf,newSignals=[]}){
 if(!authorise(dossier,principal)||!date(asOf)||!Array.isArray(evidence)||
    !Array.isArray(newSignals)||evidence.length>500||newSignals.length>500)
  return fail("Permissioned dossier, valid date and bounded evidence required");
 const references=new Set(),notices=[],signals=new Set();
 for(const e of evidence){
  if(!e||!present(e.id)||references.has(e.id)||!sha(e.sha256)||!date(e.observedOn)||
    !["buyer_indication","material_rights","assay","freight","processing","market_reference","supplier_quote"].includes(e.kind)||
    (e.expiresOn!==null&&e.expiresOn!==undefined&&!date(e.expiresOn))||
    !present(e.sourceLocator,500))
   return fail("Invalid, duplicate or untraceable source evidence");
  references.add(e.id);
  if(e.expiresOn&&e.expiresOn<asOf)notices.push({evidenceId:e.id,kind:"source_expired",impact:"needs_review"});
  if(e.observedOn>asOf)return fail("Future-dated evidence cannot be used");
 }
 for(const n of newSignals){
  if(!n||!present(n.id)||signals.has(n.id)||!references.has(n.evidenceId)||
     !sha(n.newSha256)||!date(n.recordedOn)||n.recordedOn>asOf)
   return fail("Unmatched, duplicated or future signal");
  signals.add(n.id);
  const original=evidence.find(x=>x.id===n.evidenceId);
  if(original.sha256!==n.newSha256)notices.push({evidenceId:n.evidenceId,kind:"new_source_version",impact:"needs_review"});
 }
 return {state:notices.length?"reassessment_advised":"current_to_known_evidence",
   issues:["Source existence, signatures, commercial truth and tenant permissions require authoritative backend checks"],
   comparison:null,notices,
   action:{type:"offer_optional_reassessment",automaticallyCharge:false,
     creditReserved:false,notificationSent:false,transactionExecuted:false}};
}
