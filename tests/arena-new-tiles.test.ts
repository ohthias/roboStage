import { describe, expect, it } from "vitest";
import { analyzePath } from "@/utils/quickbrick/ArenaBuilder/analysis";
import { defaultProject, sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import {
  emptyTile,
  hazardAllowed,
  HAZARD_SPOTS,
  markSlots,
  setShape,
  SHAPES,
  sideGroups,
  toggleHazard,
} from "@/utils/quickbrick/ArenaBuilder/tiles";
import type { Project, Rot, Shape, Tile } from "@/utils/quickbrick/ArenaBuilder/types";

const t = (shape: Shape, rot: Rot = 0, extra: Partial<Tile> = {}): Tile => ({ ...emptyTile(), shape, rot, ...extra });

/** projeto com um único tablado preenchido pelos ladrilhos dados (índice 0–8) */
function project(tiles: Record<number, Tile>): Project {
  const p: Project = structuredClone(defaultProject());
  p.boards[0].tiles = Array.from({ length: 9 }, (_, i) => tiles[i] ?? emptyTile());
  return p;
}
const scoreOf = (p: Project, label: string) => analyzePath(p).score.find((l) => l.label.startsWith(label))!;

describe("ladrilhos com duas linhas", () => {
  it("diagonais duplas têm dois trechos independentes, girando junto", () => {
    expect(sideGroups(t("doubleDiag"))).toEqual([[0, 3], [1, 2]]);
    expect(sideGroups(t("doubleDiag", 1))).toEqual([[1, 0], [2, 3]]);
    expect(sideGroups(t("corner"))).toEqual([[1, 2]]);
  });

  it("o percurso não atravessa de um trecho para o outro", () => {
    // partida sobe para as diagonais (trecho S–L) e segue para a reta à direita
    const p = project({ 7: t("start"), 4: t("doubleDiag"), 5: t("straight", 1), 1: t("straight") });
    const open = analyzePath(p).checks.find((c) => c.text.includes("ponta(s) de linha"));
    expect(open?.text.startsWith("1 ")).toBe(true);
  });
});

describe("gap e lombada", () => {
  it("todo ladrilho com linha aceita gap e lombada", () => {
    for (const { id } of SHAPES) {
      if (id === "empty" || id === "start" || id === "finish") continue;
      expect(hazardAllowed(id, "gap"), `${id} gap`).toBe(true);
      expect(hazardAllowed(id, "bump"), `${id} bump`).toBe(true);
    }
  });

  it("tem ponto de desenho para cada perigo permitido", () => {
    for (const { id } of SHAPES) {
      if (id === "dashed") continue;
      if (hazardAllowed(id, "gap")) expect(HAZARD_SPOTS[id]?.gap, id).toBeDefined();
      if (hazardAllowed(id, "bump")) expect(HAZARD_SPOTS[id]?.bump, id).toBeDefined();
    }
  });

  it("a tracejada já vem com gap, que não pode ser removido", () => {
    const d = setShape(t("straight"), "dashed");
    expect(d.hazards).toEqual(["gap"]);
    expect(toggleHazard(d, "gap").hazards).toEqual(["gap"]);
    // ao trocar de formato, o gap embutido não vai junto
    expect(setShape(d, "straight").hazards).toEqual([]);
  });

  it("gaps e lombadas dos ladrilhos novos pontuam", () => {
    const p = project({
      0: t("wave", 0, { hazards: ["gap"] }),
      1: t("zigzag", 0, { hazards: ["gap", "bump"] }),
      2: setShape(t("straight"), "dashed"),
    });
    expect(scoreOf(p, "Ladrilho com gap").count).toBe(3);
    expect(scoreOf(p, "Ladrilho com lombada").count).toBe(1);
  });
});

describe("interseções e marcações verdes", () => {
  it("círculos têm duas junções; fim em T é beco sem saída", () => {
    const p = project({ 0: t("ring"), 1: t("ringCut"), 2: t("deadEnd"), 3: t("tee"), 4: t("loop") });
    expect(scoreOf(p, "Interseção").count).toBe(2 + 2 + 1 + 1);
    expect(scoreOf(p, "Interseção").points).toBe(60);
  });

  it("só aceita marcações nas junções do formato", () => {
    expect(markSlots("ring").map((m) => m.key)).toEqual(["markL", "markR", "markTL", "markTR"]);
    expect(markSlots("deadEnd").map((m) => m.key)).toEqual(["markL", "markR"]);
    expect(markSlots("wave")).toEqual([]);

    const ring = t("ring", 0, { markL: true, markTR: true });
    expect(setShape(ring, "deadEnd")).toMatchObject({ markL: true, markTR: false });
    expect(setShape(ring, "wave")).toMatchObject({ markL: false, markR: false, markTL: false, markTR: false });
  });

  it("a importação descarta marcações e perigos inválidos", () => {
    const raw = project({
      0: t("deadEnd", 0, { markL: true, markTL: true, hazards: ["gap", "ramp"] }),
      1: t("dashed"),
    });
    const p = sanitizeProject(JSON.parse(JSON.stringify(raw)))!;
    expect(p.boards[0].tiles[0]).toMatchObject({ markL: true, markTL: false, hazards: ["gap"] });
    expect(p.boards[0].tiles[1].hazards).toEqual(["gap"]);
  });

  it("avisa sobre fim em T sem as duas marcações", () => {
    const has = (p: Project) => analyzePath(p).checks.some((c) => c.text.includes("Fim em T"));
    expect(has(project({ 0: t("deadEnd", 0, { markL: true }) }))).toBe(true);
    expect(has(project({ 0: t("deadEnd", 0, { markL: true, markR: true }) }))).toBe(false);
  });
});
