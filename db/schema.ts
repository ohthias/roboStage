import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // ID da organização do Clerk (ex: "org_xxx").
    organizationId: text("organization_id").notNull(),

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
    organizationIdIdx: index("folders_organization_id_idx").on(
      table.organizationId
    ),
    parentIdIdx: index("folders_parent_id_idx").on(table.parentId),
    // Ao excluir uma pasta, suas subpastas são excluídas em cascata.
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "folders_parent_id_fkey",
    }).onDelete("cascade"),
  })
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id").notNull(),

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
    organizationIdIdx: index("documents_organization_id_idx").on(
      table.organizationId
    ),
    folderIdIdx: index("documents_folder_id_idx").on(table.folderId),
    // Se a pasta for excluída, o documento volta para a raiz (não é apagado).
    folderFk: foreignKey({
      columns: [table.folderId],
      foreignColumns: [folders.id],
      name: "documents_folder_id_fkey",
    }).onDelete("set null"),
  })
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
export type FolderRow = typeof folders.$inferSelect;
export type NewFolderRow = typeof folders.$inferInsert;