"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

const nav = [
  { label: "Dashboard", short: "Dash", href: "/dashboard" },
  { label: "Opportunities", short: "Leads", href: "/economics" },
  { label: "Counterparties", short: "Parties", href: "/counterparties" },
  { label: "Route Builder", short: "Route", href: "/route-builder" },
  { label: "Operations", short: "Ops", href: "/operations" },
  { label: "Tolling & Plants", short: "Plants", href: "/route-builder" },
  { label: "Documents", short: "Docs", href: "/documents" },
  { label: "Approvals", short: "Approvals", href: "/approvals" },
  { label: "Finance", short: "Finance", href: "/finance" },
  { label: "Analytics", short: "Analytics", href: "/analytics" },
  { label: "Admin", short: "Admin", href: "/dashboard" },
];

const mobileNav = [
  { label: "Dash", href: "/dashboard" },
  { label: "Leads", href: "/economics" },
  { label: "Route", href: "/route-builder" },
  { label: "Ops", href: "/operations" },
  { label: "More", href: "#more" },
];

function active(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  if (href.startsWith("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ResourceShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 bg-[#050914] p-5 md:block">
        <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-xl font-black">Control Room</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sourcing, economics, route control and release readiness.
          </p>
        </div>

        <nav className="mt-5 space-y-2">
          {nav.map((item) => {
            const isActive = active(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "block rounded-2xl border px-4 py-3 text-sm font-black transition",
                  isActive
                    ? "border-[#d7ad32] bg-[#d7ad32] text-[#07101c]"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-[#d7ad32]/50 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={signOut}
          className="mt-5 w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100"
        >
          Sign out
        </button>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050914]/95 px-3 py-3 shadow-2xl backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-[#080d18] p-2 scrollbar-hide">
          {mobileNav.map((item) => {
            const isActive = active(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "shrink-0 rounded-full border px-4 py-3 text-sm font-black",
                  isActive
                    ? "border-[#d7ad32] bg-[#d7ad32] text-[#07101c]"
                    : "border-white/10 bg-white/[0.03] text-slate-200",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="shrink-0 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100"
          >
            Out
          </button>
        </div>
      </div>

      <main className="px-4 pb-28 pt-28 md:pl-80 md:pr-6 md:pt-6">
        <div className="mx-auto max-w-7xl">
          <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#d7ad32]">
              SAR ResourceOS
            </p>
            <h2 className="mt-2 text-3xl font-black">{title}</h2>
            {subtitle ? (
              <p className="mt-3 text-sm leading-7 text-slate-400">{subtitle}</p>
            ) : null}
          </section>

          {children}
        </div>
      </main>
    </div>
  );
   }
