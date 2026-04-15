import Header from "../components/Header";
import { getGoldenPathParcel } from "../lib/goldenPath";
export default function HomePage() {
  const data = getGoldenPathParcel();

  return (
    <>
      <Header />
      <section className="hero">
        <div className="container">
          <div className="eyebrow">SAR ResourceOS</div>
          <h1>Golden-path proof for one full parcel lifecycle.</h1>
          <p>
            This baseline proves one controlled parcel from document reserve and issuance through dispatch,
            movement, delivery, reconciliation, and finance handoff readiness.
          </p>
<div style={{ display: "flex", gap: "12px" }}>
  <a className="btn btn-primary" href="/
golden-path">View full proof</a>
</div>
      </section>

      <section className="section">
        <div className="container grid grid-2">
          <div className="card">
            <h2>What this proves</h2>
            <ul className="clean">
              <li>Controlled document numbering and issuance</li>
              <li>Dispatch creation and approval</li>
              <li>Onsite movement capture through release</li>
              <li>Delivery confirmation and GRN/POD logic</li>
              <li>Reconciliation and settlement readiness</li>
              <li>Finance handoff and accounting export preparation</li>
            </ul>
          </div>
          <div className="card">
            <h2>Seeded parcel</h2>
            <p className="muted">
              <strong>{data.parcel.parcelId}</strong><br />
              {data.parcel.entity} • {data.parcel.commodity}<br />
              Dispatch: <span className="code">{data.parcel.dispatchRef}</span><br />
              Contract: <span className="code">{data.parcel.documentNumber}</span>
            </p>
            <div className="kpis">
              <div className="kpi"><div className="label">Accepted tons</div><div className="value">{data.parcel.acceptedTons}</div></div>
              <div className="kpi"><div className="label">Finance state</div><div className="value" style={{fontSize:16}}>{data.parcel.financeState}</div></div>
              <div className="kpi"><div className="label">Blockers</div><div className="value">{data.proof.activeBlockers}</div></div>
              <div className="kpi"><div className="label">Docs linked</div><div className="value">{data.proof.documentsLinked}</div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
                       }
