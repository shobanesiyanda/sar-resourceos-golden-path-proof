"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        window.location.href = "/dashboard";
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [supabase]);

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage("Magic link sent. Check your email.");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d7ad32]">
            SAR ResourceOS
          </p>
          <h1 className="mt-3 text-2xl font-black">Checking secure session...</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            If you are already signed in, you will be sent to the dashboard.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050914] px-5 py-28 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl">
        <h1 className="text-2xl font-black">SAR ResourceOS Login</h1>

        <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
          Secure access to the live chrome parcel control system
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`rounded-full border px-5 py-3 text-sm font-black ${
              mode === "password"
                ? "border-[#d7ad32]/60 bg-[#d7ad32] text-[#07101c]"
                : "border-white/10 bg-white/[0.03] text-slate-300"
            }`}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`rounded-full border px-5 py-3 text-sm font-black ${
              mode === "magic"
                ? "border-[#d7ad32]/60 bg-[#d7ad32] text-[#07101c]"
                : "border-white/10 bg-white/[0.03] text-slate-300"
            }`}
          >
            Magic link
          </button>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
          className="mt-6 space-y-5"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-lg text-white outline-none placeholder:text-slate-500"
            />
          </div>

          {mode === "password" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-lg text-white outline-none placeholder:text-slate-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl border border-[#d7ad32]/60 bg-[#d7ad32] px-5 py-4 text-sm font-black text-[#07101c] disabled:opacity-50"
          >
            {submitting
              ? "Please wait..."
              : mode === "password"
              ? "Sign in"
              : "Send magic link"}
          </button>

          {message && (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
    }
