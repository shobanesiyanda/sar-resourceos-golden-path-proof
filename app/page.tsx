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

  return (
    <>
      <Header />

      <section className="hero">
        <div className="container">
          <div className="eyebrow">SAR ResourceOS</div>
          <h1>Transaction control from document to finance handoff.</h1>
          <p>
            This live proof environment shows one controlled parcel lifecycle, one exception
            action dashboard, and a finance handoff view that demonstrates release readiness,
            blockers, and export preparation.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a className="btn btn-primary" href="/golden-path">
              Open Golden Path
            </a>
            <a
              className="btn"
              href="/exceptions"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Exceptions
            </a>
            <a className="btn" href="/finance-handoff">
              Open Finance Handoff
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Control overview</h2>
              <p className="muted">
                This overview summarizes the current proof environment across parcel execution,
                exception handling, and finance-readiness controls.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Parcel ID</div>
              <div className="value" style={{ fontSize: 18 }}>{data.parcel.parcelId}</div>
            </div>
            <div className="kpi">
              <div className="label">Accepted tons</div>
              <div className="value">{data.parcel.acceptedTons}</div>
            </div>
            <div className="kpi">
              <div className="label">Finance state</div>
              <div className="value" style={{ fontSize: 16 }}>{data.parcel.financeState}</div>
            </div>
            <div className="kpi">
              <div className="label">Accounting export</div>
              <div className="value" style={{ fontSize: 16 }}>{data.parcel.accountingExportState}</div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Golden path proof</h3>
              <p className="muted">
                The golden-path module proves one full parcel lifecycle from controlled document
                issuance through dispatch, movement, delivery, reconciliation, and finance handoff
                readiness.
              </p>

              <table>
                <tbody>
                  <tr>
                    <th>Document</th>
                    <td>
                      <span className="code">{data.parcel.documentNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Dispatch</th>
                    <td>
                      <span className="code">{data.parcel.dispatchRef}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Truck</th>
                    <td>{data.parcel.truckReg}</td>
                  </tr>
                  <tr>
                    <th>Gross value</th>
                    <td>R {data.parcel.grossValueZAR.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Payable-ready</th>
                    <td>R {data.parcel.payableReadyZAR.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn btn-primary" href="/golden-path">
                  View Parcel Proof
                </a>
              </div>
            </div>

            <div className="card">
              <h3>Exception action dashboard</h3>
              <p className="muted">
                The exception module proves how ResourceOS handles blocked, disputed, and escalated
                cases with visible ownership, next actions, finance impacts, and approval-linked
                decision routing.
              </p>

              <div className="kpis" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: 14 }}>
                <div className="kpi">
                  <div className="label">Total exceptions</div>
                  <div className="value">{totalExceptions}</div>
                </div>
                <div className="kpi">
                  <div className="label">Blocked</div>
                  <div className="value">{blocked}</div>
                </div>
                <div className="kpi">
                  <div className="label">Pending review</div>
                  <div className="value">{pending}</div>
                </div>
                <div className="kpi">
                  <div className="label">Held / finance blocked</div>
                  <div className="value">{held + financeBlocked}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/exceptions">
                  View Exceptions
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Finance handoff dashboard</h3>
              <p className="muted">
                The finance module shows which parcels are ready for release into finance,
                which are blocked, and which are pending approval before accounting export.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/finance-handoff">
                  View Finance Handoff
                </a>
              </div>
            </div>

            <div className="card">
              <h3>API endpoints</h3>
              <p className="muted">
                These demo endpoints expose the seeded parcel and exception data used by the proof environment.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/api/demo/parcel">
                  Parcel API
                </a>
                <a className="btn" href="/api/demo/exceptions">
                  Exceptions API
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
                                                      }                             
