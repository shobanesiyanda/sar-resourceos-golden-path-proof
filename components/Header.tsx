export default function Header() {
  return (
    <header>
      <div className="container nav">
        <div className="brand">
          SAR ResourceOS Golden Path Proof
          <small>One full parcel from document to finance handoff</small>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn" href="/">Overview</a>
          <a className="btn btn-primary" href="/golden-path">Open Proof</a>
        </div>
      </div>
    </header>
  );
}
