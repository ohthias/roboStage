import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const path = req.nextUrl.pathname;

  const protectedPaths = ["/dashboard", "/configuracoes"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL("/join", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const eventMatch = path.match(/^\/(volunteer|visit)\/(\d+)$/);
  if (eventMatch) {
    const eventId = parseInt(eventMatch[2], 10);

    const { data, error } = await supabase
      .from("public_event_lookup")
      .select("id_evento")
      .eq("id_evento", eventId)
      .maybeSingle(); 

    if (error || !data) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/configuracoes/:path*",
    "/volunteer/:id*",
    "/visit/:id*",
  ],
};
