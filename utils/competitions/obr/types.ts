export interface Checkpoint {
  /** ladrilhos superados desde o último checkpoint */
  tiles: number;
  /** tentativa em que o checkpoint foi superado (1, 2, 3 ou 4+) */
  attempt: number;
}

export interface Hazards {
  intersecoes: number; // interseção (com ou sem marcação) ou beco sem saída
  gangorras: number;
  obstaculos: number;
  gaps: number;
  rampas: number; // cada ladrilho com rampa (subir ou descer)
  lombadas: number;
  passagens: number;
}

export interface Round {
  hazards: Hazards;
  startTile: boolean;
  checkpoints: Checkpoint[];
  /** total de Falhas de Progresso na rodada */
  falhas: number;
  chegada: boolean;
  vivasVerde: number; // máx 2
  mortasVermelha: number; // máx 1
  invertidas: number;
  surpresa: boolean;
  /** tempo em segundos (ignorado se não chegou / desistiu) */
  tempo: number;
  desistiu: boolean;
}
