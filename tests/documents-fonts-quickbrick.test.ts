/**
 * Fonte da página e embeds do QuickBrick (fotos do robô e diagramas).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents } from "@/db/schema";
import { quickbrickDiagrams, quickbrickNotebooks, quickbrickPhotos } from "@/db/schema/quickbrick";
import {
  createDocument,
  duplicateDocument,
  updateDocumentFont,
} from "@/app/(protected)/dashboard/documents/actions";
import {
  getEmbedQuickbrickDiagram,
  getEmbedQuickbrickPhoto,
  listEmbeddableQuickbrickDiagrams,
  listEmbeddableQuickbrickPhotos,
} from "@/app/(protected)/dashboard/documents/embed-actions";
import { docFontFamily, docFontFromFamily, DOC_FONTS } from "@/utils/stagebook/doc-fonts";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createUser } from "./helpers/db";

const documentRow = async (id: string) =>
  (await db.select().from(documents).where(eq(documents.id, id)))[0];

async function seedNotebook(userId: string, name: string) {
  const [notebook] = await db
    .insert(quickbrickNotebooks)
    .values({ userId, name, robotName: `${name} bot` })
    .returning({ id: quickbrickNotebooks.id });
  const [photo] = await db
    .insert(quickbrickPhotos)
    .values({
      notebookId: notebook.id,
      userId,
      objectKey: `notebooks/${notebook.id}/photos/a.jpg`,
      fileName: "a.jpg",
      contentType: "image/jpeg",
      size: 10,
      title: "Garra nova",
    })
    .returning({ id: quickbrickPhotos.id });
  const [diagram] = await db
    .insert(quickbrickDiagrams)
    .values({
      notebookId: notebook.id,
      kind: "matriz-risco",
      title: "Riscos da garra",
      data: { riscos: [{ id: 1, titulo: "Motor", descricao: "", impacto: 5, probabilidade: 4 }] },
    })
    .returning({ id: quickbrickDiagrams.id });
  return { notebookId: notebook.id, photoId: photo.id, diagramId: diagram.id };
}

beforeAll(async () => {
  await applySchema();
  // As tabelas do QuickBrick ficam fora de db/schema/index.ts; cria aqui.
  const schema = await import("@/db/schema");
  const quickbrick = await import("@/db/schema/quickbrick");
  const { pushSchema } = await import("drizzle-kit/api");
  const { apply } = await pushSchema({ ...schema, ...quickbrick }, db as never);
  await apply();
  await createUser("user_caio");
  await createUser("user_duda");
});

describe("fonte da página", () => {
  it("grava só fontes conhecidas e volta ao padrão com 'default'", async () => {
    actAs("user_caio");
    const page = await call(createDocument());
    await call(updateDocumentFont(page.id, "serif"));
    expect((await documentRow(page.id)).font).toBe("serif");

    const copy = await call(duplicateDocument(page.id));
    expect((await documentRow(copy.id)).font).toBe("serif");

    await expect(call(updateDocumentFont(page.id, "comic-sans"))).rejects.toThrow("Fonte inválida.");
    await call(updateDocumentFont(page.id, "default"));
    expect((await documentRow(page.id)).font).toBeNull();
  });

  it("reconhece a fonte a partir do font-family salvo no texto", () => {
    for (const font of DOC_FONTS) {
      if (font.family) expect(docFontFromFamily(docFontFamily(font.id))?.id).toBe(font.id);
    }
    expect(docFontFromFamily("Arial")).toBeNull();
  });
});

describe("embeds do QuickBrick", () => {
  it("lista e abre só fotos e diagramas do próprio espaço", async () => {
    const mine = await seedNotebook("user_caio", "Caderno Caio");
    const other = await seedNotebook("user_duda", "Caderno Duda");

    actAs("user_caio");
    const photos = await listEmbeddableQuickbrickPhotos();
    expect(photos.map((p) => p.id)).toEqual([mine.photoId]);
    expect(photos[0]).toMatchObject({ notebookName: "Caderno Caio", robotName: "Caderno Caio bot" });

    const diagrams = await listEmbeddableQuickbrickDiagrams();
    expect(diagrams.map((d) => d.id)).toEqual([mine.diagramId]);
    expect(diagrams[0].summary).toBe("1 risco · 1 crítico");

    const diagram = await getEmbedQuickbrickDiagram(mine.diagramId);
    expect(diagram).toMatchObject({ kind: "matriz-risco", notebookId: mine.notebookId });

    await expect(getEmbedQuickbrickDiagram(other.diagramId)).rejects.toThrow("Diagrama não encontrado.");
    await expect(getEmbedQuickbrickPhoto(other.photoId)).rejects.toThrow("Foto não encontrada.");
  });
});
