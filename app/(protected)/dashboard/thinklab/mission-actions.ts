"use server";

import { promises as fs } from "fs";
import path from "path";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { leagues, userLeagueInterests } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { resolveProfileKey, type ProfileKey } from "@/utils/stagebook/league-features";
import type { MissionPack, MissionSeason, MissionSummary } from "@/utils/thinklab/mission-cards";

/* ------------------------------------------------------------------ */
/* Fontes de dados (as mesmas usadas pelo LabTest em /api/data/missions) */
/* ------------------------------------------------------------------ */

type ChallengeMission = {
  id: string;
  name: string;
  mission?: string;
  points?: number;
  image?: string;
  "sub-mission"?: { points?: number }[];
};

type FutureMission = {
  code: string;
  title: string;
  description?: string;
  image?: string;
  objectives?: {
    type: string;
    points?: number;
    max?: number;
    pointsPerUnit?: number;
  }[];
};

/** Temporadas do FLL Challenge, da mais recente para a mais antiga. */
const CHALLENGE_SEASONS: { key: string; label: string }[] = [
  { key: "bioglow", label: "BIOGLOW" },
  { key: "unearthed", label: "UNEARTHED" },
  { key: "submerged", label: "SUBMERGED" },
  { key: "masterpiece", label: "MASTERPIECE" },
];

async function readJson<T>(...segments: string[]): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", ...segments), "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`ThinkLab: não foi possível ler ${segments.join("/")}`, err);
    return null;
  }
}

async function loadChallengeSeasons(): Promise<MissionSeason[]> {
  const data = await readJson<Record<string, ChallengeMission[]>>("missions.json");
  if (!data) return [];
  return CHALLENGE_SEASONS.filter((s) => Array.isArray(data[s.key])).map((season) => ({
    key: season.key,
    label: season.label,
    missions: data[season.key].map(
      (m): MissionSummary => ({
        code: m.id,
        name: m.name,
        description: m.mission ?? "",
        points: (m.points ?? 0) + (m["sub-mission"] ?? []).reduce((sum, sub) => sum + (sub.points ?? 0), 0),
        image: m.image,
      }),
    ),
  }));
}

async function loadFutureEditionSeasons(): Promise<MissionSeason[]> {
  const data = await readJson<{ season?: string; title?: string; missions?: FutureMission[] }>(
    "fll",
    "future-edition.json",
  );
  if (!data?.missions) return [];
  return [
    {
      key: (data.season ?? "future-edition").toLowerCase(),
      label: data.title ?? "Future Edition",
      missions: data.missions.map(
        (m): MissionSummary => ({
          code: m.code,
          name: m.title,
          description: m.description ?? "",
          points: (m.objectives ?? []).reduce(
            (sum, o) =>
              sum + (o.type === "counter" ? (o.max ?? 0) * (o.pointsPerUnit ?? 0) : (o.points ?? 0)),
            0,
          ),
          image: m.image,
        }),
      ),
    },
  ];
}

/** O que cada perfil de liga libera no ThinkLab. Para liberar uma liga nova, edite aqui. */
const PROFILE_MISSIONS: Record<ProfileKey, { load?: () => Promise<MissionSeason[]>; note?: string }> = {
  fll: { load: loadChallengeSeasons },
  "fll-future": { load: loadFutureEditionSeasons },
  obr: { note: "As missões da OBR ainda não estão disponíveis no ThinkLab." },
  "obr-resgate": { note: "As missões da OBR Resgate ainda não estão disponíveis no ThinkLab." },
  generic: { note: "Esta liga ainda não tem missões cadastradas." },
};

const normalize = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Missões que o usuário pode usar no ThinkLab: uma coleção por liga em que ele
 * participa ou demonstrou interesse (tabela `user_league_interests`).
 */
export async function getThinkLabMissionPacks(): Promise<MissionPack[]> {
  const scope = await resolveStagebookScope();

  const rows = await db
    .select({
      leagueId: leagues.id,
      code: leagues.code,
      name: leagues.name,
      relation: userLeagueInterests.relationType,
      season: userLeagueInterests.season,
    })
    .from(userLeagueInterests)
    .innerJoin(leagues, eq(leagues.id, userLeagueInterests.leagueId))
    .where(eq(userLeagueInterests.userId, scope.userId))
    .orderBy(asc(leagues.code));

  // Cada fonte de dados é lida no máximo uma vez, mesmo com várias ligas do mesmo perfil.
  const loaded = new Map<ProfileKey, Promise<MissionSeason[]>>();

  const packs = await Promise.all(
    rows.map(async (row): Promise<MissionPack> => {
      const profile = resolveProfileKey({ code: row.code, name: row.name });
      const source = PROFILE_MISSIONS[profile];
      let seasons: MissionSeason[] = [];
      if (source.load) {
        if (!loaded.has(profile)) loaded.set(profile, source.load());
        seasons = (await loaded.get(profile)) ?? [];
      }

      const wanted = normalize(row.season);
      const defaultSeason = wanted
        ? seasons.find((s) => normalize(s.key) === wanted || normalize(s.label).includes(wanted))?.key
        : undefined;

      return {
        leagueId: row.leagueId,
        leagueCode: row.code,
        leagueName: row.name,
        relation: row.relation,
        status: seasons.length > 0 ? "available" : "soon",
        note: source.note,
        seasons,
        defaultSeason,
      };
    }),
  );

  // Ligas em que o usuário participa aparecem primeiro.
  return packs.sort((a, b) => Number(b.relation === "participante") - Number(a.relation === "participante"));
}
