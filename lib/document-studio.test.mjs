import test from "node:test";
import assert from "node:assert/strict";
import {
 createDocumentDraft, documentReviewGaps, newBlock,
 renderDocumentHtml, validateDocumentDraft, TEMPLATE_CATALOG
} from "./document-studio.ts";

test("all controlled template categories create versioned internal drafts",()=>{
 assert.equal(TEMPLATE_CATALOG.length,5);
 for(const t of TEMPLATE_CATALOG){
  const d=createDocumentDraft(t.id,true);
  assert.equal(d.schemaVersion,1);assert.equal(d.templateId,t.id);
  assert.ok(d.blocks.length>=3);assert.equal(validateDocumentDraft(d),true);
  assert.equal(d.blocks[0].id,"initial-"+t.id+"-0");
 }
});
test("RFQs and proposals default to counterparty documents but not approved",()=>{
 for(const type of ["rfq","proposal","corporate-letter"]){
  const d=createDocumentDraft(type);
  assert.equal(d.classification,"counterparty");
  assert.ok(documentReviewGaps(d).some(x=>x.includes("Recipient")));
 }
});
test("incomplete template is not represented as release-ready",()=>{
 const d=createDocumentDraft("rfq");
 assert.ok(documentReviewGaps(d).some(x=>x.includes("placeholders")));
 assert.ok(documentReviewGaps(d).some(x=>x.includes("Authenticated")));
});
test("renderer escapes HTML, script and attribute content",()=>{
 const d=createDocumentDraft("internal-memo");
 d.title='Mine <script>alert("x")</script>';
 d.subject='<img src=x onerror="alert(1)">';
 d.blocks=[{id:"a",kind:"paragraph",text:"<b>not bold</b> & information"}];
 const html=renderDocumentHtml(d);
 assert.ok(html.includes("&lt;script&gt;"));
 assert.ok(html.includes("&lt;img src=x onerror="));
 assert.ok(html.includes("&lt;b&gt;not bold&lt;/b&gt;"));
 assert.doesNotMatch(html,/<script>|<img|<b>not bold/);
});
test("issued status is never inferred from export or print HTML",()=>{
 const html=renderDocumentHtml(createDocumentDraft("proposal"));
 assert.match(html,/NOT APPROVED FOR ISSUE/);
 assert.match(html,/WORKING DRAFT/);
 assert.match(html,/Shobane African Resources \(Pty\) Ltd/);
});
test("document imports reject fabricated lifecycle types and arbitrary block kinds",()=>{
 const d=createDocumentDraft("internal-memo");
 assert.equal(validateDocumentDraft({...d,classification:"issued"}),false);
 assert.equal(validateDocumentDraft({...d,blocks:[{id:"x",kind:"html",text:"<img>"}]}),false);
});
test("imported documents reject invalid calendar dates",()=>{
 const d=createDocumentDraft("internal-memo");
 assert.equal(validateDocumentDraft({...d,date:"2026-02-30"}),false);
 assert.equal(validateDocumentDraft({...d,date:"2026-02-28"}),true);
});
test("document imports reject duplicate IDs and oversized content",()=>{
 const d=createDocumentDraft("rfq");
 assert.equal(validateDocumentDraft({...d,blocks:[d.blocks[0],d.blocks[0]]}),false);
 assert.equal(validateDocumentDraft({...d,blocks:[{id:"oversize",kind:"paragraph",text:"a".repeat(20001)}]}),false);
});
test("new structured blocks use permitted kinds",()=>{
 const b=newBlock("heading");assert.equal(b.kind,"heading");assert.ok(b.id);
});
