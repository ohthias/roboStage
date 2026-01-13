/* -------------------- ENUMS & TYPES BASE -------------------- */

export type MissionStatus = "pending" | "active" | "completed";
export type SubmissionStatus = "pending" | "completed";

/* -------------------- SUBMISSION -------------------- */

export interface MissionSubmission {
  id: string;
  label: string;
  status: SubmissionStatus;
}

/* -------------------- MISSION (NÓ DO FLUXO) -------------------- */

export interface Mission {
  id: string;

  /** ID original da missão no catálogo/API */
  apiMissionId: string;

  name: string;
  description: string;

  status: MissionStatus;

  /** Submissões internas da missão */
  submissions?: MissionSubmission[];

  /** Pontuação futura (simulação / scoring engine) */
  score?: number;

  /** Observações do usuário */
  notes?: string;
}

/* -------------------- STEP (EXECUÇÃO SIMULTÂNEA) -------------------- */

export interface MissionStep {
  id: string;

  /**
   * Missões executadas em paralelo
   * (mesma janela de tempo / mesmo robô)
   */
  missions: Mission[];
}

/* -------------------- EXIT STRATEGY -------------------- */

export interface ExitStrategy {
  id: string;
  name: string;

  /** Timestamp de criação */
  createdAt: number;

  /** Fluxo sequencial de execução */
  steps: MissionStep[];

  /** Metadados opcionais */
  description?: string;
  author?: string;
}

/* -------------------- API / CATALOG -------------------- */

export interface ApiMission {
  id: string;
  name: string;

  /** Descrição oficial da missão */
  mission: string;

  /**
   * Submissões vindas da API
   * Ex:
   * [
   *   { submission: "Target locked" },
   *   { submission: "Element placed" }
   * ]
   */
  "sub-mission"?: {
    submission: string;
  }[];

  /** Pontuação base da missão */
  baseScore?: number;

  /** Categoria ou tipo (futuro filtro) */
  category?: string;
}

/* -------------------- EXPORT FORMAT -------------------- */

export interface ExportedStrategy {
  meta: {
    name: string;
    createdAt: number;
    totalSteps: number;
    totalMissions: number;
  };
  steps: {
    order: number;
    missions: {
      apiMissionId: string;
      name: string;
      status: MissionStatus;
      submissions?: {
        label: string;
        status: SubmissionStatus;
      }[];
    }[];
  }[];
}