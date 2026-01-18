import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset",
];

const DASHBOARD_ROUTE = "/dashboard";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  if(PUBLIC_ROUTES.includes(req.nextUrl.pathname)){
    return res;
  }

  const supabase = createMiddlewareClient({ req, res });
  const path = req.nextUrl.pathname;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const loggedIn = !!session?.user;
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
