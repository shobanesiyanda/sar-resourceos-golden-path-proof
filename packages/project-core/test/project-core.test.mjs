import test from "node:test";
import assert from "node:assert/strict";
import {simulateProject} from "../src/simulation.ts";
import {prepareRfq,approveRfq,dispatchIntent,ingestQuote,quoteProvisionalCost} from "../src/rfq.ts";
const source={id:"A",title:"Equipment A",category:"machinery",quantity:2,unit:"unit",
 unitCost:100,durationDays:3,leadDays:2,predecessors:[],documentId:"DOC-1",sourceLocator:"BOQ:12",verified:true};
const scenario=(requirements)=>({id:"SIM-1",currency:"ZAR",requirements,contingencyPct:10});
const draft=()=>prepareRfq({id:"RFQ-1",projectId:"PROJECT-1",version:1,recipients:["OEM-1"],
 deadline:"2026-11-30",currency:"ZAR",requirements:[source]});
const approved=()=>approveRfq(draft(),{approverId:"PROCUREMENT-1",eventId:"APPROVAL-1",authorised:true,
 technicalReviewPassed:true,approvedVersion:1,approvedRecipients:["OEM-1"]});
const inbound=(extra={})=>({rfqId:"RFQ-1",version:1,vendorId:"OEM-1",messageId:"REPLY-1",
 scanned:true,senderVerified:true,attachmentHashes:["sha256:fixture"],items:[
 {requirementId:"A",quantity:2,unit:"unit",price:180}],vat:54,delivery:40,...extra});
test("calculates WBS dates, costs, contingency and critical path",()=>{
 const r=simulateProject(scenario([source,{...source,id:"B",title:"Equipment B",predecessors:["A"],leadDays:1}]));
 assert.equal(r.status,"provisional");assert.equal(r.completionDays,8);assert.equal(r.knownCosts,400);
 assert.equal(r.totalBudget,440);assert.deepEqual(r.criticalPath,["A","B"]);
});
test("stress factors affect timing and costs",()=>{
 const r=simulateProject({...scenario([source]),costFactor:1.5,durationFactor:2});
 assert.equal(r.knownCosts,300);assert.equal(r.completionDays,8);
});
test("missing prices fail closed",()=>{
 assert.equal(simulateProject(scenario([{...source,unitCost:null}])).status,"incomplete");
});
test("source evidence gate fails closed",()=>{
 assert.equal(simulateProject(scenario([{...source,verified:false}])).status,"incomplete");
});
test("cycles and unknown predecessors are rejected",()=>{
 assert.equal(simulateProject(scenario([{...source,predecessors:["A"]}])).status,"incomplete");
 assert.equal(simulateProject(scenario([{...source,predecessors:["MISSING"]}])).status,"incomplete");
});
test("capacity shortages are rejected",()=>{
 assert.equal(simulateProject(scenario([{...source,capacityRequired:5,capacityAvailable:2}])).status,"incomplete");
});
test("numeric overflow is never presented as a budget",()=>{
 assert.equal(simulateProject(scenario([{...source,quantity:1e308,unitCost:1e308}])).status,"incomplete");
});
test("RFQ draft preserves evidence lineage and needs review",()=>{
 const r=draft();assert.equal(r.status,"draft");assert.equal(r.blockers.length,0);
 assert.equal(r.lines[0].documentId,"DOC-1");
});
test("unverified project documents block RFQ dispatch",()=>{
 const r=prepareRfq({id:"RFQ-2",projectId:"PROJECT",version:1,recipients:["OEM-1"],
 deadline:"2026-11-30",currency:"ZAR",requirements:[{...source,verified:false}]});
 assert.ok(r.blockers.length);
 assert.throws(()=>approveRfq(r,{approverId:"A",eventId:"E",authorised:true,technicalReviewPassed:true,
 approvedVersion:1,approvedRecipients:["OEM-1"]}));
});
test("exact recipient and human authority are mandatory",()=>{
 assert.throws(()=>approveRfq(draft(),{approverId:"A",eventId:"E",authorised:false,
 technicalReviewPassed:true,approvedVersion:1,approvedRecipients:["OEM-1"]}));
 assert.throws(()=>approveRfq(draft(),{approverId:"A",eventId:"E",authorised:true,
 technicalReviewPassed:true,approvedVersion:1,approvedRecipients:["OEM-2"]}));
});
test("approved intent is idempotently identified and has no sending side effect",()=>{
 const intent=dispatchIntent(approved(),"EVT-1");
 assert.equal(intent.idempotencyKey,"rfq:RFQ-1:v1");
 assert.equal(intent.status,"approved_intent");
});
test("changes after approval invalidate dispatch",()=>{
 const r=approved();r.lines[0].quantity=7;assert.throws(()=>dispatchIntent(r,"EVT"));
});
test("supplier response is ingested for review, never automatically approved",()=>{
 const r=ingestQuote(approved(),inbound());assert.equal(r.status,"under_review");
 assert.deepEqual(quoteProvisionalCost(r),{status:"provisional",total:454});
});
test("unmatched suppliers, replay and unscanned attachments are quarantined",()=>{
 assert.equal(ingestQuote(approved(),inbound({vendorId:"UNKNOWN"})).status,"quarantined");
 assert.equal(ingestQuote(approved(),inbound(),["REPLY-1"]).status,"quarantined");
 assert.equal(ingestQuote(approved(),inbound({scanned:false})).status,"quarantined");
});
test("unit deviations and missing landed costs never yield an accepted quote",()=>{
 assert.equal(ingestQuote(approved(),inbound({items:[{requirementId:"A",quantity:2,unit:"ton",price:180}]})).status,"quarantined");
 assert.equal(quoteProvisionalCost(ingestQuote(approved(),inbound({delivery:null}))).status,"incomplete");
});


test("impossible and past RFQ deadlines fail closed",()=>{
 for(const deadline of ["2026-02-30","2020-01-01","not-a-date"]){
 const d=prepareRfq({...draft(),deadline,requirements:[source]});
 assert.ok(d.blockers.length,deadline);
 }
});
test("unsupported RFQ currencies never advance",()=>{
 const d=prepareRfq({...draft(),currency:"FAKE",requirements:[source]});
 assert.ok(d.blockers.length);
});
test("duplicate requirement lines and absent units block authorisation",()=>{
 const d=prepareRfq({...draft(),requirements:[source,{...source}]});
 assert.ok(d.blockers.some(x=>x.includes("Duplicate")));
 const e=prepareRfq({...draft(),requirements:[{...source,unit:""}]});
 assert.ok(e.blockers.length);
});
test("empty attachment references and invalid received amounts are quarantined",()=>{
 assert.equal(ingestQuote(approved(),inbound({attachmentHashes:[""]})).status,"quarantined");
 assert.equal(ingestQuote(approved(),inbound({vat:-1})).status,"quarantined");
});
test("nonfinite quote multiplication cannot produce a provisional total",()=>{
 const q=ingestQuote(approved(),inbound({items:[{requirementId:"A",quantity:2,unit:"unit",price:1e308}]}));
 assert.equal(q.status,"under_review");
 assert.equal(quoteProvisionalCost(q).status,"incomplete");
});
