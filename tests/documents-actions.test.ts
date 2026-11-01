/**
 * Testes de caracterização de documents/actions.ts: fixam o comportamento atual
 * (árvore de pastas e páginas, escopo, mensagens de erro) antes da migração
 * para `runAction`. `call()` funciona com as duas formas de action.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import {
  createDocument,
  createFolder,
  deleteDocument,
  deleteFolder,
  duplicateDocument,
  moveNotebookItem,
  renameDocument,
  renameFolder,
  updateDocumentContent,
  updateDocumentCover,
  updateDocumentDescription,
  updateDocumentIcon,
  updateDocumentProperty,
  updateFolderAppearance,
} from "@/app/(protected)/dashboard/documents/actions";
import { FOLDER_COLORS } from "@/utils/stagebook/folder-colors";
import { call } from "./helpers/actions";
import { actAs, requestContext } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const folderRow = async (id: string) =>
  (await db.select().from(folders).where(eq(folders.id, id)))[0];
const documentRow = async (id: string) =>
  (await db.select().from(documents).where(eq(documents.id, id)))[0];

let teamId: string;

beforeAll(async () => {
  await applySchema();
  await createUser("user_dora");
  await createUser("user_eli");
  teamId = await createTeam("Equipe Gama", [
    { userId: "user_dora", role: "competidor" },
    { userId: "user_fabi", role: "owner" },
  ]);
});

describe("pastas", () => {
  it("cria pastas no espaço pessoal, aninhadas e em posição crescente", async () => {
    actAs("user_dora");
    const root = await call(createFolder());
    const child = await call(createFolder(root.id));
    const sibling = await call(createFolder(root.id));

    const [r, c, s] = await Promise.all([folderRow(root.id), folderRow(child.id), folderRow(sibling.id)]);
    expect(r).toMatchObject({ userId: "user_dora", teamId: null, parentId: null, name: "Nova pasta" });
    expect(c.parentId).toBe(root.id);
    expect(s.position).toBeGreaterThan(c.position);
  });

  it("recusa pasta pai de outro usuário", async () => {
    actAs("user_eli");
    const foreign = await call(createFolder());
    actAs("user_dora");
    await expect(call(createFolder(foreign.id))).rejects.toThrow("Pasta pai inválida.");
  });

  it("cria na equipe com userId nulo", async () => {
    actAs("user_dora", teamId);
    const folder = await call(createFolder());
    expect(await folderRow(folder.id)).toMatchObject({ userId: null, teamId });
  });

  it("renomeia com nome limpo e volta ao padrão quando vazio", async () => {
    actAs("user_dora");
    const folder = await call(createFolder());
    await call(renameFolder(folder.id, "  Robô  2026 "));
    expect((await folderRow(folder.id)).name).toBe("Robô  2026"); // só apara as pontas
    await call(renameFolder(folder.id, "   "));
    expect((await folderRow(folder.id)).name).toBe("Nova pasta");
  });

  it("muda aparência só com cores válidas", async () => {
    actAs("user_dora");
    const folder = await call(createFolder());
    const color = FOLDER_COLORS[0].value;
    await call(updateFolderAppearance(folder.id, { color }));
    expect((await folderRow(folder.id)).color).toBe(color);
    await call(updateFolderAppearance(folder.id, { color: "#123456" }));
    expect((await folderRow(folder.id)).color).toBeNull();
  });

  it("não altera pasta de outro usuário", async () => {
    actAs("user_eli");
    const foreign = await call(createFolder());
    actAs("user_dora");
    await call(renameFolder(foreign.id, "invadida"));
    await call(deleteFolder(foreign.id));
    expect(await folderRow(foreign.id)).toMatchObject({ name: "Nova pasta" });
  });

  it("excluir a pasta mantém as páginas, que voltam à raiz", async () => {
    actAs("user_dora");
    const folder = await call(createFolder());
    const doc = await call(createDocument(folder.id));
    await call(deleteFolder(folder.id));
    expect(await folderRow(folder.id)).toBeUndefined();
    expect((await documentRow(doc.id)).folderId).toBeNull();
  });

  it("revalida a árvore de documentos e de pastas", async () => {
    actAs("user_dora");
    requestContext.revalidated = [];
    await call(createFolder());
    expect(requestContext.revalidated).toEqual(["/dashboard/documents", "/dashboard/folders"]);
  });
});

describe("páginas", () => {
  it("cria página em pasta e como subpágina", async () => {
    actAs("user_dora");
    const folder = await call(createFolder());
    const page = await call(createDocument(folder.id));
    const sub = await call(createDocument(null, page.id));
    expect(await documentRow(page.id)).toMatchObject({ folderId: folder.id, title: "Sem título" });
    expect((await documentRow(sub.id)).parentId).toBe(page.id);
  });

  it("recusa pasta ou página pai fora do escopo", async () => {
    actAs("user_eli");
    const foreignFolder = await call(createFolder());
    const foreignPage = await call(createDocument());
    actAs("user_dora");
    await expect(call(createDocument(foreignFolder.id))).rejects.toThrow("Pasta inválida.");
    await expect(call(createDocument(null, foreignPage.id))).rejects.toThrow("Página pai inválida.");
  });

  it("duplica com sufixo (cópia) e mesmo conteúdo", async () => {
    actAs("user_dora");
    const page = await call(createDocument());
    await call(renameDocument(page.id, "Plano de testes"));
    await call(updateDocumentContent(page.id, { root: { children: [] } }));
    const copy = await call(duplicateDocument(page.id));
    expect(await documentRow(copy.id)).toMatchObject({
      title: "Plano de testes (cópia)",
      content: { root: { children: [] } },
      userId: "user_dora",
    });
  });

  it("duplicar página inexistente avisa", async () => {
    actAs("user_dora");
    await expect(
      call(duplicateDocument("00000000-0000-4000-8000-000000000000")),
    ).rejects.toThrow("Página não encontrada.");
  });

  it("renomeia, troca ícone, capa e descrição", async () => {
    actAs("user_dora");
    const page = await call(createDocument());
    await call(renameDocument(page.id, ""));
    await call(updateDocumentDescription(page.id, "  Resumo  "));
    await call(updateDocumentIcon(page.id, "lixo-invalido-<script>"));
    await call(updateDocumentCover(page.id, null));
    const row = await documentRow(page.id);
    expect(row.title).toBe("Sem título");
    expect(row.description).toBe("Resumo");
    expect(row.cover).toBeNull();
    expect(row.updatedBy).toBe("user_dora");
  });

  it("propriedades: grava, apaga com vazio e valida o nome", async () => {
    actAs("user_dora");
    const page = await call(createDocument());
    await call(updateDocumentProperty(page.id, "status", "rascunho"));
    await call(updateDocumentProperty(page.id, "prioridade", 2));
    await call(updateDocumentProperty(page.id, "status", ""));
    expect((await documentRow(page.id)).properties).toEqual({ prioridade: 2 });
    await expect(call(updateDocumentProperty(page.id, "   ", "x"))).rejects.toThrow(
      "Nome de propriedade inválido.",
    );
  });

  it("excluir página sobe as subpáginas um nível", async () => {
    actAs("user_dora");
    const page = await call(createDocument());
    const sub = await call(createDocument(null, page.id));
    await call(deleteDocument(page.id));
    expect(await documentRow(page.id)).toBeUndefined();
    expect((await documentRow(sub.id)).parentId).toBeNull();
  });
});

describe("moveNotebookItem", () => {
  it("move página para pasta e para dentro de outra página", async () => {
    actAs("user_dora");
    const folder = await call(createFolder());
    const page = await call(createDocument());
    const host = await call(createDocument());
    await call(moveNotebookItem("document", page.id, { folderId: folder.id }));
    expect((await documentRow(page.id)).folderId).toBe(folder.id);
    await call(moveNotebookItem("document", page.id, { parentPageId: host.id }));
    expect(await documentRow(page.id)).toMatchObject({ parentId: host.id, folderId: null });
  });

  it("impede ciclos entre páginas", async () => {
    actAs("user_dora");
    const page = await call(createDocument());
    const sub = await call(createDocument(null, page.id));
    await expect(call(moveNotebookItem("document", page.id, { parentPageId: page.id }))).rejects.toThrow(
      "Uma página não pode ser subpage de si mesma.",
    );
    await expect(call(moveNotebookItem("document", page.id, { parentPageId: sub.id }))).rejects.toThrow(
      "Uma página não pode ser movida para dentro de uma de suas próprias subpages.",
    );
  });

  it("impede ciclos entre pastas e destino fora do escopo", async () => {
    actAs("user_eli");
    const foreign = await call(createFolder());
    actAs("user_dora");
    const folder = await call(createFolder());
    const child = await call(createFolder(folder.id));
    await expect(call(moveNotebookItem("folder", folder.id, { folderId: folder.id }))).rejects.toThrow(
      "Uma pasta não pode conter a si mesma.",
    );
    await expect(call(moveNotebookItem("folder", folder.id, { folderId: child.id }))).rejects.toThrow(
      "Uma pasta não pode ser movida para dentro de si mesma.",
    );
    await expect(call(moveNotebookItem("folder", folder.id, { folderId: foreign.id }))).rejects.toThrow(
      "Pasta de destino inválida.",
    );
    await call(moveNotebookItem("folder", child.id, {}));
    expect((await folderRow(child.id)).parentId).toBeNull();
  });
});

describe("autenticação", () => {
  it("sem login, nada é gravado", async () => {
    actAs(null);
    await expect(call(createFolder())).rejects.toThrow("Usuário não autenticado.");
  });
});
