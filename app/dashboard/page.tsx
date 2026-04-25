"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Profile = {
  full_name: string;
  email: string;
  company_name: string | null;
  role: string;
  is_active: boolean;
};

type Parcel = {
  parcel_code: string;
  commodity: string;
  product_description: string | null;
  accepted_tons: number;
  expected_price_per_ton: number | null;
  indicative_revenue: number | null;
  control_state: string;
  operator_name: string | null;
  company_name: string | null;
};

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function tons(value: number | null | undefined) {
  return Number(value ?? 0).toFixed(3);
}

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
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${style}`}>
      {state}
    </span>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);

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
        .select("full_name, email, company_name, role, is_active")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.is_active !== true) {
        setError("Profile not found or inactive. Check Supabase profiles table.");
        setLoading(false);
        return;
      }

      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select(
          "parcel_code, commodity, product_description, accepted_tons, expected_price_per_ton, indicative_revenue, control_state, operator_name, company_name"
        )
        .eq("parcel_code", "PAR-CHR-2026-0001")
        .single();

      if (parcelError || !parcelData) {
        setError("Parcel not found. Check Supabase parcels table.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setParcel(parcelData);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Loading live Supabase data...</h1>
          <p className="mt-3 text-sm text-slate-400">
            Checking profile and loading first live parcel.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-200">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Live data error</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
        </div>
      </main>
    );
  }

  const revenue =
    parcel?.indicative_revenue ??
    Number(parcel?.accepted_tons ?? 0) * Number(parcel?.expected_price_per_ton ?? 0);

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
            Executive Control Dashboard
          </h1>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
            Live Supabase-backed dashboard for chrome parcel control, route readiness,
            approvals and finance handoff.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Role</div>
              <div className="mt-2 font-black capitalize">{profile?.role}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Commodity
              </div>
              <div className="mt-2 font-black text-[#d7ad32]">{parcel?.commodity}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Mode</div>
              <div className="mt-2 font-black">Live v1</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Status</div>
              <div className="mt-2">
                <Badge state={parcel?.control_state ?? "Pending"} />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                Today’s Control Summary
              </p>
              <h2 className="mt-2 text-2xl font-black">Active live parcel</h2>
            </div>
            <Badge state={parcel?.control_state ?? "Pending"} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Lead Parcel
              </p>
              <div className="mt-3 text-2xl font-black">{parcel?.parcel_code}</div>
              <p className="mt-2 text-sm text-slate-400">
                {parcel?.product_description}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Accepted Tons
              </p>
              <div className="mt-3 text-4xl font-black">
                {tons(parcel?.accepted_tons)}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Loaded from Supabase parcels table.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Indicative Revenue
              </p>
              <div className="mt-3 text-3xl font-black">{money(revenue)}</div>
              <p className="mt-2 text-sm text-slate-400">
                {tons(parcel?.accepted_tons)}t × {money(parcel?.expected_price_per_ton)}/t
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Operator
              </p>
              <div className="mt-3 text-2xl font-black">
                {parcel?.operator_name ?? profile?.full_name}
              </div>
              <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
                {parcel?.company_name ?? profile?.company_name}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            Live v1 Data Spine
          </p>
          <h2 className="mt-2 text-2xl font-black">Connection confirmed</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            This dashboard is now reading your admin profile and first chrome parcel
            directly from Supabase. The next pass will restore the full locked shell
            sections using live route chain and counterparty records.
          </p>
        </section>
      </div>
    </main>
  );
     }
