import Header from "../../components/Header";
import { getGoldenPathParcel } from "../../lib/goldenPath";

export default function GoldenPathPage() {
  const data = getGoldenPathParcel();

  return (
    <>
      <Header />
      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>One full parcel proof</h2>
              <p className="muted">
                This page demonstrates one completed golden-path flow from document to finance handoff.
              </p>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3>Parcel summary</h3>
              <table>
                <tbody>
                  <tr><th>Parcel ID</th><td>{data.parcel.parcelId}</td></tr>
                  <tr><th>Deal ID</th><td>{data.parcel.dealId}</td></tr>
                  <tr><th>Entity</th><td>{data.parcel.entity}</td></tr>
                  <tr><th>Commodity</th><td>{data.parcel.commodity}</td></tr>
                  <tr><th>Counterparty</th><td>{data.parcel.counterparty}</td></tr>
                  <tr><th>Document</th><td><span className="code">{data.parcel.documentNumber}</span></td></tr>
                  <tr><th>Dispatch Ref</th><td><span className="code">{data.parcel.dispatchRef}</span></td></tr>
                  <tr><th>Truck</th><td>{data.parcel.truckReg}</td></tr>
                  <tr><th>Finance State</th><td>{data.parcel.financeState}</td></tr>
                  <tr><th>Accounting Export</th><td>{data.parcel.accountingExportState}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>Proof checks</h3>
              <div className="kpis">
                <div className="kpi"><div className="label">Golden path</div><div className="value">{data.proof.goldenPathPassed ? "PASS" : "FAIL"}</div></div>
                <div className="kpi"><div className="label">Active blockers</div><div className="value">{data.proof.activeBlockers}</div></div>
                <div className="kpi"><div className="label">Audit events</div><div className="value">{data.proof.auditEventsCaptured}</div></div>
                <div className="kpi"><div className="label">Accounting export</div><div className="value">{data.proof.accountingExportPrepared ? "READY" : "NO"}</div></div>
              </div>

              <h4 style={{ marginTop: 22 }}>Linked documents</h4>
              <table>
                <thead>
                  <tr><th>Type</th><th>Number</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.documents.map((doc) => (
                    <tr key={doc.number}>
                      <td>{doc.type}</td>
                      <td><span className="code">{doc.number}</span></td>
                      <td>{doc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Execution timeline</h3>
            <div className="step-list">
              {data.timeline.map((step) => (
                <div className="step" key={step.step}>
                  <div className="step-top">
                    <div>
                      <strong>Step {step.step}: {step.title}</strong>
                      <div className="muted" style={{ marginTop: 6 }}>
                        State: <span className="code">{step.state}</span> • Event: <span className="code">{step.eventRef}</span>
                      </div>
                    </div>
                    <span className="badge badge-done">Completed</span>
                  </div>
                  <ul className="clean">
                    {step.evidence.map((ev) => <li key={ev}>{ev}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Finance outcome</h3>
              <table>
                <tbody>
                  <tr><th>Planned tons</th><td>{data.parcel.plannedTons}</td></tr>
                  <tr><th>Weighbridge tons</th><td>{data.parcel.weighbridgeTons}</td></tr>
                  <tr><th>Delivered tons</th><td>{data.parcel.deliveredTons}</td></tr>
                  <tr><th>Accepted tons</th><td>{data.parcel.acceptedTons}</td></tr>
                  <tr><th>Gross value (ZAR)</th><td>{data.parcel.grossValueZAR.toLocaleString()}</td></tr>
                  <tr><th>Payable-ready (ZAR)</th><td>{data.parcel.payableReadyZAR.toLocaleString()}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>What this proves next</h3>
              <ul className="clean">
                <li>The OS can be implemented around one real parcel lifecycle, not only around abstract module design.</li>
                <li>Document control, dispatch control, onsite workflow, reconciliation, and finance gating can be shown as one chain.</li>
                <li>This baseline is ready to extend into exception-path testing next.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
          }
