import type { ReactNode } from "react";

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
    <main className="min-h-screen bg-[#050608] text-white">
      <div className="flex min-h-screen overflow-hidden">
        <aside className="hidden w-[248px] shrink-0 border-r border-[#27210f] bg-[#090b0f] lg:flex lg:flex-col">
          <div className="border-b border-[#27210f] px-5 py-5">
            <div className="text-3xl font-black tracking-[0.22em] text-[#d5a936]">
              SAR
            </div>
            <div className="mt-1 text-[10px] font-semibold tracking-[0.34em] text-[#a98a37]">
              {systemCode}
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const isActive = item === activeNav;

              return (
                <button
                  key={item}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition",
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
                </button>
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
          <header className="sticky top-0 z-20 border-b border-[#27210f] bg-[#080a0f]/95 backdrop-blur">
            <div className="flex h-[68px] items-center gap-4 px-4 lg:px-6">
              <div className="min-w-0">
                <div className="text-[13px] font-bold tracking-wide text-[#d5a936]">
                  {systemName}
                </div>
                <div className="mt-0.5 text-[11px] text-[#7d8593]">
                  Executive Control Portal
                </div>
              </div>

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

              <div className="flex items-center gap-2">
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
          </header>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
              <div className="mb-4 flex flex-col gap-2 border-b border-[#1d2430] pb-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-white lg:text-2xl">
                    {pageTitle}
                  </h1>
                  <p className="mt-1 text-xs text-[#8b949e]">
                    {pageSubtitle}
                  </p>
                </div>

                <button className="w-fit rounded-xl border border-[#3a2f12] bg-[#11151c] px-3 py-2 text-[11px] font-semibold text-[#d5a936] hover:bg-[#171b23]">
                  Customise Dashboard
                </button>
              </div>

              {children}

              <div className="mt-4 flex items-center justify-between border-t border-[#1d2430] pt-3 text-[10px] text-[#6b7280]">
                <span>Data as of 09:30 SAST</span>
                <span>Refresh ↻</span>
              </div>
            </div>

            {rightPanel ? (
              <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-[#27210f] bg-[#080a0f] p-4 xl:block">
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
    <div className="relative grid h-9 w-9 place-items-center rounded-xl border border-[#2a3140] bg-[#0d1117] text-[#aab2c0]">
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
  status?: "Approved" | "Pending" | "Held" | "Blocked" | "Exception" | "Complete";
}) {
  return (
    <div className="rounded-2xl border border-[#202736] bg-[#0c1017] p-3 shadow-[0_0_0_1px_rgba(213,169,54,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium text-[#8b949e]">{label}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-white">
            {value}
          </div>
        </div>
        <StatusChip status={status} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-[#6b7280]">{footer || "Current period"}</span>
        <span className="text-[#d5a936]">{trend || "Live"}</span>
      </div>
    </div>
  );
}

export function StatusChip({
  status,
}: {
  status: "Approved" | "Pending" | "Held" | "Blocked" | "Exception" | "Complete";
}) {
  const styles: Record<typeof status, string> = {
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
        "rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide",
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
    <section className="rounded-2xl border border-[#202736] bg-[#0c1017] p-3">
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
    status: "Approved" | "Pending" | "Held" | "Blocked" | "Exception" | "Complete";
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
