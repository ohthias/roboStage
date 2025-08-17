import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL("/join", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const eventMatch = path.match(/^\/([^/]+)\/([^/]+)$/); 
  if (eventMatch) {
    const code_event = eventMatch[1];
    const code = eventMatch[2];

    const cookieToken = req.cookies.get("event_access")?.value;
    if (cookieToken) {
      // já autorizado → segue
      return res;
    }

    const { data, error } = await supabase
      .from("public_event_lookup")
      .select("id_evento")
      .eq("code_event", code_event)
      .eq("code", code)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    res.cookies.set("event_access", `${code_event}:${code}`, {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res;
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/:code_event/:code",
  ],
};
