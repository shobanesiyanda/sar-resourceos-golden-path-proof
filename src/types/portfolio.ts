export type BidStatus = "active" | "submitted" | "won" | "lost" | "withdrawn"

export type PortfolioBid = {
  id: string
  rfqTitle: string
  category: string
  province: string
  estimatedValue: number | null
  closingDate: string | null
  status: BidStatus
  executionQuality: number
  stage: "draft" | "documents" | "compliance" | "pricing" | "submit"
  createdAt: string
}

export type PortfolioSummary = {
  totalBids: number
  activeBids: number
  totalPipelineValue: number
  avgExecutionQuality: number
  highPriorityCount: number
  submittedCount: number
}

export function calcPortfolioSummary(bids: PortfolioBid[]): PortfolioSummary {
  const active = bids.filter(b => b.status === "active")
  const submitted = bids.filter(b => b.status === "submitted")
  const totalValue = bids.reduce((sum, b) => sum + (b.estimatedValue ?? 0), 0)
  const avgQuality = bids.length > 0
    ? Math.round(bids.reduce((sum, b) => sum + b.executionQuality, 0) / bids.length)
    : 0

  const now = Date.now()
  const highPriority = active.filter(b => {
    if (!b.closingDate) return false
    const diff = Math.ceil((new Date(b.closingDate).getTime() - now) / (1000 * 60 * 60 * 24))
    return diff <= 7
  })

  return {
    totalBids: bids.length,
    activeBids: active.length,
    totalPipelineValue: totalValue,
    avgExecutionQuality: avgQuality,
    highPriorityCount: highPriority.length,
    submittedCount: submitted.length,
  }
}

export function prioritiseBids(bids: PortfolioBid[]): PortfolioBid[] {
  return [...bids].sort((a, b) => {
    // Sort by: closing date urgency first, then execution quality
    const now = Date.now()
    const daysA = a.closingDate
      ? Math.ceil((new Date(a.closingDate).getTime() - now) / (1000 * 60 * 60 * 24))
      : 999
    const daysB = b.closingDate
      ? Math.ceil((new Date(b.closingDate).getTime() - now) / (1000 * 60 * 60 * 24))
      : 999

    if (daysA !== daysB) return daysA - daysB
    return b.executionQuality - a.executionQuality
  })
  }
