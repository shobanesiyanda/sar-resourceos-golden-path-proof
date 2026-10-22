import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    service: "dealscope",
    phase: "migration-preview",
    status: "online",
    identity: "not-connected",
    trading: "disabled",
    subscriptions: "disabled",
  }, { headers: { "Cache-Control": "no-store" } });
}
