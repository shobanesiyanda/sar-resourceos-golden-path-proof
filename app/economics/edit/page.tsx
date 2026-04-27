"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResourceShell from "../../../components/ResourceShell";
import { EconomicsEditTools } from "../../../components/EconomicsEditTools";
import { createClient } from "../../../lib/supabase/client";

type SessionState = "checking" | "signed_in" | "signed_out";

function AccessCard({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7ad32]">
        Access Control
      </p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-white">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-slate-400">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export default function EconomicsEditPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sessionState, setSessionState] =
    useState<SessionState>("checking");

  useEffect(() => {
    let active = true;

    async function checkSessionSafely() {
      const { data } = await supabase.auth.getSession();

      if (!active) return;

      if (data.session) {
        setSessionState("signed_in");
        return;
      }

      window.setTimeout(async () => {
        const retry = await supabase.auth.getSession();

        if (!active) return;

        if (retry.data.session) {
          setSessionState("signed_in");
        } else {
          setSessionState("signed_out");
        }
      }, 700);
    }

    checkSessionSafely();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSessionState(session ? "signed_in" : "signed_out");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (sessionState === "checking") {
    return (
      <ResourceShell
        title="Edit Lead Economics"
        subtitle="Checking secure session before opening editable economics controls."
      >
        <AccessCard
          title="Restoring secure session..."
          text="Please wait while Supabase confirms your active user session."
        />
      </ResourceShell>
    );
  }

  if (sessionState === "signed_out") {
    return (
      <ResourceShell
        title="Edit Lead Economics"
        subtitle="Secure access is required for editable economics controls."
      >
        <AccessCard
          title="Login required"
          text="Your session is not active. Sign in again and you will return to the economics edit page."
          action={
            <button
              type="button"
              onClick={() =>
                router.push("/login?returnTo=/economics/edit")
              }
              className="w-full rounded-full bg-[#d7ad32] px-6 py-5 text-lg font-black text-[#07101c]"
            >
              Login to Continue
            </button>
          }
        />
      </ResourceShell>
    );
  }

  return <EconomicsEditTools />;
      }
