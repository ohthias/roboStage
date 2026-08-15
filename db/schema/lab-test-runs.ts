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
  jsonb,
} from "drizzle-orm/pg-core";
import { labTests, labTestExecutions } from "./lab-test-core";
import { failureSeverityEnum } from "./enums";

// Catálogo de missões oficiais por temporada da FLL.
export const fllMissions = pgTable(
  "fll_missions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    season: text("season").notNull(),
    category: text("category"),
    definition: jsonb("definition"),
    maxScore: integer("max_score").notNull(),
  },
  (table) => ({
    seasonIdx: index("fll_missions_season_idx").on(table.season),
    codeSeasonUnique: unique("fll_missions_code_season_unique").on(
      table.code,
      table.season
    ),
  })
);

// Estratégias e suas versões, agrupadas por teste.
export const strategies = pgTable(
  "strategies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    testIdIdx: index("strategies_test_id_idx").on(table.testId),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "strategies_test_id_fkey",
    }).onDelete("cascade"),
  })
);

export const strategyVersions = pgTable(
  "strategy_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    strategyId: uuid("strategy_id").notNull(),
    versionLabel: text("version_label").notNull(), // ex: "v1", "v2.1"
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    strategyIdIdx: index("strategy_versions_strategy_id_idx").on(
      table.strategyId
    ),
    strategyFk: foreignKey({
      columns: [table.strategyId],
      foreignColumns: [strategies.id],
      name: "strategy_versions_strategy_id_fkey",
    }).onDelete("cascade"),
  })
);

// Detalhe de uma execução do tipo Run — relação 1:1 com lab_test_executions.
export const labTestRunDetails = pgTable(
  "lab_test_run_details",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    strategyVersionId: uuid("strategy_version_id"),
    season: text("season").notNull(),
    arena: text("arena"),
    totalScore: integer("total_score"),
    finalTimeSeconds: numeric("final_time_seconds", {
      precision: 10,
      scale: 2,
    }),
    penalties: integer("penalties").default(0),
    finalResult: text("final_result"),
  },
  (table) => ({
    executionIdUnique: unique(
      "lab_test_run_details_execution_unique"
    ).on(table.executionId),
    seasonIdx: index("lab_test_run_details_season_idx").on(table.season),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_run_details_execution_id_fkey",
    }).onDelete("cascade"),
    strategyVersionFk: foreignKey({
      columns: [table.strategyVersionId],
      foreignColumns: [strategyVersions.id],
      name: "lab_test_run_details_strategy_version_id_fkey",
    }).onDelete("set null"),
  })
);

// Pontuação obtida em cada missão, por execução.
export const labTestMissionResults = pgTable(
  "lab_test_mission_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    missionId: uuid("mission_id").notNull(),
    scoreObtained: integer("score_obtained").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    notes: text("notes"),
  },
  (table) => ({
    executionIdIdx: index("lab_test_mission_results_execution_id_idx").on(
      table.executionId
    ),
    missionIdIdx: index("lab_test_mission_results_mission_id_idx").on(
      table.missionId
    ),
    executionMissionUnique: unique(
      "lab_test_mission_results_unique"
    ).on(table.executionId, table.missionId),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_mission_results_execution_id_fkey",
    }).onDelete("cascade"),
    missionFk: foreignKey({
      columns: [table.missionId],
      foreignColumns: [fllMissions.id],
      name: "lab_test_mission_results_mission_id_fkey",
    }).onDelete("restrict"),
  })
);

// Plano base de missões para um teste do tipo Run.
export const labTestRunPlan = pgTable(
  "lab_test_run_plan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull(),
    missionId: uuid("mission_id").notNull(),
    orderIndex: integer("order_index").notNull(),
    fullAttempt: boolean("full_attempt").notNull().default(true),
    notes: text("notes"),
  },
  (table) => ({
    testMissionUnique: unique("lab_test_run_plan_unique").on(
      table.testId,
      table.missionId
    ),
    testFk: foreignKey({
      columns: [table.testId],
      foreignColumns: [labTests.id],
      name: "lab_test_run_plan_test_id_fkey",
    }).onDelete("cascade"),
    missionFk: foreignKey({
      columns: [table.missionId],
      foreignColumns: [fllMissions.id],
      name: "lab_test_run_plan_mission_id_fkey",
    }).onDelete("restrict"),
  })
);

// Falhas ocorridas durante uma execução — base para as análises de padrões.
export const labTestFailures = pgTable(
  "lab_test_failures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    severity: failureSeverityEnum("severity").notNull().default("media"),
    missionId: uuid("mission_id"), // opcional
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    executionIdIdx: index("lab_test_failures_execution_id_idx").on(
      table.executionId
    ),
    missionIdIdx: index("lab_test_failures_mission_id_idx").on(
      table.missionId
    ),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_failures_execution_id_fkey",
    }).onDelete("cascade"),
    missionFk: foreignKey({
      columns: [table.missionId],
      foreignColumns: [fllMissions.id],
      name: "lab_test_failures_mission_id_fkey",
    }).onDelete("set null"),
  })
);

export type FllMissionRow = typeof fllMissions.$inferSelect;
export type StrategyRow = typeof strategies.$inferSelect;
export type StrategyVersionRow = typeof strategyVersions.$inferSelect;
export type LabTestRunDetailsRow = typeof labTestRunDetails.$inferSelect;
export type LabTestMissionResultRow = typeof labTestMissionResults.$inferSelect;
export type LabTestFailureRow = typeof labTestFailures.$inferSelect;
export type LabTestRunPlanRow = typeof labTestRunPlan.$inferSelect;
