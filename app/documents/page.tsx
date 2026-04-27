"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import ResourceShell from "../../components/ResourceShell";

const PARCEL_CODE = "PAR-CHR-2026-0001";

type Parcel = {
  id: string;
  parcel_code: string;
  commodity: string | null;
  resource_type: string | null;
  material_type: string | null;
};

type DocAny = {
  id?: string;
  status?: string | null;
  notes?: string | null;
  note?: string | null;
  document_type?: string | null;
  type?: string | null;
  name?: string | null;
  title?: string | null;
  document_title?: string | null;
  label?: string | null;
  description?: string | null;
};

function docId(d: DocAny, index: number) {
  return d.id || `doc-${index}`;
}

function docTitle(d: DocAny) {
  return (
    d.document_title ||
    d.title ||
    d.name ||
    d.label ||
    d.document_type ||
    d.type ||
    "Required document"
  );
}

function docType(d: DocAny) {
  return d.document_type || d.type || "Document";
}

function docNote(d: DocAny) {
  return d.notes || d.note || d.description || "No document note captured yet.";
}

function statusClass(status: string | null | undefined) {
  if (status === "Complete" || status === "Approved") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }

  if (status === "Blocked") {
    return "border-red-400/40 bg-red-500/15 text-red-200";
  }

  if (status === "Pending") {
    return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  }

  return "border-white/10 bg-white/[0.03] text-slate-300";
}

function openCount(rows: DocAny[]) {
  return rows.filter((r) => r.status === "Pending" || r.status === "Blocked").length;
}

function completeCount(rows: DocAny[]) {
  return rows.filter((r) => r.status === "Complete" || r.status === "Approved").length;
}

function Card(p: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d7ad32]">
        {p.label}
      </p>
      <h3 className="mt-2 text-2xl font-black">{p.title}</h3>
      {p.children}
    </section>
  );
}

function Stat(p: { label: string; value: string; note?: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </p>
      <p className={`mt-2 text-3xl font-black ${p.gold ? "text-[#f5d778]" : "text-white"}`}>
        {p.value}
      </p>
      {p.note ? <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p> : null}
    </div>
  );
}

function DocCard({ doc, index }: { doc: DocAny; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {docType(doc)}
          </p>
          <h4 className="mt-2 text-xl font-black text-white">{docTitle(doc)}</h4>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(doc.status)}`}
        >
          {doc.status || "Draft"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">{docNote(doc)}</p>
    </div>
  );
}

export default function DocumentsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [documents, setDocuments] = useState<DocAny[]>([]);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", auth.user.id)
        .single();

      if (!profile || profile.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select("id, parcel_code, commodity, resource_type, material_type")
        .eq("parcel_code", PARCEL_CODE)
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const { data: docs, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("parcel_id", parcelData.id);

      if (docsError) {
        setError(docsError.message);
        setLoading(false);
        return;
      }

      setParcel(parcelData as Parcel);
      setDocuments((docs as DocAny[]) || []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Documents Control" subtitle="Loading document register...">
        <Card label="Loading" title="Reading Supabase document records..." />
      </ResourceShell>
    );
  }

  if (error || !parcel) {
    return (
      <ResourceShell title="Documents Control" subtitle="Documents module error">
        <Card label="Error" title="Could not load documents">
          <p className="mt-3 text-red-200">{error || "Could not load documents page."}</p>
        </Card>
      </ResourceShell>
    );
  }

  const complete = completeCount(documents);
  const open = openCount(documents);
  const blocked = documents.filter((d) => d.status === "Blocked").length;
  const pending = documents.filter((d) => d.status === "Pending").length;

  return (
    <ResourceShell
      title="Documents Control"
      subtitle="Read-only document readiness register for supplier evidence, plant support, transport support, buyer support, assays and release evidence."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcel.parcel_code} />
        <Stat label="Resource" value={parcel.resource_type || parcel.commodity || "Not Set"} gold />
        <Stat label="Material" value={parcel.material_type || "Not Set"} />
        <Stat label="Documents" value={`${complete}/${documents.length}`} gold={open === 0} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open Items" value={String(open)} />
        <Stat label="Blocked" value={String(blocked)} />
        <Stat label="Pending" value={String(pending)} />
        <Stat label="Release Impact" value={open > 0 ? "Blocked" : "Clear"} gold={open === 0} />
      </section>

      <Card label="Document Register" title="Required release documents">
        <div className="mt-5 space-y-4">
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <DocCard key={docId(doc, index)} doc={doc} index={index} />
            ))
          ) : (
            <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
              <p className="font-black text-[#f5d778]">No documents loaded.</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Seed the required document records before enabling release control.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card label="Control Rule" title="Documents block release until complete">
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="text-xl font-black text-red-200">
            Do not release without evidence.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Supplier KYC, source evidence, plant tolling support, transport support,
            buyer/offtake support, assay records and movement evidence must be complete
            before dispatch or finance handoff.
          </p>
        </div>
      </Card>

      <Card label="Next Document Phase" title="Storage upload comes later">
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This Live v1 page reads document readiness records only. The next document
          phase will add Supabase Storage uploads, signed document viewing, versioning,
          approval workflow and audit events.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/approvals"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Open Approvals
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </Card>
    </ResourceShell>
  );
  }
