import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { boards, folders, milestones, teamLegacyChapters, testExecutions, tests, trainingSessions } from "@/db/schema";
import {
  addLegacyItems,
  createLegacyChapter,
  getLegacySuggestions,
  listTeamLegacy,
  updateLegacyChapter,
} from "@/features/stagebook/actions/legacy";
import {
  formatSeconds,
  normalizeLegacyContent,
  normalizeSections,
  parseSeconds,
  scoreSummary,
  sectionFromTemplate,
  stageLabel,
} from "@/features/stagebook/types/legacy";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam } from "./helpers/db";

const ANA = "lo_ana";
const BIA = "lo_bia";
let teamId: string;

beforeAll(async () => {
  await applySchema();
  teamId = await createTeam("OBR FC", [
    { userId: BIA, role: "owner" },
    { userId: ANA, role: "competidor" },
  ]);
});

describe("seções de documentação (funções puras)", () => {
  it("normaliza cada tipo e descarta o que não serve", () => {
    const sections = normalizeSections([
      { kind: "links", title: "Mídia", rows: [{ label: "", url: "https://www.youtube.com/watch?v=1" }, { label: "ruim", url: "javascript:alert(1)" }, { url: "ftp://x" }] },
      { kind: "scores", title: "Resgate", showTime: true, rows: [{ label: "R1", points: "210,5", time: 185 }, { label: "", points: "abc" }, { label: "R2", points: 1e9 }] },
      { kind: "feedback", rows: [{ label: "Core Values", value: "Ótima equipe", extra: "Explicar melhor" }, {}] },
      { kind: "timeline", rows: [{ label: "Estadual", date: "2026-08-15" }, { label: "Sem data", date: "2026-02-30" }, { date: "2026-01-01" }] },
      { kind: "texto-inexistente", rows: [] },
      { kind: "text", title: "", text: "  Relato  " },
      "lixo",
    ]);
    expect(sections.map((s) => s.kind)).toEqual(["links", "scores", "feedback", "timeline", "text"]);
    expect(sections[0].rows).toEqual([{ id: expect.any(String), label: "youtube.com", url: "https://www.youtube.com/watch?v=1" }]);
    expect(sections[1].showTime).toBe(true);
    expect(sections[1].rows?.map((r) => [r.label, r.points, r.time])).toEqual([
      ["R1", 210.5, 185],
      ["R2", null, null],
    ]);
    expect(sections[2].rows).toHaveLength(1);
    expect(sections[3].rows?.map((r) => r.date ?? null)).toEqual(["2026-08-15", null]);
    expect(sections[4]).toMatchObject({ title: "Relato", text: "Relato" });

    // o conteúdo da aba passa pela mesma barreira
    expect(normalizeLegacyContent({ modality: "  Prática ·  Resgate ", sections: [{ kind: "specs", rows: [{ label: "Sensores", value: "cor" }] }] })).toMatchObject({
      modality: "Prática · Resgate",
      sections: [{ kind: "specs", title: "Ficha do robô" }],
    });
  });

  it("placar, tempo, modelos e etapas", () => {
    expect(scoreSummary([{ id: "a", label: "1", points: 120, time: 200 }, { id: "b", label: "2", points: 240, time: 150 }, { id: "c", label: "3", points: null }])).toEqual({
      best: 240,
      avg: 180,
      count: 2,
      bestTime: 150,
    });
    expect(scoreSummary([])).toBeNull();
    expect(parseSeconds("3:05")).toBe(185);
    expect(parseSeconds("90")).toBe(90);
    expect(parseSeconds("3:75")).toBeNull();
    expect(formatSeconds(185)).toBe("3:05");

    const rescue = sectionFromTemplate("obr-rescue")!;
    expect(rescue).toMatchObject({ kind: "scores", showTime: true, title: "Resgate — rodadas" });
    expect(rescue.rows?.map((r) => r.label)).toEqual(["Rodada 1", "Rodada 2", "Rodada 3"]);
    expect(sectionFromTemplate("nao-existe")).toBeNull();

    expect(stageLabel("obr", "internacional")).toBe("Mundial (RoboCup)");
    expect(stageLabel("fll", "estadual")).toBe("Estadual"); // etapa de outra liga cai no rótulo genérico
  });
});

describe("OBR no legado", () => {
  it("temporada OBR por ano; competição herda a liga e tem etapa", async () => {
    actAs(ANA, teamId);
    const season = await call(createLegacyChapter(teamId, { kind: "season", seasonKey: "obr-2026" }));
    const [row] = await db.select().from(teamLegacyChapters).where(eq(teamLegacyChapters.id, season.id));
    expect(row).toMatchObject({ title: "OBR 2026", league: "obr", startDate: "2026-01-01", endDate: "2026-12-31", seasonKey: "obr-2026" });

    const comp = await call(createLegacyChapter(teamId, { kind: "competition", title: "Etapa estadual SP", parentId: season.id, stage: "estadual", startDate: "2026-08-15" }));
    const [c] = await db.select().from(teamLegacyChapters).where(eq(teamLegacyChapters.id, comp.id));
    expect(c).toMatchObject({ league: "obr", stage: "estadual" });

    expect((await createLegacyChapter(teamId, { kind: "season", title: "X", stage: "regional" })).ok).toBe(false);
    expect((await createLegacyChapter(teamId, { kind: "competition", title: "Y", stage: "final" })).ok).toBe(false);
    expect((await createLegacyChapter(teamId, { kind: "season", title: "Z", league: "vex" })).ok).toBe(false);

    // temporada personalizada de outra liga
    const custom = await call(createLegacyChapter(teamId, { kind: "season", title: "WRO 2025", league: "outra" }));
    await call(updateLegacyChapter(teamId, custom.id, { league: "ftc" }));
    const legacy = await call(listTeamLegacy(teamId));
    expect(legacy.find((x) => x.id === custom.id)?.league).toBe("ftc");
    expect(legacy.find((x) => x.id === comp.id)).toMatchObject({ league: "obr", stage: "estadual" });
  });

  it("sugere testes OBR com rodadas no ano (e não os da FLL)", async () => {
    actAs(ANA, teamId);
    const season = await call(createLegacyChapter(teamId, { kind: "season", seasonKey: "obr-2025" }));
    const [obr] = await db
      .insert(tests)
      .values({ userId: ANA, teamId, name: "Resgate treino", config: { edition: "obr-resgate" }, createdAt: new Date("2024-11-01T12:00:00Z") })
      .returning({ id: tests.id });
    await db.insert(testExecutions).values({ testId: obr.id, executionNumber: 1, results: {}, createdAt: new Date("2025-06-10T15:00:00Z") });
    const [fll] = await db
      .insert(tests)
      .values({ userId: ANA, teamId, name: "Missões FLL", season: "unearthed", config: {}, createdAt: new Date("2025-09-01T12:00:00Z") })
      .returning({ id: tests.id });
    const [old] = await db
      .insert(tests)
      .values({ userId: ANA, teamId, name: "OBR antigo", config: { tipo: "obr" }, createdAt: new Date("2023-05-01T12:00:00Z") })
      .returning({ id: tests.id });

    const sugg = await call(getLegacySuggestions(teamId, season.id));
    expect(sugg.find((x) => x.id === obr.id)?.reason).toBe("OBR no período");
    expect(sugg.some((x) => x.id === fll.id)).toBe(false);
    expect(sugg.some((x) => x.id === old.id)).toBe(false);
  });
});

describe("mais tipos de item e seções salvas", () => {
  it("guarda Kanban, pasta, sessão de treino e meta; some ao excluir", async () => {
    actAs(ANA, teamId);
    const chapter = await call(createLegacyChapter(teamId, { kind: "competition", title: "Nacional", startDate: "2026-10-20", league: "obr", stage: "nacional" }));
    const [board] = await db.insert(boards).values({ teamId, name: "Preparação nacional", createdBy: ANA }).returning({ id: boards.id });
    const [folder] = await db.insert(folders).values({ teamId, name: "Relatórios", createdBy: ANA }).returning({ id: folders.id });
    const [session] = await db
      .insert(trainingSessions)
      .values({ teamId, title: "Nacional — dia 1", kind: "competicao", status: "encerrada", startedAt: new Date("2026-10-20T13:00:00Z"), createdBy: ANA })
      .returning({ id: trainingSessions.id });
    const [goal] = await db
      .insert(milestones)
      .values({ teamId, name: "Pódio no nacional", completedAt: new Date("2026-10-20T20:00:00Z") })
      .returning({ id: milestones.id });

    const sugg = await call(getLegacySuggestions(teamId, chapter.id));
    expect(sugg.find((s) => s.id === session.id)?.reason).toMatch(/Competição/);
    expect(sugg.find((s) => s.id === goal.id)?.reason).toMatch(/concluída/);

    expect(
      (
        await call(
          addLegacyItems(teamId, chapter.id, [
            { kind: "kanban", id: board.id },
            { kind: "folder", id: folder.id },
            { kind: "session", id: session.id },
            { kind: "milestone", id: goal.id },
          ]),
        )
      ).added,
    ).toBe(4);

    let item = (await call(listTeamLegacy(teamId))).find((c) => c.id === chapter.id)!;
    expect(item.items.map((i) => [i.kind, i.href])).toEqual([
      ["kanban", `/dashboard/kanban/${board.id}`],
      ["folder", `/dashboard/folders/${folder.id}`],
      ["session", `/dashboard/team/${teamId}/treinos/${session.id}`],
      ["milestone", `/dashboard/team/${teamId}?tab=marcos`],
    ]);
    expect(item.items.find((i) => i.kind === "milestone")?.meta).toMatch(/concluída/);

    await db.delete(boards).where(eq(boards.id, board.id));
    item = (await call(listTeamLegacy(teamId))).find((c) => c.id === chapter.id)!;
    expect(item.items.map((i) => i.kind)).toEqual(["folder", "session", "milestone"]);

    // de outra equipe não entra
    const otherTeam = await createTeam("Outra OBR", [{ userId: "lo_out", role: "owner" }]);
    const [foreign] = await db.insert(boards).values({ teamId: otherTeam, name: "Alheio", createdBy: "lo_out" }).returning({ id: boards.id });
    expect((await addLegacyItems(teamId, chapter.id, [{ kind: "kanban", id: foreign.id }])).ok).toBe(false);
  });

  it("salva seções e as mantém ao editar o resto do conteúdo", async () => {
    actAs(ANA, teamId);
    const chapter = await call(createLegacyChapter(teamId, { kind: "competition", title: "Regional RJ", league: "obr", stage: "regional" }));
    const rescue = sectionFromTemplate("obr-rescue")!;
    rescue.rows = [{ id: "a", label: "Rodada 1", points: 180, time: 240 }];
    await call(updateLegacyChapter(teamId, chapter.id, { content: { summary: "Primeira etapa", sections: [rescue] } }));
    let saved = (await call(listTeamLegacy(teamId))).find((c) => c.id === chapter.id)!;
    expect(saved.content.sections?.[0]).toMatchObject({ kind: "scores", showTime: true, rows: [{ label: "Rodada 1", points: 180, time: 240 }] });

    await call(updateLegacyChapter(teamId, chapter.id, { content: { ...saved.content, result: "Classificados para o estadual" } }));
    saved = (await call(listTeamLegacy(teamId))).find((c) => c.id === chapter.id)!;
    expect(saved.content).toMatchObject({ summary: "Primeira etapa", result: "Classificados para o estadual" });
    expect(saved.content.sections).toHaveLength(1);
  });
});
