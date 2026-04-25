"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type UserState = {
  email: string | null;
  signedIn: boolean;
};

const liveLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Documents",
    href: "/documents",
  },
  {
    label: "Approvals",
    href: "/approvals",
  },
];

export default function AuthQuickAccess() {
  const supabase = createClient();
  const pathname = usePathname();

  const [userState, setUserState] = useState<UserState>({
    email: null,
    signedIn: false,
  });

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserState({
        email: user?.email ?? null,
        signedIn: Boolean(user),
      });
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserState({
        email: session?.user?.email ?? null,
        signedIn: Boolean(session?.user),
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (!userState.signedIn) {
    return (
      <div className="fixed left-4 right-4 top-6 z-50 mx-auto max-w-4xl rounded-full border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-end gap-2">
          <Link
            href="/login"
            className={`rounded-full border px-5 py-3 text-sm font-black ${
              pathname === "/login"
                ? "border-[#d7ad32]/60 bg-[#d7ad32] text-[#07101c]"
                : "border-white/10 bg-white/[0.03] text-slate-200"
            }`}
          >
            Login
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-4 right-4 top-6 z-50 mx-auto max-w-5xl rounded-full border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="shrink-0 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
          Signed in
        </div>

        {liveLinks.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full border px-5 py-3 text-sm font-black ${
                active
                  ? "border-[#d7ad32]/60 bg-[#d7ad32] text-[#07101c]"
                  : "border-white/10 bg-white/[0.03] text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleSignOut}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-200"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
