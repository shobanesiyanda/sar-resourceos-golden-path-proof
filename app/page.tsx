"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

type AuthState = "checking" | "signed_in" | "signed_out";

function statusLabel(state: AuthState) {
  if (state === "checking") return "Checking";
  if (state === "signed_in") return "Signed In";
  return "Access";
}

function NavPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "shrink-0 rounded-full bg-[#d7ad32] px-6 py-4 text-base font-black text-[#07101c]"
          : "shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-6 py-4 text-base font-black text-slate-200"
      }
    >
      {label}
    </Link>
  );
}

export default function HomePage() {
  const supabase = createClient();

  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      setAuthState(data.user ? "signed_in" : "signed_out");
    }

    checkAuth();
  }, [supabase]);

  const signedIn = authState === "signed_in";

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#050914]/95 px-4 py-4 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto rounded-full border border-slate-800 bg-slate-950/60 p-2">
          <div className="shrink-0 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
              {statusLabel(authState)}
            </p>
          </div>

          {signedIn ? (
            <>
              <NavPill href="/dashboard" label="Dash" active />
              <NavPill href="/leads" label="Leads" />
              <NavPill href="/route-builder" label="Route" />
              <NavPill href="/operations" label="Ops" />
              <NavPill href="/finance" label="Finance" />
              <NavPill href="/analytics" label="Analytics" />
              <NavPill href="/documents" label="Docs" />
              <NavPill href="/logout" label="Out" />
            </>
          ) : (
            <>
              <NavPill href="/login" label="Login" active />
              <NavPill href="/login" label="Request Access" />
            </>
          )}
        </nav>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-3xl items-center px-4 py-8">
        <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/40 p-6 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight text-white">
            Secure internal access.
          </h1>

          <p className="mt-6 text-2xl font-black leading-tight text-white">
            Authorised users only.
          </p>

          <div className="mt-10 space-y-4">
            <Link
              href={signedIn ? "/dashboard" : "/login"}
              className="inline-flex w-full justify-center rounded-full bg-[#d7ad32] px-6 py-5 text-lg font-black text-[#07101c]"
            >
              {signedIn ? "Open Dashboard" : "Login"}
            </Link>

            {!signedIn ? (
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-full border border-slate-700 bg-slate-900/40 px-6 py-5 text-lg font-black text-slate-200"
              >
                Request Access
              </Link>
            ) : null}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
              Access Notice
            </p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Access is restricted to authorised Shobane African Resources
              users.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
      }
