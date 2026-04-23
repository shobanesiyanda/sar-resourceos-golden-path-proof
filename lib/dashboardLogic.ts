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

  // Pending-review items stay pending unless finance is explicitly blocked.
  if (normalized === "pending review" && finance === "no") return "pending review";

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
