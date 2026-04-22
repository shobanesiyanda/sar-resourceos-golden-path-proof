type NavItem = {
  label: string;
  href: string;
  primary?: boolean;
};

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
        <div>
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
            >
              <span>{item.label}</span>
              <span className="bb-nav-arrow">›</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
