/**
 * Lista ÚNICA das rotas públicas do site. O `sitemap.ts` e o `proxy.ts` (Clerk)
 * derivam daqui, e cada competição registrada em `COMPETICOES` fica pública
 * automaticamente — antes eram três listas que divergiam (sitemap com URLs 404,
 * competição nova bloqueada pelo login).
 *
 * Sem dependências de servidor: o `proxy.ts` roda no edge.
 */
import { COMPETICOES } from "./competicoes";

export type Competicao = keyof typeof COMPETICOES;

export const COMPETITION_KEYS = Object.keys(COMPETICOES) as Competicao[];

/** Páginas institucionais, fora das competições (entram no sitemap). */
export const SITE_PAGES = [
  "/",
  "/about",
  "/anatix",
  "/assets",
  "/changelog",
  "/help",
  "/labtest",
  "/legal",
  "/licences",
  "/news",
  "/robostage-canopy",
  "/roboticar",
  "/showlive",
  "/sponsors",
  "/stagebook",
  "/universe",
] as const;

/** Temporadas com pontuador próprio (`/fll/score/{season}`). */
export const FLL_SCORE_SEASONS = ["bioglow", "unearthed", "submerged", "masterpiece"] as const;

/** Temporadas das ferramentas sazonais do QuickBrick (SWOT, tabela de missões). */
export const FLL_QUICKBRICK_SEASONS = ["bioglow", "unearthed", "submerged"] as const;

const fllSeasonal = (base: string, seasons: readonly string[]) =>
  seasons.map((season) => `${base}/${season}`);

/**
 * Páginas de cada competição, relativas a `/{competicao}` ("" é a home).
 * Só entra aqui o que a página realmente aceita para aquela competição:
 * Future Edition e as páginas de iniciantes são só da FLL; Bastidores, só da
 * OBR; os timers seguem `TIMERS_BY_COMPETITION`.
 */
export const COMPETITION_PAGES: Record<Competicao, readonly string[]> = {
  fll: [
    "",
    "docs",
    "docs/missions-guide",
    "begins",
    "explore",
    "empathy-map",
    "rubric",
    "cheklist",
    "partiu-mesa",
    "recall",
    "future-edition",
    "future-edition/score",
    "future-edition/rubric",
    "timers",
    "timers/robot-game",
    "timers/judging",
    "timers/custom",
    "score",
    ...fllSeasonal("score", FLL_SCORE_SEASONS),
    "quickbrick",
    "quickbrick/estrategia",
    "quickbrick/heatmap",
    "quickbrick/sharks-simulator",
    "quickbrick/matriz-de-risco",
    "quickbrick/matriz-swot",
    ...fllSeasonal("quickbrick/matriz-swot", FLL_QUICKBRICK_SEASONS),
    "quickbrick/tabela-de-missoes",
    ...fllSeasonal("quickbrick/tabela-de-missoes", FLL_QUICKBRICK_SEASONS),
  ],
  obr: [
    "",
    "docs",
    "bastidores",
    "cheklist",
    "recall",
    "timers",
    "timers/round",
    "timers/custom",
    "score",
    "quickbrick",
    "quickbrick/criador-de-arenas",
    "quickbrick/mapa-de-palco",
    "quickbrick/matriz-de-risco",
    "quickbrick/matriz-swot",
  ],
};

/** Todas as URLs estáticas públicas, para o sitemap. */
export function publicSitemapPaths(): string[] {
  return [
    ...SITE_PAGES,
    ...COMPETITION_KEYS.flatMap((competition) =>
      COMPETITION_PAGES[competition].map((page) =>
        page ? `/${competition}/${page}` : `/${competition}`,
      ),
    ),
  ];
}

/**
 * Prefixos que não exigem login (`proxy.ts`). Cada item libera o caminho
 * exato e tudo abaixo dele; `exact` libera só o caminho exato.
 */
export const PUBLIC_PREFIXES: readonly string[] = [
  ...SITE_PAGES.filter((page) => page !== "/"),
  ...COMPETITION_KEYS.map((competition) => `/${competition}`),
  "/sign-in",
  "/sign-up",
  "/api/data",
  "/api/legal",
  "/api/webhooks",
];

export const PUBLIC_EXACT: readonly string[] = ["/", "/onboarding"];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
