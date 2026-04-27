// Logout route redirects to login after client/session cleanup.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/login?logout=1", request.url);
  return NextResponse.redirect(url);
}
