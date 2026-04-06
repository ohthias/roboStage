import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = true;
const MAINTENANCE_ROUTE = "/maintenance";

// rotas permitidas durante manutenção
const ALLOWED_PREFIXES = ["/api", "/fll", "/images"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // sempre permite acessar a página de manutenção
  if (pathname.startsWith(MAINTENANCE_ROUTE)) {
    return NextResponse.next();
  }

  // verifica se a rota começa com algum prefixo permitido
  const isAllowed = ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // se estiver em manutenção e NÃO for permitido → redireciona
  if (MAINTENANCE_MODE && !isAllowed) {
    const url = req.nextUrl.clone();
    url.pathname = MAINTENANCE_ROUTE;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};