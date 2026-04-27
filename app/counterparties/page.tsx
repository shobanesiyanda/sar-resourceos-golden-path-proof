"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import ResourceShell from "../../components/ResourceShell";

type CounterpartyAny = {
  id?: string;
  status?: string | null;
  notes?: string | null;
  note?: string | null;
  counterparty_type?: string | null;
  type?: string | null;
  party_type?: string | null;
  company_name?: string | null;
  name?: string | null;
  title?: string | null;
  label?: string | null;
  location?: string | null;
  region?: string | null;
  city?: string | null;
  contact_person?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

function partyId(p: CounterpartyAny, index: number) {
  return p.id || `counterparty-${index}`;
}

function partyType(p: CounterpartyAny) {
  return p.counterparty_type || p.party_type || p.type || "Counterparty";
}

function partyName(p: CounterpartyAny) {
  return (
    p.company_name ||
    p.name ||
    p.title ||
    p.label ||
    `${partyType(p)} record`
  );
}

function partyLocation(p: CounterpartyAny) {
  return p.location || p.region || p.city || "Location not captured";
}

function partyContact(p: CounterpartyAny) {
  return p.contact_person || p.contact_name || p.email || p.phone || "Contact not captured";
}

function partyNote(p: CounterpartyAny) {
  return p.notes || p.note || "No counterparty note captured yet.";
}

function statusClass(status: string | null | undefined) {
  if (status === "Complete" || status === "Approved" || status === "Verified") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }

  if (status === "Blocked" || status === "Rejected") {
    return "border-red-400/40 bg-red-500/15 text-red-200";
  }

  if (status === "Pending" || status === "Review") {
    return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  }

  return "border-white/10 bg-white/[0.03] text-slate-300";
}

function openCount(rows: CounterpartyAny[]) {
  return rows.filter(
    (r) => r.status === "Pending" || r.status === "Blocked" || r.status === "Review"
  ).length;
}

function verifiedCount(rows: CounterpartyAny[]) {
  return rows.filter(
    (r) => r.status === "Approved" || r.status === "Complete" || r.status === "Verified"
  ).length;
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

function PartyCard({ party, index }: { party: CounterpartyAny; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {partyType(party)}
          </p>
          <h4 className="mt-2 text-xl font-black text-white">{partyName(party)}</h4>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(
            party.status
          )}`}
        >
          {party.status || "Draft"}
        </span>
      </div>

      <p className="mt-3 text-sm font-bold text-[#f5d778]">{partyLocation(party)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{partyContact(party)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{partyNote(party)}</p>
    </div>
  );
}

export default function CounterpartiesPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counterparties, setCounterparties] = useState<CounterpartyAny[]>([]);

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

      const { data, error: partyError } = await supabase
        .from("counterparties")
        .select("*");

      if (partyError) {
        setError(partyError.message);
        setLoading(false);
        return;
      }

      setCounterparties((data as CounterpartyAny[]) || []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <ResourceShell title="Counterparties Control" subtitle="Loading counterparty register...">
        <Card label="Loading" title="Reading Supabase counterparty records..." />
      </ResourceShell>
    );
  }

  if (error) {
    return (
      <ResourceShell title="Counterparties Control" subtitle="Counterparties module error">
        <Card label="Error" title="Could not load counterparties">
          <p className="mt-3 text-red-200">{error}</p>
        </Card>
      </ResourceShell>
    );
  }

  const total = counterparties.length;
  const verified = verifiedCount(counterparties);
  const open = openCount(counterparties);
  const blocked = counterparties.filter((p) => p.status === "Blocked").length;
  const pending = counterparties.filter((p) => p.status === "Pending" || p.status === "Review").length;

  const suppliers = counterparties.filter((p) =>
    partyType(p).toLowerCase().includes("supplier")
  ).length;

  const buyers = counterparties.filter((p) =>
    partyType(p).toLowerCase().includes("buyer")
  ).length;

  const plants = counterparties.filter((p) =>
    partyType(p).toLowerCase().includes("plant")
  ).length;

  const transporters = counterparties.filter((p) =>
    partyType(p).toLowerCase().includes("transport")
  ).length;

  return (
    <ResourceShell
      title="Counterparties Control"
      subtitle="Read-only counterparty register for suppliers, buyers, wash plants and transporters linked to route readiness and release control."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Counterparties" value={String(total)} />
        <Stat label="Verified" value={String(verified)} gold={open === 0 && total > 0} />
        <Stat label="Open Items" value={String(open)} />
        <Stat label="Release Impact" value={open > 0 ? "Blocked" : "Clear"} gold={open === 0} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Suppliers" value={String(suppliers)} />
        <Stat label="Buyers" value={String(buyers)} />
        <Stat label="Wash Plants" value={String(plants)} />
        <Stat label="Transporters" value={String(transporters)} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Blocked" value={String(blocked)} />
        <Stat label="Pending / Review" value={String(pending)} />
        <Stat label="Verification State" value={open > 0 ? "Incomplete" : "Controlled"} />
        <Stat label="Route Dependency" value="Required" gold />
      </section>

      <Card label="Counterparty Register" title="Route-linked parties">
        <div className="mt-5 space-y-4">
          {counterparties.length > 0 ? (
            counterparties.map((party, index) => (
              <PartyCard key={partyId(party, index)} party={party} index={index} />
            ))
          ) : (
            <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
              <p className="font-black text-[#f5d778]">No counterparties loaded.</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Seed supplier, buyer, wash plant and transporter records before route release.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card label="Control Rule" title="Counterparties block release until verified">
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="text-xl font-black text-red-200">
            Do not release against unverified parties.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Supplier authority, buyer/offtake support, wash plant capability and
            transporter readiness must be verified before route, dispatch or finance
            release.
          </p>
        </div>
      </Card>

      <Card label="Next Counterparty Phase" title="Qualification actions come later">
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This Live v1 page reads counterparty readiness records only. The next phase
          will add structured onboarding, KYC/FICA evidence, source authority checks,
          company-domain enquiry controls, qualification scoring and approval routing.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/route-builder"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Open Route Builder
          </Link>
          <Link
            href="/documents"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-white"
          >
            Open Documents
          </Link>
        </div>
      </Card>
    </ResourceShell>
  );
    }
