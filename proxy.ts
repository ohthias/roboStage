import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rotas que não exigem onboarding concluído (a própria página de onboarding,
// assets, webhooks e a home pública, se houver).
const publicRoutePatterns = [
  "/",
  "/onboarding",
  "/api/webhooks(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
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

  // Sem sessão: deixa o Clerk cuidar do redirect para sign-in normalmente.
  if (!userId) return NextResponse.next();

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