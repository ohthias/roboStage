import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que não exigem autenticação ou onboarding concluído.
const publicRoutePatterns = [
  "/",
  "/about(.*)",
  "/assets(.*)",
  "/changelog(.*)",
  "/fll(.*)",
  "/ftc(.*)",
  "/obr(.*)",
  "/help(.*)",
  "/labtest(.*)",
  "/equipe(.*)",
  "/legal(.*)",
  "/licences(.*)",
  "/news(.*)",
  "/bastidores(.*)",
  "/onboarding",
  "/api/data/missions(.*)",
  "/api/data/fllDocs(.*)",
  "/api/data/obrDocs(.*)",
  "/api/data/ftcDocs(.*)",
  // Proxy com cache para a API pública da FTCScout (Scouting FTC).
  "/api/data/ftcscout(.*)",
  "/api/data/toolsAbout(.*)",
  "/api/webhooks(.*)",
  "/api/revalidate(.*)",
  "/data/_file(.*)",
  "/roboticar(.*)",
  "/anatix(.*)",
  "/robostage-canopy(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/showlive(.*)",
  "/sponsors(.*)",
  "/stagebook(.*)",
  "/universe(.*)",
];

const AFTER_AUTH_PATH = "/dashboard";
const ONBOARDING_PATH = "/onboarding";
const SIGN_IN_PATH = "/sign-in";

const matchesPattern = (pathname: string, pattern: string) => {
  if (pattern.endsWith("(.*)")) {
    const basePath = pattern.slice(0, -4);
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  }
  return pathname === pattern;
};

const isPublicRoute = (pathname: string) =>
  publicRoutePatterns.some((pattern) => matchesPattern(pathname, pattern));

const isAuthPage = (pathname: string) =>
  matchesPattern(pathname, "/sign-in(.*)") ||
  matchesPattern(pathname, "/sign-up(.*)");

const redirectTo = (req: NextRequest, pathname: string) => {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
};

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname, search } = req.nextUrl;

  const isApi = pathname.startsWith("/api/");
  const isNavigation = req.method === "GET" || req.method === "HEAD";

  // Requer no painel do Clerk (Sessions → Customize session token):
  // { "publicMetadata": "{{user.public_metadata}}" }
  // Só é tratado como "pendente" quando a flag é explicitamente false
  // (gravada no webhook user.created). Claim ausente não bloqueia,
  // evitando loop de redirect com token desatualizado.
  const onboardingComplete = (
    sessionClaims?.publicMetadata as
      | { onboardingComplete?: boolean }
      | undefined
  )?.onboardingComplete;
  const onboardingPending = onboardingComplete === false;

  // Usuário logado: ajusta destinos antes da checagem de rota pública.
  if (userId && isNavigation && !isApi) {
    // Já logado tentando abrir login/cadastro → manda para o destino certo.
    if (isAuthPage(pathname)) {
      return redirectTo(req, onboardingPending ? ONBOARDING_PATH : AFTER_AUTH_PATH);
    }

    // Onboarding já concluído → não deixa voltar ao /onboarding.
    if (pathname === ONBOARDING_PATH && onboardingComplete === true) {
      return redirectTo(req, AFTER_AUTH_PATH);
    }
  }

  if (isPublicRoute(pathname)) return NextResponse.next();

  // Sem sessão: redireciona para o sign-in antes de acessar rotas protegidas.
  if (!userId) {
    // Redirect só funciona para navegação (GET/HEAD). Em /api/* e em POSTs
    // (Server Actions, fetch com method POST) o 307 preserva o método e
    // manda um POST para /sign-in, que é uma página -> 405 Method Not Allowed.
    // Nesses casos devolvemos 401 em JSON para o cliente tratar.
    if (isApi || !isNavigation) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = SIGN_IN_PATH;
    url.search = "";
    url.searchParams.set("redirect_url", pathname + search);
    return NextResponse.redirect(url);
  }

  // Logado, mas com onboarding pendente.
  if (onboardingPending) {
    if (isApi || !isNavigation) {
      return NextResponse.json(
        { error: "Onboarding pendente" },
        { status: 403 },
      );
    }
    return redirectTo(req, ONBOARDING_PATH);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Ignora internos do Next.js e arquivos estáticos (por extensão).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre roda para rotas de API.
    "/(api|trpc)(.*)",
  ],
};