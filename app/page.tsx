import ExecutiveShell from "../components/ExecutiveShell";
import { getGoldenPathParcel } from "../lib/goldenPath";
import { getExceptions } from "../lib/exceptions";

export default function HomePage() {
  const data = getGoldenPathParcel();
  const exceptions = getExceptions();

  const totalExceptions = exceptions.exceptions.length;
  const blocked = exceptions.exceptions.filter((x) => x.status === "blocked").length;
  const pending = exceptions.exceptions.filter((x) => x.status === "pending review").length;
  const held = exceptions.exceptions.filter((x) => x.status === "held").length;
  const financeBlocked = exceptions.exceptions.filter((x) => x.financeAllowed === "No").length;

  const modules = [
    {
      title: "Opportunity Intake",
      leftLabel: "Seeded",
      leftValue: "5",
      rightLabel: "New / live",
      rightValue: "2",
      highlight: "Front-door deal flow",
      footer: "Capture → screen → route",
      href: "/opportunity-intake",
      progress: "54%",
    },
    {
      title: "Route Economics",
      leftLabel: "Avg margin",
      leftValue: "18.9%",
      rightLabel: "Passing",
      rightValue: "2",
      highlight: "Pricing engine live",
      footer: "FOT / FOB back-solving",
      href: "/route-economics",
      progress: "71%",
    },
    {
      title: "Execution Readiness",
      leftLabel: "Ready",
      leftValue: "2",
      rightLabel: "Blocked",
      rightValue: "1",
      highlight: "Release gate active",
      footer: "Docs / quality / approval / funding",
      href: "/execution-readiness",
      progress: "63%",
    },
  ];

  const controlCards = [
    {
      title: "Golden Path",
      value: data.parcel.parcelId,
      sub: `Accepted tons ${data.parcel.acceptedTons}`,
      footer: "Controlled parcel lifecycle",
      href: "/golden-path",
      toneClass: "gold",
    },
    {
      title: "Dispatch Control",
      value: "5 loads",
      sub: "Release, movement, delivery",
      footer: "Source → movement → destination",
      href: "/dispatch-control",
      toneClass: "blue",
    },
    {
      title: "Reconciliation",
      value: "2 matched",
      sub: "Weight / variance review",
      footer: "Source vs destination alignment",
      href: "/reconciliation",
      toneClass: "blue",
    },
    {
      title: "Finance Handoff",
      value: data.parcel.financeState,
      sub: data.parcel.accountingExportState,
      footer: "Release into finance and export prep",
      href: "/finance-handoff",
      toneClass: "gold",
    },
  ];

  const flowSteps = [
    "Feedstock",
    "Verification",
    "Pricing",
    "Release Gate",
    "Dispatch",
  ];

  const activityItems = [
    "Opportunity intake queue remains active for chrome sourcing leads.",
    "Route economics now screens FOT and FOB opportunities against margin bands.",
    "Execution readiness controls parcels before dispatch release.",
    `${totalExceptions} total exceptions visible across the control environment.`,
    `${blocked} blocked, ${pending} pending review, ${held} held, ${financeBlocked} finance-blocked flags tracked.`,
  ];

  return (
    <ExecutiveShell
      activeHref="/"
      title="Transaction control from opportunity to finance handoff."
      subtitle="Institutional control shell for intake, route pricing, release gating, parcel execution, and finance readiness."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Control command layer</div>
          <div className="bb-command-title">Chrome operating shell</div>
          <p className="bb-command-text">
            Live operating environment linking intake, route pricing, execution
            readiness, parcel control, reconciliation, approval routing, and
            finance handoff across one transaction chain.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Chrome</span>
            <span className="bb-chip bb-chip-blue">Control active</span>
            <span className="bb-chip bb-chip-amber">Route-screened</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{data.parcel.parcelId}</div>
            <div className="bb-side-sub">Accepted tons {data.parcel.acceptedTons}</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Finance state</div>
            <div className="bb-side-state">{data.parcel.financeState}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Operator Profile</div>
          <div className="bb-user-name">Siyanda Luthuli</div>
          <div className="bb-user-org">Shobane African Resources</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Accepted tons</div>
          <div className="bb-kpi-value">{data.parcel.acceptedTons}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Exceptions</div>
          <div className="bb-kpi-value">{totalExceptions}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Blocked / held</div>
          <div className="bb-kpi-value">{blocked + held}</div>
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
              <div className="bb-panel-title">Chrome operating chain</div>
              <div className="bb-panel-subtitle">Active upstream and control modules</div>
            </div>
            <span className="bb-chip bb-chip-gold">Live prototype</span>
          </div>

          <div className="bb-grid bb-grid-modules">
            {modules.map((module) => (
              <a key={module.href} href={module.href} className="bb-module-panel">
                <div className="bb-module-title">{module.title}</div>

                <div className="bb-module-metrics">
                  <div>
                    <div className="bb-module-label">{module.leftLabel}</div>
                    <div className="bb-module-value">{module.leftValue}</div>
                  </div>
                  <div>
                    <div className="bb-module-label">{module.rightLabel}</div>
                    <div className="bb-module-value">{module.rightValue}</div>
                  </div>
                </div>

                <div className="bb-module-highlight">{module.highlight}</div>

                <div className="bb-progress">
                  <div className="bb-progress-fill" style={{ width: module.progress }} />
                </div>

                <div className="bb-module-footer">{module.footer}</div>
              </a>
            ))}
          </div>

          <div className="bb-flow-strip">
            {flowSteps.map((step, index) => (
              <div key={step} className="bb-flow-step">
                <div className={`bb-flow-dot ${index < 4 ? "is-active" : ""}`} />
                <div className="bb-flow-text">{step}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="bb-stack">
          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Control status</div>
                <div className="bb-panel-subtitle">Live route into downstream operating views</div>
              </div>
            </div>

            <div className="bb-stack bb-stack-tight">
              {controlCards.map((card) => (
                <a key={card.href} href={card.href} className="bb-status-card">
                  <div className="bb-status-top">
                    <div className="bb-status-title">{card.title}</div>
                    <span className={`bb-chip bb-chip-${card.toneClass}`}>{card.value}</span>
                  </div>
                  <div className="bb-status-sub">{card.sub}</div>
                  <div className="bb-status-footer">{card.footer}</div>
                </a>
              ))}
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Recent operating notes</div>
                <div className="bb-panel-subtitle">Operator-facing activity and control alerts</div>
              </div>
            </div>

            <div className="bb-notes">
              {activityItems.map((item, index) => (
                <div key={item} className="bb-note">
                  <div className={`bb-note-dot ${index < 2 ? "is-gold" : ""}`} />
                  <div className="bb-note-text">{item}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
                                               }
