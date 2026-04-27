"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type AuthMode = "password" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("password");
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setSignedIn(true);
      } else {
        setSignedIn(false);
      }

      setChecking(false);
    }

    checkSession();
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
    setSignedIn(true);
    router.push("/dashboard");
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
        ? `${window.location.origin}/dashboard`
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

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#050914]/95 px-4 py-4 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto rounded-full border border-slate-800 bg-slate-950/60 p-2">
          <div className="shrink-0 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
              {checking ? "Checking" : signedIn ? "Signed In" : "Access"}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-black text-slate-200"
          >
            Dash
          </Link>

          <Link
            href="/operations"
            className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-black text-slate-200"
          >
            Ops
          </Link>

          <Link
            href="/route-builder"
            className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-black text-slate-200"
          >
            Route
          </Link>

          <Link
            href="/finance"
            className="shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-black text-slate-200"
          >
            Finance
          </Link>
        </nav>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 shadow-2xl">
          <h1 className="text-3xl font-black leading-tight text-white">
            SAR ResourceOS Login
          </h1>

          <p className="mt-4 text-sm font-black uppercase leading-7 tracking-[0.25em] text-[#d7ad32]">
            Secure access to the live resource parcel control system
          </p>

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
              onClick={
                mode === "password" ? signInWithPassword : sendMagicLink
              }
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
        </section>

        {!signedIn ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
              Access Notice
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              The system now shows “Access” when no user session is active.
              “Signed In” only appears after Supabase confirms an authenticated
              user.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
    }
