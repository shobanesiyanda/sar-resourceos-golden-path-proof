import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {registryVersion} from "../lib/specialist-registry.mjs";
import {executeIntakeRequest} from "../lib/server/intake-service.mjs";
import {executeConfirmationRequest} from "../lib/server/assessment-confirmation.mjs";
import {executeAssessmentRequest} from "../lib/server/assessment-service.mjs";
import {prepareAssessmentCandidate} from "../lib/server/assessment-workflow.mjs";
const auth={verified:true,activeMembership:true,tenantId:"SAR-CUSTOMER-A",userId:"USER-A",
  entitledToAssessment:true,currentLegalAcceptance:true};
const source={sourceId:"doc1",channel:"uploaded_document",facts:{
 commodity:"chrome",material_form:"concentrate",commercial_role:"mandate",fulfilment_route:"process_feedstock",delivery_term:"FOT contract-defined",
 delivery_location:"City Deep",buyer_product_grade_pct:42,buyer_quantity_dry_t:1000,buyer_price_zar_per_dry_t:2300}};
const references={recovery:{pct:75,evidence:"hypothetical"},feedGrades:[28,29,30,31],
 haulage:{dryTonnes:1000,moisturePct:10,payloadWetTonnes:34,billableKmPerTrip:120,rateZarPerKm:25,rateBasis:"dated_market_indication"},
 costs:{routeCostsComplete:true,processingZar:700000,otherDirectZar:100000,financeZar:50000,targetNetMarginPct:15}};
const request=body=>new Request("https://dealscope.co.za/api/assessments",{
 method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
const form=(values,files=[])=>{
 const f=new FormData();
 for(const [key,value] of Object.entries(values))if(value!==null&&value!==undefined)f.append(key,String(value));
 for(const file of files)f.append("documents",new Blob(["x".repeat(file.size)],{type:"application/octet-stream"}),file.name);
 return f;
};
const intakeRequest=(values,files=[])=>new Request("https://dealscope.co.za/api/assessments/intake",{
 method:"POST",body:form(values,files)});
const values={commodity:"chrome",entryPoint:"sale_contract",materialForm:"concentrate",commercialRole:"mandate",
 deliveryTerm:"FOT contract-defined",pastedText:"Buyer requests 1000 dry tonnes of chrome concentrate 42% to City Deep"};
const saved={tenantId:auth.tenantId,ownerUserId:auth.userId,caseId:"CASE-A",sourceRevision:1,registryVersion,sourcePersisted:true,
 customerFactsConfirmed:true,confirmedSourceRevision:1,entryPoint:"sale_contract",sources:[source],conflicts:[]};
const intakeServices={authenticate:async()=>auth,persistAndExtractIntake:async()=>({...saved,committed:true})};
const confirmServices={authenticate:async()=>auth,readOwnedCase:async()=>saved,
 persistFactConfirmation:async()=>({committed:true,tenantId:auth.tenantId,caseId:"CASE-A",sourceRevision:1})};
const assessmentServices={authenticate:async()=>auth,readOwnedCase:async()=>saved,
 loadInternalReferences:async()=>references,persistCandidate:async()=>({committed:true,tenantId:auth.tenantId,caseId:"CASE-A",assessmentId:"ASSESSMENT-1"})};
test("no live customer intake or assessment without SAR-owned adapters",async()=>{
 assert.equal((await executeIntakeRequest({request:intakeRequest(values),services:null})).status,503);
 assert.equal((await executeConfirmationRequest({request:request({caseId:"CASE-A",confirm:true,sourceRevision:1}),services:null})).status,503);
 assert.equal((await executeAssessmentRequest({request:request({caseId:"CASE-A"}),services:null})).status,503);
});
test("intake rejects unauthorised account before reading data",async()=>{
 let read=false;const req={headers:{get:()=>"100"},formData:async()=>{read=true;return form(values)}};
 const result=await executeIntakeRequest({request:req,services:{...intakeServices,authenticate:async()=>({...auth,activeMembership:false})}});
 assert.equal(result.status,403);assert.equal(read,false);
});
test("intake rejects an absent information source",async()=>{
 const x=await executeIntakeRequest({request:intakeRequest({...values,pastedText:""}),services:intakeServices});
 assert.equal(x.status,422);
});
test("intake only returns tenant-owned persisted claims, never verified",async()=>{
 const x=await executeIntakeRequest({request:intakeRequest(values),services:intakeServices});
 assert.equal(x.status,200);assert.equal(x.body.caseId,"CASE-A");
 assert.equal(x.body.knownFacts.buyer_quantity_dry_t.evidence,"customer_asserted");
 assert.equal(x.body.independentlyVerified,false);
});
test("intake rejects wrong-tenant storage results",async()=>{
 const x=await executeIntakeRequest({request:intakeRequest(values),
  services:{...intakeServices,persistAndExtractIntake:async()=>({...saved,committed:true,tenantId:"TENANT-B"})}});
 assert.equal(x.status,503);
});
test("intake refuses oversized and unsupported uploads",async()=>{
 const files=[{name:"invoice.exe",size:2000}];
 const x=await executeIntakeRequest({request:intakeRequest(values,files),services:intakeServices});
 assert.equal(x.status,415);
});
test("confirmation is an audited server write, not just client checkbox",async()=>{
 const x=await executeConfirmationRequest({request:request({caseId:"CASE-A",confirm:true,sourceRevision:1}),services:confirmServices});
 assert.equal(x.status,200);assert.equal(x.body.independentlyVerified,false);
});
test("specialist registry revision changes require re-confirmation",async()=>{
 const requestBody=request({caseId:"CASE-A",confirm:true,sourceRevision:1});
 const outdated={...saved,registryVersion:"2026-10-01.0"};
 const confirmed=await executeConfirmationRequest({request:requestBody,services:{...confirmServices,readOwnedCase:async()=>outdated}});
 assert.equal(confirmed.status,409);
 const assessed=await executeAssessmentRequest({request:request({caseId:"CASE-A"}),services:{...assessmentServices,readOwnedCase:async()=>outdated}});
 assert.equal(assessed.status,409);
});
test("confirmation refuses stale source revisions",async()=>{
 const x=await executeConfirmationRequest({request:request({caseId:"CASE-A",confirm:true,sourceRevision:2}),services:confirmServices});
 assert.equal(x.status,409);
});
test("confirmation refuses other tenants and unresolved contradictions",async()=>{
 const x=await executeConfirmationRequest({request:request({caseId:"CASE-A",confirm:true,sourceRevision:1}),
  services:{...confirmServices,readOwnedCase:async()=>({...saved,tenantId:"TENANT-B"})}});
 assert.equal(x.status,404);
 const y=await executeConfirmationRequest({request:request({caseId:"CASE-A",confirm:true,sourceRevision:1}),
  services:{...confirmServices,readOwnedCase:async()=>({...saved,conflicts:[{field:"buyer_quantity_dry_t"}]})}});
 assert.equal(y.status,409);
});
test("assessment consumes only stored cases and trusted server references",async()=>{
 const x=await executeAssessmentRequest({request:request({caseId:"CASE-A"}),services:assessmentServices});
 assert.equal(x.status,200);assert.equal(x.body.reportIssued,false);
 assert.equal(x.body.outputs.gradeAlternatives[0].requiredDryTonnes,2000);
 assert.equal(x.body.outputs.freightBudget.estimatedZarPerDryT,99);
 assert.equal(x.body.verifiedDeal,false);
});
test("assessment rejects stale customer confirmation after source amendment",async()=>{
 const result=await executeAssessmentRequest({request:request({caseId:"CASE-A"}),
  services:{...assessmentServices,readOwnedCase:async()=>({...saved,sourceRevision:2,confirmedSourceRevision:1})}});
 assert.equal(result.status,404);
});
test("undeclared fulfilment route cannot trigger speculative wash recovery",()=>{
 const undecided={...source,facts:{...source.facts,fulfilment_route:"undecided"}};
 const result=prepareAssessmentCandidate({entryPoint:"sale_contract",sources:[undecided],referenceData:references});
 assert.equal(result.state,"route_choice_required");
 assert.equal(result.outputs.gradeAlternatives.length,0);
 assert.equal(result.outputs.routeOptions.length,3);
});
test("direct resale avoids ROM recovery and requires complete trading economics",()=>{
 const direct={...source,facts:{...source.facts,fulfilment_route:"direct_trade"}};
 const result=prepareAssessmentCandidate({entryPoint:"sale_contract",sources:[direct],referenceData:references});
 assert.equal(result.outputs.gradeAlternatives.length,0);
 assert.equal(result.outputs.directTrade.minimumProductDryTonnes,1000);
 assert.equal(result.outputs.directTrade.maximumPurchaseZarPerDryT,null);
});
test("direct purchase ceiling only when retention and full costs are provided",()=>{
 const direct={...source,facts:{...source.facts,fulfilment_route:"direct_trade"}};
 const result=prepareAssessmentCandidate({entryPoint:"sale_contract",sources:[direct],referenceData:{...references,directTradeRetentionPct:100}});
 assert.ok(result.outputs.directTrade.maximumPurchaseZarPerDryT>0);
 assert.equal(result.outputs.gradeAlternatives.length,0);
});
test("unverified or incomplete costs cannot generate a purchasing ceiling",()=>{
 const x=prepareAssessmentCandidate({entryPoint:"sale_contract",sources:[source],
  referenceData:{...references,costs:{...references.costs,routeCostsComplete:false}}});
 assert.equal(x.outputs.purchaseCeiling,null);
});
test("customer-supplied contradictory facts block assessment outputs",()=>{
 const x=prepareAssessmentCandidate({entryPoint:"sale_contract",sources:[source,
  {sourceId:"email1",channel:"pasted_text",facts:{buyer_quantity_dry_t:1500}}],referenceData:references});
 assert.equal(x.state,"fact_conflicts");assert.equal(x.outputs.gradeAlternatives.length,0);
});
test("request cannot override tenant, prices or market references",async()=>{
 const x=await executeAssessmentRequest({request:request({caseId:"CASE-A",tenantId:"TENANT-B"}),services:assessmentServices});
 assert.equal(x.status,400);
});
test("client route cannot bundle private DealScope calculation engines",()=>{
 const client=readFileSync(new URL("../app/workspace/deals/new/AssessmentJourney.tsx",import.meta.url),"utf8");
 assert.doesNotMatch(client,/chrome-route-engine|assessment-workflow|calculateDealRun|commercial-core/);
 const legacy=readFileSync(new URL("../app/runs/page.tsx",import.meta.url),"utf8");
 assert.match(legacy,/redirect\("\/workspace\/deals\/new"\)/);
});
