import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { teams } from "./teams";

/**
 * Feed de atividade da equipe: linha do tempo do que aconteceu (criou um
 * teste, rodou execuções, encerrou um treino...). `verb` é texto livre
 * validado na aplicação (mesmo padrão de `calendar_events.type`), para novos
 * eventos não exigirem migration.
 *
 * `data` guarda um "snapshot" do nome do recurso: se o item for excluído
 * depois, o feed continua legível ("Ana criou o teste Missão 04", sem link).
 *
 * Agregação na escrita: o mesmo ator + verbo + recurso dentro de 30 min
 * incrementa `count` e avança `updated_at` em vez de criar outra linha
 * (ver `utils/stagebook/team-activity.ts`). Por isso o feed é ordenado por
 * `updated_at`.
 */
export const teamActivity = pgTable(
  "team_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    verb: text("verb").notNull(),
    // "board" | "thinklab" | "test" | "session" | "milestone" | "member" | "anatix_session"
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    count: integer("count").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("team_activity_team_updated_idx").on(t.teamId, t.updatedAt),
    index("team_activity_aggregate_idx").on(t.teamId, t.actorId, t.verb, t.entityId),
  ],
);

export type TeamActivityRow = typeof teamActivity.$inferSelect;
export type NewTeamActivityRow = typeof teamActivity.$inferInsert;
