import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";

// Catálogo de etiquetas (FLL, FTC, Sensor, Movimento, Pesquisa, Calibração...).
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

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;
