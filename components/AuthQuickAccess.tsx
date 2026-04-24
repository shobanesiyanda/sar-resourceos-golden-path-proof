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
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl backdrop-blur">
        <span className="hidden max-w-[220px] truncate px-3 text-sm font-bold text-slate-200 sm:inline">
          {email}
        </span>

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
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl backdrop-blur">
      <Link
        href="/login"
        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-slate-200"
      >
        Login
      </Link>

      <Link
        href="/signup"
        className="rounded-full bg-[#d7ad32] px-4 py-2 text-sm font-black text-[#07101c]"
      >
        Sign up
      </Link>
    </div>
  );
} 
