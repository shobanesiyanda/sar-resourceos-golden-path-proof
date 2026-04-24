import ExecutiveShell from "../components/ExecutiveShell";
import { getGoldenPathParcel } from "../lib/goldenPath";
import { getExceptions } from "../lib/exceptions";
import {
  buildModuleSummary,
  chipClass,
  getControlSummary,
  normalizeFinanceState,
  s,
} from "../lib/dashboardLogic";

export default function HomePage() {
  const goldenPathData: any = getGoldenPathParcel();
  const exceptionsData: any = getExceptions();

  const parcel: any = goldenPathData?.parcel || {};
  const parcelId = s(parcel?.parcelId, "PAR-CHR-2026-0001");
  const acceptedTons = s(parcel?.acceptedTons, "33.9");
  const financeState = normalizeFinanceState(parcel?.financeState || "finance_handoff_ready");

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

  const modules = [
    {
      title: "Opportunity Intake",
      statA: "5",
      labelA: "Seeded",
      statB: "2",
      labelB: "New / live",
      headline: "Front-door deal flow",
      caption: "Capture → screen → route",
      href: "/opportunity-intake",
      state: "complete",
    },
    {
      title: "Route Economics",
      statA: summary.avgMargin,
      labelA: "Avg margin",
      statB: summary.routePassing,
      labelB: "Passing",
      headline: "Pricing engine live",
      caption: "FOT / FOB back-solving",
      href: "/route-economics",
      state: "complete",
    },
    {
      title: "Execution Readiness",
      statA: summary.readyChecks,
      labelA: "Ready",
      statB: summary.blockedChecks,
      labelB: "Blocked",
      headline:
        summary.masterState === "blocked"
          ? "Release gate blocked"
          : summary.masterState === "held"
            ? "Release gate held"
            : "Release gate active",
      caption: "Docs / quality / approval / funding",
      href: "/execution-readiness",
      state: summary.masterState,
    },
  ];

  const flow = [
    {
      label: "Feedstock",
      state: "complete",
    },
    {
      label: "Verification",
      state: "complete",
    },
    {
      label: "Pricing",
      state: "complete",
    },
    {
      label: "Release Gate",
      state: summary.masterState,
    },
    {
      label: "Dispatch",
      state: summary.masterState === "blocked" ? "pending review" : "in transit",
    },
  ];

  const controlRows = [
    {
      title: "Golden Path",
      sub: `Accepted tons ${summary.acceptedTons}`,
      detail: "Controlled parcel lifecycle",
      href: "/golden-path",
      state: parcelId,
    },
    {
      title: "Dispatch Control",
      sub: "Release, movement, delivery",
      detail: "Source → movement → destination",
      href: "/dispatch-control",
      state: `${summary.dispatchLoads} loads`,
    },
    {
      title: "Reconciliation",
      sub: "Weight / variance review",
      detail: "Source vs destination alignment",
      href: "/reconciliation",
      state: `${summary.matchedLoads} matched`,
    },
    {
      title: "Finance Handoff",
      sub: summary.financeState,
      detail: "Release into finance and export prep",
      href: "/finance-handoff",
      state: summary.hardStopFinanceBlocked > 0 ? "finance hard stop" : summary.financeState,
    },
  ];

  return (
    <ExecutiveShell
      activeHref="/golden-path"
      title="Transaction control from opportunity to finance handoff."
      subtitle="Institutional control shell for intake, route pricing, release gating, parcel execution, and finance readiness."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Control command layer</div>
          <div className="bb-command-title">Chrome operating shell</div>
          <p className="bb-command-text">
            Live operating environment linking intake, route pricing, execution
            readiness, parcel control, reconciliation, approval routing, and finance
            handoff across one transaction chain.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Chrome</span>
            <span className="bb-chip bb-chip-blue">Control active</span>
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
          <div className="bb-user-role">Operator profile</div>
          <div className="bb-user-name">Siyanda Luthuli</div>
          <div className="bb-user-org">Shobane African Resources</div>
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

      <section className="bb-panel">
        <div className="bb-panel-head">
          <div>
            <div className="bb-panel-title">Chrome operating chain</div>
            <div className="bb-panel-subtitle">
              Active upstream and control modules
            </div>
          </div>
          <span className={`bb-chip ${chipClass(summary.masterState)}`}>
            {summary.masterState}
          </span>
        </div>

        <div className="bb-grid bb-grid-modules">
          {modules.map((item) => (
            <a className="bb-module-panel" href={item.href} key={item.title}>
              <div className="bb-module-title">{item.title}</div>

              <div className="bb-module-stats">
                <div>
                  <div className="bb-module-label">{item.labelA}</div>
                  <div className="bb-module-value">{item.statA}</div>
                </div>
                <div>
                  <div className="bb-module-label">{item.labelB}</div>
                  <div className="bb-module-value">{item.statB}</div>
                </div>
              </div>

              <div className="bb-module-headline">{item.headline}</div>
              <div className="bb-module-bar">
                <span />
              </div>
              <div className="bb-module-caption">{item.caption}</div>
            </a>
          ))}
        </div>

        <div className="bb-flow-strip">
          {flow.map((item) => (
            <div className="bb-flow-step" key={item.label}>
              <div className={`bb-flow-dot ${chipClass(item.state)}`} />
              <div className="bb-flow-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Control status</div>
              <div className="bb-panel-subtitle">
                Live route into downstream operating views
              </div>
            </div>
          </div>

          <div className="bb-status-list">
            {controlRows.map((item) => (
              <a href={item.href} className="bb-status-card" key={item.title}>
                <div>
                  <div className="bb-status-title">{item.title}</div>
                  <div className="bb-status-sub">{item.sub}</div>
                  <div className="bb-status-detail">{item.detail}</div>
                </div>
                <span className={`bb-chip ${chipClass(item.state)}`}>{item.state}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Recent operating notes</div>
              <div className="bb-panel-subtitle">
                Operator-facing activity and control alerts
              </div>
            </div>
          </div>

          <div className="bb-notes">
            <div className="bb-note">
              <div className="bb-note-dot is-gold" />
              <div className="bb-note-text">
                Opportunity intake queue remains active for chrome sourcing leads.
              </div>
            </div>

            <div className="bb-note">
              <div className="bb-note-dot is-gold" />
              <div className="bb-note-text">
                Route economics screens FOT and FOB opportunities against margin bands.
              </div>
            </div>

            <div className="bb-note">
              <div className="bb-note-dot" />
              <div className="bb-note-text">
                Execution readiness now follows the normalized blocked / held /
                pending review / approved control model.
              </div>
            </div>

            <div className="bb-note">
              <div className="bb-note-dot" />
              <div className="bb-note-text">
                {summary.exceptionsOpen} open exception items remain visible across
                the control environment.
              </div>
            </div>

            <div className="bb-note">
              <div className="bb-note-dot" />
              <div className="bb-note-text">
                {summary.hardStopFinanceBlocked} hard-stop finance flags are active
                against the lead parcel.
              </div>
            </div>
          </div>
        </section>
      </div>
    </ExecutiveShell>
  );
    }
