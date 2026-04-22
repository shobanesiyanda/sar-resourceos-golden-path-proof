import ExecutiveShell from "../../components/ExecutiveShell";
import { getRouteEconomicsData } from "../../lib/routeEconomics";

type SearchParams = {
  filter?: string;
  basis?: string;
};

export default function RouteEconomicsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const data = getRouteEconomicsData();
  const summary = data.summary;

  const activeFilter = (searchParams?.filter || "all").toLowerCase();
  const activeBasis = (searchParams?.basis || "all").toLowerCase();

  const filteredItems = data.items.filter((item: any) => {
    const filterOk =
      activeFilter === "all" ||
      item.state.toLowerCase() === activeFilter;

    const basisOk =
      activeBasis === "all" ||
      item.saleBasis.toLowerCase() === activeBasis;

    return filterOk && basisOk;
  });

  const leadItem = filteredItems[0] || data.items[0];

  function chipClass(value: string) {
    const v = value.toLowerCase();
    if (v.includes("pass") || v.includes("within")) return "bb-chip-blue";
    if (v.includes("caution") || v.includes("near")) return "bb-chip-amber";
    if (v.includes("fail") || v.includes("outside")) return "bb-chip-red";
    return "bb-chip-gold";
  }

  return (
    <ExecutiveShell
      activeHref="/route-economics"
      title="Route pricing and margin control."
      subtitle="Institutional route-economics dashboard for FOT and FOB screening, cost-stack testing, and execution-grade pricing decisions."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Pricing command layer</div>
          <div className="bb-command-title">Route economics / pricing engine</div>
          <p className="bb-command-text">
            This dashboard back-solves commercial route economics from the sell-side
            price and tests whether feedstock, transport, tolling, and direct cost
            assumptions still clear the target margin.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Pricing active</span>
            <span className="bb-chip bb-chip-blue">Target-screened</span>
            <span className="bb-chip bb-chip-amber">FOT / FOB</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead route</div>
            <div className="bb-side-value">{leadItem.routeName}</div>
            <div className="bb-side-sub">
              {leadItem.saleBasis} · Parcel {leadItem.parcelId}
            </div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead margin</div>
            <div className="bb-side-state">{leadItem.grossMarginPct}%</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Screening state</div>
          <div className="bb-user-name">{filteredItems.length}</div>
          <div className="bb-user-org">Visible routes</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Visible routes</div>
          <div className="bb-kpi-value">{filteredItems.length}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Pass</div>
          <div className="bb-kpi-value">{summary.pass}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Caution</div>
          <div className="bb-kpi-value">{summary.caution}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Fail / avg margin</div>
          <div className="bb-kpi-value">
            {summary.fail} / {summary.averageMarginPct}%
          </div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Route pricing overview</div>
              <div className="bb-panel-subtitle">
                Commercial screen by route, basis, margin state, and execution signal
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">
              {summary.totalRoutes} total routes
            </span>
          </div>

          <div className="bb-filter-row">
            <a
              href="/route-economics"
              className={`bb-filter-chip ${activeFilter === "all" ? "is-active" : ""}`}
            >
              All
            </a>
            <a
              href="/route-economics?filter=pass"
              className={`bb-filter-chip ${activeFilter === "pass" ? "is-active" : ""}`}
            >
              Pass
            </a>
            <a
              href="/route-economics?filter=caution"
              className={`bb-filter-chip ${activeFilter === "caution" ? "is-active" : ""}`}
            >
              Caution
            </a>
            <a
              href="/route-economics?filter=fail"
              className={`bb-filter-chip ${activeFilter === "fail" ? "is-active" : ""}`}
            >
              Fail
            </a>
            <a
              href="/route-economics?basis=fot"
              className={`bb-filter-chip ${activeBasis === "fot" ? "is-active" : ""}`}
            >
              FOT
            </a>
            <a
              href="/route-economics?basis=fob"
              className={`bb-filter-chip ${activeBasis === "fob" ? "is-active" : ""}`}
            >
              FOB
            </a>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Basis</th>
                  <th>Sell/t</th>
                  <th>Margin</th>
                  <th>State</th>
                  <th>Signal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.routeName}</td>
                    <td>{item.saleBasis}</td>
                    <td>R {item.sellPricePerTon.toLocaleString()}</td>
                    <td>{item.grossMarginPct}%</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.state)}`}>
                        {item.state}
                      </span>
                    </td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.signal)}`}>
                        {item.signal}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/execution-readiness?parcelId=${item.parcelId}`}
                        className="bb-table-action"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="bb-stack">
          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Lead route cost stack</div>
                <div className="bb-panel-subtitle">
                  Cost-stack guide against target pricing logic
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem.state)}`}>
                {leadItem.state}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Route</span>
                <strong>{leadItem.routeName}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Parcel</span>
                <strong>{leadItem.parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Basis</span>
                <strong>{leadItem.saleBasis}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Sell price per ton</span>
                <strong>R {leadItem.sellPricePerTon.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Feedstock per ton</span>
                <strong>R {leadItem.feedstockPerTon.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Transport per ton</span>
                <strong>R {leadItem.transportPerTon.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Tolling per ton</span>
                <strong>R {leadItem.tollingPerTon.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Other direct per ton</span>
                <strong>R {leadItem.otherDirectPerTon.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Recovery %</span>
                <strong>{leadItem.recoveryPct}%</strong>
              </div>
              <div className="bb-metric-row">
                <span>Yield %</span>
                <strong>{leadItem.yieldPct}%</strong>
              </div>
              <div className="bb-metric-row">
                <span>Target margin %</span>
                <strong>{leadItem.targetMarginPct}%</strong>
              </div>
              <div className="bb-metric-row">
                <span>Gross margin %</span>
                <strong>{leadItem.grossMarginPct}%</strong>
              </div>
              <div className="bb-metric-row">
                <span>Max feedstock buy price</span>
                <strong>R {leadItem.maxFeedstockBuyPrice.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Max transport price</span>
                <strong>R {leadItem.maxTransportPrice.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Max tolling price</span>
                <strong>R {leadItem.maxTollingPrice.toLocaleString()}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Blocker</span>
                <strong>{leadItem.blocker || "None"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>{leadItem.nextAction}</strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Pricing notes</div>
                <div className="bb-panel-subtitle">
                  Screening interpretation and execution cue
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Pass routes clear target margin and remain commercially executable.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Caution routes remain near margin limits and require tighter supplier,
                  transport, or tolling negotiation.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Fail routes breach the pricing envelope and should not proceed to
                  execution readiness without commercial correction.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
}
