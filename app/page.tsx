import Header from "../components/Header";
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
    { label: "Overview", href: "/" },
    { label: "Opportunity Intake", href: "/opportunity-intake" },
    { label: "Route Economics", href: "/route-economics" },
    { label: "Execution Readiness", href: "/execution-readiness" },
    { label: "Open Proof", href: "/golden-path", primary: true },
    { label: "Dispatch Control", href: "/dispatch-control" },
    { label: "Reconciliation", href: "/reconciliation" },
    { label: "Open Exceptions", href: "/exceptions" },
    { label: "Approval Queue", href: "/approval-queue" },
    { label: "Finance Handoff", href: "/finance-handoff" },
  ];

  const chromeCards = [
    {
      title: "Opportunity Intake",
      metricA: "5",
      metricALabel: "Seeded opportunities",
      metricB: "2",
      metricBLabel: "New / live intake",
      value: "Front-door deal flow",
      footer: "Capture → screen → route",
      href: "/opportunity-intake",
    },
    {
      title: "Route Economics",
      metricA: "18.9%",
      metricALabel: "Average margin",
      metricB: "2",
      metricBLabel: "Routes passing target",
      value: "Pricing engine live",
      footer: "FOT / FOB back-solving",
      href: "/route-economics",
    },
    {
      title: "Execution Readiness",
      metricA: "2",
      metricALabel: "Ready to release",
      metricB: "1",
      metricBLabel: "Blocked parcels",
      value: "Release gate active",
      footer: "Docs / quality / approval / funding",
      href: "/execution-readiness",
    },
  ];

  const controlCards = [
    {
      title: "Golden Path",
      value: data.parcel.parcelId,
      sub: `Accepted tons ${data.parcel.acceptedTons}`,
      footer: "Controlled parcel lifecycle",
      href: "/golden-path",
    },
    {
      title: "Dispatch Control",
      value: "5 loads",
      sub: "Release, movement, delivery",
      footer: "Source → movement → destination",
      href: "/dispatch-control",
    },
    {
      title: "Reconciliation",
      value: "2 matched",
      sub: "Weight / variance review",
      footer: "Source vs destination alignment",
      href: "/reconciliation",
    },
    {
      title: "Finance Handoff",
      value: data.parcel.financeState,
      sub: data.parcel.accountingExportState,
      footer: "Release into finance and export prep",
      href: "/finance-handoff",
    },
  ];

  const activityItems = [
    "Opportunity intake queue remains active for chrome sourcing leads.",
    "Route economics now screens FOT and FOB opportunities against margin bands.",
    "Execution readiness controls parcels before dispatch release.",
    `${totalExceptions} total exceptions visible across the control environment.`,
    `${blocked} blocked, ${pending} pending review, ${held} held, ${financeBlocked} finance-blocked flags tracked.`,
  ];

  const flowSteps = [
    "Feedstock",
    "Verification",
    "Pricing",
    "Release Gate",
    "Dispatch",
  ];

  return (
    <>
      <Header />

      <section className="os-shell">
        <div className="container os-shell-container">
          <div className="os-shell-grid">
            <aside className="os-sidebar">
              <div className="os-sidebar-eyebrow">SAR ResourceOS</div>
              <div className="os-sidebar-title">Executive control shell</div>
              <div className="os-sidebar-copy">
                Opportunity intake, route economics, execution readiness, parcel
                control, reconciliation, exceptions, approval, and finance handoff
                in one operating view.
              </div>

              <div className="os-sidebar-links">
                {modules.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={item.primary ? "os-nav-link os-nav-link-primary" : "os-nav-link"}
                  >
                    <span>{item.label}</span>
                    <span className="os-nav-arrow">›</span>
                  </a>
                ))}
              </div>
            </aside>

            <main className="os-main">
              <div className="os-hero-card">
                <div className="os-hero-top">
                  <div>
                    <div className="os-eyebrow">Operating dashboard</div>
                    <h1 className="os-title">
                      Transaction control from opportunity to finance handoff.
                    </h1>
                  </div>

                  <div className="os-lead-card">
                    <div className="os-lead-label">Lead parcel</div>
                    <div className="os-lead-value">{data.parcel.parcelId}</div>
                    <div className="os-lead-state">{data.parcel.financeState}</div>
                  </div>
                </div>

                <p className="os-hero-copy">
                  This live proof environment now covers upstream opportunity intake,
                  commercial route pricing, execution release gating, controlled parcel
                  execution, dispatch control, reconciliation, exception handling,
                  approval gating, and finance handoff readiness across one connected
                  prototype.
                </p>

                <div className="os-kpi-grid">
                  <div className="os-kpi-card">
                    <div className="os-kpi-label">Accepted tons</div>
                    <div className="os-kpi-value">{data.parcel.acceptedTons}</div>
                  </div>
                  <div className="os-kpi-card">
                    <div className="os-kpi-label">Exceptions</div>
                    <div className="os-kpi-value">{totalExceptions}</div>
                  </div>
                  <div className="os-kpi-card">
                    <div className="os-kpi-label">Blocked / held</div>
                    <div className="os-kpi-value">{blocked + held}</div>
                  </div>
                  <div className="os-kpi-card">
                    <div className="os-kpi-label">Finance blocked</div>
                    <div className="os-kpi-value">{financeBlocked}</div>
                  </div>
                </div>
              </div>

              <div className="os-two-col">
                <div className="os-panel">
                  <div className="os-panel-head">
                    <div className="os-panel-title">Chrome operating chain</div>
                    <div className="os-panel-accent">Active modules</div>
                  </div>

                  <div className="os-card-grid os-card-grid-three">
                    {chromeCards.map((card, index) => (
                      <a key={card.href} href={card.href} className="os-mini-card">
                        <div className="os-mini-title">{card.title}</div>

                        <div className="os-mini-metrics">
                          <div>
                            <div className="os-mini-label">{card.metricALabel}</div>
                            <div className="os-mini-value">{card.metricA}</div>
                          </div>
                          <div>
                            <div className="os-mini-label">{card.metricBLabel}</div>
                            <div className="os-mini-value">{card.metricB}</div>
                          </div>
                        </div>

                        <div className="os-mini-highlight">{card.value}</div>

                        <div className="os-progress">
                          <div
                            className="os-progress-fill"
                            style={{
                              width:
                                index === 0 ? "54%" : index === 1 ? "71%" : "63%",
                            }}
                          />
                        </div>

                        <div className="os-mini-footer">{card.footer}</div>
                      </a>
                    ))}
                  </div>

                  <div className="os-flow-grid">
                    {flowSteps.map((step, index) => (
                      <div key={step} className="os-flow-step">
                        <div
                          className={
                            index < 4 ? "os-flow-icon os-flow-icon-active" : "os-flow-icon"
                          }
                        />
                        <div className="os-flow-label">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="os-right-stack">
                  <div className="os-panel">
                    <div className="os-panel-title" style={{ marginBottom: 16 }}>
                      Control status
                    </div>

                    <div className="os-card-grid">
                      {controlCards.map((card) => (
                        <a key={card.href} href={card.href} className="os-mini-card">
                          <div className="os-status-top">
                            <div className="os-status-title">{card.title}</div>
                            <div className="os-status-arrow">›</div>
                          </div>

                          <div className="os-status-value">{card.value}</div>
                          <div className="os-status-sub">{card.sub}</div>
                          <div className="os-status-footer">{card.footer}</div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="os-panel">
                    <div className="os-panel-title" style={{ marginBottom: 16 }}>
                      Recent operating notes
                    </div>

                    <div className="os-notes">
                      {activityItems.map((item, index) => (
                        <div key={item} className="os-note-row">
                          <div
                            className={index < 2 ? "os-note-dot os-note-dot-gold" : "os-note-dot"}
                          />
                          <div className="os-note-text">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <style jsx>{`
        .os-shell {
          background:
            radial-gradient(circle at top left, rgba(200, 162, 57, 0.12), transparent 22%),
            linear-gradient(135deg, #10141d 0%, #161c27 48%, #111827 100%);
          color: #f8fafc;
          padding: 28px 0 56px;
          border-top: 1px solid rgba(200, 162, 57, 0.15);
        }

        .os-shell-container {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .os-shell-grid {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 24px;
        }

        .os-sidebar,
        .os-panel,
        .os-hero-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(200, 162, 57, 0.14);
          border-radius: 28px;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
        }

        .os-sidebar {
          padding: 22px;
          align-self: start;
        }

        .os-sidebar-eyebrow,
        .os-eyebrow {
          font-size: 14px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c8a239;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .os-sidebar-title {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.08;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .os-sidebar-copy {
          color: #9ca3af;
          line-height: 1.7;
          font-size: 15px;
          margin-bottom: 24px;
        }

        .os-sidebar-links {
          display: grid;
          gap: 12px;
        }

        .os-nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 56px;
          padding: 0 18px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #f8fafc;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
        }

        .os-nav-link-primary {
          border: 1px solid #c8a239;
          background: linear-gradient(135deg, #c8a239 0%, #b88d1b 100%);
          color: #111827;
          box-shadow: 0 10px 28px rgba(200, 162, 57, 0.28);
        }

        .os-nav-arrow {
          opacity: 0.75;
        }

        .os-main {
          display: grid;
          gap: 22px;
        }

        .os-hero-card {
          padding: 28px;
        }

        .os-hero-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .os-title {
          margin: 0;
          font-size: 44px;
          line-height: 1.04;
          max-width: 760px;
          color: #f8fafc;
        }

        .os-lead-card {
          min-width: 220px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 18px;
        }

        .os-lead-label {
          color: #9ca3af;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .os-lead-value {
          color: #f8fafc;
          font-weight: 800;
          font-size: 22px;
          margin-bottom: 6px;
        }

        .os-lead-state {
          color: #c8a239;
          font-weight: 700;
        }

        .os-hero-copy {
          margin: 0;
          max-width: 940px;
          color: #d1d5db;
          font-size: 18px;
          line-height: 1.75;
        }

        .os-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }

        .os-kpi-card,
        .os-mini-card,
        .os-flow-step {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
        }

        .os-kpi-card {
          padding: 18px;
        }

        .os-kpi-label,
        .os-mini-label {
          color: #9ca3af;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .os-kpi-value {
          color: #f8fafc;
          font-size: 30px;
          font-weight: 800;
        }

        .os-two-col {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 22px;
        }

        .os-panel {
          padding: 22px;
        }

        .os-panel-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .os-panel-title {
          color: #f8fafc;
          font-size: 28px;
          font-weight: 800;
        }

        .os-panel-accent {
          color: #c8a239;
          font-weight: 700;
        }

        .os-card-grid {
          display: grid;
          gap: 16px;
        }

        .os-card-grid-three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-bottom: 18px;
        }

        .os-mini-card {
          padding: 18px;
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .os-mini-title,
        .os-status-title {
          color: #f8fafc;
          font-weight: 800;
          font-size: 22px;
          margin-bottom: 16px;
        }

        .os-mini-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .os-mini-value {
          color: #f8fafc;
          font-size: 24px;
          font-weight: 800;
        }

        .os-mini-highlight,
        .os-status-value {
          color: #c8a239;
          font-weight: 800;
          font-size: 24px;
          margin-bottom: 10px;
          word-break: break-word;
        }

        .os-progress {
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          margin-bottom: 12px;
        }

        .os-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c8a239 0%, #f2d37c 100%);
        }

        .os-mini-footer,
        .os-status-footer {
          color: #9ca3af;
          font-size: 14px;
        }

        .os-flow-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .os-flow-step {
          padding: 14px;
          text-align: center;
        }

        .os-flow-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 auto 10px;
        }

        .os-flow-icon-active {
          background: linear-gradient(135deg, #c8a239 0%, #b88d1b 100%);
        }

        .os-flow-label {
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 700;
        }

        .os-right-stack {
          display: grid;
          gap: 22px;
        }

        .os-status-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .os-status-arrow {
          color: #c8a239;
          font-weight: 700;
        }

        .os-status-sub {
          color: #d1d5db;
          margin-bottom: 8px;
        }

        .os-notes {
          display: grid;
          gap: 12px;
        }

        .os-note-row {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 12px;
          align-items: start;
        }

        .os-note-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #93c5fd;
          margin-top: 7px;
        }

        .os-note-dot-gold {
          background: #c8a239;
        }

        .os-note-text {
          color: #d1d5db;
          line-height: 1.7;
        }

        @media (max-width: 1100px) {
          .os-shell-grid,
          .os-two-col {
            grid-template-columns: 1fr;
          }

          .os-card-grid-three {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .os-kpi-grid,
          .os-flow-grid {
            grid-template-columns: 1fr;
          }

          .os-title {
            font-size: 30px;
          }

          .os-panel-title {
            font-size: 24px;
          }

          .os-sidebar-title {
            font-size: 24px;
          }

          .os-hero-copy {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
    }
