import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Notificações (seção 27). Pertencem sempre a um usuário — mesmo quando a
 * origem é uma equipe (ex: card atribuído dentro de um Board de equipe), a
 * notificação em si é individual: cada membro recebe/lê a sua própria linha.
 * `data` carrega o suficiente para linkar de volta ao recurso de origem
 * (ex: { documentId }, { cardId, boardId }, { eventId }) sem exigir uma FK
 * polimórfica — mantém o schema simples (seção 47).
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    userReadIdx: index("notifications_user_read_idx").on(
      table.userId,
      table.readAt
    ),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "notifications_user_id_fkey",
    }).onDelete("cascade"),
  })
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
