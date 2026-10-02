import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { documents } from "./notebook";
import { boardCards } from "./boards";

// Catálogo de etiquetas (FLL, FTC, Sensor, Movimento, Pesquisa, Calibração...).
// Catálogo global e reutilizável — o scope de "onde a tag vale" vive na
// relação (document_tags / board_card_tags), não na tag em si. Isso evita
// duplicar "urgente" uma vez por usuário e outra por equipe.
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: unique("tags_name_unique").on(table.name),
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

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;
export type DocumentTagRow = typeof documentTags.$inferSelect;
export type BoardCardTagRow = typeof boardCardTags.$inferSelect;
