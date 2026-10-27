/** ResourceOS pure project simulator. No AI authority, database writes or supplier dispatch. */
export type Requirement = {
 id:string; title:string; category:"material"|"machinery"|"hire"|"transport"|"contractor"|"service";
 quantity:number; unit:string; unitCost:number|null; durationDays:number; leadDays:number;
 predecessors:string[]; documentId:string; sourceLocator:string; verified:boolean;
 capacityRequired?:number; capacityAvailable?:number;
};
export type Scenario={id:string; currency:"ZAR"|"USD"; requirements:Requirement[]; costFactor?:number; durationFactor?:number; contingencyPct?:number};
export type SimulationResult={status:"provisional"|"incomplete"; issues:string[]; scenarioId:string; completionDays:number;
 knownCosts:number; contingency:number; totalBudget:number; criticalPath:string[];
 tasks:{id:string;startDay:number;endDay:number;cost:number}[];
 indicativeCostByStartDay:{day:number;amount:number}[]};
const pos=(n:unknown):n is number=>typeof n==="number"&&Number.isFinite(n)&&n>0;
const nonneg=(n:unknown):n is number=>typeof n==="number"&&Number.isFinite(n)&&n>=0;
export function simulateProject(s:Scenario):SimulationResult{
 const issues:string[]=[]; const empty=():SimulationResult=>({status:"incomplete",issues:[...new Set(issues)],scenarioId:s.id,
 completionDays:0,knownCosts:0,contingency:0,totalBudget:0,criticalPath:[],tasks:[],indicativeCostByStartDay:[]});
 if(!s.id?.trim())issues.push("Scenario ID required");
 if(!["ZAR","USD"].includes(s.currency))issues.push("Unsupported currency");
 if(!Array.isArray(s.requirements)||!s.requirements.length)issues.push("Work packages required");
 const factor=s.costFactor??1,durationFactor=s.durationFactor??1,contingencyPct=s.contingencyPct??0;
 if(!pos(factor)||!pos(durationFactor)||!nonneg(contingencyPct)||contingencyPct>100)issues.push("Invalid scenario factors");
 const all=Array.isArray(s.requirements)?s.requirements:[];
 const ids=new Set<string>();const byId=new Map<string,Requirement>();
 for(const r of all){
   if(!r?.id?.trim()||ids.has(r.id)){issues.push("Missing or duplicate work package ID");continue;}
   ids.add(r.id);byId.set(r.id,r);
   if(!r.title?.trim()||!r.unit?.trim()||!r.documentId?.trim()||!r.sourceLocator?.trim())issues.push(r.id+": missing specification provenance");
   if(!pos(r.quantity)||!nonneg(r.unitCost)||!Number.isSafeInteger(r.durationDays)||r.durationDays<0||
      !Number.isSafeInteger(r.leadDays)||r.leadDays<0)issues.push(r.id+": invalid quantity/cost/dates");
   if(!r.verified)issues.push(r.id+": source not verified");
   if(r.capacityRequired!==undefined&&(!pos(r.capacityRequired)||!nonneg(r.capacityAvailable)||
     r.capacityRequired>(r.capacityAvailable??0)))issues.push(r.id+": resource capacity shortfall");
   if(!Array.isArray(r.predecessors))issues.push(r.id+": predecessors missing");
 }
 if(issues.length)return empty();
 const visit=new Map<string,number>(); const results=new Map<string,{id:string;startDay:number;endDay:number;cost:number}>();
 const paths=new Map<string,string[]>();
 function calculate(id:string):void{
   if(visit.get(id)===2)return;
   if(visit.get(id)===1){issues.push("Dependency cycle: "+id);return;}
   const r=byId.get(id);if(!r){issues.push("Missing predecessor: "+id);return;}
   visit.set(id,1);
   let previousFinish=0,previousPath:string[]=[];
   for(const p of r.predecessors){calculate(p);const previous=results.get(p);
     if(previous&&previous.endDay>previousFinish){previousFinish=previous.endDay;previousPath=paths.get(p)??[];}}
   if(issues.length)return;
   const startDay=Math.max(previousFinish,r.leadDays);
   const endDay=startDay+Math.ceil(r.durationDays*durationFactor);
   const cost=r.quantity*(r.unitCost as number)*factor;
   if(!Number.isSafeInteger(endDay)||!Number.isFinite(cost)){issues.push(r.id+": numeric overflow");return;}
   results.set(id,{id,startDay,endDay,cost});
   paths.set(id,[...(r.leadDays>previousFinish?[]:previousPath),id]);visit.set(id,2);
 }
 for(const id of ids)calculate(id);
 if(issues.length)return empty();
 const tasks=all.map(r=>results.get(r.id)!);
 const longest=tasks.reduce((a,b)=>b.endDay>a.endDay?b:a);
 const knownCosts=tasks.reduce((sum,r)=>sum+r.cost,0);
 const contingency=knownCosts*contingencyPct/100,totalBudget=knownCosts+contingency;
 const daily=new Map<number,number>();
 for(const task of tasks) daily.set(task.startDay,(daily.get(task.startDay)??0)+task.cost);
 const indicativeCostByStartDay=[...daily].sort((a,b)=>a[0]-b[0]).map(([day,amount])=>({day,amount}));
 if(![knownCosts,contingency,totalBudget,...indicativeCostByStartDay.map(x=>x.amount)].every(Number.isFinite)){issues.push("Budget overflow");return empty();}
 return {status:"provisional",issues:["Simulation only: costs, schedule, supplier quotes and execution require independent approvals"],
 scenarioId:s.id,completionDays:longest.endDay,knownCosts,contingency,totalBudget,
 criticalPath:paths.get(longest.id)??[],tasks,indicativeCostByStartDay};
}
