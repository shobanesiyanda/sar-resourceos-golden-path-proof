import ExecutiveShell from "../../components/ExecutiveShell";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import { getExceptions } from "../../lib/exceptions";

type SearchParams = {
  parcelId?: string;
};

type ReconItem = {
  id: string;
  truckRef: string;
  sourceWeight: string;
  destinationWeight: string;
  variance: string;
  state: string;
  note: string;
};

function chipClass(value?: string) {
  const v = String(value || "").toLowerCase();

  if (
    v.includes("matched") ||
    v.includes("approved") ||
    v.includes("clear") ||
    v.includes("resolved")
  ) {
    return "bb-chip-blue";
  }

  if (
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("hold")
  ) {
    return "bb-chip-amber";
  }

  if (
    v.includes("exception") ||
    v.includes("blocked") ||
    v.includes("variance")
  ) {
    return "bb-chip-red";
  }

  return "bb-chip-gold";
}

function buildReconItems(parcel: any): ReconItem[] {
  const sourceRows: any[] =
    (parcel?.reconciliationRows as any[]) ||
    (parcel?.reconciliationItems as any[]) ||
    (parcel?.weighbridgeMatches as any[]) ||
    [];

  if (Array.isArray(sourceRows) && sourceRows.length > 0) {
    return sourceRows.map((item: any, index: number) => ({
      id: String(item?.id || `REC-${index + 1}`),
      truckRef: String(item?.truckRef || item?.truckId || `Truck ${index + 1}`),
      sourceWeight: String(item?.sourceWeight || item?.loadWeight || "0"),
      destinationWeight: String(item?.destinationWeight || item?.offloadWeight || "0"),
      variance: String(item?.variance || item?.varianceTons || "0"),
      state: String(item?.state || item?.status || "pending review"),
      note: String(item?.note || item?.comment || "No additional note"),
    }));
  }

  return [
    {
      id: "REC-001",
      truckRef: "NWX-001",
      sourceWeight: "6.8",
      destinationWeight: "6.8",
      variance: "0.0",
      state: "matched",
      note: "Source and destination weights align.",
    },
    {
      id: "REC-002",
      truckRef: "NWX-002",
      sourceWeight: "6.7",
      destinationWeight: "6.6",
      variance: "0.1",
      state: "pending review",
      note: "Minor variance under review.",
    },
    {
      id: "REC-003",
      truckRef: "NWX-003",
      sourceWeight: "6.9",
      destinationWeight: "0.0",
      variance: "6.9",
      state: "pending review",
      note: "Destination evidence not yet loaded.",
    },
    {
      id: "REC-004",
      truckRef: "NWX-004",
      sourceWeight: "6.6",
      destinationWeight: "0.0",
      variance: "6.6",
      state: "exception",
      note: "Dispatch hold prevented final destination match.",
    },
    {
      id: "REC-005",
      truckRef: "NWX-005",
      sourceWeight: "6.9",
      destinationWeight: "6.9",
      variance: "0.0",
      state: "matched",
      note: "Matched and ready for finance handoff.",
    },
  ];
}

export default function ReconciliationPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const data: any = getGoldenPathParcel();
  const exceptionsData: any = getExceptions();

  const parcel: any = data?.parcel || {};
  const parcelId = String(
    searchParams?.parcelId || parcel?.parcelId || "PAR-CHR-2026-0001"
  );

  const reconItems = buildReconItems(parcel);
  const matchedCount = reconItems.filter((item) =>
    String(item.state).toLowerCase() === "matched"
  ).length;
  const pendingCount = reconItems.filter((item) =>
    String(item.state).toLowerCase().includes("pending")
  ).length;
  const exceptionCount = reconItems.filter((item) =>
    String(item.state).toLowerCase().includes("exception")
  ).length;

  const relevantExceptions: any[] = (exceptionsData?.exceptions || []).filter(
    (item: any) =>
      !item?.parcelId || String(item.parcelId) === String(parcelId)
  );

  const leadItem =
    reconItems.find((item) =>
      ["pending review", "exception"].includes(String(item.state).toLowerCase())
    ) || reconItems[0];

  return (
    <ExecutiveShell
      activeHref="/reconciliation"
      title="Reconciliation and variance control."
      subtitle="Institutional reconciliation dashboard for weight matching, variance review, and release into finance handoff."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Reconciliation command layer</div>
          <div className="bb-command-title">Reconciliation / weighbridge match</div>
          <p className="bb-command-text">
            This dashboard compares source and destination evidence, highlights
            variances, and controls which loads are cleared into downstream finance.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Recon active</span>
            <span className="bb-chip bb-chip-blue">Match-driven</span>
            <span className="bb-chip bb-chip-amber">Variance review</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{parcelId}</div>
            <div className="bb-side-sub">{reconItems.length} loads under review</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead truck</div>
            <div className="bb-side-state">{leadItem?.truckRef || "No truck"}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Recon state</div>
          <div className="bb-user-name">
            {exceptionCount > 0 ? "Exception" : pendingCount > 0 ? "Review" : "Clear"}
          </div>
          <div className="bb-user-org">Weight control</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Matched</div>
          <div className="bb-kpi-value">{matchedCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Pending review</div>
          <div className="bb-kpi-value">{pendingCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Exceptions</div>
          <div className="bb-kpi-value">{exceptionCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Linked alerts</div>
          <div className="bb-kpi-value">{relevantExceptions.length}</div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Reconciliation overview</div>
              <div className="bb-panel-subtitle">
                Source versus destination evidence and variance state by truck
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">{reconItems.length} loads</span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Source wt</th>
                  <th>Destination wt</th>
                  <th>Variance</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {reconItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.truckRef}</td>
                    <td>{item.sourceWeight}</td>
                    <td>{item.destinationWeight}</td>
                    <td>{item.variance}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.state)}`}>
                        {item.state}
                      </span>
                    </td>
                    <td>{item.note}</td>
                    <td>
                      <a href="/finance-handoff" className="bb-table-action">
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
                <div className="bb-panel-title">Lead variance issue</div>
                <div className="bb-panel-subtitle">
                  Active mismatch or next reconciliation decision
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem?.state)}`}>
                {leadItem?.state || "pending review"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Parcel</span>
                <strong>{parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Truck</span>
                <strong>{leadItem?.truckRef || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Source weight</span>
                <strong>{leadItem?.sourceWeight || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Destination weight</span>
                <strong>{leadItem?.destinationWeight || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Variance</span>
                <strong>{leadItem?.variance || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Status</span>
                <strong>{leadItem?.state || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Linked alerts</span>
                <strong>{relevantExceptions.length}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>
                  {String(leadItem?.state).toLowerCase() === "matched"
                    ? "Proceed to finance handoff"
                    : "Resolve mismatch and capture evidence"}
                </strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Reconciliation notes</div>
                <div className="bb-panel-subtitle">
                  Weight-control interpretation and release guidance
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Matched loads should move into finance handoff without remaining
                  open in reconciliation.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Pending-review loads must retain evidence gaps and variance flags
                  until validated.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Exception loads should remain blocked from downstream settlement
                  until mismatch causes are resolved.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
}
