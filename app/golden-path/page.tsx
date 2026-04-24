import ExecutiveShell from "../../components/ExecutiveShell";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import { getExceptions } from "../../lib/exceptions";
import {
  buildModuleSummary,
  chipClass,
  getControlSummary,
  normalizeFinanceState,
  s,
} from "../../lib/dashboardLogic";

export default function GoldenPathPage() {
  const data: any = getGoldenPathParcel();
  const exceptionsData: any = getExceptions();

  const parcel: any = data?.parcel || {};
  const parcelId = s(parcel?.parcelId, "PAR-CHR-2026-0001");
  const acceptedTons = s(parcel?.acceptedTons, "33.9");
  const financeState = normalizeFinanceState(parcel?.financeState || "finance_handoff_ready");
  const exportState = normalizeFinanceState(parcel?.accountingExportState || "ready_for_export");

  const controlSummary = getControlSummary(exceptionsData?.exceptions || [], parcelId);

  const summary = buildModuleSummary({
    acceptedTons,
    avgMargin: "18.9%",
    routePassing: "2",
    readyChecks: "3",
    blockedChecks: controlSummary.blocked,
    dispatchLoads: "5",
    matchedLoads: "2",
    financeState,
    controlSummary,
  });

  const stages = [
    {
      title: "Opportunity Intake",
      sub: "Captured and qualified",
      state: "complete",
      href: "/opportunity-intake",
    },
    {
      title: "Route Economics",
      sub: "Commercial route passed",
      state: "complete",
      href: "/route-economics",
    },
    {
      title: "Execution Readiness",
      sub:
        summary.masterState === "blocked"
          ? "Blocked by hard-stop control item"
          : summary.masterState === "held"
            ? "Held pending temporary clearance"
            : summary.masterState === "pending review"
              ? "Pending management or evidence review"
              : "Release gate clear",
      state: summary.masterState,
      href: "/execution-readiness",
    },
    {
      title: "Dispatch Control",
      sub:
        summary.masterState === "blocked"
          ? "Dispatch remains prevented by hard stop"
          : "Loads in movement control",
      state: summary.masterState === "blocked" ? "pending review" : "in transit",
      href: "/dispatch-control",
    },
    {
      title: "Reconciliation",
      sub: "Weight and variance review",
      state: "pending review",
      href: "/reconciliation",
    },
    {
      title: "Finance Handoff",
      sub:
        summary.hardStopFinanceBlocked > 0
          ? "Finance hard-stop flag active"
          : "Downstream release state",
      state:
        summary.hardStopFinanceBlocked > 0
          ? "blocked"
          : financeState,
      href: "/finance-handoff",
    },
  ];

  return (
    <ExecutiveShell
      activeHref="/golden-path"
      title="Golden path parcel control."
      subtitle="Institutional parcel view linking intake, pricing, release, dispatch, reconciliation, and finance handoff across one controlled operating flow."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Golden path command layer</div>
          <div className="bb-command-title">Controlled parcel / end-to-end view</div>
          <p className="bb-command-text">
            This page shows the connected control path for the lead parcel from
            intake through pricing, release, dispatch, reconciliation, and finance
            readiness.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Parcel active</span>
            <span className="bb-chip bb-chip-blue">Chain connected</span>
            <span className={`bb-chip ${chipClass(summary.masterState)}`}>
              {summary.masterState}
            </span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{parcelId}</div>
            <div className="bb-side-sub">Accepted tons {summary.acceptedTons}</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Control state</div>
            <div className="bb-side-state">{summary.masterState}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Chain status</div>
          <div className="bb-user-name">{summary.masterState}</div>
          <div className="bb-user-org">Golden path</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Accepted tons</div>
          <div className="bb-kpi-value">{summary.acceptedTons}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Open exceptions</div>
          <div className="bb-kpi-value">{summary.exceptionsOpen}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Blocked / held</div>
          <div className="bb-kpi-value">
            {summary.blocked} / {summary.held}
          </div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Hard-stop finance</div>
          <div className="bb-kpi-value">{summary.hardStopFinanceBlocked}</div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Parcel chain overview</div>
              <div className="bb-panel-subtitle">
                Connected operating stages across the live parcel lifecycle
              </div>
            </div>
            <span className={`bb-chip ${chipClass(summary.masterState)}`}>
              {summary.masterState}
            </span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>State</th>
                  <th>Control meaning</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {stages.map((item) => (
                  <tr key={item.title}>
                    <td>{item.title}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.state)}`}>
                        {item.state}
                      </span>
                    </td>
                    <td>{item.sub}</td>
                    <td>
                      <a href={item.href} className="bb-table-action">
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
                <div className="bb-panel-title">Lead parcel detail</div>
                <div className="bb-panel-subtitle">
                  Operating status for the controlled parcel
                </div>
              </div>
              <span className={`bb-chip ${chipClass(summary.masterState)}`}>
                {summary.masterState}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Parcel ID</span>
                <strong>{parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Accepted tons</span>
                <strong>{summary.acceptedTons}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance state</span>
                <strong>{financeState}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Accounting export state</span>
                <strong>{exportState}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Open exceptions</span>
                <strong>{summary.exceptionsOpen}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Blocked</span>
                <strong>{summary.blocked}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Held</span>
                <strong>{summary.held}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Pending review</span>
                <strong>{summary.pendingReview}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Hard-stop finance blocked</span>
                <strong>{summary.hardStopFinanceBlocked}</strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Golden path notes</div>
                <div className="bb-panel-subtitle">
                  Cross-stage control interpretation
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Golden Path now uses the same blocked / held / pending review /
                  approved state model as Exceptions, Approval Queue, and Finance Handoff.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Hard-stop finance blockers are separated from general finance-sensitive
                  pending-review items.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Summary cards and chain rows are now driven from the same normalized
                  control summary.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
    }
