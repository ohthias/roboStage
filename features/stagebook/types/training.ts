/** Tipos serializáveis das sessões de treino, da escala e do feed (servidor → UI). */

export const SESSION_KINDS = ["treino", "simulado", "competicao"] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const SESSION_STATUSES = ["planejada", "em_andamento", "encerrada"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_KIND_LABEL: Record<SessionKind, string> = {
  treino: "Treino",
  simulado: "Simulado",
  competicao: "Competição",
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  encerrada: "Encerrada",
};

export function sessionKindLabel(kind: string): string {
  return SESSION_KIND_LABEL[kind as SessionKind] ?? kind;
}

export function sessionStatusLabel(status: string): string {
  return SESSION_STATUS_LABEL[status as SessionStatus] ?? status;
}

/** Resumo calculado ao encerrar a sessão (guardado em `training_sessions.summary`). */
export type TrainingSummary = {
  durationMin: number | null;
  attendees: number;
  executions: number;
  tests: {
    testId: string;
    name: string;
    runs: number;
    /** Null quando o teste não é de pontuação (calibração, personalizado...). */
    best: number | null;
    avg: number | null;
    /** Média do mesmo teste na última sessão encerrada que o rodou. */
    prevAvg: number | null;
  }[];
  anatix: { sessionId: string; labId: string; robotName: string | null; frames: number }[];
  byOperator: { userId: string | null; runs: number; avg: number | null }[];
  byDuty?: {
    dutyRoleId: string;
    label: string;
    userId: string;
    rounds: number[];
    runs: number;
    avg: number | null;
  }[];
};

export type TrainingSessionListItem = {
  id: string;
  title: string;
  kind: string;
  status: string;
  location: string | null;
  scheduledFor: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdBy: string;
  creatorName: string | null;
  attendeeCount: number;
  executionCount: number;
  summary: Partial<TrainingSummary>;
  rosterPublishedAt: string | null;
};

export type ActiveSessionRef = {
  id: string;
  teamId: string;
  title: string;
  kind: string;
  startedAt: string | null;
};

export type DutyRoleDTO = {
  id: string;
  label: string;
  description: string | null;
  color: string | null;
  position: number;
  maxPerSlot: number | null;
  archived: boolean;
};

export type DutyAssignmentDTO = {
  id: string;
  dutyRoleId: string;
  userId: string;
  round: number | null;
};

export type SessionExecutionDTO = {
  id: string;
  testId: string;
  testName: string;
  executionNumber: number;
  score: number | null;
  operatorId: string | null;
  operatorName: string | null;
  createdAt: string;
};

export type SessionAnatixDTO = {
  id: string;
  labId: string;
  labName: string;
  robotName: string | null;
  frameCount: number;
  startedAt: string;
  endedAt: string | null;
};

export type TeamActivityItem = {
  id: string;
  verb: string;
  entityType: string | null;
  entityId: string | null;
  data: Record<string, unknown>;
  count: number;
  createdAt: string;
  updatedAt: string;
  actor: { id: string; name: string | null; avatarUrl: string | null } | null;
};

export type UpcomingDuty = {
  sessionId: string;
  sessionTitle: string;
  when: string | null;
  duties: { label: string; rounds: (number | null)[] }[];
};

export type MemberDutyHistory = Record<string, { label: string; count: number }[]>;
