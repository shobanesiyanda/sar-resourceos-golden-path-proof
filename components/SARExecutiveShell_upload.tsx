import Link from "next/link";
import type { ReactNode } from "react";

type Status = "Approved" | "Pending" | "Held" | "Blocked" | "Exception" | "Complete";

type SARExecutiveShellProps = {
  systemName: "SAR BusinessOS" | "SAR ResourceOS" | "SAR AccountingOS" | "SAR Intelligence Layer";
  systemCode: "BUSINESSOS" | "RESOURCEOS" | "ACCOUNTINGOS" | "INTELLIGENCE";
  activeNav: string;
  navItems: string[];
  pageTitle: string;
  pageSubtitle: string;
  children: ReactNode;
  rightPanel?: ReactNode;
};

function navHref(item: string) {
  const key = item.trim().toLowerCase();

  const routes: Record<string, string> = {
    dashboard: "/",
    dash: "/",
    opportunities: "/opportunities",
    leads: "/leads",
    counterparties: "/counterparties",
    parties: "/counterparties",
    "route builder": "/route-builder",
    route: "/route-builder",
    operations: "/operations",
    ops: "/operations",
    "tolling & plants": "/tolling-plants",
    "tolling and plants": "/tolling-plants",
    documents: "/documents",
    approvals: "/approvals",
    finance: "/finance",
    analytics: "/analytics",
    admin: "/admin",
    fleet: "/fleet",
    "route detail": "/route-detail",
    economics: "/economics",
    "transport plan": "/transport-plan",
    more: "/admin",
  };

  return routes[key] ?? `/${key.replace(/&/g, "and").replace(/\s+/g, "-")}`;
}

export function SARExecutiveShell({
  systemName,
  systemCode,
  activeNav,
  navItems,
  pageTitle,
  pageSubtitle,
  children,
  rightPanel,
}: SARExecutiveShellProps) {
  return (
    <main className="relative min-h-screen bg-[#050608] text-white">
      <div className="relative z-10 flex min-h-screen overflow-hidden">
        <aside className="hidden w-[238px] shrink-0 border-r border-[#27210f] bg-[#080a0f] lg:flex lg:flex-col">
          <Link href="/" className="block border-b border-[#27210f] px-5 py-4">
            <div className="text-[30px] font-black leading-none tracking-[0.22em] text-[#d5a936]">
              SAR
            </div>
            <div className="mt-1 text-[10px] font-semibold tracking-[0.32em] text-[#a98a37]">
              {systemCode}
            </div>
          </Link>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const isActive = item === activeNav;

              return (
                <Link
                  key={item}
                  href={navHref(item)}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[12px] font-medium transition",
                    isActive
                      ? "bg-[#1f1a0b] text-[#f2ca63] shadow-[inset_3px_0_0_#d5a936]"
                      : "text-[#9ca3af] hover:bg-[#11151c] hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2 w-2 rounded-full",
                      isActive ? "bg-[#d5a936]" : "bg-[#3b4250]",
                    ].join(" ")}
                  />
                  <span>{item}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#27210f] px-5 py-4 text-[10px] text-[#6b7280]">
            <div>© 2026 {systemName}</div>
            <div className="mt-1">All rights reserved.</div>
            <div className="mt-4 text-[#a98a37]">Collapse «</div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#27210f] bg-[#080a0f]/95 backdrop-blur">
            <div className="flex h-[52px] items-center gap-2 px-3 sm:px-4 lg:h-[68px] lg:gap-3 lg:px-6">
              <Link
                href="/"
                className="grid h-8 w-8 place-items-center rounded-lg border border-[#2a3140] bg-[#0d1117] text-[#d5a936] lg:hidden"
                aria-label="Open dashboard"
              >
                <span className="text-base leading-none">☰</span>
              </Link>

              <Link href="/" className="min-w-0 shrink-0">
                <div className="truncate text-[13px] font-bold tracking-wide text-[#d5a936] sm:text-[14px]">
                  {systemName}
                </div>
                <div className="mt-0.5 hidden text-[10px] text-[#7d8593] sm:block">
                  Executive Control Portal
                </div>
              </Link>

              <div className="hidden h-8 items-center rounded-lg border border-[#2a3140] bg-[#0d1117] px-3 text-[11px] text-[#d1d5db] md:flex">
                Shobane African Resources
                <span className="ml-2 text-[#d5a936]">⌄</span>
              </div>

              <div className="hidden h-8 items-center rounded-lg border border-[#2a3140] bg-[#0d1117] px-3 text-[11px] text-[#d1d5db] md:flex">
                Apr 2026
                <span className="ml-2 text-[#d5a936]">⌄</span>
              </div>

              <div className="ml-auto hidden h-9 min-w-[260px] max-w-[420px] flex-1 items-center rounded-xl border border-[#2a3140] bg-[#0d1117] px-3 text-[12px] text-[#6b7280] xl:flex">
                Search across {systemName.replace("SAR ", "")}...
                <span className="ml-auto rounded-md border border-[#343b49] px-1.5 py-0.5 text-[10px] text-[#8b949e]">
                  ⌘ K
                </span>
              </div>

              <div className="ml-auto flex items-center gap-1.5 lg:gap-2">
                <TopbarIcon label="7" />
                <TopbarIcon label="12" />
                <div className="hidden rounded-xl border border-[#2a3140] bg-[#0d1117] px-3 py-2 text-right md:block">
                  <div className="text-[11px] font-semibold text-white">
                    Siyanda Luthuli
                  </div>
                  <div className="text-[10px] text-[#8b949e]">
                    Founder / Managing Director
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#141a24] px-3 py-1.5 lg:hidden">
              <nav className="flex gap-1.5 overflow-x-auto pb-0.5">
                {navItems.map((item) => {
                  const isActive = item === activeNav;

                  return (
                    <Link
                      key={item}
                      href={navHref(item)}
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                        isActive
                          ? "border-[#d5a936]/50 bg-[#1f1a0b] text-[#f2ca63]"
                          : "border-[#202736] bg-[#0c1017] text-[#8b949e]",
                      ].join(" ")}
                    >
                      {item}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {rightPanel ? (
              <div className="border-t border-[#141a24] px-3 py-1.5 xl:hidden">
                <div className="flex items-center justify-between rounded-lg border border-[#3a2f12] bg-[#11151c] px-2.5 py-1.5">
                  <div>
                    <div className="text-[10px] font-semibold text-[#f2ca63]">
                      AI / Actions Panel
                    </div>
                    <div className="text-[9px] text-[#8b949e]">
                      Urgent recommendations available
                    </div>
                  </div>
                  <span className="rounded-full bg-[#d5a936] px-2 py-0.5 text-[9px] font-black text-black">
                    Live
                  </span>
                </div>
              </div>
            ) : null}
          </header>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="min-w-0 flex-1 overflow-y-auto px-3 py-2.5 sm:px-4 lg:px-5 lg:py-4">
              <div className="mb-3 flex flex-col gap-2 border-b border-[#1d2430] pb-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-[20px] font-semibold tracking-tight text-white sm:text-[22px] lg:text-2xl">
                    {pageTitle}
                  </h1>
                  <p className="mt-1 max-w-4xl text-[11px] leading-4 text-[#8b949e] sm:text-[12px] sm:leading-5">
                    {pageSubtitle}
                  </p>
                </div>

                <Link
                  href="/admin"
                  className="w-fit rounded-lg border border-[#3a2f12] bg-[#11151c] px-3 py-1.5 text-[10px] font-semibold text-[#d5a936] hover:bg-[#171b23] lg:rounded-xl lg:py-2 lg:text-[11px]"
                >
                  Customise Dashboard
                </Link>
              </div>

              {children}

              <div className="mt-4 flex items-center justify-between border-t border-[#1d2430] pt-3 text-[10px] text-[#6b7280]">
                <span>Data as of 09:30 SAST</span>
                <span>Refresh ↻</span>
              </div>
            </div>

            {rightPanel ? (
              <aside className="hidden w-[350px] shrink-0 overflow-y-auto border-l border-[#27210f] bg-[#080a0f] p-4 xl:block">
                {rightPanel}
              </aside>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function TopbarIcon({ label }: { label: string }) {
  return (
    <div className="relative grid h-8 w-8 place-items-center rounded-lg border border-[#2a3140] bg-[#0d1117] text-[#aab2c0] sm:h-9 sm:w-9 sm:rounded-xl">
      <span className="h-2.5 w-2.5 rounded-full bg-[#8b949e]" />
      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d5a936] px-1 text-[9px] font-bold text-black">
        {label}
      </span>
    </div>
  );
}

export function ControlCard({
  label,
  value,
  trend,
  footer,
  status = "Pending",
}: {
  label: string;
  value: string;
  trend?: string;
  footer?: string;
  status?: Status;
}) {
  return (
    <div className="rounded-xl border border-[#202736] bg-[#0c1017] p-2.5 shadow-[0_0_0_1px_rgba(213,169,54,0.04)] sm:rounded-2xl sm:p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-medium text-[#8b949e] sm:text-[11px]">
            {label}
          </div>
          <div className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-white sm:text-[26px]">
            {value}
          </div>
        </div>
        <StatusChip status={status} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] sm:mt-3 sm:text-[10px]">
        <span className="truncate text-[#6b7280]">{footer || "Current period"}</span>
        <span className="shrink-0 text-[#d5a936]">{trend || "Live"}</span>
      </div>
    </div>
  );
}

export function StatusChip({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Complete: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Pending: "border-[#d5a936]/30 bg-[#d5a936]/10 text-[#f2ca63]",
    Held: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Blocked: "border-red-500/30 bg-red-500/10 text-red-300",
    Exception: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={[
        "rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide sm:px-2 sm:py-1 sm:text-[9px]",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

export function DensePanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#202736] bg-[#0c1017] p-3 sm:rounded-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-white">{title}</h2>
        <span className="text-[10px] text-[#d5a936]">View →</span>
      </div>
      {children}
    </section>
  );
}

export function DenseTable({
  rows,
}: {
  rows: Array<{
    label: string;
    value: string;
    status: Status;
  }>;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-[#171d28] pb-2 last:border-0 last:pb-0"
        >
          <div className="min-w-0 truncate text-[11px] text-[#c9d1d9]">
            {row.label}
          </div>
          <div className="text-[11px] font-semibold text-white">{row.value}</div>
          <StatusChip status={row.status} />
        </div>
      ))}
    </div>
  );
}
