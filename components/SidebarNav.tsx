type NavItem = {
  label: string;
  href: string;
  primary?: boolean;
};

function compactLabel(label: string) {
  return label
    .replace("Opportunity Intake", "Opportunity\nIntake")
    .replace("Route Economics", "Route\nEconomics")
    .replace("Execution Readiness", "Execution\nReadiness")
    .replace("Dispatch Control", "Dispatch\nControl")
    .replace("Open Exceptions", "Open\nExceptions")
    .replace("Approval Queue", "Approval\nQueue")
    .replace("Finance Handoff", "Finance\nHandoff")
    .replace("Open Proof", "Open\nProof");
}

export default function SidebarNav({
  items,
  activeHref,
}: {
  items: NavItem[];
  activeHref: string;
}) {
  return (
    <aside className="bb-sidebar">
      <div className="bb-brand-block">
        <div className="bb-brand-mark">SAR</div>
        <div className="bb-brand-copy">
          <div className="bb-brand-title">SAR ResourceOS</div>
          <div className="bb-brand-subtitle">African Mineral Development</div>
        </div>
      </div>

      <nav className="bb-nav">
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`bb-nav-link ${active ? "is-active" : ""} ${item.primary ? "is-primary" : ""}`}
              title={item.label}
            >
              <span className="bb-nav-label-desktop">{item.label}</span>
              <span className="bb-nav-label-mobile">
                {compactLabel(item.label)}
              </span>
              <span className="bb-nav-arrow">›</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
  }
