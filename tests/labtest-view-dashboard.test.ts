import { describe, expect, it } from "vitest";
import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import {
  VIEW_PRESETS,
  VIEW_WIDGET_SPECS,
  activeFilterCount,
  applyFilters,
  buildViewMetrics,
  createViewWidget,
  normalizeViewState,
  resolveWidgetMetrics,
  summarize,
} from "@/utils/labtest/view-dashboard";

const fields: FieldDefinition[] = [
  { fieldKey: "pts", label: "Pontos", type: "number", unit: "pts", targetValue: 100, order: 1 },
  { fieldKey: "tempo", label: "Tempo", type: "number", unit: "s", targetValue: 30, order: 2 },
  { fieldKey: "ok", label: "Completou", type: "boolean", order: 3 },
  { fieldKey: "obs", label: "Obs", type: "text", order: 4 },
];

function entry(n: number, pts: number | null, tempo: number | null, ok: boolean | null, day: string, notes: string | null = null): TestEntry {
  return {
    id: `e${n}`,
    executionNumber: n,
    notes,
    createdAt: `${day}T12:00:00`,
    values: [
      { fieldKey: "pts", value: pts },
      { fieldKey: "tempo", value: tempo },
      { fieldKey: "ok", value: ok },
    ],
  };
}

const entries = [
  entry(1, 60, 40, false, "2026-10-01"),
  entry(2, 70, 35, true, "2026-10-02", "garra travou"),
  entry(3, 90, 31, true, "2026-10-05"),
  entry(4, 110, 28, true, "2026-10-09", "recorde"),
];

describe("métricas da visão do teste", () => {
  const { metrics, rows } = buildViewMetrics("runs", fields, entries);

  it("deriva campos numéricos e sim/não (sem texto) e não soma unidades diferentes", () => {
    expect(metrics.map((m) => m.key)).toEqual(["f:pts", "f:tempo", "f:ok"]);
    expect(rows[1].values["f:ok"]).toBe(1);
    const same: FieldDefinition[] = [
      { fieldKey: "a", label: "M1", type: "number", unit: "pts", order: 1 },
      { fieldKey: "b", label: "M2", type: "number", unit: "pts", order: 2 },
    ];
    const e = { ...entries[0], values: [{ fieldKey: "a", value: 30 }, { fieldKey: "b", value: 15 }] };
    const sum = buildViewMetrics("runs", same, [e]);
    expect(sum.metrics[0].key).toBe("__total");
    expect(sum.rows[0].values["__total"]).toBe(45);
    expect(metrics.find((m) => m.key === "f:tempo")?.lowerIsBetter).toBe(true);
  });

  it("resume com melhor, tendência e metas", () => {
    const tempo = summarize(rows, metrics.find((m) => m.key === "f:tempo")!)!;
    expect(tempo.best).toBe(28);
    expect(tempo.slope).toBeLessThan(0);
    expect(tempo.hitRate).toBe(0.25);
    const pts = summarize(rows, metrics.find((m) => m.key === "f:pts")!)!;
    expect(pts.best).toBe(110);
    expect(pts.avg).toBe(82.5);
    expect(pts.median).toBe(80);
  });

  it("usa resultados de OBR quando existem", () => {
    const obr = { ...entries[0], obrRound: { elapsedSec: 200, round: { falhas: 2 }, scores: { total: 150, multiplier: 1.5 } } } as unknown as TestEntry;
    const { metrics: ms, rows: rs } = buildViewMetrics("runs", [], [obr]);
    expect(ms.map((m) => m.key)).toEqual(["__total", "__time", "__multiplier", "__failures"]);
    expect(rs[0].values["__failures"]).toBe(2);
  });

  it("blocos automáticos escolhem métricas compatíveis", () => {
    expect(resolveWidgetMetrics(createViewWidget("success"), metrics).map((m) => m.key)).toEqual(["f:ok"]);
    expect(resolveWidgetMetrics(createViewWidget("targets"), metrics).map((m) => m.key)).toEqual(["f:pts", "f:tempo"]);
    expect(resolveWidgetMetrics(createViewWidget("kpi"), metrics)).toHaveLength(1);
    // Evolução automática não mistura pts com segundos.
    expect(resolveWidgetMetrics(createViewWidget("evolution"), metrics)).toHaveLength(1);
  });

  it("modos predefinidos montam blocos válidos", () => {
    for (const p of VIEW_PRESETS) {
      const built = p.build(metrics);
      expect(built.length).toBeGreaterThan(0);
      const back = normalizeViewState({ widgets: built }).widgets!;
      expect(back).toHaveLength(built.length);
    }
    expect(VIEW_PRESETS.every((p) => p.build([]).every((w) => VIEW_WIDGET_SPECS.some((s) => s.type === w.type)))).toBe(true);
  });
});

describe("filtros", () => {
  it("últimas N, número, datas, busca e observações", () => {
    expect(applyFilters(entries, { range: "last5" })).toHaveLength(4);
    expect(applyFilters(entries, { range: "execs", fromExec: 2, toExec: 3 }).map((e) => e.executionNumber)).toEqual([2, 3]);
    expect(applyFilters(entries, { range: "dates", fromDate: "2026-10-02", toDate: "2026-10-05" }).map((e) => e.executionNumber)).toEqual([2, 3]);
    expect(applyFilters(entries, { range: "all", withNotes: true }).map((e) => e.executionNumber)).toEqual([2, 4]);
    expect(applyFilters(entries, { range: "all", search: "garra" }).map((e) => e.executionNumber)).toEqual([2]);
    expect(applyFilters(entries, { range: "all", search: "#3" }).map((e) => e.executionNumber)).toEqual([3]);
    expect(activeFilterCount({ range: "last5", search: "x", withNotes: true })).toBe(3);
  });

  it("estado salvo inválido volta ao padrão", () => {
    const s = normalizeViewState({ tab: "x", filters: { range: "?" }, widgets: [{ type: "nope" }, { type: "kpi", size: "huge" }] });
    expect(s.tab).toBe("analysis");
    expect(s.filters.range).toBe("all");
    expect(s.widgets).toHaveLength(1);
    expect(s.widgets![0].size).toBe("sm");
    expect(normalizeViewState(null).widgets).toBeNull();
  });
});
