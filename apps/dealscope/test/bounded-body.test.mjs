import test from 'node:test';
import assert from 'node:assert/strict';
import {readBoundedJson,readBoundedForm,BodyIntakeError} from '../lib/server/bounded-body.mjs';
const req=(body,ctype=body instanceof FormData?undefined:'application/json')=>new Request('https://dealscope.co.za/api/assessments',{method:'POST',...(ctype?{headers:{'content-type':ctype}}:{}),body});
async function fails(p,status,code){await assert.rejects(p,e=>e instanceof BodyIntakeError && e.status===status && (!code || e.code===code));}
test('valid customer reference remains available',async()=>assert.deepEqual(await readBoundedJson(req('{"caseId":"A-1"}'),8192),{caseId:'A-1'}));
test('valid confirmation payload remains available',async()=>assert.deepEqual(await readBoundedJson(req('{"caseId":"A-1","confirm":true,"sourceRevision":1}'),2048),{caseId:'A-1',confirm:true,sourceRevision:1}));
test('valid multipart form is read',async()=>{const f=new FormData();f.append('commodity','chrome');f.append('pastedText','Customer offer');const parsed=await readBoundedForm(req(f),15728640);assert.equal(parsed.get('commodity'),'chrome');});
test('multipart accepts uploaded text documents within limit',async()=>{const f=new FormData();f.append('documents',new Blob(['contract text'],{type:'text/plain'}),'contract.txt');const parsed=await readBoundedForm(req(f),15728640);assert.equal(parsed.getAll('documents').length,1);});
test('missing actual JSON body fails closed',async()=>fails(readBoundedJson(new Request('https://dealscope.co.za/api/assessments',{method:'POST',headers:{'content-type':'application/json'}}),8192),400,'empty_request'));
test('content-type rejection',async()=>fails(readBoundedJson(req('{"x":1}','text/plain'),8192),415,'invalid_content_type'));
test('invalid UTF-8 cannot enter JSON request',async()=>fails(readBoundedJson(req(Uint8Array.from([123,34,97,34,58,255,125])),8192),400));
test('array and primitive JSON are not valid objects',async()=>{await fails(readBoundedJson(req('[]'),8192),400);await fails(readBoundedJson(req('"private"'),8192),400);});
test('content-length missing streaming request still capped',async()=>{
 const bytes=[new Uint8Array(5000),new Uint8Array(5000)]; const stream=new ReadableStream({pull(controller){controller.enqueue(bytes.shift());if(!bytes.length)controller.close();}});
 const request=new Request('https://dealscope.co.za/api/assessments',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'});
 await fails(readBoundedJson(request,8192),413,'request_too_large');
});
test('unexpected multipart stream greater than 15MiB blocked before parse',async()=>{
 let count=0;const stream=new ReadableStream({pull(c){count++;c.enqueue(new Uint8Array(1048576));if(count>15)c.close();}});
 const request=new Request('https://dealscope.co.za/api/assessments/intake',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:stream,duplex:'half'});
 await fails(readBoundedForm(request,15728640),413,'request_too_large');
});
test('malformed multipart fails closed',async()=>fails(readBoundedForm(req('not multipart','multipart/form-data; boundary=abc'),15728640),400,'invalid_intake'));
