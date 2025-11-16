import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
];

const DASHBOARD_ROUTE = "/dashboard";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const path = req.nextUrl.pathname;

  // ✅ Pega a sessão do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const loggedIn = !!session?.user;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isDashboardRoute = path.startsWith(DASHBOARD_ROUTE);

  // 🔹 Usuário não autenticado tentando acessar rota privada
  if (!loggedIn && isDashboardRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // 🔹 Usuário autenticado tentando acessar login/signup
  if (loggedIn && (path === "/auth/login" || path === "/auth/signup")) {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"], // protege dashboard e evita login se já logado
};
