/** Source-dated indicative export parity; never a market quotation or contractual offer. */
export type ParityInput = {
  currency:"USD"|"ZAR"; fxZarPerUsd:number; cifChinaPerTonne:number;
  oceanPerTonne:number; marineInsurancePerTonne:number; portPerTonne:number;
  inlandPerTonne:number; handlingPerTonne:number; assayPerTonne:number;
  financePerTonne:number; otherRoutePerTonne:number;
  buyerPricePerTonne:number|null; source:string; asOf:string;
};
const valid=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
const validDate=(v:string):boolean=>{
 if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 const t=Date.parse(v+"T00:00:00Z");
 return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v&&t<=Date.now();
};
export function exportParity(input:ParityInput){
 const reasons:string[]=[];
 const vals=[input.fxZarPerUsd,input.cifChinaPerTonne,input.oceanPerTonne,
 input.marineInsurancePerTonne,input.portPerTonne,input.inlandPerTonne,
 input.handlingPerTonne,input.assayPerTonne,input.financePerTonne,input.otherRoutePerTonne];
 if(vals.some(v=>!valid(v))||input.fxZarPerUsd<=0||input.cifChinaPerTonne<=0)reasons.push("Invalid market and route inputs");
 if(!input.source?.trim()||!validDate(input.asOf))reasons.push("Dated price provenance required");
 if(!["USD","ZAR"].includes(input.currency))reasons.push("Unsupported currency");
 if(input.buyerPricePerTonne!==null&&(!valid(input.buyerPricePerTonne)||input.buyerPricePerTonne===0))
 reasons.push("Invalid separate buyer price");
 const empty=(errors:string[])=>({state:"incomplete" as const,reasons:errors,cifZar:0,fobZar:0,fotZar:0,confirmedBuyerPriceZar:null});
 if(reasons.length)return empty(reasons);
 const multiplier=input.currency==="USD"?input.fxZarPerUsd:1;
 const cifZar=input.cifChinaPerTonne*multiplier;
 const fobZar=cifZar-(input.oceanPerTonne+input.marineInsurancePerTonne)*multiplier;
 const fotZar=fobZar-(input.portPerTonne+input.inlandPerTonne+input.handlingPerTonne+
 input.assayPerTonne+input.financePerTonne+input.otherRoutePerTonne)*multiplier;
 const confirmedBuyerPriceZar=input.buyerPricePerTonne===null?null:input.buyerPricePerTonne*multiplier;
 if(![cifZar,fobZar,fotZar,...(confirmedBuyerPriceZar===null?[]:[confirmedBuyerPriceZar])].every(Number.isFinite))
 return empty(["Calculated amounts exceed safe numeric range"]);
 return {state:"indicative" as const,reasons:fotZar<0?["Below-zero FOT parity; indicative route uneconomic"]:[],
 cifZar,fobZar,fotZar,confirmedBuyerPriceZar};
}
