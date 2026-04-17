import Header from "../../components/Header";
import { getOpportunityIntakeData } from "../../lib/opportunityIntake";

export default function OpportunityIntakePage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getOpportunityIntakeData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = ["All", "New", "Screening", "Qualified", "Rejected"];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "New"
      ? data.items.filter((item) => item.qualificationState === "new")
      : activeFilter === "Screening"
      ? data.items.filter((item) => item.qualificationState === "screening")
      : activeFilter === "Qualified"
      ? data.items.filter((item) => item.qualificationState === "qualified")
      : activeFilter === "Rejected"
      ? data.items.filter((item) => item.qualificationState === "rejected")
      : data.items;

  function badgeClass(value: string) {
    if (value === "rejected") return "badge badge-blocked";
    if (value === "screening") return "badge badge-pending";
    if (value === "qualified") return "badge badge-approval";
    if (value === "new") return "badge";
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visibleNew = filteredItems.filter((item) => item.qualificationState === "new").length;
  const visibleScreening = filteredItems.filter((item) => item.qualificationState === "screening").length;
  const visibleQualified = filteredItems.filter((item) => item.qualificationState === "qualified").length;
  const visibleRejected = filteredItems.filter((item) => item.qualificationState === "rejected").length;

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Opportunity intake dashboard</h2>
              <p className="muted">
                This dashboard captures early-stage opportunities before they move into
                execution readiness. It tracks source type, indicative tons, initial qualification,
                and the next action required to progress a deal.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible opportunities</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">New</div>
              <div className="value">{visibleNew}</div>
            </div>
            <div className="kpi">
              <div className="label">Screening</div>
              <div className="value">{visibleScreening}</div>
            </div>
            <div className="kpi">
              <div className="label">Qualified / rejected</div>
              <div className="value">{visibleQualified + visibleRejected}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 18,
              marginBottom: 6
            }}
          >
            {filters.map((filter) => (
              <a
                key={filter}
                href={
                  filter === "All"
                    ? "/opportunity-intake"
                    : `/opportunity-intake?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Opportunity overview</h3>
            <p className="muted">
              Total seeded opportunities: {summary.totalOpportunities} • New: {summary.new} •
              Screening: {summary.screening} • Qualified: {summary.qualified} • Rejected: {summary.rejected}
            </p>

            {filteredItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="muted">No opportunity-intake records match the selected filter.</p>
              </div>
            ) : (
              <>
                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Opportunity</th>
                        <th>Commodity</th>
                        <th>Counterparty</th>
                        <th>Tons</th>
                        <th>Qualification</th>
                        <th>Priority</th>
                        <th>Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.opportunityName}</td>
                          <td>{item.commodity}</td>
                          <td>{item.counterparty}</td>
                          <td>{item.indicativeTons}</td>
                          <td>
                            <span className={badgeClass(item.qualificationState)}>
                              {item.qualificationState}
                            </span>
                          </td>
                          <td>{item.priority}</td>
                          <td>
                            <a className="btn" href="/execution-readiness">
                              Open Release Gate
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
                      <strong>{item.opportunityName}</strong>
                      <div className="row">
                        <strong>Commodity:</strong> {item.commodity}
                      </div>
                      <div className="row">
                        <strong>Source:</strong> {item.sourceType}
                      </div>
                      <div className="row">
                        <strong>Counterparty:</strong> {item.counterparty}
                      </div>
                      <div className="row">
                        <strong>Tons:</strong> {item.indicativeTons}
                      </div>
                      <div className="row">
                        <strong>Qualification:</strong>{" "}
                        <span className={badgeClass(item.qualificationState)}>
                          {item.qualificationState}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                        <a className="btn" href="/execution-readiness">
                          Open Release Gate
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Opportunity action queue</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No opportunity action items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
                  <div className="step" key={item.id}>
                    <div className="step-top">
                      <div>
                        <strong>{item.opportunityName}</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {item.commodity} • {item.location} • {item.counterparty}
                        </div>
                      </div>
                      <span className={badgeClass(item.qualificationState)}>
                        {item.qualificationState}
                      </span>
                    </div>

                    <ul className="clean">
                      <li>
                        <strong>Source type:</strong> {item.sourceType}
                      </li>
                      <li>
                        <strong>Indicative tons:</strong> {item.indicativeTons}
                      </li>
                      <li>
                        <strong>Indicative grade:</strong> {item.indicativeGrade}
                      </li>
                      <li>
                        <strong>Commercial state:</strong> {item.commercialState}
                      </li>
                      <li>
                        <strong>Priority:</strong> {item.priority}
                      </li>
                      <li>
                        <strong>Blocker:</strong> {item.blocker}
                      </li>
                      <li>
                        <strong>Next action:</strong> {item.nextAction}
                      </li>
                    </ul>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                      <a className="btn" href="/execution-readiness">
                        Open Execution Readiness
                      </a>
                      <a className="btn" href="/approval-queue">
                        Open Approval Queue
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
