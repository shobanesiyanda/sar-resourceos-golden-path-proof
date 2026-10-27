/**
 * SAR ResourceOS: source-linked simulation-to-Document-Studio preparation.
 * PURE DRAFT ADAPTER. No price lookup, legal certification, sending, payments,
 * approvals, persistence, database writes or live project execution.
 */
const present=(x,max=300)=>typeof x==='string'&&!!x.trim()&&x.length<=max;
const validAmount=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/i.test(x);
const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&
 Number.isFinite(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const DIVISIONS={
 commodity_trading:'Commodity Trading',
 mining_contract_services:'Mining & Contract Services',
 project_development:'Project Development & Technologically Informed Coordination'
};
const money=(amount,currency)=>currency+' '+amount.toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
function draft({id,date,type,title,division,subject,classification,sections}){
 const prefix='draft-'+id+'-'+type+'-'+date;
 return {schemaVersion:1,id:prefix,templateId:type,title,
  documentRef:'SAR-WORKING-'+id+'-'+type+'-'+date.replaceAll('-',''),
  division,recipient:'',subject,classification,date,
  blocks:sections.map(([kind,text],i)=>({id:prefix+'-'+i,kind,text}))};
}
/** @returns {state:'blocked'|'draft_only',issues:string[],documents:object[],comparison:object[]} */
export function prepareSimulatedProjectDocuments(input){
 const issues=[], fail=()=>({state:'blocked',issues:[...new Set(issues)],documents:[],comparison:[]});
 if(!input||typeof input!=='object'||Array.isArray(input))return {state:'blocked',issues:['Project input required'],documents:[],comparison:[]};
 const {projectId,projectName,division,date,currency,inputVersion,sourceSetHash,sources,scenarios,costing,rfq}=input;
 if(!present(projectId,100)||!/^[a-z0-9][a-z0-9_-]*$/i.test(projectId))issues.push('Invalid project ID');
 if(!present(projectName,200))issues.push('Project name required');
 if(!Object.hasOwn(DIVISIONS,division))issues.push('Invalid SAR division');
 if(!validDate(date))issues.push('Invalid date');
 if(!['ZAR','USD'].includes(currency))issues.push('Unsupported currency');
 if(!present(inputVersion,100)||!hash(sourceSetHash))issues.push('Input/source version evidence required');
 if(!Array.isArray(sources)||!sources.length||sources.length>200)issues.push('Original document manifest required');
 const sourceIds=new Set();
 for(const s of Array.isArray(sources)?sources:[]){
  if(!s||!present(s.documentId,120)||sourceIds.has(s.documentId)||!present(s.version,100)||!hash(s.sha256)||!present(s.locator,300))
   issues.push('Invalid/duplicate document or source locator');
  else sourceIds.add(s.documentId);
 }
 if(!Array.isArray(scenarios)||scenarios.length<2||scenarios.length>12)
  issues.push('At least two compatible recorded scenarios are required');
 const scenarioIds=new Set();let baselineCount=0;
 for(const s of Array.isArray(scenarios)?scenarios:[]){
  if(!s||!present(s.id,100)||scenarioIds.has(s.id)||!['baseline','upside','downside','alternative'].includes(s.kind)||
     s.sourceSetHash!==sourceSetHash){issues.push('Scenario identity or source-version mismatch');continue;}
  scenarioIds.add(s.id);if(s.kind==='baseline')baselineCount++;
  const r=s.result;
  if(!r||r.status!=='provisional'||r.scenarioId!==s.id||!validAmount(r.knownCosts)||!validAmount(r.contingency)||
     !validAmount(r.totalBudget)||!Number.isSafeInteger(r.completionDays)||r.completionDays<0||
     !Array.isArray(r.tasks)||!r.tasks.length||!Array.isArray(r.criticalPath)||
     r.criticalPath.some(t=>!present(t,100))||
     r.tasks.some(t=>!present(t.id,120)||!Number.isSafeInteger(t.startDay)||t.startDay<0||
       !Number.isSafeInteger(t.endDay)||t.endDay<t.startDay||!validAmount(t.cost))||
     Math.abs(r.knownCosts+r.contingency-r.totalBudget)>Math.max(.01,r.totalBudget*1e-10))
   issues.push((s.id||'Unknown')+': invalid or unready simulation');
 }
 if(baselineCount!==1)issues.push('Exactly one baseline scenario required');
 if(!Array.isArray(costing)||!costing.length||costing.length>500)issues.push('Cost-source classifications required');
 const costIds=new Set();
 for(const c of Array.isArray(costing)?costing:[]){
  if(!c||!present(c.requirementId,120)||costIds.has(c.requirementId)||
     !['supplier_quote','document_rate','assumption'].includes(c.basis)||!present(c.sourceRef,300)||typeof c.reviewed!=='boolean')
    issues.push('Missing or invalid cost source/review');
  else costIds.add(c.requirementId);
 }
 const baseline=(Array.isArray(scenarios)?scenarios:[]).find(s=>s?.kind==='baseline');
 for(const t of baseline?.result?.tasks??[])if(!costIds.has(t.id))issues.push(t.id+': cost source not supplied');
 for(const k of ['risks','unresolved']){
  if(!Array.isArray(input[k]??[])||(input[k]??[]).length>50||(input[k]??[]).some(x=>!present(x,500)))
   issues.push('Invalid '+k+' register');
 }
 if(rfq!==undefined){
  if(!rfq||rfq.status!=='draft'||rfq.projectId!==projectId||rfq.currency!==currency||
    !present(rfq.id,100)||!validDate(rfq.deadline)||!Number.isSafeInteger(rfq.version)||rfq.version<1||
    !Array.isArray(rfq.blockers)||rfq.blockers.length||!Array.isArray(rfq.lines)||!rfq.lines.length||rfq.lines.length>200||
    rfq.lines.some(l=>!present(l.requirementId,120)||!present(l.specification,1000)||!validAmount(l.quantity)||
      l.quantity===0||!present(l.unit,50)||!sourceIds.has(l.documentId)||!present(l.sourceLocator,300)))
   issues.push('RFQ has unresolved scope, version or evidence blockers');
 }
 if(issues.length)return fail();
 const comparison=scenarios.map(s=>({id:s.id,kind:s.kind,cost:s.result.totalBudget,durationDays:s.result.completionDays,
   costDelta:s.result.totalBudget-baseline.result.totalBudget,
   durationDeltaDays:s.result.completionDays-baseline.result.completionDays}));
 const evidence=sources.map(s=>s.documentId+' v'+s.version+' at '+s.locator+' | SHA256 '+s.sha256).join('\n');
 const cases=comparison.map(s=>s.kind.toUpperCase()+' ('+s.id+'): '+money(s.cost,currency)+
   ', '+s.durationDays+' days, cost difference '+money(s.costDelta,currency)+
   ', time difference '+s.durationDeltaDays+' days').join('\n');
 const costLines=costing.map(c=>c.requirementId+': '+c.basis+', '+c.sourceRef+', reviewer state: '+(c.reviewed?'recorded':'unreviewed')).join('\n');
 const open=[...(input.unresolved??[])];
 if(costing.some(c=>c.basis!=='supplier_quote'||!c.reviewed))
  open.push('Pricing not uniformly supported by independently reviewed supplier quotations; model inputs are indicative.');
 open.push('Independent technical, procurement, legal, funds, permits and contracting approvals remain required.');
 open.push('Peak cash requirement, working capital, invoice timing, net returns and buyer revenue are not calculated by the basic scheduler.');
 const common=[
  ['callout','SYSTEM-PREPARED WORKING DRAFT. No engineering certification, binding offer, RFQ dispatch or funds authorisation.'],
  ['heading','Project and input revision'],['paragraph',projectName+' / '+projectId+' / '+inputVersion+' / source set '+sourceSetHash],
  ['heading','Source documentation'],['bullets',evidence],
  ['heading','Simulation comparison'],['bullets',cases],
  ['heading','Cost provenance'],['bullets',costLines],
  ['heading','Open decisions and limitations'],['bullets',open.join('\n')]
 ];
 const label=DIVISIONS[division];
 const documents=[
  draft({id:projectId,date,type:'project-brief',title:'Simulation feasibility brief — '+projectName,
    subject:'Unapproved feasibility options for '+projectId,division:label,classification:'confidential',
    sections:[...common,['heading','Baseline critical path'],['paragraph',baseline.result.criticalPath.join(' → ')||'Unestablished'],
      ['heading','Baseline budget and schedule'],['paragraph',money(baseline.result.totalBudget,currency)+
        ' including model contingency '+money(baseline.result.contingency,currency)+
        ', '+baseline.result.completionDays+' indicative days.'],
      ['heading','Risk register'],['bullets',(input.risks??[]).join('\n')||'No separate risk register supplied; risk absence not implied.']]}),
  draft({id:projectId,date,type:'internal-memo',title:'Project decision options — '+projectName,
    subject:'Independent approval required for '+projectId,division:'SAR Executive Management',classification:'internal',
    sections:[...common,['heading','Decision required'],['paragraph','Validate technical feasibility, supplier capacity and cost support; consider alternatives; request formal sign-offs.'],
      ['heading','Decision boundary'],['paragraph','This draft cannot recommend a commercially binding option without verified revenue, capital/cash timing and legal commitments.']]})
 ];
 if(rfq)documents.push(draft({id:projectId,date,type:'rfq',title:'UNSENT RFQ draft — '+projectName,
  subject:'Indicative vendor response to '+rfq.id+' revision '+rfq.version,division:label,classification:'counterparty',
  sections:[['callout','UNSENT RFQ DRAFT. Human scope review, exact recipient verification and explicit dispatch authorisation remain required.'],
    ['heading','Source-linked requested items'],['bullets',rfq.lines.map(l=>l.requirementId+': '+l.specification+
      ', '+l.quantity+' '+l.unit+' ('+l.documentId+' '+l.sourceLocator+')').join('\n')],
    ['heading','Commercial information requested'],['paragraph','Currency '+currency+', deadline '+rfq.deadline+
      '. Request line pricing, VAT, transport, mobilisation, certifications, exclusions, lead time and quote validity.'],
    ['heading','Workflow status'],['paragraph',rfq.id+' / v'+rfq.version+
      ': a draft for Document Studio review only. No supplier communications, orders or awards have occurred.']]}));
 return {state:'draft_only',issues:open,documents,comparison};
}
