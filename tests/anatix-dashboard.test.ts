import { describe, expect, it } from "vitest";
import {
  alignBuckets,
  derivative,
  eventBuckets,
  eventSummary,
  fullStats,
  histogram,
  movingAverage,
  normalize01,
  pearson,
  sliceWindow,
  timeInStates,
  toCsv,
} from "@/utils/labtest/anatix/analysis";
import {
  DASHBOARD_PRESETS,
  WIDGET_SPECS,
  createWidget,
  normalizeDashboard,
  normalizeWidget,
} from "@/utils/labtest/anatix/dashboard";
import { normalizeAnatixConfig } from "@/utils/labtest/anatix/protocol";
import { ANATIX_MAX_WIDGETS } from "@/types/anatix.types";

describe("análises do painel Anatix", () => {
  it("calcula estatísticas completas", () => {
    const st = fullStats([0, 1000, 2000, 3000, 4000], [1, 2, 3, 4, 10])!;
    expect(st.min).toBe(1);
    expect(st.max).toBe(10);
    expect(st.avg).toBe(4);
    expect(st.median).toBe(3);
    expect(st.range).toBe(9);
    expect(st.rate).toBe(1);
    expect(st.std).toBeCloseTo(Math.sqrt(10), 6);
    expect(fullStats([], [])).toBeNull();
  });

  it("recorta a janela pelo tempo final", () => {
    const s = { t: [0, 1000, 2000, 3000], v: [1, 2, 3, 4] };
    expect(sliceWindow(s, 1.5, 3000)).toEqual({ t: [2000, 3000], v: [3, 4] });
    expect(sliceWindow(s, null, 3000).v).toEqual([1, 2, 3, 4]);
  });

  it("suaviza, deriva e normaliza", () => {
    expect(movingAverage([2, 4, 6, 8], 2)).toEqual([2, 3, 5, 7]);
    expect(derivative([0, 500, 1000], [0, 1, 3])).toEqual([0, 2, 4]);
    expect(normalize01([5, 10, 15])).toEqual([0, 0.5, 1]);
    expect(normalize01([3, 3])).toEqual([0.5, 0.5]);
  });

  it("monta histograma com todas as amostras", () => {
    const bins = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 10], 5);
    expect(bins).toHaveLength(5);
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(10);
    expect(bins.at(-1)!.count).toBe(2); // 8 e 10 (o máximo cai na última faixa)
    expect(histogram([4, 4, 4], 10)).toEqual([{ from: 4, to: 4, mid: 4, count: 3, pct: 100 }]);
  });

  it("alinha métricas em blocos e correlaciona", () => {
    const rows = alignBuckets(
      [
        { name: "a", t: [0, 50, 100, 200, 300], v: [1, 3, 4, 6, 8] },
        { name: "b", t: [10, 110, 210], v: [10, 20, 30] },
      ],
      100,
    );
    expect(rows.map((r) => r.t)).toEqual([0, 100, 200, 300]);
    expect(rows[0].values).toEqual({ a: 2, b: 10 });
    expect(rows[3].values).toEqual({ a: 8, b: null });

    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
    expect(pearson([1, null, 3], [1, 2, null])).toBeNull();
  });

  it("soma o tempo em cada estado dentro da janela", () => {
    const segs = [
      { state: "A", from: 0, to: 1000 },
      { state: "B", from: 1000, to: 1500 },
      { state: "A", from: 1500, to: 3000 },
    ];
    const all = timeInStates(segs, 0, 3000);
    expect(all[0]).toMatchObject({ state: "A", ms: 2500, visits: 2 });
    expect(all[1].pct).toBeCloseTo((500 / 3000) * 100);
    const tail = timeInStates(segs, 2000, 3000);
    expect(tail).toEqual([{ state: "A", ms: 1000, visits: 1, pct: 100 }]);
  });

  it("agrupa e resume eventos", () => {
    const events = [
      { k: "E" as const, t: 0, name: "linha", data: 1 },
      { k: "E" as const, t: 400, name: "linha", data: 3 },
      { k: "E" as const, t: 900, name: "obst", data: 7 },
    ];
    const { names, rows } = eventBuckets(events, 0, 1000, 2);
    expect(names).toEqual(["linha", "obst"]);
    expect(rows[0]).toMatchObject({ linha: 2, obst: 0 });
    expect(rows[1]).toMatchObject({ linha: 0, obst: 1 });

    const summary = eventSummary(events);
    expect(summary[0]).toEqual({ name: "linha", total: 2, first: 0, last: 400, avgIntervalMs: 400, avgData: 2 });
    expect(summary[1].avgIntervalMs).toBeNull();
  });

  it("escapa CSV", () => {
    expect(toCsv(["a", "b"], [["x,y", null], ['diz "oi"', 2]])).toBe('a,b\n"x,y",\n"diz ""oi""",2');
  });
});

describe("configuração do painel Anatix", () => {
  it("cria um bloco válido para cada tipo do catálogo", () => {
    for (const spec of WIDGET_SPECS) {
      const w = createWidget(spec.type, ["a", "b", "c", "d"]);
      expect(normalizeWidget(w)).toEqual(w);
      expect(w.metrics.length).toBeLessThanOrEqual(spec.metrics.max);
    }
  });

  it("descarta lixo vindo do banco e limita a quantidade", () => {
    const widgets = normalizeDashboard([
      { type: "nao-existe" },
      null,
      { type: "line", id: "x", metrics: ["a", 3, ""], size: "gigante", options: { bins: 999, transform: "x", target: "abc" } },
      { type: "gauge", id: "x", metrics: ["a", "b"], windowSec: null },
      ...Array.from({ length: 40 }, () => ({ type: "kpi" })),
    ]);
    expect(widgets).toHaveLength(ANATIX_MAX_WIDGETS);
    expect(widgets[0]).toMatchObject({ type: "line", id: "x", metrics: ["a"], size: "lg", options: { bins: 80, target: null } });
    expect(widgets[0].options.transform).toBeUndefined();
    expect(widgets[1].id).not.toBe("x"); // id repetido ganha outro
    expect(widgets[1].metrics).toEqual(["a"]); // medidor usa uma métrica
    expect(new Set(widgets.map((w) => w.id)).size).toBe(widgets.length);
  });

  it("labs antigos ganham o painel ligado e vazio", () => {
    const config = normalizeAnatixConfig({ views: { charts: true, maps: false, tables: true } });
    expect(config.views).toEqual({ custom: true, charts: true, maps: false, tables: true });
    expect(config.dashboard).toEqual([]);
  });

  it("modelos geram blocos válidos com ou sem métricas", () => {
    for (const preset of DASHBOARD_PRESETS) {
      for (const metrics of [[], ["pos_x", "pos_y", "erro", "correcao", "vel_esq", "vel_dir"]]) {
        const built = preset.build(metrics);
        expect(normalizeDashboard(built)).toHaveLength(built.length);
      }
    }
  });
});
