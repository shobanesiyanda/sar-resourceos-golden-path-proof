import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("./trial-entitlements.REVIEW-ONLY.sql",import.meta.url),"utf8");
const entities=[...sql.matchAll(/create table if not exists public\.(ds_intro_cycle_[a-z_]+)\s*\(/g)].map(x=>x[1]);
const tableBody=name=>{
 const marker="create table if not exists public."+name+" (";
 const a=sql.indexOf(marker);assert.ok(a>=0);
 const b=sql.indexOf("\n);",a);assert.ok(b>a);
 return sql.slice(a,b+3);
};
test("six bounded intro-cycle tables and full RLS in review-only schema",()=>{
 assert.equal(entities.length,6);assert.equal(new Set(entities).size,6);
 for(const t of entities)assert.match(sql,new RegExp("alter table public\\."+t+" enable row level security"));
 assert.match(sql,/REVIEW ONLY: DO NOT EXECUTE/);
});
test("composite entitlement target is uniquely indexed for campaign and dossier FKs",()=>{
 const e=tableBody("ds_intro_cycle_entitlements");
 assert.match(e,/unique\(organisation_id,id\)/);
 assert.match(tableBody("ds_intro_cycle_campaign_approvals"),/foreign key\(organisation_id,entitlement_id\)[\s\S]*?references public\.ds_intro_cycle_entitlements\(organisation_id,id\)/);
 assert.match(tableBody("ds_intro_cycle_cases"),/foreign key\(organisation_id,entitlement_id\)[\s\S]*?references public\.ds_intro_cycle_entitlements\(organisation_id,id\)/);
});
test("claim ownership cannot be swapped during entitlement grant",()=>{
 assert.match(tableBody("ds_intro_cycle_claims"),/unique\(organisation_id,id,owner_user_id\)/);
 assert.match(tableBody("ds_intro_cycle_entitlements"),/foreign key\(organisation_id,claim_id,owner_user_id\)[\s\S]*?references public\.ds_intro_cycle_claims\(organisation_id,id,owner_user_id\)/);
});
test("exactly one default full free case; optional second independently approved",()=>{
 const offer=tableBody("ds_intro_cycle_offers"),ent=tableBody("ds_intro_cycle_entitlements");
 assert.match(offer,/included_cycles=1/);assert.match(offer,/price_minor=0/);
 assert.match(offer,/auto_converts=false/);assert.match(offer,/requires_payment_method=false/);
 assert.match(ent,/cycles_granted between 1 and 2/);
 assert.match(tableBody("ds_intro_cycle_campaign_approvals"),/check\(valid_until>reviewed_at\)/);
});
test("no public write policies or private eligibility HMAC reads",()=>{
 assert.doesNotMatch(sql,/create policy\s+[^;]*\bfor\s+(?:all|insert|update|delete)\b/i);
 assert.doesNotMatch(sql,/create policy\s+[^;]*on public\.ds_intro_cycle_claims for select/i);
 assert.doesNotMatch(sql,/create policy\s+[^;]*on public\.ds_intro_cycle_events for select/i);
});
test("delivery proof is mandatory and no time-limit trial grants",()=>{
 assert.match(tableBody("ds_intro_cycle_cases"),/state<>'delivered' or \(delivered_report_ref is not null/);
 assert.doesNotMatch(sql,/days_limit\s+integer|trial_expires_at\s+timestamptz/i);
});
