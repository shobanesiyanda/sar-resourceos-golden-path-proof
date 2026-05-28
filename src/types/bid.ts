export type ComplianceItem = {
  label: string
  status: "complete" | "warning" | "missing"
  required: boolean
}

export type BidState = {
  id: string
  rfqId: string
  rfqTitle: string
  progress: number
  stage: "draft" | "documents" | "compliance" | "pricing" | "submit"
  compliance: ComplianceItem[]
  createdAt: string
  closingDate: string | null
}

export const DEFAULT_COMPLIANCE: ComplianceItem[] = [
  { label: "Business registered", status: "complete", required: true },
  { label: "Tax compliant", status: "complete", required: true },
  { label: "BEE available", status: "warning", required: true },
  { label: "Banking verified", status: "complete", required: true },
  { label: "Director ID Copies", status: "missing", required: true },
]

export const REQUIRED_DOCUMENTS = [
  "Company Registration",
  "Tax Clearance",
  "BEE Certificate",
  "Bank Confirmation Letter",
  "Director ID Copies",
]

export function calcComplianceScore(items: ComplianceItem[]): number {
  const complete = items.filter(i => i.status === "complete").length
  return Math.round((complete / items.length) * 100)
}

export function calcFundingReadiness(items: ComplianceItem[]): number {
  const required = items.filter(i => i.required)
  const complete = required.filter(i => i.status === "complete").length
  return Math.round((complete / required.length) * 100)
}

export function getMissingTasks(items: ComplianceItem[]): string[] {
  return items
    .filter(i => i.status !== "complete")
    .map(i => i.status === "warning"
      ? `Verify ${i.label}`
      : `Upload ${i.label}`
    )
  }
