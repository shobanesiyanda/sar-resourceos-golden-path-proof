"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dash" },
  { href: "/operations", label: "Ops" },
  { href: "/route-builder", label: "Route" },
  { href: "/finance", label: "Finance" },
  { href: "/analytics", label: "Analytics" },
  { href: "/documents", label: "Docs" },
  { href: "/approvals", label: "Approvals" },
  { href: "/counterparties", label: "Parties" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AuthQuickAccess() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050914]/95 px-3 pb-3 pt-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[54px] items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-[#080d18]/95 p-2 scrollbar-hide">
          <div className="shrink-0 px-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#d7ad32]">
            Signed In
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "shrink-0 rounded-full border px-4 py-3 text-sm font-black transition",
                    active
                      ? "border-[#d7ad32] bg-[#d7ad32] text-[#07101c]"
                      : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-[#d7ad32]/50 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleSignOut}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-black text-slate-200 transition hover:border-red-300/50 hover:text-red-100"
            >
              Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
    }
