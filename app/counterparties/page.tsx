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

type Counterparty = {
  counterparty_code: string;
  counterparty_type: string;
  company_name: string;
  location: string | null;
  province: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

function Badge({ state }: { state: string }) {
  const style =
    state === "Blocked"
      ? "border-red-400/40 bg-red-500/15 text-red-200"
      : state === "Held"
      ? "border-orange-400/40 bg-orange-500/15 text-orange-200"
      : state === "Approved" || state === "Complete" || state === "Active"
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

export default function CounterpartiesPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);

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

      const { data: counterpartyData, error: counterpartyError } = await supabase
        .from("counterparties")
        .select(
          "counterparty_code, counterparty_type, company_name, location, province, contact_person, contact_email, contact_phone, status, notes, created_at"
        )
        .order("counterparty_type", { ascending: true });

      if (counterpartyError) {
        setError("Counterparties could not be loaded.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setCounterparties(counterpartyData ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <Card label="SAR ResourceOS" title="Loading counterparties..." />
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
          <h1 className="mt-3 text-2xl font-black">Counterparties module error</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </section>
      </main>
    );
  }

  const suppliers = counterparties.filter(
    (item) => item.counterparty_type === "Supplier"
  );

  const buyers = counterparties.filter(
    (item) => item.counterparty_type === "Buyer"
  );

  const washPlants = counterparties.filter(
    (item) => item.counterparty_type === "Wash Plant"
  );

  const transporters = counterparties.filter(
    (item) => item.counterparty_type === "Transporter"
  );

  const blockedCount = counterparties.filter(
    (item) => item.status === "Blocked"
  ).length;

  const pendingCount = counterparties.filter(
    (item) => item.status === "Pending"
  ).length;

  const activeCount = counterparties.filter(
    (item) =>
      item.status === "Active" ||
      item.status === "Approved" ||
      item.status === "Complete"
  ).length;

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card label="SAR ResourceOS" title="Counterparties Control Module">
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Live counterparty register for suppliers, buyers, wash plants and
            transporters linked to route readiness, verification and release control.
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
              Counterparties
            </p>
            <p className="mt-3 text-4xl font-black">{counterparties.length}</p>
            <p className="mt-2 text-sm text-slate-400">Live records loaded.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Pending
            </p>
            <p className="mt-3 text-4xl font-black text-[#f5d778]">
              {pendingCount}
            </p>
            <p className="mt-2 text-sm text-slate-400">Awaiting verification.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Blocked
            </p>
            <p className="mt-3 text-4xl font-black text-red-200">
              {blockedCount}
            </p>
            <p className="mt-2 text-sm text-slate-400">Blocking readiness.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Active / Approved
            </p>
            <p className="mt-3 text-4xl font-black text-emerald-200">
              {activeCount}
            </p>
            <p className="mt-2 text-sm text-slate-400">Ready parties.</p>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-4">
          <Card label="Supplier" title={`${suppliers.length} linked`}>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Feedstock/source parties requiring KYC, source evidence, commercial
              terms and material availability confirmation.
            </p>
          </Card>

          <Card label="Wash Plant" title={`${washPlants.length} linked`}>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Tolling and beneficiation parties requiring throughput, recovery,
              assay timing and pricing confirmation.
            </p>
          </Card>

          <Card label="Buyer" title={`${buyers.length} linked`}>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Offtake or demand-side parties requiring purchase support, payment
              terms and delivery acceptance logic.
            </p>
          </Card>

          <Card label="Transporter" title={`${transporters.length} linked`}>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Logistics parties requiring rate, availability, truck spec, route
              timing and dispatch readiness.
            </p>
          </Card>
        </section>

        <Card label="Counterparty Register" title="Linked route parties">
          <div className="mt-5 space-y-4">
            {counterparties.map((item) => (
              <div
                key={`${item.counterparty_type}-${item.company_name}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.counterparty_type}
                    </p>

                    <h3 className="mt-2 text-xl font-black">{item.company_name}</h3>

                    <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
                      {item.counterparty_code}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.location ?? "Location pending"}
                      {item.province ? `, ${item.province}` : ""}
                    </p>

                    {item.contact_person || item.contact_email || item.contact_phone ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-[#050914]/70 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Contact
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
                          {item.contact_person ?? "Contact person pending"}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.contact_email ?? "Email pending"}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.contact_phone ?? "Phone pending"}
                        </p>
                      </div>
                    ) : null}

                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {item.notes ?? "No counterparty note captured."}
                    </p>
                  </div>

                  <Badge state={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card label="Readiness Control" title="Counterparty gate state">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Supplier verification
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Supplier status must move out of Pending before commercial release.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Plant readiness
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Wash plant status is currently the main route blocker until
                  tolling, yield and assay timing are verified.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Buyer / transport alignment
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Buyer and transporter records remain linked but require final
                  support documents before dispatch release.
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
                  Route readiness remains controlled until supplier, plant, buyer
                  and transporter records are verified with supporting documents.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
    }
