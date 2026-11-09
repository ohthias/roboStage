import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
  index,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { calendarEvents } from "./calendar";
import { milestones } from "./milestones";

// ---------------------------------------------------------------------------
// Sessões de treino — o "contêiner" de um treino, simulado ou competição.
// Agrupa a presença, as execuções de LabTest e as sessões Anatix que
// aconteceram durante ela. Ao encerrar, guarda um resumo em `summary`.
//
// `kind` e `status` são texto livre (convenção do `calendar_events`):
//   kind:   "treino" | "simulado" | "competicao"
//   status: "planejada" | "em_andamento" | "encerrada"
// ---------------------------------------------------------------------------

export const trainingSessions = pgTable(
  "training_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    kind: text("kind").notNull().default("treino"),
    status: text("status").notNull().default("planejada"),
    calendarEventId: uuid("calendar_event_id").references(() => calendarEvents.id, {
      onDelete: "set null",
    }),
    milestoneId: uuid("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
    location: text("location"),
    notes: text("notes"),
    summary: jsonb("summary").$type<Record<string, unknown>>().notNull().default({}),
    // Escala: quantas rodadas a grade mostra (0 = só "sessão inteira") e a
    // rodada que está acontecendo agora (sugere o operador das execuções).
    roundCount: integer("round_count").notNull().default(0),
    currentRound: integer("current_round"),
    // A escala fica em rascunho até ser publicada (é aí que os membros são avisados).
    rosterPublishedAt: timestamp("roster_published_at", { withTimezone: true }),
    // Escala como estava na última publicação ({ userId, dutyRoleId, round }[]):
    // ao republicar, só quem entrou, saiu ou mudou de função é avisado.
    rosterSnapshot: jsonb("roster_snapshot").$type<
      { userId: string; dutyRoleId: string; round: number | null }[]
    >(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("training_sessions_team_idx").on(t.teamId, t.startedAt),
    index("training_sessions_calendar_event_idx").on(t.calendarEventId),
    // No máximo UMA sessão em andamento por equipe — é o que permite o vínculo automático.
    uniqueIndex("training_sessions_one_active_per_team")
      .on(t.teamId)
      .where(sql`status = 'em_andamento'`),
  ],
);

export const trainingSessionAttendees = pgTable(
  "training_session_attendees",
  {
    // Id próprio + unique (sessão, usuário) em vez de PK composta: a
    // introspecção do drizzle-kit com PGlite (testes) falha com PK composta.
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("training_session_attendees_session_user_unique").on(t.sessionId, t.userId)],
);

// ---------------------------------------------------------------------------
// Escala de funções
// ---------------------------------------------------------------------------

/** Catálogo de funções por equipe (editável: FLL, OBR e FTC usam funções diferentes). */
export const teamDutyRoles = pgTable(
  "team_duty_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    description: text("description"),
    color: text("color"),
    position: integer("position").notNull().default(0),
    // Ex.: Piloto = 2 (a FLL permite 2 na mesa). Null = sem limite.
    maxPerSlot: integer("max_per_slot"),
    // Arquivar em vez de excluir, para manter o histórico da escala.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("team_duty_roles_team_label_unique").on(t.teamId, t.label)],
);

export const sessionDutyAssignments = pgTable(
  "session_duty_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    dutyRoleId: uuid("duty_role_id")
      .notNull()
      .references(() => teamDutyRoles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // null = sessão inteira; 1, 2, 3... = rodada específica.
    round: integer("round"),
    assignedBy: text("assigned_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("session_duty_assignments_session_idx").on(t.sessionId),
    index("session_duty_assignments_user_idx").on(t.userId),
    // NULLS NOT DISTINCT: "sessão inteira" (round null) também não duplica.
    unique("session_duty_assignments_unique")
      .on(t.sessionId, t.dutyRoleId, t.userId, t.round)
      .nullsNotDistinct(),
  ],
);

export type TrainingSessionRow = typeof trainingSessions.$inferSelect;
export type NewTrainingSessionRow = typeof trainingSessions.$inferInsert;
export type TeamDutyRoleRow = typeof teamDutyRoles.$inferSelect;
export type SessionDutyAssignmentRow = typeof sessionDutyAssignments.$inferSelect;
