import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
test('project activation API remains sealed without trusted SAR backend',()=>{
 const route=read('app/api/projects/activation/route.ts');
 const adapter=read('lib/sar-project-activation-runtime.mjs');
 assert.match(route,/getSARProjectActivationServices/);
 assert.match(route,/executeActivationCommand/);
 assert.match(route,/status:503/);
 assert.match(route,/Cache-Control":"no-store"/);
 assert.match(adapter,/getSARProjectActivationServices\(\)\{return null;\}/);
 assert.doesNotMatch(route,/SUPABASE_SERVICE_ROLE_KEY|service_role|allowAnonymous/i);
});
