import ExecutiveShell from "../../components/ExecutiveShell";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import { getExceptions } from "../../lib/exceptions";
import {
  chipClass,
  firstMeaningful,
  normalizeFinanceState,
  s,
  yn,
} from "../../lib/dashboardLogic";

type FinanceItem = {
  id: string;
  item: string;
  state: string;
  owner: string;
  note: string;
};

function buildFinanceItems(parcel: any, rawExceptions: any[]): FinanceItem[] {
  const financeState = normalizeFinanceState(parcel?.financeState || "finance_handoff_ready");
  const exportState = normalizeFinanceState(
    parcel?.accountingExportState || "ready_for_export"
  );

  const blockedCount = (rawExceptions || []).filter(
    (item: any) =>
      yn(item?.financeAllowed) === "no" &&
      ["blocked", "held"].includes(String(item?.status || "").toLowerCase())
  ).length;

  return [
    {
      id: "FIN-001",
      item: "Reconciliation clearance",
      state: "approved",
      owner: "Operations Control",
      note: "Matched loads can move into finance preparation.",
    },
    {
      id: "FIN-002",
      item: "Finance handoff state",
      state: financeState,
      owner: "Finance Control",
      note: "Current finance handoff state for the controlled parcel.",
    },
    {
      id: "FIN-003",
      item: "Accounting export state",
      state: exportState,
      owner: "Finance Systems",
      note: "Controls downstream accounting and export preparation.",
    },
    {
      id: "FIN-004",
      item: "Finance-blocked exception review",
      state: blockedCount > 0 ? "blocked" : "approved",
      owner: "Finance Control",
      note:
        blockedCount > 0
          ? "One or more finance-sensitive exceptions are still in blocked or held state."
          : "No finance-sensitive hard-stop exceptions remain.",
    },
  ];
}

export default function FinanceHandoffPage() {
  const data: any = getGoldenPathParcel();
  const exceptionsData: any = getExceptions();

  const parcel: any = data?.parcel || {};
  const parcelId = s(parcel?.parcelId, "PAR-CHR-2026-0001");
  const rawExceptions: any[] = exceptionsData?.exceptions || [];

  const relevantExceptions = rawExceptions.filter(
    (item: any) => !item?.parcelId || s(item.parcelId) === parcelId
  );

  const financeBlocked = relevantExceptions.filter(
    (item: any) =>
      yn(item?.financeAllowed) === "no" &&
      ["blocked", "held"].includes(String(item?.status || "").toLowerCase())
  ).length;

  const financeState = normalizeFinanceState(parcel?.financeState || "finance_handoff_ready");
  const exportState = normalizeFinanceState(
    parcel?.accountingExportState || "ready_for_export"
  );

  const financeItems = buildFinanceItems(parcel, relevantExceptions);

  const readyCount = financeItems.filter((item) =>
    ["approved", "finance_handoff_ready", "ready_for_export"].includes(
      s(item.state).toLowerCase()
    )
  ).length;

  const blockedCount = financeItems.filter(
    (item) => s(item.state).toLowerCase() === "blocked"
  ).length;

  const leadItem =
    firstMeaningful(
      financeItems,
      (item) =>
        s(item.state).toLowerCase() === "blocked" ||
        s(item.state).toLowerCase() === "held" ||
        s(item.state).toLowerCase() === "pending review"
    ) || null;

  return (
    <ExecutiveShell
      activeHref="/finance-handoff"
      title="Finance handoff and export readiness."
      subtitle="Institutional finance dashboard for cleared reconciliation, blocked-finance control, and accounting/export release."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Finance command layer</div>
          <div className="bb-command-title">Finance handoff / settlement prep</div>
          <p className="bb-command-text">
            This dashboard controls the handoff from operations into finance by
            testing reconciliation clearance, exception status, and export/accounting readiness.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Finance active</span>
            <span className="bb-chip bb-chip-blue">Export-aware</span>
            <span className="bb-chip bb-chip-amber">Settlement prep</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead parcel</div>
            <div className="bb-side-value">{parcelId}</div>
            <div className="bb-side-sub">Accepted tons {parcel?.acceptedTons ?? "33.9"}</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Finance state</div>
            <div className="bb-side-state">{financeState}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Export state</div>
          <div className="bb-user-name" style={{ fontSize: 20 }}>{exportState}</div>
          <div className="bb-user-org">Downstream release</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Finance ready</div>
          <div className="bb-kpi-value">{readyCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Finance blocked</div>
          <div className="bb-kpi-value">{blockedCount}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Linked exceptions</div>
          <div className="bb-kpi-value">{relevantExceptions.length}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Hard-stop no-finance flags</div>
          <div className="bb-kpi-value">{financeBlocked}</div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Finance handoff overview</div>
              <div className="bb-panel-subtitle">
                Readiness into settlement, accounting, and export preparation
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">{financeItems.length} control items</span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Control item</th>
                  <th>State</th>
                  <th>Owner</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {financeItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.item}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.state)}`}>
                        {item.state}
                      </span>
                    </td>
                    <td>{item.owner}</td>
                    <td>{item.note}</td>
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
                <div className="bb-panel-title">Lead finance issue</div>
                <div className="bb-panel-subtitle">
                  Active finance blocker or next settlement decision
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem?.state || "clear")}`}>
                {leadItem?.state || "clear"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Parcel</span>
                <strong>{parcelId}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Finance state</span>
                <strong>{financeState}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Accounting export state</span>
                <strong>{exportState}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Lead control item</span>
                <strong>{leadItem?.item || "No active finance blocker"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Lead state</span>
                <strong>{leadItem?.state || "clear"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Hard-stop no-finance flags</span>
                <strong>{financeBlocked}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>
                  {financeBlocked > 0
                    ? "Resolve blocked or held finance-sensitive exceptions before full handoff"
                    : "Proceed to settlement and export preparation"}
                </strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Finance notes</div>
                <div className="bb-panel-subtitle">
                  Settlement and export interpretation
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Finance handoff should only open after reconciliation has cleared
                  the parcel or load set.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Hard-stop finance blockers should be counted separately from general
                  finance-sensitive pending-review items.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Accounting export state should remain visible as part of the same
                  operating chain rather than as a separate isolated finance step.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
    }
