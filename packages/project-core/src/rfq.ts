/** RFQ lifecycle contract. Auth, provider dispatch, inbox scan and persistence remain external. */
import type {Requirement} from "./simulation";
export type RfqDraft={id:string;projectId:string;version:number;recipients:string[];deadline:string;currency:"ZAR"|"USD";
 lines:{requirementId:string;specification:string;quantity:number;unit:string;documentId:string;sourceLocator:string}[];
 blockers:string[];status:"draft"};
export type ApprovedRfq=Omit<RfqDraft,"blockers"|"status">&{status:"approved_for_dispatch";approverId:string;approvalEventId:string;contentSeal:string};
export type Quote={status:"under_review"|"quarantined";rfqId:string;vendorId:string;messageId:string;
 items:{requirementId:string;quantity:number;unit:string;price:number}[];vat:number|null;delivery:number|null;issues:string[]};
const valid=(s:unknown):s is string=>typeof s==="string"&&s.trim().length>0;
const num=(n:unknown):n is number=>typeof n==="number"&&Number.isFinite(n)&&n>=0;
const validDate=(v:string):boolean=>{
 if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 const t=Date.parse(v+"T00:00:00Z");
 return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v&&t>=Date.now()-86400000;
};
const seal=(r:Pick<RfqDraft,"id"|"projectId"|"version"|"recipients"|"deadline"|"currency"|"lines">)=>
 JSON.stringify([r.id,r.projectId,r.version,r.recipients,r.deadline,r.currency,r.lines]);
export function prepareRfq(input:{id:string;projectId:string;version:number;recipients:string[];deadline:string;
 currency:"ZAR"|"USD";requirements:Requirement[]}):RfqDraft{
 const blockers:string[]=[];
 if(!valid(input.id)||!valid(input.projectId)||!Number.isSafeInteger(input.version)||input.version<1)
 blockers.push("Invalid RFQ identity");
 if(!validDate(input.deadline))blockers.push("Invalid or expired deadline");
 if(!["ZAR","USD"].includes(input.currency))blockers.push("Unsupported quote currency");
 if(!Array.isArray(input.recipients)||!input.recipients.length||
 input.recipients.some(x=>!valid(x))||new Set(input.recipients).size!==input.recipients.length)
 blockers.push("Unverified or duplicated recipient selection");
 if(!Array.isArray(input.requirements)||!input.requirements.length)blockers.push("No requirements");
 const lines=(input.requirements??[]).map(r=>{
   if(!r||!valid(r.id)||!r.verified||!valid(r.documentId)||!valid(r.sourceLocator)||
   !valid(r.title)||!valid(r.unit)||!num(r.quantity)||r.quantity===0)
   blockers.push((r?.id??"Unknown")+": evidence, specification or quantity unverified");
   return {requirementId:r?.id??"",specification:r?.title??"",quantity:r?.quantity??0,
   unit:r?.unit??"",documentId:r?.documentId??"",sourceLocator:r?.sourceLocator??""};
 });
 if(new Set(lines.map(x=>x.requirementId)).size!==lines.length)
 blockers.push("Duplicate requirement lines");
 return {id:input.id,projectId:input.projectId,version:input.version,recipients:[...(input.recipients??[])],
 deadline:input.deadline,currency:input.currency,lines,blockers,status:"draft"};
}
export function approveRfq(d:RfqDraft,a:{approverId:string;eventId:string;authorised:boolean;technicalReviewPassed:boolean;
 approvedVersion:number;approvedRecipients:string[]}):ApprovedRfq{
 if(d.status!=="draft"||d.blockers.length||!a.authorised||!a.technicalReviewPassed||
 !valid(a.approverId)||!valid(a.eventId)||a.approvedVersion!==d.version||
 JSON.stringify(a.approvedRecipients)!==JSON.stringify(d.recipients))
 throw new Error("RFQ approval rejected: authority, technical review, version and recipient controls required");
 const {status,blockers,...data}=d;
 return {...data,status:"approved_for_dispatch",approverId:a.approverId,approvalEventId:a.eventId,contentSeal:seal(d)};
}
export function dispatchIntent(r:ApprovedRfq,eventId:string){
 if(r.status!=="approved_for_dispatch"||!valid(eventId)||!valid(r.approverId)||
 !valid(r.approvalEventId)||r.contentSeal!==seal(r))
 throw new Error("RFQ content changed after approval or authority missing");
 return {status:"approved_intent" as const,idempotencyKey:"rfq:"+r.id+":v"+r.version,
 rfqId:r.id,recipients:[...r.recipients],eventId};
}
export function ingestQuote(r:ApprovedRfq,inbound:{rfqId:string;version:number;vendorId:string;messageId:string;
 scanned:boolean;senderVerified:boolean;attachmentHashes:string[];items:Quote["items"];vat:number|null;delivery:number|null},
 seenMessageIds:readonly string[]=[]):Quote{
 const issues:string[]=[];
 if(r.status!=="approved_for_dispatch"||inbound.rfqId!==r.id||inbound.version!==r.version)
 issues.push("RFQ/version mismatch");
 if(!r.recipients.includes(inbound.vendorId)||!inbound.senderVerified)issues.push("Sender/recipient mismatch");
 if(!valid(inbound.messageId)||seenMessageIds.includes(inbound.messageId))issues.push("Missing/replayed message");
 if(!inbound.scanned||!Array.isArray(inbound.attachmentHashes)||!inbound.attachmentHashes.length||
 inbound.attachmentHashes.some(x=>!valid(x)))issues.push("Attachment security incomplete");
 const expected=new Set(r.lines.map(x=>x.requirementId)),seen=new Set<string>();
 if(!Array.isArray(inbound.items)||inbound.items.length!==expected.size)issues.push("Missing or surplus quote lines");
 for(const q of inbound.items??[]){
   if(!expected.has(q.requirementId)||seen.has(q.requirementId)||!num(q.price)||!num(q.quantity)||q.quantity===0)
   issues.push("Invalid quote line");
   seen.add(q.requirementId);
   const orig=r.lines.find(x=>x.requirementId===q.requirementId);
   if(orig&&(q.unit!==orig.unit||q.quantity!==orig.quantity))issues.push("Technical quantity/unit deviation");
 }
 if(inbound.vat!==null&&!num(inbound.vat)||inbound.delivery!==null&&!num(inbound.delivery))
 issues.push("Invalid tax or transport amount");
 return {status:issues.length?"quarantined":"under_review",rfqId:inbound.rfqId,vendorId:inbound.vendorId,
 messageId:inbound.messageId,items:[...(inbound.items??[])],vat:inbound.vat,delivery:inbound.delivery,issues};
}
export function quoteProvisionalCost(q:Quote){
 if(q.status!=="under_review"||!num(q.vat)||!num(q.delivery))
 return {status:"incomplete" as const,total:0};
 const itemCosts=q.items.map(i=>i.quantity*i.price);
 const total=itemCosts.reduce((s,i)=>s+i,0)+q.vat+q.delivery;
 return [...itemCosts,total].every(Number.isFinite)?
 {status:"provisional" as const,total}:{status:"incomplete" as const,total:0};
}
