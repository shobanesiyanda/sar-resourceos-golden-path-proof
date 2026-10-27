import test from 'node:test';
import assert from 'node:assert/strict';
import {assessDealIntegrity as assess,INTEGRITY_CHECKS} from '../lib/deal-integrity.mjs';
const H="a".repeat(64),p={authenticated:true,activeMembership:true,tenantId:"ORG1",userId:"U1",permissions:["deal_integrity_assess"]};
const dossier={tenantId:"ORG1",id:"D1"},asOf="2026-10-27";
const check=(id,status)=>({id,status,sourceRef:"file-1",sourceHash:H,sourceLocator:"p1",observedOn:"2026-10-25",
 independentVerifierId:"V1",verificationMethod:"official provider callback",verifiedOn:"2026-10-26"});
const run=(checks,verification)=>assess({dossier,principal:p,checks,asOf,verification});
test("no evidence is cautionary not an allegation of fraud",()=>{
 const r=run([]);
 assert.equal(r.state,"private_guidance_only");assert.equal(r.report.stage,"investigate_further");
 assert.equal(r.report.actions.length,INTEGRITY_CHECKS.length);
 assert.equal(r.report.criminalityDetermination,false);
 assert.equal(r.report.permissionToPay,false);
});
test("contradictory stock ownership requires resolution and gives actionable investigation",()=>{
 const r=run([check("stock_rights","contradicted")]);
 assert.equal(r.report.stage,"stop_and_resolve");
 assert.equal(r.report.actions.find(x=>x.id==="stock_rights").priority,"stop_and_resolve");
 assert.ok(r.report.actions.find(x=>x.id==="stock_rights").how.includes("specific lot"));
});
test("customer self declaration never becomes independently corroborated",()=>{
 assert.equal(run([check("entity_registration","independently_corrobated")]).state,"blocked");
 assert.equal(run([check("entity_registration","independently_corrobated")],{serverEvidenceBound:true,reviewedEvidenceIds:[]}).state,"blocked");
});
test("fully reviewed checks still never certify an entire transaction as legitimate",()=>{
 const evidence=INTEGRITY_CHECKS.map(x=>check(x.id,"independently_corrobated"));
 const r=run(evidence,{serverEvidenceBound:true,reviewedEvidenceIds:evidence.map(x=>x.id)});
 assert.equal(r.report.stage,"checks_corrobated_with_residual_risk");
 assert.equal(r.report.verifiedLegitimacy,false);
 assert.equal(r.report.publicBadgeAuthorised,false);
 assert.equal(r.report.commercialViabilityUnassessed,true);
});
test("wrong tenant, unauthenticated assessors, duplicate checks and future evidence are denied",()=>{
 assert.equal(assess({dossier,principal:{...p,tenantId:"ORG2"},checks:[],asOf}).state,"blocked");
 assert.equal(run([check("entity_registration","uploaded"),check("entity_registration","uploaded")]).state,"blocked");
 assert.equal(run([{...check("entity_registration","uploaded"),observedOn:"2026-10-30"}]).state,"blocked");
});
test("expired corroborated evidence is reclassified stale and must be renewed",()=>{
 const c={...check("lab_provenance","independently_corrobated"),expiresOn:"2026-10-26"};
 const r=run([c],{serverEvidenceBound:true,reviewedEvidenceIds:["lab_provenance"]});
 assert.equal(r.report.findings.find(x=>x.id==="lab_provenance").state,"stale");
 assert.equal(r.report.summary.stale,1);
});
