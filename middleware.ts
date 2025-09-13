// middleware.ts
import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const publicRoutes = [
  { path: "/join", whenAuthenticated: "redirect" },
  { path: "/about", whenAuthenticated: "next" },
  { path: "/fll-docs", whenAuthenticated: "next" },
  { path: "/fll-score", whenAuthenticated: "next" },
  { path: "/quickbrick", whenAuthenticated: "next" },
  { path: "/universe", whenAuthenticated: "next" },
  { path: "/", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/join";

// Funções auxiliares
function isPublicRoute(path: string) {
  return publicRoutes.find((route) => route.path === path);
}

function redirect(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

// Middleware principal
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const path = req.nextUrl.pathname;
  const {
    data: { session: authToken },
  } = await supabase.auth.getSession();
  const publicRoute = isPublicRoute(path);

  // 1. Sem token
  if (!authToken) {
    if (publicRoute) return res; // rota pública
    return redirect(req, REDIRECT_WHEN_NOT_AUTHENTICATED); // rota privada
  }

  // 2. Com token em rota pública
  if (publicRoute?.whenAuthenticated === "redirect") {
    return redirect(req, "/dashboard");
  }

  // 3. Dashboard (rota protegida)
  if (path.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return redirect(req, "/join");
  }

  // 4. Evento público (/:code_event/:code)
  const eventMatch = path.match(/^\/([^/]+)\/([^/]+)$/);
  if (eventMatch) {
    const [_, code_event, code] = eventMatch;
    const cookieToken = req.cookies.get("event_access")?.value;

    if (!cookieToken) {
      const { data, error } = await supabase
        .from("public_event_lookup")
        .select("id_evento")
        .eq("code_event", code_event)
        .eq("code", code)
        .maybeSingle();

      if (error || !data) return redirect(req, "/");

      res.cookies.set("event_access", `${code_event}:${code}`, {
        maxAge: 60 * 60 * 24, // 24h
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  return res;
}

export const config: MiddlewareConfig = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    "/universe",
    "/join",
  ],
};
