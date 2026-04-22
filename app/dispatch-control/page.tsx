import ExecutiveShell from "../../components/ExecutiveShell";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import { getExceptions } from "../../lib/exceptions";

type SearchParams = {
  parcelId?: string;
};

type DispatchLoad = {
  id: string;
  truckRef: string;
  source: string;
  destination: string;
  tonnage: string;
  releaseState: string;
  movementState: string;
  deliveryState: string;
  note: string;
};

function chipClass(value?: string) {
  const v = String(value || "").toLowerCase();

  if (
    v.includes("approved") ||
    v.includes("released") ||
    v.includes("dispatched") ||
    v.includes("in transit") ||
    v.includes("delivered") ||
    v.includes("complete")
  ) {
    return "bb-chip-blue";
  }

  if (
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("awaiting") ||
    v.includes("hold")
  ) {
    return "bb-chip-amber";
  }

  if (
    v.includes("blocked") ||
    v.includes("failed") ||
    v.includes("exception") ||
    v.includes("stopped")
  ) {
    return "bb-chip-red";
  }

  return "bb-chip-gold";
}

function buildDispatchLoads(parcel: any): DispatchLoad[] {
  const sourceLoads: any[] =
    (parcel?.dispatchLoads as any[]) ||
    (parcel?.loads as any[]) ||
    (parcel?.trucks as any[]) ||
    [];

  if (Array.isArray(sourceLoads) && sourceLoads.length > 0) {
    return sourceLoads.map((item: any, index: number) => ({
      id: String(item?.id || `LD-${index + 1}`),
      truckRef: String(
        item?.truckRef ||
          item?.truckId ||
          item?.vehicleRef ||
          item?.registration ||
          `Truck ${index + 1}`
      ),
      source: String(item?.source || item?.origin || "Source yard"),
      destination: String(
        item?.destination || item?.dest || item?.deliveryPoint || "Buyer route"
      ),
      tonnage: String(item?.tonnage || item?.tons || item?.weight || "0"),
      releaseState: String(
        item?.releaseState || item?.releaseStatus || item?.gateState || "pending review"
      ),
      movementState: String(
        item?.movementState || item?.movementStatus || "pending movement"
      ),
      deliveryState: String(
        item?.deliveryState || item?.deliveryStatus || "awaiting delivery"
      ),
      note: String(
        item?.note || item?.comment || item?.detail || "No additional note"
      ),
    }));
  }

  return [
    {
      id: "LD-001",
      truckRef: "NWX-001",
      source: "North Yard",
      destination: "Buyer route",
      tonnage: "6.8",
      releaseState: "released",
      movementState: "in transit",
      deliveryState: "awaiting weighbridge",
      note: "Released and moving to destination weighbridge.",
    },
    {
      id: "LD-002",
      truckRef: "NWX-002",
      source: "North Yard",
      destination: "Buyer route",
      tonnage: "6.7",
      releaseState: "released",
      movementState: "in transit",
      deliveryState: "awaiting unload",
      note: "Movement active and delivery confirmation pending.",
    },
    {
      id: "LD-003",
      truckRef: "NWX-003",
      source: "North Yard",
      destination: "Buyer route",
      tonnage: "6.9",
      releaseState: "pending review",
      movementState: "not started",
      deliveryState: "not started",
      note: "Pending final dispatch approval before release.",
    },
    {
      id: "LD-004",
      truckRef: "NWX-004",
      source: "North Yard",
      destination: "Buyer route",
      tonnage: "6.6",
      releaseState: "blocked",
      movementState: "held",
      deliveryState: "held",
      note: "Finance-linked exception still preventing release.",
    },
    {
      id: "LD-005",
      truckRef: "NWX-005",
      source: "North Yard",
      destination: "Buyer route",
      tonnage: "6.9",
      releaseState: "released",
      movementState: "delivered",
      deliveryState: "delivered",
      note: "Load delivered and awaiting reconciliation sign-off.",
    },
  ];
}

export default function DispatchControlPage({
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

  const loads = buildDispatchLoads(parcel);

  const releasedCount = loads.filter((item) =>
    ["released", "approved"].includes(String(item.releaseState).toLowerCase())
  ).length;

  const movingCount = loads.filter((item) =>
    ["in transit", "moving", "delivered"].includes(
      String(item.movementState).toLowerCase()
    )
  ).length;

  const deliveredCount = loads.filter((item) =>
    ["delivered", "complete"].includes(String(item.deliveryState).toLowerCase())
  ).length;

  const heldCount = loads.filter((item) =>
    ["blocked", "held", "pending review"].includes(
      String(item.releaseState).toLowerCase()
    )
  ).length;

  const relevantExceptions: any[] = (exceptionsData?.exceptions || []).filter(
    (item: any) =>
      !item?.parcelId || String(item.parcelId) === String(parcelId)
  );

  const financeBlocked = relevantExceptions.filter(
    (item: any) => String(item?.financeAllowed || "").toLowerCase() === "no"
  ).length;

  const leadLoad: DispatchLoad =
    loads.find((item) =>
      ["blocked", "pending review", "held"].includes(
        String(item.releaseState).toLowerCase()
      )
    ) || loads[0];

  const nextAction =
    ["blocked", "held"].includes(String(leadLoad?.releaseState).toLowerCase())
      ? `Resolve ${leadLoad.truckRef} release blocker before movement`
      : "Continue movement and delivery confirmation";

  return (
    <ExecutiveShell
      activeHref="/dispatch-control"
      title="Dispatch movement and delivery control."
      subtitle="Institutional dispatch dashboard for load release, movement tracking, delivery state, and downstream parcel control."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Dispatch command layer</div>
          <div className="bb-command-title">Dispatch control / movement desk</div>
          <p className="bb-command-text">
            This dashboard controls truck release, movement progression, and
            delivery state across the parcel dispatch chain before reconciliation
            and finance handoff.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Dispatch active</span>
            <span className="bb-chip bb-chip-blue">Movement tracked</span>
            <span className="bb-chip bb-chip-amber">Load-by-load</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{parcelId}</div>
            <div className="bb-side-sub">{loads.length} loads in dispatch set</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead load</div>
            <div className="bb-side-state">{leadLoad?.truckRef || "No load"}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Dispatch state</div>
          <div className="bb-user-name">
            {heldCount > 0 ? "Review" : movingCount > 0 ? "Moving" : "Ready"}
          </div>
          <div className="bb-user-org">Movement control</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Released</div>
          <div className="bb-kpi-value">{releasedCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">In movement</div>
          <div className="bb-kpi-value">{movingCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Delivered</div>
          <div className="bb-kpi-value">{deliveredCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Held / finance blocked</div>
          <div className="bb-kpi-value">
            {heldCount} / {financeBlocked}
          </div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Dispatch overview</div>
              <div className="bb-panel-subtitle">
                Load release, movement state, and delivery progression by truck
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">{loads.length} loads</span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Tons</th>
                  <th>Release</th>
                  <th>Movement</th>
                  <th>Delivery</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loads.map((item) => (
                  <tr key={item.id}>
                    <td>{item.truckRef}</td>
                    <td>{item.source}</td>
                    <td>{item.destination}</td>
                    <td>{item.tonnage}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.releaseState)}`}>
                        {item.releaseState}
                      </span>
                    </td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.movementState)}`}>
                        {item.movementState}
                      </span>
                    </td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.deliveryState)}`}>
                        {item.deliveryState}
                      </span>
                    </td>
                    <td>
                      <a href="/reconciliation" className="bb-table-action">
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
                <div className="bb-panel-title">Lead dispatch issue</div>
                <div className="bb-panel-subtitle">
                  Active movement blocker or next dispatch decision
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadLoad?.releaseState)}`}>
                {leadLoad?.releaseState || "pending review"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Parcel</span>
                <strong>{parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Truck</span>
                <strong>{leadLoad?.truckRef || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Source</span>
                <strong>{leadLoad?.source || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Destination</span>
                <strong>{leadLoad?.destination || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Tonnage</span>
                <strong>{leadLoad?.tonnage || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Release state</span>
                <strong>{leadLoad?.releaseState || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Movement state</span>
                <strong>{leadLoad?.movementState || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Delivery state</span>
                <strong>{leadLoad?.deliveryState || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Exceptions linked</span>
                <strong>{relevantExceptions.length}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance blocked flags</span>
                <strong>{financeBlocked}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>{nextAction}</strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Dispatch notes</div>
                <div className="bb-panel-subtitle">
                  Movement interpretation and control guidance
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Loads should only release where execution readiness, approval,
                  and finance conditions have cleared.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  In-transit loads should remain visible until destination
                  confirmation and delivery evidence are captured.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Held or blocked loads should stop movement escalation until the
                  controlling issue is resolved.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Delivered loads should transition into reconciliation rather
                  than remain open in dispatch control.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
      }
