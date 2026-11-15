import { describe, expect, it } from "vitest";

import {
  allianceCountFor,
  emptyAuto,
  emptyTeleop,
  firstRoundPairings,
  nectarAllowed,
  scoreAlliance,
  teleopPoints,
} from "@/utils/competitions/ftc/biobuzz";
import {
  initialMatchTimer,
  matchSecondsLeft,
  matchTimerReducer,
  type MatchTimerState,
} from "@/utils/competitions/ftc/matchTimer";
import {
  allTeamStats,
  emptyScouting,
  entriesToCsv,
  entryPoints,
  evaluatePair,
  mergeScouting,
  newEntry,
  parseTeamList,
  qualificationOrder,
  simulateSelection,
  type ScoutingData,
} from "@/utils/competitions/ftc/scouting";
import { applyPreset, briefing, newPlan, planWarnings, scorePlan } from "@/utils/competitions/ftc/strategy";

describe("pontuação BIOBUZZ", () => {
  it("soma AUTO, TELEOP e RP da tabela 10-2", () => {
    const s = scoreAlliance({
      auto: { leave: 2, park: 2, tips: 1 },
      teleop: { tips: 3, cell: 4, flowersOwned: 2, flowerElements: 6, bottomNectar: 1, garden: 3, park: 1 },
    });
    expect(s.auto).toBe(2 * 3 + 2 * 5 + 20);
    expect(s.teleop).toBe(3 * 20 + 4 * 2 + 6 * 2 + 5 + 3 + 5);
    expect(s.tips).toBe(4);
    expect(s.swarm).toBe(6 + 10 + 5);
    expect(s.rp).toEqual({ swarm: true, pollinator1: true, pollinator2: false, bonus: 2 });
  });

  it("LEAVE + PARK no AUTO das duas equipes já fecha o SWARM (16)", () => {
    const s = scoreAlliance({ auto: { leave: 2, park: 2, tips: 0 }, teleop: emptyTeleop() });
    expect(s.swarm).toBe(16);
    expect(s.rp.swarm).toBe(true);
  });

  it("elementos em FLOWER só contam se a aliança possui alguma", () => {
    expect(teleopPoints({ ...emptyTeleop(), flowerElements: 5 })).toBe(0);
    expect(teleopPoints({ ...emptyTeleop(), flowersOwned: 1, flowerElements: 5 })).toBe(10);
  });

  it("limita robôs a 2 por aliança", () => {
    expect(scoreAlliance({ auto: { ...emptyAuto(), leave: 5 }, teleop: emptyTeleop() }).auto).toBe(6);
  });

  it("NECTAR: 1 por TIP até 5, todos com 1:00 restante", () => {
    expect(nectarAllowed(0, 120)).toBe(0);
    expect(nectarAllowed(3, 90)).toBe(3);
    expect(nectarAllowed(9, 90)).toBe(5);
    expect(nectarAllowed(0, 60)).toBe(5);
  });

  it("alianças dos playoffs pela tabela 13-2", () => {
    expect(allianceCountFor(3)).toBe(0);
    expect(allianceCountFor(4)).toBe(2);
    expect(allianceCountFor(10)).toBe(2);
    expect(allianceCountFor(11)).toBe(4);
    expect(allianceCountFor(20)).toBe(4);
    expect(allianceCountFor(21)).toBe(6);
    expect(allianceCountFor(41)).toBe(8);
    expect(firstRoundPairings(4)).toEqual([
      { red: 1, blue: 4 },
      { red: 2, blue: 3 },
    ]);
  });
});

describe("cronômetro da partida", () => {
  const run = (s: MatchTimerState, ticks: number) => {
    for (let i = 0; i < ticks; i++) s = matchTimerReducer(s, { type: "TICK" });
    return s;
  };

  it("contagem → AUTO 0:30 → transição 0:08 → TELEOP 2:00 → fim", () => {
    let s = matchTimerReducer(initialMatchTimer(), { type: "START" });
    expect(s.phase).toBe("countdown");
    s = run(s, 3);
    expect(s.phase).toBe("auto");
    expect(s.timeLeft).toBe(30);
    s = run(s, 30);
    expect(s.phase).toBe("transition");
    expect(s.timeLeft).toBe(8);
    s = run(s, 8);
    expect(s.phase).toBe("teleop");
    expect(s.timeLeft).toBe(120);
    s = run(s, 60);
    expect(matchSecondsLeft(s)).toBe(60);
    s = run(s, 60);
    expect(s.phase).toBe("finished");
    expect(s.isRunning).toBe(false);
  });

  it("modos de treino: só AUTO termina após 0:30; só TELEOP pula o AUTO", () => {
    let auto = matchTimerReducer(initialMatchTimer("auto"), { type: "START" });
    auto = run(auto, 33);
    expect(auto.phase).toBe("finished");

    let tele = matchTimerReducer(initialMatchTimer("teleop"), { type: "START" });
    tele = run(tele, 3);
    expect(tele.phase).toBe("teleop");
  });

  it("pausa congela o tempo e TIP não fica negativo", () => {
    let s = run(matchTimerReducer(initialMatchTimer(), { type: "START" }), 5);
    s = matchTimerReducer(s, { type: "PAUSE" });
    expect(run(s, 10).timeLeft).toBe(s.timeLeft);
    s = matchTimerReducer(s, { type: "TIP", alliance: "red", delta: -1 });
    expect(s.tips.red).toBe(0);
  });
});

function sampleEvent(): ScoutingData {
  const d = emptyScouting();
  d.event.teamNumber = "100";
  // 100 e 200: fortes na HIVE · 300: fecha nas FLOWERS · 400: fraca · 500: quebra
  const profile: Record<string, Partial<ReturnType<typeof newEntry>>> = {
    "100": { autoLeave: true, autoPark: true, autoTips: 1, tips: 3, cell: 2, park: true },
    "200": { autoLeave: true, autoPark: true, autoTips: 1, tips: 3, cell: 2, park: true },
    "300": { autoLeave: true, autoPark: true, tips: 0, flower: 5, bottomNectar: 2, garden: 3, park: true },
    "400": { autoLeave: true, tips: 0, garden: 2 },
    "500": { autoLeave: true, tips: 4, broke: true },
  };
  for (const team of Object.keys(profile)) {
    d.teams.push({ number: team, name: `Equipe ${team}` });
    for (let m = 1; m <= 4; m++) d.entries.push(newEntry({ id: `${team}-${m}`, team, match: m, ...profile[team] }));
  }
  return d;
}

describe("scouting e alianças", () => {
  it("calcula pontos do robô e médias por equipe", () => {
    const e = newEntry({ autoLeave: true, autoPark: true, autoTips: 1, tips: 2, cell: 3, flower: 2, bottomNectar: 1, garden: 4, park: true });
    expect(entryPoints(e)).toBe(3 + 5 + 20 + 40 + 6 + 4 + 5 + 4 + 5);
    expect(entryPoints({ ...e, noShow: true })).toBe(0);

    const stats = allTeamStats(sampleEvent());
    const t500 = stats.find((t) => t.number === "500")!;
    expect(t500.reliability).toBe(0);
    expect(t500.rating).toBe(0);
  });

  it("prefere a dupla que se completa à dupla que disputa a mesma HIVE", () => {
    const stats = allTeamStats(sampleEvent());
    const get = (n: string) => stats.find((t) => t.number === n)!;
    const sameHive = evaluatePair(get("100"), get("200"));
    const complement = evaluatePair(get("100"), get("300"));
    expect(sameHive.reasons.join(" ")).toContain("mesma HIVE");
    expect(complement.reasons.join(" ")).toContain("FLOWERS");
    expect(sameHive.expected).toBeLessThan(get("100").avg + get("200").avg);
  });

  it("simula a seleção: capitão é sempre o mais bem colocado livre", () => {
    const stats = allTeamStats(sampleEvent());
    const ranked = qualificationOrder(stats);
    const sim = simulateSelection(ranked, { alliances: 2 });
    expect(sim).toHaveLength(2);
    expect(sim[0].captain.number).toBe(ranked[0].number);
    const used = sim.flatMap((a) => [a.captain.number, a.pick?.number]);
    expect(new Set(used).size).toBe(used.length);

    // escolha forçada é respeitada
    const forced = simulateSelection(ranked, { alliances: 2, forcedPicks: { [ranked[0].number]: "400" } });
    expect(forced[0].pick?.number).toBe("400");
  });

  it("ranking oficial manda na ordem; indisponíveis ficam de fora", () => {
    const d = sampleEvent();
    d.teams = d.teams.map((t) => (t.number === "400" ? { ...t, rank: 1 } : t.number === "100" ? { ...t, unavailable: true } : t));
    const ranked = qualificationOrder(allTeamStats(d));
    expect(ranked[0].number).toBe("400");
    const sim = simulateSelection(ranked, { alliances: 2 });
    expect(sim.flatMap((a) => [a.captain.number, a.pick?.number])).not.toContain("100");
  });

  it("junta exportações de scouts sem duplicar registros", () => {
    const a = sampleEvent();
    const b = sampleEvent();
    b.entries.push(newEntry({ id: "novo", team: "600", match: 5 }));
    const merged = mergeScouting(a, b);
    expect(merged.entries).toHaveLength(a.entries.length + 1);
    expect(merged.event.teamNumber).toBe("100");
  });

  it("lê lista de equipes colada e gera CSV", () => {
    expect(parseTeamList("23456 Robôs do Cerrado\n#34567 - Colmeia\nlixo")).toEqual([
      { number: "23456", name: "Robôs do Cerrado" },
      { number: "34567", name: "Colmeia" },
    ]);
    const csv = entriesToCsv(sampleEvent().entries.slice(0, 1));
    expect(csv.split("\n")[0]).toContain("pontos");
    expect(csv.split("\n")).toHaveLength(2);
  });
});

describe("estratégia do TELEOP", () => {
  it("presets mudam o plano e mantêm as equipes", () => {
    const base = newPlan("100");
    base.robots[1].team = "200";
    const tips = applyPreset(base, "tips");
    expect(tips.robots[0].team).toBe("100");
    expect(tips.robots[1].team).toBe("200");
    expect(scorePlan(tips).tips).toBeGreaterThanOrEqual(5);
    expect(scorePlan(applyPreset(base, "safe")).rp.swarm).toBe(true);
  });

  it("avisa quando os dois lançam na mesma HIVE e quando falta PARK", () => {
    const p = applyPreset(newPlan(), "tips");
    expect(planWarnings(p).some((w) => w.text.includes("mesma HIVE"))).toBe(true);
    p.robots[0].park = false;
    p.robots[1].park = false;
    expect(planWarnings(p).some((w) => w.text.includes("PARK"))).toBe(true);
  });

  it("gera briefing com a estimativa", () => {
    const p = newPlan("100");
    p.match = "Q7";
    const text = briefing(p);
    expect(text).toContain("Partida Q7");
    expect(text).toContain(`${scorePlan(p).total} pts`);
  });
});
