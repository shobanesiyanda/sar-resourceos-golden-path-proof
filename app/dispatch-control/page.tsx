    import Header from "../../components/Header";
import { getDispatchControlData } from "../../lib/dispatchControl";

export default function DispatchControlPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getDispatchControlData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = ["All", "Released", "In transit", "Delivered", "Held"];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "Released"
      ? data.items.filter((item) => item.dispatchState === "released")
      : activeFilter === "In transit"
      ? data.items.filter((item) => item.movementState === "in_transit")
      : activeFilter === "Delivered"
      ? data.items.filter((item) => item.deliveryState === "received")
      : activeFilter === "Held"
      ? data.items.filter((item) => item.dispatchState === "held")
      : data.items;

  function badgeClass(value: string) {
    if (
      value === "held" ||
      value === "missing_release_doc" ||
      value === "not_released"
    ) {
      return "badge badge-blocked";
    }
    if (
      value === "queued" ||
      value === "awaiting_release" ||
      value === "pending" ||
      value === "not_started"
    ) {
      return "badge badge-pending";
    }
    if (
      value === "released" ||
      value === "verified" ||
      value === "in_transit" ||
      value === "delivered" ||
      value === "received" ||
      value === "at_source_exit"
    ) {
      return "badge badge-approval";
    }
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visibleReleased = filteredItems.filter((item) => item.dispatchState === "released").length;
  const visibleInTransit = filteredItems.filter((item) => item.movementState === "in_transit").length;
  const visibleDelivered = filteredItems.filter((item) => item.deliveryState === "received").length;
  const visibleHeld = filteredItems.filter((item) => item.dispatchState === "held").length;

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Dispatch control dashboard</h2>
              <p className="muted">
                This dashboard shows dispatch release status, movement progress, delivery state,
                and dispatch blockers before reconciliation and finance handoff.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible loads</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">Released</div>
              <div className="value">{visibleReleased}</div>
            </div>
            <div className="kpi">
              <div className="label">In transit</div>
              <div className="value">{visibleInTransit}</div>
            </div>
            <div className="kpi">
              <div className="label">Delivered / held</div>
              <div className="value">{visibleDelivered + visibleHeld}</div>
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
                    ? "/dispatch-control"
                    : `/dispatch-control?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Dispatch overview</h3>
            <p className="muted">
              Total seeded loads: {summary.totalLoads} • Released: {summary.released} • In transit:{" "}
              {summary.inTransit} • Delivered: {summary.delivered} • Held: {summary.held}
            </p>

            {filteredItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="muted">No dispatch records match the selected filter.</p>
              </div>
            ) : (
              <>
                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parcel</th>
                        <th>Dispatch</th>
                        <th>Truck</th>
                        <th>Dispatch state</th>
                        <th>Movement</th>
                        <th>Delivery</th>
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
                          <td>{item.truckReg}</td>
                          <td>
                            <span className={badgeClass(item.dispatchState)}>{item.dispatchState}</span>
                          </td>
                          <td>
                            <span className={badgeClass(item.movementState)}>{item.movementState}</span>
                          </td>
                          <td>
                            <span className={badgeClass(item.deliveryState)}>{item.deliveryState}</span>
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
                        <strong>Truck:</strong> {item.truckReg}
                      </div>
                      <div className="row">
                        <strong>Dispatch:</strong>{" "}
                        <span className={badgeClass(item.dispatchState)}>{item.dispatchState}</span>
                      </div>
                      <div className="row">
                        <strong>Movement:</strong>{" "}
                        <span className={badgeClass(item.movementState)}>{item.movementState}</span>
                      </div>
                      <div className="row">
                        <strong>Delivery:</strong>{" "}
                        <span className={badgeClass(item.deliveryState)}>{item.deliveryState}</span>
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
            <h3>Dispatch action queue</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No dispatch action items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
                  <div className="step" key={item.id}>
                    <div className="step-top">
                      <div>
                        <strong>{item.dispatchRef}</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          Truck: {item.truckReg} • Driver: {item.driver}
                        </div>
                      </div>
                      <span className={badgeClass(item.dispatchState)}>{item.dispatchState}</span>
                    </div>

                    <ul className="clean">
                      <li>
                        <strong>Parcel:</strong> {item.parcelId}
                      </li>
                      <li>
                        <strong>Origin:</strong> {item.origin}
                      </li>
                      <li>
                        <strong>Destination:</strong> {item.destination}
                      </li>
                      <li>
                        <strong>Document state:</strong> {item.documentState}
                      </li>
                      <li>
                        <strong>Movement state:</strong> {item.movementState}
                      </li>
                      <li>
                        <strong>Delivery state:</strong> {item.deliveryState}
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
                      <a className="btn" href="/exceptions">
                        View Exceptions
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
