import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const PUBLIC_ROUTES = [
  "/", 
  "/about", 
  "/fll-docs", 
  "/fll-score", 
  "/help",
  "/quickbrick", 
  "/universe",
  "/auth/login", 
  "/auth/signup",
];

const LOGIN_ROUTE = "/auth/login";
const DASHBOARD_ROUTE = "/dashboard";

// Checa se a rota é pública
const isPublicRoute = (path: string) =>
  PUBLIC_ROUTES.some(route => path === route || path.startsWith(route));

// Checa se a rota é privada (qualquer rota dentro de /dashboard)
const isPrivateRoute = (path: string) =>
  path.startsWith(DASHBOARD_ROUTE);

// Função auxiliar de redirecionamento
function redirect(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const path = req.nextUrl.pathname;

  const { data: { session } } = await supabase.auth.getSession();
  const publicRoute = isPublicRoute(path);
  const privateRoute = isPrivateRoute(path);
  const isAuthPage = path.startsWith("/auth");

  // Usuário não autenticado tentando acessar rota privada
  if (!session && privateRoute) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // Usuário não autenticado tentando acessar qualquer rota não pública
  if (!session && !publicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // Usuário autenticado tentando acessar login/signup
  if (session && isAuthPage) {
    return redirect(req, DASHBOARD_ROUTE);
  }

  // Rotas de evento público tipo /[code_event]/[code]
  const eventMatch = path.match(/^\/([^/]+)\/([^/]+)$/);
  if (eventMatch) {
    const [_, code_event, code] = eventMatch;
    const cookieToken = req.cookies.get("event_access")?.value;

    // Se não existe cookie, verifica na tabela public_event_lookup
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

export const config = {
  matcher: [],
};
