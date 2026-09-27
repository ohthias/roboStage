import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rotas que não exigem autenticação ou onboarding concluído.
const publicRoutePatterns = [
  "/",
  "/about(.*)",
  "/assets(.*)",
  "/changelog(.*)",
  "/fll(.*)",
  "/help(.*)",
  "/labtest(.*)",
  "/legal(.*)",
  "/licences(.*)",
  "/news(.*)",
  "/onboarding",
  "/api/webhooks(.*)",
  "/robostage-canopy(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/showlive(.*)",
  "/sponsors(.*)",
  "/stagebook(.*)",
  "/universe(.*)",
];

const isPublicRoute = (pathname: string) =>
  publicRoutePatterns.some((pattern) => {
    if (pattern.endsWith("(.*)")) {
      return pathname.startsWith(pattern.slice(0, -4));
    }

    return pathname === pattern;
  });

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req.nextUrl.pathname)) return NextResponse.next();

  // Sem sessão: redireciona para o sign-in antes de acessar rotas protegidas.
  if (!userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Só bloqueia quando a flag existir e estiver explicitamente desativada.
  // Se o claim não vier no token ou estiver desatualizado, evita loop de redirect.
  const onboardingComplete =
    (sessionClaims?.publicMetadata as { onboardingComplete?: boolean } | undefined)
      ?.onboardingComplete;

  if (onboardingComplete === false) {
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};