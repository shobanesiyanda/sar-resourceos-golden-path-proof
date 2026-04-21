export default function Header() {
  return (
    <header>
      <div className="container nav">
        <div className="brand">
          <span>SAR ResourceOS Golden Path Proof</span>
          <small>One full parcel from document to finance handoff</small>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn" href="/">
            Overview
          </a>
          <a className="btn" href="/opportunity-intake">
            Opportunity Intake
          </a>
          <a className="btn" href="/route-economics">
            Route Economics
          </a>
          <a className="btn" href="/execution-readiness">
            Execution Readiness
          </a>
          <a className="btn btn-primary" href="/golden-path">
            Open Proof
          </a>
          <a className="btn" href="/dispatch-control">
            Dispatch Control
          </a>
          <a className="btn" href="/reconciliation">
            Reconciliation
          </a>
          <a className="btn" href="/exceptions">
            Open Exceptions
          </a>
          <a className="btn" href="/approval-queue">
            Approval Queue
          </a>
          <a className="btn" href="/finance-handoff">
            Finance Handoff
          </a>
        </div>
      </div>
    </header>
  );
}
