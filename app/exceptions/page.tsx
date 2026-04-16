// force redeploy
import Header from "../../components/Header";
import { getExceptions } from "../../lib/exceptions";

export default function ExceptionsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getExceptions();
  const activeFilter = searchParams?.filter || "All";

  const filters = [
    "All",
    "Blocked",
    "Pending review",
    "Held",
    "Approval required",
  ];

  const filteredExceptions =
    activeFilter === "All"
      ? data.exceptions
      : activeFilter === "Blocked"
      ? data.exceptions.filter((x) => x.status === "blocked")
      : activeFilter === "Pending review"
      ? data.exceptions.filter((x) => x.status === "pending review")
      : activeFilter === "Held"
      ? data.exceptions.filter((x) => x.status === "held")
      : activeFilter === "Approval required"
      ? data.exceptions.filter((x) => x.approvalRequired === "Yes")
      : data.exceptions;

  const total = filteredExceptions.length;
  const blocked = filteredExceptions.filter((x) => x.status === "blocked").length;
  const pending = filteredExceptions.filter((x) => x.status === "pending review").length;
  const held = filteredExceptions.filter((x) => x.status === "held").length;
  const financeBlocked = filteredExceptions.filter((x) => x.financeAllowed === "No").length;

  const statusBadgeClass = (status: string) =>
    status === "blocked"
      ? "badge badge-blocked"
      : status === "pending review"
      ? "badge badge-pending"
      : status === "held"
      ? "badge badge-held"
      : status === "manual approval required"
      ? "badge badge-approval"
      : "badge";

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Exception Action Dashboard</h2>
              <p className="muted">
                This page shows how ResourceOS handles blocked, disputed, and escalated parcel exceptions.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible exceptions</div>
              <div className="value">{total}</div>
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, marginBottom: 6 }}>
            {filters.map((filter) => (
              <a
                key={filter}
                href={filter === "All" ? "/exceptions" : `/exceptions?filter=${encodeURIComponent(filter)}`}
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          {filteredExceptions.length === 0 ? (
            <div className="card" style={{ marginTop: 22 }}>
              <h3>No exceptions found</h3>
              <p className="muted">No exception records match the selected filter.</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginTop: 22 }}>
                <h3>Exception overview</h3>

                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Priority</th>
                        <th>Finance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExceptions.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="code">{item.id}</span>
                          </td>
                          <td>{item.type}</td>
                          <td>
                            <span className={statusBadgeClass(item.status)}>{item.status}</span>
                          </td>
                          <td>{item.owner}</td>
                          <td>{item.priority}</td>
                          <td>{item.financeAllowed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-exception-list">
                  {filteredExceptions.map((item) => (
                    <div className="mobile-exception-card" key={item.id}>
                      <strong>{item.type}</strong>
                      <div className="row">
                        <strong>ID:</strong> <span className="code">{item.id}</span>
                      </div>
                      <div className="row">
                        <strong>Status:</strong>{" "}
                        <span className={statusBadgeClass(item.status)}>{item.status}</span>
                      </div>
                      <div className="row">
                        <strong>Owner:</strong> {item.owner}
                      </div>
                      <div className="row">
                        <strong>Priority:</strong> {item.priority}
                      </div>
                      <div className="row">
                        <strong>Finance:</strong> {item.financeAllowed}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginTop: 22 }}>
                <h3>Action detail</h3>
                <div className="step-list">
                  {filteredExceptions.map((item) => (
                    <div className="step" key={item.id}>
                      <div className="step-top">
                        <div>
                          <strong>{item.type}</strong>
                          <div className="muted" style={{ marginTop: 6 }}>
                            ID: <span className="code">{item.id}</span> • Stage:{" "}
                            <span className="code">{item.stage}</span>
                          </div>
                        </div>
                        <span className={statusBadgeClass(item.status)}>{item.status}</span>
                      </div>

                      <ul className="clean">
                        <li>
                          <strong>Reason:</strong> {item.reason}
                        </li>
                        <li>
                          <strong>Owner:</strong> {item.owner}
                        </li>
                        <li>
                          <strong>Priority:</strong> {item.priority}
                        </li>
                        <li>
                          <strong>Approval required:</strong> {item.approvalRequired}
                        </li>
                        <li>
                          <strong>Finance allowed:</strong> {item.financeAllowed}
                        </li>
                        <li>
                          <strong>Finance impact:</strong> {item.financeImpact}
                        </li>
                        <li>
                          <strong>Deadline:</strong> {item.deadline}
                        </li>
                        <li>
                          <strong>Action status:</strong> {item.actionStatus}
                        </li>
                        <li>
                          <strong>Next action:</strong> {item.nextAction}
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
    }      ? data.exceptions.filter((x) => x.approvalRequired === "Yes")
      : data.exceptions;

  const statusBadgeClass = (status: string) =>
    status === "blocked"
      ? "badge badge-blocked"
      : status === "pending review"
      ? "badge badge-pending"
      : status === "held"
      ? "badge badge-held"
      : status === "manual approval required"
      ? "badge badge-approval"
      : "badge";

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Exception Action Dashboard</h2>
              <p className="muted">
                This page shows how ResourceOS handles blocked, disputed, and escalated parcel exceptions.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Total exceptions</div>
              <div className="value">{total}</div>
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, marginBottom: 6 }}>
            {filters.map((filter) => (
              <a
                key={filter}
                href={filter === "All" ? "/exceptions" : `/exceptions?filter=${encodeURIComponent(filter)}`}
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Exception overview</h3>

            <div className="desktop-exception-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Priority</th>
                    <th>Finance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExceptions.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="code">{item.id}</span>
                      </td>
                      <td>{item.type}</td>
                      <td>{item.status}</td>
                      <td>{item.owner}</td>
                      <td>{item.priority}</td>
                      <td>{item.financeAllowed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-exception-list">
              {filteredExceptions.map((item) => (
                <div className="mobile-exception-card" key={item.id}>
                  <strong>{item.type}</strong>
                  <div className="row">
                    <strong>ID:</strong> <span className="code">{item.id}</span>
                  </div>
                  <div className="row">
                    <strong>Status:</strong>{" "}
                    <span className={statusBadgeClass(item.status)}>{item.status}</span>
                  </div>
                  <div className="row">
                    <strong>Owner:</strong> {item.owner}
                  </div>
                  <div className="row">
                    <strong>Priority:</strong> {item.priority}
                  </div>
                  <div className="row">
                    <strong>Finance:</strong> {item.financeAllowed}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Action detail</h3>
            <div className="step-list">
              {filteredExceptions.map((item) => (
                <div className="step" key={item.id}>
                  <div className="step-top">
                    <div>
                      <strong>{item.type}</strong>
                      <div className="muted" style={{ marginTop: 6 }}>
                        ID: <span className="code">{item.id}</span> • Stage:{" "}
                        <span className="code">{item.stage}</span>
                      </div>
                    </div>
                    <span className={statusBadgeClass(item.status)}>{item.status}</span>
                  </div>

                  <ul className="clean">
                    <li>
                      <strong>Reason:</strong> {item.reason}
                    </li>
                    <li>
                      <strong>Owner:</strong> {item.owner}
                    </li>
                    <li>
                      <strong>Priority:</strong> {item.priority}
                    </li>
                    <li>
                      <strong>Approval required:</strong> {item.approvalRequired}
                    </li>
                    <li>
                      <strong>Finance allowed:</strong> {item.financeAllowed}
                    </li>
                    <li>
                      <strong>Finance impact:</strong> {item.financeImpact}
                    </li>
                    <li>
                      <strong>Deadline:</strong> {item.deadline}
                    </li>
                    <li>
                      <strong>Action status:</strong> {item.actionStatus}
                    </li>
                    <li>
                      <strong>Next action:</strong> {item.nextAction}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
    }
