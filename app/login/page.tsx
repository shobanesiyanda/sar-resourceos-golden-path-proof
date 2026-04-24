"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for the login link.");
    setLoading(false);
  }

  return (
    <main className="bb-shell">
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 20,
        }}
      >
        <section
          className="bb-panel"
          style={{
            width: "100%",
            maxWidth: 440,
          }}
        >
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">SAR ResourceOS Login</div>
              <div className="bb-panel-subtitle">
                Secure access to the live chrome parcel control system
              </div>
            </div>
          </div>

          <div className="bb-filter-row">
            <button
              type="button"
              className={`bb-filter-chip ${mode === "password" ? "is-active" : ""}`}
              onClick={() => setMode("password")}
            >
              Password
            </button>
            <button
              type="button"
              className={`bb-filter-chip ${mode === "magic" ? "is-active" : ""}`}
              onClick={() => setMode("magic")}
            >
              Magic link
            </button>
          </div>

          <form
            onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span className="bb-kpi-label">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                style={{
                  minHeight: 42,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#f8fafc",
                  padding: "0 12px",
                }}
              />
            </label>

            {mode === "password" && (
              <label style={{ display: "grid", gap: 6 }}>
                <span className="bb-kpi-label">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  placeholder="Password"
                  style={{
                    minHeight: 42,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#f8fafc",
                    padding: "0 12px",
                  }}
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bb-table-action"
              style={{
                width: "100%",
                minHeight: 42,
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "Processing..."
                : mode === "password"
                  ? "Sign in"
                  : "Send magic link"}
            </button>

            {message && (
              <div className="bb-note-text" style={{ marginTop: 4 }}>
                {message}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
           }
