import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  serial,
  text,
  boolean,
  jsonb,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { teams } from "./teams";
import { folders } from "./notebook";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const testModeEnum = pgEnum("test_mode", [
  "runs",
  "calibrabot",
  "individual",
  "custom",
]);

// ---------------------------------------------------------------------------
// tests — mesma tabela que já existia, mantida aqui como fonte de verdade
// ---------------------------------------------------------------------------

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  folderId: uuid("folder_id").references(() => folders.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  mode: testModeEnum("mode").notNull().default("runs"),
  season: text("season"),
  status: text("status").notNull().default("draft"),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// test_executions — já existia (um lançamento/execução); repetida aqui para
// que test_field_values tenha referência tipada. Se já existir em outro
// arquivo do schema, IMPORTE de lá e apague esta definição.
// ---------------------------------------------------------------------------

export const testExecutions = pgTable("test_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  testId: uuid("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  executionNumber: integer("execution_number").notNull(),
  notes: text("notes"),
  results: jsonb("results").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});