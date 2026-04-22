import ExecutiveShell from "../../components/ExecutiveShell";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import { getExceptions } from "../../lib/exceptions";

type SearchParams = {
  parcelId?: string;
};

type ReadinessItem = {
  id: string;
  label: string;
  group: string;
  state: string;
  note: string;
};

function chipClass(value?: string) {
  const v = String(value || "").toLowerCase();

  if (
    v.includes("ready") ||
    v.includes("approved") ||
    v.includes("pass") ||
    v.includes("complete") ||
    v.includes("released")
  ) {
    return "bb-chip-blue";
  }

  if (
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("awaiting") ||
    v.includes("hold")
  ) {
    return "bb-chip-amber";
  }

  if (
    v.includes("blocked") ||
    v.includes("fail") ||
    v.includes("missing") ||
    v.includes("reject")
  ) {
    return "bb-chip-red";
  }

  return "bb-chip-gold";
}

function normalizeState(value?: string) {
  return String(value || "pending review");
}

function buildReadinessItems(parcel: any): ReadinessItem[] {
  const sourceChecks: any[] =
    (parcel?.executionReadinessChecks as any[]) ||
    (parcel?.readinessChecks as any[]) ||
    (parcel?.releaseChecks as any[]) ||
    [];

  if (Array.isArray(sourceChecks) && sourceChecks.length > 0) {
    return sourceChecks.map((item: any, index: number) => ({
      id: String(item?.id || `CHK-${index + 1}`),
      label: String(
        item?.label ||
          item?.name ||
          item?.title ||
          `Execution check ${index + 1}`
      ),
      group: String(
        item?.group || item?.category || item?.type || "Control"
      ),
      state: normalizeState(item?.state || item?.status),
      note: String(
        item?.note || item?.comment || item?.detail || "No additional note"
      ),
    }));
  }

  return [
    {
      id: "ER-001",
      label: "Supplier commercial pack",
      group: "Commercial",
      state: "approved",
      note: "Commercial pack available and intake cleared.",
    },
    {
      id: "ER-002",
      label: "Assay / grade evidence",
      group: "Quality",
      state: "pending review",
      note: "Final supporting assay confirmation still under review.",
    },
    {
      id: "ER-003",
      label: "Transport routing confirmation",
      group: "Logistics",
      state: "approved",
      note: "Route and line-haul assumptions accepted for execution.",
    },
    {
      id: "ER-004",
      label: "Plant / process readiness",
      group: "Operations",
      state: "approved",
      note: "Processing path available for planned parcel route.",
    },
    {
      id: "ER-005",
      label: "Funding / finance release",
      group: "Finance",
      state: "blocked",
      note: "Finance release remains required before dispatch authorization.",
    },
    {
      id: "ER-006",
      label: "Management approval gate",
      group: "Governance",
      state: "pending review",
      note: "Final release gate still awaiting decision.",
    },
  ];
}

export default function ExecutionReadinessPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const data: any = getGoldenPathParcel();
  const exceptionsData: any = getExceptions();

  const parcel: any = data?.parcel || {};
  const parcelId = String(
    searchParams?.parcelId || parcel?.parcelId || "PAR-CHR-2026-0001"
  );

  const readinessItems = buildReadinessItems(parcel);

  const readyCount = readinessItems.filter((item) =>
    ["approved", "ready", "pass", "complete", "released"].includes(
      String(item.state).toLowerCase()
    )
  ).length;

  const pendingCount = readinessItems.filter((item) =>
    ["pending review", "pending", "awaiting", "hold"].includes(
      String(item.state).toLowerCase()
    )
  ).length;

  const blockedCount = readinessItems.filter((item) =>
    ["blocked", "fail", "missing", "rejected"].includes(
      String(item.state).toLowerCase()
    )
  ).length;

  const relevantExceptions: any[] = (exceptionsData?.exceptions || []).filter(
    (item: any) =>
      !item?.parcelId || String(item.parcelId) === String(parcelId)
  );

  const financeBlocked = relevantExceptions.filter(
    (item: any) => String(item?.financeAllowed || "").toLowerCase() === "no"
  ).length;

  const leadItem: ReadinessItem =
    readinessItems.find((item) =>
      ["blocked", "pending review", "pending", "awaiting"].includes(
        String(item.state).toLowerCase()
      )
    ) || readinessItems[0];

  const nextAction =
    leadItem?.state &&
    ["blocked", "fail", "missing"].includes(String(leadItem.state).toLowerCase())
      ? `Resolve ${leadItem.label.toLowerCase()} before execution release`
      : "Proceed to final approval and release decision";

  return (
    <ExecutiveShell
      activeHref="/execution-readiness"
      title="Execution readiness and release-gate control."
      subtitle="Institutional release dashboard for commercial, quality, logistics, governance, and finance checks before parcel execution."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Release command layer</div>
          <div className="bb-command-title">
            Execution readiness / release gate
          </div>
          <p className="bb-command-text">
            This dashboard tests whether the parcel is commercially, operationally,
            financially, and procedurally ready to move from screened route into
            controlled execution.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Release control</span>
            <span className="bb-chip bb-chip-blue">Gate-driven</span>
            <span className="bb-chip bb-chip-amber">Pre-dispatch</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{parcelId}</div>
            <div className="bb-side-sub">
              Accepted tons {parcel?.acceptedTons ?? "33.9"}
            </div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Release status</div>
            <div className="bb-side-state">
              {blockedCount > 0
                ? "blocked"
                : pendingCount > 0
                  ? "pending review"
                  : "ready for release"}
            </div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Gate signal</div>
          <div className="bb-user-name">
            {blockedCount > 0 ? "Hold" : pendingCount > 0 ? "Review" : "Ready"}
          </div>
          <div className="bb-user-org">Execution state</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Ready checks</div>
          <div className="bb-kpi-value">{readyCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Pending review</div>
          <div className="bb-kpi-value">{pendingCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Blocked</div>
          <div className="bb-kpi-value">{blockedCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Finance blocked</div>
          <div className="bb-kpi-value">{financeBlocked}</div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Release-gate overview</div>
              <div className="bb-panel-subtitle">
                Readiness state by check group, gate status, and release decision
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">
              {readinessItems.length} total checks
            </span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Group</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {readinessItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.label}</td>
                    <td>{item.group}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.state)}`}>
                        {item.state}
                      </span>
                    </td>
                    <td>{item.note}</td>
                    <td>
                      <a href="/exceptions" className="bb-table-action">
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="bb-stack">
          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Lead gate issue</div>
                <div className="bb-panel-subtitle">
                  Active execution blocker or next decision point
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem?.state)}`}>
                {leadItem?.state || "pending review"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Parcel</span>
                <strong>{parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Lead issue</span>
                <strong>{leadItem?.label || "No active issue"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Group</span>
                <strong>{leadItem?.group || "Control"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Status</span>
                <strong>{leadItem?.state || "pending review"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Accepted tons</span>
                <strong>{parcel?.acceptedTons ?? "33.9"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance state</span>
                <strong>{parcel?.financeState || "finance_handoff_ready"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Accounting export state</span>
                <strong>
                  {parcel?.accountingExportState || "ready_for_export"}
                </strong>
              </div>
              <div className="bb-metric-row">
                <span>Exceptions linked</span>
                <strong>{relevantExceptions.length}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance blocked flags</span>
                <strong>{financeBlocked}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>{nextAction}</strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Readiness notes</div>
                <div className="bb-panel-subtitle">
                  Release interpretation and control guidance
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Execution readiness should only clear when commercial, logistics,
                  quality, approval, and finance conditions are aligned.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Pending review checks should remain visible until supporting
                  evidence or management sign-off is completed.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Blocked items must prevent release into dispatch and downstream
                  execution until resolved.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Finance-blocked exceptions should continue to hold execution even
                  where technical readiness is otherwise complete.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
}
