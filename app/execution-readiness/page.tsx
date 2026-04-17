import Header from "../../components/Header";
import { getExecutionReadinessData } from "../../lib/executionReadiness";

export default function ExecutionReadinessPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getExecutionReadinessData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = [
    "All",
    "Ready to release",
    "Pending checks",
    "Blocked",
    "Funding ready",
  ];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "Ready to release"
      ? data.items.filter((item) => item.readinessState === "ready_to_release")
      : activeFilter === "Pending checks"
      ? data.items.filter((item) => item.readinessState === "pending_checks")
      : activeFilter === "Blocked"
      ? data.items.filter((item) => item.readinessState === "blocked")
      : activeFilter === "Funding ready"
      ? data.items.filter((item) => item.fundingCheck === "ready")
      : data.items;

  function badgeClass(value: string) {
    if (value === "blocked" || value === "failed" || value === "not_ready") {
      return "badge badge-blocked";
    }
    if (value === "pending_checks" || value === "pending") {
      return "badge badge-pending";
    }
    if (value === "ready_to_release" || value === "passed" || value === "ready") {
      return "badge badge-approval";
    }
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visibleReady = filteredItems.filter(
    (item) => item.readinessState === "ready_to_release"
  ).length;
  const visiblePending = filteredItems.filter(
    (item) => item.readinessState === "pending_checks"
  ).length;
  const visibleBlocked = filteredItems.filter(
    (item) => item.readinessState === "blocked"
  ).length;
  const visibleFundingReady = filteredItems.filter(
    (item) => item.fundingCheck === "ready"
  ).length;

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Execution readiness / release gate</h2>
              <p className="muted">
                This dashboard shows whether a parcel is fully ready to move from
                upstream checks into dispatch execution. It bridges commercial,
                quality, approval, funding, and document readiness into one release decision.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible parcels</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">Ready to release</div>
              <div className="value">{visibleReady}</div>
            </div>
            <div className="kpi">
              <div className="label">Pending checks</div>
              <div className="value">{visiblePending}</div>
            </div>
            <div className="kpi">
              <div className="label">Blocked / funding ready</div>
              <div className="value">{visibleBlocked + visibleFundingReady}</div>
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
                    ? "/execution-readiness"
                    : `/execution-readiness?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Execution readiness overview</h3>
            <p className="muted">
              Total seeded parcels: {summary.totalParcels} • Ready to release: {summary.readyToRelease} •
              Pending checks: {summary.pendingChecks} • Blocked: {summary.blocked} • Funding ready:{" "}
              {summary.fundingReady}
            </p>

            {filteredItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="muted">No execution-readiness records match the selected filter.</p>
              </div>
            ) : (
              <>
                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parcel</th>
                        <th>Deal</th>
                        <th>Readiness</th>
                        <th>Documents</th>
                        <th>Approval</th>
                        <th>Funding</th>
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
                            <span className="code">{item.dealId}</span>
                          </td>
                          <td>
                            <span className={badgeClass(item.readinessState)}>
                              {item.readinessState}
                            </span>
                          </td>
                          <td>
                            <span className={badgeClass(item.documentCheck)}>
                              {item.documentCheck}
                            </span>
                          </td>
                          <td>
                            <span className={badgeClass(item.approvalCheck)}>
                              {item.approvalCheck}
                            </span>
                          </td>
                          <td>
                            <span className={badgeClass(item.fundingCheck)}>
                              {item.fundingCheck}
                            </span>
                          </td>
                          <td>
                            <a
                              className="btn"
                              href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}
                            >
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
                      <strong>{item.dealId}</strong>
                      <div className="row">
                        <strong>Parcel:</strong> <span className="code">{item.parcelId}</span>
                      </div>
                      <div className="row">
                        <strong>Readiness:</strong>{" "}
                        <span className={badgeClass(item.readinessState)}>
                          {item.readinessState}
                        </span>
                      </div>
                      <div className="row">
                        <strong>Documents:</strong>{" "}
                        <span className={badgeClass(item.documentCheck)}>
                          {item.documentCheck}
                        </span>
                      </div>
                      <div className="row">
                        <strong>Approval:</strong>{" "}
                        <span className={badgeClass(item.approvalCheck)}>
                          {item.approvalCheck}
                        </span>
                      </div>
                      <div className="row">
                        <strong>Funding:</strong>{" "}
                        <span className={badgeClass(item.fundingCheck)}>
                          {item.fundingCheck}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                        <a
                          className="btn"
                          href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}
                        >
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
            <h3>Release gate action queue</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No release-gate action items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
                  <div className="step" key={item.id}>
                    <div className="step-top">
                      <div>
                        <strong>{item.parcelId}</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          Deal: {item.dealId} • Supplier: {item.supplier} • Buyer: {item.buyer}
                        </div>
                      </div>
                      <span className={badgeClass(item.readinessState)}>
                        {item.readinessState}
                      </span>
                    </div>

                    <ul className="clean">
                      <li>
                        <strong>Document check:</strong> {item.documentCheck}
                      </li>
                      <li>
                        <strong>Quality check:</strong> {item.qualityCheck}
                      </li>
                      <li>
                        <strong>Commercial check:</strong> {item.commercialCheck}
                      </li>
                      <li>
                        <strong>Approval check:</strong> {item.approvalCheck}
                      </li>
                      <li>
                        <strong>Funding check:</strong> {item.fundingCheck}
                      </li>
                      <li>
                        <strong>Blocker:</strong> {item.blocker}
                      </li>
                      <li>
                        <strong>Next action:</strong> {item.nextAction}
                      </li>
                    </ul>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                      <a
                        className="btn"
                        href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}
                      >
                        View Parcel
                      </a>
                      <a className="btn" href="/approval-queue">
                        Open Approval Queue
                      </a>
                      <a className="btn" href="/dispatch-control">
                        Open Dispatch Control
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
