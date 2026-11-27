/**
 * Integração com a FTCScout (ftcscout.org) — fonte dos dados oficiais do
 * Scouting FTC: equipes do evento, ranking, partidas, placares e OPR.
 *
 * A FTCScout é um projeto aberto e independente (não é da FIRST nem do
 * RoboStage). A API REST não pede chave, mas pede para não abusar: por isso o
 * navegador nunca chama a FTCScout direto — passa pelas rotas
 * /api/data/ftcscout/*, que guardam cache no servidor.
 *
 * Os normalizadores abaixo são puros e defensivos: aceitam variações nos nomes
 * dos campos entre temporadas e devolvem sempre o mesmo formato.
 */

export const FTCSCOUT = {
  site: "https://ftcscout.org",
  apiDocs: "https://ftcscout.org/api",
  rest: "https://api.ftcscout.org/rest/v1",
  graphql: "https://api.ftcscout.org/graphql",
  /** Temporada BIOBUZZ na FTCScout (ano de início da temporada). */
  season: 2026,
} as const;

export const ftcscoutEventUrl = (code: string, season: number = FTCSCOUT.season) =>
  `${FTCSCOUT.site}/events/${season}/${encodeURIComponent(code)}`;
export const ftcscoutTeamUrl = (number: string | number) => `${FTCSCOUT.site}/teams/${number}`;

/* ------------------------------------------------------------- tipos */

export type OfficialOpr = { total: number; auto?: number; teleop?: number };

export type OfficialTeam = {
  number: string;
  name: string;
  rank?: number;
  /** Ranking Score (média de RP) */
  rp?: number;
  wins: number;
  losses: number;
  ties: number;
  played: number;
  /** OPR da equipe no evento (estimativa de pontos que ela soma à aliança) */
  opr?: OfficialOpr;
  /**
   * Melhor OPR da equipe na temporada (quick-stats da FTCScout). Serve antes
   * das primeiras partidas do evento, quando a OPR do evento ainda não existe.
   */
  seasonOpr?: number;
  /** média de pontos da aliança nas partidas da equipe */
  avgAlliance?: number;
};

export type OfficialAllianceSide = { teams: string[]; score?: number; auto?: number; teleop?: number };

export type OfficialMatch = {
  id: string;
  /** "Q" para qualificação, "P" para playoffs */
  level: "Q" | "P";
  number: number;
  series?: number;
  label: string;
  played: boolean;
  start?: string;
  red: OfficialAllianceSide;
  blue: OfficialAllianceSide;
};

export type OfficialEvent = {
  source: "ftcscout";
  season: number;
  code: string;
  name: string;
  start?: string;
  end?: string;
  location?: string;
  teams: OfficialTeam[];
  matches: OfficialMatch[];
  fetchedAt: number;
};

export type EventSummary = { code: string; name: string; start?: string; location?: string };

/* --------------------------------------------------- leitura defensiva */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

/** Primeiro valor numérico entre as chaves candidatas. */
function num(o: unknown, ...keys: string[]): number | undefined {
  if (!isObj(o)) return undefined;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (isObj(v) && typeof v.value === "number") return v.value; // { value, rank }
  }
  return undefined;
}

function str(o: unknown, ...keys: string[]): string | undefined {
  if (!isObj(o)) return undefined;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function obj(o: unknown, ...keys: string[]): Obj | undefined {
  if (!isObj(o)) return undefined;
  for (const k of keys) if (isObj(o[k])) return o[k] as Obj;
  return undefined;
}

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/* ------------------------------------------------------- normalizadores */

export function normalizeEventSummary(raw: unknown): EventSummary | null {
  const code = str(raw, "code", "eventCode");
  const name = str(raw, "name");
  if (!code || !name) return null;
  const location = [str(raw, "city"), str(raw, "stateProv", "state"), str(raw, "country")].filter(Boolean).join(", ");
  return { code, name, start: str(raw, "start", "startDate"), location: location || undefined };
}

export function normalizeOpr(stats: unknown): OfficialOpr | undefined {
  const opr = obj(stats, "opr", "OPR");
  if (!opr) return undefined;
  const total = num(opr, "totalPointsNp", "totalPoints", "total", "tot");
  if (total == null) return undefined;
  return {
    total,
    auto: num(opr, "autoPointsNp", "autoPoints", "auto"),
    teleop: num(opr, "dcPointsNp", "dcPoints", "teleopPoints", "teleOpPoints", "dc"),
  };
}

export function normalizeEventTeam(raw: unknown, names: Record<string, string> = {}): OfficialTeam | null {
  const number = str(raw, "teamNumber", "number");
  if (!number) return null;
  const stats = obj(raw, "stats");
  const avg = obj(stats, "avg", "average");
  const teamObj = obj(raw, "team");
  return {
    number,
    name: names[number] ?? str(teamObj, "name") ?? str(raw, "teamName", "name") ?? "",
    rank: num(stats, "rank"),
    rp: num(stats, "rp", "rankingScore", "sortOrder1"),
    wins: num(stats, "wins") ?? 0,
    losses: num(stats, "losses") ?? 0,
    ties: num(stats, "ties") ?? 0,
    played: num(stats, "qualMatchesPlayed", "matchesPlayed", "played") ?? 0,
    opr: normalizeOpr(stats),
    avgAlliance: num(avg, "totalPointsNp", "totalPoints"),
  };
}

const LEVEL_PLAYOFF = /semi|final|elim|playoff/i;

export function normalizeMatch(raw: unknown): OfficialMatch | null {
  const number = num(raw, "matchNum", "matchNumber", "number");
  if (number == null) return null;
  const levelRaw = str(raw, "tournamentLevel", "level") ?? "Quals";
  const level: "Q" | "P" = LEVEL_PLAYOFF.test(levelRaw) ? "P" : "Q";
  const series = num(raw, "series");
  const teams = arr((raw as Obj).teams);
  const side = (color: "red" | "blue"): OfficialAllianceSide => {
    const scores = obj(raw, "scores");
    const s = obj(scores, color, color === "red" ? "Red" : "Blue");
    return {
      teams: teams
        .filter((t) => str(t, "alliance", "color")?.toLowerCase() === color)
        .sort((a, b) => (str(a, "station") ?? "").localeCompare(str(b, "station") ?? ""))
        .map((t) => str(t, "teamNumber", "number"))
        .filter((n): n is string => !!n),
      score: num(s, "totalPoints", "total"),
      auto: num(s, "autoPoints", "auto"),
      teleop: num(s, "dcPoints", "teleopPoints", "dc"),
    };
  };
  const red = side("red");
  const blue = side("blue");
  const played =
    (raw as Obj).hasBeenPlayed === true || (red.score != null && blue.score != null && (red.score > 0 || blue.score > 0));
  const label = level === "Q" ? `Q${number}` : `P${series ? `${series}-` : ""}${number}`;
  return {
    id: str(raw, "id") ?? `${level}${series ?? ""}-${number}`,
    level,
    number,
    series,
    label,
    played,
    start: str(raw, "scheduledStartTime", "startTime"),
    red,
    blue,
  };
}

function normalizeEventTeams(rawTeams: unknown, names: Record<string, string>): OfficialTeam[] {
  return arr(rawTeams)
    .map((team) => normalizeEventTeam(team, names))
    .filter((team): team is OfficialTeam => team !== null);
}

function normalizeEventMatches(rawMatches: unknown): OfficialMatch[] {
  return arr(rawMatches)
    .map(normalizeMatch)
    .filter((match): match is OfficialMatch => match !== null)
    .sort((a, b) =>
      a.level === b.level
        ? (a.series ?? 0) - (b.series ?? 0) || a.number - b.number
        : a.level === "Q"
          ? -1
          : 1,
    );
}

function addTeamsMissingFromTable(
  teams: OfficialTeam[],
  matches: OfficialMatch[],
  names: Record<string, string>,
): void {
  const known = new Set(teams.map((team) => team.number));
  for (const match of matches) {
    for (const number of [...match.red.teams, ...match.blue.teams]) {
      if (known.has(number)) continue;
      known.add(number);
      teams.push({ number, name: names[number] ?? "", wins: 0, losses: 0, ties: 0, played: 0 });
    }
  }
}

export function normalizeEvent(
  rawEvent: unknown,
  rawTeams: unknown,
  rawMatches: unknown,
  names: Record<string, string> = {},
  season: number = FTCSCOUT.season,
): OfficialEvent {
  const summary = normalizeEventSummary(rawEvent);
  const teams = normalizeEventTeams(rawTeams, names);
  const matches = normalizeEventMatches(rawMatches);
  addTeamsMissingFromTable(teams, matches, names);

  return {
    source: "ftcscout",
    season,
    code: summary?.code ?? str(rawEvent, "code") ?? "",
    name: summary?.name ?? "",
    start: summary?.start,
    end: str(rawEvent, "end", "endDate"),
    location: summary?.location,
    teams,
    matches,
    fetchedAt: Date.now(),
  };
}

/** `/teams/{n}/quick-stats?season=` → `{ tot: { value, rank }, ... }` */
export function normalizeQuickStats(raw: unknown): number | undefined {
  return num(raw, "tot", "total", "totalPoints");
}

/* ------------------------------------------------- momento do evento */

export type EventPhase = "sem-evento" | "vespera" | "agenda" | "qualificacao" | "selecao" | "playoffs";

/** Em que momento do campeonato o evento importado está, pelos dados da FTCScout. */
export function eventPhase(event: OfficialEvent | undefined): EventPhase {
  if (!event) return "sem-evento";
  const quals = event.matches.filter((m) => m.level === "Q");
  const playoffs = event.matches.filter((m) => m.level === "P");
  if (playoffs.length > 0) return "playoffs";
  if (quals.length === 0) return "vespera";
  const played = quals.filter((m) => m.played).length;
  if (played === 0) return "agenda";
  if (played < quals.length) return "qualificacao";
  return "selecao";
}

/** Nomes vindos da consulta GraphQL `eventByCode { teams { teamNumber team { name } } }`. */
export function namesFromGraphql(raw: unknown): Record<string, string> {
  const ev = obj(obj(raw, "data"), "eventByCode");
  const out: Record<string, string> = {};
  for (const t of arr(ev?.teams)) {
    const n = str(t, "teamNumber");
    const name = str(obj(t, "team"), "name");
    if (n && name) out[n] = name;
  }
  return out;
}

/* ------------------------------------------------ análise dos oficiais */

/** Próximas partidas (não jogadas) de uma equipe, com parceiro e adversários. */
export function upcomingFor(event: OfficialEvent | undefined, team: string) {
  if (!event || !team) return [];
  return event.matches
    .filter((m) => !m.played && (m.red.teams.includes(team) || m.blue.teams.includes(team)))
    .map((m) => {
      const ours = m.red.teams.includes(team) ? "red" : "blue";
      const mine = m[ours];
      const theirs = m[ours === "red" ? "blue" : "red"];
      return { match: m, alliance: ours as "red" | "blue", partner: mine.teams.filter((t) => t !== team), opponents: theirs.teams };
    });
}

/** Código de evento digitado pela equipe: só letras e números, maiúsculo. */
export const cleanEventCode = (code: string) => code.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 16);

/* ------------------------------------------- desempenho no evento */

export type TeamMatchLine = {
  id: string;
  label: string;
  level: "Q" | "P";
  alliance: "red" | "blue";
  partner: string[];
  opponents: string[];
  /** placar da aliança da equipe (inclui o parceiro) */
  score?: number;
  oppScore?: number;
  result?: "V" | "D" | "E";
  played: boolean;
};

/** Partidas de uma equipe no evento, na ordem da agenda. */
export function teamMatches(event: OfficialEvent | undefined, team: string): TeamMatchLine[] {
  if (!event || !team) return [];
  return event.matches
    .filter((m) => m.red.teams.includes(team) || m.blue.teams.includes(team))
    .map((m) => {
      const alliance = m.red.teams.includes(team) ? "red" : "blue";
      const mine = m[alliance];
      const theirs = m[alliance === "red" ? "blue" : "red"];
      const scored = m.played && mine.score != null && theirs.score != null;
      return {
        id: m.id,
        label: m.label,
        level: m.level,
        alliance,
        partner: mine.teams.filter((t) => t !== team),
        opponents: theirs.teams,
        score: scored ? mine.score : undefined,
        oppScore: scored ? theirs.score : undefined,
        result: scored ? (mine.score! > theirs.score! ? "V" : mine.score! < theirs.score! ? "D" : "E") : undefined,
        played: m.played,
      };
    });
}

export type PerformanceSummary = {
  played: number;
  wins: number;
  losses: number;
  ties: number;
  avg: number;
  best: number;
  worst: number;
  /** desvio padrão do placar da aliança: quanto menor, mais previsível */
  stdev: number;
  /** média das 3 últimas partidas menos a média das anteriores (≥ 4 jogadas) */
  trend: number | null;
};

export function performanceSummary(lines: TeamMatchLine[]): PerformanceSummary | null {
  const scores = lines.filter((l) => l.score != null).map((l) => l.score!);
  if (!scores.length) return null;
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const avg = mean(scores);
  const stdev = Math.sqrt(mean(scores.map((x) => (x - avg) ** 2)));
  const count = (r: "V" | "D" | "E") => lines.filter((l) => l.result === r).length;
  return {
    played: scores.length,
    wins: count("V"),
    losses: count("D"),
    ties: count("E"),
    avg,
    best: Math.max(...scores),
    worst: Math.min(...scores),
    stdev,
    trend: scores.length >= 4 ? mean(scores.slice(-3)) - mean(scores.slice(0, -3)) : null,
  };
}

/** Uma frase sobre o que fazer agora, conforme o momento do evento. */
export const PHASE_HINT: Record<EventPhase, string> = {
  "sem-evento": "Importe o evento da FTCScout para ver equipes, ranking e OPR.",
  vespera: "Agenda ainda não publicada: a força das equipes usa a melhor OPR de cada uma na temporada.",
  agenda: "Agenda publicada: veja suas partidas e divida as equipes entre os scouts.",
  qualificacao: "Qualificação em andamento: atualize a cada rodada para o ranking e a OPR do evento.",
  selecao: "Qualificação encerrada: o ranking final define os capitães. Hora de escolher parceiros.",
  playoffs: "Playoffs: compare as alianças e prepare cada confronto.",
};
