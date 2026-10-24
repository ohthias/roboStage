import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";

/**
 * Milestones UNIVERSAIS do Stagebook.
 *
 * Antes (`board_milestones`) cada milestone pertencia a um board do Kanban.
 * Agora pertencem ao scope (pessoal OU equipe), como tags, e qualquer
 * ferramenta pode apontar para elas: cards do Kanban, páginas, eventos do
 * calendário, quadros do ThinkLab e testes do LabTest — cada uma com uma
 * coluna `milestone_id` (uma milestone por item, como já era nos cards).
 *
 * Os ids foram preservados na migration 0004, então `board_cards.milestone_id`
 * e `board_columns.rules.milestoneId` continuam válidos.
 */
export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    teamId: uuid("team_id"),
    name: text("name").notNull(),
    description: text("description"),
    // Cor de destaque (#rrggbb). Null = cor padrão da interface.
    color: text("color"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("milestones_user_id_idx").on(table.userId),
    teamIdIdx: index("milestones_team_id_idx").on(table.teamId),
    dueAtIdx: index("milestones_due_at_idx").on(table.dueAt),
    ownershipCheckConstraint: check(
      "milestones_ownership_xor",
      sql`(${table.userId} is not null and ${table.teamId} is null) or (${table.userId} is null and ${table.teamId} is not null)`
    ),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "milestones_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "milestones_team_id_fkey",
    }).onDelete("cascade"),
  })
);

export type MilestoneRow = typeof milestones.$inferSelect;
export type NewMilestoneRow = typeof milestones.$inferInsert;
