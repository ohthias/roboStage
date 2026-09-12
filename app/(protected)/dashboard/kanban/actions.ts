"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { boards, boardColumns } from "@/db/schema";
import { resolveStagebookScope, scopeOwnership } from "@/lib/stagebook/scope";
import { scopeWhere } from "@/lib/stagebook/permissions";
import { nextPosition } from "@/lib/stagebook/position";
import { cleanText } from "@/lib/stagebook/validation";

const DEFAULT_COLUMNS = ["A fazer", "Em andamento", "Concluído"];

export async function listBoards() {
  const scope = await resolveStagebookScope();
  return db
    .select()
    .from(boards)
    .where(scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId }))
    .orderBy(boards.position);
}

export async function createBoard(name: string) {
  const scope = await resolveStagebookScope();
  const clean = cleanText(name, { fallback: "Novo board", maxLength: 120 });

  const existing = await db
    .select({ position: boards.position })
    .from(boards)
    .where(scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId }));

  const [board] = await db
    .insert(boards)
    .values({
      ...scopeOwnership(scope),
      name: clean,
      createdBy: scope.userId,
      position: nextPosition(existing.map((b) => b.position)),
    })
    .returning({ id: boards.id });

  await db.insert(boardColumns).values(
    DEFAULT_COLUMNS.map((columnName, index) => ({
      boardId: board.id,
      name: columnName,
      position: (index + 1) * 1024,
    }))
  );

  revalidatePath("/dashboard/kanban", "layout");
  return board;
}

export async function renameBoard(id: string, name: string) {
  const scope = await resolveStagebookScope();
  const clean = cleanText(name, { fallback: "Novo board", maxLength: 120 });
  await db
    .update(boards)
    .set({ name: clean, updatedAt: new Date() })
    .where(and(eq(boards.id, id), scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId })));
  revalidatePath("/dashboard/kanban", "layout");
}

export async function deleteBoard(id: string) {
  const scope = await resolveStagebookScope();
  await db
    .delete(boards)
    .where(and(eq(boards.id, id), scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId })));
  revalidatePath("/dashboard/kanban", "layout");
}
