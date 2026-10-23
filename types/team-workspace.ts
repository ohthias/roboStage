import type { MilestoneDTO } from "@/types/labels";
import type { TeamRole } from "@/utils/stagebook/team-permissions";

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
