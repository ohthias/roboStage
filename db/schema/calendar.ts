import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  foreignKey,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { documents } from "./notebook";

const ownershipCheck = (userIdCol: any, teamIdCol: any) =>
  check(
    "ownership_xor",
    sql`(${userIdCol} is not null and ${teamIdCol} is null) or (${userIdCol} is null and ${teamIdCol} is not null)`
  );

/**
 * Eventos do Calendar (seção 17). `type` e `status` são texto livre em vez de
 * enum de banco: a seção 18 pede explicitamente que novos tipos possam ser
 * adicionados depois sem quebrar nada — um pgEnum exigiria uma migration só
 * para acrescentar um valor. A aplicação valida os valores conhecidos
 * ("treino", "reuniao", "competicao", "deadline", "projeto", "evento",
 * "outro") em lib/stagebook, mas o banco não trava novos valores.
 */
export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    title: text("title").notNull(),
    description: text("description"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    allDay: boolean("all_day").notNull().default(false),
    type: text("type").notNull().default("evento"),
    status: text("status").notNull().default("confirmado"),
    color: text("color"),
    location: text("location"),
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
    userIdIdx: index("calendar_events_user_id_idx").on(table.userId),
    teamIdIdx: index("calendar_events_team_id_idx").on(table.teamId),
    startAtIdx: index("calendar_events_start_at_idx").on(table.startAt),
    userStartIdx: index("calendar_events_user_start_idx").on(
      table.userId,
      table.startAt
    ),
    teamStartIdx: index("calendar_events_team_start_idx").on(
      table.teamId,
      table.startAt
    ),
    ownershipCheckConstraint: ownershipCheck(table.userId, table.teamId),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "calendar_events_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "calendar_events_team_id_fkey",
    }).onDelete("cascade"),
  })
);

/**
 * Relação Calendar ↔ Page (seção 19). Muitos-para-muitos: um evento pode
 * apontar para várias Pages (ex: "Treino de sábado" → Estratégias + Missões).
 */
export const calendarEventDocuments = pgTable(
  "calendar_event_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").notNull(),
    documentId: uuid("document_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("calendar_event_documents_event_id_idx").on(
      table.eventId
    ),
    documentIdIdx: index("calendar_event_documents_document_id_idx").on(
      table.documentId
    ),
    eventDocumentUnique: unique("calendar_event_documents_unique").on(
      table.eventId,
      table.documentId
    ),
    eventFk: foreignKey({
      columns: [table.eventId],
      foreignColumns: [calendarEvents.id],
      name: "calendar_event_documents_event_id_fkey",
    }).onDelete("cascade"),
    documentFk: foreignKey({
      columns: [table.documentId],
      foreignColumns: [documents.id],
      name: "calendar_event_documents_document_id_fkey",
    }).onDelete("cascade"),
  })
);

export type CalendarEventRow = typeof calendarEvents.$inferSelect;
export type NewCalendarEventRow = typeof calendarEvents.$inferInsert;
export type CalendarEventDocumentRow =
  typeof calendarEventDocuments.$inferSelect;
