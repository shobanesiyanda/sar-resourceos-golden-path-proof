"use client";

import { useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      const supabase = createClient();

      await supabase.auth.signOut();

      try {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("sb-") ||
            key.toLowerCase().includes("supabase")
          ) {
            localStorage.removeItem(key);
          }
        });
      } catch {}

      window.location.replace("/login");
    }

    logout();
  }, []);

  return (
    <main className="min-h-screen bg-[#050914] px-4 py-8 text-white">
      <section className="mx-auto mt-20 max-w-xl rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
          SAR ResourceOS
        </p>

        <h1 className="mt-5 text-4xl font-black">
          Signing out...
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-400">
          Secure session is being cleared.
        </p>
      </section>
    </main>
  );
    }
