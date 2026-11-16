import { describe, expect, it } from "vitest";
import { applyListFilters, listHref, parseListFilters } from "@/utils/labtest/list-filters";
import { applyFilters } from "@/utils/labtest/view-dashboard";

const t = (name: string, extra: Partial<Parameters<typeof applyListFilters>[0][number]> = {}) => ({
  name,
  description: null,
  mode: "runs",
  status: "planejamento",
  season: null,
  createdAt: new Date("2026-01-01"),
  executionCount: 0,
  ...extra,
});

describe("filtros da lista do LabTest", () => {
  const tests = [
    t("Rodada OBR", { status: "em_andamento", executionCount: 5, createdAt: new Date("2026-03-01") }),
    t("Calibração giroscópio", { mode: "calibrabot", status: "Concluído", executionCount: 9 }),
    t("Run Unearthed", { season: "unearthed", createdAt: new Date("2026-05-01") }),
  ];

  it("ignora parâmetros inválidos", () => {
    expect(parseListFilters({ modo: "x", status: "y", ordem: "z" })).toMatchObject({ mode: null, status: null, sort: "recente" });
  });

  it("busca sem acento e filtra por status normalizado", () => {
    expect(applyListFilters(tests, parseListFilters({ q: "calibracao" })).map((x) => x.name)).toEqual(["Calibração giroscópio"]);
    expect(applyListFilters(tests, parseListFilters({ status: "concluido" })).map((x) => x.name)).toEqual(["Calibração giroscópio"]);
  });

  it("filtra temporada e nunca executados", () => {
    expect(applyListFilters(tests, parseListFilters({ temporada: "unearthed" }))).toHaveLength(1);
    expect(applyListFilters(tests, parseListFilters({ novos: "1" })).map((x) => x.name)).toEqual(["Run Unearthed"]);
  });

  it("ordena por execuções, nome e criação", () => {
    const names = (ordem: string) => applyListFilters(tests, parseListFilters({ ordem })).map((x) => x.name);
    expect(names("execucoes")[0]).toBe("Calibração giroscópio");
    expect(names("nome")).toEqual(["Calibração giroscópio", "Rodada OBR", "Run Unearthed"]);
    expect(names("criacao")[0]).toBe("Run Unearthed");
  });

  it("monta a URL preservando parâmetros e tirando os vazios", () => {
    expect(listHref({ visualizacao: "grid", status: "concluido" }, { status: undefined, ordem: "recente" })).toBe(
      "/dashboard/labtest?visualizacao=grid",
    );
  });
});

describe("períodos da página do teste", () => {
  const entry = (n: number, daysAgo: number) => ({
    id: String(n),
    executionNumber: n,
    notes: null,
    values: [],
    createdAt: new Date(Date.now() - daysAgo * 86400e3).toISOString(),
  });
  const entries = [entry(1, 30), entry(2, 5), entry(3, 0)];

  it("hoje e últimos 7 dias", () => {
    expect(applyFilters(entries, { range: "today" }).map((e) => e.executionNumber)).toEqual([3]);
    expect(applyFilters(entries, { range: "week" }).map((e) => e.executionNumber)).toEqual([2, 3]);
  });
});
