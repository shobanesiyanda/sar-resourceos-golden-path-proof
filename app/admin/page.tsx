"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import ResourceShell from "../../components/ResourceShell";

type AnyRow = {
  id?: string;
  role?: string | null;
  is_active?: boolean | null;
  status?: string | null;
  email?: string | null;
  full_name?: string | null;
  name?: string | null;
};

type Counts = {
  profiles: number;
  activeUsers: number;
  adminUsers: number;
  parcels: number;
  documents: number;
  approvals: number;
  counterparties: number;
  routes: number;
};

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
      <p
        className={`mt-2 text-3xl font-black ${
          p.gold ? "text-[#f5d778]" : "text-white"
        }`}
      >
        {p.value}
      </p>
      {p.note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p>
      ) : null}
    </div>
  );
}

function UserCard({ user, index }: { user: AnyRow; index: number }) {
  const active = user.is_active === true;
  const displayName =
    user.full_name || user.name || user.email || `User ${index + 1}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {user.role || "User"}
          </p>
          <h4 className="mt-2 text-xl font-black text-white">{displayName}</h4>
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-xs font-black",
            active
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
              : "border-red-400/40 bg-red-500/15 text-red-200",
          ].join(" ")}
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {user.email || "Email not captured in profile record."}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AnyRow[]>([]);
  const [counts, setCounts] = useState<Counts>({
    profiles: 0,
    activeUsers: 0,
    adminUsers: 0,
    parcels: 0,
    documents: 0,
    approvals: 0,
    counterparties: 0,
    routes: 0,
  });

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (!myProfile || myProfile.is_active !== true) {
        setError("Profile not found or inactive.");
        setLoading(false);
        return;
      }

      if (myProfile.role !== "admin") {
        setError("Admin access required.");
        setLoading(false);
        return;
      }

      const [
        profilesRes,
        parcelsRes,
        documentsRes,
        approvalsRes,
        partiesRes,
        routesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("parcels").select("*"),
        supabase.from("documents").select("*"),
        supabase.from("approvals").select("*"),
        supabase.from("counterparties").select("*"),
        supabase.from("route_chains").select("*"),
      ]);

      if (profilesRes.error) {
        setError(profilesRes.error.message);
        setLoading(false);
        return;
      }

      const profileRows = (profilesRes.data as AnyRow[]) || [];
      const parcelRows = parcelsRes.data || [];
      const documentRows = documentsRes.data || [];
      const approvalRows = approvalsRes.data || [];
      const partyRows = partiesRes.data || [];
      const routeRows = routesRes.data || [];

      setUsers(profileRows);

      setCounts({
        profiles: profileRows.length,
        activeUsers: profileRows.filter((u) => u.is_active === true).length,
        adminUsers: profileRows.filter((u) => u.role === "admin").length,
        parcels: parcelRows.length,
        documents: documentRows.length,
        approvals: approvalRows.length,
        counterparties: partyRows.length,
        routes: routeRows.length,
      });

      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Admin Control" subtitle="Loading admin control...">
        <Card label="Loading" title="Reading Supabase admin records..." />
      </ResourceShell>
    );
  }

  if (error) {
    return (
      <ResourceShell title="Admin Control" subtitle="Admin module error">
        <Card label="Error" title="Could not load admin">
          <p className="mt-3 text-red-200">{error}</p>
        </Card>
      </ResourceShell>
    );
  }

  return (
    <ResourceShell
      title="Admin Control"
      subtitle="Read-only administration overview for users, live modules, route records, documents, approvals and counterparties."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Users" value={String(counts.profiles)} />
        <Stat label="Active Users" value={String(counts.activeUsers)} gold />
        <Stat label="Admins" value={String(counts.adminUsers)} />
        <Stat label="Parcels" value={String(counts.parcels)} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Documents" value={String(counts.documents)} />
        <Stat label="Approvals" value={String(counts.approvals)} />
        <Stat label="Counterparties" value={String(counts.counterparties)} />
        <Stat label="Route Chains" value={String(counts.routes)} />
      </section>

      <Card label="Admin Register" title="User access overview">
        <div className="mt-5 space-y-4">
          {users.length > 0 ? (
            users.map((user, index) => (
              <UserCard key={user.id || `user-${index}`} user={user} index={index} />
            ))
          ) : (
            <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
              <p className="font-black text-[#f5d778]">No users loaded.</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                User records must exist in profiles before role control can work.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card label="Control Rule" title="Admin changes stay controlled">
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="text-xl font-black text-red-200">
            Do not expose admin actions casually.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live v1 keeps this page read-only. Role changes, user activation,
            deletion, approval authority and module permissions must be added only
            with proper audit events and access controls.
          </p>
        </div>
      </Card>

      <Card label="Next Admin Phase" title="Role actions come later">
        <p className="mt-3 text-sm leading-7 text-slate-300">
          The next admin phase should add role-permission management, user activation
          control, audit log visibility, release-authority rules, module access
          settings and protected admin actions.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/analytics"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Analytics
          </Link>
        </div>
      </Card>
    </ResourceShell>
  );
  }
