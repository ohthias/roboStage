/** Categorias da "limpeza de dados" (espaço pessoal). Sem dependências de servidor. */
export const CLEANUP_CATEGORIES = [
  "documents",
  "kanban",
  "thinklab",
  "tests",
  "calendar",
  "labels",
  "notifications",
] as const;

export type CleanupCategory = (typeof CLEANUP_CATEGORIES)[number];
export type CleanupResult = Partial<Record<CleanupCategory, number>>;

export const CLEANUP_META: Record<CleanupCategory, { label: string; description: string }> = {
  documents: { label: "Páginas e pastas", description: "Páginas do StageBook e pastas pessoais." },
  kanban: { label: "Kanbans", description: "Quadros pessoais, com colunas e cards." },
  thinklab: { label: "Quadros do ThinkLab", description: "Diagramas e ideias pessoais." },
  tests: { label: "LabTests", description: "Testes pessoais e todas as execuções registradas." },
  calendar: { label: "Eventos do calendário", description: "Eventos do seu calendário pessoal." },
  labels: { label: "Tags e milestones", description: "Etiquetas e marcos pessoais." },
  notifications: { label: "Notificações", description: "Histórico de notificações." },
};
