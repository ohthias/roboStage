import { beforeAll, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  documentTags,
  documents,
  folders,
  journalEntries,
  journalEntryLinks,
  milestones,
  quickbrickNotebooks,
  syncedBlocks,
  tags,
  teamActivity,
  teamLegacyChapters,
  teamLegacyItems,
  testExecutions,
  tests,
  thinklab,
  userPins,
} from "@/db/schema";
import { searchTransferCandidates, transferItemsToTeam } from "@/features/stagebook/actions/transfer";
import {
  addLegacyItems,
  createLegacyChapter,
  deleteLegacyChapter,
  getLegacySuggestions,
  listTeamLegacy,
  removeLegacyItem,
  searchLegacyCandidates,
  updateLegacyChapter,
  updateLegacyItemNote,
} from "@/features/stagebook/actions/legacy";
import { chapterRange } from "@/features/stagebook/lib/legacy-core";
import { normalizeLegacyContent } from "@/features/stagebook/types/legacy";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const ANA = "lg_ana"; // competidora
const BIA = "lg_bia"; // técnica
const CAI = "lg_cai"; // competidor
const OUT = "lg_out"; // de fora
let teamId: string;
let otherTeamId: string;

beforeAll(async () => {
  await applySchema();
  teamId = await createTeam("Legado FC", [
    { userId: BIA, role: "owner" },
    { userId: ANA, role: "competidor" },
    { userId: CAI, role: "competidor" },
  ]);
  otherTeamId = await createTeam("Outra", [{ userId: OUT, role: "owner" }]);
  await createUser(OUT);
});

// ===========================================================================
describe("transferência pessoal → equipe", () => {
  it("leva a pasta com subpastas, páginas, subpáginas, testes e quadros; ajusta tags, meta, blocos e vínculos", async () => {
    actAs(ANA);
    const [root] = await db.insert(folders).values({ userId: ANA, name: "Projeto", createdBy: ANA }).returning({ id: folders.id });
    const [sub] = await db.insert(folders).values({ userId: ANA, parentId: root.id, name: "Pesquisa", createdBy: ANA }).returning({ id: folders.id });
    const [block] = await db
      .insert(syncedBlocks)
      .values({ userId: ANA, title: "Rodapé", content: { root: { children: [] } }, createdBy: ANA })
      .returning({ id: syncedBlocks.id });
    const [goal] = await db.insert(milestones).values({ userId: ANA, name: "Pessoal" }).returning({ id: milestones.id });
    const [page] = await db
      .insert(documents)
      .values({
        userId: ANA,
        folderId: sub.id,
        title: "Entrevistas",
        createdBy: ANA,
        milestoneId: goal.id,
        content: { root: { type: "root", children: [{ type: "synced-block", syncId: block.id, version: 1 }] } },
      })
      .returning({ id: documents.id });
    const [child] = await db.insert(documents).values({ userId: ANA, parentId: page.id, title: "Entrevista 1", createdBy: ANA }).returning({ id: documents.id });
    const [trashed] = await db
      .insert(documents)
      .values({ userId: ANA, parentId: page.id, title: "Rascunho", createdBy: ANA, deletedAt: new Date() })
      .returning({ id: documents.id });
    const [inFolderTest] = await db.insert(tests).values({ userId: ANA, folderId: root.id, name: "Missão 1", config: {} }).returning({ id: tests.id });
    const [inFolderBoard] = await db.insert(thinklab).values({ userId: ANA, folderId: sub.id, name: "Ideias" }).returning({ id: thinklab.id });
    // tag pessoal na página
    const [tag] = await db.insert(tags).values({ userId: ANA, name: "Inovação", color: "#ff0000" }).returning({ id: tags.id });
    await db.insert(documentTags).values({ documentId: page.id, tagId: tag.id });
    // vínculo vindo do diário pessoal + fixado pessoal
    const [entry] = await db
      .insert(journalEntries)
      .values({ userId: ANA, authorId: ANA, entryDate: "2026-11-01", content: { categories: [], sections: [] } })
      .returning({ id: journalEntries.id });
    await db.insert(journalEntryLinks).values({ entryId: entry.id, documentId: page.id, createdBy: ANA });
    await db.insert(userPins).values({ userId: ANA, kind: "stagebook", resourceId: page.id });

    // aparece na lista de candidatos
    const candidates = await call(searchTransferCandidates({ kind: "folder" }));
    expect(candidates.find((c) => c.id === root.id)?.detail).toMatch(/1 subpasta/);

    const result = await call(transferItemsToTeam(teamId, [{ kind: "folder", id: root.id }]));
    expect(result.folders).toBe(2);
    expect(result.pages).toBe(3); // página + subpágina + a da lixeira
    expect(result.moved[0]).toMatchObject({ kind: "folder", title: "Projeto", href: `/dashboard/folders/${root.id}` });

    const fs = await db.select().from(folders).where(inArray(folders.id, [root.id, sub.id]));
    expect(fs.every((f) => f.teamId === teamId && f.userId === null)).toBe(true);
    expect(fs.find((f) => f.id === sub.id)?.parentId).toBe(root.id);

    const docs = await db.select().from(documents).where(inArray(documents.id, [page.id, child.id, trashed.id]));
    expect(docs.every((d) => d.teamId === teamId && d.userId === null)).toBe(true);
    const moved = docs.find((d) => d.id === page.id)!;
    expect(moved.folderId).toBe(sub.id);
    expect(moved.milestoneId).toBeNull();
    expect(docs.find((d) => d.id === child.id)?.parentId).toBe(page.id);

    // bloco sincronizado copiado para a equipe e o conteúdo aponta para a cópia
    const newSync = (moved.content as { root: { children: { syncId: string }[] } }).root.children[0].syncId;
    expect(newSync).not.toBe(block.id);
    const [copy] = await db.select().from(syncedBlocks).where(eq(syncedBlocks.id, newSync));
    expect(copy).toMatchObject({ teamId, userId: null, title: "Rodapé" });
    const [original] = await db.select().from(syncedBlocks).where(eq(syncedBlocks.id, block.id));
    expect(original.userId).toBe(ANA);

    // teste e quadro guardados nas pastas foram junto (e continuam na pasta)
    const [t] = await db.select().from(tests).where(eq(tests.id, inFolderTest.id));
    expect(t).toMatchObject({ teamId, userId: ANA, folderId: root.id });
    const [b] = await db.select().from(thinklab).where(eq(thinklab.id, inFolderBoard.id));
    expect(b).toMatchObject({ teamId, folderId: sub.id });

    // tag trocada pela da equipe (mesmo nome e cor)
    const applied = await db
      .select({ name: tags.name, teamId: tags.teamId, color: tags.color })
      .from(documentTags)
      .innerJoin(tags, eq(tags.id, documentTags.tagId))
      .where(eq(documentTags.documentId, page.id));
    expect(applied).toEqual([{ name: "Inovação", teamId, color: "#ff0000" }]);

    // vínculo do diário pessoal e fixado pessoal removidos
    expect(await db.select().from(journalEntryLinks).where(eq(journalEntryLinks.entryId, entry.id))).toHaveLength(0);
    expect(await db.select().from(userPins).where(eq(userPins.resourceId, page.id))).toHaveLength(0);

    expect(result.notes.join(" ")).toMatch(/meta pessoal/);
    expect(result.notes.join(" ")).toMatch(/bloco sincronizado/);

    // feed
    const feed = await db
      .select()
      .from(teamActivity)
      .where(and(eq(teamActivity.teamId, teamId), eq(teamActivity.verb, "resource.transferred")));
    expect(feed.at(-1)?.data).toMatchObject({ count: 1, first: "Projeto" });
  });

  it("subpágina sozinha vai para a raiz; teste mantém execuções e ganha nome livre", async () => {
    actAs(ANA);
    const [parent] = await db.insert(documents).values({ userId: ANA, title: "Mãe", createdBy: ANA }).returning({ id: documents.id });
    const [child] = await db.insert(documents).values({ userId: ANA, parentId: parent.id, title: "Filha", createdBy: ANA }).returning({ id: documents.id });
    await db.insert(tests).values({ userId: BIA, teamId, name: "Calibração", config: {} });
    const [mine] = await db.insert(tests).values({ userId: ANA, name: "Calibração", config: {} }).returning({ id: tests.id });
    await db.insert(testExecutions).values({ testId: mine.id, executionNumber: 1, results: {} });
    const [qb] = await db.insert(quickbrickNotebooks).values({ userId: ANA, name: "Robô 2026", season: "bioglow" }).returning({ id: quickbrickNotebooks.id });

    const result = await call(
      transferItemsToTeam(teamId, [
        { kind: "stagebook", id: child.id },
        { kind: "labtest", id: mine.id },
        { kind: "quickbrick", id: qb.id },
      ]),
    );
    const [c] = await db.select().from(documents).where(eq(documents.id, child.id));
    expect(c).toMatchObject({ teamId, parentId: null, folderId: null });
    const [p] = await db.select().from(documents).where(eq(documents.id, parent.id));
    expect(p.userId).toBe(ANA); // a mãe fica no pessoal

    const [t] = await db.select().from(tests).where(eq(tests.id, mine.id));
    expect(t).toMatchObject({ teamId, name: "Calibração (2)" });
    expect(result.renamed).toEqual([{ from: "Calibração", to: "Calibração (2)" }]);
    expect(await db.select().from(testExecutions).where(eq(testExecutions.testId, mine.id))).toHaveLength(1);

    const [n] = await db.select().from(quickbrickNotebooks).where(eq(quickbrickNotebooks.id, qb.id));
    expect(n.teamId).toBe(teamId);
  });

  it("não transfere o que não é seu, nem para equipe de que não é membro", async () => {
    actAs(BIA);
    const [bias] = await db.insert(tests).values({ userId: BIA, name: "Da Bia", config: {} }).returning({ id: tests.id });
    actAs(ANA);
    const notMine = await transferItemsToTeam(teamId, [{ kind: "labtest", id: bias.id }]);
    expect(notMine.ok).toBe(false);
    if (!notMine.ok) expect(notMine.error).toMatch(/não está mais no seu espaço pessoal/);

    const [own] = await db.insert(tests).values({ userId: ANA, name: "Meu", config: {} }).returning({ id: tests.id });
    const outsider = await transferItemsToTeam(otherTeamId, [{ kind: "labtest", id: own.id }]);
    expect(outsider.ok).toBe(false);
    if (!outsider.ok) expect(outsider.error).toMatch(/não é membro/);

    // já é da equipe: não dá para transferir de novo
    await call(transferItemsToTeam(teamId, [{ kind: "labtest", id: own.id }]));
    expect((await transferItemsToTeam(teamId, [{ kind: "labtest", id: own.id }])).ok).toBe(false);

    expect((await transferItemsToTeam(teamId, [])).ok).toBe(false);
    expect((await transferItemsToTeam(teamId, [{ kind: "kanban", id: own.id }])).ok).toBe(false);
  });
});

// ===========================================================================
describe("legado da equipe", () => {
  it("normaliza o conteúdo e calcula o período", () => {
    const c = normalizeLegacyContent({
      summary: "  Ano  incrível \r\n\r\n\r\n\r\n\r\nfim ",
      result: "  2º   lugar ",
      awards: [{ title: " Robot Design " }, { title: "" }, "lixo"],
      highlights: ["Primeiro torneio", { text: "   " }],
      members: ["a", "a", 3, "b"],
      extra: "x",
    });
    expect(c.summary).toBe("Ano  incrível\n\n\nfim");
    expect(c.result).toBe("2º lugar");
    expect(c.awards?.map((a) => a.title)).toEqual(["Robot Design"]);
    expect(c.highlights?.map((h) => h.text)).toEqual(["Primeiro torneio"]);
    expect(c.members).toEqual(["a", "b"]);
    expect("extra" in c).toBe(false);

    expect(chapterRange({ kind: "season", startDate: "2025-08-01", endDate: null }, "2026-01-10")).toEqual({ start: "2025-08-01", end: "2026-01-10" });
    expect(chapterRange({ kind: "competition", startDate: "2026-03-14", endDate: null })).toEqual({ start: "2026-03-14", end: "2026-03-14" });
    expect(chapterRange({ kind: "season", startDate: null, endDate: null })).toBeNull();
  });

  it("cria temporada pelo preset e competição dentro dela; valida pai, datas e nome repetido", async () => {
    actAs(CAI, teamId);
    const season = await call(createLegacyChapter(teamId, { kind: "season", seasonKey: "unearthed" }));
    const [row] = await db.select().from(teamLegacyChapters).where(eq(teamLegacyChapters.id, season.id));
    expect(row).toMatchObject({ title: "Unearthed 2025/26", startDate: "2025-08-01", endDate: "2026-07-31", seasonKey: "unearthed", createdBy: CAI });

    const comp = await call(
      createLegacyChapter(teamId, { kind: "competition", title: "Regional SP", parentId: season.id, startDate: "2026-03-14", location: "São Paulo" }),
    );
    expect((await createLegacyChapter(teamId, { kind: "competition", title: "X", parentId: comp.id })).ok).toBe(false); // pai não é temporada
    expect((await createLegacyChapter(teamId, { kind: "season", title: "Y", parentId: season.id })).ok).toBe(false); // temporada não tem pai
    expect((await createLegacyChapter(teamId, { kind: "season", title: "regional sp" })).ok).toBe(false); // nome repetido
    expect((await createLegacyChapter(teamId, { kind: "season", title: "Z", startDate: "2026-05-01", endDate: "2026-01-01" })).ok).toBe(false);
    expect((await createLegacyChapter(teamId, { kind: "season", title: "W", startDate: "2026-02-30" })).ok).toBe(false);

    // de outra equipe não vê nem mexe
    actAs(OUT, otherTeamId);
    expect((await listTeamLegacy(teamId)).ok).toBe(false);
    expect((await updateLegacyChapter(otherTeamId, season.id, { title: "Hack" })).ok).toBe(false);

    const feed = await db.select().from(teamActivity).where(and(eq(teamActivity.teamId, teamId), eq(teamActivity.verb, "legacy.chapter_created")));
    expect(feed.map((f) => (f.data as { name: string }).name)).toEqual(expect.arrayContaining(["Unearthed 2025/26", "Regional SP"]));
  });

  it("guarda o que foi feito: texto, prêmios, participantes (só membros) e itens vivos da equipe", async () => {
    actAs(ANA, teamId);
    const season = await call(createLegacyChapter(teamId, { kind: "season", title: "Temporada 2024", startDate: "2024-08-01", endDate: "2025-07-31" }));
    await call(
      updateLegacyChapter(teamId, season.id, {
        content: {
          summary: "Primeira temporada.",
          result: "Campeões do regional",
          awards: [{ title: "Champions", detail: "Regional SP" }],
          members: [ANA, BIA, OUT], // OUT não é membro: cai
        },
      }),
    );

    const [doc] = await db.insert(documents).values({ teamId, title: "Caderno de engenharia", createdBy: ANA }).returning({ id: documents.id });
    const [test] = await db.insert(tests).values({ userId: ANA, teamId, name: "Missões 2024", config: {} }).returning({ id: tests.id });
    await db.insert(testExecutions).values([
      { testId: test.id, executionNumber: 1, results: {} },
      { testId: test.id, executionNumber: 2, results: {} },
    ]);
    const [qb] = await db.insert(quickbrickNotebooks).values({ userId: ANA, teamId, name: "Robô 2024", robotName: "Tatu" }).returning({ id: quickbrickNotebooks.id });
    const [entry] = await db
      .insert(journalEntries)
      .values({ teamId, authorId: ANA, entryDate: "2024-10-05", title: "Primeiro treino", content: { categories: [], sections: [] } })
      .returning({ id: journalEntries.id });
    const [personal] = await db.insert(tests).values({ userId: ANA, name: "Pessoal", config: {} }).returning({ id: tests.id });

    // item pessoal não entra
    const bad = await addLegacyItems(teamId, season.id, [{ kind: "labtest", id: personal.id }]);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toMatch(/Transfira/);

    const { added } = await call(
      addLegacyItems(teamId, season.id, [
        { kind: "stagebook", id: doc.id },
        { kind: "labtest", id: test.id },
        { kind: "quickbrick", id: qb.id },
        { kind: "journal", id: entry.id },
        { kind: "labtest", id: test.id }, // repetido
      ]),
    );
    expect(added).toBe(4);
    expect((await call(addLegacyItems(teamId, season.id, [{ kind: "labtest", id: test.id }]))).added).toBe(0);

    // candidatos não repetem o que já está guardado
    const cands = await call(searchLegacyCandidates(teamId, season.id, { kind: "labtest" }));
    expect(cands.some((c) => c.id === test.id)).toBe(false);

    let legacy = await call(listTeamLegacy(teamId));
    let chapter = legacy.find((c) => c.id === season.id)!;
    expect(chapter.content.members).toEqual([ANA, BIA]);
    expect(chapter.members.map((m) => [m.id, m.current])).toEqual([
      [ANA, true],
      [BIA, true],
    ]);
    expect(chapter.items.map((i) => [i.kind, i.title])).toEqual([
      ["stagebook", "Caderno de engenharia"],
      ["labtest", "Missões 2024"],
      ["quickbrick", "Robô 2024"],
      ["journal", "Primeiro treino"],
    ]);
    expect(chapter.items.find((i) => i.kind === "labtest")?.meta).toBe("2 rodadas");
    expect(chapter.items.find((i) => i.kind === "journal")?.href).toBe(`/dashboard/diario/${entry.id}`);
    expect(chapter.stats?.journalEntries).toBe(1);

    // sincronizado: renomear na ferramenta muda no legado; página na lixeira some; excluir apaga o vínculo
    await db.update(tests).set({ name: "Missões finais" }).where(eq(tests.id, test.id));
    await db.update(documents).set({ deletedAt: new Date() }).where(eq(documents.id, doc.id));
    await db.delete(quickbrickNotebooks).where(eq(quickbrickNotebooks.id, qb.id));
    legacy = await call(listTeamLegacy(teamId));
    chapter = legacy.find((c) => c.id === season.id)!;
    expect(chapter.items.map((i) => i.title)).toEqual(["Missões finais", "Primeiro treino"]);

    const testItem = chapter.items.find((i) => i.kind === "labtest")!;
    await call(updateLegacyItemNote(teamId, season.id, testItem.id, "  Testes do robô campeão "));
    expect((await db.select().from(teamLegacyItems).where(eq(teamLegacyItems.id, testItem.id)))[0].note).toBe("Testes do robô campeão");
    await call(removeLegacyItem(teamId, season.id, testItem.id));
    expect((await removeLegacyItem(teamId, season.id, testItem.id)).ok).toBe(false);
    // o teste continua existindo
    expect(await db.select().from(tests).where(eq(tests.id, test.id))).toHaveLength(1);
  });

  it("sugere itens da mesma temporada e do período", async () => {
    actAs(ANA, teamId);
    const season = await call(createLegacyChapter(teamId, { kind: "season", seasonKey: "bioglow" }));
    const [seasonTest] = await db
      .insert(tests)
      .values({ userId: ANA, teamId, name: "Bioglow M01", season: "bioglow", config: {}, createdAt: new Date("2020-01-01T12:00:00Z") })
      .returning({ id: tests.id });
    const [inRange] = await db
      .insert(thinklab)
      .values({ userId: ANA, teamId, name: "Projeto 26", createdAt: new Date("2026-09-10T15:00:00Z") })
      .returning({ id: thinklab.id });
    const [outRange] = await db
      .insert(thinklab)
      .values({ userId: ANA, teamId, name: "Antigo", createdAt: new Date("2025-09-10T15:00:00Z") })
      .returning({ id: thinklab.id });

    const sugg = await call(getLegacySuggestions(teamId, season.id));
    expect(sugg.find((s) => s.id === seasonTest.id)?.reason).toBe("mesma temporada");
    expect(sugg.some((s) => s.id === inRange.id)).toBe(true);
    expect(sugg.some((s) => s.id === outRange.id)).toBe(false);

    await call(addLegacyItems(teamId, season.id, [{ kind: "labtest", id: seasonTest.id }]));
    expect((await call(getLegacySuggestions(teamId, season.id))).some((s) => s.id === seasonTest.id)).toBe(false);
  });

  it("excluir: só quem criou ou a equipe técnica; competições ficam soltas", async () => {
    actAs(CAI, teamId);
    const season = await call(createLegacyChapter(teamId, { kind: "season", title: "Para excluir" }));
    const comp = await call(createLegacyChapter(teamId, { kind: "competition", title: "Torneio solto", parentId: season.id }));

    actAs(ANA, teamId);
    const denied = await deleteLegacyChapter(teamId, season.id);
    expect(denied.ok).toBe(false);

    actAs(BIA, teamId);
    await call(deleteLegacyChapter(teamId, season.id));
    const [c] = await db.select().from(teamLegacyChapters).where(eq(teamLegacyChapters.id, comp.id));
    expect(c.parentId).toBeNull();
  });
});
