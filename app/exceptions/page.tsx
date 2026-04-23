import ExecutiveShell from "../../components/ExecutiveShell";
import { getExceptions } from "../../lib/exceptions";
import {
  chipClass,
  firstMeaningful,
  normalizeExceptionStatus,
  s,
  yn,
} from "../../lib/dashboardLogic";

type ExceptionRow = {
  exceptionId: string;
  title: string;
  status: string;
  owner: string;
  financeAllowed: "yes" | "no";
  parcelId: string;
  note: string;
};

function buildExceptionRows(raw: any[]): ExceptionRow[] {
  return (raw || []).map((item: any, index: number) => ({
    exceptionId: s(item?.exceptionId, `EX-${index + 1}`),
    title: s(item?.title || item?.reason, `Operational exception ${index + 1}`),
    status: normalizeExceptionStatus(item?.status),
    owner: s(item?.owner || item?.assignedTo, "Operations"),
    financeAllowed: yn(item?.financeAllowed),
    parcelId: s(item?.parcelId, "PAR-CHR-2026-0001"),
    note: s(item?.note || item?.comment || item?.detail, "No additional note"),
  }));
}

export default function ExceptionsPage() {
  const data: any = getExceptions();
  const rows = buildExceptionRows(data?.exceptions || []);

  const blocked = rows.filter((x) => x.status === "blocked").length;
  const pending = rows.filter((x) => x.status === "pending review").length;
  const held = rows.filter((x) => x.status === "held").length;
  const financeBlocked = rows.filter((x) => x.financeAllowed === "no").length;

  const leadItem =
    firstMeaningful(
      rows,
      (x) =>
        x.financeAllowed === "no" ||
        x.status === "blocked" ||
        x.status === "held" ||
        x.status === "pending review"
    ) || null;

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
            <div className="bb-side-value">
              {leadItem ? leadItem.exceptionId : "No live exceptions"}
            </div>
            <div className="bb-side-sub">
              {leadItem ? leadItem.title : "Queue currently clear"}
            </div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">State</div>
            <div className="bb-side-state">
              {leadItem ? leadItem.status : "clear"}
            </div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Queue size</div>
          <div className="bb-user-name">{rows.length}</div>
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
            <span className="bb-chip bb-chip-gold">{rows.length} live items</span>
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
                {rows.map((item) => (
                  <tr key={item.exceptionId}>
                    <td>{item.exceptionId}</td>
                    <td>{item.title}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.owner}</td>
                    <td>
                      <span
                        className={`bb-chip ${
                          item.financeAllowed === "no"
                            ? "bb-chip-red"
                            : "bb-chip-blue"
                        }`}
                      >
                        {item.financeAllowed}
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
              <span className={`bb-chip ${chipClass(leadItem?.status || "clear")}`}>
                {leadItem?.status || "clear"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Exception ID</span>
                <strong>{leadItem?.exceptionId || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Title</span>
                <strong>{leadItem?.title || "No live exception selected"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Status</span>
                <strong>{leadItem?.status || "clear"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Owner</span>
                <strong>{leadItem?.owner || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Parcel</span>
                <strong>{leadItem?.parcelId || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance allowed</span>
                <strong>{leadItem?.financeAllowed || "yes"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Note</span>
                <strong>{leadItem?.note || "No additional note"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>
                  {!leadItem
                    ? "Queue currently clear"
                    : leadItem.financeAllowed === "no"
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
