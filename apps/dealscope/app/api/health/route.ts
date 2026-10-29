import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    service: "dealscope",
    phase: "migration-preview",
    status: "preview_only",
    readiness: "not_ready",
    contract_terms: "draft_only",
    assessment_delivery: "disabled",
    checkout: "disabled",
    identity: "not-connected",
    trading: "disabled",
    subscriptions: "disabled",
  }, { headers: { "Cache-Control": "no-store" } });
}
