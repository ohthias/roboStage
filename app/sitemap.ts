import type { MetadataRoute } from "next";

import { getAllLegalDocuments } from "@/utils/institutional/legal";
import { getPublishedNews, newsHref } from "@/utils/institutional/news";
import { NAVIGATION } from "@/utils/competitions/navigation";
import { TIMERS_BY_COMPETITION } from "@/app/(public)/[competicao]/timers/config";
import { SITE_URL } from "@/utils/competitions/site";

type Entry = MetadataRoute.Sitemap[number];
type Competition = keyof typeof NAVIGATION;

/** Páginas institucionais (fora das competições). */
const INSTITUTIONAL_ROUTES = [
  "/about",
  "/anatix",
  "/roboticar",
  "/news",
  "/help",
  "/universe",
  "/robostage-canopy",
  "/changelog",
  "/assets",
  "/licences",
  "/sponsors",
  "/stagebook",
  "/labtest",
  "/showlive",
  "/legal",
];

/**
 * Ferramentas do QuickBrick por competição (espelha `ferramentasPorCompeticao`
 * em components/QuickBrick/ferramentas.data.tsx). Cada competição só lista as
 * ferramentas que de fato oferece.
 */
const QUICKBRICK_TOOLS: Record<Competition, string[]> = {
  fll: [
    "estrategia",
    "heatmap",
    "sharks-simulator",
    "matriz-de-risco",
    "matriz-swot",
    "tabela-de-missoes",
  ],
  obr: ["criador-de-arenas", "mapa-de-palco", "matriz-de-risco", "matriz-swot"],
};

/** Rotas por temporada (só a FLL tem temporadas). */
const SEASON_TOOLS = ["score", "quickbrick/matriz-swot", "quickbrick/tabela-de-missoes"];

/**
 * Links do menu que ainda não têm página (geravam 404 no sitemap).
 * Remova daqui quando a página existir.
 */
const MISSING_PAGES = new Set(["/fll/docs/missions-guide"]);

/** Páginas exclusivas da FLL que não estão no menu. */
const FLL_EXTRA_ROUTES = ["/fll/future-edition/score", "/fll/future-edition/rubric"];

function competitionRoutes(competition: Competition): string[] {
  const nav = NAVIGATION[competition];
  const base = `/${competition}`;

  const fromNav = [
    nav.scorePath,
    ...nav.options.map((o) => o.path),
    ...nav.menus.flatMap((m) => m.items.map((i) => i.path)),
  ].map((p) => `${base}/${p}`);

  const quickbrick = QUICKBRICK_TOOLS[competition].map((t) => `${base}/quickbrick/${t}`);

  const timers = (TIMERS_BY_COMPETITION[competition] ?? []).map((t) => `${base}/timers/${t.slug}`);

  const seasons =
    "seasons" in nav
      ? nav.seasons.flatMap((s) => SEASON_TOOLS.map((tool) => `${base}/${tool}/${s.key}`))
      : [];

  const extras = competition === "fll" ? FLL_EXTRA_ROUTES : [];

  return [base, ...fromNav, ...quickbrick, ...timers, ...seasons, ...extras];
}

/** Prioridade por profundidade: hubs pesam mais que páginas internas. */
function priorityFor(pathname: string): number {
  if (pathname === "/") return 1;
  const depth = pathname.split("/").filter(Boolean).length;
  if (depth === 1) return 0.9;
  if (depth === 2) return 0.7;
  return 0.5;
}

function toEntry(pathname: string, overrides: Partial<Entry> = {}): Entry {
  return {
    url: `${SITE_URL}${pathname === "/" ? "" : pathname}`,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: priorityFor(pathname),
    ...overrides,
  };
}

function validDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  // Datas "AAAA-MM-DD" do frontmatter: meio-dia evita voltar um dia por fuso.
  const raw = String(value);
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = getPublishedNews();
  const latestNewsDate = news.map((n) => validDate(n.date)).find(Boolean);

  // Set elimina duplicatas (a lista antiga repetia todas as rotas da FLL).
  const staticPaths = [
    ...new Set([
      "/",
      ...INSTITUTIONAL_ROUTES,
      ...(Object.keys(NAVIGATION) as Competition[]).flatMap(competitionRoutes),
    ]),
  ].filter((p) => !MISSING_PAGES.has(p));

  const staticEntries = staticPaths.map((pathname) =>
    toEntry(
      pathname,
      pathname === "/news" && latestNewsDate ? { lastModified: latestNewsDate, changeFrequency: "daily" } : {},
    ),
  );

  const newsEntries = news.flatMap((article) => {
    const href = newsHref(article.slug);
    if (href === "/news") return [];
    return [
      toEntry(href, {
        lastModified: validDate(article.date),
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ];
  });

  const legalEntries = (await getAllLegalDocuments()).map(({ slug }) =>
    toEntry(`/legal/${encodeURIComponent(slug)}`, { changeFrequency: "yearly", priority: 0.3 }),
  );

  return [...staticEntries, ...newsEntries, ...legalEntries];
}
