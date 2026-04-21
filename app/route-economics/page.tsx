import Header from "../../components/Header";
import { getRouteEconomicsData } from "../../lib/routeEconomics";

export default function RouteEconomicsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const data = getRouteEconomicsData();
  const summary = data.summary;
  const activeFilter = searchParams?.filter || "All";

  const filters = ["All", "Pass", "Caution", "Fail", "FOB", "FOT"];

  const filteredItems =
    activeFilter === "All"
      ? data.items
      : activeFilter === "Pass"
      ? data.items.filter((item) => item.routeState === "pass")
      : activeFilter === "Caution"
      ? data.items.filter((item) => item.routeState === "caution")
      : activeFilter === "Fail"
      ? data.items.filter((item) => item.routeState === "fail")
      : activeFilter === "FOB"
      ? data.items.filter((item) => item.saleBasis === "FOB")
      : activeFilter === "FOT"
      ? data.items.filter((item) => item.saleBasis === "FOT")
      : data.items;

  function badgeClass(value: string) {
    if (value === "fail" || value === "outside_target") return "badge badge-blocked";
    if (value === "caution" || value === "near_limit") return "badge badge-pending";
    if (value === "pass" || value === "within_target") return "badge badge-approval";
    return "badge";
  }

  const visibleTotal = filteredItems.length;
  const visiblePass = filteredItems.filter((item) => item.routeState === "pass").length;
  const visibleCaution = filteredItems.filter((item) => item.routeState === "caution").length;
  const visibleFail = filteredItems.filter((item) => item.routeState === "fail").length;
  const visibleAvgMargin =
    filteredItems.length === 0
      ? 0
      : filteredItems.reduce((sum, item) => sum + item.grossMarginPct, 0) / filteredItems.length;

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Route economics / pricing engine</h2>
              <p className="muted">
                This dashboard back-solves route economics from the sell-side price and shows
                whether feedstock, transport, tolling, and direct costs still clear the target margin.
              </p>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Visible routes</div>
              <div className="value">{visibleTotal}</div>
            </div>
            <div className="kpi">
              <div className="label">Pass</div>
              <div className="value">{visiblePass}</div>
            </div>
            <div className="kpi">
              <div className="label">Caution</div>
              <div className="value">{visibleCaution}</div>
            </div>
            <div className="kpi">
              <div className="label">Fail / avg margin</div>
              <div className="value">{visibleFail} / {visibleAvgMargin.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, marginBottom: 6 }}>
            {filters.map((filter) => (
              <a
                key={filter}
                href={
                  filter === "All"
                    ? "/route-economics"
                    : `/route-economics?filter=${encodeURIComponent(filter)}`
                }
                className={filter === activeFilter ? "badge badge-approval" : "badge"}
              >
                {filter}
              </a>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Route pricing overview</h3>
            <p className="muted">
              Total seeded routes: {summary.totalRoutes} • Pass: {summary.pass} • Caution: {summary.caution} •
              Fail: {summary.fail} • Average margin: {summary.averageMarginPct}%
            </p>

            {filteredItems.length === 0 ? (
              <p className="muted" style={{ marginTop: 16 }}>No route-economics records match the selected filter.</p>
            ) : (
              <>
                <div className="desktop-exception-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Route</th>
                        <th>Basis</th>
                        <th>Sell/t</th>
                        <th>Margin</th>
                        <th>State</th>
                        <th>Signal</th>
                        <th>Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.routeName}</td>
                          <td>{item.saleBasis}</td>
                          <td>R {item.sellPricePerTon.toLocaleString()}</td>
                          <td>{item.grossMarginPct}%</td>
                          <td><span className={badgeClass(item.routeState)}>{item.routeState}</span></td>
                          <td><span className={badgeClass(item.pricingSignal)}>{item.pricingSignal}</span></td>
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
                      <strong>{item.routeName}</strong>
                      <div className="row"><strong>Parcel:</strong> <span className="code">{item.parcelId}</span></div>
                      <div className="row"><strong>Basis:</strong> {item.saleBasis}</div>
                      <div className="row"><strong>Sell/t:</strong> R {item.sellPricePerTon.toLocaleString()}</div>
                      <div className="row"><strong>Margin:</strong> {item.grossMarginPct}%</div>
                      <div className="row">
                        <strong>State:</strong> <span className={badgeClass(item.routeState)}>{item.routeState}</span>
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
            <h3>Cost stack and target guide</h3>

            {filteredItems.length === 0 ? (
              <p className="muted">No route pricing items match the selected filter.</p>
            ) : (
              <div className="step-list">
                {filteredItems.map((item) => (
                  <div className="step" key={item.id}>
                    <div className="step-top">
                      <div>
                        <strong>{item.routeName}</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          Parcel: <span className="code">{item.parcelId}</span> • Basis: {item.saleBasis}
                        </div>
                      </div>
                      <span className={badgeClass(item.routeState)}>{item.routeState}</span>
                    </div>

                    <ul className="clean">
                      <li><strong>Sell price per ton:</strong> R {item.sellPricePerTon.toLocaleString()}</li>
                      <li><strong>Feedstock per ton:</strong> R {item.feedstockPerTon.toLocaleString()}</li>
                      <li><strong>Transport per ton:</strong> R {item.transportPerTon.toLocaleString()}</li>
                      <li><strong>Tolling per ton:</strong> R {item.tollingPerTon.toLocaleString()}</li>
                      <li><strong>Other direct per ton:</strong> R {item.otherDirectPerTon.toLocaleString()}</li>
                      <li><strong>Recovery %:</strong> {item.recoveryPct}%</li>
                      <li><strong>Yield %:</strong> {item.yieldPct}%</li>
                      <li><strong>Target margin %:</strong> {item.targetMarginPct}%</li>
                      <li><strong>Gross margin %:</strong> {item.grossMarginPct}%</li>
                      <li><strong>Max feedstock buy price:</strong> R {item.maxFeedstockBuyPrice.toLocaleString()}</li>
                      <li><strong>Max transport price:</strong> R {item.maxTransportPrice.toLocaleString()}</li>
                      <li><strong>Max tolling price:</strong> R {item.maxTollingPrice.toLocaleString()}</li>
                      <li><strong>Blocker:</strong> {item.blocker}</li>
                      <li><strong>Next action:</strong> {item.nextAction}</li>
                    </ul>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                      <a className="btn" href="/execution-readiness">
                        Open Execution Readiness
                      </a>
                      <a className="btn" href={`/golden-path?parcelId=${encodeURIComponent(item.parcelId)}`}>
                        View Parcel
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
