import ExecutiveShell from "../../components/ExecutiveShell";
import { getExceptions } from "../../lib/exceptions";
import { getGoldenPathParcel } from "../../lib/goldenPath";
import {
  chipClass,
  exceptionToApprovalState,
  firstMeaningful,
  normalizeDecisionStatus,
  s,
  yn,
} from "../../lib/dashboardLogic";

type ApprovalItem = {
  id: string;
  subject: string;
  queue: string;
  decisionState: string;
  owner: string;
  note: string;
};

function buildApprovalItems(parcel: any, rawExceptions: any[]): ApprovalItem[] {
  const parcelId = s(parcel?.parcelId, "PAR-CHR-2026-0001");

  const seededFromExceptions = (rawExceptions || []).map((item: any, index: number) => ({
    id: s(item?.exceptionId, `APR-EX-${index + 1}`),
    subject: s(item?.title || item?.reason, `Exception item ${index + 1}`),
    queue: "Exception",
    decisionState: exceptionToApprovalState(item?.status, item?.financeAllowed),
    owner: s(item?.owner || item?.assignedTo, "Operations"),
    note:
      yn(item?.financeAllowed) === "no"
        ? `Finance-sensitive review linked to parcel ${parcelId}`
        : `Operational review linked to parcel ${parcelId}`,
  }));

  const financeSensitiveCount = seededFromExceptions.filter(
    (x) => x.note.toLowerCase().includes("finance-sensitive")
  ).length;

  return [
    {
      id: "APR-001",
      subject: `Parcel release gate for ${parcelId}`,
      queue: "Release",
      decisionState: "pending review",
      owner: "Management",
      note: "Final release decision still required before full execution.",
    },
    {
      id: "APR-002",
      subject: "Finance-sensitive exception review",
      queue: "Finance",
      decisionState: financeSensitiveCount > 0 ? "pending review" : "approved",
      owner: "Finance Control",
      note:
        financeSensitiveCount > 0
          ? "Finance-sensitive exceptions still need review."
          : "No finance-sensitive exception review remains open.",
    },
    ...seededFromExceptions,
  ].map((item) => ({
    ...item,
    decisionState: normalizeDecisionStatus(item.decisionState),
  }));
}

export default function ApprovalQueuePage() {
  const exceptionsData: any = getExceptions();
  const goldenPathData: any = getGoldenPathParcel();

  const parcel: any = goldenPathData?.parcel || {};
  const rawExceptions: any[] = exceptionsData?.exceptions || [];
  const approvalItems = buildApprovalItems(parcel, rawExceptions);

  const pending = approvalItems.filter((item) => item.decisionState === "pending review").length;
  const blocked = approvalItems.filter((item) => item.decisionState === "blocked").length;
  const held = approvalItems.filter((item) => item.decisionState === "held").length;
  const approved = approvalItems.filter((item) => item.decisionState === "approved").length;

  const leadItem =
    firstMeaningful(
      approvalItems,
      (item) =>
        item.decisionState === "blocked" ||
        item.decisionState === "held" ||
        item.decisionState === "pending review"
    ) || null;

  return (
    <ExecutiveShell
      activeHref="/approval-queue"
      title="Approval queue and decision routing."
      subtitle="Institutional approval dashboard for release decisions, exception routing, and finance-sensitive control approvals."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Approval command layer</div>
          <div className="bb-command-title">Approval queue / decision desk</div>
          <p className="bb-command-text">
            This dashboard centralizes decisions still awaiting approval across
            release control, exception handling, dispatch progression, and finance.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Approvals active</span>
            <span className="bb-chip bb-chip-blue">Decision routed</span>
            <span className="bb-chip bb-chip-amber">Control queue</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead approval</div>
            <div className="bb-side-value">{leadItem?.id || "No item"}</div>
            <div className="bb-side-sub">{leadItem?.subject || "Queue currently clear"}</div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Decision state</div>
            <div className="bb-side-state">{leadItem?.decisionState || "clear"}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Queue size</div>
          <div className="bb-user-name">{approvalItems.length}</div>
          <div className="bb-user-org">Approval items</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Pending</div>
          <div className="bb-kpi-value">{pending}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Blocked</div>
          <div className="bb-kpi-value">{blocked}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Held</div>
          <div className="bb-kpi-value">{held}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Approved</div>
          <div className="bb-kpi-value">{approved}</div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Approval overview</div>
              <div className="bb-panel-subtitle">
                Decision queue by approval subject, owner, and control state
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">{approvalItems.length} items</span>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Queue</th>
                  <th>State</th>
                  <th>Owner</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {approvalItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.subject}</td>
                    <td>{item.queue}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.decisionState)}`}>
                        {item.decisionState}
                      </span>
                    </td>
                    <td>{item.owner}</td>
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
                <div className="bb-panel-title">Lead approval detail</div>
                <div className="bb-panel-subtitle">
                  Active decision item and next queue action
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem?.decisionState || "clear")}`}>
                {leadItem?.decisionState || "clear"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>ID</span>
                <strong>{leadItem?.id || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Subject</span>
                <strong>{leadItem?.subject || "Queue currently clear"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Queue</span>
                <strong>{leadItem?.queue || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Decision state</span>
                <strong>{leadItem?.decisionState || "clear"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Owner</span>
                <strong>{leadItem?.owner || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Note</span>
                <strong>{leadItem?.note || "No note"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>
                  {leadItem?.decisionState === "blocked"
                    ? "Resolve hard-stop control item before release"
                    : leadItem?.decisionState === "held"
                      ? "Clear temporary hold and confirm control owner"
                      : leadItem?.decisionState === "pending review"
                        ? "Complete approval review and record decision"
                        : "Queue currently clear"}
                </strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Approval notes</div>
                <div className="bb-panel-subtitle">
                  Decision-routing interpretation
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  Pending review should represent an open decision, not an automatic hard stop.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Held and blocked should remain separate so queue severity is not overstated.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Finance-sensitive items can remain pending review until a finance decision is taken.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
    }
