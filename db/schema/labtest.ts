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

export const fieldTypeEnum = pgEnum("field_type", [
  "number",
  "boolean",
  "text",
  "select",
  "duration",
]);

// "manual" = digitado pelo usuário. "device" = fica pronto para quando o
// CalibraBot ganhar leitura automática via hardware/API no futuro.
export const fieldSourceEnum = pgEnum("field_source", ["manual", "device"]);

// ---------------------------------------------------------------------------
// tests — mesma tabela que já existia, mantida aqui como fonte de verdade
// ---------------------------------------------------------------------------

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teamId: integer("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  folderId: integer("folder_id").references(() => folders.id, {
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
// test_fields — definição genérica de campos (substitui test_missions/test_variables)
// ---------------------------------------------------------------------------

export const testFields = pgTable(
  "test_fields",
  {
    id: serial("id").primaryKey(),
    testId: uuid("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    label: text("label").notNull(),
    fieldType: fieldTypeEnum("field_type").notNull().default("number"),
    unit: text("unit"),
    // "pontuação máxima" / "meta" — nome genérico para caber em qualquer modo
    targetValue: numeric("target_value", { mode: "number" }),
    fieldOrder: integer("field_order").notNull().default(0),
    options: jsonb("options").$type<{ value: string; label: string }[]>(),
    required: boolean("required").notNull().default(false),
    source: fieldSourceEnum("source").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testFieldKeyUnique: unique("test_fields_test_id_field_key_key").on(
      table.testId,
      table.fieldKey,
    ),
  }),
);

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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// test_field_values — valor de um campo dentro de um lançamento
// ---------------------------------------------------------------------------

export const testFieldValues = pgTable(
  "test_field_values",
  {
    id: serial("id").primaryKey(),
    executionId: uuid("execution_id")
      .notNull()
      .references(() => testExecutions.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    value: jsonb("value").$type<number | boolean | string | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    executionFieldUnique: unique(
      "test_field_values_execution_id_field_key_key",
    ).on(table.executionId, table.fieldKey),
  }),
);
