/**
 * Diário — tipos, templates prontos e normalização do conteúdo.
 *
 * Sem dependências de servidor: as Server Actions usam `normalizeJournalContent`
 * como barreira (todo conteúdo vindo do navegador passa por aqui) e o editor
 * usa os mesmos tipos e templates.
 *
 * Uma entrada é uma lista de seções. Cada seção tem um tipo:
 *  - `text`: texto livre ("O que foi feito", "Próximos passos");
 *  - `checklist`: lista de tarefas com marcação de concluída;
 *  - `resolved`: itens resolvidos, cada um com um tipo/categoria
 *    ("Programação", "Mecânica"…), para o resumo por categoria.
 */

import type { MilestoneDTO, TagDTO } from "./labels";

export const JOURNAL_SECTION_KINDS = ["text", "checklist", "resolved"] as const;
export type JournalSectionKind = (typeof JOURNAL_SECTION_KINDS)[number];

export type JournalItem = {
  id: string;
  text: string;
  /** Só em `checklist`. */
  done?: boolean;
  /** Só em `resolved`: uma das categorias da entrada (ou null). */
  category?: string | null;
};

export type JournalSection = {
  id: string;
  kind: JournalSectionKind;
  title: string;
  /** Dica exibida no campo vazio. */
  placeholder?: string;
  /** Só em `text`. */
  text?: string;
  /** Em `checklist` e `resolved`. */
  items?: JournalItem[];
};

export type JournalContent = {
  /** Tipos de coisas resolvidas disponíveis nesta entrada. */
  categories: string[];
  sections: JournalSection[];
};

export const SECTION_KIND_META: Record<JournalSectionKind, { label: string; defaultTitle: string; placeholder: string }> = {
  text: { label: "Texto", defaultTitle: "Anotações", placeholder: "Escreva livremente…" },
  checklist: { label: "Tarefas", defaultTitle: "Tarefas", placeholder: "Nova tarefa" },
  resolved: { label: "Resolvido", defaultTitle: "O que foi resolvido", placeholder: "O que foi resolvido?" },
};

export const DEFAULT_JOURNAL_CATEGORIES = [
  "Programação",
  "Mecânica",
  "Eletrônica",
  "Estratégia",
  "Projeto de inovação",
  "Documentação",
  "Organização",
];

// ---------------------------------------------------------------------------
// Limites (o servidor corta o que passar disso)
// ---------------------------------------------------------------------------

export const JOURNAL_LIMITS = {
  title: 120,
  sections: 20,
  sectionTitle: 80,
  text: 20_000,
  items: 100,
  itemText: 500,
  categories: 20,
  category: 40,
  templateName: 60,
  templateDescription: 200,
} as const;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Ícones permitidos para templates (nomes do lucide-react). */
export const JOURNAL_TEMPLATE_ICONS = [
  "NotebookPen",
  "Dumbbell",
  "Code2",
  "Lightbulb",
  "MessagesSquare",
  "Wrench",
  "Trophy",
  "FileText",
] as const;
export type JournalTemplateIcon = (typeof JOURNAL_TEMPLATE_ICONS)[number];

export type JournalTemplate = {
  /** Chave de um template pronto (`builtin:*`) ou o uuid de um template salvo. */
  key: string;
  name: string;
  description: string;
  icon: JournalTemplateIcon;
  builtin: boolean;
  content: JournalContent;
  /** Só nos templates salvos. */
  createdBy?: string | null;
  canManage?: boolean;
};

let seq = 0;
/** id curto e estável o bastante para chaves de React e para o JSON salvo. */
export function journalId(prefix = "j"): string {
  seq = (seq + 1) % 1_000_000;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}${rand}`;
}

type SectionSeed = { kind: JournalSectionKind; title: string; placeholder?: string; items?: string[] };

function seedContent(sections: SectionSeed[], categories = DEFAULT_JOURNAL_CATEGORIES): JournalContent {
  return {
    categories: [...categories],
    sections: sections.map((s, i) => ({
      id: `s${i + 1}`,
      kind: s.kind,
      title: s.title,
      placeholder: s.placeholder,
      ...(s.kind === "text"
        ? { text: "" }
        : { items: (s.items ?? []).map((text, j) => ({ id: `s${i + 1}i${j + 1}`, text, done: false, category: null })) }),
    })),
  };
}

export const BUILTIN_JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    key: "builtin:dia",
    name: "Dia de trabalho",
    description: "O que foi feito, as tarefas e o que ficou resolvido.",
    icon: "NotebookPen",
    builtin: true,
    content: seedContent([
      { kind: "text", title: "O que foi feito hoje", placeholder: "Resuma o dia em poucas linhas…" },
      { kind: "checklist", title: "Tarefas" },
      { kind: "resolved", title: "O que foi resolvido" },
    ]),
  },
  {
    key: "builtin:treino",
    name: "Treino da equipe",
    description: "Objetivo, checklist do treino, problemas resolvidos e próximos passos.",
    icon: "Dumbbell",
    builtin: true,
    content: seedContent([
      { kind: "text", title: "Objetivo do treino", placeholder: "O que a equipe queria alcançar hoje?" },
      {
        kind: "checklist",
        title: "Checklist do treino",
        items: ["Baterias carregadas", "Robô revisado", "Rodadas cronometradas"],
      },
      { kind: "resolved", title: "Problemas resolvidos" },
      { kind: "text", title: "Próximos passos", placeholder: "O que fica para o próximo encontro?" },
    ]),
  },
  {
    key: "builtin:programacao",
    name: "Sessão de programação",
    description: "Tarefas de código, bugs corrigidos e aprendizados.",
    icon: "Code2",
    builtin: true,
    content: seedContent(
      [
        { kind: "checklist", title: "Tarefas de código" },
        { kind: "resolved", title: "Corrigido e melhorado" },
        { kind: "text", title: "Aprendizados", placeholder: "Algo que vale lembrar da próxima vez?" },
      ],
      ["Bug", "Melhoria", "Sensor", "Trajetória", "Refatoração", "Teste"],
    ),
  },
  {
    key: "builtin:projeto",
    name: "Projeto de inovação",
    description: "Pesquisa, contatos, decisões e o que avançou no projeto.",
    icon: "Lightbulb",
    builtin: true,
    content: seedContent(
      [
        { kind: "text", title: "Pesquisa e descobertas", placeholder: "Fontes, entrevistas, dados…" },
        { kind: "resolved", title: "Decisões e avanços" },
        { kind: "checklist", title: "Pendências" },
      ],
      ["Pesquisa", "Especialista", "Protótipo", "Compartilhamento", "Apresentação"],
    ),
  },
  {
    key: "builtin:daily",
    name: "Daily rápida",
    description: "O que fiz, o que vou fazer e o que está travando.",
    icon: "MessagesSquare",
    builtin: true,
    content: seedContent([
      { kind: "text", title: "O que eu fiz", placeholder: "Desde o último registro…" },
      { kind: "checklist", title: "O que vou fazer" },
      { kind: "text", title: "Bloqueios", placeholder: "Algo travando? Quem pode ajudar?" },
    ]),
  },
  {
    key: "builtin:branco",
    name: "Em branco",
    description: "Só um campo de texto. Adicione seções quando quiser.",
    icon: "FileText",
    builtin: true,
    content: seedContent([{ kind: "text", title: "Anotações" }]),
  },
];

export const DEFAULT_JOURNAL_TEMPLATE_KEY = "builtin:dia";

export function findBuiltinTemplate(key: string | null | undefined): JournalTemplate | undefined {
  return BUILTIN_JOURNAL_TEMPLATES.find((t) => t.key === key);
}

/** Conteúdo novo a partir de um template, com ids novos (duas entradas nunca compartilham ids). */
export function contentFromTemplate(content: JournalContent): JournalContent {
  return {
    categories: [...content.categories],
    sections: content.sections.map((s) => ({
      ...s,
      id: journalId("s"),
      ...(s.kind === "text"
        ? { text: s.text ?? "" }
        : { items: (s.items ?? []).map((it) => ({ ...it, id: journalId("i"), done: false })) }),
    })),
  };
}

/**
 * Esqueleto reutilizável de uma entrada (para "Salvar como template"):
 * mantém títulos, dicas, categorias e as tarefas fixas da checklist (desmarcadas);
 * descarta o texto escrito e os itens resolvidos, que são do dia.
 */
export function templateFromContent(content: JournalContent): JournalContent {
  return {
    categories: [...content.categories],
    sections: content.sections.map((s) => ({
      id: s.id,
      kind: s.kind,
      title: s.title,
      placeholder: s.placeholder,
      ...(s.kind === "text"
        ? { text: "" }
        : s.kind === "checklist"
          ? { items: (s.items ?? []).filter((it) => it.text.trim()).map((it) => ({ id: it.id, text: it.text, done: false, category: null })) }
          : { items: [] }),
    })),
  };
}

// ---------------------------------------------------------------------------
// Normalização (barreira do servidor)
// ---------------------------------------------------------------------------

const ID_RE = /^[A-Za-z0-9_-]{1,48}$/;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const oneLine = (v: unknown, max: number) => str(v, max * 2).replace(/\s+/g, " ").trim().slice(0, max);

/** Categorias: sem vazias, sem repetidas (ignorando maiúsculas), no máximo 20. */
export function normalizeCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of raw) {
    const c = oneLine(value, JOURNAL_LIMITS.category);
    const k = c.toLocaleLowerCase("pt-BR");
    if (!c || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= JOURNAL_LIMITS.categories) break;
  }
  return out;
}

/**
 * Valida e limpa um conteúdo vindo do navegador. Nunca lança: o que não fizer
 * sentido é descartado ou corrigido (tipo desconhecido vira texto, id inválido
 * ganha um novo, categoria que não existe na entrada vira null).
 */
export function normalizeJournalContent(raw: unknown): JournalContent {
  const obj = (raw && typeof raw === "object" ? raw : {}) as { categories?: unknown; sections?: unknown };
  const categories = normalizeCategories(obj.categories);
  const known = new Map(categories.map((c) => [c.toLocaleLowerCase("pt-BR"), c]));
  const usedIds = new Set<string>();
  const safeId = (v: unknown, prefix: string) => {
    let id = typeof v === "string" && ID_RE.test(v) && !usedIds.has(v) ? v : journalId(prefix);
    while (usedIds.has(id)) id = journalId(prefix);
    usedIds.add(id);
    return id;
  };

  const rawSections = Array.isArray(obj.sections) ? obj.sections.slice(0, JOURNAL_LIMITS.sections) : [];
  const sections: JournalSection[] = rawSections.map((value) => {
    const s = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const kind: JournalSectionKind = (JOURNAL_SECTION_KINDS as readonly string[]).includes(s.kind as string)
      ? (s.kind as JournalSectionKind)
      : "text";
    const title = oneLine(s.title, JOURNAL_LIMITS.sectionTitle) || SECTION_KIND_META[kind].defaultTitle;
    const placeholder = oneLine(s.placeholder, JOURNAL_LIMITS.sectionTitle * 2) || undefined;
    const base = { id: safeId(s.id, "s"), kind, title, ...(placeholder ? { placeholder } : {}) };

    if (kind === "text") return { ...base, text: str(s.text, JOURNAL_LIMITS.text) };

    const rawItems = Array.isArray(s.items) ? s.items.slice(0, JOURNAL_LIMITS.items) : [];
    const items: JournalItem[] = rawItems.map((itemValue) => {
      const it = (itemValue && typeof itemValue === "object" ? itemValue : {}) as Record<string, unknown>;
      const text = oneLine(it.text, JOURNAL_LIMITS.itemText);
      if (kind === "checklist") return { id: safeId(it.id, "i"), text, done: it.done === true };
      const cat = typeof it.category === "string" ? known.get(it.category.trim().toLocaleLowerCase("pt-BR")) ?? null : null;
      return { id: safeId(it.id, "i"), text, category: cat };
    });
    return { ...base, items };
  });

  return { categories, sections };
}

// ---------------------------------------------------------------------------
// Resumo e texto
// ---------------------------------------------------------------------------

export type JournalStats = {
  tasksTotal: number;
  tasksDone: number;
  resolved: number;
  /** Itens resolvidos por categoria, na ordem das categorias da entrada. */
  byCategory: { category: string; count: number }[];
  /** Itens resolvidos sem categoria. */
  uncategorized: number;
  words: number;
};

export function journalStats(content: JournalContent): JournalStats {
  let tasksTotal = 0;
  let tasksDone = 0;
  let resolved = 0;
  let uncategorized = 0;
  let words = 0;
  const counts = new Map<string, number>();
  const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

  for (const s of content.sections) {
    if (s.kind === "text") {
      words += countWords(s.text ?? "");
      continue;
    }
    for (const it of s.items ?? []) {
      if (!it.text.trim()) continue;
      words += countWords(it.text);
      if (s.kind === "checklist") {
        tasksTotal++;
        if (it.done) tasksDone++;
      } else {
        resolved++;
        if (it.category) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
        else uncategorized++;
      }
    }
  }

  const byCategory = content.categories
    .map((category) => ({ category, count: counts.get(category) ?? 0 }))
    .filter((c) => c.count > 0);
  return { tasksTotal, tasksDone, resolved, byCategory, uncategorized, words };
}

/** A entrada tem algo escrito (título, texto ou algum item)? */
export function hasJournalContent(content: JournalContent, title = ""): boolean {
  if (title.trim()) return true;
  return content.sections.some((s) => (s.kind === "text" ? !!s.text?.trim() : (s.items ?? []).some((it) => it.text.trim())));
}

/** Primeiro trecho de texto, para a prévia na lista. */
export function journalExcerpt(content: JournalContent, max = 180): string {
  for (const s of content.sections) {
    const t = s.kind === "text" ? s.text?.trim() : (s.items ?? []).map((i) => i.text.trim()).filter(Boolean).join(" · ");
    if (t) return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
  }
  return "";
}

/** Texto puro (busca e "copiar como texto"). */
export function journalToPlainText(entry: { title: string | null; entryDate: string; content: JournalContent }): string {
  const lines: string[] = [];
  lines.push(entry.title?.trim() || `Diário de ${formatJournalDate(entry.entryDate, "long")}`);
  lines.push(formatJournalDate(entry.entryDate, "long"));
  for (const s of entry.content.sections) {
    const body =
      s.kind === "text"
        ? (s.text ?? "").trim()
        : (s.items ?? [])
            .filter((it) => it.text.trim())
            .map((it) =>
              s.kind === "checklist" ? `- [${it.done ? "x" : " "}] ${it.text}` : `- ${it.text}${it.category ? ` (${it.category})` : ""}`,
            )
            .join("\n");
    if (!body) continue;
    lines.push("", `## ${s.title}`, body);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Datas (a entrada guarda só o dia, "YYYY-MM-DD", sem fuso)
// ---------------------------------------------------------------------------

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "YYYY-MM-DD" válido (dia que existe no calendário)? */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Hoje no fuso de quem está usando (o navegador sabe; o servidor não). */
export function localToday(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** "2026-11" do dia. */
export const monthOf = (iso: string) => iso.slice(0, 7);

export function formatJournalDate(iso: string, style: "long" | "short" | "weekday" = "short"): string {
  if (!isIsoDate(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const opts: Intl.DateTimeFormatOptions =
    style === "long"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
      : style === "weekday"
        ? { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }
        : { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" };
  return dt.toLocaleDateString("pt-BR", opts).replace(/\./g, "");
}

/** Dias seguidos com registro até `today` (ou até ontem, se hoje ainda não tem). */
export function journalStreak(dates: Iterable<string>, today: string): number {
  const set = new Set(dates);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type JournalAuthor = { id: string; name: string | null; avatarUrl: string | null };

/** Ferramentas que uma entrada pode vincular (mesmos tipos dos fixados). */
export const JOURNAL_LINK_KINDS = ["stagebook", "labtest", "quickbrick", "thinklab"] as const;
export type JournalLinkKind = (typeof JOURNAL_LINK_KINDS)[number];
export const JOURNAL_LINK_LABEL: Record<JournalLinkKind, { label: string; noun: string }> = {
  stagebook: { label: "StageBook", noun: "página" },
  labtest: { label: "LabTest", noun: "teste" },
  quickbrick: { label: "QuickBrick", noun: "caderno" },
  thinklab: { label: "ThinkLab", noun: "quadro" },
};
export const JOURNAL_MAX_LINKS = 30;

export type JournalLink = {
  /** id do vínculo (para remover). */
  linkId: string;
  kind: JournalLinkKind;
  id: string;
  title: string;
  icon: string | null;
  href: string;
};

export type JournalLinkTarget = Omit<JournalLink, "linkId"> & { updatedAt: string };

export type JournalEntryListItem = {
  id: string;
  entryDate: string;
  title: string | null;
  templateKey: string | null;
  excerpt: string;
  stats: JournalStats;
  author: JournalAuthor;
  isMine: boolean;
  updatedAt: string;
  tags: TagDTO[];
  milestone: MilestoneDTO | null;
  linkCount: number;
};

export type JournalEntryDetail = {
  id: string;
  entryDate: string;
  title: string | null;
  templateKey: string | null;
  content: JournalContent;
  author: JournalAuthor;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  tags: TagDTO[];
  milestone: MilestoneDTO | null;
  links: JournalLink[];
};

export type JournalScopeInfo =
  | { type: "personal" }
  | { type: "team"; teamId: string; teamName: string; members: JournalAuthor[] };
