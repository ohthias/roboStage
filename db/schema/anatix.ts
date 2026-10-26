import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { teams } from "./teams";

// ---------------------------------------------------------------------------
// Anatix — telemetria ao vivo do robô (biblioteca Anatix para Arduino).
//
//  anatix_labs      → laboratório configurado (máx. 3 por espaço/equipe)
//  anatix_sessions  → cada conexão serial aberta dentro de um laboratório
//  anatix_frames    → frames recebidos, gravados em lotes (jsonb)
// ---------------------------------------------------------------------------

export const ANATIX_MAX_LABS = 3;

export const anatixLabs = pgTable(
  "anatix_labs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    // Nome/placa informados pelo robô no frame H da última conexão.
    robotName: text("robot_name"),
    board: text("board"),
    // { baudRate, views: { charts, maps, tables }, chartMetrics, mapX, mapY }
    config: jsonb("config").notNull().default({}),
    lastConnectedAt: timestamp("last_connected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("anatix_labs_user_idx").on(t.userId),
    index("anatix_labs_team_idx").on(t.teamId),
  ],
);

export const anatixSessions = pgTable(
  "anatix_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    labId: uuid("lab_id")
      .notNull()
      .references(() => anatixLabs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    robotName: text("robot_name"),
    board: text("board"),
    protocolVersion: integer("protocol_version"),
    baudRate: integer("baud_rate"),
    frameCount: integer("frame_count").notNull().default(0),
    // Frames com checksum inválido descartados pelo navegador.
    invalidFrames: integer("invalid_frames").notNull().default(0),
    // Descartes reportados pelo próprio robô (campo do frame L).
    droppedFrames: integer("dropped_frames").notNull().default(0),
    // Resumo por métrica: { metrics: { nome: { min, max, avg, count, last } }, states, sections }
    summary: jsonb("summary").notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [index("anatix_sessions_lab_idx").on(t.labId)],
);

export const anatixFrames = pgTable(
  "anatix_frames",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => anatixSessions.id, { onDelete: "cascade" }),
    // Ordem do lote dentro da sessão.
    batch: integer("batch").notNull(),
    // Array de frames já decodificados (ver AnatixFrame em types/anatix.types.ts).
    frames: jsonb("frames").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("anatix_frames_session_idx").on(t.sessionId, t.batch)],
);
