import {
  pgTable,
  uuid,
  text,
  date,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  unique,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { milestones } from "./milestones";
import { tags } from "./tags";
import { documents } from "./notebook";
import { tests } from "./labtest";
import { thinklab } from "./thinklab";
import { quickbrickNotebooks } from "./quickbrick";
import type { JournalContent } from "@/features/stagebook/types/journal";

const ownershipCheck = (name: string, userIdCol: any, teamIdCol: any) =>
  check(
    name,
    sql`(${userIdCol} is not null and ${teamIdCol} is null) or (${userIdCol} is null and ${teamIdCol} is not null)`
  );

/**
 * Diário: o registro do que foi feito num dia. Pertence a um único Stagebook
 * Scope (pessoal → `user_id`; equipe → `team_id`, mesmo XOR do Kanban).
 *
 * `author_id` é sempre quem escreveu: no espaço de equipe todo membro lê o
 * diário de todos, mas só o autor edita (técnico/mentor podem excluir).
 *
 * `entry_date` é só o dia (sem fuso): vem do navegador com o "hoje" local da
 * pessoa e pode ser mudado depois. Mais de uma entrada no mesmo dia é
 * permitido (ex.: manhã e tarde), por isso não há UNIQUE.
 *
 * `content` guarda as seções (texto, tarefas, resolvidos) já normalizadas por
 * `normalizeJournalContent`; `search_text` é o texto puro, para a busca.
 */
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    authorId: text("author_id").notNull(),
    entryDate: date("entry_date", { mode: "string" }).notNull(),
    title: text("title"),
    templateKey: text("template_key"),
    // Marco (meta) universal do Stagebook — mesmo catálogo de Kanban, páginas, LabTest…
    milestoneId: uuid("milestone_id"),
    content: jsonb("content").$type<JournalContent>().notNull().default({ categories: [], sections: [] }),
    searchText: text("search_text").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("journal_entries_user_date_idx").on(table.userId, table.entryDate),
    index("journal_entries_team_date_idx").on(table.teamId, table.entryDate),
    index("journal_entries_author_date_idx").on(table.authorId, table.entryDate),
    index("journal_entries_milestone_idx").on(table.milestoneId),
    foreignKey({
      columns: [table.milestoneId],
      foreignColumns: [milestones.id],
      name: "journal_entries_milestone_id_fkey",
    }).onDelete("set null"),
    ownershipCheck("journal_entries_ownership_xor", table.userId, table.teamId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "journal_entries_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "journal_entries_team_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [users.id],
      name: "journal_entries_author_id_fkey",
    }).onDelete("cascade"),
  ]
);

/**
 * Templates salvos do Diário (os prontos ficam no código, em
 * `features/stagebook/types/journal.ts`). Mesmo XOR de scope: um template da equipe aparece para
 * todos os membros; editar/excluir é do criador ou de técnico/mentor.
 */
export const journalTemplates = pgTable(
  "journal_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").notNull().default("NotebookPen"),
    content: jsonb("content").$type<JournalContent>().notNull().default({ categories: [], sections: [] }),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("journal_templates_user_idx").on(table.userId),
    index("journal_templates_team_idx").on(table.teamId),
    ownershipCheck("journal_templates_ownership_xor", table.userId, table.teamId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "journal_templates_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "journal_templates_team_id_fkey",
    }).onDelete("cascade"),
  ]
);

/** Tags universais aplicadas a entradas do Diário. */
export const journalEntryTags = pgTable(
  "journal_entry_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryId: uuid("entry_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("journal_entry_tags_entry_idx").on(table.entryId),
    index("journal_entry_tags_tag_idx").on(table.tagId),
    unique("journal_entry_tags_unique").on(table.entryId, table.tagId),
    foreignKey({
      columns: [table.entryId],
      foreignColumns: [journalEntries.id],
      name: "journal_entry_tags_entry_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "journal_entry_tags_tag_id_fkey",
    }).onDelete("cascade"),
  ]
);

/**
 * Vínculos de uma entrada com itens das ferramentas: páginas do StageBook,
 * testes do LabTest, cadernos do QuickBrick e quadros do ThinkLab.
 *
 * Uma coluna com FK de verdade por ferramenta (exatamente uma preenchida, ver
 * CHECK): excluir o item apaga o vínculo em cascata, sem link quebrado.
 */
export const journalEntryLinks = pgTable(
  "journal_entry_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryId: uuid("entry_id").notNull(),
    documentId: uuid("document_id"),
    testId: uuid("test_id"),
    quickbrickId: uuid("quickbrick_id"),
    thinklabId: uuid("thinklab_id"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("journal_entry_links_entry_idx").on(table.entryId),
    check(
      "journal_entry_links_one_target",
      sql`num_nonnulls(${table.documentId}, ${table.testId}, ${table.quickbrickId}, ${table.thinklabId}) = 1`
    ),
    uniqueIndex("journal_entry_links_document_unique").on(table.entryId, table.documentId).where(sql`${table.documentId} is not null`),
    uniqueIndex("journal_entry_links_test_unique").on(table.entryId, table.testId).where(sql`${table.testId} is not null`),
    uniqueIndex("journal_entry_links_quickbrick_unique").on(table.entryId, table.quickbrickId).where(sql`${table.quickbrickId} is not null`),
    uniqueIndex("journal_entry_links_thinklab_unique").on(table.entryId, table.thinklabId).where(sql`${table.thinklabId} is not null`),
    index("journal_entry_links_document_idx").on(table.documentId),
    index("journal_entry_links_test_idx").on(table.testId),
    index("journal_entry_links_quickbrick_idx").on(table.quickbrickId),
    index("journal_entry_links_thinklab_idx").on(table.thinklabId),
    foreignKey({ columns: [table.entryId], foreignColumns: [journalEntries.id], name: "journal_entry_links_entry_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.documentId], foreignColumns: [documents.id], name: "journal_entry_links_document_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.testId], foreignColumns: [tests.id], name: "journal_entry_links_test_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.quickbrickId], foreignColumns: [quickbrickNotebooks.id], name: "journal_entry_links_quickbrick_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.thinklabId], foreignColumns: [thinklab.id], name: "journal_entry_links_thinklab_id_fkey" }).onDelete("cascade"),
  ]
);

export type JournalEntryRow = typeof journalEntries.$inferSelect;
export type NewJournalEntryRow = typeof journalEntries.$inferInsert;
export type JournalTemplateRow = typeof journalTemplates.$inferSelect;
