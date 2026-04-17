import Header from "../../components/Header";
import { getReconciliationDashboardData } from "../../lib/reconciliationDashboard";

export default function ReconciliationPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getReconciliationDashboardData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = ["All", "Matched", "Pending review", "Blocked", "Ready for finance"];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "Matched"
      ? data.items.filter((item) => item.reconciliationState === "matched")
      : activeFilter === "Pending review"
      ? data.items.filter((item) => item.reconciliationState === "pending_review")
      : activeFilter === "Blocked"
      ? data.items.filter((item) => item.reconciliationState === "blocked")
      : activeFilter === "Ready for finance"
      ? data.items.filter((item) => item.financeState === "ready_for_finance")
      : data.items;

  function badgeClass(value: string) {
    if (value === "blocked" || value === "held") return "badge badge-blocked";
    if (value === "pending_review") return "badge badge-pending";
    if (value === "matched" || value === "ready_for_finance") return "badge badge-approval";
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visibleMatched = filteredItems.filter(
    (item) => item.reconciliationState === "matched"
  ).length;
  const visiblePending = filteredItems.filter(
    (item) => item.reconciliationState === "pending_review"
  ).length;
  const visibleBlocked = filteredItems.filter(
    (item) => item.reconciliationState === "blocked"
  ).length;
  const visibleReadyForFinance = filteredItems.filter(
    (item) => item.financeState === "ready_for_finance"
  ).length;

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Reconciliation dashboard</h2>
              <p className="muted">
                This dashboard shows weight comparison, accepted tons, variance, reconciliation
                status, and readiness to progress into finance handoff.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible parcels</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">Matched</div>
              <div className="value">{visibleMatched}</div>
            </div>
            <div className="kpi">
              <div className="label">Pending review</div>
              <div className="value">{visiblePending}</div>
            </div>
            <div className="kpi">
              <div className="label">Blocked / finance ready</div>
              <div className="value">{visibleBlocked + visibleReadyForFinance}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 18,
              marginBottom: 6,
            }}
          >
            {filters.map((filter) => (
              <a
                key={filter}
                href={
                  filter === "All"
                    ? "/reconciliation"
                    : `/reconciliation?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Reconciliation overview</h3>
            <p className="muted">
              Total seeded parcels: {summary.totalParcels} • Matched: {summary.matched} • Pending
              review: {summary.pendingReview} • Blocked: {summary.blocked} • Ready for finance:{" "}
              {summary.readyForFinance}
            </p>

            {filteredItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="muted">No reconciliation records match the selected filter.</p>
              </div>
            ) : (
              <>
                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parcel</th>
                        <th>Dispatch</th>
                        <th>Accepted tons</th>
                        <th>Variance</th>
                        <th>Reconciliation</th>
                        <th>Finance</th>
                        <th>Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="code">{item.parcelId}</span>
                          </td>
                          <td>
                            <span className="code">{item.dispatchRef}</span>
                          </td>
                          <td>{item.acceptedTons}</td>
                          <td>{item.varianceTons}</td>
                          <td>
                            <span className={badgeClass(item.reconciliationState)}>
                              {item.reconciliationState}
                            </span>
                          </td>
                          <td>
                            <span className={badgeClass(item.financeState)}>{item.financeState}</span>
                          </td>
                          <td>
                            <a className="btn" href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}>
                              View Parcel
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-exception-list">
                  {filteredItems.map((item) => (
                    <div className="mobile-exception-card" key={item.id}>
                      <strong>{item.dispatchRef}</strong>
                      <div className="row">
                        <strong>Parcel:</strong> <span className="code">{item.parcelId}</span>
                      </div>
                      <div className="row">
                        <strong>Accepted tons:</strong> {item.acceptedTons}
                      </div>
                      <div className="row">
                        <strong>Variance:</strong> {item.varianceTons}
                      </div>
                      <div className="row">
                        <strong>Reconciliation:</strong>{" "}
                        <span className={badgeClass(item.reconciliationState)}>
                          {item.reconciliationState}
                        </span>
                      </div>
                      <div className="row">
                        <strong>Finance:</strong>{" "}
                        <span className={badgeClass(item.financeState)}>{item.financeState}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                        <a className="btn" href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}>
                          View Parcel
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Reconciliation action queue</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No reconciliation action items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
                  <div className="step" key={item.id}>
                    <div className="step-top">
                      <div>
                        <strong>{item.parcelId}</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          Dispatch: {item.dispatchRef}
                        </div>
                      </div>
                      <span className={badgeClass(item.reconciliationState)}>
                        {item.reconciliationState}
                      </span>
                    </div>

                    <ul className="clean">
                      <li>
                        <strong>Source weight:</strong> {item.sourceWeight}
                      </li>
                      <li>
                        <strong>Destination weight:</strong> {item.destinationWeight}
                      </li>
                      <li>
                        <strong>Accepted tons:</strong> {item.acceptedTons}
                      </li>
                      <li>
                        <strong>Variance tons:</strong> {item.varianceTons}
                      </li>
                      <li>
                        <strong>Finance state:</strong> {item.financeState}
                      </li>
                      <li>
                        <strong>Blocker:</strong> {item.blocker}
                      </li>
                      <li>
                        <strong>Next action:</strong> {item.nextAction}
                      </li>
                    </ul>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                      <a className="btn" href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}>
                        View Parcel
                      </a>
                      <a className="btn" href="/dispatch-control">
                        View Dispatch
                      </a>
                      <a className="btn" href="/finance-handoff">
                        View Finance Handoff
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
    }
