"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { boards, boardColumns } from "@/db/schema";
import { resolveStagebookScope, scopeOwnership } from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { nextPosition } from "@/utils/stagebook/position";
import { cleanText, optionalText } from "@/utils/stagebook/validation";

const DEFAULT_COLUMNS = ["A fazer", "Em andamento", "Concluído"];
const BOARD_ICON_NAMES = [
  "LayoutDashboard",
  "ListTodo",
  "FolderKanban",
  "Rocket",
  "Target",
  "CalendarDays",
  "Lightbulb",
  "Briefcase",
  "GraduationCap",
  "Users",
  "Star",
  "Flag",
] as const;

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

export async function renameBoard(
  id: string,
  name: string,
  description?: string,
  icon?: string,
) {
  const scope = await resolveStagebookScope();
  const clean = cleanText(name, { fallback: "Novo board", maxLength: 120 });
  const cleanIcon = icon && BOARD_ICON_NAMES.includes(icon as (typeof BOARD_ICON_NAMES)[number])
    ? icon
    : undefined;
  await db
    .update(boards)
    .set({
      name: clean,
      ...(description !== undefined
        ? { description: optionalText(description, 4000) }
        : {}),
      ...(cleanIcon ? { icon: cleanIcon } : {}),
      updatedAt: new Date(),
    })
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
