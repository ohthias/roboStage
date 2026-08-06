import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // ID da organização do Clerk (ex: "org_xxx"). Não é FK porque as
    // organizações vivem no Clerk, não neste banco.
    organizationId: text("organization_id").notNull(),

    title: text("title").notNull().default("Sem título"),

    // Estado serializado do editor Lexical (editorState.toJSON()).
    // Nulo = documento novo/vazio, o Lexical inicializa com um parágrafo em branco.
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
  })
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
