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
      progress: "54%",
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
      progress: "71%",
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

      <section
        style={{
          background:
            "radial-gradient(circle at top left, rgba(200, 162, 57, 0.12), transparent 22%), linear-gradient(135deg, #10141d 0%, #161c27 48%, #111827 100%)",
          color: "#f8fafc",
          padding: "28px 0 56px",
          borderTop: "1px solid rgba(200, 162, 57, 0.15)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px minmax(0, 1fr)",
              gap: 24,
            }}
          >
            <aside
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(200, 162, 57, 0.14)",
                borderRadius: 28,
                boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
                padding: 22,
                alignSelf: "start",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#c8a239",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                SAR ResourceOS
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.08,
                  color: "#f8fafc",
                  marginBottom: 8,
                }}
              >
                Executive control shell
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  lineHeight: 1.7,
                  fontSize: 15,
                  marginBottom: 24,
                }}
              >
                Opportunity intake, route economics, execution readiness, parcel
                control, reconciliation, exceptions, approval, and finance handoff
                in one operating view.
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {modules.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: 56,
                      padding: "0 18px",
                      borderRadius: 18,
                      border: item.primary
                        ? "1px solid #c8a239"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      background: item.primary
                        ? "linear-gradient(135deg, #c8a239 0%, #b88d1b 100%)"
                        : "rgba(255, 255, 255, 0.03)",
                      color: item.primary ? "#111827" : "#f8fafc",
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      boxShadow: item.primary
                        ? "0 10px 28px rgba(200, 162, 57, 0.28)"
                        : "none",
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ opacity: 0.75 }}>›</span>
                  </a>
                ))}
              </div>
            </aside>

            <main
              style={{
                display: "grid",
                gap: 22,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(200, 162, 57, 0.14)",
                  borderRadius: 28,
                  boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
                  padding: 28,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#c8a239",
                        fontWeight: 700,
                        marginBottom: 10,
                      }}
                    >
                      Operating dashboard
                    </div>
                    <h1
                      style={{
                        margin: 0,
                        fontSize: 44,
                        lineHeight: 1.04,
                        maxWidth: 760,
                        color: "#f8fafc",
                      }}
                    >
                      Transaction control from opportunity to finance handoff.
                    </h1>
                  </div>

                  <div
                    style={{
                      minWidth: 220,
                      background: "rgba(255, 255, 255, 0.035)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 20,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      Lead parcel
                    </div>
                    <div
                      style={{
                        color: "#f8fafc",
                        fontWeight: 800,
                        fontSize: 22,
                        marginBottom: 6,
                      }}
                    >
                      {data.parcel.parcelId}
                    </div>
                    <div
                      style={{
                        color: "#c8a239",
                        fontWeight: 700,
                      }}
                    >
                      {data.parcel.financeState}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    maxWidth: 940,
                    color: "#d1d5db",
                    fontSize: 18,
                    lineHeight: 1.75,
                  }}
                >
                  This live proof environment now covers upstream opportunity intake,
                  commercial route pricing, execution release gating, controlled parcel
                  execution, dispatch control, reconciliation, exception handling,
                  approval gating, and finance handoff readiness across one connected
                  prototype.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 14,
                    marginTop: 24,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 20,
                      padding: 18,
                    }}
                  >
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>
                      Accepted tons
                    </div>
                    <div style={{ color: "#f8fafc", fontSize: 30, fontWeight: 800 }}>
                      {data.parcel.acceptedTons}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 20,
                      padding: 18,
                    }}
                  >
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>
                      Exceptions
                    </div>
                    <div style={{ color: "#f8fafc", fontSize: 30, fontWeight: 800 }}>
                      {totalExceptions}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 20,
                      padding: 18,
                    }}
                  >
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>
                      Blocked / held
                    </div>
                    <div style={{ color: "#f8fafc", fontSize: 30, fontWeight: 800 }}>
                      {blocked + held}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 20,
                      padding: 18,
                    }}
                  >
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>
                      Finance blocked
                    </div>
                    <div style={{ color: "#f8fafc", fontSize: 30, fontWeight: 800 }}>
                      {financeBlocked}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.8fr",
                  gap: 22,
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(200, 162, 57, 0.14)",
                    borderRadius: 28,
                    boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        color: "#f8fafc",
                        fontSize: 28,
                        fontWeight: 800,
                      }}
                    >
                      Chrome operating chain
                    </div>
                    <div style={{ color: "#c8a239", fontWeight: 700 }}>
                      Active modules
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 16,
                      marginBottom: 18,
                    }}
                  >
                    {chromeCards.map((card) => (
                      <a
                        key={card.href}
                        href={card.href}
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: 20,
                          padding: 18,
                          display: "block",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            color: "#f8fafc",
                            fontWeight: 800,
                            fontSize: 22,
                            marginBottom: 16,
                          }}
                        >
                          {card.title}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            marginBottom: 16,
                          }}
                        >
                          <div>
                            <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
                              {card.metricALabel}
                            </div>
                            <div style={{ color: "#f8fafc", fontSize: 24, fontWeight: 800 }}>
                              {card.metricA}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
                              {card.metricBLabel}
                            </div>
                            <div style={{ color: "#f8fafc", fontSize: 24, fontWeight: 800 }}>
                              {card.metricB}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            color: "#c8a239",
                            fontWeight: 800,
                            fontSize: 24,
                            marginBottom: 10,
                          }}
                        >
                          {card.value}
                        </div>

                        <div
                          style={{
                            height: 6,
                            borderRadius: 999,
                            background: "rgba(255, 255, 255, 0.08)",
                            overflow: "hidden",
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: card.progress,
                              background:
                                "linear-gradient(90deg, #c8a239 0%, #f2d37c 100%)",
                            }}
                          />
                        </div>

                        <div style={{ color: "#9ca3af", fontSize: 14 }}>{card.footer}</div>
                      </a>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {flowSteps.map((step, index) => (
                      <div
                        key={step}
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: 20,
                          padding: 14,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background:
                              index < 4
                                ? "linear-gradient(135deg, #c8a239 0%, #b88d1b 100%)"
                                : "rgba(255, 255, 255, 0.08)",
                            margin: "0 auto 10px",
                          }}
                        />
                        <div
                          style={{
                            color: "#e5e7eb",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: 22,
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(200, 162, 57, 0.14)",
                      borderRadius: 28,
                      boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
                      padding: 22,
                    }}
                  >
                    <div
                      style={{
                        color: "#f8fafc",
                        fontSize: 24,
                        fontWeight: 800,
                        marginBottom: 16,
                      }}
                    >
                      Control status
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 16,
                      }}
                    >
                      {controlCards.map((card) => (
                        <a
                          key={card.href}
                          href={card.href}
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: 20,
                            padding: 18,
                            display: "block",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              alignItems: "flex-start",
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                color: "#f8fafc",
                                fontWeight: 800,
                                fontSize: 20,
                              }}
                            >
                              {card.title}
                            </div>
                            <div style={{ color: "#c8a239", fontWeight: 700 }}>›</div>
                          </div>

                          <div
                            style={{
                              color: "#c8a239",
                              fontWeight: 800,
                              fontSize: 24,
                              marginBottom: 8,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.value}
                          </div>

                          <div style={{ color: "#d1d5db", marginBottom: 8 }}>{card.sub}</div>
                          <div style={{ color: "#9ca3af", fontSize: 14 }}>{card.footer}</div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(200, 162, 57, 0.14)",
                      borderRadius: 28,
                      boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
                      padding: 22,
                    }}
                  >
                    <div
                      style={{
                        color: "#f8fafc",
                        fontSize: 24,
                        fontWeight: 800,
                        marginBottom: 16,
                      }}
                    >
                      Recent operating notes
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      {activityItems.map((item, index) => (
                        <div
                          key={item}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "18px 1fr",
                            gap: 12,
                            alignItems: "start",
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: index < 2 ? "#c8a239" : "#93c5fd",
                              marginTop: 7,
                            }}
                          />
                          <div
                            style={{
                              color: "#d1d5db",
                              lineHeight: 1.7,
                            }}
                          >
                            {item}
                          </div>
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
      </>
  );
}
