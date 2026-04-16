import Header from "../../components/Header";
import { getFinanceHandoffData } from "../../lib/financeHandoff";

export default function FinanceHandoffPage() {
  const data = getFinanceHandoffData();
  const summary = data.summary;
  const items = data.items;

  function badgeClass(value: string) {
    if (value === "blocked" || value === "rejected") return "badge badge-blocked";
    if (value === "pending" || value === "pending_review") return "badge badge-pending";
    if (value === "approved" || value === "finance_handoff_ready" || value === "ready_for_export") {
      return "badge badge-approval";
    }
    return "badge";
  }

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Finance handoff dashboard</h2>
              <p className="muted">
                This dashboard shows which parcels are ready for finance release, which are blocked,
                and which are pending approval before accounting export.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Total parcels</div>
              <div className="value">{summary.totalParcels}</div>
            </div>
            <div className="kpi">
              <div className="label">Ready for finance</div>
              <div className="value">{summary.readyForFinance}</div>
            </div>
            <div className="kpi">
              <div className="label">Blocked</div>
              <div className="value">{summary.blocked}</div>
            </div>
            <div className="kpi">
              <div className="label">Ready for export</div>
              <div className="value">{summary.readyForExport}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Finance handoff overview</h3>

            <div className="desktop-exception-table">
              <table>
                <thead>
                  <tr>
                    <th>Parcel</th>
                    <th>Counterparty</th>
                    <th>Finance state</th>
                    <th>Approval</th>
                    <th>Export</th>
                    <th>Payable-ready</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="code">{item.parcelId}</span>
                      </td>
                      <td>{item.counterparty}</td>
                      <td>
                        <span className={badgeClass(item.financeState)}>{item.financeState}</span>
                      </td>
                      <td>
                        <span className={badgeClass(item.approvalState)}>{item.approvalState}</span>
                      </td>
                      <td>
                        <span className={badgeClass(item.exportState)}>{item.exportState}</span>
                      </td>
                      <td>R {item.payableReadyZAR.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-exception-list">
              {items.map((item) => (
                <div className="mobile-exception-card" key={item.id}>
                  <strong>{item.counterparty}</strong>
                  <div className="row">
                    <strong>Parcel:</strong> <span className="code">{item.parcelId}</span>
                  </div>
                  <div className="row">
                    <strong>Finance:</strong>{" "}
                    <span className={badgeClass(item.financeState)}>{item.financeState}</span>
                  </div>
                  <div className="row">
                    <strong>Approval:</strong>{" "}
                    <span className={badgeClass(item.approvalState)}>{item.approvalState}</span>
                  </div>
                  <div className="row">
                    <strong>Export:</strong>{" "}
                    <span className={badgeClass(item.exportState)}>{item.exportState}</span>
                  </div>
                  <div className="row">
                    <strong>Payable-ready:</strong> R {item.payableReadyZAR.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Action queue</h3>
            <div className="step-list">
              {items.map((item) => (
                <div className="step" key={item.id}>
                  <div className="step-top">
                    <div>
                      <strong>{item.parcelId}</strong>
                      <div className="muted" style={{ marginTop: 6 }}>
                        Counterparty: {item.counterparty}
                      </div>
                    </div>
                    <span className={badgeClass(item.financeState)}>{item.financeState}</span>
                  </div>

                  <ul className="clean">
                    <li>
                      <strong>Approval state:</strong> {item.approvalState}
                    </li>
                    <li>
                      <strong>Export state:</strong> {item.exportState}
                    </li>
                    <li>
                      <strong>Payable-ready amount:</strong> R {item.payableReadyZAR.toLocaleString()}
                    </li>
                    <li>
                      <strong>Blocker:</strong> {item.blocker}
                    </li>
                    <li>
                      <strong>Next action:</strong> {item.nextAction}
                    </li>
                  </ul>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                    <a className="btn" href="/golden-path">
                      View Parcel
                    </a>
                    <a className="btn" href="/exceptions">
                      View Exceptions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
        }
