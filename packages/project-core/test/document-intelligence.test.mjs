import test from "node:test";
import assert from "node:assert/strict";
import {compileExtractedProject} from "../src/document-intelligence.ts";
const document={id:"DOC1",version:"v1",sha256:"a".repeat(64),confidentiality:"third_party_confidential"};
const fact={id:"W1",title:"Excavator hire",category:"hire",quantity:1,unit:"machine",unitCost:25000,
 durationDays:7,leadDays:2,predecessors:[],documentId:"DOC1",documentVersion:"v1",sourceLocator:"BOQ:14",
 reviewState:"reviewed",reviewerId:"E1",reviewEventId:"APPROVED-1"};
const sample=(patch={})=>({projectId:"P1",documents:[document],facts:[{...fact}],...patch});
test("approved source-linked facts form a review-ready model",()=>{
 const r=compileExtractedProject(sample());assert.equal(r.state,"review_ready");
 assert.equal(r.requirements[0].verified,true);assert.equal(r.sourceIds[0],"DOC1:v1:BOQ:14");
});
test("unreviewed values cannot enter verified model",()=>{
 const r=compileExtractedProject(sample({facts:[{...fact,reviewState:"extracted"}]}));
 assert.equal(r.state,"incomplete");assert.equal(r.requirements[0].verified,false);
});
test("missing quotation is explicitly recorded",()=>{
 const r=compileExtractedProject(sample({facts:[{...fact,unitCost:null}]}));
 assert.ok(r.issues.some(x=>x.includes("quotation required")));
});
test("invalid original document hash fails",()=>{
 const r=compileExtractedProject(sample({documents:[{...document,sha256:"invalid"}]}));
 assert.equal(r.state,"incomplete");
});
test("wrong document version cannot masquerade as evidence",()=>{
 const r=compileExtractedProject(sample({facts:[{...fact,documentVersion:"v2"}]}));
 assert.equal(r.requirements[0].verified,false);
});
test("nonfinite quantities are blocked",()=>{
 const r=compileExtractedProject(sample({facts:[{...fact,quantity:Infinity}]}));
 assert.equal(r.state,"incomplete");
});
test("duplicate extracted requirement IDs cannot be accepted",()=>{
 const r=compileExtractedProject(sample({facts:[fact,{...fact}]}));
 assert.ok(r.issues.some(x=>x.includes("duplicate")));
});
test("predecessor must appear in the same project model",()=>{
 const r=compileExtractedProject(sample({facts:[{...fact,predecessors:["MISSING"]}]}));
 assert.equal(r.state,"incomplete");
});
