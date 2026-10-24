import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  uniqueIndex,
  index,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { documents } from "./notebook";
import { boardCards } from "./boards";
import { calendarEvents } from "./calendar";
import { thinklab } from "./thinklab";
import { tests } from "./labtest";

/**
 * Catálogo UNIVERSAL de tags do Stagebook.
 *
 * Uma tag pertence a um scope (pessoal OU equipe) e pode ser aplicada a
 * qualquer ferramenta desse scope: cards do Kanban, páginas, eventos do
 * calendário, quadros do ThinkLab e testes do LabTest. Cada ferramenta tem a
 * sua tabela de vínculo (abaixo), então a exclusão em cascata continua
 * garantida pelo banco.
 *
 * Antes o catálogo era global (um único "urgente" para todos os usuários);
 * isso impedia personalizar a cor sem afetar os outros. Com dono, renomear ou
 * recolorir uma tag só afeta o próprio espaço.
 */
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    name: text("name").notNull(),
    // Cor de fundo da etiqueta (#rrggbb). Null = cor automática pelo nome.
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("tags_user_id_idx").on(table.userId),
    teamIdIdx: index("tags_team_id_idx").on(table.teamId),
    // Nome único (sem diferenciar maiúsculas) dentro de cada scope.
    userNameUnique: uniqueIndex("tags_user_name_unique")
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.userId} is not null`),
    teamNameUnique: uniqueIndex("tags_team_name_unique")
      .on(table.teamId, sql`lower(${table.name})`)
      .where(sql`${table.teamId} is not null`),
    ownershipCheckConstraint: check(
      "tags_ownership_xor",
      sql`(${table.userId} is not null and ${table.teamId} is null) or (${table.userId} is null and ${table.teamId} is not null)`
    ),
    colorCheck: check(
      "tags_color_hex",
      sql`${table.color} is null or ${table.color} ~* '^#[0-9a-f]{6}$'`
    ),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "tags_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "tags_team_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Tags aplicadas a Pages (seção 26). */
export const documentTags = pgTable(
  "document_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    documentIdIdx: index("document_tags_document_id_idx").on(
      table.documentId
    ),
    tagIdIdx: index("document_tags_tag_id_idx").on(table.tagId),
    documentTagUnique: unique("document_tags_unique").on(
      table.documentId,
      table.tagId
    ),
    documentFk: foreignKey({
      columns: [table.documentId],
      foreignColumns: [documents.id],
      name: "document_tags_document_id_fkey",
    }).onDelete("cascade"),
    tagFk: foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "document_tags_tag_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Tags aplicadas a Cards do Kanban (seção 26). */
export const boardCardTags = pgTable(
  "board_card_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cardId: uuid("card_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    cardIdIdx: index("board_card_tags_card_id_idx").on(table.cardId),
    tagIdIdx: index("board_card_tags_tag_id_idx").on(table.tagId),
    cardTagUnique: unique("board_card_tags_unique").on(
      table.cardId,
      table.tagId
    ),
    cardFk: foreignKey({
      columns: [table.cardId],
      foreignColumns: [boardCards.id],
      name: "board_card_tags_card_id_fkey",
    }).onDelete("cascade"),
    tagFk: foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "board_card_tags_tag_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Tags aplicadas a eventos do Calendário. */
export const calendarEventTags = pgTable(
  "calendar_event_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("calendar_event_tags_event_id_idx").on(table.eventId),
    tagIdIdx: index("calendar_event_tags_tag_id_idx").on(table.tagId),
    eventTagUnique: unique("calendar_event_tags_unique").on(
      table.eventId,
      table.tagId
    ),
    eventFk: foreignKey({
      columns: [table.eventId],
      foreignColumns: [calendarEvents.id],
      name: "calendar_event_tags_event_id_fkey",
    }).onDelete("cascade"),
    tagFk: foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "calendar_event_tags_tag_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Tags aplicadas a quadros do ThinkLab. */
export const thinklabTags = pgTable(
  "thinklab_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    thinklabId: uuid("thinklab_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    thinklabIdIdx: index("thinklab_tags_thinklab_id_idx").on(table.thinklabId),
    tagIdIdx: index("thinklab_tags_tag_id_idx").on(table.tagId),
    thinklabTagUnique: unique("thinklab_tags_unique").on(
      table.thinklabId,
      table.tagId
    ),
    thinklabFk: foreignKey({
      columns: [table.thinklabId],
      foreignColumns: [thinklab.id],
      name: "thinklab_tags_thinklab_id_fkey",
    }).onDelete("cascade"),
    tagFk: foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "thinklab_tags_tag_id_fkey",
    }).onDelete("cascade"),
  })
);

/** Tags aplicadas a testes do LabTest. */
export const testTags = pgTable(
  "test_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testIdIdx: index("test_tags_test_id_idx").on(table.testId),
    tagIdIdx: index("test_tags_tag_id_idx").on(table.tagId),
    testTagUnique: unique("test_tags_unique").on(table.testId, table.tagId),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [tests.id],
      name: "test_tags_test_id_fkey",
    }).onDelete("cascade"),
    tagFk: foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "test_tags_tag_id_fkey",
    }).onDelete("cascade"),
  })
);

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;
export type DocumentTagRow = typeof documentTags.$inferSelect;
export type BoardCardTagRow = typeof boardCardTags.$inferSelect;
export type CalendarEventTagRow = typeof calendarEventTags.$inferSelect;
export type ThinklabTagRow = typeof thinklabTags.$inferSelect;
export type TestTagRow = typeof testTags.$inferSelect;
