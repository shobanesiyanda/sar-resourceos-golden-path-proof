import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("root is signed-out acquisition not the calculator",()=>{
 const home=source("app/page.tsx");
 assert.match(home,/Know what you/);
 assert.match(home,/dealing with/);
 assert.match(home,/one complete deal|one free|1 complete deal cycle/i);
 assert.doesNotMatch(home,/30-day full trial|30 days|30-day unlimited/i);
 assert.match(home,/Commercial Exchange/);
 assert.match(home,/DEVELOPMENT|development preview|Development preview/);
 assert.doesNotMatch(home,/calculateDealRun/);
});
test("existing calculator remains in /runs with corrected shared package imports",()=>{
 const calc=source("app/runs/page.tsx");
 assert.match(calc,/calculateDealRun/);
 assert.match(calc,/\.\.\/\.\.\/\.\.\/\.\.\/packages\/commodity-core\/src\/economics/);
 assert.match(calc,/Gross margin/);
});
test("no obsolete thirty-day trial and no misleading live signup",()=>{
 const start=source("app/start/page.tsx");
 assert.doesNotMatch(start,/30 days|30-day|thirty days/i);
 assert.match(start,/complete deal assessment|complete Deal Assistance/i);
});
test("every public conversion path has source and no false registration",()=>{
 const home=source("app/page.tsx");
 for(const link of ["/start","/integrity","/runs","/exchange"])assert.ok(home.includes(link));
 for(const path of ["app/start/page.tsx","app/integrity/page.tsx","app/runs/page.tsx","app/exchange/page.tsx"])assert.equal(existsSync(new URL("../"+path,import.meta.url)),true);
 const start=source("app/start/page.tsx");
 assert.match(start,/Account provisioning not live|Registration is not yet available/);
 assert.doesNotMatch(start,/type="email"|type="password"|SUPABASE_SERVICE_ROLE_KEY/);
});
test("no false live data, verified client or hidden marketing price",()=>{
 const home=source("app/page.tsx");
 assert.match(home,/ILLUSTRATIVE ONLY/);
 assert.match(home,/No automatic paid conversion/);
 assert.doesNotMatch(home,/R450|R15,000|R28,500|guaranteed buyer|success rate of/);
});
test("search indexing remains disabled until authenticated launch",()=>{
 const layout=source("app/layout.tsx");
 assert.match(layout,/index:\s*false/);
 assert.match(layout,/DealScope/);
});

test("DealScope remains the primary public brand; correct legal operator only in footers and legal page",()=>{
 const operator=/Shobane African Resources \(Pty\) Ltd/;
 for(const path of ["app/page.tsx","app/start/page.tsx"]){
  const src=source(path),index=src.indexOf("<footer");
  assert.ok(index>0,"Footer exists for "+path);
  assert.doesNotMatch(src.slice(0,index),/Shobane African Resources|shobane\.co\.za|\bSAR\b/i);
  assert.match(src.slice(index),operator);
  assert.match(src.slice(index),/href="\/legal"/);
 }
 const legal=source("app/legal/page.tsx");
 assert.match(legal,/Current operator and legal status/);
 assert.match(legal,operator);
 assert.match(legal,/not represented here as a separately incorporated company/);
 assert.match(legal,/does not register customer accounts/);
 assert.doesNotMatch(legal,/registration number:\s*\d|VAT number:\s*\d/i);
});
test("marketing and app metadata do not advertise parent or cross-link corporate business",()=>{
 for(const path of ["app/runs/page.tsx","app/integrity/page.tsx",
   "app/exchange/page.tsx","app/layout.tsx"]){
  const src=source(path);
  assert.doesNotMatch(src,/Shobane African Resources|shobane\.co\.za|\bSAR\b/i);
 }
 const css=source("app/landing.css");
 assert.match(css,/\.ds-legal\{[^}]*font-size:\.72rem/);
 assert.match(css,/\.ds-legal a:focus-visible/);
});
