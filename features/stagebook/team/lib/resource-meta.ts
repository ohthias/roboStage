import { FlaskConical, KanbanSquare, Lightbulb, type LucideIcon } from "lucide-react";

export type ResourceKind = "kanban" | "thinklab" | "labtest";

/**
 * Metadados dos três recursos que a equipe cria. As rotas de abertura ficam
 * todas aqui: se uma ferramenta mudar de URL, é só trocar `href`.
 */
export const RESOURCE_META: Record<
  ResourceKind,
  {
    title: string;
    subtitle: string;
    newLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    emptyTitle: string;
    emptyText: string;
    Icon: LucideIcon;
    href: (id: string) => string;
  }
> = {
  kanban: {
    title: "Kanbans",
    subtitle: "Quadros de tarefas da equipe, com colunas e cards.",
    newLabel: "Novo kanban",
    nameLabel: "Nome do kanban",
    namePlaceholder: "Ex.: Missões da rodada 2",
    emptyTitle: "Nenhum kanban ainda",
    emptyText: "Crie o primeiro quadro para organizar quem faz o quê.",
    Icon: KanbanSquare,
    href: (id) => `/dashboard/kanban/${id}`,
  },
  thinklab: {
    title: "ThinkLab",
    subtitle: "Quadros de ideias, fluxogramas e pesquisas da equipe.",
    newLabel: "Novo quadro",
    nameLabel: "Nome do quadro",
    namePlaceholder: "Ex.: Estratégia de garra",
    emptyTitle: "Nenhum quadro no ThinkLab",
    emptyText: "Crie um quadro para desenhar ideias e decisões de projeto juntos.",
    Icon: Lightbulb,
    href: (id) => `/dashboard/thinklab/${id}`,
  },
  labtest: {
    title: "LabTests",
    subtitle: "Testes e calibrações do robô, com execuções registradas.",
    newLabel: "Novo teste",
    nameLabel: "Nome do teste",
    namePlaceholder: "Ex.: Precisão do giro 90°",
    emptyTitle: "Nenhum teste ainda",
    emptyText: "Crie um LabTest para registrar execuções e comparar resultados.",
    Icon: FlaskConical,
    href: (id) => `/dashboard/labtest/${id}`,
  },
};

export const TEST_MODE_LABEL: Record<string, string> = {
  runs: "Runs",
  calibrabot: "Calibrabot",
  individual: "Calibrabot · Motores",
  custom: "Customizado",
};

export const TEST_STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  planejamento: { label: "Planejamento", badgeClass: "badge-ghost" },
  em_andamento: { label: "Em andamento", badgeClass: "badge-warning" },
  concluido: { label: "Concluído", badgeClass: "badge-success" },
  cancelado: { label: "Cancelado", badgeClass: "badge-error" },
};

export const TEST_MODE_OPTIONS = ["runs", "calibrabot", "individual", "custom"] as const;
