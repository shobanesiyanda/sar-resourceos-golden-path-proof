import Header from "../../components/Header";
import { getFinanceHandoffData } from "../../lib/financeHandoff";

export default function FinanceHandoffPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getFinanceHandoffData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = [
    "All",
    "Ready for finance",
    "Blocked",
    "Pending approval",
    "Ready for export",
  ];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "Ready for finance"
      ? data.items.filter((item) => item.financeState === "finance_handoff_ready")
      : activeFilter === "Blocked"
      ? data.items.filter((item) => item.financeState === "blocked")
      : activeFilter === "Pending approval"
      ? data.items.filter((item) => item.approvalState === "pending")
      : activeFilter === "Ready for export"
      ? data.items.filter((item) => item.exportState === "ready_for_export")
      : data.items;

  function badgeClass(value: string) {
    if (value === "blocked" || value === "rejected") return "badge badge-blocked";
    if (value === "pending" || value === "pending_review") return "badge badge-pending";
    if (
      value === "approved" ||
      value === "finance_handoff_ready" ||
      value === "ready_for_export"
    ) {
      return "badge badge-approval";
    }
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visibleReadyForFinance = filteredItems.filter(
    (item) => item.financeState === "finance_handoff_ready"
  ).length;
  const visibleBlocked = filteredItems.filter(
    (item) => item.financeState === "blocked"
  ).length;
  const visibleReadyForExport = filteredItems.filter(
    (item) => item.exportState === "ready_for_export"
  ).length;

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
              <div className="label">Visible parcels</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">Ready for finance</div>
              <div className="value">{visibleReadyForFinance}</div>
            </div>
            <div className="kpi">
              <div className="label">Blocked</div>
              <div className="value">{visibleBlocked}</div>
            </div>
            <div className="kpi">
              <div className="label">Ready for export</div>
              <div className="value">{visibleReadyForExport}</div>
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
                    ? "/finance-handoff"
                    : `/finance-handoff?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Finance handoff overview</h3>
            <p className="muted">
              Total seeded parcels: {summary.totalParcels} • Ready for finance: {summary.readyForFinance} •
              Blocked: {summary.blocked} • Pending approval: {summary.pendingApproval} • Ready for export:{" "}
              {summary.readyForExport}
            </p>

            {filteredItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="muted">No finance handoff records match the selected filter.</p>
              </div>
            ) : (
              <>
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
                      {filteredItems.map((item) => (
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
                  {filteredItems.map((item) => (
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
              </>
            )}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Action queue</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No action items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
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
            )}
          </div>
        </div>
      </section>
    </>
  );
    }
