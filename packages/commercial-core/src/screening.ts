/** Non-authoritative candidate filter. Real tenant isolation requires server identity and database RLS. */
export type Candidate={
 id:string;tenantId:string;currency:"ZAR"|"USD";
 acquisitionCost:number;additionalDirectCosts:number;financingCost:number;buyerRevenue:number;
 requiredNetMarginPct:number;priceSource:string;buyerVerified:boolean;materialVerified:boolean;
 acquisitionAvailabilityVerified:boolean;priceValidUntil:string;capitalCeiling:number;
};
const valid=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
const validDate=(v:string):boolean=>{
 if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 const t=Date.parse(v+"T00:00:00Z");
 return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v;
};
export function assessCandidate(c:Candidate,accessTenantId:string){
 const empty=(visibility:"denied"|"rejected",reasons:string[])=>({visibility,reasons,netProfit:0,netMarginPct:0,acquisitionCeiling:0});
 if(!c.tenantId||!accessTenantId||c.tenantId!==accessTenantId)
 return empty("denied",["Tenant not authorised"]);
 const reasons:string[]=[];
 if(!c.id?.trim()||!c.priceSource?.trim()||!c.buyerVerified||!c.materialVerified||
 !c.acquisitionAvailabilityVerified||!validDate(c.priceValidUntil)||
 c.priceValidUntil<new Date().toISOString().slice(0,10))
 reasons.push("Missing or expired commercial evidence");
 if(!["ZAR","USD"].includes(c.currency))reasons.push("Unsupported currency");
 if(![c.acquisitionCost,c.additionalDirectCosts,c.financingCost,c.buyerRevenue,c.requiredNetMarginPct,c.capitalCeiling].every(valid)||
 c.buyerRevenue<=0||c.requiredNetMarginPct>=100)
 reasons.push("Invalid commercial or financial values");
 if(reasons.length)return empty("rejected",reasons);
 const other=c.additionalDirectCosts+c.financingCost;
 const netProfit=c.buyerRevenue-c.acquisitionCost-other;
 const netMarginPct=netProfit/c.buyerRevenue*100;
 const acquisitionCeiling=c.buyerRevenue*(1-c.requiredNetMarginPct/100)-other;
 if(![other,netProfit,netMarginPct,acquisitionCeiling].every(Number.isFinite))
 return empty("rejected",["Numeric overflow"]);
 if(netProfit<=0||netMarginPct<c.requiredNetMarginPct||
 c.acquisitionCost>c.capitalCeiling||acquisitionCeiling<c.acquisitionCost)
 reasons.push("Not an evidence-qualified actionable profit opportunity");
 return {visibility:reasons.length?"rejected" as const:"qualified" as const,reasons,
 netProfit,netMarginPct,acquisitionCeiling:Math.max(0,acquisitionCeiling)};
}
