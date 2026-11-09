/**
 * Histórico de versões (últimas 5) e lixeira (7 dias) das páginas do Stagebook.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, documentVersions } from "@/db/schema";
import {
  createDocument,
  deleteDocument,
  renameDocument,
  updateDocumentContent,
} from "@/app/(protected)/dashboard/documents/actions";
import {
  deleteDocumentForever,
  emptyTrash,
  listDocumentVersions,
  listTrashedDocuments,
  restoreDocument,
  restoreDocumentVersion,
  saveDocumentVersion,
} from "@/app/(protected)/dashboard/documents/history-actions";
import { MAX_DOCUMENT_VERSIONS, VERSION_INTERVAL_MS } from "@/utils/stagebook/document-history";
import { lexicalToPlainText } from "@/utils/stagebook/lexical-text";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createUser } from "./helpers/db";

const DAY = 24 * 60 * 60 * 1000;

function textState(text: string) {
  return {
    root: {
      type: "root",
      version: 1,
      children: [
        { type: "paragraph", version: 1, children: [{ type: "text", version: 1, text }] },
      ],
    },
  };
}

const documentRow = async (id: string) =>
  (await db.select().from(documents).where(eq(documents.id, id)))[0];
const versionsOf = (id: string) =>
  db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, id))
    .orderBy(asc(documentVersions.createdAt));

let clock = new Date("2026-03-01T12:00:00Z").getTime();
function advance(ms: number) {
  clock += ms;
  vi.setSystemTime(clock);
}

beforeAll(async () => {
  await applySchema();
  await createUser("user_ana");
  await createUser("user_bia");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(clock);
});

afterEach(() => advance(DAY * 30)); // isola os testes (intervalos e prazos)

describe("histórico de versões", () => {
  it("guarda o estado anterior uma vez por sessão de edição", async () => {
    actAs("user_ana");
    const page = await call(createDocument());

    await call(updateDocumentContent(page.id, textState("a")));
    expect(await versionsOf(page.id)).toHaveLength(0); // não havia conteúdo antes

    await call(updateDocumentContent(page.id, textState("ab")));
    await call(updateDocumentContent(page.id, textState("abc")));
    const first = await versionsOf(page.id);
    expect(first).toHaveLength(1);
    expect(lexicalToPlainText(first[0].content)).toBe("a");

    advance(VERSION_INTERVAL_MS + 1000);
    await call(updateDocumentContent(page.id, textState("abcd")));
    const second = await versionsOf(page.id);
    expect(second.map((v) => lexicalToPlainText(v.content))).toEqual(["a", "abc"]);
  });

  it(`mantém só as ${MAX_DOCUMENT_VERSIONS} versões mais recentes`, async () => {
    actAs("user_ana");
    const page = await call(createDocument());
    await call(updateDocumentContent(page.id, textState("v0")));
    for (let i = 1; i <= 8; i++) {
      advance(VERSION_INTERVAL_MS + 1000);
      await call(updateDocumentContent(page.id, textState(`v${i}`)));
    }
    const versions = await versionsOf(page.id);
    expect(versions).toHaveLength(MAX_DOCUMENT_VERSIONS);
    expect(versions.map((v) => lexicalToPlainText(v.content))).toEqual(["v3", "v4", "v5", "v6", "v7"]);

    const listed = await call(listDocumentVersions(page.id));
    expect(listed.map((v) => v.text)).toEqual(["v7", "v6", "v5", "v4", "v3"]);
  });

  it("salvar versão agora registra o estado atual, sem duplicar", async () => {
    actAs("user_ana");
    const page = await call(createDocument());
    await call(updateDocumentContent(page.id, textState("marco")));
    expect(await call(saveDocumentVersion(page.id))).toEqual({ created: true });
    expect(await call(saveDocumentVersion(page.id))).toEqual({ created: false });
    expect(await versionsOf(page.id)).toHaveLength(1);
  });

  it("restaurar volta título e conteúdo e guarda o estado atual", async () => {
    actAs("user_ana");
    const page = await call(createDocument());
    await call(renameDocument(page.id, "Plano v1"));
    await call(updateDocumentContent(page.id, textState("primeira")));
    await call(saveDocumentVersion(page.id));
    const [v1] = await call(listDocumentVersions(page.id));

    await call(renameDocument(page.id, "Plano v2"));
    advance(VERSION_INTERVAL_MS + 1000);
    await call(updateDocumentContent(page.id, textState("segunda")));

    advance(1000);
    const restored = await call(restoreDocumentVersion(page.id, v1.id));
    expect(restored.title).toBe("Plano v1");
    const row = await documentRow(page.id);
    expect(row.title).toBe("Plano v1");
    expect(lexicalToPlainText(row.content)).toBe("primeira");

    const texts = (await call(listDocumentVersions(page.id))).map((v) => v.text);
    expect(texts[0]).toBe("segunda"); // dá para desfazer a restauração
    expect(texts.length).toBeLessThanOrEqual(MAX_DOCUMENT_VERSIONS);
  });

  it("não mostra nem restaura versões de outro usuário", async () => {
    actAs("user_bia");
    const foreign = await call(createDocument());
    await call(updateDocumentContent(foreign.id, textState("segredo")));
    await call(saveDocumentVersion(foreign.id));
    const [version] = await versionsOf(foreign.id);

    actAs("user_ana");
    await expect(call(listDocumentVersions(foreign.id))).rejects.toThrow("Página não encontrada.");
    await expect(call(restoreDocumentVersion(foreign.id, version.id))).rejects.toThrow(
      "Página não encontrada.",
    );
  });
});

describe("lixeira", () => {
  it("página excluída sai das listagens, aparece na lixeira e pode ser restaurada", async () => {
    actAs("user_ana");
    const page = await call(createDocument());
    await call(renameDocument(page.id, "Relatório"));
    await call(deleteDocument(page.id));

    const trash = await call(listTrashedDocuments());
    expect(trash.map((t) => t.id)).toContain(page.id);
    expect(trash.find((t) => t.id === page.id)?.title).toBe("Relatório");

    // Na lixeira não dá para editar nem usar como página-pai.
    await expect(call(updateDocumentContent(page.id, textState("x")))).rejects.toThrow();
    await expect(call(createDocument(null, page.id))).rejects.toThrow("Página pai inválida.");

    await call(restoreDocument(page.id));
    expect((await documentRow(page.id)).deletedAt).toBeNull();
    expect((await call(listTrashedDocuments())).map((t) => t.id)).not.toContain(page.id);
  });

  it("restaura na raiz quando a página-pai não está mais disponível", async () => {
    actAs("user_ana");
    const parent = await call(createDocument());
    const child = await call(createDocument(null, parent.id));
    await call(deleteDocument(child.id));
    await call(deleteDocument(parent.id));
    await call(restoreDocument(child.id));
    expect(await documentRow(child.id)).toMatchObject({ parentId: null, deletedAt: null });
  });

  it("apaga de vez após 7 dias", async () => {
    actAs("user_ana");
    const page = await call(createDocument());
    await call(updateDocumentContent(page.id, textState("a")));
    await call(updateDocumentContent(page.id, textState("b")));
    await call(deleteDocument(page.id));

    advance(6 * DAY);
    expect((await call(listTrashedDocuments())).map((t) => t.id)).toContain(page.id);

    advance(1 * DAY + 1000);
    expect((await call(listTrashedDocuments())).map((t) => t.id)).not.toContain(page.id);
    expect(await documentRow(page.id)).toBeUndefined();
    expect(await versionsOf(page.id)).toHaveLength(0); // histórico vai junto
    await expect(call(restoreDocument(page.id))).rejects.toThrow("Página não encontrada na lixeira.");
  });

  it("excluir para sempre e esvaziar só afetam a lixeira do próprio scope", async () => {
    actAs("user_bia");
    const foreign = await call(createDocument());
    await call(deleteDocument(foreign.id));

    actAs("user_ana");
    const live = await call(createDocument());
    const a = await call(createDocument());
    const b = await call(createDocument());
    await call(deleteDocument(a.id));
    await call(deleteDocument(b.id));

    await call(deleteDocumentForever(live.id)); // não está na lixeira: nada acontece
    expect(await documentRow(live.id)).toBeDefined();

    await call(deleteDocumentForever(a.id));
    expect(await documentRow(a.id)).toBeUndefined();

    await call(emptyTrash());
    expect(await documentRow(b.id)).toBeUndefined();
    expect(await documentRow(foreign.id)).toBeDefined();
    await expect(call(restoreDocument(foreign.id))).rejects.toThrow("Página não encontrada na lixeira.");
  });
});
