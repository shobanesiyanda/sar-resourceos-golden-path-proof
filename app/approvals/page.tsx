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

type ApprovalAny = {
  id?: string;
  status?: string | null;
  notes?: string | null;
  note?: string | null;
  approval_type?: string | null;
  type?: string | null;
  approval_name?: string | null;
  name?: string | null;
  title?: string | null;
  approval_title?: string | null;
  label?: string | null;
  description?: string | null;
  approver_role?: string | null;
  approver?: string | null;
};

function approvalId(a: ApprovalAny, index: number) {
  return a.id || `approval-${index}`;
}

function approvalTitle(a: ApprovalAny) {
  return (
    a.approval_title ||
    a.approval_name ||
    a.title ||
    a.name ||
    a.label ||
    a.approval_type ||
    a.type ||
    "Required approval"
  );
}

function approvalType(a: ApprovalAny) {
  return a.approval_type || a.type || "Approval";
}

function approvalNote(a: ApprovalAny) {
  return a.notes || a.note || a.description || "No approval note captured yet.";
}

function approver(a: ApprovalAny) {
  return a.approver_role || a.approver || "Approval owner not assigned";
}

function statusClass(status: string | null | undefined) {
  if (status === "Complete" || status === "Approved") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }

  if (status === "Blocked" || status === "Rejected") {
    return "border-red-400/40 bg-red-500/15 text-red-200";
  }

  if (status === "Pending") {
    return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  }

  return "border-white/10 bg-white/[0.03] text-slate-300";
}

function openCount(rows: ApprovalAny[]) {
  return rows.filter((r) => r.status === "Pending" || r.status === "Blocked").length;
}

function approvedCount(rows: ApprovalAny[]) {
  return rows.filter((r) => r.status === "Approved" || r.status === "Complete").length;
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

function ApprovalCard({ approval, index }: { approval: ApprovalAny; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {approvalType(approval)}
          </p>
          <h4 className="mt-2 text-xl font-black text-white">
            {approvalTitle(approval)}
          </h4>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(
            approval.status
          )}`}
        >
          {approval.status || "Draft"}
        </span>
      </div>

      <p className="mt-3 text-sm font-bold text-[#f5d778]">{approver(approval)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {approvalNote(approval)}
      </p>
    </div>
  );
}

export default function ApprovalsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [approvals, setApprovals] = useState<ApprovalAny[]>([]);

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

      const { data: approvalData, error: approvalError } = await supabase
        .from("approvals")
        .select("*")
        .eq("parcel_id", parcelData.id);

      if (approvalError) {
        setError(approvalError.message);
        setLoading(false);
        return;
      }

      setParcel(parcelData as Parcel);
      setApprovals((approvalData as ApprovalAny[]) || []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Approvals Control" subtitle="Loading approval queue...">
        <Card label="Loading" title="Reading Supabase approval records..." />
      </ResourceShell>
    );
  }

  if (error || !parcel) {
    return (
      <ResourceShell title="Approvals Control" subtitle="Approvals module error">
        <Card label="Error" title="Could not load approvals">
          <p className="mt-3 text-red-200">
            {error || "Could not load approvals page."}
          </p>
        </Card>
      </ResourceShell>
    );
  }

  const approved = approvedCount(approvals);
  const open = openCount(approvals);
  const blocked = approvals.filter((a) => a.status === "Blocked").length;
  const pending = approvals.filter((a) => a.status === "Pending").length;

  return (
    <ResourceShell
      title="Approvals Control"
      subtitle="Read-only approval queue for plant approval, supplier approval, route approval, finance approval and controlled release gates."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Parcel" value={parcel.parcel_code} />
        <Stat label="Resource" value={parcel.resource_type || parcel.commodity || "Not Set"} gold />
        <Stat label="Material" value={parcel.material_type || "Not Set"} />
        <Stat label="Approvals" value={`${approved}/${approvals.length}`} gold={open === 0} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open Items" value={String(open)} />
        <Stat label="Blocked" value={String(blocked)} />
        <Stat label="Pending" value={String(pending)} />
        <Stat label="Release Impact" value={open > 0 ? "Blocked" : "Clear"} gold={open === 0} />
      </section>

      <Card label="Approval Queue" title="Required release approvals">
        <div className="mt-5 space-y-4">
          {approvals.length > 0 ? (
            approvals.map((approval, index) => (
              <ApprovalCard
                key={approvalId(approval, index)}
                approval={approval}
                index={index}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
              <p className="font-black text-[#f5d778]">No approvals loaded.</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Seed approval records before enabling route, dispatch or finance release.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card label="Control Rule" title="Approvals block release until cleared">
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="text-xl font-black text-red-200">
            Do not approve by assumption.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Supplier source approval, plant tolling approval, transport readiness,
            buyer/offtake support, margin approval and finance handoff must be approved
            before controlled release.
          </p>
        </div>
      </Card>

      <Card label="Next Approval Phase" title="Approval actions come later">
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This Live v1 page reads approval readiness records only. The next approval
          phase will add role-based approve/hold/reject actions, delegated authority,
          exception approval, audit events and release-rule enforcement.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/documents"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Open Documents
          </Link>
          <Link
            href="/finance"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Finance
          </Link>
        </div>
      </Card>
    </ResourceShell>
  );
  }
