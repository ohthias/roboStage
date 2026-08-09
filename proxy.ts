import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rotas que não exigem onboarding concluído (a própria página de onboarding,
// assets, webhooks e a home pública, se houver).
const isPublicRoute = createRouteMatcher([
  "/",
  "/onboarding",
  "/api/webhooks(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req)) return NextResponse.next();

  // Sem sessão: deixa o Clerk cuidar do redirect para sign-in normalmente.
  if (!userId) return NextResponse.next();

  // Flag rápida guardada no publicMetadata do Clerk (evita bater no banco a
  // cada request). Ela é setada em app/onboarding/actions.ts ao final do fluxo.
  const onboardingComplete = Boolean(
    (sessionClaims?.publicMetadata as { onboardingComplete?: boolean } | undefined)
      ?.onboardingComplete
  );

  if (!onboardingComplete) {
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