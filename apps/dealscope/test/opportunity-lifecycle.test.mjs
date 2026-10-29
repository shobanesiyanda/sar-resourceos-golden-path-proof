import test from "node:test";
import assert from "node:assert/strict";
import {compareDealRunHistory,assessOpportunityWatch} from "../lib/opportunity-lifecycle.mjs";
const H="a".repeat(64), H2="b".repeat(64),H3="c".repeat(64);
const p={authenticated:true,userId:"u1",tenantId:"org1",membershipActive:true,permissions:["deal_run_read"]};
const r=(id,v,net,hash=H)=>({id,version:v,currency:"ZAR",commodity:"CHROME",stage:"saleable_product",
 asOf:v===1?"2026-10-24":"2026-10-27",inputHash:hash,sourceSetHash:hash,evidenceTier:"user_input_indicative",
 result:{state:net>0?"qualified":"rejected",revenue:1000,directCost:1000-net,
 netProfitBeforeTax:net,netMarginPct:net/10,acquisitionCostCeilingPerSourceTonne:200+net}});
const dossier={tenantId:"org1",id:"deal-1",runs:[r("v1",1,-200),r("v2",2,100,H2)]};
const evidence=[{id:"assay-1",kind:"assay",sha256:H,observedOn:"2026-10-15",
 expiresOn:"2026-10-26",sourceLocator:"report:1"}];
test("versioned comparison measures real deltas without representing a verified buyer",()=>{
 const a=compareDealRunHistory({dossier,principal:p,baseId:"v1",currentId:"v2"});
 assert.equal(a.state,"changed");assert.equal(a.comparison.changes.preTaxNetProfit,300);
 assert.equal(a.comparison.publicQualified,false);assert.equal(a.comparison.paidServiceDelivered,false);
});
test("no fake recurring charge for unchanged arithmetic",()=>{
 const d={...dossier,runs:[r("a",1,100,H),r("b",2,100,H)]};
 const a=compareDealRunHistory({dossier:d,principal:p,baseId:"a",currentId:"b"});
 assert.equal(a.state,"unchanged");assert.equal(a.notices.length,0);
});
test("cross-tenant, inactive roles and incompatible commodities fail",()=>{
 assert.equal(compareDealRunHistory({dossier,principal:{...p,tenantId:"org2"},baseId:"v1",currentId:"v2"}).state,"blocked");
 assert.equal(compareDealRunHistory({dossier,principal:{...p,membershipActive:false},baseId:"v1",currentId:"v2"}).state,"blocked");
 const d={...dossier,runs:[dossier.runs[0],{...dossier.runs[1],commodity:"COAL"}]};
 assert.equal(compareDealRunHistory({dossier:d,principal:p,baseId:"v1",currentId:"v2"}).state,"blocked");
});
test("expiry and changed source trigger a recommendation, never billing or sharing",()=>{
 const a=assessOpportunityWatch({dossier,principal:p,asOf:"2026-10-27",evidence,
 newSignals:[{id:"evt",evidenceId:"assay-1",recordedOn:"2026-10-27",newSha256:H3}]});
 assert.equal(a.state,"reassessment_advised");assert.equal(a.notices.length,2);
 assert.equal(a.action.automaticallyCharge,false);assert.equal(a.action.notificationSent,false);
});
test("watch prevents forged references and inventing future market evidence",()=>{
 assert.equal(assessOpportunityWatch({dossier,principal:p,asOf:"2026-10-27",evidence,
 newSignals:[{id:"e",evidenceId:"other",recordedOn:"2026-10-27",newSha256:H2}]}).state,"blocked");
 assert.equal(assessOpportunityWatch({dossier,principal:p,asOf:"2026-10-27",evidence:[{...evidence[0],observedOn:"2026-10-30"}]}).state,"blocked");
});
