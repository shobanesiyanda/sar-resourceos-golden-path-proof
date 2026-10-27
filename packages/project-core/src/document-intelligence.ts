/** Pure source-evidence gate between external document extraction and project simulation.
 * No OCR, AI inference, identity attestation or project execution is performed here. */
import type { Requirement } from "./simulation";
export type ProjectDocument = {
  id: string; version: string; sha256: string;
  confidentiality: "sar_internal" | "third_party_confidential";
};
export type ExtractedRequirement = Omit<Requirement, "verified"> & {
  documentVersion: string;
  reviewState: "extracted" | "reviewed" | "rejected";
  reviewerId?: string;
  reviewEventId?: string;
};
export type ExtractionBatch = {
  projectId: string;
  documents: ProjectDocument[];
  facts: ExtractedRequirement[];
};
export type ExtractionResult = {
  state: "incomplete" | "review_ready";
  issues: string[];
  requirements: Requirement[];
  sourceIds: string[];
};
const present = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const nonnegative = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const categories = new Set(["material", "machinery", "hire", "transport", "contractor", "service"]);
export function compileExtractedProject(batch: ExtractionBatch): ExtractionResult {
  const issues: string[] = [];
  const requirements: Requirement[] = [];
  const sourceIds: string[] = [];
  if (!present(batch?.projectId) || !Array.isArray(batch.documents) || !batch.documents.length ||
      !Array.isArray(batch.facts) || !batch.facts.length)
    return { state: "incomplete", issues: ["Project, original documents and extracted facts required"], requirements, sourceIds };
  const docs = new Map<string, ProjectDocument>();
  for (const d of batch.documents) {
    if (!d || !present(d.id) || !present(d.version) ||
        !/^[a-fA-F0-9]{64}$/.test(d.sha256 || "") ||
        !["sar_internal", "third_party_confidential"].includes(d.confidentiality) ||
        docs.has(d.id)) issues.push("Invalid or duplicate document identity/hash");
    else docs.set(d.id, d);
  }
  const seen = new Set<string>();
  for (const f of batch.facts) {
    if (!f || !present(f.id) || seen.has(f.id)) { issues.push("Missing or duplicate extracted requirement ID"); continue; }
    seen.add(f.id);
    const d = docs.get(f.documentId);
    const linked = !!d && d.version === f.documentVersion;
    if (!linked || !present(f.sourceLocator)) issues.push(f.id + ": document version/source locator mismatch");
    if (!present(f.title) || !present(f.unit) || !categories.has(f.category) ||
        !nonnegative(f.quantity) || f.quantity <= 0 ||
        (f.unitCost !== null && !nonnegative(f.unitCost)) ||
        !Number.isSafeInteger(f.durationDays) || f.durationDays < 0 ||
        !Number.isSafeInteger(f.leadDays) || f.leadDays < 0 || !Array.isArray(f.predecessors))
      issues.push(f.id + ": insufficient or invalid structured technical quantities");
    if (!["extracted", "reviewed", "rejected"].includes(f.reviewState)) issues.push(f.id + ": review state unknown");
    const verified = linked && f.reviewState === "reviewed" && present(f.reviewerId) && present(f.reviewEventId);
    if (!verified) issues.push(f.id + ": technical evidence awaits authorised review");
    if (f.unitCost === null) issues.push(f.id + ": pricing missing — quotation required");
    sourceIds.push(f.documentId + ":" + f.documentVersion + ":" + f.sourceLocator);
    requirements.push({id:f.id,title:f.title,category:f.category,quantity:f.quantity,unit:f.unit,
      unitCost:f.unitCost,durationDays:f.durationDays,leadDays:f.leadDays,
      predecessors:[...(Array.isArray(f.predecessors) ? f.predecessors : [])],documentId:f.documentId,
      sourceLocator:f.sourceLocator,verified,capacityRequired:f.capacityRequired,capacityAvailable:f.capacityAvailable});
  }
  for (const r of requirements) {
    if (r.predecessors.some(id => !seen.has(id))) issues.push(r.id + ": missing dependency reference");
  }
  return { state: issues.length ? "incomplete" : "review_ready", issues, requirements, sourceIds };
}
