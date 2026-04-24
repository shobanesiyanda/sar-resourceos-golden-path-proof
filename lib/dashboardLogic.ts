export type ControlState =
  | "approved"
  | "resolved"
  | "complete"
  | "ready"
  | "matched"
  | "in transit"
  | "pending review"
  | "held"
  | "blocked"
  | "rejected"
  | "clear";

export function s(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  const out = String(value).trim();
  return out || fallback;
}

export function lower(value: unknown, fallback = ""): string {
  return s(value, fallback).toLowerCase();
}

export function yn(value: unknown): "yes" | "no" {
  return lower(value) === "yes" ? "yes" : "no";
}

export function normalizeExceptionStatus(value: unknown): string {
  const v = lower(value, "pending review");

  if (v.includes("resolved") || v.includes("cleared")) return "resolved";
  if (v.includes("approved")) return "approved";
  if (v.includes("blocked")) return "blocked";
  if (v.includes("held") || v.includes("hold")) return "held";
  if (v.includes("pending")) return "pending review";
  if (v.includes("review")) return "pending review";
  if (v.includes("exception")) return "pending review";
  return "pending review";
}

export function normalizeDecisionStatus(value: unknown): string {
  const v = lower(value, "pending review");

  if (v.includes("approved") || v.includes("cleared")) return "approved";
  if (v.includes("blocked")) return "blocked";
  if (v.includes("held")) return "held";
  if (v.includes("rejected")) return "rejected";
  if (v.includes("pending")) return "pending review";
  if (v.includes("review")) return "pending review";
  return "pending review";
}

export function normalizeFinanceState(value: unknown): string {
  const raw = s(value, "pending review");
  const v = raw.toLowerCase();

  if (v.includes("finance_handoff_ready")) return "finance_handoff_ready";
  if (v.includes("ready_for_export")) return "ready_for_export";
  if (v.includes("approved")) return "approved";
  if (v.includes("blocked")) return "blocked";
  if (v.includes("held")) return "held";
  if (v.includes("pending")) return "pending review";
  if (v.includes("review")) return "pending review";
  return raw;
}

export function exceptionToApprovalState(
  status: unknown,
  financeAllowed: unknown
): string {
  const normalized = normalizeExceptionStatus(status);
  const finance = yn(financeAllowed);

  if (normalized === "resolved" || normalized === "approved") return "approved";
  if (normalized === "blocked") return "blocked";
  if (normalized === "held") return "held";

  if (normalized === "pending review" && finance === "no") {
    return "pending review";
  }

  return "pending review";
}

export function chipClass(value?: string): string {
  const v = lower(value);

  if (
    v.includes("approved") ||
    v.includes("resolved") ||
    v.includes("matched") ||
    v.includes("released") ||
    v.includes("delivered") ||
    v.includes("complete") ||
    v.includes("ready") ||
    v.includes("clear") ||
    v.includes("in transit") ||
    v.includes("finance_handoff_ready") ||
    v.includes("ready_for_export")
  ) {
    return "bb-chip-blue";
  }

  if (
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("awaiting") ||
    v.includes("held") ||
    v.includes("hold")
  ) {
    return "bb-chip-amber";
  }

  if (
    v.includes("blocked") ||
    v.includes("rejected") ||
    v.includes("exception") ||
    v.includes("variance") ||
    v.includes("fail")
  ) {
    return "bb-chip-red";
  }

  return "bb-chip-gold";
}

export function firstMeaningful<T>(
  items: T[],
  predicate: (item: T) => boolean
): T | undefined {
  return items.find(predicate) || items[0];
}

export type NormalizedException = {
  exceptionId: string;
  title: string;
  status: string;
  owner: string;
  financeAllowed: "yes" | "no";
  parcelId: string;
  note: string;
};

export function normalizeExceptions(raw: any[], fallbackParcelId = "PAR-CHR-2026-0001"): NormalizedException[] {
  return (raw || []).map((item: any, index: number) => ({
    exceptionId: s(item?.exceptionId, `EX-${index + 1}`),
    title: s(item?.title || item?.reason, `Operational exception ${index + 1}`),
    status: normalizeExceptionStatus(item?.status),
    owner: s(item?.owner || item?.assignedTo, "Operations"),
    financeAllowed: yn(item?.financeAllowed),
    parcelId: s(item?.parcelId, fallbackParcelId),
    note: s(item?.note || item?.comment || item?.detail, "No additional note"),
  }));
}

export function getControlSummary(rawExceptions: any[], parcelId = "PAR-CHR-2026-0001") {
  const exceptions = normalizeExceptions(rawExceptions, parcelId).filter(
    (item) => !item.parcelId || item.parcelId === parcelId
  );

  const blocked = exceptions.filter((item) => item.status === "blocked").length;
  const held = exceptions.filter((item) => item.status === "held").length;
  const pendingReview = exceptions.filter((item) => item.status === "pending review").length;
  const approvedOrResolved = exceptions.filter(
    (item) => item.status === "approved" || item.status === "resolved"
  ).length;

  const financeSensitive = exceptions.filter((item) => item.financeAllowed === "no").length;

  const hardStopFinanceBlocked = exceptions.filter(
    (item) =>
      item.financeAllowed === "no" &&
      (item.status === "blocked" || item.status === "held")
  ).length;

  const openItems = exceptions.filter(
    (item) =>
      item.status === "blocked" ||
      item.status === "held" ||
      item.status === "pending review"
  ).length;

  const leadException =
    firstMeaningful(
      exceptions,
      (item) =>
        item.status === "blocked" ||
        item.status === "held" ||
        (item.status === "pending review" && item.financeAllowed === "no") ||
        item.status === "pending review"
    ) || null;

  const masterState =
    blocked > 0 || hardStopFinanceBlocked > 0
      ? "blocked"
      : held > 0
        ? "held"
        : pendingReview > 0
          ? "pending review"
          : "approved";

  return {
    exceptions,
    leadException,
    total: exceptions.length,
    openItems,
    blocked,
    held,
    pendingReview,
    approvedOrResolved,
    financeSensitive,
    hardStopFinanceBlocked,
    masterState,
  };
}

export function buildModuleSummary(input: {
  acceptedTons: string | number;
  avgMargin?: string | number;
  routePassing?: string | number;
  readyChecks?: string | number;
  blockedChecks?: string | number;
  dispatchLoads?: string | number;
  matchedLoads?: string | number;
  financeState?: string;
  controlSummary: ReturnType<typeof getControlSummary>;
}) {
  const control = input.controlSummary;

  return {
    acceptedTons: s(input.acceptedTons, "33.9"),
    avgMargin: s(input.avgMargin, "18.9%"),
    routePassing: s(input.routePassing, "2"),
    readyChecks: s(input.readyChecks, "3"),
    blockedChecks: s(input.blockedChecks, String(control.blocked)),
    dispatchLoads: s(input.dispatchLoads, "5"),
    matchedLoads: s(input.matchedLoads, "2"),
    financeState: normalizeFinanceState(input.financeState || "finance_handoff_ready"),
    exceptionsTotal: control.total,
    exceptionsOpen: control.openItems,
    blocked: control.blocked,
    held: control.held,
    pendingReview: control.pendingReview,
    hardStopFinanceBlocked: control.hardStopFinanceBlocked,
    masterState: control.masterState,
  };
}
