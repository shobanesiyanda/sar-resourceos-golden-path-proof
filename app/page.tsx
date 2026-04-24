"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
      setChecking(false);
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

  return (
    <main className="min-h-screen bg-[#050914] px-5 py-24 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Secure chrome transaction control system.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            SAR ResourceOS is the internal operating environment for controlled
            resource opportunity intake, counterparty verification, route
            economics, execution readiness, parcel movement, reconciliation,
            approvals and finance handoff.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {checking ? null : email ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-[#d7ad32]/50 bg-[#d7ad32] px-6 py-4 text-center text-sm font-black text-[#07101c]"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-[#d7ad32]/50 bg-[#d7ad32] px-6 py-4 text-center text-sm font-black text-[#07101c]"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-black text-slate-200"
                >
                  Request / Create Access
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
              Controlled Access
            </p>
            <h2 className="mt-3 text-xl font-black">Authorised users only</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Access is restricted to approved operators and internal users.
              Live operational controls are not exposed publicly.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
              Transaction Control
            </p>
            <h2 className="mt-3 text-xl font-black">
              Route to finance handoff
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The live dashboard is available only after secure login and
              Supabase session verification.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
              Shobane African Resources
            </p>
            <h2 className="mt-3 text-xl font-black">
              Internal operating system
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Built for controlled chrome parcel execution, route discipline,
              evidence tracking, approvals and finance readiness.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            Access Notice
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            This platform is an internal operating environment of Shobane
            African Resources. Unauthorised access is not permitted. Users must
            sign in before accessing transaction dashboards, parcel controls,
            counterparty information or finance handoff workflows.
          </p>
        </div>
      </section>
    </main>
  );
        }
