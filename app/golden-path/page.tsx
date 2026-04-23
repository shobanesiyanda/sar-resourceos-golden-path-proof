import ExecutiveShell from "../../components/ExecutiveShell";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import { getExceptions } from "../../lib/exceptions";
import { chipClass, s, yn } from "../../lib/dashboardLogic";

export default function GoldenPathPage() {
  const data: any = getGoldenPathParcel();
  const exceptionsData: any = getExceptions();

  const parcel: any = data?.parcel || {};
  const parcelId = s(parcel?.parcelId, "PAR-CHR-2026-0001");
  const acceptedTons = s(parcel?.acceptedTons, "33.9");
  const financeState = s(parcel?.financeState, "finance_handoff_ready");
  const exportState = s(parcel?.accountingExportState, "ready_for_export");

  const exceptions = (exceptionsData?.exceptions || []).filter(
    (item: any) => !item?.parcelId || s(item.parcelId) === parcelId
  );

  const financeBlocked = exceptions.filter(
    (item: any) => yn(item?.financeAllowed) === "no"
  ).length;

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
      sub: financeBlocked > 0 ? "Blocked by finance-sensitive control" : "Release gate active",
      state: financeBlocked > 0 ? "blocked" : "pending review",
      href: "/execution-readiness",
    },
    {
      title: "Dispatch Control",
      sub: "Loads in motion",
      state: "in transit",
      href: "/dispatch-control",
    },
    {
      title: "Reconciliation",
      sub: "Awaiting final match",
      state: "pending review",
      href: "/reconciliation",
    },
    {
      title: "Finance Handoff",
      sub: "Downstream release state",
      state: financeState,
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
            <span className="bb-chip bb-chip-amber">Operator view</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{parcelId}</div>
            <div className="bb-side-sub">Accepted tons {acceptedTons}</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Finance state</div>
            <div className="bb-side-state">{financeState}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Chain status</div>
          <div className="bb-user-name">Live</div>
          <div className="bb-user-org">Golden path</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Accepted tons</div>
          <div className="bb-kpi-value">{acceptedTons}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Exceptions</div>
          <div className="bb-kpi-value">{exceptions.length}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Finance blocked</div>
          <div className="bb-kpi-value">{financeBlocked}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Export state</div>
          <div className="bb-kpi-value" style={{ fontSize: 18 }}>{exportState}</div>
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
            <span className="bb-chip bb-chip-gold">{stages.length} live stages</span>
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
              <span className={`bb-chip ${chipClass(financeState)}`}>
                {financeState}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Parcel ID</span>
                <strong>{parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Accepted tons</span>
                <strong>{acceptedTons}</strong>
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
                <span>Exceptions linked</span>
                <strong>{exceptions.length}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance blocked flags</span>
                <strong>{financeBlocked}</strong>
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
                  The golden path should remain visible as one joined operational
                  thread rather than separate disconnected pages.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Exceptions and finance-blocked flags must be visible across all
                  downstream stages.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Reconciliation and finance handoff should only follow completed
                  movement and delivery evidence.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
}
