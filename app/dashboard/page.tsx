   "use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const sidebarItems = [
  "Dashboard",
  "Opportunities",
  "Counterparties",
  "Route Builder",
  "Operations",
  "Tolling & Plants",
  "Documents",
  "Approvals",
  "Finance",
  "Analytics",
  "Admin",
];

const opportunityCards = [
  {
    title: "Chrome Parcel Intake",
    state: "Pending",
    description:
      "Supplier material, plant capacity, buyer demand and transport route still require full readiness confirmation.",
    metric: "1 active parcel",
  },
  {
    title: "Supplier Verification",
    state: "Held",
    description:
      "Supplier documents, feedstock source, grade support and commercial terms must be verified before release.",
    metric: "2 checks open",
  },
  {
    title: "Plant Readiness",
    state: "Blocked",
    description:
      "Tolling quote, throughput capacity, recovery/yield basis and assay turnaround are not fully approved.",
    metric: "Plant gate blocked",
  },
];

const exceptionItems = [
  {
    title: "Tolling quote not attached",
    owner: "Operations",
    state: "Blocked",
  },
  {
    title: "Supplier source evidence pending",
    owner: "Counterparties",
    state: "Held",
  },
  {
    title: "Finance handoff pack incomplete",
    owner: "Finance",
    state: "Pending",
  },
];

const financeMetrics = [
  {
    label: "Indicative Revenue",
    value: "R81,360",
    note: "Based on 33.9t × R2,400/t",
  },
  {
    label: "Accepted Tons",
    value: "33.9t",
    note: "Lead parcel proof state",
  },
  {
    label: "Control State",
    value: "Blocked",
    note: "Release conditions outstanding",
  },
];

function StateBadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    Approved: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    Active: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    Pending: "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]",
    Held: "border-orange-400/40 bg-orange-500/15 text-orange-200",
    Blocked: "border-red-400/40 bg-red-500/15 text-red-200",
    Exception: "border-red-400/40 bg-red-500/15 text-red-200",
    Complete: "border-sky-400/40 bg-sky-500/15 text-sky-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
        styles[state] ?? styles.Pending
      }`}
    >
      {state}
    </span>
  );
}

function MobileModuleSwitcher() {
  return (
    <section className="mb-6 lg:hidden">
      <div className="rounded-3xl border border-white/10 bg-[#080d18] p-4 shadow-2xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
          Modules
        </p>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {sidebarItems.map((item) => (
            <button
              key={item}
              className={`shrink-0 rounded-full border px-4 py-3 text-sm font-black ${
                item === "Dashboard"
                  ? "border-[#d7ad32]/60 bg-[#d7ad32] text-[#07101c]"
                  : "border-white/10 bg-white/[0.03] text-slate-300"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const supabase = createClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setChecking(false);
    }

    checkUser();
  }, [supabase]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">
            Checking secure access...
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Verifying your Supabase session before opening the control room.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050914] pt-28 text-white md:pt-28 lg:pt-24">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        {/* Locked desktop sidebar */}
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl lg:block">
          <div className="mb-6 border-b border-white/10 pb-5">
            <div className="text-3xl font-black text-[#d7ad32]">SAR</div>
            <div className="mt-2 text-lg font-black">SAR ResourceOS</div>
            <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
              Executive Control Room
            </div>
          </div>

          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <div
                key={item}
                className={`rounded-2xl border px-4 py-4 text-sm font-black ${
                  item === "Dashboard"
                    ? "border-[#d7ad32]/60 bg-[#d7ad32] text-[#07101c]"
                    : "border-white/10 bg-white/[0.03] text-slate-300"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1">
          {/* Mobile module switcher */}
          <MobileModuleSwitcher />

          {/* Topbar */}
          <div className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                  SAR ResourceOS
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
                  Executive Control Dashboard
                </h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
                  Locked operating shell for opportunity intake, counterparty
                  verification, route building, plant readiness, parcel
                  execution, reconciliation, approvals and finance handoff.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4 xl:w-[520px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Today
                  </div>
                  <div className="mt-2 font-black">Control View</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Commodity
                  </div>
                  <div className="mt-2 font-black text-[#d7ad32]">Chrome</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Mode
                  </div>
                  <div className="mt-2 font-black">Live v1</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Status
                  </div>
                  <div className="mt-2 font-black text-red-200">Blocked</div>
                </div>
              </div>
            </div>
          </div>

          {/* Today’s Control Summary */}
          <section className="mb-6">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                  Today’s Control Summary
                </p>
                <h2 className="mt-2 text-2xl font-black md:text-3xl">
                  Active route control state
                </h2>
              </div>
              <StateBadge state="Blocked" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Lead Parcel
                </p>
                <div className="mt-3 text-2xl font-black">
                  PAR-CHR-2026-0001
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  First chrome parcel proof state.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Accepted Tons
                </p>
                <div className="mt-3 text-4xl font-black">33.9</div>
                <p className="mt-2 text-sm text-slate-400">
                  Confirmed accepted volume.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Release Gate
                </p>
                <div className="mt-3">
                  <StateBadge state="Blocked" />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Awaiting plant and document readiness.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Operator
                </p>
                <div className="mt-3 text-2xl font-black">
                  Siyanda Luthuli
                </div>
                <p className="mt-2 text-sm font-semibold text-[#d7ad32]">
                  Shobane African Resources
                </p>
              </div>
            </div>
          </section>

          {/* Opportunity Cards + Readiness */}
          <section className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                  Opportunity Cards
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Open commercial workstreams
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {opportunityCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-lg font-black">{card.title}</h3>
                      <StateBadge state={card.state} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {card.description}
                    </p>
                    <p className="mt-4 text-sm font-black text-[#d7ad32]">
                      {card.metric}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                Readiness / Route Flow
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Supplier → Plant → Buyer → Finance
              </h2>

              <div className="mt-5 space-y-4">
                {[
                  ["Supplier", "Held", "Source evidence and terms pending."],
                  [
                    "Wash Plant",
                    "Blocked",
                    "Tolling and recovery not approved.",
                  ],
                  [
                    "Buyer",
                    "Pending",
                    "Offtake link present, final pack pending.",
                  ],
                  ["Finance", "Pending", "Settlement handoff not ready."],
                ].map(([title, state, note]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-black">{title}</div>
                      <StateBadge state={state} />
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Global Route & Demand Heat Map */}
          <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                  Global Route & Demand Heat Map
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Route visibility and demand concentration
                </h2>
              </div>
              <StateBadge state="Pending" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="min-h-[280px] rounded-3xl border border-white/10 bg-[#050914] p-5">
                <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-[#d7ad32]/30 bg-[radial-gradient(circle_at_center,rgba(215,173,50,0.18),transparent_45%)] p-5">
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-[0.35em] text-[#d7ad32]">
                      Heat Map Placeholder
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                      This area stays locked for live shipping corridors,
                      buyer/export demand, port concentration, regional
                      opportunities and commodity movement intelligence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Corridor", "Rustenburg → City Deep"],
                  ["Demand View", "Buyer / export readiness"],
                  ["Commodity", "Chrome concentrate"],
                  ["Action Link", "Route Builder + Analytics"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Finance + Exceptions */}
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                Finance / Exposure / Margin
              </p>
              <h2 className="mt-2 text-2xl font-black">
                First parcel finance view
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {financeMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-black">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                Exceptions / Next Actions
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Items blocking release
              </h2>

              <div className="mt-5 space-y-4">
                {exceptionItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-black">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Owner: {item.owner}
                        </p>
                      </div>
                      <StateBadge state={item.state} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
