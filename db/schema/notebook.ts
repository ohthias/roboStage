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
import { teams } from "./teams";

/**
 * Igual ao schema original, mas organizationId virou userId (o caderno agora
 * pertence ao usuário) e ganhou um teamId opcional: quando preenchido, o
 * conteúdo passa a ser compartilhado no contexto daquela equipe. Esse é o
 * ponto de expansão pedido — amanhã dá pra adicionar organizationId de volta
 * do mesmo jeito, sem tocar no resto do schema.
 */
export const folders = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    teamId: uuid("team_id"),
    // Auto-referência: null = pasta na raiz do caderno.
    parentId: uuid("parent_id"),
    name: text("name").notNull().default("Nova pasta"),
    icon: text("icon"), // emoji, ex: "📁"
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("folders_user_id_idx").on(table.userId),
    teamIdIdx: index("folders_team_id_idx").on(table.teamId),
    parentIdIdx: index("folders_parent_id_idx").on(table.parentId),
    // Ao excluir uma pasta, suas subpastas são excluídas em cascata.
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "folders_parent_id_fkey",
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "folders_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "folders_team_id_fkey",
    }).onDelete("set null"),
  })
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    teamId: uuid("team_id"),
    // null = documento na raiz do caderno (fora de qualquer pasta).
    folderId: uuid("folder_id"),
    title: text("title").notNull().default("Sem título"),
    icon: text("icon"), // emoji, ex: "📝"
    // Estado serializado do editor Lexical (editorState.toJSON()).
    content: jsonb("content").$type<Record<string, unknown> | null>(),
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
    userIdIdx: index("documents_user_id_idx").on(table.userId),
    teamIdIdx: index("documents_team_id_idx").on(table.teamId),
    folderIdIdx: index("documents_folder_id_idx").on(table.folderId),
    // Se a pasta for excluída, o documento volta para a raiz (não é apagado).
    folderFk: foreignKey({
      columns: [table.folderId],
      foreignColumns: [folders.id],
      name: "documents_folder_id_fkey",
    }).onDelete("set null"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "documents_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "documents_team_id_fkey",
    }).onDelete("set null"),
  })
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
export type FolderRow = typeof folders.$inferSelect;
export type NewFolderRow = typeof folders.$inferInsert;
