"use client";

import { useEffect, useMemo, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

const PARCEL_CODE = "PAR-MAI-2026-0001";
const PLAN_CODE = "TP-MAI-2026-0001";

type Row = Record<string, unknown>;

type TruckAsset = {
  id: string;
  truck_code: string;
  truck_type: string | null;
  capacity_tons: number | string | null;
  ownership_type: string | null;
  status: string | null;
};

type TransportPlan = {
  id: string;
  plan_code: string;
  parcel_code: string;
  route_name: string | null;
  commodity_class: string | null;
  resource_category: string | null;
  resource_type: string | null;
  material_type: string | null;
  material_stage: string | null;
  route_quantity: number | string | null;
  required_daily_tons: number | string | null;
  planned_owned_tons: number | string | null;
  planned_outsourced_tons: number | string | null;
  planned_total_tons: number | string | null;
  owned_capacity_available_tons: number | string | null;
  outsourced_capacity_required_tons: number | string | null;
  planning_note: string | null;
  status: string | null;
};

type PlanLine = {
  id: string;
  transport_plan_id: string;
  parcel_code: string;
  transport_mode: string;
  truck_asset_id: string | null;
  transporter_id: string | null;
  line_label: string | null;
  planned_loads: number | string | null;
  planned_tons: number | string | null;
  capacity_tons: number | string | null;
  estimated_cost: number | string | null;
  status: string | null;
};

type LoadState = {
  loading: boolean;
  saving: boolean;
  error: string;
  message: string;
  parcel: Row | null;
  trucks: TruckAsset[];
  plan: TransportPlan | null;
  lines: PlanLine[];
};

function num(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function txt(value: unknown, fallback = "Not captured") {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function money(value: number) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
  })}`;
}

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stageLabel(stage: string) {
  if (stage === "raw_feedstock") return "Raw Feedstock";

  if (stage === "intermediate_concentrate" || stage === "saleable_product") {
    return "Intermediate / Saleable Product";
  }

  if (stage === "finished_product") return "Finished Product";

  return stage || "Not captured";
}

function isActiveTruck(status: string) {
  return ["available", "assigned", "in_trip"].includes(status);
}

function isOwnedLike(ownershipType: string) {
  return ["owned", "leased", "hired"].includes(ownershipType);
}

function getParcelModel(parcel: Row | null) {
  if (!parcel) {
    return {
      parcelCode: PARCEL_CODE,
      commodityClass: "Not captured",
      category: "Not captured",
      resource: "Not captured",
      material: "Not captured",
      stage: "Not captured",
      productQty: 0,
      routeQty: 0,
      effectivePrice: 0,
      routeCost: 0,
    };
  }

  const productQty = num(
    parcel.expected_concentrate_tons,
    num(parcel.accepted_tons, 0)
  );

  const routeQty = num(parcel.feedstock_tons, productQty);

  const marketPrice = num(parcel.market_reference_price_per_ton, 0);
  const negotiatedPrice = num(parcel.negotiated_price_per_ton, 0);
  const effectivePrice = num(
    parcel.effective_price_per_ton,
    negotiatedPrice > 0 ? negotiatedPrice : marketPrice
  );

  const acquisitionTotal = routeQty * num(parcel.feedstock_cost_per_ton, 0);
  const logisticsTotal = routeQty * num(parcel.transport_to_plant_cost_per_ton, 0);
  const processingTotal = routeQty * num(parcel.tolling_cost_per_ton, 0);
  const verificationCost = num(parcel.estimated_total_assay_cost, 0);

  return {
    parcelCode: txt(parcel.parcel_code, PARCEL_CODE),
    commodityClass: txt(parcel.commodity_class),
    category: txt(parcel.resource_category),
    resource: txt(parcel.resource_type),
    material: txt(parcel.material_type),
    stage: txt(parcel.material_stage),
    productQty,
    routeQty,
    effectivePrice,
    routeCost: acquisitionTotal + logisticsTotal + processingTotal + verificationCost,
  };
}

function Card({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d7ad32]">
        {label}
      </p>

      <h2 className="mt-2 text-xl font-black leading-tight text-white">
        {title}
      </h2>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  gold,
  danger,
}: {
  label: string;
  value: string;
  note?: string;
  gold?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>

      <p
        className={
          danger
            ? "mt-2 text-xl font-black text-red-200"
            : gold
            ? "mt-2 text-xl font-black text-[#f5d778]"
            : "mt-2 text-xl font-black text-white"
        }
      >
        {value}
      </p>

      {note ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
}) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>

      <input
        value={String(value)}
        inputMode="decimal"
        onChange={(event) => onChange(num(event.target.value, 0))}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-xl font-black text-white outline-none focus:border-[#d7ad32]"
      />

      {help ? (
        <span className="mt-2 block text-sm leading-6 text-slate-400">
          {help}
        </span>
      ) : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base font-bold text-white outline-none focus:border-[#d7ad32]"
      />

      {help ? (
        <span className="mt-2 block text-sm leading-6 text-slate-400">
          {help}
        </span>
      ) : null}
    </label>
  );
}

function LineCard({ line }: { line: PlanLine }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {titleCase(txt(line.transport_mode, "unknown"))} line
      </p>

      <h3 className="mt-2 text-lg font-black text-white">
        {txt(line.line_label, "Transport line")}
      </h3>

      <div className="mt-4 grid gap-3">
        <Stat
          label="Planned Tons"
          value={`${num(line.planned_tons).toFixed(0)} tons`}
          gold={num(line.planned_tons) > 0}
        />

        <Stat
          label="Capacity"
          value={`${num(line.capacity_tons).toFixed(0)} tons`}
        />

        <Stat label="Planned Loads" value={num(line.planned_loads).toFixed(0)} />
        <Stat label="Estimated Cost" value={money(num(line.estimated_cost))} />
        <Stat label="Status" value={titleCase(txt(line.status, "planned"))} />
      </div>
    </article>
  );
}

export default function TransportPlanPage() {
  const supabase = createClient() as any;

  const [state, setState] = useState<LoadState>({
    loading: true,
    saving: false,
    error: "",
    message: "",
    parcel: null,
    trucks: [],
    plan: null,
    lines: [],
  });

  const parcelModel = getParcelModel(state.parcel);

  const fleet = useMemo(() => {
    const activeTrucks = state.trucks.filter((truck) => {
      const status = txt(truck.status, "");
      const ownershipType = txt(truck.ownership_type, "");
      return isActiveTruck(status) && isOwnedLike(ownershipType);
    });

    const activeCapacity = activeTrucks.reduce((total, truck) => {
      return total + num(truck.capacity_tons, 0);
    }, 0);

    return {
      activeTrucks,
      activeTruckCount: activeTrucks.length,
      activeCapacity,
    };
  }, [state.trucks]);

  const defaultRequiredTons = parcelModel.routeQty > 0 ? parcelModel.routeQty : 0;

  const [form, setForm] = useState({
    requiredTons: 0,
    plannedOwnedTons: 0,
    plannedOutsourcedTons: 0,
    planningNote: "",
  });

  useEffect(() => {
    async function loadData() {
      setState((current) => ({ ...current, loading: true, error: "", message: "" }));

      const [parcelRes, trucksRes, planRes] = await Promise.all([
        supabase.from("parcels").select("*").eq("parcel_code", PARCEL_CODE).single(),
        supabase
          .from("truck_assets")
          .select("id, truck_code, truck_type, capacity_tons, ownership_type, status")
          .order("truck_code", { ascending: true }),
        supabase
          .from("transport_plan")
          .select("*")
          .eq("plan_code", PLAN_CODE)
          .maybeSingle(),
      ]);

      if (parcelRes.error) {
        setState((current) => ({ ...current, loading: false, error: parcelRes.error.message }));
        return;
      }

      if (trucksRes.error) {
        setState((current) => ({ ...current, loading: false, error: trucksRes.error.message }));
        return;
      }

      let lines: PlanLine[] = [];

      if (planRes.data?.id) {
        const lineRes = await supabase
          .from("transport_plan_lines")
          .select("*")
          .eq("transport_plan_id", planRes.data.id)
          .order("transport_mode", { ascending: true });

        if (lineRes.error) {
          setState((current) => ({ ...current, loading: false, error: lineRes.error.message }));
          return;
        }

        lines = (lineRes.data || []) as PlanLine[];
      }

      setState((current) => ({
        ...current,
        loading: false,
        parcel: (parcelRes.data || null) as Row | null,
        trucks: (trucksRes.data || []) as TruckAsset[],
        plan: (planRes.data || null) as TransportPlan | null,
        lines,
      }));
    }

    loadData();
  }, [supabase]);

  useEffect(() => {
    const plan = state.plan;

    if (plan) {
      setForm({
        requiredTons: num(plan.required_daily_tons, defaultRequiredTons),
        plannedOwnedTons: num(plan.planned_owned_tons, Math.min(fleet.activeCapacity, defaultRequiredTons)),
        plannedOutsourcedTons: num(plan.planned_outsourced_tons, Math.max(defaultRequiredTons - fleet.activeCapacity, 0)),
        planningNote: txt(plan.planning_note, ""),
      });
      return;
    }

    if (!state.loading && state.parcel) {
      const owned = Math.min(fleet.activeCapacity, defaultRequiredTons);
      const outsourced = Math.max(defaultRequiredTons - owned, 0);

      setForm({
        requiredTons: defaultRequiredTons,
        plannedOwnedTons: owned,
        plannedOutsourcedTons: outsourced,
        planningNote:
          "Initial mixed transport plan. Owned fleet capacity is read dynamically from truck_assets. Outsourced capacity covers the balance.",
      });
    }
  }, [state.loading, state.parcel, state.plan, fleet.activeCapacity, defaultRequiredTons]);

  const plannedTotal = form.plannedOwnedTons + form.plannedOutsourcedTons;
  const capacityGap = Math.max(form.requiredTons - plannedTotal, 0);
  const ownedOverCapacity = Math.max(form.plannedOwnedTons - fleet.activeCapacity, 0);
  const outsourcedRequired = Math.max(form.requiredTons - Math.min(form.plannedOwnedTons, fleet.activeCapacity), 0);
  const planStatus = capacityGap > 0 || ownedOverCapacity > 0 ? "blocked" : form.requiredTons > 0 ? "planned" : "draft";

  async function savePlan() {
    setState((current) => ({ ...current, saving: true, error: "", message: "" }));

    const payload: any = {
      plan_code: PLAN_CODE,
      parcel_code: PARCEL_CODE,
      route_name: `${parcelModel.resource} ${parcelModel.material} route`,
      commodity_class: parcelModel.commodityClass,
      resource_category: parcelModel.category,
      resource_type: parcelModel.resource,
      material_type: parcelModel.material,
      material_stage: parcelModel.stage,
      route_quantity: parcelModel.routeQty,
      required_daily_tons: form.requiredTons,
      planned_owned_tons: form.plannedOwnedTons,
      planned_outsourced_tons: form.plannedOutsourcedTons,
      planned_total_tons: plannedTotal,
      owned_capacity_available_tons: fleet.activeCapacity,
      outsourced_capacity_required_tons: outsourcedRequired,
      planning_note: form.planningNote,
      status: planStatus,
      updated_at: new Date().toISOString(),
    };

    const { data: planData, error: planError } = await supabase
      .from("transport_plan")
      .upsert(payload, { onConflict: "plan_code" })
      .select("*")
      .single();

    if (planError) {
      setState((current) => ({ ...current, saving: false, error: planError.message }));
      return;
    }

    const planId = planData.id as string;

    const deleteRes = await supabase
      .from("transport_plan_lines")
      .delete()
      .eq("transport_plan_id", planId);

    if (deleteRes.error) {
      setState((current) => ({ ...current, saving: false, error: deleteRes.error.message }));
      return;
    }

    const linePayloads: any[] = [
      {
        transport_plan_id: planId,
        parcel_code: PARCEL_CODE,
        transport_mode: "owned",
        line_label: "SAR owned / controlled fleet capacity",
        planned_loads: fleet.activeCapacity > 0 ? Math.ceil(form.plannedOwnedTons / Math.max(fleet.activeCapacity, 1)) : 0,
        planned_tons: form.plannedOwnedTons,
        capacity_tons: fleet.activeCapacity,
        estimated_cost: 0,
        status: form.plannedOwnedTons > 0 ? "planned" : "cancelled",
        notes: `${fleet.activeTruckCount} active owned/leased/hired truck records available.`,
      },
      {
        transport_plan_id: planId,
        parcel_code: PARCEL_CODE,
        transport_mode: "outsourced",
        line_label: "Outsourced transporter balance",
        planned_loads: form.plannedOutsourcedTons > 0 ? Math.ceil(form.plannedOutsourcedTons / 34) : 0,
        planned_tons: form.plannedOutsourcedTons,
        capacity_tons: form.plannedOutsourcedTons,
        estimated_cost: 0,
        status: form.plannedOutsourcedTons > 0 ? "planned" : "cancelled",
        notes: "External transporter capacity required for the balance of the route.",
      },
    ];

    const insertRes = await supabase
      .from("transport_plan_lines")
      .insert(linePayloads)
      .select("*");

    if (insertRes.error) {
      setState((current) => ({ ...current, saving: false, error: insertRes.error.message }));
      return;
    }

    setState((current) => ({
      ...current,
      saving: false,
      message: "Transport plan saved successfully.",
      plan: planData as TransportPlan,
      lines: (insertRes.data || []) as PlanLine[],
    }));
  }

  if (state.loading) {
    return (
      <ResourceShell title="Transport Plan" subtitle="Reading parcel and fleet capacity.">
        <Card label="Loading" title="Reading transport planning data...">
          <p className="text-sm leading-6 text-slate-400">
            Loading parcel, truck assets and saved transport plan records.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error) {
    return (
      <ResourceShell title="Transport Plan" subtitle="Transport planning could not load.">
        <Card label="Exception" title="Transport plan error">
          <p className="text-sm leading-6 text-red-200">{state.error}</p>
        </Card>
      </ResourceShell>
    );
  }

  return (
    <ResourceShell title="Transport Plan" subtitle="Plan owned-fleet and outsourced transporter capacity before dispatch.">
      <Card label="Parcel Context" title="Route transport requirement">
        <div className="grid gap-3">
          <Stat label="Parcel" value={parcelModel.parcelCode} gold />
          <Stat label="Class" value={parcelModel.commodityClass} />
          <Stat label="Category" value={parcelModel.category} />
          <Stat label="Resource" value={parcelModel.resource} gold />
          <Stat label="Material" value={parcelModel.material} />
          <Stat label="Stage" value={stageLabel(parcelModel.stage)} />
          <Stat label="Route Quantity" value={`${parcelModel.routeQty.toFixed(3)} units`} gold={parcelModel.routeQty > 0} danger={parcelModel.routeQty <= 0} />
          <Stat label="Route Cost" value={parcelModel.routeCost > 0 ? money(parcelModel.routeCost) : "Not captured"} gold={parcelModel.routeCost > 0} danger={parcelModel.routeCost <= 0} />
        </div>
      </Card>

      <Card label="Owned Fleet Capacity" title="Live truck_assets capacity">
        <div className="grid gap-3">
          <Stat label="Active Truck Records" value={String(fleet.activeTruckCount)} gold={fleet.activeTruckCount > 0} danger={fleet.activeTruckCount === 0} note="Available, assigned and in-trip owned/leased/hired truck records." />
          <Stat label="Owned / Controlled Capacity" value={`${fleet.activeCapacity.toFixed(0)} tons`} gold={fleet.activeCapacity > 0} danger={fleet.activeCapacity === 0} note="Calculated dynamically from truck_assets. No fixed truck count." />
          <Stat label="Planning Rule" value="Mixed transport" gold note="Owned fleet capacity is separated from outsourced transporter capacity." />
        </div>
      </Card>

      <Card label="Editable Transport Plan" title="Owned plus outsourced split">
        <div className="grid gap-3">
          <NumInput label="Required Route Tons" value={form.requiredTons} onChange={(value) => {
            const owned = Math.min(value, fleet.activeCapacity);
            setForm({ ...form, requiredTons: value, plannedOwnedTons: owned, plannedOutsourcedTons: Math.max(value - owned, 0) });
          }} help="For now this uses route quantity as the planning basis. Later this can become daily or weekly dispatch demand." />

          <NumInput label="Planned Owned / Controlled Fleet Tons" value={form.plannedOwnedTons} onChange={(value) => setForm({ ...form, plannedOwnedTons: value, plannedOutsourcedTons: Math.max(form.requiredTons - value, 0) })} help="Must not exceed live active capacity unless intentionally flagged." />

          <NumInput label="Planned Outsourced Transport Tons" value={form.plannedOutsourcedTons} onChange={(value) => setForm({ ...form, plannedOutsourcedTons: value })} help="External transporter capacity covering the balance of the route." />

          <TextArea label="Planning Note" value={form.planningNote} onChange={(value) => setForm({ ...form, planningNote: value })} help="Keep notes short: owned fleet assumption, outsourced balance, route risks, or dispatch remarks." />

          <button onClick={savePlan} disabled={state.saving} className="rounded-full bg-[#d7ad32] px-5 py-4 text-base font-black text-slate-950 disabled:opacity-60">
            {state.saving ? "Saving..." : "Save Transport Plan"}
          </button>

          {state.message ? (
            <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
              {state.message}
            </p>
          ) : null}
        </div>
      </Card>

      <Card label="Plan Result" title="Capacity control summary">
        <div className="grid gap-3">
          <Stat label="Required Tons" value={`${form.requiredTons.toFixed(0)} tons`} gold={form.requiredTons > 0} danger={form.requiredTons <= 0} />
          <Stat label="Planned Owned Tons" value={`${form.plannedOwnedTons.toFixed(0)} tons`} gold={form.plannedOwnedTons > 0 && ownedOverCapacity === 0} danger={ownedOverCapacity > 0} note={ownedOverCapacity > 0 ? `Owned plan exceeds live fleet capacity by ${ownedOverCapacity.toFixed(0)} tons.` : "Owned plan is within live fleet capacity."} />
          <Stat label="Planned Outsourced Tons" value={`${form.plannedOutsourcedTons.toFixed(0)} tons`} gold={form.plannedOutsourcedTons > 0} />
          <Stat label="Planned Total" value={`${plannedTotal.toFixed(0)} tons`} gold={capacityGap === 0 && plannedTotal > 0} danger={capacityGap > 0} />
          <Stat label="Capacity Gap" value={`${capacityGap.toFixed(0)} tons`} gold={capacityGap === 0} danger={capacityGap > 0} />
          <Stat label="Plan State" value={titleCase(planStatus)} gold={planStatus === "planned"} danger={planStatus === "blocked"} />
        </div>
      </Card>

      <Card label="Saved Plan Lines" title="Owned and outsourced lines">
        {state.lines.length === 0 ? (
          <p className="text-sm leading-6 text-slate-400">
            No saved transport plan lines yet. Save the plan to create owned and outsourced capacity lines.
          </p>
        ) : (
          <div className="grid gap-4">
            {state.lines.map((line) => (
              <LineCard key={line.id} line={line} />
            ))}
          </div>
        )}
      </Card>

      <Card label="Next Build" title="Dispatch comes after planning">
        <div className="grid gap-3">
          <Stat label="Next Module" value="Trip Dispatch v1" note="Create trips from transport plan lines after owned vs outsourced capacity is planned." />
          <Stat label="Do Not Touch" value="Fleet / Dashboard / Finance" danger note="This page does not change the locked fleet, dashboard, finance or route-detail files." />
        </div>
      </Card>
    </ResourceShell>
  );
}
