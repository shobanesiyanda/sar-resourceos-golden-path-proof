/**
 * SAR ResourceOS actual-versus-approved-plan reconciliation.
 * Pure operational variance reporting. Does not make GL entries or
 * infer cash movement, legal liability, financial recognition or execution.
 */
const present=s=>typeof s==="string"&&s.trim().length>0&&s.length<=200;
const amount=n=>typeof n==="number"&&Number.isFinite(n)&&n>=0;
const fail=(issues)=>({state:"blocked",issues,comparison:[],totals:null});
export function reconcileProjectPlan({baseline,actuals,asOfDay}){
 const issues=[];
 if(!baseline||baseline.approvalState!=="approved"||!present(baseline.baselineId)||
  !present(baseline.projectId)||!present(baseline.revisionHash)||
  !["ZAR","USD"].includes(baseline.currency)||
  !Array.isArray(baseline.tasks)||baseline.tasks.length===0||baseline.tasks.length>1000||
  !Array.isArray(actuals)||!Number.isSafeInteger(asOfDay)||asOfDay<0)
  return fail(["Approved baseline, source-verified actuals and explicit reporting day required"]);
 const tasks=new Map();
 for(const t of baseline.tasks){
  if(!t||!present(t.id)||tasks.has(t.id)||!amount(t.plannedCost)||
   !Number.isSafeInteger(t.plannedEndDay)||t.plannedEndDay<0)
   issues.push("Invalid/duplicate baseline task");
  else tasks.set(t.id,t);
 }
 const ids=new Set(),totals={plannedCost:0,actualCost:0,costVariance:0,
  plannedComplete:0,verifiedComplete:0,forecastRemainingCost:0};
 const states=new Map();
 for(const a of actuals){
  if(!a||!present(a.eventId)||ids.has(a.eventId)||a.projectId!==baseline.projectId||
   a.baselineId!==baseline.baselineId||!tasks.has(a.taskId)||
   !present(a.sourceRef)||a.verified!==true||!amount(a.costIncurred)||
   !Number.isSafeInteger(a.day)||a.day<0||a.day>asOfDay||
   !amount(a.completionPct)||a.completionPct>100){
    issues.push("Unverified, mismatched, future, invalid or duplicate actual");continue;
  }
  ids.add(a.eventId);
  const previous=states.get(a.taskId)??{cost:0,completion:0,lastDay:-1,events:0};
  if(a.day<previous.lastDay||a.completionPct<previous.completion)
    issues.push(a.taskId+": late or backwards completion record");
  states.set(a.taskId,{cost:previous.cost+a.costIncurred,
   completion:a.completionPct,lastDay:a.day,events:previous.events+1});
 }
 if(issues.length)return fail([...new Set(issues)]);
 const comparison=[];
 for(const task of tasks.values()){
  const state=states.get(task.id)??{cost:0,completion:0,lastDay:-1,events:0};
  const complete=state.completion===100;
  const shouldComplete=task.plannedEndDay<=asOfDay;
  const overrun=state.cost-task.plannedCost;
  const projectedRemaining=complete?0:Math.max(0,task.plannedCost-state.cost);
  totals.plannedCost+=task.plannedCost;totals.actualCost+=state.cost;
  if(shouldComplete)totals.plannedComplete++;
  if(complete)totals.verifiedComplete++;
  totals.forecastRemainingCost+=projectedRemaining;
  comparison.push({taskId:task.id,plannedCost:task.plannedCost,verifiedActualCost:state.cost,
   costVariance:overrun,completionPct:state.completion,plannedEndDay:task.plannedEndDay,
   lastEvidenceDay:state.lastDay,late:shouldComplete&&!complete,
   overspend:overrun>0,unverifiedAbsence:state.events===0,indicativeRemainingCost:projectedRemaining});
 }
 totals.costVariance=totals.actualCost-totals.plannedCost;
 if(Object.values(totals).some(v=>!Number.isFinite(v)))return fail(["Numerical overflow"]);
 const alerts=comparison.flatMap(x=>[
  ...(x.late?[x.taskId+": planned finish elapsed, completion not independently evidenced"]:[]),
  ...(x.overspend?[x.taskId+": verified recorded cost exceeds original task budget"]:[]),
  ...(x.unverifiedAbsence?[x.taskId+": no independent evidence of progress"]:[])
 ]);
 return {state:"provisional_variance",issues:[
  "Operational variance only: partial cost totals are not invoices, statutory GL, cash paid or final profitability",
  ...alerts],comparison,totals,baselineId:baseline.baselineId,baselineHash:baseline.revisionHash,
  projectId:baseline.projectId,asOfDay};
}
