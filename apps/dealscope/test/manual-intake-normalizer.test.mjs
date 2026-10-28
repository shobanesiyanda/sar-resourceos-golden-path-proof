import test from "node:test";
import assert from "node:assert/strict";
import {normaliseManualDealIntake} from "../lib/server/manual-intake-normalizer.mjs";
import {executeIntakeRequest} from "../lib/server/intake-service.mjs";
const context={commodity:"chrome",materialForm:"ROM — high grade",commercialRole:"commodity trader",
 deliveryTerm:"EXW",fulfilmentRoute:"direct_trade"};
const manual={deliveryLocation:"Mine A stockpile",quantity:"500",grade:"40",sourcePrice:"1600",buyerPrice:null};
test("source offer maps its quantity, grade and asking price to feedstock, not buyer fields",()=>{
 const r=normaliseManualDealIntake({entryPoint:"source_offer",context,manual});
 assert.equal(r.state,"customer_claims_prepared");
 assert.equal(r.sourceFacts.feedstock_quantity_dry_t,500);
 assert.equal(r.sourceFacts.feedstock_grade_pct,40);
 assert.equal(r.sourceFacts.source_purchase_price_zar_per_dry_t,1600);
 assert.equal(r.sourceFacts.source_location,"Mine A stockpile");
 assert.equal(r.sourceFacts.buyer_quantity_dry_t,undefined);
 assert.equal(r.independentlyVerified,false);
});
test("buyer contract maps the same typed values to buyer requirement fields",()=>{
 const r=normaliseManualDealIntake({entryPoint:"sale_contract",context,manual:{...manual,buyerPrice:"2300"}});
 assert.equal(r.sourceFacts.buyer_quantity_dry_t,500);
 assert.equal(r.sourceFacts.buyer_product_grade_pct,40);
 assert.equal(r.sourceFacts.buyer_price_zar_per_dry_t,2300);
 assert.equal(r.sourceFacts.delivery_location,"Mine A stockpile");
 assert.equal(r.sourceFacts.source_purchase_price_zar_per_dry_t,undefined);
});
test("inapplicable opposite-side price cannot override the correct quote",()=>{
 const r=normaliseManualDealIntake({entryPoint:"source_offer",context,manual:{...manual,buyerPrice:"999999"}});
 assert.equal(r.sourceFacts.source_purchase_price_zar_per_dry_t,1600);
 assert.equal(r.sourceFacts.buyer_price_zar_per_dry_t,undefined);
});
test("empty optional numbers never fabricate a zero cost or grade",()=>{
 const r=normaliseManualDealIntake({entryPoint:"source_offer",context,manual:{quantity:"",grade:"",sourcePrice:"",buyerPrice:"",deliveryLocation:""}});
 assert.equal(r.state,"customer_claims_prepared");
 assert.equal(r.sourceFacts.feedstock_grade_pct,undefined);
 assert.equal(r.sourceFacts.source_purchase_price_zar_per_dry_t,undefined);
});
test("reject negative, excessive or malformed quantitative facts",()=>{
 for(const field of ["quantity","grade","sourcePrice"]){
  for(const value of ["-1","abc","Infinity","10e5"]){
   const r=normaliseManualDealIntake({entryPoint:"source_offer",context,manual:{...manual,[field]:value}});
   assert.equal(r.state,"blocked",field+"="+value);
  }
 }
 const r=normaliseManualDealIntake({entryPoint:"source_offer",context,manual:{...manual,grade:"101"}});
 assert.equal(r.state,"blocked");
});
test("reject unsupported route identifiers instead of accepting invented stages",()=>{
 const r=normaliseManualDealIntake({entryPoint:"source_offer",context:{...context,fulfilmentRoute:"verified_deal"},manual});
 assert.equal(r.state,"blocked");
});
test("secure intake adapter receives the mapped customer claims, not a verified contract",async()=>{
 let observed=null;
 const services={authenticate:async()=>({verified:true,activeMembership:true,tenantId:"ORG",userId:"USER",
  entitledToAssessment:true,currentLegalAcceptance:true}),
  persistAndExtractIntake:async payload=>{observed=payload;return {committed:true,tenantId:"ORG",ownerUserId:"USER",
   caseId:"CASE",sourceRevision:1,sources:[{sourceId:"M1",channel:"manual",facts:payload.sources.structuredCustomerFacts}]}}};
 const form={get:k=>({commodity:"chrome",materialForm:context.materialForm,commercialRole:context.commercialRole,
  deliveryTerm:context.deliveryTerm,fulfilmentRoute:"direct_trade",entryPoint:"source_offer",
  deliveryLocation:manual.deliveryLocation,quantity:manual.quantity,productGrade:manual.grade,sourcePrice:manual.sourcePrice}[k]??null),
  getAll:()=>[]};
 const request={headers:{get:()=>"800"},formData:async()=>form};
 const result=await executeIntakeRequest({request,services});
 assert.equal(result.status,200);
 assert.equal(observed.sources.structuredCustomerFacts.feedstock_quantity_dry_t,500);
 assert.equal(observed.sources.structuredCustomerFacts.source_purchase_price_zar_per_dry_t,1600);
 assert.equal(result.body.independentlyVerified,false);
});
