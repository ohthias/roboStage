/**
 * lib/mission-timer/types.ts
 *
 * Tipos explícitos usados pela ferramenta Mission Timer.
 * Nenhum `any` é utilizado — dados desconhecidos entram como `unknown`
 * e são validados/normalizados em `normalize.ts`.
 */

/** Missão normalizada, já pronta para uso pela interface. */
export interface Mission {
  /** Identificador da missão dentro da temporada (ex.: "M01"). */
  id: string;
  /** Nome de exibição da missão. */
  name: string;
  /** Descrição opcional, quando disponível no JSON de origem. */
  description?: string;
  /**
   * Pontuação máxima da missão, quando disponível no JSON de origem.
   * `undefined` quando o dado não existe — nunca inventado.
   */
  points?: number;
  /** Id da temporada à qual a missão pertence. */
  seasonId: string;
}

/** Temporada normalizada, com suas missões já resolvidas. */
export interface Season {
  id: string;
  name: string;
  missions: Mission[];
}

/** Configuração de tempo de uma sessão de teste. */
export interface MissionTimerConfig {
  /** Duração total configurada, em milissegundos. */
  durationMs: number;
  /** Rótulo de exibição da duração escolhida (ex.: "2:30" ou "Personalizado"). */
  label: string;
}

/** Seleção e ordenação de missões feita pelo usuário antes de iniciar o teste. */
export interface MissionSelection {
  seasonId: string;
  /** Sequência de ids de missão, na ordem exata de execução. */
  sequence: string[];
}

export type MissionAttemptResult = "success" | "failure" | "skipped";

/** Registro de uma tentativa/lançamento individual. */
export interface MissionAttempt {
  id: string;
  missionId: string;
  /** Posição (1-based) da missão dentro da sequência planejada. */
  sequence: number;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  result: MissionAttemptResult;
}

export type MissionTimerStatus =
  | "loading"
  | "setup"
  | "running"
  | "paused"
  | "finished"
  | "result";

/** Estado completo de uma sessão de teste (o que é salvo no localStorage). */
export interface MissionTimerSession {
  seasonId: string;
  seasonName: string;
  sequence: string[];
  config: MissionTimerConfig;
  status: MissionTimerStatus;
  /** Timestamp de início efetivo do teste (Date.now()). */
  startedAt?: number;
  /** Timestamp em que o teste (ou a pausa atual) foi pausado. */
  pausedAt?: number;
  /** Soma de todo o tempo em que o teste ficou pausado, em ms. */
  totalPausedMs: number;
  /** Timestamp em que o teste terminou (por conclusão ou por tempo esgotado). */
  finishedAt?: number;
  /** Índice (0-based) da missão atual dentro de `sequence`. */
  currentIndex: number;
  attempts: MissionAttempt[];
}

/** Estatísticas agregadas de uma única missão dentro da sessão. */
export interface MissionStatistics {
  missionId: string;
  attempts: number;
  successes: number;
  failures: number;
  successRate: number;
  /** true quando essa foi a primeira falha da sequência. */
  isFirstFailure: boolean;
  /** true quando essa missão empata ou lidera em número de falhas. */
  isMostInconsistent: boolean;
}

/** Resultado final calculado ao término de uma sessão. */
export interface MissionTimerResult {
  seasonId: string;
  seasonName: string;
  configuredDurationMs: number;
  effectiveDurationMs: number;
  totalMissions: number;
  executed: number;
  successes: number;
  failures: number;
  skipped: number;
  successRate: number;
  failureRate: number;
  /** Soma dos pontos das missões concluídas com sucesso. Undefined se nenhum ponto disponível. */
  score?: number;
  /** Consistência: sucessos / tentativas executadas, em % (0-100). */
  consistency: number;
  missionStats: MissionStatistics[];
  firstFailureMissionId?: string;
  /** Pode haver empate — por isso é uma lista. */
  mostInconsistentMissionIds: string[];
  attempts: MissionAttempt[];
  sequence: string[];
  summaryText: string;
  finishedAt: number;
}
