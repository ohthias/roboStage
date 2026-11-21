/**
 * Embeds do ThinkLab e do LabTest: tamanho/posição, filtros de execuções,
 * tipos de gráfico e partes visíveis.
 */
import { describe, expect, it } from "vitest";
import {
  chartTypeDisabledReason,
  clampEmbedWidth,
  cleanLabTestFilter,
  describeLabTestFilter,
  embedLayoutStyle,
  filterLabTestEntries,
  isSectionVisible,
  labTestSections,
  normalizeChartType,
  normalizeEmbedLayout,
  normalizeHeight,
  toggleHiddenSection,
  widthFromDrag,
  FLL_SECTIONS,
  MOTOR_SECTIONS,
  SUMMARY_SECTIONS,
} from "@/components/editor/embeds/embed-options";
import { documentToHtml } from "@/components/editor/export-document";

describe("tamanho e posição", () => {
  it("limita a largura entre 30 e 100", () => {
    expect(clampEmbedWidth(10)).toBe(30);
    expect(clampEmbedWidth(150)).toBe(100);
    expect(clampEmbedWidth(52.4)).toBe(52);
    expect(clampEmbedWidth("abc")).toBe(100);
  });

  it("normaliza opções ausentes ou inválidas", () => {
    expect(normalizeEmbedLayout(undefined)).toEqual({ width: 100, align: "center" });
    expect(normalizeEmbedLayout({ width: 50, align: "left" })).toEqual({ width: 50, align: "left" });
    expect(normalizeEmbedLayout({ align: "meio" as never })).toEqual({ width: 100, align: "center" });
  });

  it("gera margens para esquerda, centro e direita", () => {
    expect(embedLayoutStyle({ width: 50, align: "left" })).toEqual({ width: "50%", marginLeft: "0", marginRight: "auto" });
    expect(embedLayoutStyle({ width: 50, align: "center" })).toEqual({ width: "50%", marginLeft: "auto", marginRight: "auto" });
    expect(embedLayoutStyle({ width: 50, align: "right" })).toEqual({ width: "50%", marginLeft: "auto", marginRight: "0" });
  });

  it("calcula a largura ao arrastar a alça (encaixe de 5%)", () => {
    const base = { blockLeft: 0, blockRight: 500, containerWidth: 1000 };
    expect(widthFromDrag({ ...base, pointerX: 612, align: "left", edge: "right" })).toBe(60);
    // Direita: a alça fica na borda esquerda e o bloco cresce para a esquerda.
    expect(widthFromDrag({ blockLeft: 500, blockRight: 1000, containerWidth: 1000, pointerX: 300, align: "right", edge: "left" })).toBe(70);
    // Centro: cresce para os dois lados.
    expect(widthFromDrag({ blockLeft: 250, blockRight: 750, containerWidth: 1000, pointerX: 900, align: "center", edge: "right" })).toBe(80);
    expect(widthFromDrag({ ...base, pointerX: 10, align: "left", edge: "right" })).toBe(30);
  });

  it("aceita só alturas conhecidas", () => {
    expect(normalizeHeight("lg")).toBe("lg");
    expect(normalizeHeight("gigante")).toBe("md");
    expect(normalizeHeight(undefined, "sm")).toBe("sm");
  });

  it("aplica largura e posição no HTML exportado", () => {
    const html = documentToHtml(
      {
        root: {
          type: "root",
          children: [
            { type: "stagebook-embed", embedKind: "thinklab-board", label: "Quadro", options: { width: 50, align: "right" } },
          ],
        },
      } as never,
      { title: "Teste" } as never,
    );
    expect(html).toContain('style="width:50%;margin-left:auto;margin-right:0"');
  });
});

describe("tipos de gráfico", () => {
  it("cai para linha quando o tipo é desconhecido", () => {
    expect(normalizeChartType("radar")).toBe("radar");
    expect(normalizeChartType("pizza")).toBe("line");
  });

  it("explica quando o tipo não serve para os dados", () => {
    expect(chartTypeDisabledReason("stacked", 1, 10)).toMatch(/2 ou mais séries/);
    expect(chartTypeDisabledReason("radar", 2, 2)).toMatch(/3 ou mais execuções/);
    expect(chartTypeDisabledReason("bar", 1, 1)).toBeNull();
  });
});

describe("filtros de execuções", () => {
  const entries = Array.from({ length: 10 }, (_, i) => ({
    executionNumber: i + 1,
    createdAt: new Date(2026, 10, i + 1, 12).toISOString(),
    score: (i + 1) * 10,
  }));
  const valueOf = (e: (typeof entries)[number]) => e.score;

  it("sem filtro devolve tudo", () => {
    expect(filterLabTestEntries(entries, undefined)).toBe(entries);
    expect(filterLabTestEntries(entries, {})).toBe(entries);
  });

  it("últimas N", () => {
    expect(filterLabTestEntries(entries, { last: 3 }).map((e) => e.executionNumber)).toEqual([8, 9, 10]);
  });

  it("intervalo de execuções (aceita invertido)", () => {
    expect(filterLabTestEntries(entries, { fromExec: 7, toExec: 4 }).map((e) => e.executionNumber)).toEqual([4, 5, 6, 7]);
  });

  it("período por data", () => {
    const out = filterLabTestEntries(entries, { dateFrom: "2026-11-03", dateTo: "2026-11-05" });
    expect(out.map((e) => e.executionNumber)).toEqual([3, 4, 5]);
  });

  it("condição de valor e depois últimas N", () => {
    const out = filterLabTestEntries(entries, { value: { key: "score", op: "lte", value: 60 }, last: 2 }, valueOf);
    expect(out.map((e) => e.executionNumber)).toEqual([5, 6]);
  });

  it("limpa campos inválidos", () => {
    expect(cleanLabTestFilter({ last: 0, dateFrom: "ontem" })).toBeUndefined();
    expect(cleanLabTestFilter({ last: 4.7 })).toEqual({ last: 4 });
  });

  it("descreve os filtros ativos", () => {
    expect(
      describeLabTestFilter(
        { fromExec: 2, toExec: 8, dateFrom: "2026-11-01", value: { key: "__total", op: "gte", value: 200 }, last: 5 },
        () => "Pontuação",
      ),
    ).toEqual(["Execuções #2–#8", "Desde 01/11/2026", "Pontuação ≥ 200", "Últimas 5 execuções"]);
  });
});

describe("partes do bloco", () => {
  it("lista as partes por visualização e modo", () => {
    expect(labTestSections("resumo", "runs", "2025")).toBe(SUMMARY_SECTIONS);
    expect(labTestSections("completo", "runs", "2025")).toBe(FLL_SECTIONS);
    expect(labTestSections("completo", "calibrabot", null, { tipo: "motores" })).toBe(MOTOR_SECTIONS);
    expect(labTestSections("completo", "custom", null)).toEqual([]);
  });

  it("alterna partes sem esconder todas", () => {
    let hidden = toggleHiddenSection(undefined, "chart", SUMMARY_SECTIONS);
    expect(hidden).toEqual(["chart"]);
    expect(isSectionVisible(hidden, "chart")).toBe(false);
    // Esconder a última parte visível não é permitido.
    hidden = toggleHiddenSection(hidden, "stats", SUMMARY_SECTIONS);
    expect(hidden).toEqual(["chart"]);
    hidden = toggleHiddenSection(hidden, "chart", SUMMARY_SECTIONS);
    expect(hidden).toEqual([]);
  });
});
