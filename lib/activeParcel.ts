import { SupabaseClient } from "@supabase/supabase-js";

export const SEED_PARCEL_CODE = "PAR-CHR-2026-0001";

export type ActiveParcel = {
  id: string;
  parcelCode: string;
  commodityClass: string;
  category: string;
  resource: string;
  material: string;
  materialStage: string | null;

  originLocation: string;
  plantLocation: string;
  deliveryLocation: string;
  transporterName: string;
  routeNote: string;

  productQuantity: number;
  routeQuantity: number;
  expectedYieldPercent: number;

  marketReferencePrice: number;
  negotiatedPrice: number;
  effectivePrice: number;
  priceBasis: string;
  priceOverrideNote: string;

  estimatedFeedstockCost: number;
  estimatedTransportCost: number;
  estimatedTollingCost: number;
  estimatedAssayCost: number;
  estimatedRouteCost: number;
  estimatedSurplus: number;
  estimatedMarginPercent: number;
};

export type ActiveGate = {
  releaseState: string;
  releaseDecision: string;
  readinessScore: number;
  openBlockers: number;
  hardBlockers: number;
  pendingBlockers: number;

  documentsRequired: number;
  documentsComplete: number;
  documentsBlockers: number;
  documentsState: string;

  approvalsRequired: number;
  approvalsComplete: number;
  approvalsBlockers: number;
  approvalsState: string;

  counterpartiesRequired: number;
  counterpartiesComplete: number;
  counterpartiesBlockers: number;
  counterpartiesState: string;

  routesRequired: number;
  routesComplete: number;
  routesBlockers: number;
  routesState: string;

  marginState: string;
  marginBlocker: boolean;
  routeMarginPercent: number;
};

function text(
  row: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback: string
) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return fallback;
}

function num(
  row: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = 0
) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return fallback;
}

function bool(
  row: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = false
) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
  }

  return fallback;
}

function pickStage(row: Record<string, unknown> | null | undefined) {
  if (!row) return null;

  const stage = text(
    row,
    [
      "working_material_stage",
      "material_stage",
      "stage",
      "product_stage",
      "commodity_stage",
    ],
    ""
  );

  if (!stage) return null;
  return stage;
}

export async function loadActiveParcel(
  supabase: SupabaseClient
): Promise<{ parcel: ActiveParcel | null; gate: ActiveGate | null }> {
  const { data: parcelData } = await supabase
    .from("parcels")
    .select("*")
    .eq("parcel_code", SEED_PARCEL_CODE)
    .single();

  if (!parcelData) {
    return { parcel: null, gate: null };
  }

  const parcelRow = parcelData as Record<string, unknown>;

  const { data: gateData } = await supabase
    .from("release_gate_summary")
    .select("*")
    .eq("parcel_id", parcelRow.id as string)
    .single();

  const gateRow = (gateData || {}) as Record<string, unknown>;

  const productQuantity = num(parcelRow, [
    "product_quantity",
    "expected_concentrate_tons",
    "accepted_tons",
    "product_tons",
  ]);

  const routeQuantity = num(parcelRow, [
    "route_product_quantity",
    "feedstock_tons",
    "route_quantity",
  ]);

  const marketReferencePrice = num(parcelRow, [
    "market_reference_price_per_ton",
    "market_price_per_ton",
    "reference_price_per_ton",
  ]);

  const negotiatedPrice = num(parcelRow, [
    "negotiated_price_per_ton",
    "buyer_price_per_ton",
  ]);

  const effectivePrice = num(parcelRow, [
    "effective_price_per_ton",
    "expected_price_per_ton",
    "selling_price_per_ton",
  ]);

  const parcel: ActiveParcel = {
    id: text(parcelRow, ["id"], ""),
    parcelCode: text(
      parcelRow,
      ["working_parcel_code", "display_parcel_code", "parcel_code"],
      SEED_PARCEL_CODE
    ),
    commodityClass: text(
      parcelRow,
      ["working_commodity_class", "commodity_class"],
      "Hard Commodities"
    ),
    category: text(
      parcelRow,
      ["working_resource_category", "resource_category", "category"],
      "Ferrous Metals"
    ),
    resource: text(
      parcelRow,
      ["working_resource_type", "resource_type", "resource"],
      "Chrome"
    ),
    material: text(
      parcelRow,
      ["working_material_type", "material_type", "material"],
      "ROM"
    ),
    materialStage: pickStage(parcelRow),

    originLocation: text(
      parcelRow,
      ["origin_location", "loading_location"],
      "Not captured"
    ),
    plantLocation: text(
      parcelRow,
      ["plant_location", "processing_location"],
      "Not captured"
    ),
    deliveryLocation: text(
      parcelRow,
      ["delivery_location", "offtake_location"],
      "Not captured"
    ),
    transporterName: text(
      parcelRow,
      ["transporter_name", "transport_provider"],
      "Not captured"
    ),
    routeNote: text(
      parcelRow,
      ["route_note"],
      "Seed route chain for first live parcel. Plant and document gates still blocked."
    ),

    productQuantity,
    routeQuantity,
    expectedYieldPercent: num(parcelRow, ["expected_yield_percent"]),

    marketReferencePrice,
    negotiatedPrice,
    effectivePrice,
    priceBasis: text(parcelRow, ["price_basis"], "Not captured"),
    priceOverrideNote: text(
      parcelRow,
      ["price_override_note"],
      "No price note captured."
    ),

    estimatedFeedstockCost: num(parcelRow, [
      "estimated_feedstock_cost",
      "estimated_acquisition_cost",
    ]),
    estimatedTransportCost: num(parcelRow, [
      "estimated_transport_cost",
      "estimated_logistics_cost",
    ]),
    estimatedTollingCost: num(parcelRow, [
      "estimated_tolling_cost",
      "estimated_processing_cost",
    ]),
    estimatedAssayCost: num(parcelRow, [
      "estimated_total_assay_cost",
      "estimated_quality_cost",
      "total_assay_cost",
    ]),
    estimatedRouteCost: num(parcelRow, ["estimated_route_cost"]),
    estimatedSurplus: num(parcelRow, [
      "estimated_route_surplus",
      "surplus_after_assay",
    ]),
    estimatedMarginPercent: num(parcelRow, [
      "estimated_route_margin_percent",
      "route_margin_percent",
    ]),
  };

  const gate: ActiveGate = {
    releaseState: text(gateRow, ["release_state"], "Blocked"),
    releaseDecision: text(
      gateRow,
      ["release_decision"],
      "Hold / Gates Blocked"
    ),
    readinessScore: num(gateRow, ["readiness_score"]),
    openBlockers: num(gateRow, ["open_blockers"]),
    hardBlockers: num(gateRow, ["hard_blockers"]),
    pendingBlockers: num(gateRow, ["pending_blockers"]),

    documentsRequired: num(gateRow, ["documents_required"]),
    documentsComplete: num(gateRow, ["documents_complete"]),
    documentsBlockers: num(gateRow, ["documents_blockers"]),
    documentsState: text(gateRow, ["documents_state"], "Blocked"),

    approvalsRequired: num(gateRow, ["approvals_required"]),
    approvalsComplete: num(gateRow, ["approvals_complete"]),
    approvalsBlockers: num(gateRow, ["approvals_blockers"]),
    approvalsState: text(gateRow, ["approvals_state"], "Blocked"),

    counterpartiesRequired: num(gateRow, ["counterparties_required"]),
    counterpartiesComplete: num(gateRow, ["counterparties_complete"]),
    counterpartiesBlockers: num(gateRow, ["counterparties_blockers"]),
    counterpartiesState: text(gateRow, ["counterparties_state"], "Blocked"),

    routesRequired: num(gateRow, ["routes_required"]),
    routesComplete: num(gateRow, ["routes_complete"]),
    routesBlockers: num(gateRow, ["routes_blockers"]),
    routesState: text(gateRow, ["routes_state"], "Blocked"),

    marginState: text(gateRow, ["margin_state"], "Not captured"),
    marginBlocker: bool(gateRow, ["margin_blocker"]),
    routeMarginPercent: num(gateRow, ["route_margin_percent"]),
  };

  return { parcel, gate };
  }
