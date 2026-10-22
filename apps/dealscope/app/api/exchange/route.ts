import { NextResponse } from "next/server";
// No tenant, customer, buyer or SAR internal data is accessible from this unconfigured preview.
function notConfigured() {
  return NextResponse.json({ error: "Controlled Exchange is not activated. Identity, tenancy and authorisation must pass acceptance first." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
export async function GET() { return notConfigured(); }
export async function POST() { return notConfigured(); }
