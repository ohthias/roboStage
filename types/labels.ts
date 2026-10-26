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
  | "quickbrick";

export const LABELABLE_KINDS: LabelableKind[] = [
  "kanban-card",
  "document",
  "calendar-event",
  "thinklab",
  "labtest",
  "quickbrick",
];

export const LABELABLE_LABELS: Record<LabelableKind, string> = {
  "kanban-card": "Cards do Kanban",
  document: "Páginas",
  "calendar-event": "Eventos",
  thinklab: "Quadros do ThinkLab",
  labtest: "Testes do LabTest",
  quickbrick: "Cadernos do QuickBrick",
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

export type MilestoneDTO = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  dueAt: string | null;
};

export type MilestoneWithUsage = MilestoneDTO & {
  usage: Record<LabelableKind, number>;
  total: number;
};

export type ResourceLabels = {
  tags: TagDTO[];
  milestone: MilestoneDTO | null;
};
