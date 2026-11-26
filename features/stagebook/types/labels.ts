/**
 * Tipos compartilhados do sistema UNIVERSAL de tags e milestones.
 * (Sem dependências de servidor: usados por client components e por actions.)
 */

/** Ferramentas que aceitam tags e milestone. */
export type LabelableKind =
  | "kanban-card"
  | "document"
  | "calendar-event"
  | "thinklab"
  | "labtest"
  | "quickbrick"
  | "journal";

export const LABELABLE_KINDS: LabelableKind[] = [
  "kanban-card",
  "document",
  "calendar-event",
  "thinklab",
  "labtest",
  "quickbrick",
  "journal",
];

export const LABELABLE_LABELS: Record<LabelableKind, string> = {
  "kanban-card": "Cards do Kanban",
  document: "Páginas",
  "calendar-event": "Eventos",
  thinklab: "Quadros do ThinkLab",
  labtest: "Testes do LabTest",
  quickbrick: "Cadernos do QuickBrick",
  journal: "Entradas do Diário",
};

export type TagDTO = {
  id: string;
  name: string;
  /** Cor de fundo escolhida (#rrggbb) ou null (cor automática pelo nome). */
  color: string | null;
};

export type TagWithUsage = TagDTO & {
  usage: Record<LabelableKind, number>;
  total: number;
};

/** Critério de conclusão de um marco (meta): uma linha de checklist. */
export type MilestoneCriterion = {
  id: string;
  text: string;
  done: boolean;
  doneAt?: string | null;
  doneBy?: string | null;
};

export type MilestoneDTO = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  dueAt: string | null;
  /** Critérios de conclusão (checklist da meta). */
  criteria: MilestoneCriterion[];
  /** Marco concluído (ISO) ou null. */
  completedAt: string | null;
};

export const MILESTONE_CRITERIA_LIMITS = { items: 20, text: 160 } as const;

/** Limpa critérios vindos do navegador (nunca lança). */
export function normalizeCriteria(raw: unknown): MilestoneCriterion[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: MilestoneCriterion[] = [];
  for (const value of raw) {
    const c = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const text = typeof c.text === "string" ? c.text.replace(/\s+/g, " ").trim().slice(0, MILESTONE_CRITERIA_LIMITS.text) : "";
    if (!text) continue;
    let id = typeof c.id === "string" && /^[A-Za-z0-9_-]{1,48}$/.test(c.id) ? c.id : "";
    while (!id || seen.has(id)) id = `c${Math.random().toString(36).slice(2, 10)}`;
    seen.add(id);
    const done = c.done === true;
    out.push({
      id,
      text,
      done,
      doneAt: done && typeof c.doneAt === "string" ? c.doneAt : null,
      doneBy: done && typeof c.doneBy === "string" ? c.doneBy : null,
    });
    if (out.length >= MILESTONE_CRITERIA_LIMITS.items) break;
  }
  return out;
}

/** Progresso de uma meta: critérios + cards do Kanban vinculados. Null se não há nada para medir. */
export function milestoneProgress(
  criteria: MilestoneCriterion[],
  cards: { done: number; total: number } = { done: 0, total: 0 },
): { done: number; total: number; pct: number } | null {
  const done = criteria.filter((c) => c.done).length + cards.done;
  const total = criteria.length + cards.total;
  return total ? { done, total, pct: Math.round((done / total) * 100) } : null;
}

export type MilestoneWithUsage = MilestoneDTO & {
  usage: Record<LabelableKind, number>;
  total: number;
};

export type ResourceLabels = {
  tags: TagDTO[];
  milestone: MilestoneDTO | null;
};
