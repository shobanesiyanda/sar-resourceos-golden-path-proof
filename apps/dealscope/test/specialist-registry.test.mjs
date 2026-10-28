import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {registryVersion,commodityRegistry,commodityIds,findSpecialist,verifyMaterialRoute} from "../lib/specialist-registry.mjs";
import {executeIntakeRequest} from "../lib/server/intake-service.mjs";
import {prepareAssessmentCandidate} from "../lib/server/assessment-workflow.mjs";

test("registry is versioned and provides distinct material forms, roles and capabilities",()=>{
 assert.match(registryVersion,/^2026-10-28/);
 for(const commodity of ["chrome","coal","manganese","lithium","gold","diesel","petrol","crude_oil"]){
  const spec=findSpecialist(commodity);
  assert.ok(spec);assert.ok(spec.roles.length>=3);assert.ok(spec.materials.length>=1);
  assert.ok(commodityIds.includes(commodity));
 }
 const chrome=findSpecialist("chrome");
 for(const form of ["ROM — high grade","Chrome sweepings","Chrome tailings","Chrome concentrate","Lumpy chrome ore"]){
  assert.ok(chrome.materials.some(m=>m.label===form),form);
 }
 assert.equal(findSpecialist("coal").assessmentCapability,"intake_only");
 assert.equal(findSpecialist("chrome").assessmentCapability,"indicative_chrome_only");
 assert.equal(findSpecialist("wrong"),null);
});
test("registry rejects unsupported commodity, material or physical route",()=>{
 assert.equal(verifyMaterialRoute({commodity:"unknown",materialForm:"ROM — high grade",route:"direct_trade"}).valid,false);
 assert.equal(verifyMaterialRoute({commodity:"chrome",materialForm:"diesel",route:"direct_trade"}).valid,false);
 assert.equal(verifyMaterialRoute({commodity:"chrome",materialForm:"Chrome concentrate",route:"process_feedstock",entryPoint:"source_offer"}).reason,"incompatible_material_route");
 assert.equal(verifyMaterialRoute({commodity:"chrome",materialForm:"Chrome tailings",route:"process_feedstock",entryPoint:"source_offer"}).valid,true);
});
test("buyer contract output concentrate may be satisfied by a processing route",()=>{
 const x=verifyMaterialRoute({commodity:"chrome",materialForm:"Chrome concentrate",route:"process_feedstock",entryPoint:"sale_contract"});
 assert.equal(x.valid,true);
 assert.equal(x.materialStage,"saleable_product");
});
test("legacy chrome product form aliases map to a canonical material",()=>{
 const x=verifyMaterialRoute({commodity:"chrome",materialForm:"concentrate",route:"direct_trade",entryPoint:"sale_contract"});
 assert.equal(x.valid,true);
 assert.equal(x.canonicalMaterialForm,"Chrome concentrate");
});
test("registry prevents spurious financial feasibility on catalog-only commodities",()=>{
 const source={sourceId:"coal1",channel:"manual",facts:{commodity:"coal",material_form:"ROM coal",commercial_role:"trader",fulfilment_route:"direct_trade",source_location:"Mine",feedstock_grade_pct:40,feedstock_quantity_dry_t:500}};
 const result=prepareAssessmentCandidate({entryPoint:"source_offer",sources:[source],referenceData:{
  sourceOfferCosts:{routeCostsComplete:true,allNonAcquisitionCostsZar:0,targetNetMarginPct:20},
  saleBenchmark:{priceZarPerDryT:999999}}});
 assert.equal(result.state,"specialist_pending");
 assert.deepEqual(result.outputs.gradeAlternatives,[]);
 assert.equal(result.outputs.purchaseCeiling,null);
});
test("intake rejects invalid material and route before invoking storage adapter",async()=>{
 let touched=false;
 const formValues={commodity:"chrome",entryPoint:"source_offer",materialForm:"Chrome concentrate",
  commercialRole:"trader",deliveryTerm:"EXW",fulfilmentRoute:"process_feedstock",
  pastedText:"Seller has material at mine"};
 const request={headers:{get:()=>String(600)},formData:async()=>({get:k=>formValues[k]??null,getAll:()=>[]})};
 const services={authenticate:async()=>({verified:true,activeMembership:true,tenantId:"TEN",userId:"USR",
  entitledToAssessment:true,currentLegalAcceptance:true}),
  persistAndExtractIntake:async()=>{touched=true;return null}};
 const result=await executeIntakeRequest({request,services});
 assert.equal(result.status,422);
 assert.equal(touched,false);
});
test("customer commodity selector consumes shared registry instead of a second shadow catalog",()=>{
 const page=readFileSync(new URL("../app/workspace/deals/new/AssessmentJourney.tsx",import.meta.url),"utf8");
 assert.match(page,/commodityRegistry,commodityIds/);
 assert.match(page,/catalog=commodityRegistry/);
 assert.doesNotMatch(page,/const catalog=\{/);
 assert.match(page,/assessmentCapability==="intake_only"/);
});
