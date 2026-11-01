"use server";

import { db } from "@/db/client";
import { thinklab } from "@/db/schema/thinklab";
import { folders } from "@/db/schema/notebook";
import { resolveStagebookScope, StagebookAuthError } from "@/utils/stagebook/scope";
import { canDeleteResource } from "@/utils/stagebook/team-permissions";
import { creatorScopeWhere, scopeWhere } from "@/utils/stagebook/permissions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ValidationError } from "@/utils/stagebook/validation";
import { runAction } from "@/utils/stagebook/action-result";

export type ThinkLabConfig = {
  elements?: unknown[];
  viewport?: { panX: number; panY: number; zoom: number };
  gridType?: "dots" | "lines" | "none";
  theme?: string;
};

/** ThinkLabs do scope atual (o criador fica em `userId` mesmo na equipe). */
function thinkLabScope(scope: Awaited<ReturnType<typeof resolveStagebookScope>>) {
  return creatorScopeWhere(scope, { userId: thinklab.userId, teamId: thinklab.teamId });
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

    if (!folder) throw new ValidationError("Pasta inválida ou sem permissão.");
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
  return runAction(async () => {
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

    if (!updated) throw new ValidationError("ThinkLab não encontrado.");
    return updated;
  });
}

export async function deleteThinkLabById(id: string) {
  const scope = await resolveStagebookScope();

  // Na equipe, membros excluem só o que criaram; técnicos e mentores, qualquer quadro.
  if (scope.type === "team") {
    const [existing] = await db
      .select({ creatorId: thinklab.userId })
      .from(thinklab)
      .where(and(eq(thinklab.id, id), thinkLabScope(scope)))
      .limit(1);
    if (existing && !canDeleteResource(scope.role, existing.creatorId, scope.userId)) {
      throw new StagebookAuthError(
        "Só técnicos e mentores podem excluir quadros criados por outras pessoas.",
      );
    }
  }

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
  // A confirmação acontece no navegador (ConfirmSubmitButton): `confirm()` não
  // existe no servidor e quebrava a exclusão com ReferenceError.
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
    throw new ValidationError("O nome do quadro é obrigatório.");
  }

  if (name.length > 100) {
    throw new ValidationError("O nome deve ter no máximo 100 caracteres.");
  }

  if (description.length > 1000) {
    throw new ValidationError("A descrição deve ter no máximo 1000 caracteres.");
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
    throw new ValidationError("Quadro não encontrado ou sem permissão para editá-lo.");
  }

  revalidatePath("/dashboard/thinklab");
  redirect("/dashboard/thinklab");
}
