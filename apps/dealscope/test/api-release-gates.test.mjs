import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("all four protected customer operations default 503 and no-store",()=>{
 for(const op of ["customer","assessments","orders","checkout"]){
  const src=read("app/api/"+op+"/route.ts");
  assert.match(src,/status:503/);
  assert.match(src,/Cache-Control":"no-store"/);
  assert.match(src,/not_activated/);
  assert.match(src,/export async function GET/);
  assert.match(src,/export async function POST/);
  assert.doesNotMatch(src,/service_role|supabaseAdmin|verifyPayment\(/i);
 }
});
test("public health explicitly says preview-only and checkout disabled",()=>{
 const src=read("app/api/health/route.ts");
 assert.match(src,/status: "preview_only"/);
 assert.match(src,/readiness: "not_ready"/);
 assert.match(src,/checkout: "disabled"/);
 assert.match(src,/no-store/);
});
test("Exchange remains unavailable rather than exposing customer opportunities",()=>{
 const src=read("app/api/exchange/route.ts");
 assert.match(src,/status: 503/);
 assert.match(src,/No tenant, customer, buyer or SAR internal data is accessible/);
 assert.match(src,/no-store/);
});
