"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Mode = "password" | "magic";

function NavPill({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={
        active
          ? "shrink-0 rounded-full bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
          : "shrink-0 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-black text-slate-200"
      }
    >
      {label}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function getReturnTo() {
    if (typeof window === "undefined") return "/dashboard";

    const params = new URLSearchParams(window.location.search);
    const value = params.get("returnTo");

    if (value && value.startsWith("/")) return value;
    return "/dashboard";
  }

  async function signInPassword() {
    setWorking(true);
    setNotice("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      setWorking(false);
      return;
    }

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (signInError) {
      setError(signInError.message);
      setWorking(false);
      return;
    }

    router.replace(getReturnTo());
  }

  async function sendMagicLink() {
    setWorking(true);
    setNotice("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address.");
      setWorking(false);
      return;
    }

    const returnTo = getReturnTo();

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}${returnTo}`
        : undefined;

    const { error: magicError } =
      await supabase.auth.signInWithOtp({
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
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#050914]/95 px-4 py-3">
        <nav className="mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto rounded-full border border-slate-800 bg-slate-950/60 p-2">
          <div className="shrink-0 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
              Access
            </p>
          </div>

          <NavPill label="Login" active />
          <NavPill label="Request Access" />
        </nav>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-xl">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-5 text-3xl font-black leading-tight text-white">
            Secure internal access.
          </h1>

          <p className="mt-4 text-lg font-black text-white">
            Authorised users only.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={
                mode === "password"
                  ? "rounded-full bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
                  : "rounded-full border border-slate-700 px-5 py-3 text-sm font-black text-slate-300"
              }
            >
              Password
            </button>

            <button
              type="button"
              onClick={() => setMode("magic")}
              className={
                mode === "magic"
                  ? "rounded-full bg-[#d7ad32] px-5 py-3 text-sm font-black text-[#07101c]"
                  : "rounded-full border border-slate-700 px-5 py-3 text-sm font-black text-slate-300"
              }
            >
              Magic link
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4 text-lg font-black text-white outline-none focus:border-[#d7ad32]"
              />
            </div>

            {mode === "password" ? (
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4 text-lg font-black text-white outline-none focus:border-[#d7ad32]"
                />
              </div>
            ) : null}

            <button
              type="button"
              disabled={working}
              onClick={
                mode === "password" ? signInPassword : sendMagicLink
              }
              className="w-full rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-[#07101c] disabled:opacity-50"
            >
              {working
                ? "Working..."
                : mode === "password"
                ? "Sign in"
                : "Send magic link"}
            </button>

            {notice ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="text-sm font-black text-emerald-200">
                  {notice}
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="text-sm font-black text-red-200">
                  {error}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
              Access Notice
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Internal module navigation is hidden until login is complete.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
  }
