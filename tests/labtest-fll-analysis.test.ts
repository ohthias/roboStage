import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { TestEntry } from "@/types/labtest.types";
import type { FllMissionDefinition } from "@/utils/labtest/fll";
import {
  fllEntryScore,
  fllMissionGrid,
  fllMissionStats,
  missionMaxPoints,
  missionsForTest,
} from "@/utils/labtest/fll-analysis";
import { buildViewMetrics, defaultWidgets, presetsFor, resolveWidgetMetrics, createViewWidget } from "@/utils/labtest/view-dashboard";

const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/data/missions.json"), "utf8")) as Record<string, FllMissionDefinition[]>;
const bioglow = catalog.bioglow;
const byId = (id: string) => bioglow.find((m) => m.id === id)!;

function entry(n: number, answers: TestEntry["fllAnswers"], extra: Partial<TestEntry> = {}): TestEntry {
  return { id: `e${n}`, executionNumber: n, notes: null, createdAt: `2026-10-0${n}T10:00:00`, values: [], fllAnswers: answers, ...extra };
}

describe("máximo por missão (motor real do placar)", () => {
  it("switch, range em lista, sub-missões e opções múltiplas", () => {
    expect(missionMaxPoints(byId("M01"))).toBe(30); // 20 + bônus 10
    expect(missionMaxPoints(byId("M02"))).toBe(30); // 3 sementes
    expect(missionMaxPoints(byId("M05"))).toBe(20); // "Completamente"
    expect(missionMaxPoints(byId("M14"))).toBe(40); // 5×4 + 5×4
    expect(missionMaxPoints(byId("PT"))).toBe(50);
  });

  it("respeita portão (zero_whole_mission_if_false) e requires", () => {
    const m04 = byId("M04");
    const max = missionMaxPoints(m04);
    expect(max).toBeGreaterThan(0);
    expect(max).toBe(10 + 20); // 2 itens (10) + bônus que exige o portão
  });
});

describe("estatísticas por missão", () => {
  const m01 = byId("M01");
  const m02 = byId("M02");
  const missions = [m01, m02];
  const sub = (m: FllMissionDefinition, v: number) =>
    Object.fromEntries((m["sub-mission"] ?? []).map((s, i) => [s.id ?? `${m.id}-sub-${i}`, v]));
  const entries = [
    entry(1, { M01: { value: 1, subAnswers: sub(m01, 0), firstMarkSeconds: 40 }, M02: { value: 0, subAnswers: {} } }),
    entry(2, { M01: { value: 1, subAnswers: sub(m01, 1), firstMarkSeconds: 30 }, M02: { value: 2, subAnswers: {} } }),
    entry(3, { M01: { value: 0, subAnswers: sub(m01, 0) }, M02: { value: 3, subAnswers: {}, markedAfterTime: true } }, { roundTotal: 99 }),
  ];

  it("tentativas, acertos, máximo, aproveitamento e tempo", () => {
    const [s1, s2] = fllMissionStats(missions, entries);
    expect(s1).toMatchObject({ id: "M01", max: 30, attempts: 3, scored: 2, full: 1, best: 30, last: 0 });
    expect(s1.avg).toBeCloseTo(50 / 3);
    expect(s1.efficiency).toBeCloseTo(50 / 90);
    expect(s1.avgFirstMark).toBe(35);
    expect(s1.subs[0]).toMatchObject({ max: 10 });
    expect(s1.subs[0].scoredRate).toBeCloseTo(1 / 3);
    expect(s2).toMatchObject({ attempts: 3, scored: 2, full: 1, afterTime: 1, avg: 50 / 3 });
    expect(s1.share + s2.share).toBeCloseTo(1);
  });

  it("placar usa o Round 2:30 quando existe", () => {
    expect(fllEntryScore(missions, entries[0])).toBe(20);
    expect(fllEntryScore(missions, entries[2])).toBe(99);
    expect(fllEntryScore(missions, entry(9, undefined))).toBeNull();
  });

  it("grade missão × execução diferencia fora da execução de zero", () => {
    const g = fllMissionGrid([m01, byId("M03")], entries);
    expect(g.rows[0].cells.map((c) => c.points)).toEqual([20, 30, 0]);
    expect(g.rows[1].cells.every((c) => c.points === null)).toBe(true);
    expect(g.rows[0].cells[1].ratio).toBe(1);
  });

  it("missões do teste: ordem da config, sem GP, mais as respondidas", () => {
    const list = missionsForTest(bioglow, ["M03", "GP", "M01"], entries);
    expect(list.map((m) => m.id)).toEqual(["M03", "M01", "M02"]);
    expect(missionsForTest(bioglow, undefined, []).some((m) => m.id === "GP")).toBe(false);
  });

  it("painel e tabelas ganham placar e uma coluna por missão", () => {
    const { metrics, rows } = buildViewMetrics("runs", [], entries, { missions });
    expect(metrics.map((m) => m.key)).toEqual(["__total", "m:M01", "m:M02"]);
    expect(metrics[1]).toMatchObject({ target: 30, unit: "pts", group: "missao" });
    expect(rows[1].values).toMatchObject({ __total: 50, "m:M01": 30, "m:M02": 20 });
    expect(resolveWidgetMetrics(createViewWidget("table-entries"), metrics)).toHaveLength(3);
    expect(defaultWidgets(metrics, true).some((w) => w.type === "table-missions")).toBe(true);
    expect(presetsFor(false).some((p) => p.fllOnly)).toBe(false);
    expect(presetsFor(true)[0].key).toBe("fll");
  });
});
