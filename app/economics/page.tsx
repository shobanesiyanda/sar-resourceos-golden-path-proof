import EconomicsEditTools from "../../components/EconomicsEditTools";

export const dynamic = "force-dynamic";

export default function EconomicsPage() {
  return (
    <main className="min-h-screen bg-[#050914] px-4 py-6 text-white">
      <div className="mx-auto grid max-w-4xl gap-5">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
            SAR ResourceOS
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight text-white">
            Economics Editor
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-400">
            Direct-access route for commodity, product and route economics editing.
          </p>
        </section>

        <EconomicsEditTools />
      </div>
    </main>
  );
}
