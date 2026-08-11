import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  foreignKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";
import { tags } from "./tags";
import {
  testTypeEnum,
  testStatusEnum,
  parameterTypeEnum,
  metricTypeEnum,
} from "./enums";

/**
 * Testes: cabeçalho de qualquer experimento — Run, CalibraBot ou Personalizado.
 * O "type" decide quais tabelas de extensão (lab-test-runs.ts /
 * lab-test-calibration.ts) se aplicam a cada execução; novas modalidades no
 * futuro só precisam de um novo valor de enum + tabelas próprias, sem alterar
 * lab_tests, lab_test_executions, parâmetros, métricas ou anexos.
 */
export const labTests = pgTable(
  "lab_tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    type: testTypeEnum("type").notNull(),
    // Dono do teste. teamId é opcional: quando preenchido, o teste é
    // compartilhado com a equipe (ponto de expansão além do usuário único).
    userId: text("user_id").notNull(),
    teamId: uuid("team_id"),
    status: testStatusEnum("status").notNull().default("ativo"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("lab_tests_user_id_idx").on(table.userId),
    teamIdIdx: index("lab_tests_team_id_idx").on(table.teamId),
    typeIdx: index("lab_tests_type_idx").on(table.type),
    statusIdx: index("lab_tests_status_idx").on(table.status),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "lab_tests_user_id_fkey",
    }).onDelete("cascade"),
    teamFk: foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "lab_tests_team_id_fkey",
    }).onDelete("set null"),
  })
);

export const labTestTagAssignments = pgTable(
  "lab_test_tag_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    tagId: uuid("tag_id").notNull(),
  },
  (table) => ({
    testTagUnique: unique("lab_test_tag_assignments_unique").on(
      table.testId,
      table.tagId
    ),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "lab_test_tag_assignments_test_id_fkey",
    }).onDelete("cascade"),
    tagFk: foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "lab_test_tag_assignments_tag_id_fkey",
    }).onDelete("cascade"),
  })
);

// Execuções: cada tentativa dentro de um teste. Nunca é sobrescrita.
export const labTestExecutions = pgTable(
  "lab_test_executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    operatorId: text("operator_id").notNull(),
    executedAt: timestamp("executed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    durationSeconds: numeric("duration_seconds", { precision: 10, scale: 2 }),
    notes: text("notes"),
    // Resumo livre. Detalhes estruturados (pontuação de Run, resultado de
    // calibração etc.) ficam nas tabelas de extensão de cada modalidade.
    resultSummary: text("result_summary"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testIdIdx: index("lab_test_executions_test_id_idx").on(table.testId),
    operatorIdIdx: index("lab_test_executions_operator_id_idx").on(
      table.operatorId
    ),
    testAttemptUnique: unique(
      "lab_test_executions_test_attempt_unique"
    ).on(table.testId, table.attemptNumber),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "lab_test_executions_test_id_fkey",
    }).onDelete("cascade"),
    operatorFk: foreignKey({
      columns: [table.operatorId],
      foreignColumns: [users.id],
      name: "lab_test_executions_operator_id_fkey",
    }).onDelete("restrict"),
  })
);

/**
 * Parâmetros: definição livre por teste. É o mecanismo que atende
 * diretamente a modalidade Personalizado (sem limite de parâmetros), mas
 * também pode ser usado para descrever entradas específicas de Run/CalibraBot
 * sem precisar mexer no schema.
 */
export const labTestParameters = pgTable(
  "lab_test_parameters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    name: text("name").notNull(),
    type: parameterTypeEnum("type").notNull().default("text"),
    unit: text("unit"),
    defaultValue: text("default_value"),
    isRequired: boolean("is_required").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testIdIdx: index("lab_test_parameters_test_id_idx").on(table.testId),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "lab_test_parameters_test_id_fkey",
    }).onDelete("cascade"),
  })
);

export const labTestParameterValues = pgTable(
  "lab_test_parameter_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    parameterId: uuid("parameter_id").notNull(),
    value: text("value"),
  },
  (table) => ({
    executionIdIdx: index(
      "lab_test_parameter_values_execution_id_idx"
    ).on(table.executionId),
    parameterIdIdx: index(
      "lab_test_parameter_values_parameter_id_idx"
    ).on(table.parameterId),
    executionParameterUnique: unique(
      "lab_test_parameter_values_unique"
    ).on(table.executionId, table.parameterId),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_parameter_values_execution_id_fkey",
    }).onDelete("cascade"),
    parameterFk: foreignKey({
      columns: [table.parameterId],
      foreignColumns: [labTestParameters.id],
      name: "lab_test_parameter_values_parameter_id_fkey",
    }).onDelete("cascade"),
  })
);

// Métricas: sem limite por teste, com indicação se "maior é melhor".
export const labTestMetrics = pgTable(
  "lab_test_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    name: text("name").notNull(),
    unit: text("unit"),
    type: metricTypeEnum("type").notNull().default("number"),
    higherIsBetter: boolean("higher_is_better").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testIdIdx: index("lab_test_metrics_test_id_idx").on(table.testId),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "lab_test_metrics_test_id_fkey",
    }).onDelete("cascade"),
  })
);

export const labTestResults = pgTable(
  "lab_test_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    metricId: uuid("metric_id").notNull(),
    // Guardado como texto para caber number/text/boolean; parse fica na
    // aplicação, usando lab_test_metrics.type como referência.
    value: text("value").notNull(),
  },
  (table) => ({
    executionIdIdx: index("lab_test_results_execution_id_idx").on(
      table.executionId
    ),
    metricIdIdx: index("lab_test_results_metric_id_idx").on(table.metricId),
    executionMetricUnique: unique("lab_test_results_unique").on(
      table.executionId,
      table.metricId
    ),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_results_execution_id_fkey",
    }).onDelete("cascade"),
    metricFk: foreignKey({
      columns: [table.metricId],
      foreignColumns: [labTestMetrics.id],
      name: "lab_test_results_metric_id_fkey",
    }).onDelete("cascade"),
  })
);

// Anexos: pertencem a um teste inteiro OU a uma execução específica (nunca nenhum dos dois).
export const labTestAttachments = pgTable(
  "lab_test_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id"),
    executionId: uuid("execution_id"),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull(), // "image" | "video" | "log" | "spreadsheet" | "document"
    uploadedBy: text("uploaded_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testIdIdx: index("lab_test_attachments_test_id_idx").on(table.testId),
    executionIdIdx: index("lab_test_attachments_execution_id_idx").on(
      table.executionId
    ),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "lab_test_attachments_test_id_fkey",
    }).onDelete("cascade"),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_attachments_execution_id_fkey",
    }).onDelete("cascade"),
    uploadedByFk: foreignKey({
      columns: [table.uploadedBy],
      foreignColumns: [users.id],
      name: "lab_test_attachments_uploaded_by_fkey",
    }).onDelete("restrict"),
    ownerCheck: check(
      "lab_test_attachments_owner_check",
      sql`${table.testId} IS NOT NULL OR ${table.executionId} IS NOT NULL`
    ),
  })
);

export type LabTestRow = typeof labTests.$inferSelect;
export type NewLabTestRow = typeof labTests.$inferInsert;
export type LabTestExecutionRow = typeof labTestExecutions.$inferSelect;
export type NewLabTestExecutionRow = typeof labTestExecutions.$inferInsert;
export type LabTestParameterRow = typeof labTestParameters.$inferSelect;
export type LabTestMetricRow = typeof labTestMetrics.$inferSelect;
export type LabTestResultRow = typeof labTestResults.$inferSelect;
export type LabTestAttachmentRow = typeof labTestAttachments.$inferSelect;
