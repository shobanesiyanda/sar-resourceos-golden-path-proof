"use client";

import { useEffect, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

const SEED_PARCEL_CODE = "PAR-CHR-2026-0001";

type ParcelRow = {
  id: string;
  parcel_code: string | null;
  working_parcel_code: string | null;
  commodity_class: string | null;
  resource_category: string | null;
  resource_type: string | null;
  material_type: string | null;
  material_stage: string | null;
};

type GateRow = {
  parcel_id: string | null;
  documents_required: number | null;
  documents_complete: number | null;
  documents_blockers: number | null;
  documents_state: string | null;
  approvals_state: string | null;
  counterparties_state: string | null;
  routes_state: string | null;
  release_state: string | null;
  release_decision: string | null;
};

type DocumentRow = {
  id: string;
  parcel_id: string | null;
  document_type: string | null;
  title: string | null;
  status: string | null;
  notes: string | null;
  required: boolean | null;
};

function displayParcelCode(parcel: ParcelRow | null) {
  return parcel?.working_parcel_code || parcel?.parcel_code || SEED_PARCEL_CODE;
}

function stateText(value: string | null | undefined) {
  if (!value) return "Blocked";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Card({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-white">
        {title}
      </h2>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  gold,
}: {
  label: string;
  value: string | number;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p
        className={
          gold
            ? "mt-3 text-3xl font-black text-[#f5d778]"
            : "mt-3 text-3xl font-black text-white"
        }
      >
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
      ) : null}
    </div>
  );
}

function DocumentCard({ doc }: { doc: DocumentRow }) {
  const status = stateText(doc.status);
  const good =
    status.toLowerCase().includes("approved") ||
    status.toLowerCase().includes("complete") ||
    status.toLowerCase().includes("verified");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            {doc.document_type || "Document"}
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {doc.title || "Untitled document"}
          </p>
        </div>

        <span
          className={
            good
              ? "rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-200"
              : "rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200"
          }
        >
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {doc.notes || "No notes captured."}
      </p>
    </div>
  );
}

export default function DocumentsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [parcel, setParcel] = useState<ParcelRow | null>(null);
  const [gate, setGate] = useState<GateRow | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  useEffect(() => {
    async function load() {
      const { data: parcelData } = await supabase
        .from("parcels")
        .select("*")
        .eq("parcel_code", SEED_PARCEL_CODE)
        .single();

      if (parcelData) {
        setParcel(parcelData as ParcelRow);

        const { data: gateData } = await supabase
          .from("release_gate_summary")
          .select("*")
          .eq("parcel_id", parcelData.id)
          .single();

        if (gateData) setGate(gateData as GateRow);

        const { data: docData } = await supabase
          .from("documents")
          .select("*")
          .eq("parcel_id", parcelData.id)
          .order("document_type", { ascending: true });

        if (docData) setDocuments(docData as DocumentRow[]);
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell
        title="Documents Control"
        subtitle="Loading document register..."
      >
        <Card label="Loading" title="Reading document readiness..." />
      </ResourceShell>
    );
  }

  const code = displayParcelCode(parcel);
  const required = gate?.documents_required ?? documents.length;
  const complete = gate?.documents_complete ?? 0;
  const blockers = gate?.documents_blockers ?? 0;

  return (
    <ResourceShell
      title="Documents Control"
      subtitle="Read-only document readiness register for evidence, support, quality and release records using working parcel code."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={code} />
        <Stat label="Resource" value={parcel?.resource_type || "Chrome"} gold />
        <Stat label="Material" value={parcel?.material_type || "ROM"} />
        <Stat label="Documents State" value={stateText(gate?.documents_state)} />
      </section>

      <Card label="Document Readiness" title="Evidence pack status">
        <div className="space-y-4">
          <Stat label="Commodity Class" value={parcel?.commodity_class || "Hard Commodities"} />
          <Stat label="Category" value={parcel?.resource_category || "Ferrous Metals"} />
          <Stat label="Stage" value={parcel?.material_stage || "raw_feedstock"} />
          <Stat label="Documents Complete" value={`${complete}/${required}`} gold />
          <Stat label="Open Items" value={Math.max(required - complete, 0)} />
          <Stat label="Blocked Items" value={blockers} />
        </div>
      </Card>

      <Card label="Document Register" title="Required evidence records">
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-2xl font-black text-red-100">
              No document records found
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Create or seed document records for supplier evidence, buyer
              support, route support, quality verification and release evidence.
            </p>
          </div>
        )}
      </Card>

      <Card label="Central Release Link" title="Documents control the release gate">
        <div className="space-y-4">
          <Stat label="Release State" value={stateText(gate?.release_state)} />
          <Stat label="Release Decision" value={gate?.release_decision || "Hold / Gates Blocked"} />
          <Stat label="Approvals State" value={stateText(gate?.approvals_state)} />
          <Stat label="Counterparties State" value={stateText(gate?.counterparties_state)} />
          <Stat label="Routes State" value={stateText(gate?.routes_state)} />

          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
              Document Control Rule
            </p>
            <p className="mt-3 text-2xl font-black text-red-100">
              Do not release without complete evidence
            </p>
            <p className="mt-3 text-sm leading-7 text-red-100/80">
              Supplier evidence, buyer support, route support, quality
              verification and approval evidence must be complete before
              dispatch, payment or finance handoff.
            </p>
          </div>
        </div>
      </Card>
    </ResourceShell>
  );
  }
