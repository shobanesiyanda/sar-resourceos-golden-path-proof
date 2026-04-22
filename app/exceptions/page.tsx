import ExecutiveShell from "../../components/ExecutiveShell";
import { getExceptions } from "../../lib/exceptions";

function chipClass(value?: string) {
  const v = String(value || "").toLowerCase();

  if (
    v.includes("resolved") ||
    v.includes("approved") ||
    v.includes("cleared")
  ) {
    return "bb-chip-blue";
  }

  if (
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("held")
  ) {
    return "bb-chip-amber";
  }

  if (
    v.includes("blocked") ||
    v.includes("finance") ||
    v.includes("exception")
  ) {
    return "bb-chip-red";
  }

  return "bb-chip-gold";
}

export default function ExceptionsPage() {
  const data: any = getExceptions();
  const exceptions: any[] = data?.exceptions || [];

  const blocked = exceptions.filter((item) =>
    String(item?.status || "").toLowerCase().includes("blocked")
  ).length;

  const pending = exceptions.filter((item) =>
    String(item?.status || "").toLowerCase().includes("pending")
  ).length;

  const held = exceptions.filter((item) =>
    String(item?.status || "").toLowerCase().includes("held")
  ).length;

  const financeBlocked = exceptions.filter(
    (item) => String(item?.financeAllowed || "").toLowerCase() === "no"
  ).length;

  const leadItem =
    exceptions.find((item) =>
      ["blocked", "pending review", "held"].includes(
        String(item?.status || "").toLowerCase()
      )
    ) || exceptions[0] || {};

  return (
    <ExecutiveShell
      activeHref="/exceptions"
      title="Exception routing and control visibility."
      subtitle="Institutional exception dashboard for blocked, held, pending-review, and finance-sensitive control items."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Exception command layer</div>
          <div className="bb-command-title">Open exceptions / control queue</div>
          <p className="bb-command-text">
            This dashboard centralizes live operational exceptions across release,
            dispatch, reconciliation, and finance-sensitive control points.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Exception active</span>
            <span className="bb-chip bb-chip-red">Control-sensitive</span>
            <span className="bb-chip bb-chip-amber">Operator queue</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead exception</div>
            <div className="bb-side-value">{leadItem?.exceptionId || "No exception"}</div>
            <div className="bb-side-sub">{leadItem?.title || "—"}</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">State</div>
            <div className="bb-side-state">{leadItem?.status || "clear"}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Queue size</div>
          <div className="bb-user-name">{exceptions.length}</div>
          <div className="bb-user-org">Live exceptions</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Blocked</div>
          <div className="bb-kpi-value">{blocked}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Pending review</div>
          <div className="bb-kpi-value">{pending}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Held</div>
          <div className="bb-kpi-value">{held}</div>
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
              <div className="bb-panel-title">Exception overview</div>
              <div className="bb-panel-subtitle">
                Control exceptions by owner, state, and finance sensitivity
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">{exceptions.length} live items</span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Finance allowed</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {exceptions.map((item: any, index: number) => (
                  <tr key={item?.exceptionId || `EX-${index + 1}`}>
                    <td>{item?.exceptionId || `EX-${index + 1}`}</td>
                    <td>{item?.title || item?.reason || "Exception item"}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item?.status)}`}>
                        {item?.status || "pending review"}
                      </span>
                    </td>
                    <td>{item?.owner || item?.assignedTo || "Operations"}</td>
                    <td>
                      <span
                        className={`bb-chip ${
                          String(item?.financeAllowed || "").toLowerCase() === "no"
                            ? "bb-chip-red"
                            : "bb-chip-blue"
                        }`}
                      >
                        {String(item?.financeAllowed || "").toLowerCase() === "no"
                          ? "no"
                          : "yes"}
                      </span>
                    </td>
                    <td>
                      <a href="/approval-queue" className="bb-table-action">
                        Open
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
                <div className="bb-panel-title">Lead exception detail</div>
                <div className="bb-panel-subtitle">
                  Active exception and next control action
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem?.status)}`}>
                {leadItem?.status || "pending review"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Exception ID</span>
                <strong>{leadItem?.exceptionId || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Title</span>
                <strong>{leadItem?.title || leadItem?.reason || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Status</span>
                <strong>{leadItem?.status || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Owner</span>
                <strong>{leadItem?.owner || leadItem?.assignedTo || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance allowed</span>
                <strong>{leadItem?.financeAllowed || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>
                  {String(leadItem?.financeAllowed || "").toLowerCase() === "no"
                    ? "Resolve finance-sensitive blocker before release"
                    : "Route for approval decision"}
                </strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Exception notes</div>
                <div className="bb-panel-subtitle">
                  Routing interpretation and escalation guidance
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Exceptions should remain visible across all operating pages until
                  resolved or explicitly cleared.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Finance-blocked items should override normal progression into
                  dispatch, reconciliation, or settlement.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Pending items should move into approval routing rather than remain
                  informally unresolved.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
    }
