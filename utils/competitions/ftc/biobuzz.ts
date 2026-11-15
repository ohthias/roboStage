/**
 * BIOBUZZ™ presented by RTX — temporada 2026/2027 da FIRST® Tech Challenge.
 *
 * Fonte única dos números da temporada (tempos, pontos, RP, faltas). O
 * cronômetro, o montador de estratégia, a página da arena e o scouting leem
 * daqui: se sair um Team Update mudando algum valor, troque só neste arquivo.
 *
 * Referência: Competition Manual BIOBUZZ, seções 10 (Game Details) e 13
 * (Tournament) — https://ftc.game/cm-html
 */

export const SEASON = {
  key: "biobuzz",
  name: "BIOBUZZ",
  period: "2026/2027",
  program: "FIRST® CANOPY™",
  manualUrl: "https://ftc.game/manual/",
  manualHtmlUrl: "https://ftc.game/cm-html",
} as const;

/* ------------------------------------------------------------ tempos */

export const MATCH_TIMING = {
  /** AUTO: robôs sozinhos, sem comando dos pilotos. */
  auto: 30,
  /** Transição AUTO → TELEOP (contagem de 0:08 a 0:01). */
  transition: 8,
  /** TELEOP: pilotos no controle. */
  teleop: 120,
  /** Com 1:00 restante: NECTAR liberado nas FLOWERS e todo NECTAR pode entrar. */
  flowerWindow: 60,
  /** Aviso dos 20 segundos finais. */
  finalWarning: 20,
} as const;

export const MATCH_TOTAL_SECONDS = MATCH_TIMING.auto + MATCH_TIMING.transition + MATCH_TIMING.teleop;

/* ------------------------------------------------------------ pontos */

/** Tabela 10-2 do manual. */
export const POINTS = {
  auto: {
    leave: 3,
    park: 5,
    tip: 20,
  },
  teleop: {
    tip: 20,
    /** POLLEN/NECTAR que sobra na CELL voltada para cima no fim da partida. */
    cell: 2,
    /** NECTAR mais baixo da sua cor que conta em uma FLOWER. */
    bottomNectar: 5,
    /** Cada POLLEN/NECTAR em uma FLOWER que a aliança possui. */
    flower: 2,
    /** Cada POLLEN/NECTAR no GARDEN da sua cor. */
    garden: 1,
    park: 5,
  },
  /** Faltas viram pontos para a aliança adversária. */
  foul: {
    minor: 5,
    major: 20,
  },
} as const;

/** Ranking Points: 3 por vitória, 1 por empate, mais os bônus abaixo. */
export const RANKING_POINTS = {
  win: 3,
  tie: 1,
  /** SWARM: LEAVE + PARK da aliança (AUTO e TELEOP) ≥ 16 pontos. */
  swarmThreshold: 16,
  /** POLLINATOR 1: TIPs da aliança na partida ≥ 4. */
  pollinator1Tips: 4,
  /** POLLINATOR 2: TIPs da aliança na partida ≥ 7. */
  pollinator2Tips: 7,
} as const;

/** Quantidades fixas de cada partida. */
export const FIELD_COUNTS = {
  pollen: 40,
  nectarPerAlliance: 8,
  flowers: 4,
  hives: 2,
  cellsPerHive: 2,
  /** NECTAR que a aliança guarda na ALLIANCE AREA para entrar a cada TIP. */
  nectarInAllianceArea: 5,
  /** Máximo de elementos controlados por robô ao mesmo tempo (G407). */
  maxControlled: 4,
} as const;

/* ---------------------------------------------------------- cálculo */

export type AutoInput = {
  /** robôs que saíram da parede (0–2) */
  leave: number;
  /** robôs estacionados no LOADING ZONE ao fim do AUTO (0–2) */
  park: number;
  tips: number;
};

export type TeleopInput = {
  tips: number;
  /** POLLEN/NECTAR na CELL voltada para cima no fim */
  cell: number;
  /** FLOWERS que a aliança possui no fim (0–4) */
  flowersOwned: number;
  /** elementos dentro das FLOWERS possuídas */
  flowerElements: number;
  /** bônus de NECTAR mais baixo conquistados (0–4, um por FLOWER) */
  bottomNectar: number;
  /** elementos no GARDEN da sua cor */
  garden: number;
  /** robôs estacionados no LOADING ZONE no fim (0–2) */
  park: number;
};

export type AllianceInput = { auto: AutoInput; teleop: TeleopInput };

export const emptyAuto = (): AutoInput => ({ leave: 0, park: 0, tips: 0 });
export const emptyTeleop = (): TeleopInput => ({
  tips: 0,
  cell: 0,
  flowersOwned: 0,
  flowerElements: 0,
  bottomNectar: 0,
  garden: 0,
  park: 0,
});

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));

export function autoPoints(a: AutoInput) {
  return (
    clamp(a.leave, 0, 2) * POINTS.auto.leave +
    clamp(a.park, 0, 2) * POINTS.auto.park +
    clamp(a.tips, 0, 99) * POINTS.auto.tip
  );
}

export function teleopPoints(t: TeleopInput) {
  // Elementos só pontuam em FLOWER que a aliança possui.
  const flowerElements = t.flowersOwned > 0 ? clamp(t.flowerElements, 0, 999) : 0;
  return (
    clamp(t.tips, 0, 99) * POINTS.teleop.tip +
    clamp(t.cell, 0, 999) * POINTS.teleop.cell +
    flowerElements * POINTS.teleop.flower +
    clamp(t.bottomNectar, 0, FIELD_COUNTS.flowers) * POINTS.teleop.bottomNectar +
    clamp(t.garden, 0, 999) * POINTS.teleop.garden +
    clamp(t.park, 0, 2) * POINTS.teleop.park
  );
}

/** LEAVE + PARK da aliança: base do RP SWARM. */
export function swarmPoints({ auto, teleop }: AllianceInput) {
  return (
    clamp(auto.leave, 0, 2) * POINTS.auto.leave +
    clamp(auto.park, 0, 2) * POINTS.auto.park +
    clamp(teleop.park, 0, 2) * POINTS.teleop.park
  );
}

export type AllianceScore = {
  auto: number;
  teleop: number;
  total: number;
  tips: number;
  swarm: number;
  rp: { swarm: boolean; pollinator1: boolean; pollinator2: boolean; bonus: number };
};

export function scoreAlliance(input: AllianceInput): AllianceScore {
  const auto = autoPoints(input.auto);
  const teleop = teleopPoints(input.teleop);
  const tips = clamp(input.auto.tips, 0, 99) + clamp(input.teleop.tips, 0, 99);
  const swarm = swarmPoints(input);
  const rp = {
    swarm: swarm >= RANKING_POINTS.swarmThreshold,
    pollinator1: tips >= RANKING_POINTS.pollinator1Tips,
    pollinator2: tips >= RANKING_POINTS.pollinator2Tips,
    bonus: 0,
  };
  rp.bonus = Number(rp.swarm) + Number(rp.pollinator1) + Number(rp.pollinator2);
  return { auto, teleop, total: auto + teleop, tips, swarm, rp };
}

/**
 * NECTAR que a equipe de piloto já pode colocar em campo (G426): um por TIP
 * da própria HIVE, ou todos os restantes quando faltar 1:00 ou menos.
 */
export function nectarAllowed(tips: number, secondsLeftInMatch: number) {
  if (secondsLeftInMatch <= MATCH_TIMING.flowerWindow) return FIELD_COUNTS.nectarInAllianceArea;
  return Math.min(FIELD_COUNTS.nectarInAllianceArea, Math.max(0, tips));
}

/* ------------------------------------------------- playoffs (seção 13) */

/** Tabela 13-2: quantas alianças vão para os playoffs. */
export function allianceCountFor(eligibleTeams: number) {
  if (eligibleTeams >= 41) return 8;
  if (eligibleTeams >= 21) return 6;
  if (eligibleTeams >= 11) return 4;
  if (eligibleTeams >= 4) return 2;
  return 0;
}

/**
 * Primeira rodada da chave superior (dupla eliminação). Com 6 alianças, as
 * duas primeiras folgam na rodada 1.
 */
export function firstRoundPairings(alliances: number): { red: number; blue: number }[] {
  switch (alliances) {
    case 2:
      return [{ red: 1, blue: 2 }];
    case 4:
      return [
        { red: 1, blue: 4 },
        { red: 2, blue: 3 },
      ];
    case 6:
      return [
        { red: 3, blue: 6 },
        { red: 4, blue: 5 },
      ];
    case 8:
      return [
        { red: 1, blue: 8 },
        { red: 4, blue: 5 },
        { red: 2, blue: 7 },
        { red: 3, blue: 6 },
      ];
    default:
      return [];
  }
}
