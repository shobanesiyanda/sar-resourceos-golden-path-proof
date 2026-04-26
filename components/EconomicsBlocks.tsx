export type FormState = {
  category: string;
  resource: string;
  material: string;
  target: string;
  yield: string;
  price: string;
  feedstock: string;
  transport: string;
  tolling: string;
  feedstockAssayRate: string;
  feedstockAssayBatches: string;
  concentrateAssayRate: string;
  concentrateAssayBatches: string;
};

export function n(v: string) {
  const x = Number(String(v || "").replace(",", ".").trim());
  return Number.isFinite(x) ? x : 0;
}

export function money(v: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

export function tons(v: number) {
  return Number(v || 0).toFixed(3);
}

export function pct(v: number) {
  return `${Number(v || 0).toFixed(1)}%`;
}

export function feed(target: number, y: number) {
  return y > 0 ? target / (y / 100) : 0;
}

export function marginState(m: number) {
  if (m < 18) return "Below Target";
  if (m <= 25) return "Target Band";
  return "Strong Route";
}

export function marginClass(m: number) {
  if (m < 18) return "border-red-400/40 bg-red-500/15 text-red-200";
  if (m <= 25) return "border-[#d7ad32]/40 bg-[#d7ad32]/15 text-[#f5d778]";
  return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
}

export function Card(p: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-[#080d18] p-5 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d7ad32]">
        {p.label}
      </p>
      <h3 className="mt-2 text-2xl font-black">{p.title}</h3>
      {p.children}
    </section>
  );
}

export function Stat(p: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </p>
      <p
        className={`mt-2 text-3xl font-black ${
          p.gold ? "text-[#f5d778]" : "text-white"
        }`}
      >
        {p.value}
      </p>
      {p.note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{p.note}</p>
      ) : null}
    </div>
  );
}

export function Field(p: {
  label: string;
  value: string;
  help: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </span>
      <input
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        inputMode="decimal"
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-2xl font-black text-white outline-none focus:border-[#d7ad32]"
      />
      <span className="mt-2 block text-sm leading-6 text-slate-400">
        {p.help}
      </span>
    </label>
  );
}

export function SelectField(p: {
  label: string;
  value: string;
  options: string[];
  help: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {p.label}
      </span>
      <select
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#050914] px-4 py-4 text-xl font-black text-white outline-none focus:border-[#d7ad32]"
      >
        {p.options.map((item) => (
          <option key={item} value={item} className="bg-[#050914] text-white">
            {item}
          </option>
        ))}
      </select>
      <span className="mt-2 block text-sm leading-6 text-slate-400">
        {p.help}
      </span>
    </label>
  );
}

export function WarningCard(p: {
  resource: string;
  material: string;
  yieldPercent: string;
  price: string;
}) {
  return (
    <div className="rounded-2xl border border-[#d7ad32]/30 bg-[#d7ad32]/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#f5d778]">
        Assumption Basis
      </p>
      <h3 className="mt-2 text-xl font-black text-white">
        Verify before commercial release
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Resource: <b>{p.resource}</b>. Material: <b>{p.material}</b>. Starter
        yield: <b>{p.yieldPercent}%</b>. Starter price: <b>R {p.price}/t</b>.
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Verify assay results, yield, supplier price, transport, tolling, buyer
        price and assay charges before release.
      </p>
    </div>
  );
}
