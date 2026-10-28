import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("all mandatory public legal routes exist and share footer/operator disclosure",()=>{
 const pages=["legal","terms","privacy","payments","invoicing"];
 const shared=read("app/legal/_components.tsx");
 for(const page of pages){
  const path="app/"+page+"/page.tsx";
  assert.equal(existsSync(new URL("../"+path,import.meta.url)),true,path);
  const c=read(path);
  assert.match(c,/LegalShell/);
 }
 for(const path of pages.map(p=>"/"+p))assert.ok(shared.includes(path));
 assert.match(shared,/Shobane African Resources \(Pty\) Ltd/);
 assert.match(shared,/Development legal draft/);
});
test("company records are identified but no invented independent DealScope entity",()=>{
 const legal=read("app/legal/page.tsx");
 assert.match(legal,/2019\/626848\/07/);
 assert.match(legal,/4040314793/);
 assert.match(legal,/pending current official CIPC and SARS/);
 assert.doesNotMatch(legal,/DealScope \(Pty\) Ltd/);
});
test("terms mandate one complete free assessment without automatic paid conversion",()=>{
 const terms=read("app/terms/page.tsx");
 assert.match(terms,/one complete free Deal Assistance/);
 assert.match(terms,/No automatic card charge/);
 assert.match(terms,/third.party.*assays|Third-party assays/i);
 assert.match(terms,/negative|unprofitable/i);
});
test("privacy explains SAR responsible party, data rights and tenant segregation",()=>{
 const p=read("app/privacy/page.tsx");
 assert.match(p,/responsible party/);
 assert.match(p,/Information Officer/);
 assert.match(p,/tenant/);
 assert.match(p,/Information Regulator/);
 assert.match(p,/no live onboarding|not collecting live onboarding/i);
});
test("payment rights and refunds are not reduced to no-refunds policy",()=>{
 const p=read("app/payments/page.tsx");
 assert.match(p,/no blanket/i);
 assert.match(p,/cooling.off/i);
 assert.match(p,/No payment processing is currently live/);
 assert.match(p,/no automatic|cannot trigger a charge/i);
});
test("invoicing identifies SAR and VAT subject to verification",()=>{
 const p=read("app/invoicing/page.tsx");
 assert.match(p,/Shobane African Resources \(Pty\) Ltd/);
 assert.match(p,/4040314793/);
 assert.match(p,/15%/);
 assert.match(p,/pending current official CIPC and SARS verification/);
});
test("home and onboarding link to legal route with no fictitious registration",()=>{
 const h=read("app/page.tsx"),s=read("app/start/page.tsx");
 for(const p of [h,s]){
  assert.match(p,/href="\/legal"/);
  assert.match(p,/Operated by Shobane African Resources \(Pty\) Ltd/);
  assert.doesNotMatch(p,/DealScope \(Pty\) Ltd/);
 }
 for(const path of ["/terms","/privacy","/payments","/invoicing"])assert.ok(h.includes(path));
});
