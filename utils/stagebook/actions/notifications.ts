"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { requireAuthenticatedUser } from "../scope";

/** Seção 27/28: helper interno usado por outras actions (calendar/boards) para
 * disparar uma notificação sem duplicar a lógica de insert em cada módulo. */
export async function notifyUser(params: {
  userId: string;
  type: string;
  title: string;
  message?: string | null;
  data?: Record<string, unknown>;
}) {
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message ?? null,
    data: params.data ?? {},
  });
}

/** Últimas notificações não lidas (para o sino na navbar). Limitado para ser leve. */
export async function listUnreadNotifications(limit = 20) {
  const userId = await requireAuthenticatedUser();
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function listAllNotifications(limit = 50) {
  const userId = await requireAuthenticatedUser();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(id: string) {
  const userId = await requireAuthenticatedUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsRead() {
  const userId = await requireAuthenticatedUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  revalidatePath("/dashboard", "layout");
}
