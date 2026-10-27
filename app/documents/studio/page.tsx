"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ResourceShell from "../../../components/ResourceShell";
import {
  createDocumentDraft, documentReviewGaps, newBlock,
  renderDocumentHtml, TEMPLATE_CATALOG, validateDocumentDraft,
  type DocumentBlock, type DocumentBlockKind, type DocumentClass,
  type DocumentDraft, type DocumentTemplateId
} from "../../../lib/document-studio";

const GOLD="#C2A14A";
const TEXT="text-xs font-bold uppercase tracking-[0.15em] text-[#a6b1c2]";
const field="w-full rounded-xl border border-white/10 bg-[#0c1829] px-3 py-3 text-sm text-white outline-none transition focus:border-[#C2A14A] focus:ring-2 focus:ring-[#C2A14A]/15";
const control="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#C2A14A]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C2A14A]";
const classify: DocumentClass[]=["internal","confidential","counterparty"];
const kinds: {id:DocumentBlockKind;name:string}[]=[
  {id:"heading",name:"Section heading"},{id:"paragraph",name:"Paragraph"},
  {id:"bullets",name:"Bullet list"},{id:"callout",name:"Notice / qualification"}];

function download(text:string,filename:string,mime:string){
 const url=URL.createObjectURL(new Blob([text],{type:mime}));
 const anchor=document.createElement("a");anchor.href=url;anchor.download=filename;
 document.body.appendChild(anchor);anchor.click();anchor.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function slug(s:string){return (s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"sar-document").slice(0,65);}
function formatBlock(b:DocumentBlock){
 if(b.kind==="heading")return <h2 className="mt-6 mb-3 border-b border-slate-200 pb-2 text-base font-bold text-[#07192F]">{b.text||"Untitled section"}</h2>;
 if(b.kind==="callout")return <aside className="my-3 border-l-[3px] border-[#C2A14A] bg-[#f6f4ec] px-4 py-3 text-sm text-[#36475e] whitespace-pre-line">{b.text}</aside>;
 if(b.kind==="bullets")return <ul className="my-3 list-disc space-y-1 pl-6 text-sm leading-7 text-[#27364b]">{b.text.split(/\r?\n/).filter(Boolean).map((s,i)=><li key={i}>{s}</li>)}</ul>;
 return <p className="my-3 whitespace-pre-line text-sm leading-7 text-[#27364b]">{b.text || "Add content"}</p>;
}
export default function DocumentStudio(){
 const [draft,setDraft]=useState<DocumentDraft>(()=>createDocumentDraft("corporate-letter",true));
 const [mode,setMode]=useState<"edit"|"preview">("edit");
 const [selected,setSelected]=useState<string|null>(null);
 const [tool,setTool]=useState<"inspector"|"templates"|"review">("inspector");
 const [scale,setScale]=useState<85|100>(100);
 const [notice,setNotice]=useState("");
 const [dirty,setDirty]=useState(true);
 const fileRef=useRef<HTMLInputElement>(null);
 const review=useMemo(()=>documentReviewGaps(draft),[draft]);
 const words=useMemo(()=>draft.blocks.map(b=>b.text).join(" ").trim().split(/\s+/).filter(Boolean).length,[draft.blocks]);
 useEffect(()=>{
  if(!dirty)return;
  const before=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
  window.addEventListener("beforeunload",before);
  return ()=>window.removeEventListener("beforeunload",before);
 },[dirty]);
 function update<K extends keyof DocumentDraft>(name:K,value:DocumentDraft[K]){
   setDraft(current=>({...current,[name]:value}));setDirty(true);
 }
 function editBlock(id:string,patch:Partial<DocumentBlock>){
   update("blocks",draft.blocks.map(b=>b.id===id?{...b,...patch}:b));
 }
 function addBlock(kind:DocumentBlockKind){
  const b=newBlock(kind);update("blocks",[...draft.blocks,b]);setSelected(b.id);setMode("edit");
  setNotice("A new editable block was added to this session draft.");
 }
 function moveBlock(id:string,delta:number){
  const i=draft.blocks.findIndex(b=>b.id===id),j=i+delta;
  if(i<0||j<0||j>=draft.blocks.length)return;
  const next=[...draft.blocks];[next[i],next[j]]=[next[j],next[i]];update("blocks",next);
 }
 function replaceTemplate(id:DocumentTemplateId){
  if(dirty&&!window.confirm("Start a new document? The current session draft has no server save. Export it first if needed."))return;
  setDraft(createDocumentDraft(id));setSelected(null);setTool("inspector");setMode("edit");setDirty(true);
  setNotice("New template opened. This is a session-only draft, not a saved SAR record.");
 }
 function exportJson(){
  download(JSON.stringify(draft,null,2),slug(draft.title)+".sardoc.json","application/json;charset=utf-8");
  setNotice("Draft backup downloaded to your device. This does not save it to ResourceOS.");
 }
 function exportHtml(){
  download(renderDocumentHtml(draft),slug(draft.title)+"-UNAPPROVED.html","text/html;charset=utf-8");
  setNotice("An unapproved, printable HTML copy was downloaded. It is not an issued document.");
 }
 function previewPrint(){
  const w=window.open("","_blank");
  if(!w){setNotice("Your browser blocked the print preview window. Enable pop-ups or export HTML.");return;}
  w.opener=null;w.document.open();w.document.write(renderDocumentHtml(draft));w.document.close();
  w.focus();setNotice("Print-ready A4 draft opened. Use the browser Print / Save as PDF control.");
 }
 async function importJson(file:File|undefined){
  if(!file)return;
  if(file.size>1_000_000){setNotice("Import refused: the draft file exceeds the 1 MB safety limit.");return;}
  try{
   const parsed:unknown=JSON.parse(await file.text());
   if(!validateDocumentDraft(parsed)){setNotice("Import refused: invalid or unsupported SAR draft structure.");return;}
   if(dirty&&!window.confirm("Replace this unsaved session draft with the imported file?"))return;
   const next=parsed as DocumentDraft;
   setDraft({...next, id: next.id + "-import-" + Date.now().toString(36)});
   setSelected(null);setMode("edit");setDirty(true);
   setNotice("Draft imported in this browser session. No external file was uploaded.");
  }catch{setNotice("Import refused: file is not a valid SAR draft JSON file.");}
  finally{if(fileRef.current)fileRef.current.value="";}
 }
 const sidecard="rounded-2xl border border-white/[0.09] bg-[#081423]/85 p-4 shadow-[0_15px_50px_rgba(0,0,0,.25)]";
 const editorialHeader=<div className="border-b-2 border-[#C2A14A] pb-5">
   <div className="flex flex-wrap items-start justify-between gap-4">
    <div><p className="text-[12px] font-extrabold tracking-[0.19em] text-[#07192F]">SHOBANE AFRICAN RESOURCES</p>
       <p className="mt-1 text-[10px] text-[#617085]">Shobane African Resources (Pty) Ltd</p></div>
    <div className="text-right"><p className="text-[10px] font-bold tracking-[0.14em] text-[#8f660a]">WORKING DRAFT</p>
      <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-[#64748b]">Not approved for issue</p></div>
   </div>
 </div>;
 return <ResourceShell title="Document Studio" subtitle="Create • compose • review • present — SAR corporate documents, inside ResourceOS.">
 <div className="relative isolate overflow-hidden rounded-[28px] border border-[#C2A14A]/20 bg-[#071120] shadow-[0_30px_100px_rgba(0,0,0,.4)]">
   <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full bg-[#C2A14A]/[.07] blur-3xl"/>
   <div className="relative border-b border-white/10 px-4 py-4 md:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
     <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#C2A14A]/40 bg-[#C2A14A]/10 font-black text-[#eed28d]">D<span className="text-xs">/</span>S</div>
      <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C2A14A]">ResourceOS / Intelligence Workspace</p>
       <p className="mt-1 text-base font-semibold text-white">DOCUMENT STUDIO <span className="ml-1 align-middle text-[10px] font-medium text-slate-400">v0.1</span></p></div>
     </div>
     <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-200">● Session only · not saved</span>
      <Link href="/documents" className={control}>← Evidence register</Link>
     </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
     <div className="flex flex-wrap items-center gap-2">
      <button onClick={()=>setMode("edit")} className={mode==="edit"?"rounded-xl bg-[#C2A14A] px-4 py-2 text-xs font-black text-[#04111F]":control}>Edit canvas</button>
      <button onClick={()=>setMode("preview")} className={mode==="preview"?"rounded-xl bg-[#C2A14A] px-4 py-2 text-xs font-black text-[#04111F]":control}>Preview</button>
      <button onClick={()=>setTool("templates")} className={control}>Templates</button>
      <button onClick={()=>setTool("review")} className={control}>Review gates <span className="ml-1 text-amber-200">{review.length}</span></button>
     </div>
     <div className="flex flex-wrap gap-2">
      <button onClick={exportJson} className={control}>Save draft to device</button>
      <button onClick={exportHtml} className={control}>Export HTML</button>
      <button onClick={previewPrint} className="rounded-xl border border-[#C2A14A] bg-[#C2A14A]/15 px-4 py-2 text-xs font-black text-[#f5df9e] hover:bg-[#C2A14A]/25">A4 / PDF print ↗</button>
     </div>
    </div>
    {notice && <p role="status" className="mt-3 rounded-xl border border-sky-400/20 bg-sky-400/[.05] px-4 py-2 text-xs leading-5 text-sky-100">{notice}</p>}
   </div>
   <div className="grid grid-cols-1 gap-0 xl:grid-cols-[215px_minmax(0,1fr)_240px]">
    <aside className="space-y-4 border-b border-white/10 p-4 xl:border-b-0 xl:border-r xl:border-white/10">
     <div className={sidecard}>
      <p className={TEXT}>Current session</p>
      <p className="mt-3 break-words text-sm font-bold leading-5 text-white">{draft.title}</p>
      <p className="mt-1 text-[11px] text-slate-400">{draft.blocks.length} blocks · {words} words</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
       <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2"><p className="text-lg font-semibold text-[#ebd6a5]">A4</p><p className="text-[10px] text-slate-400">Paper</p></div>
       <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2"><p className="text-lg font-semibold text-[#ebd6a5]">0.1</p><p className="text-[10px] text-slate-400">Draft rev.</p></div>
      </div>
      <button onClick={()=>setTool("templates")} className="mt-4 w-full rounded-xl border border-[#C2A14A]/30 px-3 py-2 text-xs font-bold text-[#eac980] hover:bg-[#C2A14A]/10">+ New from template</button>
     </div>
     <div className={sidecard}>
      <p className={TEXT}>Document outline</p>
      <div className="mt-3 space-y-1">
       {draft.blocks.filter(b=>b.kind==="heading").length===0 && <p className="text-xs leading-5 text-slate-500">No section headings yet.</p>}
       {draft.blocks.filter(b=>b.kind==="heading").map((b,i)=>
        <button key={b.id} onClick={()=>{setSelected(b.id);document.getElementById("sar-block-"+b.id)?.scrollIntoView({behavior:"smooth",block:"center"});}}
         className="flex w-full gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white">
         <span className="font-mono text-[#C2A14A]">{String(i+1).padStart(2,"0")}</span><span className="truncate">{b.text||"Untitled"}</span></button>)}
      </div>
     </div>
     <div className="rounded-xl border border-sky-400/15 bg-sky-400/[.05] p-3 text-xs leading-5 text-sky-100">
      <p className="font-bold">Inside ResourceOS</p>
      <p className="mt-1 text-sky-100/70">No Word needed for these structured drafts. Collaborative saves, document registry and approvals need the verified SAR backend.</p>
     </div>
    </aside>
    <section className="min-w-0 border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(194,161,74,.09),transparent_50%)] px-3 py-5 sm:px-6 xl:border-b-0">
     <div className="mx-auto mb-4 flex max-w-[870px] flex-wrap items-center justify-between gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Canvas / {mode==="edit"?"Editable source":"Issue preview"}</p>
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span className="hidden sm:inline">A4 portrait</span>
        <button className={control} onClick={()=>setScale(85)} aria-pressed={scale===85}>85%</button>
        <button className={control} onClick={()=>setScale(100)} aria-pressed={scale===100}>100%</button>
      </div>
     </div>
     <div className="mx-auto w-full max-w-[870px] overflow-hidden rounded-sm border border-[#dbe0e5] bg-white text-[#142237] shadow-[0_30px_90px_rgba(0,0,0,.5)]"
      style={{fontSize:scale===85?"0.88rem":"1rem"}}>
      <div className="mx-auto min-h-[690px] max-w-[750px] px-5 py-8 sm:px-10 sm:py-12">
       {editorialHeader}
       {mode==="edit" ? <div className="space-y-3 py-5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Document title
         <input value={draft.title} maxLength={240} onChange={e=>update("title",e.target.value)} className="mt-2 w-full border-0 border-b border-slate-200 bg-transparent py-2 text-2xl font-bold text-[#04111F] outline-none focus:border-[#C2A14A]" aria-label="Document title"/>
        </label>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject
         <input value={draft.subject} maxLength={600} onChange={e=>update("subject",e.target.value)} className="mt-1 w-full border-0 border-b border-slate-200 bg-transparent py-2 text-sm text-[#162538] outline-none focus:border-[#C2A14A]" aria-label="Document subject"/>
        </label>
       </div> : <div className="py-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#04111F]">{draft.title}</h2>
        <p className="mt-3 text-sm font-semibold text-[#28384b]">{draft.subject}</p>
       </div>}
       <div className="mb-7 grid gap-1 border-b border-slate-200 pb-5 text-[11px] text-[#64748b] sm:grid-cols-2">
        <p>Reference: {draft.documentRef||"Not assigned"}</p>
        <p className="sm:text-right">Date: {draft.date}</p>
        <p>Division: {draft.division||"Not assigned"}</p>
        <p className="sm:text-right">{draft.recipient ? "To: "+draft.recipient : "Recipient: Not captured"}</p>
       </div>
       <div className="space-y-3">
        {draft.blocks.map((b,index)=><div key={b.id} id={"sar-block-"+b.id} onClick={()=>setSelected(b.id)} className={mode==="edit"?
          "group rounded-lg border px-2 py-2 transition "+(selected===b.id?"border-[#C2A14A] bg-amber-50/50":"border-transparent hover:border-slate-200"): ""}>
          {mode==="preview"?formatBlock(b):<>
           <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <select value={b.kind} onChange={e=>editBlock(b.id,{kind:e.target.value as DocumentBlockKind})}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600" aria-label={"Block type "+(index+1)}>
             {kinds.map(k=><option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <div className="flex gap-1">
             <button aria-label="Move block up" title="Move up" disabled={index===0} onClick={()=>moveBlock(b.id,-1)} className="rounded px-2 py-1 text-xs text-slate-600 disabled:opacity-20 hover:bg-slate-100">↑</button>
             <button aria-label="Move block down" title="Move down" disabled={index===draft.blocks.length-1} onClick={()=>moveBlock(b.id,1)} className="rounded px-2 py-1 text-xs text-slate-600 disabled:opacity-20 hover:bg-slate-100">↓</button>
             <button aria-label="Duplicate block" title="Duplicate block" onClick={()=>{const next=[...draft.blocks];next.splice(index+1,0,{...newBlock(b.kind),text:b.text});update("blocks",next);}} className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">＋</button>
             <button aria-label="Remove block" title="Remove block" onClick={()=>{update("blocks",draft.blocks.filter(x=>x.id!==b.id));if(selected===b.id)setSelected(null);}} className="rounded px-2 py-1 text-xs text-rose-700 hover:bg-rose-50">×</button>
            </div>
           </div>
           <textarea value={b.text} onChange={e=>editBlock(b.id,{text:e.target.value})} maxLength={20000}
            rows={b.kind==="heading"?1:Math.max(3,Math.min(12,b.text.split("\n").length+Math.ceil(b.text.length/90)))}
            aria-label={kinds.find(k=>k.id===b.kind)?.name+" "+(index+1)}
            className={"w-full resize-y rounded-md border border-transparent bg-transparent p-2 outline-none focus:border-[#C2A14A]/50 focus:bg-white "+(b.kind==="heading"?"text-base font-bold text-[#07192F]":b.kind==="callout"?"border-l-[3px] border-l-[#C2A14A] bg-[#f9f6ed] text-sm text-[#3b4656]":"text-sm leading-7 text-[#27364b]")}/>
          </>}
         </div>)}
       </div>
       {mode==="edit" && <div className="mt-8 flex flex-wrap gap-2 border-t border-dashed border-slate-200 pt-5">
        {kinds.map(k=><button key={k.id} onClick={()=>addBlock(k.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:border-[#C2A14A] hover:bg-amber-50">+ {k.name}</button>)}
       </div>}
       <footer className="mt-14 flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-4 text-[9px] leading-5 text-slate-500">
        <span>Shobane African Resources (Pty) Ltd<br/>Reference: {draft.documentRef||"unassigned"} · {draft.classification}</span>
        <span className="text-right font-semibold text-amber-800">UNAPPROVED DRAFT<br/>Official emblem pending verified asset</span>
       </footer>
      </div>
     </div>
     <p className="mx-auto mt-4 max-w-[850px] text-center text-[11px] text-slate-400">Secure corporate canvas preview · No live save, approval signature, external issue or original-logo asset yet.</p>
    </section>
    <aside className="space-y-4 p-4 xl:border-l xl:border-white/10">
      {tool==="templates"?<div className={sidecard}>
       <p className={TEXT}>SAR / Template library</p>
       <h3 className="mt-2 text-base font-semibold text-white">Create new</h3>
       <div className="mt-4 space-y-2">{TEMPLATE_CATALOG.map(t=><button key={t.id} onClick={()=>replaceTemplate(t.id)}
        className={"w-full rounded-xl border p-3 text-left transition hover:border-[#C2A14A]/60 "+(t.id===draft.templateId?"border-[#C2A14A]/40 bg-[#C2A14A]/10":"border-white/10 bg-[#0a1828]")}>
          <span className="font-mono text-[10px] text-[#C2A14A]">{t.icon}</span>
          <p className="mt-1 text-xs font-bold text-white">{t.name}</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400">{t.detail}</p></button>)}</div>
       <p className="mt-4 text-[11px] leading-5 text-slate-500">Template drafts contain placeholders. No legal or financial clauses are automatically authorised.</p>
      </div>:null}
      {tool==="inspector"?<div className={sidecard}>
       <p className={TEXT}>Document properties</p>
       <h3 className="mt-2 text-base font-semibold text-white">Identity & control</h3>
       <div className="mt-4 space-y-4">
        <label className="block"><span className={TEXT}>Reference</span><input value={draft.documentRef} maxLength={120} onChange={e=>update("documentRef",e.target.value)} placeholder="SAR-... (approved ref)" className={"mt-2 "+field}/></label>
        <label className="block"><span className={TEXT}>Division</span><input value={draft.division} maxLength={200} onChange={e=>update("division",e.target.value)} className={"mt-2 "+field}/></label>
        <label className="block"><span className={TEXT}>Counterparty / To</span><input value={draft.recipient} maxLength={500} onChange={e=>update("recipient",e.target.value)} placeholder="Verified name only" className={"mt-2 "+field}/></label>
        <label className="block"><span className={TEXT}>Classification</span><select value={draft.classification} onChange={e=>update("classification",e.target.value as DocumentClass)} className={"mt-2 "+field}>{classify.map(x=><option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
        <label className="block"><span className={TEXT}>Document date</span><input type="date" value={draft.date} onChange={e=>update("date",e.target.value)} className={"mt-2 "+field}/></label>
       </div>
       <div className="mt-5 border-t border-white/10 pt-4">
        <p className={TEXT}>Local session exchange</p>
        <button className={"mt-3 w-full "+control} onClick={()=>fileRef.current?.click()}>Import SAR draft JSON</button>
        <input ref={fileRef} className="hidden" type="file" accept=".json,.sardoc.json,application/json" onChange={e=>void importJson(e.target.files?.[0])} aria-label="Select SAR draft JSON"/>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">For structured SAR draft backups only. PDF/DOCX import and editing will require dedicated secure converters and provenance controls.</p>
       </div>
      </div>:null}
      {tool==="review"?<div className={sidecard}>
       <p className={TEXT}>Preflight / release controls</p>
       <h3 className="mt-2 text-base font-semibold text-white">Document quality gates</h3>
       <div className="mt-4 space-y-2">
        {review.map((gap,i)=><div key={i} className="flex gap-2 rounded-xl border border-amber-400/15 bg-amber-500/[.04] p-3 text-[11px] leading-5 text-amber-100"><span className="font-bold text-[#C2A14A]">!</span><span>{gap}</span></div>)}
       </div>
       <button disabled className="mt-4 w-full cursor-not-allowed rounded-xl bg-slate-700 px-4 py-3 text-xs font-bold text-slate-400">Approval / issue unavailable</button>
       <p className="mt-2 text-[11px] text-slate-500">Approvals require live authenticated SAR document records, independent reviewers and immutable revisions.</p>
      </div>:null}
      <div className={sidecard}>
        <p className={TEXT}>Workspace controls</p>
        <div className="mt-3 space-y-2 text-[11px] leading-5 text-slate-300">
         <p><span className="text-[#C2A14A]">01</span> Compose on a branded A4 canvas.</p>
         <p><span className="text-[#C2A14A]">02</span> Navigate, duplicate and reorder sections.</p>
         <p><span className="text-[#C2A14A]">03</span> Preview before internal review.</p>
         <p><span className="text-[#C2A14A]">04</span> Export an unmistakably unapproved draft.</p>
        </div>
       </div>
    </aside>
   </div>
 </div>
 </ResourceShell>;
}
