import Header from "../../components/Header";
import { getApprovalQueueData } from "../../lib/approvalQueue";

export default function ApprovalQueuePage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getApprovalQueueData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = ["All", "Pending", "Approved", "Rejected", "High priority"];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "Pending"
      ? data.items.filter((item) => item.approvalState === "pending")
      : activeFilter === "Approved"
      ? data.items.filter((item) => item.approvalState === "approved")
      : activeFilter === "Rejected"
      ? data.items.filter((item) => item.approvalState === "rejected")
      : activeFilter === "High priority"
      ? data.items.filter((item) => item.priority === "High")
      : data.items;

  function badgeClass(value: string) {
    if (value === "rejected") return "badge badge-blocked";
    if (value === "pending") return "badge badge-pending";
    if (value === "approved") return "badge badge-approval";
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visiblePending = filteredItems.filter((item) => item.approvalState === "pending").length;
  const visibleApproved = filteredItems.filter((item) => item.approvalState === "approved").length;
  const visibleRejected = filteredItems.filter((item) => item.approvalState === "rejected").length;
  const visibleHighPriority = filteredItems.filter((item) => item.priority === "High").length;

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Approval queue dashboard</h2>
              <p className="muted">
                This dashboard shows approval-dependent control items across dispatch,
                reconciliation, exceptions, and finance handoff before parcels can continue
                through the operating chain.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible items</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">Pending</div>
              <div className="value">{visiblePending}</div>
            </div>
            <div className="kpi">
              <div className="label">Approved</div>
              <div className="value">{visibleApproved}</div>
            </div>
            <div className="kpi">
              <div className="label">Rejected / high priority</div>
              <div className="value">{visibleRejected + visibleHighPriority}</div>
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
                    ? "/approval-queue"
                    : `/approval-queue?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Approval overview</h3>
            <p className="muted">
              Total seeded items: {summary.totalItems} • Pending: {summary.pendingApproval} •
              Approved: {summary.approved} • Rejected: {summary.rejected} • Finance ready:{" "}
              {summary.financeReady}
            </p>

            {filteredItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="muted">No approval records match the selected filter.</p>
              </div>
            ) : (
              <>
                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parcel</th>
                        <th>Module</th>
                        <th>Request</th>
                        <th>Owner</th>
                        <th>Approval</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="code">{item.parcelId}</span>
                          </td>
                          <td>{item.module}</td>
                          <td>{item.requestType}</td>
                          <td>{item.owner}</td>
                          <td>
                            <span className={badgeClass(item.approvalState)}>{item.approvalState}</span>
                          </td>
                          <td>{item.priority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-exception-list">
                  {filteredItems.map((item) => (
                    <div className="mobile-exception-card" key={item.id}>
                      <strong>{item.requestType}</strong>
                      <div className="row">
                        <strong>Parcel:</strong> <span className="code">{item.parcelId}</span>
                      </div>
                      <div className="row">
                        <strong>Module:</strong> {item.module}
                      </div>
                      <div className="row">
                        <strong>Owner:</strong> {item.owner}
                      </div>
                      <div className="row">
                        <strong>Approval:</strong>{" "}
                        <span className={badgeClass(item.approvalState)}>{item.approvalState}</span>
                      </div>
                      <div className="row">
                        <strong>Priority:</strong> {item.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Approval action queue</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No approval action items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
                  <div className="step" key={item.id}>
                    <div className="step-top">
                      <div>
                        <strong>{item.requestType}</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          Parcel: <span className="code">{item.parcelId}</span> • Module: {item.module}
                        </div>
                      </div>
                      <span className={badgeClass(item.approvalState)}>{item.approvalState}</span>
                    </div>

                    <ul className="clean">
                      <li>
                        <strong>Owner:</strong> {item.owner}
                      </li>
                      <li>
                        <strong>Priority:</strong> {item.priority}
                      </li>
                      <li>
                        <strong>Submitted at:</strong> {item.submittedAt}
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
                      <a className="btn" href={item.linkedRoute}>
                        Open Module
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
