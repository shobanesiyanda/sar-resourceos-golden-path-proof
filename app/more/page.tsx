"use client";

import Link from "next/link";
import ResourceShell from "../../components/ResourceShell";

const modules = [
  {
    title: "Finance",
    label: "Exposure / Margin",
    href: "/finance",
    note: "Route cost, assay-adjusted economics, surplus, margin and finance handoff.",
  },
  {
    title: "Analytics",
    label: "Readiness / Risk",
    href: "/analytics",
    note: "Readiness score, blocker count, margin signal and release-control interpretation.",
  },
  {
    title: "Documents",
    label: "Evidence Register",
    href: "/documents",
    note: "Supplier, plant, transport, buyer, assay and release document readiness.",
  },
  {
    title: "Approvals",
    label: "Release Gates",
    href: "/approvals",
    note: "Plant, counterparty, finance and controlled release approval queue.",
  },
  {
    title: "Counterparties",
    label: "Route Parties",
    href: "/counterparties",
    note: "Suppliers, buyers, wash plants and transporters linked to route readiness.",
  },
  {
    title: "Admin",
    label: "System Control",
    href: "/admin",
    note: "Users, profiles, module counts and controlled administration overview.",
  },
];

function ModuleCard({
  title,
  label,
  href,
  note,
}: {
  title: string;
  label: string;
  href: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl transition hover:border-[#d7ad32]/60"
    >
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d7ad32]">
        {label}
      </p>
      <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{note}</p>
      <div className="mt-4 inline-flex rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]">
        Open {title}
      </div>
    </Link>
  );
}

export default function MorePage() {
  return (
    <ResourceShell
      title="More Modules"
      subtitle="Mobile module menu for finance, analytics, documents, approvals, counterparties and administration."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => (
          <ModuleCard key={item.href} {...item} />
        ))}
      </section>

      <section className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-200">
          Control Note
        </p>
        <h3 className="mt-2 text-2xl font-black text-red-100">
          Use modules through controlled navigation.
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This page fixes mobile discovery for secondary modules. It does not
          change permissions, release rules, finance logic or approval authority.
        </p>
      </section>
    </ResourceShell>
  );
}
