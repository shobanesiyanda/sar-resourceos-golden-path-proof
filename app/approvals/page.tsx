"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Profile = {
  full_name: string;
  company_name: string | null;
  role: string;
  is_active: boolean;
};

type Parcel = {
  id: string;
  parcel_code: string;
  commodity: string;
  control_state: string;
};

type ApprovalRecord = {
  approval_code: string;
  approval_type: string;
  status: string;
  decision_note: string | null;
  created_at: string;
};

function Badge({ state }: { state: string }) {
  const style =
    state === "Blocked"
      ? "border-red-400/40 bg-red-500/15 text-red-200"
      : state === "Held"
      ? "border-orange-400/40 bg-orange-500/15 text-orange-200"
      : state === "Approved" || state === "Complete"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
      : "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${style}`}
    >
      {state}
    </span>
  );
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
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
        {label}
      </p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}

export default function ApprovalsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, company_name, role, is_active")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select("id, parcel_code, commodity, control_state")
        .eq("parcel_code", "PAR-CHR-2026-0001")
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found.");
        setLoading(false);
        return;
      }

      const { data: approvalData, error: approvalError } = await supabase
        .from("approvals")
        .select("approval_code, approval_type, status, decision_note, created_at")
        .eq("parcel_id", parcelData.id)
        .order("approval_code", { ascending: true });

      if (approvalError) {
        setError("Approvals could not be loaded.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setParcel(parcelData);
      setApprovals(approvalData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading approvals..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <section className="rounded-3xl border border-red-400/30 bg-[#080d18] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-200">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Approvals module error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const blockedCount = approvals.filter((item) => item.status === "Blocked").length;
  const pendingCount = approvals.filter((item) => item.status === "Pending").length;
  const approvedCount = approvals.filter(
    (item) => item.status === "Approved" || item.status === "Complete"
  ).length;

  const releaseBlocked =
    blockedCount > 0 || pendingCount > 0 || parcel?.control_state === "Blocked";

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Approvals Control Module">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live approval queue for release gates, plant approval, supplier approval,
            finance handoff and parcel execution control.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/documents"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Documents
            </Link>

            <Link
              href="/approvals"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300"
            >
              Approvals
            </Link>
          </div>
        </Card>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Parcel
            </p>
            <p className="mt-3 text-2xl font-black">{parcel?.parcel_code}</p>
            <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
              {parcel?.commodity}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Approvals
            </p>
            <p className="mt-3 text-4xl font-black">{approvals.length}</p>
            <p className="mt-2 text-sm text-slate-400">Live records loaded.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Pending
            </p>
            <p className="mt-3 text-4xl font-black text-[#f5d778]">
              {pendingCount}
            </p>
            <p className="mt-2 text-sm text-slate-400">Awaiting decision.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Blocked
            </p>
            <p className="mt-3 text-4xl font-black text-red-200">
              {blockedCount}
            </p>
            <p className="mt-2 text-sm text-slate-400">Blocking release.</p>
          </div>
        </section>

        <Card
          label="Release Gate"
          title={releaseBlocked ? "Parcel release blocked" : "Parcel release clear"}
        >
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Control State
                </p>
                <p className="mt-2 text-xl font-black">
                  {releaseBlocked
                    ? "Release cannot proceed until approval gates are cleared."
                    : "Approval gates are clear."}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  This page uses live Supabase approval records linked to the first
                  chrome parcel.
                </p>
              </div>

              <Badge state={releaseBlocked ? "Blocked" : "Approved"} />
            </div>
          </div>
        </Card>

        <Card label="Approval Queue" title="Live approval records">
          <div className="mt-5 space-y-4">
            {approvals.map((item) => (
              <div
                key={item.approval_code}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.approval_type}
                    </p>

                    <h3 className="mt-2 text-xl font-black">{item.approval_code}</h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.decision_note ?? "No approval note captured."}
                    </p>
                  </div>

                  <Badge state={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Gate Summary" title="Approval control state">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Approved / Complete
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-200">
                  {approvedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-black text-[#f5d778]">
                  {pendingCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Blocked
                </p>
                <p className="mt-2 text-3xl font-black text-red-200">
                  {blockedCount}
                </p>
              </div>
            </div>
          </Card>

          <Card label="Operator" title={profile?.full_name ?? "Operator"}>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Company
                </p>
                <p className="mt-2 text-xl font-black">
                  {profile?.company_name ?? "Shobane African Resources"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Role
                </p>
                <p className="mt-2 text-xl font-black capitalize">
                  {profile?.role}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Control Result
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Finance handoff and parcel release remain blocked until all
                  approval gates move out of Pending or Blocked status.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
  }
