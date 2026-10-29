import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function publiclyAccessible(pathname: string): boolean {
  return pathname === "/login" || pathname === "/signup" ||
    pathname === "/auth/callback" || pathname.startsWith("/auth/callback/");
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Internal enterprise pages must NEVER be exposed when identity is unconfigured.
  if (!supabaseUrl || !supabaseKey) {
    if (publiclyAccessible(pathname)) return NextResponse.next({ request });
    return NextResponse.json({error:"ResourceOS identity service is not configured."},
      {status:503,headers:{"Cache-Control":"no-store"}});
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) {
        items.forEach(({name,value})=> request.cookies.set(name,value));
        response = NextResponse.next({request});
        items.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
    },
  });

  if (publiclyAccessible(pathname)) return response;
  try {
    const {data,error} = await supabase.auth.getUser();
    if (error || !data.user) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("next", pathname);
      return NextResponse.redirect(redirect, {status:307});
    }
  } catch {
    return NextResponse.json({error:"ResourceOS identity verification unavailable."},
      {status:503,headers:{"Cache-Control":"no-store"}});
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
