"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

export default function AuthQuickAccess() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return null;
  }

  if (email) {
    return (
      <div className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-3xl border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl backdrop-blur md:left-6 md:right-6">
        <div className="min-w-0 px-2 sm:px-3">
          <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.12em] text-[#d7ad32] sm:text-xs sm:tracking-[0.22em]">
            Signed in
          </p>

          <p className="hidden max-w-[260px] truncate text-xs font-bold text-slate-300 sm:block">
            {email}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#d7ad32]/40 bg-[#d7ad32] px-4 py-2 text-sm font-black text-[#07101c]"
          >
            Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-slate-200"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-7xl items-center justify-end gap-2 rounded-3xl border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl backdrop-blur md:left-6 md:right-6">
      <Link
        href="/login"
        className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-black text-slate-200"
      >
        Login
      </Link>

      <Link
        href="/signup"
        className="rounded-full bg-[#d7ad32] px-5 py-2 text-sm font-black text-[#07101c]"
      >
        Sign up
      </Link>
    </div>
  );
            }
