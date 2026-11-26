import type { LabelableKind, MilestoneDTO } from "@/features/stagebook/types/labels";
import type { TeamRole } from "@/features/stagebook/lib/team-permissions";

/** Tipos dos dados que a página da equipe passa do servidor para a UI (tudo serializável). */

export type MilestoneRef = Pick<MilestoneDTO, "id" | "name" | "color" | "dueAt">;

export type TeamBoardSummary = {
  id: string;
  name: string;
  description: string | null;
  cardCount: number;
  /** `created_by` — quem criou (pode excluir mesmo sendo membro). */
  createdBy: string;
  creatorName: string | null;
  updatedAt: string;
};

export type TeamThinkLabSummary = {
  id: string;
  name: string;
  description: string | null;
  /** `user_id` guarda o criador mesmo em itens de equipe. */
  createdBy: string;
  creatorName: string | null;
  milestone: MilestoneRef | null;
  updatedAt: string;
};

export type TeamLabTestSummary = TeamThinkLabSummary & {
  mode: string;
  status: string;
  season: string | null;
};

export type TeamMemberSummary = {
  userId: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: TeamRole;
  joinedAt: string;
};

export type TeamMilestoneSummary = MilestoneDTO & { usageTotal: number };

/** Uma meta (marco) da equipe com progresso e o que a equipe registrou no Diário. */
export type TeamGoal = TeamMilestoneSummary & {
  /** Itens vinculados por ferramenta. */
  usage: Record<LabelableKind, number>;
  /** Cards do Kanban vinculados (concluídos / total). */
  cards: { done: number; total: number };
  /** Critérios + cards. Null quando não há o que medir. */
  progress: { done: number; total: number; pct: number } | null;
  journal: {
    count: number;
    contributors: number;
    lastDate: string | null;
    recent: { id: string; title: string | null; entryDate: string; author: { id: string; name: string | null; avatarUrl: string | null } }[];
    /** Entradas por semana, das 8 últimas semanas (a última é a atual). */
    weeks: number[];
  };
};
