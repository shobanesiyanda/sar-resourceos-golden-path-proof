import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("root is signed-out acquisition not the calculator",()=>{
 const home=source("app/page.tsx");
 assert.match(home,/Know what you/);
 assert.match(home,/dealing with/);
 assert.match(home,/30-day full trial|30 days/);
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
