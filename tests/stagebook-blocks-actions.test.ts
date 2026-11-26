/**
 * Blocos novos do Stagebook no servidor: blocos sincronizados (escopo e uso),
 * backlinks / menções sem link, busca com contexto e índice de decisões.
 */
import { beforeAll, describe, expect, it } from "vitest";
import {
  createDocument,
  renameDocument,
  updateDocumentContent,
} from "@/features/stagebook/documents/actions/documents";
import {
  createSyncedBlock,
  getBacklinks,
  getSyncedBlock,
  getSyncedBlockUsage,
  getSyncedBlocksForExport,
  listDecisions,
  listSyncedBlocks,
  searchPages,
  updateSyncedBlock,
} from "@/features/stagebook/documents/actions/blocks";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const text = (t: string) => ({ type: "text", text: t, format: 0, detail: 0, mode: "normal", style: "", version: 1 });
const p = (...children: unknown[]) => ({ type: "paragraph", children, direction: null, format: "", indent: 0, version: 1, textFormat: 0, textStyle: "" });
const doc = (...children: unknown[]) => ({ root: { type: "root", children, direction: null, format: "", indent: 0, version: 1 } });
const mention = (docId: string, title: string) => ({ type: "page-mention", docId, title, version: 1 });

let teamId: string;

beforeAll(async () => {
  await applySchema();
  await createUser("user_ana");
  await createUser("user_bia");
  teamId = await createTeam("Equipe Robôs", [
    { userId: "user_ana", role: "owner" },
    { userId: "user_caio", role: "competidor" },
  ]);
});

describe("blocos sincronizados", () => {
  it("cria, lê, atualiza e conta onde é usado", async () => {
    actAs("user_ana");
    const { id } = await call(createSyncedBlock("Regras de segurança", doc(p(text("Use óculos")))));
    const block = await call(getSyncedBlock(id));
    expect(block.title).toBe("Regras de segurança");
    expect(JSON.stringify(block.content)).toContain("Use óculos");

    await call(updateSyncedBlock(id, { content: doc(p(text("Use óculos e luvas"))) }));
    expect(JSON.stringify((await call(getSyncedBlock(id))).content)).toContain("luvas");

    const a = await call(createDocument());
    const b = await call(createDocument());
    const node = { type: "synced-block", syncId: id, version: 1 };
    await call(updateDocumentContent(a.id, doc(node)));
    await call(updateDocumentContent(b.id, doc(p(text("x")), node)));

    const usage = await call(getSyncedBlockUsage(id));
    expect(usage.map((u) => u.id).sort()).toEqual([a.id, b.id].sort());
    const list = await call(listSyncedBlocks());
    expect(list.find((l) => l.id === id)).toMatchObject({ usage: 2, preview: expect.stringContaining("luvas") });

    const exp = await call(getSyncedBlocksForExport([id, "lixo"]));
    expect(Object.keys(exp)).toEqual([id]);
  });

  it("não vaza entre espaços (outro usuário e equipe)", async () => {
    actAs("user_ana");
    const { id } = await call(createSyncedBlock("Pessoal", doc(p(text("segredo")))));
    actAs("user_bia");
    await expect(call(getSyncedBlock(id))).rejects.toThrow("Bloco sincronizado não encontrado.");
    await expect(call(updateSyncedBlock(id, { title: "hack" }))).rejects.toThrow("não encontrado");
    actAs("user_ana", teamId);
    await expect(call(getSyncedBlock(id))).rejects.toThrow("não encontrado");
  });

  it("recusa conteúdo que não é estado de editor", async () => {
    actAs("user_ana");
    await expect(call(createSyncedBlock("x", { nada: true }))).rejects.toThrow("Conteúdo do bloco inválido.");
  });
});

describe("backlinks e busca", () => {
  it("lista páginas que mencionam, com o trecho, e citações sem link", async () => {
    actAs("user_ana", teamId);
    const target = await call(createDocument());
    await call(renameDocument(target.id, "Garra de Coral"));
    const linking = await call(createDocument());
    await call(renameDocument(linking.id, "Plano da missão"));
    await call(updateDocumentContent(linking.id, doc(p(text("Usar a "), mention(target.id, "Garra de Coral"), text(" na M03")))));
    const citing = await call(createDocument());
    await call(renameDocument(citing.id, "Diário"));
    await call(updateDocumentContent(citing.id, doc(p(text("Hoje testamos a garra de coral de novo, funcionou.")))));

    const { links, unlinked } = await call(getBacklinks(target.id));
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({ id: linking.id, snippets: ["Usar a @Garra de Coral na M03"] });
    expect(unlinked.map((u) => u.id)).toEqual([citing.id]);
    expect(unlinked[0].snippet.match.toLowerCase()).toBe("garra de coral");
  });

  it("busca no texto das páginas e devolve o trecho com o termo", async () => {
    actAs("user_ana", teamId);
    const d = await call(createDocument());
    await call(renameDocument(d.id, "Calibração"));
    await call(updateDocumentContent(d.id, doc(p(text("O giroscópio derivou 3 graus depois de dez voltas na mesa.")))));
    const results = await call(searchPages("derivou"));
    const hit = results.find((r) => r.id === d.id);
    expect(hit?.snippet?.match).toBe("derivou");
    expect(hit?.snippet?.before).toContain("giroscópio");
    expect(await call(searchPages("a"))).toEqual([]); // termo curto demais

    actAs("user_bia");
    expect((await call(searchPages("derivou"))).some((r) => r.id === d.id)).toBe(false);
  });
});

describe("histórico de decisões", () => {
  it("junta as decisões de todas as páginas do espaço, mais recentes primeiro", async () => {
    actAs("user_ana", teamId);
    const d1 = await call(createDocument());
    const d2 = await call(createDocument());
    const decision = (title: string, date: string) => ({
      type: "smart-block",
      kind: "decision",
      version: 1,
      data: { title, date, status: "implementada", decision: "x", participants: ["Ana"] },
    });
    await call(updateDocumentContent(d1.id, doc(decision("Usar esteiras", "2026-10-01"))));
    await call(updateDocumentContent(d2.id, doc(decision("Trocar para Pybricks", "2026-11-02"))));
    const items = await call(listDecisions());
    expect(items.map((i) => i.title)).toEqual(["Trocar para Pybricks", "Usar esteiras"]);
    expect(items[0].pageId).toBe(d2.id);
  });
});
