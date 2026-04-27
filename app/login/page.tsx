"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type AuthMode = "password" | "magic";
type AuthState = "checking" | "signed_in" | "signed_out";

function NavPill({
  href,
  label,
  active,
  danger,
}: {
  href: string;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "shrink-0 rounded-full bg-[#d7ad32] px-6 py-4 text-base font-black text-[#07101c]"
          : danger
          ? "shrink-0 rounded-full border border-red-400/30 bg-red-500/10 px-6 py-4 text-base font-black text-red-100"
          : "shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-6 py-4 text-base font-black text-slate-200"
      }
    >
      {label}
    </Link>
  );
}

function statusLabel(state: AuthState) {
  if (state === "checking") return "Checking";
  if (state === "signed_in") return "Signed In";
  return "Access";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("password");
  const [authState, setAuthState] = useState<AuthState>("checking");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const returnTo = useMemo(() => {
    const fromQuery = searchParams.get("returnTo");
    if (fromQuery && fromQuery.startsWith("/")) return fromQuery;
    return "/dashboard";
  }, [searchParams]);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setAuthState(data.session ? "signed_in" : "signed_out");
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? "signed_in" : "signed_out");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signInWithPassword() {
    setWorking(true);
    setNotice("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      setWorking(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setWorking(false);
      return;
    }

    setNotice("Signed in successfully.");
    setAuthState("signed_in");
    router.push(returnTo);
  }

  async function sendMagicLink() {
    setWorking(true);
    setNotice("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address first.");
      setWorking(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}${returnTo}`
        : undefined;

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (magicError) {
      setError(magicError.message);
      setWorking(false);
      return;
    }

    setNotice("Magic link sent. Check your email.");
    setWorking(false);
  }

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
              <NavPill href="/dashboard" label="Dash" />
              <NavPill href="/leads" label="Leads" />
              <NavPill href="/route-builder" label="Route" />
              <NavPill href="/operations" label="Ops" />
              <NavPill href="/finance" label="Finance" />
              <NavPill href="/analytics" label="Analytics" />
              <NavPill href="/documents" label="Docs" />
              <NavPill href="/logout" label="Out" danger />
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

          <h1 className="mt-5 text-4xl font-black leading-tight text-white">
            Secure internal access.
          </h1>

          <p className="mt-5 text-lg font-black leading-7 text-white">
            Authorised users only.
          </p>

          {returnTo !== "/dashboard" ? (
            <div className="mt-6 rounded-3xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
                Return Path
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                After sign-in, you will return to: {returnTo}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={
                mode === "password"
                  ? "rounded-full bg-[#d7ad32] px-6 py-4 text-base font-black text-[#07101c]"
                  : "rounded-full border border-slate-700 bg-slate-900/40 px-6 py-4 text-base font-black text-slate-300"
              }
            >
              Password
            </button>

            <button
              type="button"
              onClick={() => setMode("magic")}
              className={
                mode === "magic"
                  ? "rounded-full bg-[#d7ad32] px-6 py-4 text-base font-black text-[#07101c]"
                  : "rounded-full border border-slate-700 bg-slate-900/40 px-6 py-4 text-base font-black text-slate-300"
              }
            >
              Magic link
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                Email
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900/70 px-5 py-5 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
              />
            </div>

            {mode === "password" ? (
              <div>
                <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type="password"
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900/70 px-5 py-5 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
                />
              </div>
            ) : null}

            <button
              type="button"
              disabled={working}
              onClick={mode === "password" ? signInWithPassword : sendMagicLink}
              className="w-full rounded-full bg-[#d7ad32] px-6 py-5 text-lg font-black text-[#07101c] disabled:opacity-50"
            >
              {working
                ? "Working..."
                : mode === "password"
                ? "Sign in"
                : "Send magic link"}
            </button>

            {notice ? (
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="text-sm font-bold leading-6 text-emerald-200">
                  {notice}
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="text-sm font-bold leading-6 text-red-200">
                  {error}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
              Access Notice
            </p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Internal module navigation is hidden until Supabase confirms an
              active user session.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
                   }
