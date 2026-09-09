/**
 * lib/mission-timer/normalize.ts
 *
 * Camada de normalização entre o `missions.json` real do projeto e o
 * modelo (`Mission` / `Season`) usado pela interface do Mission Timer.
 *
 * FORMATO REAL CONFIRMADO (visto em /public/data/missions.json):
 *
 * ```json
 * {
 *   "masterpiece": [
 *     {
 *       "id": "M01",
 *       "name": "CINEMA 3D",
 *       "mission": "Se a pequena viga vermelha ... à direita da moldura preta",
 *       "points": 20,
 *       "equipaments": false,
 *       "image": "/images/missions/.../thumb-mission-01.png",
 *       "type": ["switch", null, null],
 *       "sub-mission": [
 *         { "submission": "...", "points": 10, "type": ["switch", null, null] }
 *       ]
 *     }
 *   ],
 *   "submerged": [ ... ],
 *   "unearthed": [ ... ],
 *   "bioglow": [ ... ]
 * }
 * ```
 *
 * Ou seja: o documento raiz é um MAPA cuja chave é o id/slug da temporada
 * (ex.: "masterpiece") e cujo valor é a lista de missões daquela temporada.
 * Cada missão usa `mission` (não `description`) para o texto explicativo,
 * e `points` pode ser:
 *   - um número fixo (ex.: 20);
 *   - um array de números (ex.: [10, 20, 30]) quando a pontuação varia
 *     conforme o estado marcado no switch/range daquela missão.
 *
 * Missões também podem ter `sub-mission`: um array de "bônus" com sua
 * própria pontuação (fixa ou em array), que somam à pontuação potencial
 * total da missão.
 *
 * O Mission Timer é uma ferramenta de bancada para cronometrar runs —
 * não um motor de pontuação oficial da FLL. Por isso, para o badge
 * "+ X pts" e para o cálculo de "Pontuação obtida" no resultado, usamos
 * o MELHOR CASO de cada missão (maior valor do array de pontos, se houver)
 * somado ao melhor caso de cada sub-missão. Isso é uma decisão de exibição
 * — nunca um valor inventado, sempre derivado dos números que já existem
 * no JSON.
 *
 * A função continua defensiva quanto a nomes de campos (aceita `name`/
 * `title` etc.) para tolerar pequenas variações futuras do arquivo, e
 * mantém como fallback os formatos genéricos tentados anteriormente,
 * caso o projeto venha a ter mais de um arquivo de missões com estrutura
 * diferente.
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
// "mission" é o campo real usado no JSON do RoboStage para o texto da missão.
const MISSION_DESC_KEYS = ["mission", "description", "desc", "descricao", "summary"];
const MISSION_SUBMISSIONS_KEYS = ["sub-mission", "submissions", "subMissions"];

const SEASON_ID_KEYS = ["id", "seasonId", "slug", "code"];
const SEASON_NAME_KEYS = ["name", "title", "label", "nome", "season", "temporada"];
const SEASON_MISSIONS_KEYS = ["missions", "missoes", "items", "tasks"];

/**
 * Extrai um valor de pontos "melhor caso" de um campo `points` que pode
 * ser number, array de numbers, ou ausente. Nunca inventa valor: se não
 * houver number nem array de numbers, retorna `undefined`.
 */
function bestCasePoints(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) {
    const numbers = value.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (numbers.length > 0) return Math.max(...numbers);
  }
  return undefined;
}

/**
 * Pontuação potencial de uma missão = melhor caso da missão em si
 * + melhor caso de cada uma de suas sub-missões (bônus).
 * Retorna `undefined` somente se NENHUM valor numérico de pontos existir
 * em lugar nenhum da missão.
 */
function computeMaxPoints(raw: Record<string, unknown>): number | undefined {
  let total = 0;
  let foundAny = false;

  const own = bestCasePoints(raw.points);
  if (own !== undefined) {
    total += own;
    foundAny = true;
  }

  const subMissions = pickArray(raw, MISSION_SUBMISSIONS_KEYS) ?? [];
  for (const sub of subMissions) {
    if (!isRecord(sub)) continue;
    const subPoints = bestCasePoints(sub.points);
    if (subPoints !== undefined) {
      total += subPoints;
      foundAny = true;
    }
  }

  return foundAny ? total : undefined;
}

function normalizeMission(
  raw: unknown,
  seasonId: string,
  fallbackIndex: number
): Mission | null {
  if (!isRecord(raw)) return null;

  const id = pickString(raw, MISSION_ID_KEYS) ?? `M${String(fallbackIndex + 1).padStart(2, "0")}`;
  if (id === "GP" || id === "EL" || id === "PT") return null;
  const name = pickString(raw, MISSION_NAME_KEYS) ?? id;
  const description = pickString(raw, MISSION_DESC_KEYS);
  const points = computeMaxPoints(raw);

  return { id, name, description, points, seasonId };
}

/** Transforma uma chave de temporada ("bioglow") em um rótulo de exibição ("Bioglow"). */
function titleCaseFromSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

/**
 * Tenta o formato real e confirmado do RoboStage:
 * um mapa { "<seasonSlug>": MissionRaw[] }.
 */
function tryRealSeasonMapFormat(data: unknown): Season[] | null {
  if (!isRecord(data)) return null;

  const entries = Object.entries(data).filter(([, value]) => Array.isArray(value));
  if (entries.length === 0) return null;

  // Confirma que os itens realmente parecem missões (têm "id" e algum texto).
  const looksLikeMissions = entries.every(([, missions]) =>
    (missions as unknown[]).every(
      (m) => isRecord(m) && (typeof m.id === "string" || typeof m.name === "string")
    )
  );
  if (!looksLikeMissions) return null;

  const seasons: Season[] = entries.map(([seasonKey, missionsRaw]) => {
    const missions = (missionsRaw as unknown[])
      .map((m, i) => normalizeMission(m, seasonKey, i))
      .filter((m): m is Mission => m !== null);
    return { id: seasonKey, name: titleCaseFromSlug(seasonKey), missions };
  });

  return seasons.filter((s) => s.missions.length > 0);
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
    .filter((m): m is Mission => m !== null)
    .filter((m) => m.id != "GP" && m.id != "EL" && m.id != "PT"); // Ignora os discos de precisão, gracious professinalism e inspeção de equipamento.

  return { id, name, missions };
}

/**
 * Recebe o conteúdo já parseado (JSON.parse) de `/public/data/missions.json`
 * e devolve uma lista de temporadas normalizadas.
 *
 * Ordem de tentativa:
 *   1. Formato real confirmado: { "<seasonSlug>": MissionRaw[] }
 *   2. { seasons: [ { id, name, missions: [...] } ] }
 *   3. Array de objetos-temporada
 *   4. Lista plana de missões com campo "season"
 *
 * Nunca lança para dados "estranhos" dentro de itens individuais — apenas
 * ignora o item inválido. Lança `MissionsDataError` somente se a raiz do
 * documento não corresponder a nenhum formato reconhecido.
 */
export function normalizeMissionsData(data: unknown): Season[] {
  // Formato 1 (real, confirmado): mapa temporada -> missões.
  const realFormat = tryRealSeasonMapFormat(data);
  if (realFormat && realFormat.length > 0) return realFormat;

  // Formato 2: { seasons: [...] }
  if (isRecord(data) && Array.isArray(data.seasons)) {
    const seasons = data.seasons
      .map((s, i) => (isRecord(s) ? normalizeSeasonObject(s, i) : null))
      .filter((s): s is Season => s !== null);
    if (seasons.length > 0) return seasons;
  }

  // Formato 3: array de temporadas, ou lista plana com campo "season".
  if (Array.isArray(data) && data.every((item) => isRecord(item))) {
    const asRecords = data as Record<string, unknown>[];

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

    const seasons = asRecords
      .map((s, i) => normalizeSeasonObject(s, i))
      .filter((s): s is Season => s !== null);
    if (seasons.length > 0) return seasons;
  }

  throw new MissionsDataError(
    "Formato de missions.json não reconhecido pela camada de normalização."
  );
}
