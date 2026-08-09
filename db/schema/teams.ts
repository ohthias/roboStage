import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { teamRoleEnum } from "./enums";
import { users } from "./users";
import { leagues } from "./leagues";

/**
 * Equipe de robótica. Hoje o dono de tudo (cadernos, testes) é o usuário,
 * mas essa tabela já existe para que, quando quiser compartilhar entre membros
 * de uma equipe (ou depois entre organizações), baste popular o teamId opcional
 * já presente em folders/documents/lab_tests — sem redesenhar o banco.
 */
export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    leagueId: uuid("league_id"),
    season: text("season"),
    // Texto livre por enquanto — se no futuro "organização" virar uma entidade
    // formal (ex: escola, empresa), basta trocar por uma FK sem quebrar nada aqui.
    organizationName: text("organization_name"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    leagueIdIdx: index("teams_league_id_idx").on(table.leagueId),
    createdByIdx: index("teams_created_by_idx").on(table.createdBy),
    leagueFk: foreignKey({
      columns: [table.leagueId],
      foreignColumns: [leagues.id],
      name: "teams_league_id_fkey",
    }).onDelete("set null"),
    createdByFk: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "teams_created_by_fkey",
    }).onDelete("cascade"),
  })
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id").notNull(),
    userId: text("user_id").notNull(),
    role: teamRoleEnum("role").notNull().default("competidor"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    teamIdIdx: index("team_members_team_id_idx").on(table.teamId),
    userIdIdx: index("team_members_user_id_idx").on(table.userId),
    teamUserUnique: unique("team_members_team_user_unique").on(
      table.teamId,
      table.userId
    ),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "team_members_team_id_fkey",
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "team_members_user_id_fkey",
    }).onDelete("cascade"),
  })
);

export type TeamRow = typeof teams.$inferSelect;
export type NewTeamRow = typeof teams.$inferInsert;
export type TeamMemberRow = typeof teamMembers.$inferSelect;
export type NewTeamMemberRow = typeof teamMembers.$inferInsert;
