import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boardCards,
  boardColumns,
  boards,
  documents,
  journalEntryLinks,
  quickbrickNotebooks,
  teamActivity,
  tests,
  thinklab,
} from "@/db/schema";
import {
  addJournalLink,
  createJournalEntry,
  removeJournalLink,
  searchJournalLinkTargets,
} from "@/features/stagebook/actions/journal";
import { addResourceTagByName, listTagsWithUsage, toggleResourceTag } from "@/features/stagebook/actions/tags";
import {
  createTeamMilestone,
  setResourceMilestone,
  setTeamMilestoneCompleted,
  toggleMilestoneCriterion,
  toggleTeamMilestoneCriterion,
  updateTeamMilestone,
} from "@/features/stagebook/actions/milestones";
import { getJournalEntry, listJournalEntries } from "@/features/stagebook/lib/journal-queries";
import { getTeamGoals } from "@/features/stagebook/lib/team-queries";
import { resolveStagebookScope } from "@/features/stagebook/lib/scope";
import { milestoneProgress, normalizeCriteria } from "@/features/stagebook/types/labels";
import type { JournalContent } from "@/features/stagebook/types/journal";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam } from "./helpers/db";

const ANA = "jg_ana"; // competidora
const BIA = "jg_bia"; // técnica
const CAI = "jg_cai"; // competidor
let teamId: string;
let otherTeamId: string;

const content: JournalContent = {
  categories: ["Programação"],
  sections: [{ id: "s1", kind: "text", title: "Feito", text: "Calibrei o giroscópio." }],
};

async function entry(user: string, date = "2026-11-20", extra: { milestoneId?: string } = {}) {
  actAs(user, teamId);
  return (await call(createJournalEntry({ entryDate: date, content, ...extra }))).id;
}

beforeAll(async () => {
  await applySchema();
  teamId = await createTeam("Metas FC", [
    { userId: BIA, role: "owner" },
    { userId: ANA, role: "competidor" },
    { userId: CAI, role: "competidor" },
  ]);
  otherTeamId = await createTeam("Outra", [{ userId: "jg_out", role: "owner" }]);
});

describe("critérios das metas (funções puras)", () => {
  it("limpa critérios e calcula progresso com cards", () => {
    const c = normalizeCriteria([{ text: "  Robô  pronto " }, { id: "x", text: "Projeto", done: true, doneAt: "t" }, { text: "" }, "lixo"]);
    expect(c.map((i) => [i.text, i.done])).toEqual([
      ["Robô pronto", false],
      ["Projeto", true],
    ]);
    expect(milestoneProgress(c, { done: 1, total: 2 })).toEqual({ done: 2, total: 4, pct: 50 });
    expect(milestoneProgress([])).toBeNull();
  });
});

describe("tags e marco no Diário", () => {
  it("usa o catálogo universal; só o autor muda tags e marco da entrada", async () => {
    const id = await entry(ANA);
    actAs(BIA, teamId);
    const m = await call(createTeamMilestone(teamId, { name: "Regional", criteria: [{ text: "Missões 1-5 estáveis" }] }));

    actAs(ANA, teamId);
    const { tag } = await call(addResourceTagByName("journal", id, "sensores"));
    await call(setResourceMilestone("journal", id, m.id));
    const detail = await getJournalEntry(await resolveStagebookScope(), id);
    expect(detail?.tags.map((t) => t.name)).toEqual(["sensores"]);
    expect(detail?.milestone).toMatchObject({ id: m.id, name: "Regional", criteria: [{ text: "Missões 1-5 estáveis", done: false }] });

    // Outra pessoa da equipe lê, mas não mexe nas tags/marco da entrada de Ana.
    actAs(CAI, teamId);
    const denied = await toggleResourceTag("journal", id, tag.id);
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toMatch(/Só quem escreveu/);
    expect((await setResourceMilestone("journal", id, null)).ok).toBe(false);

    // A tag conta o uso no Diário na tela de gestão.
    actAs(BIA, teamId);
    const usage = (await listTagsWithUsage()).find((t) => t.id === tag.id);
    expect(usage?.usage.journal).toBe(1);

    // A lista do mês traz tags e marco; filtrar por marco atravessa os meses.
    const old = await entry(ANA, "2026-09-02", { milestoneId: m.id });
    const scope = await resolveStagebookScope();
    const nov = await listJournalEntries(scope, { month: "2026-11" });
    expect(nov.find((e) => e.id === id)).toMatchObject({ tags: [{ name: "sensores" }], milestone: { id: m.id } });
    const byGoal = await listJournalEntries(scope, { month: "2026-11", milestoneId: m.id });
    expect(byGoal.map((e) => e.id).sort()).toEqual([id, old].sort());
  });

  it("criar entrada com marco de outro espaço falha", async () => {
    actAs("jg_out", otherTeamId);
    const foreign = await call(createTeamMilestone(otherTeamId, { name: "Deles" }));
    actAs(ANA, teamId);
    const res = await createJournalEntry({ entryDate: "2026-11-20", content, milestoneId: foreign.id });
    expect(res.ok).toBe(false);
  });
});

describe("vínculos com StageBook, LabTest, QuickBrick e ThinkLab", () => {
  it("vincula itens do espaço, ignora repetido, recusa de fora e some quando o item é excluído", async () => {
    const id = await entry(ANA);
    const [doc] = await db.insert(documents).values({ teamId, title: "Caderno de engenharia", createdBy: ANA }).returning({ id: documents.id });
    const [test] = await db.insert(tests).values({ userId: ANA, teamId, name: "Missão 04", config: {} }).returning({ id: tests.id });
    const [board] = await db.insert(thinklab).values({ userId: ANA, teamId, name: "Brainstorm garra" }).returning({ id: thinklab.id });
    const [qb] = await db.insert(quickbrickNotebooks).values({ userId: ANA, teamId, name: "Robô v2" }).returning({ id: quickbrickNotebooks.id });
    const [personalTest] = await db.insert(tests).values({ userId: ANA, name: "Pessoal", config: {} }).returning({ id: tests.id });

    actAs(ANA, teamId);
    const found = await call(searchJournalLinkTargets({ q: "missão" }));
    expect(found.map((f) => [f.kind, f.title])).toEqual([["labtest", "Missão 04"]]);

    await call(addJournalLink(id, "stagebook", doc.id));
    await call(addJournalLink(id, "labtest", test.id));
    await call(addJournalLink(id, "thinklab", board.id));
    let links = await call(addJournalLink(id, "quickbrick", qb.id));
    links = await call(addJournalLink(id, "labtest", test.id)); // repetido
    expect(links.map((l) => [l.kind, l.title, l.href])).toEqual([
      ["stagebook", "Caderno de engenharia", `/dashboard/documents/${doc.id}`],
      ["labtest", "Missão 04", `/dashboard/labtest/${test.id}`],
      ["thinklab", "Brainstorm garra", `/dashboard/thinklab/${board.id}`],
      ["quickbrick", "Robô v2", `/dashboard/quickbrick/${qb.id}`],
    ]);

    const foreign = await addJournalLink(id, "labtest", personalTest.id);
    expect(foreign.ok).toBe(false);
    if (!foreign.ok) expect(foreign.error).toMatch(/não encontrado/);

    // Só o autor mexe nos vínculos.
    actAs(CAI, teamId);
    expect((await addJournalLink(id, "labtest", test.id)).ok).toBe(false);
    expect((await removeJournalLink(id, links[0].linkId)).ok).toBe(false);

    actAs(ANA, teamId);
    links = await call(removeJournalLink(id, links[2].linkId));
    expect(links.map((l) => l.kind)).toEqual(["stagebook", "labtest", "quickbrick"]);

    await db.delete(tests).where(eq(tests.id, test.id));
    const scope = await resolveStagebookScope();
    expect((await getJournalEntry(scope, id))?.links.map((l) => l.kind)).toEqual(["stagebook", "quickbrick"]);
    expect(await db.select().from(journalEntryLinks).where(eq(journalEntryLinks.entryId, id))).toHaveLength(2);
    expect((await listJournalEntries(scope, { month: "2026-11" })).find((e) => e.id === id)?.linkCount).toBe(2);
  });
});

describe("metas da equipe com o Diário", () => {
  it("critérios: técnica edita sem apagar marcações; membro marca; técnica conclui; resumo junta cards e diário", async () => {
    actAs(BIA, teamId);
    const m = await call(
      createTeamMilestone(teamId, { name: "Nacional", dueAt: "2026-12-12", criteria: [{ text: "Robô pronto" }, { text: "Projeto apresentado" }] }),
    );
    const [robot, project] = m.criteria;

    // Membro marca um critério (pela página da equipe ou pelo Diário, no espaço ativo).
    actAs(CAI, teamId);
    await call(toggleTeamMilestoneCriterion(teamId, m.id, robot.id, true));
    expect((await setTeamMilestoneCompleted(teamId, m.id, true)).ok).toBe(false); // concluir é da equipe técnica

    // Técnica renomeia o critério e acrescenta outro: a marcação continua.
    actAs(BIA, teamId);
    const edited = await call(
      updateTeamMilestone(teamId, m.id, {
        criteria: [{ id: robot.id, text: "Robô pronto e revisado", done: false }, { id: project.id, text: project.text }, { text: "Caderno em dia" }],
      }),
    );
    expect(edited.criteria.map((c) => [c.text, c.done])).toEqual([
      ["Robô pronto e revisado", true],
      ["Projeto apresentado", false],
      ["Caderno em dia", false],
    ]);
    expect(edited.criteria[0].doneBy).toBe(CAI);

    actAs(ANA, teamId);
    await call(toggleMilestoneCriterion(m.id, project.id, true));

    // Kanban: 1 de 2 cards da meta concluído.
    const [b] = await db.insert(boards).values({ teamId, name: "Temporada", createdBy: BIA }).returning({ id: boards.id });
    const [col] = await db.insert(boardColumns).values({ boardId: b.id, name: "A fazer" }).returning({ id: boardColumns.id });
    await db.insert(boardCards).values([
      { boardId: b.id, columnId: col.id, title: "Trocar pneus", milestoneId: m.id, createdBy: BIA, completedAt: new Date() },
      { boardId: b.id, columnId: col.id, title: "Ensaiar", milestoneId: m.id, createdBy: BIA },
    ]);

    // Diário: Ana duas vezes, Cai uma (uma delas fora da janela de 8 semanas).
    await entry(ANA, "2026-11-20", { milestoneId: m.id });
    await entry(ANA, "2026-11-12", { milestoneId: m.id });
    await entry(CAI, "2026-08-01", { milestoneId: m.id });

    const goal = (await getTeamGoals(teamId, "2026-11-20")).find((g) => g.id === m.id)!;
    expect(goal.cards).toEqual({ done: 1, total: 2 });
    expect(goal.progress).toEqual({ done: 3, total: 5, pct: 60 });
    expect(goal.journal).toMatchObject({ count: 3, contributors: 2, lastDate: "2026-11-20" });
    expect(goal.journal.recent.map((r) => r.entryDate)).toEqual(["2026-11-20", "2026-11-12", "2026-08-01"]);
    expect(goal.journal.weeks.reduce((a, b) => a + b, 0)).toBe(2);
    expect(goal.journal.weeks[7]).toBe(1);
    expect(goal.usage.journal).toBe(3);
    expect(goal.usage["kanban-card"]).toBe(2);

    actAs(BIA, teamId);
    const done = await call(setTeamMilestoneCompleted(teamId, m.id, true));
    expect(done.completedAt).not.toBeNull();

    const verbs = (await db.select().from(teamActivity).where(eq(teamActivity.entityId, m.id))).map((a) => a.verb).sort();
    expect(verbs).toEqual(["milestone.completed", "milestone.created", "milestone.criterion_done", "milestone.criterion_done"]);
  });
});
