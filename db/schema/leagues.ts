import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { leagueRelationEnum } from "./enums";
import { users } from "./users";

/**
 * Catálogo de ligas/competições. Cadastro reutilizável e expansível:
 * FLL, FTC, FRC, VEX, WRO, projetos acadêmicos etc. Novas ligas são apenas
 * novas linhas — nunca exigem alteração de schema.
 */
export const leagues = pgTable(
  "leagues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(), // ex: "FLL", "FTC", "FRC"
    name: text("name").notNull(), // ex: "FIRST LEGO League Challenge"
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    codeUnique: unique("leagues_code_unique").on(table.code),
    codeIdx: index("leagues_code_idx").on(table.code),
  })
);

/**
 * Liga cada usuário às competições que participa OU deseja conhecer.
 * Vale para qualquer personaType (competidor, mentor, entusiasta, organizador) —
 * a distinção fica no campo relationType, não em tabelas separadas.
 */
export const userLeagueInterests = pgTable(
  "user_league_interests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    leagueId: uuid("league_id").notNull(),
    relationType: leagueRelationEnum("relation_type")
      .notNull()
      .default("interessado"),
    teamName: text("team_name"), // nome livre da equipe, se houver
    season: text("season"), // temporada atual de participação, se aplicável
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_league_interests_user_id_idx").on(table.userId),
    leagueIdIdx: index("user_league_interests_league_id_idx").on(
      table.leagueId
    ),
    userLeagueUnique: unique("user_league_interests_user_league_unique").on(
      table.userId,
      table.leagueId
    ),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_league_interests_user_id_fkey",
    }).onDelete("cascade"),
    leagueFk: foreignKey({
      columns: [table.leagueId],
      foreignColumns: [leagues.id],
      name: "user_league_interests_league_id_fkey",
    }).onDelete("cascade"),
  })
);

export type LeagueRow = typeof leagues.$inferSelect;
export type NewLeagueRow = typeof leagues.$inferInsert;
export type UserLeagueInterestRow = typeof userLeagueInterests.$inferSelect;
export type NewUserLeagueInterestRow = typeof userLeagueInterests.$inferInsert;
