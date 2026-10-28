import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("./customer-identity-legal-consent.REVIEW-ONLY.sql",import.meta.url),"utf8");
const names=[...sql.matchAll(/create table if not exists public\.(ds_customer_[a-z_]+)\s*\(/gi)].map(x=>x[1]);
test("three legal/identity tables protected by RLS and explicitly unissued",()=>{
 assert.equal(names.length,3);
 for(const name of names)assert.match(sql,new RegExp("alter table public\\."+name+" enable row level security","i"));
 assert.match(sql,/REVIEW ONLY \/ DO NOT APPLY/);
});
test("separate terms privacy and payment policy hashes bound via typed foreign keys",()=>{
 for(const p of ["terms","privacy","payments"]){
  assert.match(sql,new RegExp("foreign key\\("+p+"_policy_id,"+p+"_kind\\)","i"));
  assert.match(sql,new RegExp("check\\("+p+"_kind='"+p+"'\\)","i"));
 }
 assert.match(sql,/unique\(id,policy_kind\)/);
});
test("acceptance requires affirmative, customer review and no autocharge",()=>{
 for(const field of ["terms_seen","privacy_seen","payments_seen","review_confirmed","affirmative_agreement"]){
  assert.match(sql,new RegExp(field+" boolean not null check\\("+field+"=true\\)"));
 }
 assert.match(sql,/automatic_charge=false/);
 assert.match(sql,/service_code<>'COMPLETE_DEAL_ASSESSMENT' or amount_minor=0/);
});
test("independent reviewer and approved contract require distinct authority",()=>{
 assert.match(sql,/check\(reviewer_user_id<>customer_user_id\)/);
 assert.match(sql,/reviewed_by<>published_by/);
 assert.match(sql,/approval_event_id/);
 assert.match(sql,/source_evidence_sha256/);
});
test("customer may read only active-tenancy own receipt; verification proof never readable publicly",()=>{
 assert.match(sql,/customer_user_id=\(select auth\.uid\(\)\)/);
 assert.match(sql,/m\.membership_state='active'/);
 assert.doesNotMatch(sql,/create policy[^;]*on public\.ds_customer_verification_reviews for select/i);
 assert.doesNotMatch(sql,/create policy\s+[^;]*\bfor\s+(?:all|insert|update|delete)\b/i);
});
