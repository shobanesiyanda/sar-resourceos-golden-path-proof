"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ResourceShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const navItems = [
  { label: "Dash", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Route", href: "/route-builder" },
  { label: "Ops", href: "/operations" },
  { label: "More", href: "/more" },
  { label: "Out", href: "/logout" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  if (href === "/leads") {
    return pathname === "/leads";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ResourceShell({
  title,
  subtitle,
  children,
}: ResourceShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#050914]/95 px-4 py-4 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto rounded-full border border-slate-800 bg-slate-950/60 p-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const isOut = item.label === "Out";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "shrink-0 rounded-full bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
                    : isOut
                    ? "shrink-0 rounded-full border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100"
                    : "shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-black text-slate-200"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-base leading-7 text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </section>

        {children}
      </div>
    </main>
  );
    }
