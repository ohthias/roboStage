/**
 * Montador de estratégia do TELEOP (BIOBUZZ). Modelo e contas puras; a tela
 * fica em components/competicoes/FTC/StrategyBuilder.tsx.
 */
import {
  FIELD_COUNTS,
  RANKING_POINTS,
  scoreAlliance,
  type AllianceInput,
  type AllianceScore,
} from "./biobuzz";
import type { TeamStats } from "./scouting";

export type Role = "hive" | "feed" | "flower" | "garden" | "defense" | "park" | "idle";
export type PhaseKey = "cycles" | "flowers" | "final";

export const ROLES: Record<Role, { label: string; short: string; hint: string }> = {
  hive: { label: "Lançar na HIVE", short: "HIVE", hint: "Ciclos de coleta e lançamento na CELL de cima para virar a HIVE." },
  feed: { label: "Coletar e abastecer", short: "Coleta", hint: "Busca POLLEN nas FLOWERS e no GARDEN e deixa perto de quem lança." },
  flower: { label: "FLOWERS (NECTAR)", short: "FLOWER", hint: "Coloca NECTAR por cima das FLOWERS para garantir a posse. Só com 1:00 ou menos." },
  garden: { label: "Encher o GARDEN", short: "GARDEN", hint: "Leva POLLEN/NECTAR para o GARDEN da sua cor (1 pt cada)." },
  defense: { label: "Defesa", short: "Defesa", hint: "Atrapalha o ciclo adversário sem bloquear acesso a mais de 8 elementos (G411) e sem contato ilegal." },
  park: { label: "PARK no LOADING ZONE", short: "PARK", hint: "Termina parcialmente dentro do LOADING ZONE (5 pts)." },
  idle: { label: "Livre", short: "—", hint: "Sem função definida." },
};

export const PHASES: { key: PhaseKey; label: string; time: string; seconds: number }[] = [
  { key: "cycles", label: "Ciclos", time: "2:00 → 1:00", seconds: 60 },
  { key: "flowers", label: "FLOWERS", time: "1:00 → 0:20", seconds: 40 },
  { key: "final", label: "Fechamento", time: "0:20 → 0:00", seconds: 20 },
];

export type RobotPlan = {
  team: string;
  autoLeave: boolean;
  autoPark: boolean;
  autoTips: number;
  roles: Record<PhaseKey, Role>;
  /** TIPs que este robô deve provocar no TELEOP */
  tips: number;
  /** elementos que deixa na CELL de cima no fim */
  cell: number;
  /** NECTAR/POLLEN que coloca em FLOWERS */
  flower: number;
  /** NECTAR mais baixo garantido (bônus por FLOWER) */
  bottomNectar: number;
  garden: number;
  park: boolean;
};

export type StrategyPlan = {
  id: string;
  name: string;
  match: string;
  alliance: "red" | "blue";
  robots: [RobotPlan, RobotPlan];
  /** FLOWERS que a aliança pretende possuir no fim */
  flowersOwned: number;
  /** POLLEN original que sobra em cada FLOWER possuída */
  pollenPerFlower: number;
  /** pontos esperados do adversário, para ver a margem (opcional) */
  opponent?: number;
  notes: string;
  updatedAt: number;
};

export const blankRobot = (team = ""): RobotPlan => ({
  team,
  autoLeave: true,
  autoPark: true,
  autoTips: 0,
  roles: { cycles: "hive", flowers: "flower", final: "park" },
  tips: 1,
  cell: 2,
  flower: 1,
  bottomNectar: 0,
  garden: 0,
  park: true,
});

export const newPlan = (ourTeam = ""): StrategyPlan => ({
  id: Math.random().toString(36).slice(2, 10),
  name: "",
  match: "",
  alliance: "red",
  robots: [blankRobot(ourTeam), { ...blankRobot(), roles: { cycles: "feed", flowers: "flower", final: "park" }, tips: 0 }],
  flowersOwned: 1,
  pollenPerFlower: 2,
  notes: "",
  updatedAt: Date.now(),
});

/* ------------------------------------------------------------ presets */

export type PresetKey = "tips" | "flowers" | "safe" | "defense";

export const PRESETS: Record<PresetKey, { label: string; description: string }> = {
  tips: { label: "Máximo de TIPs", description: "Os dois na HIVE até 1:00, buscando os dois RP POLLINATOR." },
  flowers: { label: "Domínio das FLOWERS", description: "Um vira a HIVE, o outro prepara NECTAR e fecha 3 FLOWERS." },
  safe: { label: "Seguro (SWARM)", description: "Ciclos tranquilos, PARK garantido dos dois no AUTO e no fim." },
  defense: { label: "Contra defesa", description: "Um pontua na HIVE e o outro defende e fecha no GARDEN." },
};

export function applyPreset(plan: StrategyPlan, key: PresetKey): StrategyPlan {
  const [a, b] = plan.robots;
  const keep = (r: RobotPlan, patch: Partial<RobotPlan>): RobotPlan => ({ ...r, ...patch, team: r.team });
  switch (key) {
    case "tips":
      return {
        ...plan,
        flowersOwned: 1,
        robots: [
          keep(a, { roles: { cycles: "hive", flowers: "hive", final: "park" }, tips: 3, cell: 3, flower: 0, bottomNectar: 0, park: true }),
          keep(b, { roles: { cycles: "hive", flowers: "flower", final: "park" }, tips: 2, cell: 1, flower: 2, bottomNectar: 1, park: true }),
        ],
      };
    case "flowers":
      return {
        ...plan,
        flowersOwned: 3,
        robots: [
          keep(a, { roles: { cycles: "hive", flowers: "hive", final: "park" }, tips: 3, cell: 2, flower: 0, bottomNectar: 0, park: true }),
          keep(b, { roles: { cycles: "feed", flowers: "flower", final: "flower" }, tips: 0, cell: 0, flower: 4, bottomNectar: 2, park: false }),
        ],
      };
    case "safe":
      return {
        ...plan,
        flowersOwned: 1,
        robots: [
          keep(a, { autoLeave: true, autoPark: true, roles: { cycles: "hive", flowers: "flower", final: "park" }, tips: 2, cell: 2, flower: 1, park: true }),
          keep(b, { autoLeave: true, autoPark: true, roles: { cycles: "feed", flowers: "garden", final: "park" }, tips: 0, cell: 0, flower: 0, garden: 4, park: true }),
        ],
      };
    case "defense":
      return {
        ...plan,
        flowersOwned: 1,
        robots: [
          keep(a, { roles: { cycles: "hive", flowers: "flower", final: "park" }, tips: 3, cell: 2, flower: 2, bottomNectar: 1, park: true }),
          keep(b, { roles: { cycles: "defense", flowers: "defense", final: "garden" }, tips: 0, cell: 0, flower: 0, garden: 3, park: false }),
        ],
      };
  }
}

/** Preenche um robô a partir das médias do scouting. */
export function robotFromStats(stats: TeamStats, base: RobotPlan = blankRobot()): RobotPlan {
  return {
    ...base,
    team: stats.number,
    autoLeave: stats.leaveRate >= 0.5,
    autoPark: stats.autoParkRate >= 0.5,
    autoTips: Math.round(stats.autoTips),
    tips: Math.round(stats.teleTips),
    cell: Math.round(stats.cell),
    flower: Math.round(stats.flower),
    bottomNectar: Math.round(stats.bottomNectar),
    garden: Math.round(stats.garden),
    park: stats.parkRate >= 0.5,
    roles: {
      cycles: stats.hiveShare >= 0.5 ? "hive" : "feed",
      flowers: stats.hiveShare >= 0.75 ? "hive" : "flower",
      final: stats.parkRate >= 0.5 ? "park" : "flower",
    },
  };
}

/* ---------------------------------------------------------- contas */

export function planToAlliance(plan: StrategyPlan): AllianceInput {
  const [a, b] = plan.robots;
  const flowersOwned = Math.min(FIELD_COUNTS.flowers, Math.max(0, plan.flowersOwned));
  const placed = a.flower + b.flower;
  return {
    auto: {
      leave: Number(a.autoLeave) + Number(b.autoLeave),
      park: Number(a.autoPark) + Number(b.autoPark),
      tips: a.autoTips + b.autoTips,
    },
    teleop: {
      tips: a.tips + b.tips,
      cell: a.cell + b.cell,
      flowersOwned,
      flowerElements: flowersOwned > 0 ? placed + flowersOwned * Math.min(4, Math.max(0, plan.pollenPerFlower)) : 0,
      bottomNectar: Math.min(FIELD_COUNTS.flowers, a.bottomNectar + b.bottomNectar),
      garden: a.garden + b.garden,
      park: Number(a.park) + Number(b.park),
    },
  };
}

export function scorePlan(plan: StrategyPlan): AllianceScore {
  return scoreAlliance(planToAlliance(plan));
}

export type PlanWarning = { level: "info" | "warn"; text: string };

export function planWarnings(plan: StrategyPlan): PlanWarning[] {
  const [a, b] = plan.robots;
  const out: PlanWarning[] = [];
  const score = scorePlan(plan);
  const nameOf = (r: RobotPlan, i: number) => r.team || (i === 0 ? "Robô 1" : "Robô 2");

  if (a.roles.cycles === "hive" && b.roles.cycles === "hive") {
    out.push({ level: "warn", text: "Os dois lançando na mesma HIVE até 1:00: combinem quem coleta de qual lado para não se chocarem." });
  }
  if (a.roles.cycles === "flower" || b.roles.cycles === "flower") {
    out.push({ level: "warn", text: "NECTAR só entra nas FLOWERS com 1:00 ou menos (G410). Antes disso, só POLLEN." });
  }
  if (!a.park && !b.park) {
    out.push({ level: "warn", text: "Ninguém termina no PARK: são até 10 pts a menos e o SWARM fica mais difícil." });
  }
  const swarmGap = RANKING_POINTS.swarmThreshold - score.swarm;
  if (swarmGap > 0) {
    out.push({ level: "info", text: `Faltam ${swarmGap} pts de LEAVE/PARK para o RP SWARM.` });
  }
  if (!score.rp.pollinator1) {
    out.push({ level: "info", text: `Faltam ${RANKING_POINTS.pollinator1Tips - score.tips} TIPs para o primeiro RP POLLINATOR.` });
  } else if (!score.rp.pollinator2) {
    out.push({ level: "info", text: `Faltam ${RANKING_POINTS.pollinator2Tips - score.tips} TIPs para o segundo RP POLLINATOR.` });
  }
  const flowerRobots = plan.robots.filter((r) => r.roles.flowers === "flower" || r.roles.final === "flower");
  if (plan.flowersOwned > 0 && flowerRobots.length === 0) {
    out.push({ level: "warn", text: "O plano conta com FLOWERS, mas nenhum robô vai para as FLOWERS depois de 1:00." });
  }
  const nectarNeeded = plan.flowersOwned + a.bottomNectar + b.bottomNectar;
  if (nectarNeeded > FIELD_COUNTS.nectarPerAlliance) {
    out.push({ level: "warn", text: `O plano usa ${nectarNeeded} NECTAR, mas a aliança só tem ${FIELD_COUNTS.nectarPerAlliance}.` });
  }
  plan.robots.forEach((r, i) => {
    if (r.roles.final === "park" && !r.park) {
      out.push({ level: "info", text: `${nameOf(r, i)} tem função PARK no fechamento, mas o PARK não está marcado.` });
    }
    if (r.roles.cycles === "defense" || r.roles.flowers === "defense") {
      out.push({ level: "info", text: `${nameOf(r, i)} na defesa: não bloqueie acesso a mais de 8 elementos (G411) e não controle NECTAR alheio (G408).` });
    }
  });
  if (plan.opponent != null && plan.opponent > 0 && score.total < plan.opponent) {
    out.push({ level: "warn", text: `Plano estimado ${plan.opponent - score.total} pts abaixo do adversário: considere mais TIPs ou mais FLOWERS.` });
  }
  return out;
}

/** Texto curto para o técnico ler (ou mandar no grupo) antes da partida. */
export function briefing(plan: StrategyPlan): string {
  const s = scorePlan(plan);
  const head = [
    plan.match ? `Partida ${plan.match}` : "Partida",
    plan.alliance === "red" ? "aliança VERMELHA" : "aliança AZUL",
  ].join(" · ");
  const lines = [head, ""];
  plan.robots.forEach((r, i) => {
    const name = r.team ? `Equipe ${r.team}` : i === 0 ? "Robô 1" : "Robô 2";
    const auto = [r.autoLeave && "LEAVE", r.autoTips > 0 && `${r.autoTips} TIP`, r.autoPark && "PARK"].filter(Boolean).join(" + ");
    lines.push(`${name}`);
    lines.push(`  AUTO: ${auto || "parado"}`);
    PHASES.forEach((p) => lines.push(`  ${p.time}: ${ROLES[r.roles[p.key]].label}`));
    lines.push(`  Meta: ${r.tips} TIP · ${r.cell} na CELL · ${r.flower} em FLOWER${r.garden ? ` · ${r.garden} no GARDEN` : ""}${r.park ? " · PARK" : ""}`);
    lines.push("");
  });
  lines.push(`FLOWERS para possuir: ${plan.flowersOwned}`);
  lines.push(`Estimativa: ${s.total} pts (AUTO ${s.auto} + TELEOP ${s.teleop}) · ${s.tips} TIPs`);
  const rp = [s.rp.swarm && "SWARM", s.rp.pollinator1 && "POLLINATOR 1", s.rp.pollinator2 && "POLLINATOR 2"].filter(Boolean);
  lines.push(`RP bônus: ${rp.length ? rp.join(", ") : "nenhum"}`);
  if (plan.notes.trim()) lines.push("", `Obs.: ${plan.notes.trim()}`);
  return lines.join("\n");
}
