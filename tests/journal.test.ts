import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { journalEntries, teamActivity } from "@/db/schema";
import {
  createJournalEntry,
  deleteJournalEntry,
  deleteJournalTemplate,
  saveJournalTemplate,
  updateJournalEntry,
} from "@/utils/stagebook/actions/journal";
import {
  findMyJournalEntryOn,
  getJournalEntry,
  listJournalEntries,
  listJournalTemplates,
  listMyJournalDates,
} from "@/utils/stagebook/journal-queries";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import {
  BUILTIN_JOURNAL_TEMPLATES,
  contentFromTemplate,
  journalStats,
  journalStreak,
  normalizeJournalContent,
  templateFromContent,
  type JournalContent,
} from "@/types/journal";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const ANA = "jr_ana"; // competidora
const BIA = "jr_bia"; // técnica
const CAI = "jr_cai"; // competidor
const ZED = "jr_zed"; // de fora
let teamId: string;

const content = (overrides: Partial<JournalContent> = {}): JournalContent => ({
  categories: ["Programação", "Mecânica"],
  sections: [
    { id: "s1", kind: "text", title: "O que foi feito", text: "Ajustei o seguidor de linha." },
    {
      id: "s2",
      kind: "checklist",
      title: "Tarefas",
      items: [
        { id: "i1", text: "Calibrar sensor", done: true },
        { id: "i2", text: "Trocar roda", done: false },
      ],
    },
    {
      id: "s3",
      kind: "resolved",
      title: "Resolvido",
      items: [
        { id: "i3", text: "Curva fechada", category: "Programação" },
        { id: "i4", text: "Garra solta", category: "mecânica" },
        { id: "i5", text: "Outro", category: "Inexistente" },
      ],
    },
  ],
  ...overrides,
});

beforeAll(async () => {
  await applySchema();
  await createUser(ZED);
  teamId = await createTeam("Diário FC", [
    { userId: BIA, role: "owner" },
    { userId: ANA, role: "competidor" },
    { userId: CAI, role: "competidor" },
  ]);
});

describe("normalização do conteúdo", () => {
  it("corta lixo, corrige categoria pela grafia da entrada e descarta categoria desconhecida", () => {
    const c = normalizeJournalContent({
      categories: ["Programação", " programação ", "", "Mecânica"],
      sections: [
        { id: "s1", kind: "hack", title: "", text: "oi" },
        content().sections[2],
        { id: "s1", kind: "checklist", title: "dup", items: [{ id: "x", text: "  a   b ", done: "yes" }] },
      ],
    });
    expect(c.categories).toEqual(["Programação", "Mecânica"]);
    expect(c.sections[0]).toMatchObject({ kind: "text", title: "Anotações", text: "oi" });
    expect(c.sections[1].items!.map((i) => i.category)).toEqual(["Programação", "Mecânica", null]);
    // id repetido ganha um novo; `done` só vale se for true
    expect(c.sections[2].id).not.toBe("s1");
    expect(c.sections[2].items![0]).toMatchObject({ text: "a b", done: false });
  });

  it("estatísticas: tarefas, resolvidos por categoria e sem categoria", () => {
    const stats = journalStats(normalizeJournalContent(content()));
    expect(stats).toMatchObject({ tasksTotal: 2, tasksDone: 1, resolved: 3, uncategorized: 1 });
    expect(stats.byCategory).toEqual([
      { category: "Programação", count: 1 },
      { category: "Mecânica", count: 1 },
    ]);
  });

  it("template salvo guarda o esqueleto, não o que foi escrito", () => {
    const t = templateFromContent(normalizeJournalContent(content()));
    expect(t.sections[0].text).toBe("");
    expect(t.sections[1].items!.map((i) => [i.text, i.done])).toEqual([
      ["Calibrar sensor", false],
      ["Trocar roda", false],
    ]);
    expect(t.sections[2].items).toEqual([]);
  });

  it("conteúdo a partir de template ganha ids novos", () => {
    const base = BUILTIN_JOURNAL_TEMPLATES[1].content;
    const a = contentFromTemplate(base);
    const b = contentFromTemplate(base);
    expect(a.sections[0].id).not.toBe(b.sections[0].id);
    expect(a.sections[1].items!.length).toBe(3);
  });

  it("sequência de dias conta até hoje, ou até ontem se hoje ainda está vazio", () => {
    expect(journalStreak(["2026-11-20", "2026-11-19", "2026-11-17"], "2026-11-20")).toBe(2);
    expect(journalStreak(["2026-11-19", "2026-11-18"], "2026-11-20")).toBe(2);
    expect(journalStreak(["2026-11-18"], "2026-11-20")).toBe(0);
    expect(journalStreak(["2026-03-01", "2026-02-28"], "2026-03-01")).toBe(2);
  });
});

describe("diário pessoal", () => {
  it("cria com a data escolhida, edita, muda a data e encontra pela data", async () => {
    actAs(ANA);
    const { id } = await call(createJournalEntry({ entryDate: "2026-11-20", templateKey: "builtin:dia", content: content() }));

    expect(await findMyJournalEntryOn(await resolveStagebookScope(), "2026-11-20")).toBe(id);

    await call(updateJournalEntry(id, { title: "  Dia de   sensor ", entryDate: "2026-11-18" }));
    const scope = await resolveStagebookScope();
    const entry = await getJournalEntry(scope, id);
    expect(entry).toMatchObject({ title: "Dia de sensor", entryDate: "2026-11-18", templateKey: "builtin:dia", canEdit: true, canDelete: true });

    const month = await listJournalEntries(scope, { month: "2026-11" });
    expect(month.map((e) => e.id)).toContain(id);
    expect(month[0].stats.tasksDone).toBe(1);
    expect(await listJournalEntries(scope, { month: "2026-10" })).toEqual([]);

    // busca no texto, em qualquer mês
    expect((await listJournalEntries(scope, { month: "2026-01", q: "seguidor" })).map((e) => e.id)).toEqual([id]);
    expect(await listMyJournalDates(scope, "2026-11-20")).toEqual(["2026-11-18"]);
  });

  it("rejeita data inválida e não vaza para o espaço da equipe", async () => {
    actAs(ANA);
    const bad = await createJournalEntry({ entryDate: "2026-02-30", content: content() });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toMatch(/Data inválida/);

    actAs(ANA, teamId);
    expect(await listJournalEntries(await resolveStagebookScope(), { month: "2026-11" })).toEqual([]);
  });

  it("template de outro espaço não é aceito como origem", async () => {
    actAs(CAI);
    const { id: tpl } = await call(saveJournalTemplate({ name: "Meu", content: content() }));
    actAs(ANA);
    const { id } = await call(createJournalEntry({ entryDate: "2026-11-21", templateKey: tpl, content: content() }));
    expect((await getJournalEntry(await resolveStagebookScope(), id))?.templateKey).toBeNull();
  });
});

describe("diário da equipe", () => {
  let anaEntry: string;

  it("todos leem, só o autor edita, e o feed registra", async () => {
    actAs(ANA, teamId);
    anaEntry = (await call(createJournalEntry({ entryDate: "2026-11-20", content: content() }))).id;

    const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, anaEntry));
    expect(row).toMatchObject({ userId: null, teamId, authorId: ANA });

    const feed = await db.select().from(teamActivity).where(eq(teamActivity.entityId, anaEntry));
    expect(feed.map((f) => f.verb)).toEqual(["journal.created"]);

    actAs(CAI, teamId);
    const scope = await resolveStagebookScope();
    const list = await listJournalEntries(scope, { month: "2026-11" });
    expect(list.map((e) => [e.id, e.isMine, e.author.id])).toEqual([[anaEntry, false, ANA]]);
    expect(await getJournalEntry(scope, anaEntry)).toMatchObject({ canEdit: false, canDelete: false });

    const edit = await updateJournalEntry(anaEntry, { title: "invadido" });
    expect(edit.ok).toBe(false);
    if (!edit.ok) expect(edit.error).toMatch(/Só quem escreveu/);
    const del = await deleteJournalEntry(anaEntry);
    expect(del.ok).toBe(false);
  });

  it("quem é de fora não acessa; técnica pode excluir a entrada de outra pessoa", async () => {
    actAs(ZED, teamId); // cookie aponta para a equipe, mas não é membro → espaço pessoal
    const zed = await resolveStagebookScope();
    expect(zed.type).toBe("personal");
    expect(await getJournalEntry(zed, anaEntry)).toBeNull();
    expect((await updateJournalEntry(anaEntry, { title: "x" })).ok).toBe(false);

    actAs(BIA, teamId);
    expect(await getJournalEntry(await resolveStagebookScope(), anaEntry)).toMatchObject({ canEdit: false, canDelete: true });
    await call(deleteJournalEntry(anaEntry));
    expect(await db.select().from(journalEntries).where(eq(journalEntries.id, anaEntry))).toHaveLength(0);
  });

  it("templates da equipe: todos veem; só criador ou técnica altera/exclui", async () => {
    actAs(ANA, teamId);
    const { id } = await call(saveJournalTemplate({ name: "Treino de sábado", icon: "Dumbbell", content: content() }));

    actAs(CAI, teamId);
    const seen = await listJournalTemplates(await resolveStagebookScope());
    const mine = seen.find((t) => t.key === id);
    expect(mine).toMatchObject({ name: "Treino de sábado", icon: "Dumbbell", builtin: false, canManage: false });
    expect(seen.filter((t) => t.builtin).length).toBe(BUILTIN_JOURNAL_TEMPLATES.length);
    expect((await deleteJournalTemplate(id)).ok).toBe(false);
    expect((await saveJournalTemplate({ id, name: "x", content: content() })).ok).toBe(false);

    actAs(BIA, teamId);
    await call(saveJournalTemplate({ id, name: "Treino oficial", content: content() }));
    await call(deleteJournalTemplate(id));
    expect((await listJournalTemplates(await resolveStagebookScope())).some((t) => t.key === id)).toBe(false);
  });
});
