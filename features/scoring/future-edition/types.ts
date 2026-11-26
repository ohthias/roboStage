export type ObjectiveType = "toggle" | "counter" | "select";

export interface SelectOption {
  id: string;
  label: string;
  points: number;
}

export type MissionValue = boolean | number | string;

export interface MissionObjective {
  id: string;
  label: string;
  type: ObjectiveType;

  // toggle
  points?: number;

  // counter
  min?: number;
  max?: number;          // limite de contagem (não de pontos)
  pointsPerUnit?: number;

  // select
  options?: SelectOption[];
}

export interface Mission {
  id: string;
  code: string;           // "M01"
  title: string;
  description?: string;
  image?: string;
  objectives: MissionObjective[];
  maxScore?: number;      // teto de pontos da missão (soma dos objectives), se houver
}

// Penalidades têm lógica própria: tabela por nº de cartões,
// podendo zerar a pontuação total da partida.
export interface PenaltyTier {
  count: number;
  points: number;
  zeroesTotal?: boolean;
}

export interface PenaltyBlock {
  id: string;
  code: string;
  title: string;
  table: PenaltyTier[];
}

export interface MissionsData {
  season: string;
  edition: string;
  title: string;
  missions: Mission[];
  penalties: PenaltyBlock;
}