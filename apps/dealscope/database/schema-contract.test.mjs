import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const path = fileURLToPath(new URL("./initial-schema.REVIEW-ONLY.sql",import.meta.url));
const sql=readFileSync(path,"utf8");
const names=[...sql.matchAll(/create table if not exists public\.(ds_[a-z_]+)\s*\(/gi)].map(m=>m[1]);
test("greenfield schema has the nine deliberately scoped entities",()=>{
 assert.equal(names.length,9); assert.equal(new Set(names).size,9);
});
test("all planned public entities explicitly enable RLS",()=>{
 for(const name of names)assert.match(sql,new RegExp("alter table public\\."+name+" enable row level security","i"));
});
test("no RLS write policies have been granted to application clients",()=>{
 assert.doesNotMatch(sql,/create policy\s+[^;]*\bfor\s+(?:all|insert|update|delete)\b/i);
});
test("tenant membership ties to authoritative auth.users",()=>{
 assert.match(sql,/user_id uuid not null references auth\.users\(id\)/i);
 assert.match(sql,/m\.user_id\s*=\s*\(select auth\.uid\(\)\)/i);
});
test("customer membership must be active to see organisational data",()=>{
 assert.match(sql,/m\.membership_state\s*=\s*'active'/i);
});
test("customer-owned deal runs are creator-scoped",()=>{
 assert.match(sql,/creator_user_id\s*=\s*\(select auth\.uid\(\)\)/i);
});
test("offer disclosure buyer cannot equal seller",()=>{
 assert.match(sql,/check \(seller_organization_id <> buyer_organization_id\)/i);
});
test("payment provider event ID is uniquely constrained for idempotency",()=>{
 assert.match(sql,/unique \(provider,provider_event_id\)/i);
});
test("evidence, payment events and audit ledgers lack public read policies",()=>{
 for(const table of ["ds_market_evidence","ds_payment_events","ds_audit_events"]){
 assert.doesNotMatch(sql,new RegExp("create policy [\\s\\S]*?on public\\."+table+" for select","i"));
 }
});
test("proposal is explicitly non-deployed and excludes access to unrelated databases",()=>{
 assert.match(sql,/NOT an applied Supabase migration/);
 assert.match(sql,/NEVER run against BidOS/);
});

const paygSql=readFileSync(fileURLToPath(new URL("./payg-extension.REVIEW-ONLY.sql",import.meta.url)),"utf8");
test("PAYG report references only the actual creating user within tenant",()=>{
 assert.match(sql,/unique\s*\(organization_id,\s*id,\s*creator_user_id\)/i);
 assert.match(paygSql,/foreign key\s*\(organization_id,\s*deal_run_id,\s*customer_user_id\)\s*references public\.ds_deal_runs\s*\(organization_id,\s*id,\s*creator_user_id\)/i);
});
