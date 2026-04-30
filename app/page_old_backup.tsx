import {
  ControlCard,
  DensePanel,
  DenseTable,
  SARExecutiveShell,
  StatusChip,
} from "../components/SARExecutiveShell";

const businessNav = [
  "Dashboard",
  "Master Data",
  "Counterparties",
  "Documents",
  "Approvals",
  "Compliance",
  "HR",
  "Procurement",
  "Legal",
  "Risk",
  "Tasks",
  "Reports",
  "Admin",
];

export default function Page() {
  return (
    <SARExecutiveShell
      systemName="SAR BusinessOS"
      systemCode="BUSINESSOS"
      activeNav="Dashboard"
      navItems={businessNav}
      pageTitle="Executive Dashboard"
      pageSubtitle="Shobane African Resources — company control room across approvals, compliance, documents, HR, procurement, risk and reporting."
      rightPanel={<AIRecommendationsPanel />}
    >
      <section className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5">
        <ControlCard
          label="Open Approvals"
          value="28"
          trend="↓ 12%"
          footer="8 overdue"
          status="Pending"
        />
        <ControlCard
          label="Compliance Due"
          value="14"
          trend="↓ 7%"
          footer="5 overdue"
          status="Held"
        />
        <ControlCard
          label="High-Risk Counterparties"
          value="9"
          trend="↑ 13%"
          footer="2 new this month"
          status="Exception"
        />
        <ControlCard
          label="Open Tasks"
          value="156"
          trend="↓ 8%"
          footer="37 overdue"
          status="Pending"
        />
        <ControlCard
          label="Contracts Expiring"
          value="23"
          trend="90 days"
          footer="Renewal review"
          status="Held"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px]">
        <ExecutiveMapPanel />
        <NetworkSummaryPanel />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DensePanel title="Today’s Control Summary">
          <DenseTable
            rows={[
              { label: "Approvals decided", value: "14", status: "Complete" },
              { label: "Documents uploaded", value: "36", status: "Complete" },
              { label: "Contracts executed", value: "6", status: "Approved" },
              { label: "Payments approved", value: "R48.7m", status: "Approved" },
              { label: "Incidents reported", value: "2", status: "Exception" },
            ]}
          />
        </DensePanel>

        <DensePanel title="Document Exceptions">
          <DenseTable
            rows={[
              { label: "Expiring documents", value: "18", status: "Exception" },
              { label: "Missing signatures", value: "7", status: "Exception" },
              { label: "Version issues", value: "5", status: "Held" },
              { label: "Expiry under 30 days", value: "12", status: "Pending" },
              { label: "Evidence gaps", value: "9", status: "Exception" },
            ]}
          />
        </DensePanel>

        <DensePanel title="HR Alerts">
          <DenseTable
            rows={[
              { label: "Policy acknowledgement", value: "37", status: "Pending" },
              { label: "Probation reviews", value: "6", status: "Pending" },
              { label: "Training overdue", value: "14", status: "Held" },
              { label: "Certifications expiring", value: "9", status: "Held" },
              { label: "Leave requests", value: "11", status: "Pending" },
            ]}
          />
        </DensePanel>

        <DensePanel title="Procurement Pending">
          <DenseTable
            rows={[
              { label: "RFQs closing", value: "3", status: "Pending" },
              { label: "Purchase orders", value: "21", status: "Pending" },
              { label: "Goods receipts", value: "17", status: "Pending" },
              { label: "Invoices awaiting", value: "29", status: "Held" },
              { label: "Supplier onboarding", value: "4", status: "Pending" },
            ]}
          />
        </DensePanel>

        <DensePanel title="Risk Register Snapshot">
          <DenseTable
            rows={[
              { label: "Strategic risk", value: "3 high", status: "Held" },
              { label: "Operational risk", value: "6 high", status: "Exception" },
              { label: "Financial risk", value: "4 high", status: "Held" },
              { label: "Compliance risk", value: "5 high", status: "Exception" },
              { label: "Reputational risk", value: "2 high", status: "Pending" },
            ]}
          />
        </DensePanel>
      </section>
    </SARExecutiveShell>
  );
}

function ExecutiveMapPanel() {
  return (
    <section className="rounded-2xl border border-[#202736] bg-[#0c1017] p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-white">
            Operational Intelligence Map
          </h2>
          <p className="mt-1 text-[11px] text-[#7d8593]">
            Routes, demand, supply, operational concentration and control points.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] text-[#9ca3af]">
          <LegendDot label="Routes" tone="gold" />
          <LegendDot label="Demand" tone="blue" />
          <LegendDot label="Supply" tone="green" />
          <LegendDot label="Concentration" tone="orange" />
        </div>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {["Africa Focus", "Routes", "Demand", "Supply", "Concentration"].map(
          (item, index) => (
            <span
              key={item}
              className={[
                "shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold",
                index === 0
                  ? "border-[#d5a936]/50 bg-[#1f1a0b] text-[#f2ca63]"
                  : "border-[#202736] bg-[#080b11] text-[#9ca3af]",
              ].join(" ")}
            >
              {item}
            </span>
          )
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[170px_1fr]">
        <div className="hidden rounded-xl border border-[#1d2430] bg-[#080b11] p-3 lg:block">
          <div className="text-[11px] font-semibold text-white">View</div>
          <div className="mt-2 rounded-lg border border-[#2a3140] bg-[#0c1017] px-2 py-2 text-[11px] text-[#d1d5db]">
            Africa Focus <span className="float-right text-[#d5a936]">⌄</span>
          </div>

          <div className="mt-4 text-[11px] font-semibold text-white">Layers</div>
          <div className="mt-2 space-y-2 text-[10px] text-[#9ca3af]">
            {["Routes", "Demand", "Supply", "Operational Concentration"].map(
              (item) => (
                <label key={item} className="flex items-center gap-2">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded border border-[#d5a936] bg-[#1f1a0b] text-[8px] text-[#d5a936]">
                    ✓
                  </span>
                  {item}
                </label>
              )
            )}
          </div>

          <button className="mt-4 w-full rounded-lg border border-[#3a2f12] px-2 py-2 text-[10px] font-semibold text-[#d5a936]">
            Reset View
          </button>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-xl border border-[#1d2430] bg-[#05070b] sm:h-[420px] lg:h-[318px]">
          <MapGrid />
          <MapNode className="left-[18%] top-[27%]" label="Dakar" tone="gold" />
          <MapNode className="left-[30%] top-[42%]" label="Lagos" tone="green" />
          <MapNode className="left-[47%] top-[57%]" label="Luanda" tone="orange" />
          <MapNode className="left-[56%] top-[73%]" label="Johannesburg" tone="gold" />
          <MapNode className="left-[70%] top-[63%]" label="Beira" tone="blue" />
          <MapNode className="left-[77%] top-[41%]" label="Mombasa" tone="blue" />
          <MapNode className="left-[66%] top-[25%]" label="Port Sudan" tone="orange" />

          <RouteLine className="left-[21%] top-[32%] w-[220px] rotate-[18deg]" />
          <RouteLine className="left-[41%] top-[55%] w-[250px] -rotate-[28deg]" />
          <RouteLine className="left-[54%] top-[69%] w-[190px] -rotate-[8deg]" />
          <RouteLine className="left-[60%] top-[42%] w-[210px] rotate-[20deg]" />

          <div className="absolute left-3 top-3 rounded-xl border border-[#1d2430] bg-[#080b11]/90 p-2 lg:hidden">
            <div className="text-[10px] font-semibold text-white">
              Live Map Layer
            </div>
            <div className="mt-1 text-[9px] text-[#8b949e]">
              Supply • Demand • Route • Risk
            </div>
          </div>

          <div className="absolute bottom-3 left-3 rounded-xl border border-[#1d2430] bg-[#080b11]/90 p-3">
            <div className="text-[10px] font-semibold text-white">
              Concentration Index
            </div>
            <div className="mt-2 h-2 w-44 rounded-full bg-gradient-to-r from-[#1f6f4a] via-[#d5a936] to-[#d97706]" />
            <div className="mt-1 flex justify-between text-[9px] text-[#6b7280]">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 rounded-lg bg-[#05070b]/70 px-2 py-1 text-[10px] text-[#6b7280]">
            Updated: 09:32 SAST
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkSummaryPanel() {
  return (
    <section className="rounded-2xl border border-[#202736] bg-[#0c1017] p-4">
      <h2 className="text-[14px] font-semibold text-white">Network Summary</h2>
      <div className="mt-4 space-y-3">
        {[
          ["Active Routes", "32"],
          ["Ports & Terminals", "18"],
          ["Demand Points", "27"],
          ["Supply Sites", "16"],
          ["High Concentration Areas", "6"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-[#171d28] pb-2"
          >
            <span className="text-[11px] text-[#9ca3af]">{label}</span>
            <span className="text-[15px] font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-[#1d2430] bg-[#080b11] p-3">
        <div className="text-[11px] font-semibold text-white">Control Status</div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9ca3af]">Approvals</span>
            <StatusChip status="Pending" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9ca3af]">Compliance</span>
            <StatusChip status="Held" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9ca3af]">Risk</span>
            <StatusChip status="Exception" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AIRecommendationsPanel() {
  const alerts = [
    {
      title: "High-Risk Counterparty",
      text: "Zambezi Logistics risk score increased to 82. Review exposure.",
      status: "Exception" as const,
      time: "18m ago",
    },
    {
      title: "Contract Expiring Soon",
      text: "23 contracts expire within 90 days. Renewal review required.",
      status: "Held" as const,
      time: "32m ago",
    },
    {
      title: "Compliance Overdue",
      text: "5 company compliance items are overdue. Evidence required.",
      status: "Blocked" as const,
      time: "45m ago",
    },
    {
      title: "HR Policy Acknowledgement",
      text: "37 employees have not acknowledged the updated code.",
      status: "Pending" as const,
      time: "1h ago",
    },
    {
      title: "Procurement Opportunity",
      text: "3 RFQs closing this week with potential cost savings.",
      status: "Approved" as const,
      time: "2h ago",
    },
  ];

  return (
    <section className="rounded-2xl border border-[#202736] bg-[#0c1017] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-white">
            AI Recommendations
          </h2>
          <p className="mt-1 text-[10px] text-[#7d8593]">
            Alerts, next actions and executive control notes.
          </p>
        </div>
        <span className="text-[#d5a936]">✦</span>
      </div>

      <div className="mb-3 flex gap-2 border-b border-[#1d2430] pb-3 text-[10px]">
        <span className="rounded-full bg-[#1f1a0b] px-2 py-1 font-semibold text-[#f2ca63]">
          Alerts (6)
        </span>
        <span className="rounded-full border border-[#1d2430] px-2 py-1 text-[#8b949e]">
          Next Actions
        </span>
        <span className="rounded-full border border-[#1d2430] px-2 py-1 text-[#8b949e]">
          Insights
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className="rounded-xl border border-[#1d2430] bg-[#080b11] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-white">
                  {alert.title}
                </div>
                <p className="mt-1 text-[10px] leading-4 text-[#9ca3af]">
                  {alert.text}
                </p>
              </div>
              <StatusChip status={alert.status} />
            </div>
            <div className="mt-2 text-[9px] text-[#6b7280]">{alert.time}</div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-xl border border-[#3a2f12] bg-[#11151c] px-3 py-2 text-[11px] font-semibold text-[#d5a936]">
        View All Recommendations →
      </button>
    </section>
  );
}

function LegendDot({
  label,
  tone,
}: {
  label: string;
  tone: "gold" | "blue" | "green" | "orange";
}) {
  const tones = {
    gold: "bg-[#d5a936]",
    blue: "bg-sky-400",
    green: "bg-emerald-400",
    orange: "bg-orange-400",
  };

  return (
    <span className="flex items-center gap-1.5">
      <span className={["h-2 w-2 rounded-full", tones[tone]].join(" ")} />
      {label}
    </span>
  );
}

function MapGrid() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(213,169,54,0.14),transparent_35%),radial-gradient(circle_at_58%_64%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_70%_36%,rgba(56,189,248,0.10),transparent_26%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute left-[29%] top-[10%] h-[78%] w-[45%] rounded-[48%_42%_46%_44%] border border-[#2a3140] bg-[#0b1118]/70 shadow-[0_0_70px_rgba(213,169,54,0.08)]" />
      <div className="absolute left-[43%] top-[33%] h-[34%] w-[18%] rotate-12 rounded-[60%_35%_55%_45%] border border-[#343b49] bg-[#101720]/70" />
    </div>
  );
}

function MapNode({
  label,
  tone,
  className,
}: {
  label: string;
  tone: "gold" | "blue" | "green" | "orange";
  className: string;
}) {
  const tones = {
    gold: "bg-[#d5a936] shadow-[0_0_24px_rgba(213,169,54,0.75)]",
    blue: "bg-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.75)]",
    green: "bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.75)]",
    orange: "bg-orange-400 shadow-[0_0_24px_rgba(251,146,60,0.75)]",
  };

  return (
    <div className={["absolute", className].join(" ")}>
      <div
        className={["h-3 w-3 rounded-full ring-4 ring-white/5", tones[tone]].join(
          " "
        )}
      />
      <div className="mt-1 rounded bg-[#05070b]/70 px-1.5 py-0.5 text-[9px] font-medium text-[#d1d5db]">
        {label}
      </div>
    </div>
  );
}

function RouteLine({ className }: { className: string }) {
  return (
    <div
      className={[
        "absolute h-px origin-left bg-gradient-to-r from-[#d5a936] via-emerald-400 to-sky-400 opacity-80",
        className,
      ].join(" ")}
    />
  );
}
