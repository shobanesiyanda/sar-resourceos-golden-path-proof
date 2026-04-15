import Header from "../../components/Header";
import { getExceptions } from "../../lib/exceptions";

export default function ExceptionsPage() {
  const data = getExceptions();

  return (
    <>
      <Header />
      <section className="section">
        <div className="container">
          <div className="head">
            <div>
              <h2>Exception Path Proof</h2>
              <p className="muted">
                This page shows how ResourceOS handles blocked, disputed, and escalated parcel exceptions.
              </p>
            </div>
          </div>

          <div className="card">
            <h3>Exceptions overview</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Finance Impact</th>
                </tr>
              </thead>
              <tbody>
                {data.exceptions.map((item) => (
                  <tr key={item.id}>
                    <td><span className="code">{item.id}</span></td>
                    <td>{item.type}</td>
                    <td>{item.status}</td>
                    <td>{item.stage}</td>
                    <td>{item.financeImpact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h3>Exception details</h3>
            <div className="step-list">
              {data.exceptions.map((item) => (
                <div className="step" key={item.id}>
                  <div className="step-top">
                    <div>
                      <strong>{item.type}</strong>
                      <div className="muted" style={{ marginTop: 6 }}>
                        ID: <span className="code">{item.id}</span> • Stage: <span className="code">{item.stage}</span>
                      </div>
                    </div>
                    <span className="badge">{item.status}</span>
                  </div>
                  <ul className="clean">
                    <li><strong>Reason:</strong> {item.reason}</li>
                    <li><strong>Next action:</strong> {item.nextAction}</li>
                    <li><strong>Finance impact:</strong> {item.financeImpact}</li>
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
