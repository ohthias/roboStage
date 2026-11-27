/**
 * Chamadas à FTCScout feitas pelo servidor do RoboStage. O cache do `fetch`
 * evita repetir a mesma consulta a cada visitante (a FTCScout pede para não
 * abusar da API pública).
 */
import { FTCSCOUT, cleanEventCode, namesFromGraphql, normalizeEvent, normalizeQuickStats, normalizeEventSummary, type EventSummary, type OfficialEvent } from "./ftcscout";

const HEADERS = { Accept: "application/json", "User-Agent": "RoboStage (robostage.com.br) scouting FTC" };

export class FtcScoutError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

async function getJson(path: string, revalidate: number): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${FTCSCOUT.rest}${path}`, { headers: HEADERS, next: { revalidate } });
  } catch {
    throw new FtcScoutError("Não foi possível conectar à FTCScout. Tente de novo em instantes.", 503);
  }
  if (res.status === 404) throw new FtcScoutError("Não encontrado na FTCScout.", 404);
  if (!res.ok) throw new FtcScoutError(`A FTCScout respondeu ${res.status}.`);
  return res.json();
}

/** Nomes das equipes em uma consulta só (a REST traz apenas os números). */
async function teamNames(season: number, code: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(FTCSCOUT.graphql, {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query($season:Int!,$code:String!){eventByCode(season:$season,code:$code){teams{teamNumber team{name}}}}",
        variables: { season, code },
      }),
      next: { revalidate: 60 * 60 * 6 },
    });
    if (!res.ok) return {};
    return namesFromGraphql(await res.json());
  } catch {
    // Sem nomes, a tela mostra só o número: não vale derrubar a importação.
    return {};
  }
}

export async function fetchOfficialEvent(code: string, season: number = FTCSCOUT.season): Promise<OfficialEvent> {
  const c = cleanEventCode(code);
  if (!c) throw new FtcScoutError("Informe o código do evento.", 400);
  const base = `/events/${season}/${encodeURIComponent(c)}`;
  const [event, teams, matches, names] = await Promise.all([
    getJson(base, 60 * 60),
    // Ranking e partidas mudam durante o evento: cache curto.
    getJson(`${base}/teams`, 60).catch(() => []),
    getJson(`${base}/matches`, 60).catch(() => []),
    teamNames(season, c),
  ]);
  const official = normalizeEvent(event, teams, matches, names, season);
  await addSeasonOpr(official, season);
  return official;
}

/**
 * Antes das primeiras partidas a OPR do evento não existe. Para essas equipes,
 * busca a melhor OPR da temporada (quick-stats), em lotes pequenos e com cache
 * longo — muda pouco de um dia para o outro.
 */
async function addSeasonOpr(event: OfficialEvent, season: number) {
  const missing = event.teams.filter((t) => !t.opr).slice(0, 80);
  for (let i = 0; i < missing.length; i += 8) {
    await Promise.all(
      missing.slice(i, i + 8).map(async (t) => {
        try {
          t.seasonOpr = normalizeQuickStats(await getJson(`/teams/${t.number}/quick-stats?season=${season}`, 60 * 60 * 6));
        } catch {
          // equipe sem partidas na temporada: fica sem OPR
        }
      }),
    );
  }
}

export async function searchEvents(text: string, season: number = FTCSCOUT.season): Promise<EventSummary[]> {
  const q = text.trim().slice(0, 60);
  if (q.length < 2) return [];
  const raw = await getJson(`/events/search/${season}?searchText=${encodeURIComponent(q)}&limit=20`, 60 * 30);
  return (Array.isArray(raw) ? raw : []).map(normalizeEventSummary).filter((e): e is EventSummary => e !== null);
}

/** Eventos em que a equipe está inscrita na temporada. */
export async function teamEvents(team: string, season: number = FTCSCOUT.season): Promise<EventSummary[]> {
  const n = team.replace(/\D/g, "").slice(0, 6);
  if (!n) return [];
  const raw = await getJson(`/teams/${n}/events/${season}`, 60 * 30);
  const codes = [
    ...new Set(
      (Array.isArray(raw) ? raw : [])
        .map((p) => (p && typeof p === "object" ? (p as Record<string, unknown>).eventCode : undefined))
        .filter((c): c is string => typeof c === "string"),
    ),
  ].slice(0, 15);
  const events = await Promise.all(
    codes.map((c) =>
      getJson(`/events/${season}/${encodeURIComponent(c)}`, 60 * 60 * 6)
        .then(normalizeEventSummary)
        .catch(() => ({ code: c, name: c }) as EventSummary),
    ),
  );
  return events.filter((e): e is EventSummary => e !== null).sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
}
