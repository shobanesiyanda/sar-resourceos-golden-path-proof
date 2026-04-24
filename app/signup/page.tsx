"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Account created. Check your email if confirmation is required.");
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 1200);
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
            maxWidth: 460,
          }}
        >
          <div className="bb-panel-head">
            <div>
              <div className="bb-panel-title">Create ResourceOS account</div>
              <div className="bb-panel-subtitle">
                Live v1 access for the chrome parcel control system
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSignup}
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span className="bb-kpi-label">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                required
                placeholder="Siyanda Luthuli"
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

            <label style={{ display: "grid", gap: 6 }}>
              <span className="bb-kpi-label">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                minLength={6}
                placeholder="Create password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>

            {message && (
              <div className="bb-note-text" style={{ marginTop: 4 }}>
                {message}
              </div>
            )}

            <div className="bb-note-text" style={{ marginTop: 8 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#d6ad32", fontWeight: 800 }}>
                Sign in
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
      }
