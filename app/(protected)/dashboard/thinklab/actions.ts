"use server";

import { db } from "@/db/client";
import { thinklab } from "@/db/schema/thinklab";
import { folders } from "@/db/schema/notebook";
import {
  resolveStagebookScope,
} from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ThinkLabConfig = {
  elements?: unknown[];
  viewport?: { panX: number; panY: number; zoom: number };
  gridType?: "dots" | "lines" | "none";
  theme?: string;
};

function thinkLabScope(scope: Awaited<ReturnType<typeof resolveStagebookScope>>) {
  return scope.type === "team"
    ? eq(thinklab.teamId, scope.teamId)
    : and(eq(thinklab.userId, scope.userId), isNull(thinklab.teamId));
}

export async function createThinkLab(
  name = "Novo ThinkLab",
  description: string | null = null,
  config: ThinkLabConfig = {},
  folderId: string | null = null,
) {
  const scope = await resolveStagebookScope();

  if (folderId) {
    const [folder] = await db
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(
          eq(folders.id, folderId),
          scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }),
        ),
      )
      .limit(1);

    if (!folder) throw new Error("Pasta inválida ou sem permissão.");
  }

  const [created] = await db
    .insert(thinklab)
    .values({
      userId: scope.userId,
      teamId: scope.type === "team" ? scope.teamId : null,
      folderId,
      name: name.trim() || "Novo ThinkLab",
      description,
      config,
    })
    .returning();
  revalidatePath("/dashboard/thinklab");
  revalidatePath("/dashboard/folders", "layout");
  return created;
}

export async function getThinkLabById(id: string) {
  const scope = await resolveStagebookScope();
  const ownership = thinkLabScope(scope);
  const [found] = await db
    .select()
    .from(thinklab)
    .where(and(eq(thinklab.id, id), ownership))
    .limit(1);

  if (found) {
    await db
      .update(thinklab)
      .set({ lastAccessAt: new Date() })
      .where(and(eq(thinklab.id, id), ownership));
  }

  return found;
}

export async function saveThinkLab(id: string, config: ThinkLabConfig) {
  const scope = await resolveStagebookScope();
  const [updated] = await db
    .update(thinklab)
    .set({ config, updatedAt: new Date(), lastAccessAt: new Date() })
    .where(
      and(
        eq(thinklab.id, id),
        thinkLabScope(scope),
      ),
    )
    .returning({ id: thinklab.id, updatedAt: thinklab.updatedAt });

  if (!updated) throw new Error("ThinkLab não encontrado.");
  return updated;
}

export async function deleteThinkLabById(id: string) {
  const scope = await resolveStagebookScope();
  const [deleted] = await db
    .delete(thinklab)
    .where(
      and(
        eq(thinklab.id, id),
        thinkLabScope(scope),
      ),
    )
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
  const scope = await resolveStagebookScope();
  return db
    .select()
    .from(thinklab)
    .where(
      thinkLabScope(scope),
    )
    .orderBy(thinklab.lastAccessAt, thinklab.updatedAt);
}

export async function updateThinkLabDetails(id: string, formData: FormData) {
  const scope = await resolveStagebookScope();

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
    .where(
      and(
        eq(thinklab.id, id),
        thinkLabScope(scope),
      ),
    )
    .returning({ id: thinklab.id });

  if (!updated) {
    throw new Error("Quadro não encontrado ou sem permissão para editá-lo.");
  }

  revalidatePath("/dashboard/thinklab");
  redirect("/dashboard/thinklab");
}
