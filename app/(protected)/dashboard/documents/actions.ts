"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { folders, documents } from "@/db/schema";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuário não autenticado.");
  return userId;
}

export async function createFolder(parentId: string | null = null) {
  const userId = await requireUserId();
  const [created] = await db
    .insert(folders)
    .values({ userId, parentId, name: "Nova pasta", createdBy: userId })
    .returning({ id: folders.id });
  revalidatePath("/dashboard/documents", "layout");
  return created;
}

export async function createDocument(folderId: string | null = null) {
  const userId = await requireUserId();
  const [created] = await db
    .insert(documents)
    .values({ userId, folderId, title: "Sem título", createdBy: userId })
    .returning({ id: documents.id });
  revalidatePath("/dashboard/documents", "layout");
  return created;
}

export async function renameFolder(id: string, name: string) {
  const userId = await requireUserId();
  const clean = name.trim() || "Nova pasta";
  await db
    .update(folders)
    .set({ name: clean, updatedAt: new Date() })
    .where(and(eq(folders.id, id), eq(folders.userId, userId)));
  revalidatePath("/dashboard/documents", "layout");
}

export async function renameDocument(id: string, title: string) {
  const userId = await requireUserId();
  const clean = title.trim() || "Sem título";
  await db
    .update(documents)
    .set({ title: clean, updatedBy: userId, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
  revalidatePath("/dashboard/documents", "layout");
}

export async function updateDocumentIcon(id: string, icon: string | null) {
  const userId = await requireUserId();
  await db
    .update(documents)
    .set({ icon, updatedBy: userId, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
  revalidatePath("/dashboard/documents", "layout");
}

// Chamada a cada autosave do editor — não revalida a árvore da sidebar
// (título/ícone não mudam aqui), só grava o conteúdo.
export async function updateDocumentContent(id: string, content: unknown) {
  const userId = await requireUserId();
  await db
    .update(documents)
    .set({
      content: content as Record<string, unknown>,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
}

export async function deleteFolder(id: string) {
  const userId = await requireUserId();
  // Documentos dentro da pasta não são apagados: a FK folder_id tem
  // onDelete "set null", então eles voltam pra raiz do caderno.
  await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
  revalidatePath("/dashboard/documents", "layout");
}

export async function deleteDocument(id: string) {
  const userId = await requireUserId();
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
  revalidatePath("/dashboard/documents", "layout");
}