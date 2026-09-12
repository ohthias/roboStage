import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  index,
  foreignKey,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { documents } from "./notebook";
import { calendarEvents } from "./calendar";

const ownershipCheck = (userIdCol: any, teamIdCol: any) =>
  check(
    "ownership_xor",
    sql`(${userIdCol} is not null and ${teamIdCol} is null) or (${userIdCol} is null and ${teamIdCol} is not null)`
  );

/** Kanban Board (seção 20). Pertence a um único Stagebook Scope. */
export const boards = pgTable(
  "boards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    position: doublePrecision("position").notNull().default(0),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("boards_user_id_idx").on(table.userId),
    teamIdIdx: index("boards_team_id_idx").on(table.teamId),
    ownershipCheckConstraint: ownershipCheck(table.userId, table.teamId),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "boards_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "boards_team_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Colunas personalizáveis de um Board (seção 21). */
export const boardColumns = pgTable(
  "board_columns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    boardId: uuid("board_id").notNull(),
    name: text("name").notNull(),
    position: doublePrecision("position").notNull().default(0),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    boardIdIdx: index("board_columns_board_id_idx").on(table.boardId),
    // Columns e Cards pertencem exclusivamente ao Board: cascata segura (seção 42).
    boardFk: foreignKey({
      columns: [table.boardId],
      foreignColumns: [boards.id],
      name: "board_columns_board_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Cards de um Board (seção 22). */
export const boardCards = pgTable(
  "board_cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    boardId: uuid("board_id").notNull(),
    columnId: uuid("column_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    position: doublePrecision("position").notNull().default(0),
    dueAt: timestamp("due_at", { withTimezone: true }),
    // Texto livre ("baixa" | "media" | "alta" | "urgente") pelo mesmo motivo
    // do type/status do Calendar: evitar migração para novo valor de enum.
    priority: text("priority").notNull().default("media"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    boardIdIdx: index("board_cards_board_id_idx").on(table.boardId),
    columnIdIdx: index("board_cards_column_id_idx").on(table.columnId),
    dueAtIdx: index("board_cards_due_at_idx").on(table.dueAt),
    boardFk: foreignKey({
      columns: [table.boardId],
      foreignColumns: [boards.id],
      name: "board_cards_board_id_fkey",
    }).onDelete("cascade"),
    columnFk: foreignKey({
      columns: [table.columnId],
      foreignColumns: [boardColumns.id],
      name: "board_cards_column_id_fkey",
    }).onDelete("cascade"),
  })
);

/**
 * Múltiplos responsáveis por card (seção 22): em vez de um único
 * `assigneeUserId` no card, uma tabela de relação — não limita a equipe a
 * atribuir só uma pessoa por tarefa.
 */
export const boardCardAssignees = pgTable(
  "board_card_assignees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cardId: uuid("card_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    cardIdIdx: index("board_card_assignees_card_id_idx").on(table.cardId),
    userIdIdx: index("board_card_assignees_user_id_idx").on(table.userId),
    cardUserUnique: unique("board_card_assignees_unique").on(
      table.cardId,
      table.userId
    ),
    cardFk: foreignKey({
      columns: [table.cardId],
      foreignColumns: [boardCards.id],
      name: "board_card_assignees_card_id_fkey",
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "board_card_assignees_user_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Relação Kanban ↔ Pages (seção 24). */
export const boardCardDocuments = pgTable(
  "board_card_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cardId: uuid("card_id").notNull(),
    documentId: uuid("document_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    cardIdIdx: index("board_card_documents_card_id_idx").on(table.cardId),
    documentIdIdx: index("board_card_documents_document_id_idx").on(
      table.documentId
    ),
    cardDocumentUnique: unique("board_card_documents_unique").on(
      table.cardId,
      table.documentId
    ),
    cardFk: foreignKey({
      columns: [table.cardId],
      foreignColumns: [boardCards.id],
      name: "board_card_documents_card_id_fkey",
    }).onDelete("cascade"),
    documentFk: foreignKey({
      columns: [table.documentId],
      foreignColumns: [documents.id],
      name: "board_card_documents_document_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Relação Kanban ↔ Calendar (seção 25). */
export const boardCardEvents = pgTable(
  "board_card_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cardId: uuid("card_id").notNull(),
    eventId: uuid("event_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    cardIdIdx: index("board_card_events_card_id_idx").on(table.cardId),
    eventIdIdx: index("board_card_events_event_id_idx").on(table.eventId),
    cardEventUnique: unique("board_card_events_unique").on(
      table.cardId,
      table.eventId
    ),
    cardFk: foreignKey({
      columns: [table.cardId],
      foreignColumns: [boardCards.id],
      name: "board_card_events_card_id_fkey",
    }).onDelete("cascade"),
    eventFk: foreignKey({
      columns: [table.eventId],
      foreignColumns: [calendarEvents.id],
      name: "board_card_events_event_id_fkey",
    }).onDelete("cascade"),
  })
);

export type BoardRow = typeof boards.$inferSelect;
export type NewBoardRow = typeof boards.$inferInsert;
export type BoardColumnRow = typeof boardColumns.$inferSelect;
export type NewBoardColumnRow = typeof boardColumns.$inferInsert;
export type BoardCardRow = typeof boardCards.$inferSelect;
export type NewBoardCardRow = typeof boardCards.$inferInsert;
