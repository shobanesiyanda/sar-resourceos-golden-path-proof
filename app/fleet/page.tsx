"use client";

import { useEffect, useMemo, useState } from "react";
import ResourceShell from "../../components/ResourceShell";
import { createClient } from "../../lib/supabase/client";

type TruckAsset = {
  id: string;
  truck_code: string;
  registration_number: string | null;
  truck_type: string | null;
  capacity_tons: number | string | null;
  ownership_type: string | null;
  status: string | null;
  current_location_note: string | null;
  odometer_reading: number | string | null;
  service_due_km: number | string | null;
  license_expiry_date: string | null;
  insurance_expiry_date: string | null;
  notes: string | null;
};

type LoadState = {
  loading: boolean;
  error: string;
  trucks: TruckAsset[];
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

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) return "Not captured";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function isActiveStatus(status: string) {
  return ["available", "assigned", "in_trip"].includes(status);
}

function isOwnedLike(ownershipType: string) {
  return ["owned", "leased", "hired"].includes(ownershipType);
}

function statusTone(status: string) {
  if (status === "available") return "good";
  if (status === "assigned" || status === "in_trip") return "warn";
  if (status === "maintenance" || status === "inactive") return "danger";
  return "neutral";
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
        <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
      ) : null}
    </div>
  );
}

function StatusPill({
  value,
  tone,
}: {
  value: string;
  tone: "good" | "warn" | "danger" | "neutral";
}) {
  return (
    <span
      className={
        tone === "good"
          ? "inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200"
          : tone === "warn"
          ? "inline-flex rounded-full border border-[#d7ad32]/40 bg-[#d7ad32]/10 px-3 py-1 text-xs font-black text-[#f5d778]"
          : tone === "danger"
          ? "inline-flex rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200"
          : "inline-flex rounded-full border border-slate-600 bg-slate-800/50 px-3 py-1 text-xs font-black text-slate-200"
      }
    >
      {value}
    </span>
  );
}

function TruckCard({ truck }: { truck: TruckAsset }) {
  const status = txt(truck.status, "unknown");
  const ownershipType = txt(truck.ownership_type, "unknown");
  const capacity = num(truck.capacity_tons, 0);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Truck Asset
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {txt(truck.truck_code)}
          </h3>
          <p className="mt-1 text-sm font-bold text-slate-400">
            {txt(truck.truck_type)}
          </p>
        </div>
        <StatusPill value={titleCase(status)} tone={statusTone(status)} />
      </div>

      <div className="mt-4 grid gap-3">
        <Stat
          label="Capacity"
          value={capacity > 0 ? `${capacity.toFixed(0)} tons` : "Not captured"}
          gold={capacity > 0}
        />
        <Stat
          label="Ownership"
          value={titleCase(ownershipType)}
          gold={isOwnedLike(ownershipType)}
        />
        <Stat label="Registration" value={txt(truck.registration_number)} />
        <Stat label="Current Location" value={txt(truck.current_location_note)} />
        <Stat
          label="Odometer"
          value={
            num(truck.odometer_reading, 0) > 0
              ? `${num(truck.odometer_reading).toLocaleString("en-ZA")} km`
              : "Not captured"
          }
        />
        <Stat
          label="Service Due"
          value={
            num(truck.service_due_km, 0) > 0
              ? `${num(truck.service_due_km).toLocaleString("en-ZA")} km`
              : "Not captured"
          }
        />
        <Stat label="Licence Expiry" value={formatDate(truck.license_expiry_date)} />
        <Stat label="Insurance Expiry" value={formatDate(truck.insurance_expiry_date)} />
        <Stat label="Notes" value={txt(truck.notes)} />
      </div>
    </article>
  );
}

function calculateFleet(trucks: TruckAsset[]) {
  const totalTrucks = trucks.length;
  const available = trucks.filter((truck) => txt(truck.status, "") === "available").length;
  const assigned = trucks.filter((truck) => txt(truck.status, "") === "assigned").length;
  const inTrip = trucks.filter((truck) => txt(truck.status, "") === "in_trip").length;
  const maintenance = trucks.filter((truck) => txt(truck.status, "") === "maintenance").length;
  const inactive = trucks.filter((truck) => txt(truck.status, "") === "inactive").length;

  const activeCapacity = trucks.reduce((total, truck) => {
    const status = txt(truck.status, "");
    const ownershipType = txt(truck.ownership_type, "");
    const capacity = num(truck.capacity_tons, 0);

    if (isActiveStatus(status) && isOwnedLike(ownershipType)) {
      return total + capacity;
    }

    return total;
  }, 0);

  const ownedCount = trucks.filter((truck) => txt(truck.ownership_type, "") === "owned").length;
  const leasedCount = trucks.filter((truck) => txt(truck.ownership_type, "") === "leased").length;
  const hiredCount = trucks.filter((truck) => txt(truck.ownership_type, "") === "hired").length;

  return {
    totalTrucks,
    available,
    assigned,
    inTrip,
    maintenance,
    inactive,
    activeCapacity,
    ownedCount,
    leasedCount,
    hiredCount,
  };
}

export default function FleetPage() {
  const supabase = createClient();

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: "",
    trucks: [],
  });

  useEffect(() => {
    async function loadTrucks() {
      setState({
        loading: true,
        error: "",
        trucks: [],
      });

      const { data, error } = await supabase
        .from("truck_assets")
        .select(
          "id, truck_code, registration_number, truck_type, capacity_tons, ownership_type, status, current_location_note, odometer_reading, service_due_km, license_expiry_date, insurance_expiry_date, notes"
        )
        .order("truck_code", { ascending: true });

      if (error) {
        setState({
          loading: false,
          error: error.message,
          trucks: [],
        });
        return;
      }

      setState({
        loading: false,
        error: "",
        trucks: (data || []) as TruckAsset[],
      });
    }

    loadTrucks();
  }, [supabase]);

  const summary = useMemo(() => calculateFleet(state.trucks), [state.trucks]);

  if (state.loading) {
    return (
      <ResourceShell title="Fleet" subtitle="Reading truck assets from the live fleet register.">
        <Card label="Loading" title="Reading truck assets...">
          <p className="text-sm leading-6 text-slate-400">
            Loading fleet records from Supabase truck_assets.
          </p>
        </Card>
      </ResourceShell>
    );
  }

  if (state.error) {
    return (
      <ResourceShell title="Fleet" subtitle="Fleet control could not load.">
        <Card label="Exception" title="Truck assets unavailable">
          <p className="text-sm leading-6 text-red-200">{state.error}</p>
        </Card>
      </ResourceShell>
    );
  }

  return (
    <ResourceShell
      title="Fleet"
      subtitle="Database-driven owned, leased and hired truck control."
    >
      <Card label="Fleet Foundation" title="Truck asset register">
        <div className="grid gap-3">
          <Stat
            label="Total Truck Records"
            value={String(summary.totalTrucks)}
            gold={summary.totalTrucks > 0}
            danger={summary.totalTrucks === 0}
            note="Calculated from live truck_assets records."
          />
          <Stat
            label="Total Active Capacity"
            value={`${summary.activeCapacity.toFixed(0)} tons`}
            gold={summary.activeCapacity > 0}
            danger={summary.activeCapacity === 0}
            note="Available, assigned and in-trip owned/leased/hired trucks only."
          />
          <Stat label="Owned Trucks" value={String(summary.ownedCount)} gold={summary.ownedCount > 0} />
          <Stat label="Leased Trucks" value={String(summary.leasedCount)} />
          <Stat label="Hired Trucks" value={String(summary.hiredCount)} />
        </div>
      </Card>

      <Card label="Fleet Status" title="Live truck status counts">
        <div className="grid gap-3">
          <Stat label="Available" value={String(summary.available)} gold={summary.available > 0} />
          <Stat label="Assigned" value={String(summary.assigned)} />
          <Stat label="In Trip" value={String(summary.inTrip)} />
          <Stat label="Maintenance" value={String(summary.maintenance)} danger={summary.maintenance > 0} />
          <Stat label="Inactive" value={String(summary.inactive)} danger={summary.inactive > 0} />
        </div>
      </Card>

      <Card label="Control Rule" title="No hard-coded fleet limit">
        <div className="grid gap-3">
          <Stat
            label="Fleet Source"
            value="Supabase truck_assets"
            gold
            note="The page reads all truck records dynamically and recalculates totals from live data."
          />
          <Stat
            label="Initial Seed"
            value="SAR-TIP-001 / SAR-TIP-002"
            note="These are starting records only. They are not a system limit."
          />
          <Stat
            label="Future Capacity"
            value="Database-driven"
            gold
            note="Additional owned, leased, hired or inactive trucks can be added later as records."
          />
        </div>
      </Card>

      <Card label="Truck Register" title="Current truck assets">
        {state.trucks.length === 0 ? (
          <p className="text-sm leading-6 text-red-200">
            No truck assets are currently captured.
          </p>
        ) : (
          <div className="grid gap-4">
            {state.trucks.map((truck) => (
              <TruckCard key={truck.id} truck={truck} />
            ))}
          </div>
        )}
      </Card>

      <Card label="Next Fleet Build" title="Future dispatch control">
        <div className="grid gap-3">
          <Stat
            label="Next Table Layer"
            value="transport_plan"
            note="Will split owned truck capacity from outsourced transporter capacity for each parcel route."
          />
          <Stat
            label="Next Page"
            value="/transport-plan"
            note="Will plan owned vs outsourced daily route capacity before trip dispatch."
          />
          <Stat
            label="Do Not Build Yet"
            value="Trips / GPS / Evidence"
            danger
            note="Trip dispatch, live tracking and evidence should come after transport planning is stable."
          />
        </div>
      </Card>
    </ResourceShell>
  );
}
