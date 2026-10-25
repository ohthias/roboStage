import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { teams } from "./teams";
import { milestones } from "./milestones";
import { tags } from "./tags";
import { leagues } from "./leagues";
import type { DiagramKind } from "@/utils/quickbrick/notebook";

// ---------------------------------------------------------------------------
// QuickBrick Studio — caderno do robô.
//
//  quickbrick_notebooks      → o caderno (um robô / projeto)
//  quickbrick_photos         → versões do robô: foto (R2) + data/hora + notas
//  quickbrick_diagrams       → diagramas das ferramentas QuickBrick (jsonb)
//  quickbrick_notebook_tags  → tags universais aplicadas ao caderno
//
// Arquivos (fotos e o projeto .io do Studio 2.0) vivem no Cloudflare R2,
// bucket `quickbrick-projects`. O banco guarda só a chave do objeto.
// ---------------------------------------------------------------------------

export const quickbrickNotebooks = pgTable(
  "quickbrick_notebooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Criador. Em caderno de equipe, teamId define o escopo.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "cascade",
    }),
    milestoneId: uuid("milestone_id").references(() => milestones.id, {
      onDelete: "set null",
    }),
    // Competição do caderno (por enquanto só a FLL Challenge tem suporte).
    leagueId: uuid("league_id").references(() => leagues.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    robotName: text("robot_name"),
    description: text("description"),
    // Temporada FLL usada por padrão nos diagramas (bioglow, unearthed...).
    season: text("season"),
    // Cor da capa do caderno (#rrggbb).
    coverColor: text("cover_color"),
    // Projeto do BrickLink Studio 2.0 (.io) no R2.
    studioKey: text("studio_key"),
    studioFileName: text("studio_file_name"),
    studioSize: integer("studio_size"),
    studioUploadedAt: timestamp("studio_uploaded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
  },
  (t) => [
    index("quickbrick_notebooks_user_idx").on(t.userId),
    index("quickbrick_notebooks_team_idx").on(t.teamId),
    index("quickbrick_notebooks_league_idx").on(t.leagueId),
  ],
);

export const quickbrickPhotos = pgTable(
  "quickbrick_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notebookId: uuid("notebook_id")
      .notNull()
      .references(() => quickbrickNotebooks.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    // Rótulo da versão (ex.: "v3 — garra nova").
    title: text("title"),
    // Observações sobre as mudanças feitas nesta versão do robô.
    notes: text("notes"),
    // Data e hora da foto/versão (informada ou o momento do envio).
    takenAt: timestamp("taken_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("quickbrick_photos_notebook_idx").on(t.notebookId, t.takenAt)],
);

export const quickbrickDiagrams = pgTable(
  "quickbrick_diagrams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notebookId: uuid("notebook_id")
      .notNull()
      .references(() => quickbrickNotebooks.id, { onDelete: "cascade" }),
    kind: text("kind").$type<DiagramKind>().notNull(),
    title: text("title").notNull(),
    season: text("season"),
    data: jsonb("data").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("quickbrick_diagrams_notebook_idx").on(t.notebookId)],
);

/** Tags universais aplicadas a cadernos do QuickBrick. */
export const quickbrickNotebookTags = pgTable(
  "quickbrick_notebook_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    notebookId: uuid("notebook_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("quickbrick_notebook_tags_notebook_idx").on(t.notebookId),
    index("quickbrick_notebook_tags_tag_idx").on(t.tagId),
    unique("quickbrick_notebook_tags_unique").on(t.notebookId, t.tagId),
    foreignKey({
      columns: [t.notebookId],
      foreignColumns: [quickbrickNotebooks.id],
      name: "quickbrick_notebook_tags_notebook_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [t.tagId],
      foreignColumns: [tags.id],
      name: "quickbrick_notebook_tags_tag_id_fkey",
    }).onDelete("cascade"),
  ],
);

export type QuickbrickNotebookRow = typeof quickbrickNotebooks.$inferSelect;
export type QuickbrickPhotoRow = typeof quickbrickPhotos.$inferSelect;
export type QuickbrickDiagramRow = typeof quickbrickDiagrams.$inferSelect;
