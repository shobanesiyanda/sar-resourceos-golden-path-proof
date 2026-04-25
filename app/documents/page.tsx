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

type DocumentRecord = {
  document_code: string;
  document_type: string;
  title: string;
  status: string;
  notes: string | null;
  file_url: string | null;
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

export default function DocumentsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

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

      const { data: documentData, error: documentError } = await supabase
        .from("documents")
        .select("document_code, document_type, title, status, notes, file_url, created_at")
        .eq("parcel_id", parcelData.id)
        .order("document_code", { ascending: true });

      if (documentError) {
        setError("Documents could not be loaded.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setParcel(parcelData);
      setDocuments(documentData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading documents..." />
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
          <h1 className="mt-3 text-2xl font-black">Documents module error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const blockedCount = documents.filter((item) => item.status === "Blocked").length;
  const pendingCount = documents.filter((item) => item.status === "Pending").length;
  const completeCount = documents.filter(
    (item) => item.status === "Approved" || item.status === "Complete"
  ).length;

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Documents Control Module">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live document register for parcel release control, supplier evidence,
            plant tolling support, transport confirmation and buyer offtake support.
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
              Documents
            </p>
            <p className="mt-3 text-4xl font-black">{documents.length}</p>
            <p className="mt-2 text-sm text-slate-400">Live records loaded.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Pending
            </p>
            <p className="mt-3 text-4xl font-black text-[#f5d778]">
              {pendingCount}
            </p>
            <p className="mt-2 text-sm text-slate-400">Awaiting completion.</p>
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

        <Card label="Release Register" title="Document readiness list">
          <div className="mt-5 space-y-4">
            {documents.map((item) => (
              <div
                key={item.document_code}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.document_type}
                    </p>

                    <h3 className="mt-2 text-xl font-black">{item.title}</h3>

                    <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
                      {item.document_code}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.notes ?? "No note captured."}
                    </p>

                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-600">
                      File: {item.file_url ? "Attached" : "Not attached yet"}
                    </p>
                  </div>

                  <Badge state={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Release Gate" title="Document control state">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Complete / Approved
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-200">
                  {completeCount}
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
                  Parcel release remains controlled until all required documents
                  and linked approval gates move out of Pending or Blocked status.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
                           }
