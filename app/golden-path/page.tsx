import Header from "../../components/Header";
import { getGoldenPathParcel } from "../../lib/goldenPath";

export default function GoldenPathPage() {
  const data = getGoldenPathParcel();
  const parcel: any = data.parcel;
  const timeline: any[] = data.timeline || [];

  const parcelId = parcel.parcelId || parcel.id || "N/A";
  const dealId = parcel.dealId || "N/A";
  const entity = parcel.entityName || parcel.entity || "N/A";
  const commodity = parcel.commodity || "N/A";
  const counterparty = parcel.counterparty || "N/A";
  const documentNumber = parcel.documentNumber || parcel.documentRef || "N/A";
  const dispatchRef = parcel.dispatchRef || "N/A";
  const truckReg = parcel.truckReg || parcel.truck || "N/A";
  const financeState = parcel.financeState || "N/A";
  const accountingExportState =
    parcel.accountingExportState || parcel.accountingExport || "N/A";

  const grossTons = parcel.grossTons ?? parcel.gross ?? "N/A";
  const netTons = parcel.netTons ?? parcel.net ?? "N/A";
  const acceptedTons = parcel.acceptedTons ?? parcel.accepted ?? "N/A";

  const grossValueZAR = Number(parcel.grossValueZAR ?? parcel.grossValue ?? 0);
  const deductionsZAR = Number(parcel.deductionsZAR ?? parcel.deductions ?? 0);
  const payableReadyZAR = Number(parcel.payableReadyZAR ?? parcel.payableReady ?? 0);

  const sourceLocation = parcel.sourceLocation || parcel.source || "N/A";
  const destinationLocation = parcel.destinationLocation || parcel.destination || "N/A";
  const deliveryDate = parcel.deliveryDate || "N/A";
  const lastUpdatedAt = parcel.lastUpdatedAt || parcel.updatedAt || "N/A";

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Golden-path parcel proof</h2>
              <p className="muted">
                This page demonstrates one controlled parcel lifecycle from document
                issuance through dispatch, delivery, reconciliation, and finance handoff
                readiness.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Parcel ID</div>
              <div className="value" style={{ fontSize: 18 }}>{parcelId}</div>
            </div>
            <div className="kpi">
              <div className="label">Accepted tons</div>
              <div className="value">{acceptedTons}</div>
            </div>
            <div className="kpi">
              <div className="label">Finance state</div>
              <div className="value" style={{ fontSize: 16 }}>{financeState}</div>
            </div>
            <div className="kpi">
              <div className="label">Accounting export</div>
              <div className="value" style={{ fontSize: 16 }}>
                {accountingExportState}
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Parcel summary</h3>

              <table>
                <tbody>
                  <tr>
                    <th>Parcel ID</th>
                    <td><span className="code">{parcelId}</span></td>
                  </tr>
                  <tr>
                    <th>Deal ID</th>
                    <td><span className="code">{dealId}</span></td>
                  </tr>
                  <tr>
                    <th>Entity</th>
                    <td>{entity}</td>
                  </tr>
                  <tr>
                    <th>Commodity</th>
                    <td>{commodity}</td>
                  </tr>
                  <tr>
                    <th>Counterparty</th>
                    <td>{counterparty}</td>
                  </tr>
                  <tr>
                    <th>Document</th>
                    <td><span className="code">{documentNumber}</span></td>
                  </tr>
                  <tr>
                    <th>Dispatch ref</th>
                    <td><span className="code">{dispatchRef}</span></td>
                  </tr>
                  <tr>
                    <th>Truck</th>
                    <td>{truckReg}</td>
                  </tr>
                  <tr>
                    <th>Finance state</th>
                    <td>{financeState}</td>
                  </tr>
                  <tr>
                    <th>Accounting export</th>
                    <td>{accountingExportState}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>Commercial summary</h3>

              <table>
                <tbody>
                  <tr>
                    <th>Gross tons</th>
                    <td>{grossTons}</td>
                  </tr>
                  <tr>
                    <th>Net tons</th>
                    <td>{netTons}</td>
                  </tr>
                  <tr>
                    <th>Accepted tons</th>
                    <td>{acceptedTons}</td>
                  </tr>
                  <tr>
                    <th>Gross value</th>
                    <td>R {grossValueZAR.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Deductions</th>
                    <td>R {deductionsZAR.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Payable-ready</th>
                    <td>R {payableReadyZAR.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Source mine / yard</th>
                    <td>{sourceLocation}</td>
                  </tr>
                  <tr>
                    <th>Destination</th>
                    <td>{destinationLocation}</td>
                  </tr>
                  <tr>
                    <th>Delivery date</th>
                    <td>{deliveryDate}</td>
                  </tr>
                  <tr>
                    <th>Last control update</th>
                    <td>{lastUpdatedAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Control checkpoints</h3>

            <div className="grid grid-2" style={{ marginTop: 14 }}>
              <div className="step">
                <div className="step-top">
                  <strong>Document control</strong>
                  <span className="badge badge-approval">verified</span>
                </div>
                <ul className="clean">
                  <li>Controlled parcel identifier assigned</li>
                  <li>Commercial document issued against one parcel</li>
                  <li>Dispatch reference linked back to source document</li>
                </ul>
              </div>

              <div className="step">
                <div className="step-top">
                  <strong>Movement and delivery</strong>
                  <span className="badge badge-pending">captured</span>
                </div>
                <ul className="clean">
                  <li>Truck released against approved dispatch reference</li>
                  <li>Movement captured from source to destination</li>
                  <li>Delivery confirmation and received tons recorded</li>
                </ul>
              </div>

              <div className="step">
                <div className="step-top">
                  <strong>Reconciliation</strong>
                  <span className="badge badge-held">closed</span>
                </div>
                <ul className="clean">
                  <li>Delivered tons reconciled to accepted tons</li>
                  <li>Deductions applied to net payable position</li>
                  <li>Final payable-ready value calculated</li>
                </ul>
              </div>

              <div className="step">
                <div className="step-top">
                  <strong>Finance handoff</strong>
                  <span className="badge badge-approval">ready</span>
                </div>
                <ul className="clean">
                  <li>Finance state reflects handoff readiness</li>
                  <li>Accounting export state available for downstream posting</li>
                  <li>Parcel controls remain traceable to source and settlement state</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Parcel timeline</h3>

              {timeline.length === 0 ? (
                <p className="muted">No timeline events available.</p>
              ) : (
                <div className="step-list" style={{ marginTop: 14 }}>
                  {timeline.map((item, index) => (
                    <div className="step" key={item.id || `${item.stage || "stage"}-${index}`}>
                      <div className="step-top">
                        <div>
                          <strong>{item.stage || "Stage"}</strong>
                          <div className="muted" style={{ marginTop: 6 }}>
                            {item.timestamp || item.time || "No timestamp"}
                          </div>
                        </div>
                        <span className="badge">{item.status || "logged"}</span>
                      </div>
                      <div className="muted">
                        {item.note || item.description || "No note available."}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3>Proof notes</h3>
              <ul className="clean">
                <li>This proof uses seeded demonstration data for one parcel lifecycle.</li>
                <li>
                  Document, dispatch, delivery, reconciliation, and finance states are
                  linked in one control path.
                </li>
                <li>
                  The purpose is to show operational traceability, not a full production
                  workflow engine.
                </li>
                <li>
                  The parcel can be paired with the exceptions dashboard to demonstrate
                  non-golden-path states.
                </li>
                <li>
                  This module is intended as the baseline execution proof for broader
                  ResourceOS control screens.
                </li>
              </ul>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn btn-primary" href="/exceptions">
                  View Exception Dashboard
                </a>
                <a className="btn" href="/">
                  Back to Overview
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
            }
