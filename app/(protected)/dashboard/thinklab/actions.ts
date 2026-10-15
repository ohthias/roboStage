"use server";

import { db } from "@/db/client";
import { thinklab } from "@/db/schema/thinklab";
import { requireAuthenticatedUser } from "@/utils/stagebook/scope";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ThinkLabConfig = {
  elements?: unknown[];
  viewport?: { panX: number; panY: number; zoom: number };
  gridType?: "dots" | "lines" | "none";
  theme?: string;
};

export async function createThinkLab(
  name = "Novo ThinkLab",
  description: string | null = null,
  config: ThinkLabConfig = {},
) {
  const userId = await requireAuthenticatedUser();
  const [created] = await db
    .insert(thinklab)
    .values({
      userId,
      name: name.trim() || "Novo ThinkLab",
      description,
      config,
    })
    .returning();
  return created;
}

export async function getThinkLabById(id: string) {
  const userId = await requireAuthenticatedUser();
  const [found] = await db
    .select()
    .from(thinklab)
    .where(and(eq(thinklab.id, id), eq(thinklab.userId, userId)))
    .limit(1);

  if (found) {
    await db
      .update(thinklab)
      .set({ lastAccessAt: new Date() })
      .where(and(eq(thinklab.id, id), eq(thinklab.userId, userId)));
  }

  return found;
}

export async function saveThinkLab(id: string, config: ThinkLabConfig) {
  const userId = await requireAuthenticatedUser();
  const [updated] = await db
    .update(thinklab)
    .set({ config, updatedAt: new Date(), lastAccessAt: new Date() })
    .where(and(eq(thinklab.id, id), eq(thinklab.userId, userId)))
    .returning({ id: thinklab.id, updatedAt: thinklab.updatedAt });

  if (!updated) throw new Error("ThinkLab não encontrado.");
  return updated;
}

export async function deleteThinkLabById(id: string) {
  const userId = await requireAuthenticatedUser();
  const [deleted] = await db
    .delete(thinklab)
    .where(and(eq(thinklab.id, id), eq(thinklab.userId, userId)))
    .returning();
  return deleted;
}

export async function deleteThinkLabAction(id: string) {
  confirm(
    "Tem certeza que deseja excluir este ThinkLab? Esta ação não pode ser desfeita.",
  );
  await deleteThinkLabById(id);

  revalidatePath("/dashboard/thinklab");
  redirect("/dashboard/thinklab");
}

export async function listThinkLabsByUserId() {
  const userId = await requireAuthenticatedUser();
  return db
    .select()
    .from(thinklab)
    .where(eq(thinklab.userId, userId))
    .orderBy(thinklab.lastAccessAt, thinklab.updatedAt);
}

export async function updateThinkLabDetails(id: string, formData: FormData) {
  const userId = await requireAuthenticatedUser();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    throw new Error("O nome do quadro é obrigatório.");
  }

  if (name.length > 100) {
    throw new Error("O nome deve ter no máximo 100 caracteres.");
  }

  if (description.length > 1000) {
    throw new Error("A descrição deve ter no máximo 1000 caracteres.");
  }

  const [updated] = await db
    .update(thinklab)
    .set({
      name,
      description: description || null,
      updatedAt: new Date(),
    })
    .where(and(eq(thinklab.id, id), eq(thinklab.userId, userId)))
    .returning({ id: thinklab.id });

  if (!updated) {
    throw new Error("Quadro não encontrado ou sem permissão para editá-lo.");
  }

  revalidatePath("/dashboard/thinklab");
  redirect("/dashboard/thinklab");
}
