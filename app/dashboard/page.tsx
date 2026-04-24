"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const controlCards = [
  {
    title: "Opportunity Intake",
    status: "Active",
    description:
      "Supplier, buyer, plant and logistics opportunities captured for review.",
  },
  {
    title: "Route Builder",
    status: "Pending",
    description:
      "Build supplier → wash plant → buyer chains with route economics.",
  },
  {
    title: "Execution Readiness",
    status: "Blocked",
    description:
      "Release gates, document checks, KYC, assay and commercial approvals.",
  },
  {
    title: "Dispatch Control",
    status: "Held",
    description:
      "Parcel movement, truck release, weighbridge, delivery and evidence tracking.",
  },
  {
    title: "Finance Handoff",
    status: "Pending",
    description:
      "Settlement readiness, invoice pack, profit view and payment approval control.",
  },
];

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
      <main className="min-h-screen bg-[#050914] px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Checking secure access...</h1>
          <p className="mt-3 text-sm text-slate-400">
            Verifying your Supabase session before opening the control dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050914] pt-20 text-white md:pt-6">
      <div className="mx-auto flex max-w-7xl gap-6 px-5 py-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl lg:block">
          <div className="mb-6 border-b border-white/10 pb-5">
            <div className="text-3xl font-black text-[#d7ad32]">SAR</div>
            <div className="mt-2 text-lg font-bold">SAR ResourceOS</div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Control Room
            </div>
          </div>

          <nav className="space-y-3">
            {[
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
            ].map((item) => (
              <div
                key={item}
                className={`rounded-2xl border px-4 py-4 text-sm font-bold ${
                  item === "Dashboard"
                    ? "border-[#d7ad32]/50 bg-[#d7ad32] text-[#07101c]"
                    : "border-white/10 bg-white/[0.03] text-slate-200"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <div className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
              SAR ResourceOS
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Executive Control Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-base text-slate-300">
              Live operating shell for opportunity intake, route control,
              execution readiness, parcel movement, reconciliation, approvals
              and finance handoff.
            </p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Active Parcels
              </div>
              <div className="mt-3 text-4xl font-black">1</div>
              <div className="mt-2 text-sm font-semibold text-[#d7ad32]">
                PAR-CHR-2026-0001
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Control State
              </div>
              <div className="mt-3 inline-flex rounded-full border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm font-black text-red-200">
                Blocked
              </div>
              <div className="mt-3 text-sm text-slate-400">
                Awaiting release conditions.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Accepted Tons
              </div>
              <div className="mt-3 text-4xl font-black">33.9</div>
              <div className="mt-2 text-sm text-slate-400">
                Lead parcel proof state.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Operator
              </div>
              <div className="mt-3 text-2xl font-black">Siyanda Luthuli</div>
              <div className="mt-2 text-sm font-semibold text-[#d7ad32]">
                Shobane African Resources
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {controlCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black">{card.title}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      card.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : card.status === "Blocked"
                        ? "bg-red-500/15 text-red-200"
                        : card.status === "Held"
                        ? "bg-orange-500/15 text-orange-200"
                        : "bg-[#d7ad32]/15 text-[#f5d778]"
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
                Route Readiness Flow
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Supplier → Plant → Buyer → Finance
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Supplier", "Pending verification"],
                ["Wash Plant", "Tolling quote required"],
                ["Buyer", "Offtake linked"],
                ["Finance", "Handoff blocked"],
              ].map(([title, state]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="text-lg font-black">{title}</div>
                  <div className="mt-2 text-sm text-slate-400">{state}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
        }
