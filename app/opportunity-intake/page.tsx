import ExecutiveShell from "../../components/ExecutiveShell";
import opportunityData from "../../data/opportunity_intake.json";

type SearchParams = {
  filter?: string;
};

export default function OpportunityIntakePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const summary = opportunityData.summary;
  const activeFilter = (searchParams?.filter || "all").toLowerCase();

  const filteredItems: any[] = (opportunityData.items || []).filter((item: any) => {
    const qualification = String(item?.qualificationState || "").toLowerCase();
    const commercial = String(item?.commercialState || "").toLowerCase();

    return (
      activeFilter === "all" ||
      qualification === activeFilter ||
      commercial === activeFilter
    );
  });

  const leadItem: any = filteredItems[0] || (opportunityData.items || [])[0] || {};

  function chipClass(value?: string) {
    const v = String(value || "").toLowerCase();
    if (v.includes("qualified")) return "bb-chip-blue";
    if (v.includes("screen")) return "bb-chip-amber";
    if (v.includes("reject")) return "bb-chip-red";
    if (v.includes("new")) return "bb-chip-gold";
    return "bb-chip-gold";
  }

  return (
    <ExecutiveShell
      activeHref="/opportunity-intake"
      title="Opportunity intake and qualification control."
      subtitle="Institutional intake dashboard for upstream deal capture, first-screen qualification, and release into route economics."
    >
      <div className="bb-command-grid">
        <section className="bb-command-panel">
          <div className="bb-command-eyebrow">Intake command layer</div>
          <div className="bb-command-title">Opportunity intake / qualification desk</div>
          <p className="bb-command-text">
            This dashboard captures upstream opportunities, applies first-screen
            qualification, and routes viable parcels into commercial pricing and
            execution control.
          </p>

          <div className="bb-command-tags">
            <span className="bb-chip bb-chip-gold">Intake active</span>
            <span className="bb-chip bb-chip-blue">Lead screened</span>
            <span className="bb-chip bb-chip-amber">Front-door flow</span>
          </div>
        </section>

        <section className="bb-command-side">
          <div className="bb-command-side-block">
            <div className="bb-side-label">Lead opportunity</div>
            <div className="bb-side-value">{leadItem.opportunityName || "No active lead"}</div>
            <div className="bb-side-sub">
              {leadItem.commodity || "—"} · {leadItem.sourceType || "—"}
            </div>
          </div>

          <div className="bb-command-side-divider" />

          <div className="bb-command-side-block">
            <div className="bb-side-label">Qualification</div>
            <div className="bb-side-state">{leadItem.qualificationState || "unknown"}</div>
          </div>
        </section>

        <aside className="bb-operator-card">
          <div className="bb-user-role">Visible opportunities</div>
          <div className="bb-user-name">{filteredItems.length}</div>
          <div className="bb-user-org">Pipeline view</div>
        </aside>
      </div>

      <div className="bb-grid bb-grid-kpis">
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Visible opportunities</div>
          <div className="bb-kpi-value">{filteredItems.length}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">New</div>
          <div className="bb-kpi-value">{summary.new}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Screening</div>
          <div className="bb-kpi-value">{summary.screening}</div>
        </div>
        <div className="bb-kpi-card">
          <div className="bb-kpi-label">Qualified / rejected</div>
          <div className="bb-kpi-value">
            {summary.qualified} / {summary.rejected}
          </div>
        </div>
      </div>

      <div className="bb-grid bb-grid-main">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Opportunity overview</div>
              <div className="bb-panel-subtitle">
                Intake queue by qualification state and first-screen decision
              </div>
            </div>
            <span className="bb-chip bb-chip-gold">
              {summary.totalOpportunities} total opportunities
            </span>
          </div>

          <div className="bb-filter-row">
            <a
              href="/opportunity-intake"
              className={`bb-filter-chip ${activeFilter === "all" ? "is-active" : ""}`}
            >
              All
            </a>
            <a
              href="/opportunity-intake?filter=new"
              className={`bb-filter-chip ${activeFilter === "new" ? "is-active" : ""}`}
            >
              New
            </a>
            <a
              href="/opportunity-intake?filter=screening"
              className={`bb-filter-chip ${activeFilter === "screening" ? "is-active" : ""}`}
            >
              Screening
            </a>
            <a
              href="/opportunity-intake?filter=qualified"
              className={`bb-filter-chip ${activeFilter === "qualified" ? "is-active" : ""}`}
            >
              Qualified
            </a>
            <a
              href="/opportunity-intake?filter=rejected"
              className={`bb-filter-chip ${activeFilter === "rejected" ? "is-active" : ""}`}
            >
              Rejected
            </a>
          </div>

          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Commodity</th>
                  <th>Source</th>
                  <th>Tons</th>
                  <th>Counterparty</th>
                  <th>Qualification</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.opportunityName}</td>
                    <td>{item.commodity}</td>
                    <td>{item.sourceType}</td>
                    <td>{item.indicativeTons}</td>
                    <td>{item.counterparty}</td>
                    <td>
                      <span className={`bb-chip ${chipClass(item.qualificationState)}`}>
                        {item.qualificationState}
                      </span>
                    </td>
                    <td>
                      <a
                        href="/route-economics"
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
                <div className="bb-panel-title">Lead opportunity detail</div>
                <div className="bb-panel-subtitle">
                  First-screen operating view for the active intake lead
                </div>
              </div>
              <span className={`bb-chip ${chipClass(leadItem.qualificationState)}`}>
                {leadItem.qualificationState || "unknown"}
              </span>
            </div>

            <div className="bb-metric-list">
              <div className="bb-metric-row">
                <span>Name</span>
                <strong>{leadItem.opportunityName || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Commodity</span>
                <strong>{leadItem.commodity || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Source type</span>
                <strong>{leadItem.sourceType || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Counterparty</span>
                <strong>{leadItem.counterparty || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Indicative tons</span>
                <strong>{leadItem.indicativeTons || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Location</span>
                <strong>{leadItem.location || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Indicative grade</span>
                <strong>{leadItem.indicativeGrade || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Commercial state</span>
                <strong>{leadItem.commercialState || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Qualification state</span>
                <strong>{leadItem.qualificationState || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Priority</span>
                <strong>{leadItem.priority || "—"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Blocker</span>
                <strong>{leadItem.blocker || "None"}</strong>
              </div>
              <div className="bb-metric-row">
                <span>Next action</span>
                <strong>{leadItem.nextAction || "—"}</strong>
              </div>
            </div>
          </section>

          <section className="bb-panel">
            <div className="bb-panel-head">
              <div>
                <div className="bb-panel-title">Intake notes</div>
                <div className="bb-panel-subtitle">
                  Qualification interpretation and release cue
                </div>
              </div>
            </div>

            <div className="bb-notes">
              <div className="bb-note">
                <div className="bb-note-dot is-gold" />
                <div className="bb-note-text">
                  New opportunities should be verified for source, volume, and commercial seriousness before route pricing.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Screening opportunities require grade, logistics, and counterparty checks before qualification.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Qualified opportunities can move into Route Economics for pricing and viability testing.
                </div>
              </div>
              <div className="bb-note">
                <div className="bb-note-dot" />
                <div className="bb-note-text">
                  Rejected opportunities remain visible for record purposes but should not advance without a material change.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ExecutiveShell>
  );
              }
