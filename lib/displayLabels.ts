export function titleCaseValue(value: string | null | undefined) {
  if (!value) return "Not captured";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function stageLabel(value: string | null | undefined) {
  if (value === "raw_feedstock") return "Raw Feedstock";

  if (value === "intermediate_concentrate") {
    return "Intermediate / Saleable Product";
  }

  if (value === "finished_product") return "Finished Product";

  return titleCaseValue(value);
}

export function stateLabel(value: string | null | undefined) {
  if (!value) return "Blocked";
  return titleCaseValue(value);
      }
