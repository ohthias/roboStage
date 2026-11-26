/**
 * Catálogo de missões no navegador — ponto único para todo componente cliente
 * (pontuador, LabTest, QuickBrick, embeds, ThinkLab, Partiu Mesa…).
 *
 * As rotas em /api/data/missions são estáticas (geradas no build) e cada
 * requisição fica memorizada na aba: abrir várias telas ou componentes não
 * baixa o mesmo arquivo de novo. Quem usa uma temporada só busca o arquivo
 * daquela temporada, não o catálogo inteiro.
 */
import type { FEData } from "@/features/labtest/lib/future-edition";

export const MISSIONS_URL = "/api/data/missions";
export const FUTURE_EDITION_URL = "/api/data/missions/future-edition";
export const missionsSeasonUrl = (season: string) =>
  `${MISSIONS_URL}/${encodeURIComponent(season)}`;

const requests = new Map<string, Promise<unknown>>();

function loadJson<T>(url: string, errorMessage: string, notFound?: T): Promise<T> {
  let request = requests.get(url) as Promise<T> | undefined;
  if (!request) {
    request = fetch(url)
      .then((response) => {
        if (response.status === 404 && notFound !== undefined) return notFound;
        if (!response.ok) throw new Error(errorMessage);
        return response.json() as Promise<T>;
      })
      .catch((error) => {
        requests.delete(url); // permite tentar de novo
        throw error;
      });
    requests.set(url, request);
  }
  return request;
}

/** Catálogo completo: `{ [temporada]: missões[] }`. Só para quem precisa de todas. */
export function loadMissionCatalog<T = unknown>(): Promise<Record<string, T[]>> {
  return loadJson(MISSIONS_URL, "Não foi possível carregar as missões.");
}

/** Missões de uma temporada (lista vazia se a temporada não existir). */
export async function loadSeasonMissions<T = unknown>(season: string): Promise<T[]> {
  if (!season) return [];
  const list = await loadJson<T[]>(
    missionsSeasonUrl(season),
    "Não foi possível carregar as missões da temporada.",
    [],
  );
  return Array.isArray(list) ? list : [];
}

/** Qualquer uma das fontes acima pela URL (o assistente de testes alterna entre elas). */
export function loadMissionSource<T = unknown>(url: string): Promise<T> {
  return loadJson(url, "Erro ao buscar as missões");
}

/** Guias editoriais por temporada (data/leagues/fll/mission-guide/), baixados sob demanda. */
const MISSION_GUIDES: Record<string, () => Promise<{ default: unknown }>> = {
  bioglow: () => import("@/data/leagues/fll/mission-guide/bioglow.json"),
};

/** Guia editorial de missões da temporada, ou `null` se ela não tiver guia. */
export async function loadMissionGuide<T = unknown>(season: string): Promise<T | null> {
  const load = MISSION_GUIDES[season];
  return load ? ((await load()).default as T) : null;
}

/** Missões e penalidades da Future Edition. */
export function loadFutureEditionData(): Promise<FEData> {
  return loadJson(FUTURE_EDITION_URL, "Não foi possível carregar a Future Edition.");
}
