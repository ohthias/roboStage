/**
 * lib/mission-timer/normalize.ts
 *
 * Camada de normalização entre o `missions.json` real do projeto e o
 * modelo (`Mission` / `Season`) usado pela interface do Mission Timer.
 *
 * IMPORTANTE: este arquivo assume um formato "provável" de missions.json,
 * pois o arquivo real do RoboStage não estava disponível no momento da
 * implementação. Ajuste as funções `pickX` abaixo caso a estrutura real
 * do arquivo use outras chaves — foram escritas de forma defensiva
 * (múltiplos nomes de campo aceitos) exatamente para minimizar esse ajuste.
 *
 * Formatos aceitos, em ordem de tentativa:
 *
 * 1) { seasons: [ { id, name, missions: [ { id, name, points, description } ] } ] }
 * 2) [ { id, name, missions: [...] } ]                    (array de temporadas)
 * 3) { "Nome da Temporada": [ { id, name, points } ] }     (mapa temporada -> missões)
 * 4) [ { id, name, season, points, description } ]         (lista plana com campo season)
 */

import type { Mission, Season } from "./types";

export class MissionsDataError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(
  obj: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function pickNumber(
  obj: Record<string, unknown>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function pickArray(
  obj: Record<string, unknown>,
  keys: string[]
): unknown[] | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
  }
  return undefined;
}

const MISSION_ID_KEYS = ["id", "missionId", "code", "slug"];
const MISSION_NAME_KEYS = ["name", "title", "label", "nome"];
const MISSION_DESC_KEYS = ["description", "desc", "descricao", "summary"];
const MISSION_POINTS_KEYS = ["points", "score", "pontos", "maxPoints", "value"];

const SEASON_ID_KEYS = ["id", "seasonId", "slug", "code"];
const SEASON_NAME_KEYS = ["name", "title", "label", "nome", "season", "temporada"];
const SEASON_MISSIONS_KEYS = ["missions", "missoes", "items", "tasks"];

function normalizeMission(
  raw: unknown,
  seasonId: string,
  fallbackIndex: number
): Mission | null {
  if (!isRecord(raw)) return null;

  const id = pickString(raw, MISSION_ID_KEYS) ?? `M${String(fallbackIndex + 1).padStart(2, "0")}`;
  if (["EL", "GP", "PT"].includes(id.trim().toUpperCase())) return null;
  const name = pickString(raw, MISSION_NAME_KEYS) ?? id;
  const description = pickString(raw, MISSION_DESC_KEYS);
  const points = pickNumber(raw, MISSION_POINTS_KEYS);

  return { id, name, description, points, seasonId };
}

function seasonSlug(name: string, fallbackIndex: number): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || `temporada-${fallbackIndex + 1}`;
}

function normalizeSeasonObject(
  raw: Record<string, unknown>,
  fallbackIndex: number
): Season | null {
  const name = pickString(raw, SEASON_NAME_KEYS);
  if (!name) return null;

  const id = pickString(raw, SEASON_ID_KEYS) ?? seasonSlug(name, fallbackIndex);
  const missionsRaw = pickArray(raw, SEASON_MISSIONS_KEYS) ?? [];

  const missions = missionsRaw
    .map((m, i) => normalizeMission(m, id, i))
    .filter((m): m is Mission => m !== null);

  return { id, name, missions };
}

/**
 * Recebe o conteúdo já parseado (JSON.parse) de `/public/data/missions.json`
 * e devolve uma lista de temporadas normalizadas.
 *
 * Nunca lança para dados "estranhos" dentro de itens individuais — apenas
 * ignora o item inválido. Lança `MissionsDataError` somente se a raiz do
 * documento não corresponder a nenhum formato reconhecido.
 */
export function normalizeMissionsData(data: unknown): Season[] {
  // Formato 1: { seasons: [...] }
  if (isRecord(data) && Array.isArray(data.seasons)) {
    const seasons = data.seasons
      .map((s, i) => (isRecord(s) ? normalizeSeasonObject(s, i) : null))
      .filter((s): s is Season => s !== null);
    if (seasons.length > 0) return seasons;
  }

  // Formato 2: array de temporadas
  if (Array.isArray(data) && data.every((item) => isRecord(item))) {
    const asRecords = data as Record<string, unknown>[];

    // Formato 4: lista plana de missões com campo "season"
    const looksFlat = asRecords.every(
      (item) => pickArray(item, SEASON_MISSIONS_KEYS) === undefined
    );
    if (looksFlat) {
      const bySeasonName = new Map<string, Season>();
      asRecords.forEach((item, i) => {
        const seasonName =
          pickString(item, ["season", "temporada", "seasonName"]) ?? "Temporada";
        const seasonId = seasonSlug(seasonName, 0);
        let season = bySeasonName.get(seasonId);
        if (!season) {
          season = { id: seasonId, name: seasonName, missions: [] };
          bySeasonName.set(seasonId, season);
        }
        const mission = normalizeMission(item, seasonId, i);
        if (mission) season.missions.push(mission);
      });
      const flatSeasons = Array.from(bySeasonName.values());
      if (flatSeasons.length > 0) return flatSeasons;
    }

    // Array de objetos-temporada
    const seasons = asRecords
      .map((s, i) => normalizeSeasonObject(s, i))
      .filter((s): s is Season => s !== null);
    if (seasons.length > 0) return seasons;
  }

  // Formato 3: mapa { "Nome da temporada": [missões] }
  if (isRecord(data)) {
    const entries = Object.entries(data).filter(([, v]) => Array.isArray(v));
    if (entries.length > 0) {
      const seasons: Season[] = entries.map(([name, missionsRaw], i) => {
        const id = seasonSlug(name, i);
        const missions = (missionsRaw as unknown[])
          .map((m, mi) => normalizeMission(m, id, mi))
          .filter((m): m is Mission => m !== null);
        return { id, name, missions };
      });
      if (seasons.length > 0) return seasons;
    }
  }

  throw new MissionsDataError(
    "Formato de missions.json não reconhecido pela camada de normalização."
  );
}
