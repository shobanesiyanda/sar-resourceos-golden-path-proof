"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type SessionState = "checking" | "signed_in" | "signed_out";

export default function HomePage() {
  const supabase = createClient();
  const [sessionState, setSessionState] =
    useState<SessionState>("checking");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      setSessionState(
        data.session ? "signed_in" : "signed_out"
      );
    }

    checkSession();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSessionState(session ? "signed_in" : "signed_out");
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signedIn = sessionState === "signed_in";
  const checking = sessionState === "checking";

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#050914]/95 px-3 py-3">
        <nav className="mx-auto flex max-w-md items-center gap-2 overflow-x-auto rounded-full border border-slate-800 bg-slate-950/60 p-2">
          <div className="shrink-0 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
              {checking
                ? "Checking"
                : signedIn
                ? "Signed In"
                : "Access"}
            </p>
          </div>

          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="shrink-0 rounded-full bg-[#d7ad32] px-4 py-2 text-xs font-black text-[#07101c]"
              >
                Dash
              </Link>

              <Link
                href="/leads"
                className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs font-black text-slate-200"
              >
                Leads
              </Link>

              <Link
                href="/route"
                className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs font-black text-slate-200"
              >
                Route
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="shrink-0 rounded-full bg-[#d7ad32] px-4 py-2 text-xs font-black text-[#07101c]"
              >
                Login
              </Link>

              <Link
                href="/login"
                className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs font-black text-slate-200"
              >
                Request Access
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="mx-auto max-w-md px-4 py-5">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-4 text-2xl font-black leading-tight text-white">
            Secure internal access.
          </h1>

          <p className="mt-3 text-sm font-black text-white">
            Authorised users only.
          </p>

          <div className="mt-5">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="block w-full rounded-full bg-[#d7ad32] px-4 py-3 text-center text-sm font-black text-[#07101c]"
              >
                Open Dashboard
              </Link>
            ) : (
              <div className="grid gap-3">
                <Link
                  href="/login"
                  className="block w-full rounded-full bg-[#d7ad32] px-4 py-3 text-center text-sm font-black text-[#07101c]"
                >
                  Login
                </Link>

                <Link
                  href="/login"
                  className="block w-full rounded-full border border-slate-700 px-4 py-3 text-center text-sm font-black text-slate-200"
                >
                  Request Access
                </Link>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
              Access Notice
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Access is restricted to authorised Shobane African Resources users.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
           }
