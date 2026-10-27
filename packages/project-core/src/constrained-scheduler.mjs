/**
 * Deterministic resource-constrained project scheduling for reviewed work packages.
 * Produces a feasible indicative schedule, NOT a globally optimal schedule or mobilisation order.
 * No autonomous execution, professional certification or cash authorisation.
 */
const positive = n => typeof n === 'number' && Number.isFinite(n) && n > 0;
const nonnegative = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const present = s => typeof s === 'string' && s.trim().length > 0;
export function scheduleConstrainedProject({projectId,packages,pools,horizonDays=365,priceFactor=1}) {
  const issues=[], empty=()=>({state:'incomplete',issues:[...new Set(issues)],tasks:[],finishDay:0,
    bottlenecks:[],totalBaseCost:0,indicativeCostsByDay:[]});
  if(!present(projectId)||!Array.isArray(packages)||!packages.length||packages.length>500||
    !Array.isArray(pools)||!Number.isSafeInteger(horizonDays)||horizonDays<1||horizonDays>3650||!positive(priceFactor))
    {issues.push('Invalid scenario, package count, pools or scheduling horizon');return empty();}
  const capacities=new Map();
  for(const pool of pools){
    if(!pool||!present(pool.id)||capacities.has(pool.id)||!positive(pool.capacity))
      issues.push('Invalid/duplicate resource pool');
    else capacities.set(pool.id,pool.capacity);
  }
  const map=new Map();
  for(const p of packages){
    if(!p||!present(p.id)||map.has(p.id)){issues.push('Invalid/duplicate task');continue;}
    map.set(p.id,p);
    if(!p.verified||!present(p.sourceDocumentId)||!present(p.sourceLocator)||
       !Number.isSafeInteger(p.durationDays)||p.durationDays<1||
       !Number.isSafeInteger(p.earliestStartDay)||p.earliestStartDay<0||
       !nonnegative(p.baseCost)||!Array.isArray(p.predecessors)||!Array.isArray(p.resources))
      issues.push(p.id+': missing verified scope, cost, timing or resource requirements');
    for(const r of p.resources??[]){
      if(!r||!present(r.poolId)||!positive(r.units)||!capacities.has(r.poolId)||
         r.units>(capacities.get(r.poolId)??0))issues.push(p.id+': resource demand exceeds capacity');
    }
  }
  if(issues.length)return empty();
  const order=[],state=new Map();
  function visit(id){
    if(state.get(id)===2)return;
    if(state.get(id)===1){issues.push('Cyclic task dependency');return;}
    const p=map.get(id);
    if(!p){issues.push('Missing predecessor '+id);return;}
    state.set(id,1);for(const dep of p.predecessors)visit(dep);
    if(issues.length)return;state.set(id,2);order.push(p);
  }
  for(const p of packages)visit(p.id);
  if(issues.length)return empty();
  const occupied=new Map(),result=new Map(),delays=[];
  for(const p of order){
    let earliest=p.earliestStartDay;
    for(const dep of p.predecessors)earliest=Math.max(earliest,result.get(dep).endDay);
    let start=-1;
    let limitingResource=null;
    for(let day=earliest;day+p.durationDays<=horizonDays;day++){
      let fits=true;
      for(let current=day;current<day+p.durationDays&&fits;current++){
        const used=occupied.get(current)??new Map();
        for(const r of p.resources){
          if((used.get(r.poolId)??0)+r.units>capacities.get(r.poolId)){
            limitingResource=r.poolId;fits=false;break;
          }
        }
      }
      if(fits){start=day;break;}
    }
    if(start<0){issues.push(p.id+': no feasible resource slot within scheduling horizon');return empty();}
    for(let day=start;day<start+p.durationDays;day++){
      const used=occupied.get(day)??new Map();
      for(const r of p.resources)used.set(r.poolId,(used.get(r.poolId)??0)+r.units);
      occupied.set(day,used);
    }
    if(start>earliest)delays.push({taskId:p.id,resourceId:limitingResource,
      extraDays:start-earliest});
    const cost=p.baseCost*priceFactor;
    if(!nonnegative(cost)) {issues.push(p.id+': cost arithmetic overflow');return empty();}
    result.set(p.id,{id:p.id,startDay:start,endDay:start+p.durationDays,cost});
  }
  const tasks=packages.map(p=>result.get(p.id));
  const totalBaseCost=tasks.reduce((sum,t)=>sum+t.cost,0);
  if(!nonnegative(totalBaseCost)){issues.push('Total cost arithmetic overflow');return empty();}
  const costs=new Map();for(const t of tasks)costs.set(t.startDay,(costs.get(t.startDay)??0)+t.cost);
  if([...costs.values()].some(x=>!nonnegative(x))){issues.push('Daily staged cost arithmetic overflow');return empty();}
  return {state:'provisional_schedule',issues:['Resource-feasible, not schedule-optimal or approved for execution'],
    tasks,finishDay:Math.max(...tasks.map(t=>t.endDay)),bottlenecks:delays,totalBaseCost,
    indicativeCostsByDay:[...costs].sort((a,b)=>a[0]-b[0]).map(([day,amount])=>({day,amount}))};
}
