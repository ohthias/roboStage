import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = false;
const MAINTENANCE_ROUTE = "/maintenance";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permite acessar a página de manutenção
  if (pathname.startsWith(MAINTENANCE_ROUTE)) {
    return NextResponse.next();
  }

  if (MAINTENANCE_MODE) {
    const url = req.nextUrl.clone();
    url.pathname = MAINTENANCE_ROUTE;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};