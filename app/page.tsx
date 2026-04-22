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
      leftLabel: "Seeded opportunities",
      leftValue: "5",
      rightLabel: "New / live intake",
      rightValue: "2",
      highlight: "Front-door deal flow",
      footer: "Capture → screen → route",
      href: "/opportunity-intake",
      progress: "54%",
    },
    {
      title: "Route Economics",
      leftLabel: "Average margin",
      leftValue: "18.9%",
      rightLabel: "Routes passing target",
      rightValue: "2",
      highlight: "Pricing engine live",
      footer: "FOT / FOB back-solving",
      href: "/route-economics",
      progress: "71%",
    },
    {
      title: "Execution Readiness",
      leftLabel: "Ready to release",
      leftValue: "2",
      rightLabel: "Blocked parcels",
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
      subtitle="Bloomberg-style operating shell for upstream screening, parcel control, exception routing, approval gating, and finance readiness."
    >
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

            <div className="bb-stack">
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
