import {
  pgTable,
  uuid,
  text,
  date,
  jsonb,
  timestamp,
  doublePrecision,
  index,
  uniqueIndex,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { documents, folders } from "./notebook";
import { tests } from "./labtest";
import { thinklab } from "./thinklab";
import { quickbrickNotebooks } from "./quickbrick";
import { journalEntries } from "./journal";
import { boards } from "./boards";
import { trainingSessions } from "./training";
import { milestones } from "./milestones";
import type { LegacyContent } from "@/types/legacy";

/**
 * Legado da equipe: uma "aba" por temporada e por competição de que a equipe
 * participou, com o que foi feito naquele período.
 *
 *  - `kind = 'season'`: a temporada (ex.: "Unearthed 2025/26"). `season_key`
 *    guarda o id da temporada FLL quando houver (unearthed, bioglow…), para o
 *    logo e para sugerir testes/cadernos da mesma temporada.
 *  - `kind = 'competition'`: um torneio. `parent_id` aponta para a temporada
 *    (opcional: competição avulsa fica em "Outras competições"). `stage` é a
 *    etapa (regional, estadual, nacional, internacional, amistoso).
 *
 * `league` (fll, obr, ftc, outra) muda os modelos de seção, as etapas e as
 * sugestões (ex.: rodadas OBR do LabTest).
 *
 * Só existe no espaço de equipe (não há legado pessoal). `content` guarda o
 * texto (resumo, resultado, prêmios, aprendizados) já normalizado por
 * `normalizeLegacyContent`.
 */
export const teamLegacyChapters = pgTable(
  "team_legacy_chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id").notNull(),
    kind: text("kind").notNull().default("season"),
    parentId: uuid("parent_id"),
    title: text("title").notNull(),
    seasonKey: text("season_key"),
    league: text("league"),
    stage: text("stage"),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    location: text("location"),
    color: text("color"),
    content: jsonb("content").$type<LegacyContent>().notNull().default({}),
    position: doublePrecision("position").notNull().default(0),
    // Autoria; null se a conta for apagada (o legado é da equipe, não some junto).
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("team_legacy_chapters_team_idx").on(table.teamId, table.startDate),
    index("team_legacy_chapters_parent_idx").on(table.parentId),
    check("team_legacy_chapters_kind", sql`${table.kind} in ('season', 'competition')`),
    check("team_legacy_chapters_league", sql`${table.league} is null or ${table.league} in ('fll', 'obr', 'ftc', 'outra')`),
    check(
      "team_legacy_chapters_stage",
      sql`${table.stage} is null or (${table.kind} = 'competition' and ${table.stage} in ('regional', 'estadual', 'nacional', 'internacional', 'amistoso'))`
    ),
    // Só competição tem pai (e o pai é sempre uma temporada; ver actions).
    check("team_legacy_chapters_parent_kind", sql`${table.parentId} is null or ${table.kind} = 'competition'`),
    check("team_legacy_chapters_dates", sql`${table.startDate} is null or ${table.endDate} is null or ${table.startDate} <= ${table.endDate}`),
    check("team_legacy_chapters_color_hex", sql`${table.color} is null or ${table.color} ~* '^#[0-9a-f]{6}$'`),
    foreignKey({ columns: [table.teamId], foreignColumns: [teams.id], name: "team_legacy_chapters_team_id_fkey" }).onDelete("cascade"),
    // Excluir a temporada solta as competições dela (viram "outras"), não apaga.
    foreignKey({ columns: [table.parentId], foreignColumns: [table.id], name: "team_legacy_chapters_parent_id_fkey" }).onDelete("set null"),
    foreignKey({ columns: [table.createdBy], foreignColumns: [users.id], name: "team_legacy_chapters_created_by_fkey" }).onDelete("set null"),
  ]
);

/**
 * O que está "guardado" em cada aba do legado: páginas e pastas do StageBook,
 * testes do LabTest, cadernos do QuickBrick, quadros do ThinkLab, entradas do
 * Diário, Kanbans, sessões de treino e metas.
 *
 * Como nos vínculos do Diário, é uma referência viva (uma coluna com FK por
 * ferramenta, exatamente uma preenchida): título e conteúdo vêm sempre da
 * ferramenta, e excluir o item tira ele do legado em cascata.
 */
export const teamLegacyItems = pgTable(
  "team_legacy_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id").notNull(),
    documentId: uuid("document_id"),
    testId: uuid("test_id"),
    quickbrickId: uuid("quickbrick_id"),
    thinklabId: uuid("thinklab_id"),
    journalId: uuid("journal_id"),
    boardId: uuid("board_id"),
    folderId: uuid("folder_id"),
    sessionId: uuid("session_id"),
    milestoneId: uuid("milestone_id"),
    // Legenda livre ("caderno do robô do regional").
    note: text("note"),
    position: doublePrecision("position").notNull().default(0),
    // Autoria; null se a conta for apagada (o legado é da equipe, não some junto).
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("team_legacy_items_chapter_idx").on(table.chapterId, table.position),
    check(
      "team_legacy_items_one_target",
      sql`num_nonnulls(${table.documentId}, ${table.testId}, ${table.quickbrickId}, ${table.thinklabId}, ${table.journalId}, ${table.boardId}, ${table.folderId}, ${table.sessionId}, ${table.milestoneId}) = 1`
    ),
    uniqueIndex("team_legacy_items_document_unique").on(table.chapterId, table.documentId).where(sql`${table.documentId} is not null`),
    uniqueIndex("team_legacy_items_test_unique").on(table.chapterId, table.testId).where(sql`${table.testId} is not null`),
    uniqueIndex("team_legacy_items_quickbrick_unique").on(table.chapterId, table.quickbrickId).where(sql`${table.quickbrickId} is not null`),
    uniqueIndex("team_legacy_items_thinklab_unique").on(table.chapterId, table.thinklabId).where(sql`${table.thinklabId} is not null`),
    uniqueIndex("team_legacy_items_journal_unique").on(table.chapterId, table.journalId).where(sql`${table.journalId} is not null`),
    uniqueIndex("team_legacy_items_board_unique").on(table.chapterId, table.boardId).where(sql`${table.boardId} is not null`),
    uniqueIndex("team_legacy_items_folder_unique").on(table.chapterId, table.folderId).where(sql`${table.folderId} is not null`),
    uniqueIndex("team_legacy_items_session_unique").on(table.chapterId, table.sessionId).where(sql`${table.sessionId} is not null`),
    uniqueIndex("team_legacy_items_milestone_unique").on(table.chapterId, table.milestoneId).where(sql`${table.milestoneId} is not null`),
    index("team_legacy_items_document_idx").on(table.documentId),
    index("team_legacy_items_test_idx").on(table.testId),
    index("team_legacy_items_quickbrick_idx").on(table.quickbrickId),
    index("team_legacy_items_thinklab_idx").on(table.thinklabId),
    index("team_legacy_items_journal_idx").on(table.journalId),
    index("team_legacy_items_board_idx").on(table.boardId),
    index("team_legacy_items_folder_idx").on(table.folderId),
    index("team_legacy_items_session_idx").on(table.sessionId),
    index("team_legacy_items_milestone_idx").on(table.milestoneId),
    foreignKey({ columns: [table.chapterId], foreignColumns: [teamLegacyChapters.id], name: "team_legacy_items_chapter_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.documentId], foreignColumns: [documents.id], name: "team_legacy_items_document_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.testId], foreignColumns: [tests.id], name: "team_legacy_items_test_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.quickbrickId], foreignColumns: [quickbrickNotebooks.id], name: "team_legacy_items_quickbrick_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.thinklabId], foreignColumns: [thinklab.id], name: "team_legacy_items_thinklab_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.journalId], foreignColumns: [journalEntries.id], name: "team_legacy_items_journal_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.boardId], foreignColumns: [boards.id], name: "team_legacy_items_board_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.folderId], foreignColumns: [folders.id], name: "team_legacy_items_folder_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.sessionId], foreignColumns: [trainingSessions.id], name: "team_legacy_items_session_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.milestoneId], foreignColumns: [milestones.id], name: "team_legacy_items_milestone_id_fkey" }).onDelete("cascade"),
    foreignKey({ columns: [table.createdBy], foreignColumns: [users.id], name: "team_legacy_items_created_by_fkey" }).onDelete("set null"),
  ]
);

export type TeamLegacyChapterRow = typeof teamLegacyChapters.$inferSelect;
export type TeamLegacyItemRow = typeof teamLegacyItems.$inferSelect;
