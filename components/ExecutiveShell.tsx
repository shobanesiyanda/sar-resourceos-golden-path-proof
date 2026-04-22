import SidebarNav from "./SidebarNav";
import TopBar from "./TopBar";

type NavItem = {
  label: string;
  href: string;
  primary?: boolean;
};

export default function ExecutiveShell({
  title,
  subtitle,
  activeHref,
  children,
}: {
  title: string;
  subtitle: string;
  activeHref: string;
  children: React.ReactNode;
}) {
  const items: NavItem[] = [
    { label: "Overview", href: "/" },
    { label: "Opportunity Intake", href: "/opportunity-intake" },
    { label: "Route Economics", href: "/route-economics" },
    { label: "Execution Readiness", href: "/execution-readiness" },
    { label: "Open Proof", href: "/golden-path", primary: true },
    { label: "Dispatch Control", href: "/dispatch-control" },
    { label: "Reconciliation", href: "/reconciliation" },
    { label: "Open Exceptions", href: "/exceptions" },
    { label: "Approval Queue", href: "/approval-queue" },
    { label: "Finance Handoff", href: "/finance-handoff" },
  ];

  return (
    <section className="bb-shell">
      <div className="bb-shell-inner">
        <SidebarNav items={items} activeHref={activeHref} />
        <main className="bb-main">
          <TopBar title={title} subtitle={subtitle} />
          {children}
        </main>
      </div>
    </section>
  );
    }
