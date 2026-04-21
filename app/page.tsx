// force latest deploy
// opportunity intake homepage trigger
import Header from "../components/Header";
import { getGoldenPathParcel } from "../lib/goldenPath";
import { getExceptions } from "../lib/exceptions";

export default function HomePage() {
  const data = getGoldenPathParcel();
  const exceptions = getExceptions();

  const totalExceptions = exceptions.exceptions.length;
  const blocked = exceptions.exceptions.filter((x) => x.status === "blocked").length;
  const pending = exceptions.exceptions.filter((x) => x.status === "pending review").length;
  const held = exceptions.exceptions.filter((x) => x.status === "held").length;
  const financeBlocked = exceptions.exceptions.filter((x) => x.financeAllowed === "No").length;

  return (
    <>
      <Header />

      <section className="hero">
        <div className="container">
          <div className="eyebrow">SAR ResourceOS</div>
          <h1>Transaction control from opportunity to finance handoff.</h1>
          <p>
            This live proof environment shows opportunity intake, route economics,
            execution readiness, controlled parcel execution, dispatch control,
            reconciliation, exception handling, approval gating, and finance handoff
            readiness across one connected prototype.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a
              className="btn"
              href="/opportunity-intake"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Opportunity Intake
            </a>
            <a
              className="btn"
              href="/route-economics"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Route Economics
            </a>
            <a
              className="btn"
              href="/execution-readiness"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Execution Readiness
            </a>
            <a className="btn btn-primary" href="/golden-path">
              Open Golden Path
            </a>
            <a
              className="btn"
              href="/dispatch-control"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Dispatch Control
            </a>
            <a
              className="btn"
              href="/reconciliation"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Reconciliation
            </a>
            <a
              className="btn"
              href="/exceptions"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Exceptions
            </a>
            <a
              className="btn"
              href="/approval-queue"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Approval Queue
            </a>
            <a
              className="btn"
              href="/finance-handoff"
              style={{ background: "white", color: "#111827", borderColor: "#e5e7eb" }}
            >
              Open Finance Handoff
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Control overview</h2>
              <p className="muted">
                This overview summarizes the current proof environment across opportunity intake,
                route economics, execution readiness, parcel execution, dispatch control,
                reconciliation, exceptions, approval gating, and finance-readiness controls.
              </p>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Opportunity intake</h3>
              <p className="muted">
                The opportunity-intake module captures early-stage opportunities before they move
                into route pricing, execution readiness, and live parcel control.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/opportunity-intake">
                  View Opportunity Intake
                </a>
              </div>
            </div>

            <div className="card">
              <h3>Route economics / pricing engine</h3>
              <p className="muted">
                The route-economics module back-solves target feedstock, transport, tolling,
                and margin viability from the market or contract sell-side price.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/route-economics">
                  View Route Economics
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Execution readiness / release gate</h3>
              <p className="muted">
                The execution-readiness module shows whether a parcel is fully cleared to move
                from upstream checks into live dispatch execution.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/execution-readiness">
                  View Execution Readiness
                </a>
              </div>
            </div>

            <div className="card">
              <h3>Golden path proof</h3>
              <p className="muted">
                The golden-path module proves one full parcel lifecycle from controlled document
                issuance through dispatch, movement, delivery, reconciliation, and finance handoff
                readiness.
              </p>

              <table>
                <tbody>
                  <tr>
                    <th>Document</th>
                    <td>
                      <span className="code">{data.parcel.documentNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Dispatch</th>
                    <td>
                      <span className="code">{data.parcel.dispatchRef}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Truck</th>
                    <td>{data.parcel.truckReg}</td>
                  </tr>
                  <tr>
                    <th>Gross value</th>
                    <td>R {data.parcel.grossValueZAR.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Payable-ready</th>
                    <td>R {data.parcel.payableReadyZAR.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn btn-primary" href="/golden-path">
                  View Parcel Proof
                </a>
              </div>
            </div>
          </div>

          <div className="kpis" style={{ marginTop: 22 }}>
            <div className="kpi">
              <div className="label">Parcel ID</div>
              <div className="value" style={{ fontSize: 18 }}>
                {data.parcel.parcelId}
              </div>
            </div>
            <div className="kpi">
              <div className="label">Accepted tons</div>
              <div className="value">{data.parcel.acceptedTons}</div>
            </div>
            <div className="kpi">
              <div className="label">Finance state</div>
              <div className="value" style={{ fontSize: 16 }}>
                {data.parcel.financeState}
              </div>
            </div>
            <div className="kpi">
              <div className="label">Accounting export</div>
              <div className="value" style={{ fontSize: 16 }}>
                {data.parcel.accountingExportState}
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Dispatch control dashboard</h3>
              <p className="muted">
                The dispatch module shows release state, movement state, delivery progress,
                dispatch blockers, and the next operational action before reconciliation.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/dispatch-control">
                  View Dispatch Control
                </a>
              </div>
            </div>

            <div className="card">
              <h3>Reconciliation dashboard</h3>
              <p className="muted">
                The reconciliation module shows source versus destination weight, accepted tons,
                variance review, blocked reconciliations, and readiness to move into finance handoff.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/reconciliation">
                  View Reconciliation
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="card">
              <h3>Exception action dashboard</h3>
              <p className="muted">
                The exception module proves how ResourceOS handles blocked, disputed, and escalated
                cases with visible ownership, next actions, finance impacts, and approval-linked
                decision routing.
              </p>

              <div
                className="kpis"
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: 14 }}
              >
                <div className="kpi">
                  <div className="label">Total exceptions</div>
                  <div className="value">{totalExceptions}</div>
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

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/exceptions">
                  View Exceptions
                </a>
              </div>
            </div>

            <div className="card">
              <h3>Approval queue dashboard</h3>
              <p className="muted">
                The approval queue module shows pending approvals, rejections, approval owners,
                and the next required decision before parcels can continue through the control chain.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                <a className="btn" href="/approval-queue">
                  View Approval Queue
                </a>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Finance handoff dashboard</h3>
            <p className="muted">
              The finance module shows which parcels are ready for release into finance,
              which are blocked, and which are pending approval before accounting export.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <a className="btn" href="/finance-handoff">
                View Finance Handoff
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
