import type { MetadataRoute } from "next";

import { getAllLegalDocuments } from "@/utils/institutional/legal";
import { getAllNews } from "@/utils/institutional/news";
import { COMPETICOES } from "@/utils/competitions/competicoes";

const siteUrl = "https://robostage.com.br";
const fllSeasons = ["bioglow", "unearthed", "submerged", "masterpiece"];
const timerModes = ["robot-game", "judging", "custom"];

const publicRoutes = [
  "/",
  "/showlive",
  "/about",
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
  "/legal",
  "/fll",
  "/fll/docs",
  "/fll/docs/missions-guide",
  "/fll/cheklist",
  "/fll/begins",
  "/fll/future-edition",
  "/fll/future-edition/score",
  "/fll/future-edition/rubric",
  "/fll/explore",
  "/fll/partiu-mesa",
  "/fll/quickbrick",
  "/fll/quickbrick/estrategia",
  "/fll/quickbrick/heatmap",
  "/fll/quickbrick/matriz-de-risco",
  "/fll/quickbrick/matriz-swot",
  "/fll/quickbrick/sharks-simulator",
  "/fll/quickbrick/tabela-de-missoes",
  "/fll/score",
  "/fll/recall",
  "/fll/timers",
  "/fll/flash-qa",
];

function toSitemapUrl(pathname: string) {
  return `${siteUrl}${pathname}`;
}

function sanitizeNewsSlug(slug: unknown) {
  if (typeof slug !== "string") return "";

  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validDate(value: unknown) {
  if (!value) return undefined;

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const competitionRoutes = Object.keys(COMPETICOES).flatMap((competition) => [
    `/${competition}`,
    `/${competition}/docs`,
    `/${competition}/docs/missions-guide`,
    `/${competition}/cheklist`,
    `/${competition}/begins`,
    `/${competition}/future-edition`,
    `/${competition}/future-edition/score`,
    `/${competition}/future-edition/rubric`,
    `/${competition}/explore`,
    `/${competition}/partiu-mesa`,
    `/${competition}/quickbrick`,
    `/${competition}/quickbrick/estrategia`,
    `/${competition}/quickbrick/heatmap`,
    `/${competition}/quickbrick/matriz-de-risco`,
    `/${competition}/quickbrick/matriz-swot`,
    `/${competition}/quickbrick/sharks-simulator`,
    `/${competition}/quickbrick/tabela-de-missoes`,
    `/${competition}/score`,
    `/${competition}/recall`,
    `/${competition}/timers`,
    `/${competition}/flash-qa`,
  ]);

  const seasonRoutes = Object.keys(COMPETICOES).flatMap((competition) =>
    fllSeasons.flatMap((season) => [
      `/${competition}/score/${season}`,
      `/${competition}/quickbrick/matriz-swot/${season}`,
      `/${competition}/quickbrick/tabela-de-missoes/${season}`,
    ]),
  );

  const timerRoutes = Object.keys(COMPETICOES).flatMap((competition) =>
    timerModes.map((mode) => `/${competition}/timers/${mode}`),
  );

  const staticEntries = [
    ...publicRoutes,
    ...competitionRoutes,
    ...seasonRoutes,
    ...timerRoutes,
  ].map((pathname) => ({
    url: toSitemapUrl(pathname),
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : 0.7,
  }) satisfies MetadataRoute.Sitemap[number]);

  const newsEntries = (getAllNews() as Array<Record<string, unknown>>).flatMap(
    (article) => {
      if (article.draft) return [];

      const slug = sanitizeNewsSlug(article.slug);

      if (!slug) return [];

      return [
        {
          url: toSitemapUrl(`/news/${encodeURIComponent(slug)}`),
          lastModified: validDate(article.date),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        } satisfies MetadataRoute.Sitemap[number],
      ];
    },
  );

  const legalEntries = (await getAllLegalDocuments()).map(({ slug }) => ({
    url: toSitemapUrl(`/legal/${encodeURIComponent(slug)}`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }) satisfies MetadataRoute.Sitemap[number]);

  return [...staticEntries, ...newsEntries, ...legalEntries];
}