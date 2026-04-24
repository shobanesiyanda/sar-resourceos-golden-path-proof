import Link from "next/link";

export default function HomePage() {
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
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
              Controlled Access
            </p>
            <h2 className="mt-3 text-xl font-black">Authorised users only</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Access is restricted to approved operators and internal users.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
              Transaction Control
            </p>
            <h2 className="mt-3 text-xl font-black">Route to finance handoff</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The live dashboard is available only after login.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#080d18] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d7ad32]">
              Shobane African Resources
            </p>
            <h2 className="mt-3 text-xl font-black">Internal operating system</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Built for controlled chrome parcel execution and operating
              discipline.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
