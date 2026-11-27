import { asset } from "@/lib/assets";
/**
 * Legado da equipe e transferência de arquivos — tipos compartilhados entre
 * servidor e UI, e a normalização do conteúdo (barreira das Server Actions).
 *
 * Sem dependências de servidor.
 */

import { PIN_KIND_LABEL, pinHref, type PinKind } from "./pins";

// ---------------------------------------------------------------------------
// Abas (temporada / competição)
// ---------------------------------------------------------------------------

export const LEGACY_CHAPTER_KINDS = ["season", "competition"] as const;
export type LegacyChapterKind = (typeof LEGACY_CHAPTER_KINDS)[number];

export const LEGACY_CHAPTER_LABEL: Record<LegacyChapterKind, string> = {
  season: "Temporada",
  competition: "Competição",
};

// ---------------------------------------------------------------------------
// Ligas, temporadas e etapas
// ---------------------------------------------------------------------------

export const LEGACY_LEAGUES = ["fll", "obr", "ftc", "outra"] as const;
export type LegacyLeague = (typeof LEGACY_LEAGUES)[number];

export const isLegacyLeague = (v: unknown): v is LegacyLeague =>
  typeof v === "string" && (LEGACY_LEAGUES as readonly string[]).includes(v);

export const LEGACY_LEAGUE_META: Record<LegacyLeague, { label: string; name: string; color: string; modalities: string[] }> = {
  fll: { label: "FLL", name: "FIRST LEGO League", color: "#ef4444", modalities: ["Challenge", "Explore", "Discover"] },
  obr: {
    label: "OBR",
    name: "Olimpíada Brasileira de Robótica",
    color: "#16a34a",
    // Duas modalidades: prática (presencial, Robótica de Resgate ou Artística) e teórica (prova).
    modalities: ["Prática · Resgate", "Prática · Artística", "Teórica"],
  },
  ftc: { label: "FTC", name: "FIRST Tech Challenge", color: "#f97316", modalities: [] },
  outra: { label: "Outra", name: "Outra competição ou projeto", color: "#64748b", modalities: [] },
};

/**
 * Temporadas conhecidas. FLL e FTC usam o id da temporada (o mesmo de
 * `tests.season` e `quickbrick_notebooks.season`) e vão de agosto a julho;
 * a OBR é por ano civil (`obr-2026`).
 */
export const LEGACY_SEASON_PRESETS = [
  { key: "bioglow", league: "fll", title: "Bioglow 2026/27", name: "Bioglow", years: "2026/27", start: "2026-08-01", end: "2027-07-31", logo: asset("/images/seasons/fll/bioglow_logo_founders_edition.webp") },
  { key: "unearthed", league: "fll", title: "Unearthed 2025/26", name: "Unearthed", years: "2025/26", start: "2025-08-01", end: "2026-07-31", logo: asset("/images/seasons/fll/Unearthed.webp") },
  { key: "submerged", league: "fll", title: "Submerged 2024/25", name: "Submerged", years: "2024/25", start: "2024-08-01", end: "2025-07-31", logo: asset("/images/seasons/fll/Submerged.webp") },
  { key: "masterpiece", league: "fll", title: "Masterpiece 2023/24", name: "Masterpiece", years: "2023/24", start: "2023-08-01", end: "2024-07-31", logo: asset("/images/seasons/fll/Masterpiece.png") },
  { key: "obr-2026", league: "obr", title: "OBR 2026", name: "OBR", years: "2026", start: "2026-01-01", end: "2026-12-31", logo: null },
  { key: "obr-2025", league: "obr", title: "OBR 2025", name: "OBR", years: "2025", start: "2025-01-01", end: "2025-12-31", logo: null },
  { key: "obr-2024", league: "obr", title: "OBR 2024", name: "OBR", years: "2024", start: "2024-01-01", end: "2024-12-31", logo: null },
  { key: "obr-2023", league: "obr", title: "OBR 2023", name: "OBR", years: "2023", start: "2023-01-01", end: "2023-12-31", logo: null },
  { key: "biobuzz", league: "ftc", title: "BioBuzz 2026/27", name: "BioBuzz", years: "2026/27", start: "2026-09-01", end: "2027-08-31", logo: asset("/images/seasons/ftc/biobuzz_logo.png") },
] as const satisfies readonly {
  key: string;
  league: LegacyLeague;
  title: string;
  name: string;
  years: string;
  start: string;
  end: string;
  logo: string | null;
}[];

export type LegacySeasonPreset = (typeof LEGACY_SEASON_PRESETS)[number];
export type LegacySeasonKey = LegacySeasonPreset["key"];

export const seasonPreset = (key: string | null | undefined): LegacySeasonPreset | null =>
  LEGACY_SEASON_PRESETS.find((s) => s.key === key) ?? null;

export const LEGACY_STAGES = ["regional", "estadual", "nacional", "internacional", "amistoso"] as const;
export type LegacyStage = (typeof LEGACY_STAGES)[number];
export const isLegacyStage = (v: unknown): v is LegacyStage => typeof v === "string" && (LEGACY_STAGES as readonly string[]).includes(v);

/** Etapas de cada liga (a ordem é a da temporada). */
export const LEGACY_STAGE_OPTIONS: Record<LegacyLeague, { stage: LegacyStage; label: string }[]> = {
  fll: [
    { stage: "regional", label: "Torneio regional" },
    { stage: "nacional", label: "Etapa nacional" },
    { stage: "internacional", label: "Internacional" },
    { stage: "amistoso", label: "Amistoso / festival" },
  ],
  obr: [
    { stage: "regional", label: "Etapa regional" },
    { stage: "estadual", label: "Etapa estadual" },
    { stage: "nacional", label: "Etapa nacional" },
    { stage: "internacional", label: "Mundial (RoboCup)" },
    { stage: "amistoso", label: "Amistoso / seletiva" },
  ],
  ftc: [
    { stage: "regional", label: "Qualifier / regional" },
    { stage: "nacional", label: "Nacional" },
    { stage: "internacional", label: "Mundial" },
    { stage: "amistoso", label: "Scrimmage / amistoso" },
  ],
  outra: [
    { stage: "regional", label: "Regional" },
    { stage: "estadual", label: "Estadual" },
    { stage: "nacional", label: "Nacional" },
    { stage: "internacional", label: "Internacional" },
    { stage: "amistoso", label: "Amistoso" },
  ],
};

export function stageLabel(league: LegacyLeague | null, stage: string | null): string | null {
  if (!stage) return null;
  return LEGACY_STAGE_OPTIONS[league ?? "outra"].find((o) => o.stage === stage)?.label ?? LEGACY_STAGE_OPTIONS.outra.find((o) => o.stage === stage)?.label ?? null;
}

export type LegacyAward = { id: string; title: string; detail: string };
export type LegacyHighlight = { id: string; text: string };

/** Texto de uma aba do legado (tudo opcional; `normalizeLegacyContent` limpa). */
export type LegacyContent = {
  /** O que a equipe fez no período, em texto livre. */
  summary?: string;
  /** Resultado / colocação ("2º lugar geral", "Classificada para o nacional"). */
  result?: string;
  /** Nome do robô da temporada. */
  robotName?: string;
  /** Prêmios e reconhecimentos. */
  awards?: LegacyAward[];
  /** Momentos marcantes, em ordem. */
  highlights?: LegacyHighlight[];
  /** O que aprendemos / o que faríamos diferente. */
  lessons?: string;
  /** Quem participou (ids de usuário). Ex-membros continuam guardados. */
  members?: string[];
  /** Modalidade/categoria (OBR: "Prática · Resgate", "Teórica"; FLL: "Challenge"…). */
  modality?: string;
  /** Seções de documentação escolhidas pela equipe (placar, ficha técnica, links…). */
  sections?: LegacySection[];
};

// ---------------------------------------------------------------------------
// Seções de documentação
// ---------------------------------------------------------------------------

export const LEGACY_SECTION_KINDS = ["text", "links", "scores", "specs", "project", "feedback", "timeline", "people"] as const;
export type LegacySectionKind = (typeof LEGACY_SECTION_KINDS)[number];
export const isLegacySectionKind = (v: unknown): v is LegacySectionKind =>
  typeof v === "string" && (LEGACY_SECTION_KINDS as readonly string[]).includes(v);

/**
 * Linha de uma seção. Os campos usados dependem do tipo:
 *  - links: `label` + `url`
 *  - scores: `label` (rodada) + `points` + `time` (segundos, opcional) + `value` (observação)
 *  - specs / project: `label` + `value`
 *  - feedback: `label` (área) + `value` (ponto forte) + `extra` (a melhorar)
 *  - timeline: `date` + `label`
 *  - people: `label` (nome) + `value` (papel)
 */
export type LegacyRow = {
  id: string;
  label: string;
  value?: string;
  extra?: string;
  url?: string;
  points?: number | null;
  time?: number | null;
  date?: string;
};

export type LegacySection = {
  id: string;
  kind: LegacySectionKind;
  title: string;
  /** Só em `text`. */
  text?: string;
  rows?: LegacyRow[];
  /** Só em `scores`: mostrar a coluna de tempo (OBR Resgate). */
  showTime?: boolean;
};

export const LEGACY_SECTION_META: Record<LegacySectionKind, { label: string; description: string; defaultTitle: string }> = {
  text: { label: "Texto", description: "Um relato livre com título.", defaultTitle: "Relato" },
  links: { label: "Links e mídia", description: "Vídeos, álbuns de fotos, repositório, apresentação, portfólio.", defaultTitle: "Links e mídia" },
  scores: { label: "Placar", description: "Rodadas ou partidas com pontos (e tempo), com melhor e média.", defaultTitle: "Rodadas" },
  specs: { label: "Ficha técnica", description: "Pares de nome e valor: controlador, sensores, linguagem, peso.", defaultTitle: "Ficha do robô" },
  project: { label: "Projeto", description: "Problema, solução e impacto, em parágrafos.", defaultTitle: "Projeto" },
  feedback: { label: "Avaliação dos juízes", description: "Por área: o que foi elogiado e o que melhorar.", defaultTitle: "Avaliação dos juízes" },
  timeline: { label: "Linha do tempo", description: "Datas importantes do período.", defaultTitle: "Linha do tempo" },
  people: { label: "Pessoas e apoio", description: "Mentores, voluntários, patrocinadores e agradecimentos.", defaultTitle: "Agradecimentos" },
};

/** Modelos prontos de seção, por liga (`leagues` vazio = serve para todas). */
export const LEGACY_SECTION_TEMPLATES: {
  id: string;
  leagues: LegacyLeague[];
  kind: LegacySectionKind;
  title: string;
  description: string;
  showTime?: boolean;
  rows?: string[];
}[] = [
  // FLL
  { id: "fll-robot-game", leagues: ["fll"], kind: "scores", title: "Robot Game — rodadas", description: "As três rodadas oficiais (e as de treino, se quiser).", rows: ["Rodada 1", "Rodada 2", "Rodada 3"] },
  { id: "fll-innovation", leagues: ["fll"], kind: "project", title: "Projeto de Inovação", description: "Problema, pesquisa, solução e como foi compartilhado.", rows: ["Problema", "Pesquisa", "Solução", "Compartilhamento"] },
  { id: "fll-robot-design", leagues: ["fll"], kind: "specs", title: "Design do robô", description: "Kit, motores, sensores, anexos e estratégia.", rows: ["Kit", "Motores", "Sensores", "Anexos", "Linguagem"] },
  { id: "fll-judging", leagues: ["fll"], kind: "feedback", title: "Rubricas e feedback", description: "Core Values, Projeto de Inovação e Design do Robô.", rows: ["Core Values", "Projeto de Inovação", "Design do Robô"] },
  // OBR
  { id: "obr-rescue", leagues: ["obr"], kind: "scores", title: "Resgate — rodadas", description: "Pontos e tempo de cada rodada da prova prática.", showTime: true, rows: ["Rodada 1", "Rodada 2", "Rodada 3"] },
  { id: "obr-robot", leagues: ["obr"], kind: "specs", title: "Ficha do robô (Resgate)", description: "Controlador, sensores de linha e cor, garra, linguagem.", rows: ["Controlador", "Sensores", "Atuadores / garra", "Linguagem", "Peso"] },
  { id: "obr-theory", leagues: ["obr"], kind: "scores", title: "Prova teórica", description: "Nota de cada estudante ou de cada nível.", rows: [] },
  { id: "obr-artistic", leagues: ["obr"], kind: "project", title: "Robótica Artística", description: "Tema, roteiro, robôs e apresentação.", rows: ["Tema", "Roteiro", "Robôs", "Apresentação"] },
  // FTC
  { id: "ftc-matches", leagues: ["ftc"], kind: "scores", title: "Partidas", description: "Qualificatórias e eliminatórias.", rows: ["Qualificatória 1", "Qualificatória 2", "Qualificatória 3"] },
  { id: "ftc-portfolio", leagues: ["ftc"], kind: "links", title: "Portfólio de engenharia", description: "Portfólio, CAD, código e vídeos.", rows: ["Portfólio", "CAD", "Código"] },
  // Todas
  { id: "media", leagues: [], kind: "links", title: "Fotos e vídeos", description: "Álbum, vídeo das rodadas, reportagens.", rows: [] },
  { id: "timeline", leagues: [], kind: "timeline", title: "Linha do tempo", description: "Inscrição, treinos marcantes, etapas.", rows: [] },
  { id: "people", leagues: [], kind: "people", title: "Agradecimentos", description: "Mentores, escola, patrocinadores, voluntários.", rows: [] },
  { id: "text", leagues: [], kind: "text", title: "Relato", description: "Um texto livre com título.", rows: [] },
];

export const LEGACY_SECTION_LIMITS = { sections: 20, rows: 50, title: 80, text: 6000, label: 120, value: 300, longValue: 2000, url: 500 } as const;

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

const cleanNumber = (v: unknown, max: number): number | null => {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v.replace(",", ".")) : v;
  return typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= max ? Math.round(n * 100) / 100 : null;
};

function normalizeRow(kind: LegacySectionKind, input: unknown): LegacyRow | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  const L = LEGACY_SECTION_LIMITS;
  const long = kind === "project" || kind === "feedback";
  const row: LegacyRow = { id: cleanId(r.id), label: clean(r.label, L.label) };
  const value = clean(r.value, long ? L.longValue : L.value, long);
  if (value) row.value = value;
  switch (kind) {
    case "links": {
      const url = typeof r.url === "string" ? r.url.trim().slice(0, L.url) : "";
      if (!isHttpUrl(url)) return null;
      row.url = url;
      if (!row.label) row.label = new URL(url).hostname.replace(/^www\./, "");
      delete row.value;
      return row;
    }
    case "scores": {
      row.points = cleanNumber(r.points, 1_000_000);
      row.time = cleanNumber(r.time, 86_400);
      if (!row.label && row.points === null) return null;
      return row;
    }
    case "feedback": {
      const extra = clean(r.extra, L.longValue, true);
      if (extra) row.extra = extra;
      return row.label || row.value || row.extra ? row : null;
    }
    case "timeline": {
      if (isIsoDate(r.date)) row.date = r.date as string;
      delete row.value;
      return row.label ? row : null;
    }
    default:
      return row.label || row.value ? row : null;
  }
}

export function normalizeSections(input: unknown): LegacySection[] {
  if (!Array.isArray(input)) return [];
  const L = LEGACY_SECTION_LIMITS;
  return input
    .flatMap((raw): LegacySection[] => {
      if (!raw || typeof raw !== "object") return [];
      const r = raw as Record<string, unknown>;
      if (!isLegacySectionKind(r.kind)) return [];
      const kind = r.kind;
      const section: LegacySection = {
        id: cleanId(r.id),
        kind,
        title: clean(r.title, L.title) || LEGACY_SECTION_META[kind].defaultTitle,
      };
      if (kind === "text") {
        section.text = clean(r.text, L.text, true);
      } else {
        section.rows = (Array.isArray(r.rows) ? r.rows : [])
          .map((row) => normalizeRow(kind, row))
          .filter((row): row is LegacyRow => row !== null)
          .slice(0, L.rows);
      }
      if (kind === "scores" && r.showTime === true) section.showTime = true;
      return [section];
    })
    .slice(0, L.sections);
}

/** Melhor, média e quantas rodadas pontuadas uma seção de placar tem. */
export function scoreSummary(rows: LegacyRow[] = []) {
  const points = rows.map((r) => r.points).filter((p): p is number => typeof p === "number");
  if (!points.length) return null;
  const best = Math.max(...points);
  const avg = Math.round((points.reduce((a, b) => a + b, 0) / points.length) * 10) / 10;
  const bestRow = rows.find((r) => r.points === best) ?? null;
  return { best, avg, count: points.length, bestTime: bestRow?.time ?? null };
}

export function formatSeconds(total: number | null | undefined): string {
  if (total === null || total === undefined) return "—";
  const m = Math.floor(total / 60);
  const sec = Math.round(total % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** "3:05" ou "185" → segundos. */
export function parseSeconds(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const m = /^(\d{1,3}):([0-5]?\d)$/.exec(t);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Tipo de link pelo endereço (só para o ícone). */
export function linkKind(url: string): "video" | "photos" | "code" | "doc" | "link" {
  const h = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (/youtube\.com|youtu\.be|vimeo\.com|tiktok\.com/.test(h)) return "video";
  if (/photos\.google|photos\.app\.goo\.gl|flickr|instagram\.com/.test(h)) return "photos";
  if (/github\.com|gitlab\.com|bitbucket|replit|onshape|cad\./.test(h)) return "code";
  if (/docs\.google|drive\.google|canva\.com|notion|onedrive|sharepoint|dropbox/.test(h)) return "doc";
  return "link";
}

/** Seção nova a partir de um modelo (linhas já com rótulo). */
export function sectionFromTemplate(templateId: string): LegacySection | null {
  const t = LEGACY_SECTION_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return null;
  const section: LegacySection = { id: newId(), kind: t.kind, title: t.title };
  if (t.kind === "text") section.text = "";
  else section.rows = (t.rows ?? []).map((label) => ({ id: newId(), label, ...(t.kind === "scores" ? { points: null, time: null } : {}) }));
  if (t.showTime) section.showTime = true;
  return section;
}

export const LEGACY_LIMITS = {
  title: 100,
  location: 120,
  summary: 6000,
  result: 200,
  robotName: 100,
  awards: 30,
  awardTitle: 120,
  awardDetail: 300,
  highlights: 30,
  highlightText: 300,
  lessons: 4000,
  members: 60,
  note: 200,
  /** Itens guardados por aba. */
  items: 200,
  /** Itens transferidos de uma vez. */
  transferBatch: 50,
} as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_RE = /^#[0-9a-f]{6}$/i;

export const isLegacyChapterKind = (v: unknown): v is LegacyChapterKind =>
  typeof v === "string" && (LEGACY_CHAPTER_KINDS as readonly string[]).includes(v);

export const isIsoDate = (v: unknown): v is string => {
  if (typeof v !== "string" || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

export const isHexColor = (v: unknown): v is string => typeof v === "string" && COLOR_RE.test(v);

const clean = (v: unknown, max: number, multiline = false): string => {
  if (typeof v !== "string") return "";
  const text = multiline
    ? v.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim()
    : v.replace(/\s+/g, " ").trim();
  return text.slice(0, max);
};

let seq = 0;
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : `${Date.now().toString(36)}${(seq++).toString(36)}`;

const cleanId = (v: unknown) => (typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : newId());

/**
 * Normaliza o conteúdo vindo do navegador: corta tamanhos, descarta itens
 * vazios ou com formato errado e remove chaves vazias (o jsonb fica enxuto).
 */
export function normalizeLegacyContent(input: unknown): LegacyContent {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: LegacyContent = {};

  const summary = clean(raw.summary, LEGACY_LIMITS.summary, true);
  if (summary) out.summary = summary;
  const result = clean(raw.result, LEGACY_LIMITS.result);
  if (result) out.result = result;
  const robotName = clean(raw.robotName, LEGACY_LIMITS.robotName);
  if (robotName) out.robotName = robotName;
  const lessons = clean(raw.lessons, LEGACY_LIMITS.lessons, true);
  if (lessons) out.lessons = lessons;

  if (Array.isArray(raw.awards)) {
    const awards = raw.awards
      .flatMap((a): LegacyAward[] => {
        if (!a || typeof a !== "object") return [];
        const r = a as Record<string, unknown>;
        const title = clean(r.title, LEGACY_LIMITS.awardTitle);
        if (!title) return [];
        return [{ id: cleanId(r.id), title, detail: clean(r.detail, LEGACY_LIMITS.awardDetail) }];
      })
      .slice(0, LEGACY_LIMITS.awards);
    if (awards.length) out.awards = awards;
  }

  if (Array.isArray(raw.highlights)) {
    const highlights = raw.highlights
      .flatMap((h): LegacyHighlight[] => {
        const r = (typeof h === "string" ? { text: h } : h) as Record<string, unknown> | null;
        if (!r || typeof r !== "object") return [];
        const text = clean(r.text, LEGACY_LIMITS.highlightText);
        return text ? [{ id: cleanId(r.id), text }] : [];
      })
      .slice(0, LEGACY_LIMITS.highlights);
    if (highlights.length) out.highlights = highlights;
  }

  const modality = clean(raw.modality, 80);
  if (modality) out.modality = modality;
  const sections = normalizeSections(raw.sections);
  if (sections.length) out.sections = sections;

  if (Array.isArray(raw.members)) {
    const members = [...new Set(raw.members.filter((m): m is string => typeof m === "string" && m.length > 0 && m.length <= 64))].slice(
      0,
      LEGACY_LIMITS.members,
    );
    if (members.length) out.members = members;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Itens guardados no legado (referências vivas às ferramentas)
// ---------------------------------------------------------------------------

export const LEGACY_ITEM_KINDS = ["stagebook", "folder", "labtest", "quickbrick", "thinklab", "journal", "kanban", "session", "milestone"] as const;
export type LegacyItemKind = (typeof LEGACY_ITEM_KINDS)[number];

export const isLegacyItemKind = (v: unknown): v is LegacyItemKind =>
  typeof v === "string" && (LEGACY_ITEM_KINDS as readonly string[]).includes(v);

export const LEGACY_ITEM_LABEL: Record<LegacyItemKind, { tool: string; one: string; many: string }> = {
  stagebook: { tool: PIN_KIND_LABEL.stagebook, one: "página", many: "páginas" },
  labtest: { tool: PIN_KIND_LABEL.labtest, one: "teste", many: "testes" },
  quickbrick: { tool: PIN_KIND_LABEL.quickbrick, one: "caderno", many: "cadernos" },
  thinklab: { tool: PIN_KIND_LABEL.thinklab, one: "quadro", many: "quadros" },
  journal: { tool: "Diário", one: "entrada", many: "entradas" },
  folder: { tool: "Pastas", one: "pasta", many: "pastas" },
  kanban: { tool: "Kanban", one: "quadro", many: "quadros" },
  session: { tool: "Treinos", one: "sessão", many: "sessões" },
  milestone: { tool: "Metas", one: "meta", many: "metas" },
};

/** Endereço do item. Sessões e metas vivem na página da equipe (`teamId`). */
export function legacyItemHref(kind: LegacyItemKind, id: string, teamId: string): string {
  switch (kind) {
    case "journal":
      return `/dashboard/diario/${id}`;
    case "folder":
      return `/dashboard/folders/${id}`;
    case "kanban":
      return `/dashboard/kanban/${id}`;
    case "session":
      return `/dashboard/team/${teamId}/treinos/${id}`;
    case "milestone":
      return `/dashboard/team/${teamId}?tab=marcos`;
    default:
      return pinHref(kind as PinKind, id);
  }
}

/** Itens que abrem uma ferramenta (precisam ativar o espaço da equipe antes). */
export const legacyItemIsTool = (kind: LegacyItemKind) => kind !== "session" && kind !== "milestone";

/** Um item guardado numa aba, com os dados vivos da ferramenta. */
export type LegacyItemDTO = {
  /** id do vínculo (team_legacy_items). */
  id: string;
  kind: LegacyItemKind;
  resourceId: string;
  title: string;
  icon: string | null;
  href: string;
  /** Detalhe curto da ferramenta: "12 rodadas", "4 fotos", "20 nov"… */
  meta: string | null;
  note: string | null;
  updatedAt: string;
};

/** Item do espaço da equipe que pode ser guardado (busca e sugestões). */
export type LegacyCandidateDTO = {
  kind: LegacyItemKind;
  id: string;
  title: string;
  icon: string | null;
  href: string;
  /** Por que foi sugerido ("mesma temporada", "criado no período"). */
  reason?: string;
  date: string;
};

export type LegacyStats = {
  /** Rodadas lançadas no LabTest no período. */
  executions: number;
  /** Maior pontuação registrada no período (rodadas com `score`). */
  bestScore: number | null;
  journalEntries: number;
  trainingSessions: number;
  milestonesCompleted: number;
};

export type LegacyMemberDTO = { id: string; name: string | null; avatarUrl: string | null; current: boolean };

export type LegacyChapterDTO = {
  id: string;
  kind: LegacyChapterKind;
  parentId: string | null;
  title: string;
  seasonKey: string | null;
  /** Liga da aba; competição sem liga própria herda a da temporada. */
  league: LegacyLeague | null;
  stage: LegacyStage | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  color: string | null;
  content: LegacyContent;
  createdBy: string | null;
  updatedAt: string;
  items: LegacyItemDTO[];
  /** Números do período (só quando há data de início). */
  stats: LegacyStats | null;
  members: LegacyMemberDTO[];
};

/** Ordem de exibição: temporadas mais recentes primeiro; sem data no fim. */
export function compareChapters(a: Pick<LegacyChapterDTO, "startDate" | "title">, b: Pick<LegacyChapterDTO, "startDate" | "title">) {
  if (a.startDate && b.startDate && a.startDate !== b.startDate) return b.startDate.localeCompare(a.startDate);
  if (a.startDate && !b.startDate) return -1;
  if (!a.startDate && b.startDate) return 1;
  return a.title.localeCompare(b.title, "pt-BR");
}

// ---------------------------------------------------------------------------
// Transferência de arquivos (pessoal → equipe)
// ---------------------------------------------------------------------------

export const TRANSFER_KINDS = ["folder", "stagebook", "labtest", "quickbrick", "thinklab"] as const;
export type TransferKind = (typeof TRANSFER_KINDS)[number];

export const isTransferKind = (v: unknown): v is TransferKind =>
  typeof v === "string" && (TRANSFER_KINDS as readonly string[]).includes(v);

export const TRANSFER_KIND_LABEL: Record<TransferKind, { tool: string; one: string; many: string }> = {
  folder: { tool: "Pastas", one: "pasta", many: "pastas" },
  stagebook: { tool: "StageBook", one: "página", many: "páginas" },
  labtest: { tool: "LabTest", one: "teste", many: "testes" },
  quickbrick: { tool: "QuickBrick", one: "caderno", many: "cadernos" },
  thinklab: { tool: "ThinkLab", one: "quadro", many: "quadros" },
};

/** Item do espaço pessoal que pode ir para uma equipe. */
export type TransferCandidateDTO = {
  kind: TransferKind;
  id: string;
  title: string;
  icon: string | null;
  /** "3 subpáginas", "5 páginas", "12 rodadas"… */
  detail: string | null;
  updatedAt: string;
};

export type TransferResultDTO = {
  moved: { kind: TransferKind; id: string; title: string; href: string }[];
  /** Totais do que foi junto (subpáginas, páginas das pastas…). */
  pages: number;
  folders: number;
  /** Nomes que mudaram para não repetir um item da equipe. */
  renamed: { from: string; to: string }[];
  /** O que ficou para trás e por quê (avisos para a pessoa). */
  notes: string[];
};
