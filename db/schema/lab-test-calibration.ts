import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  foreignKey,
  unique,
} from "drizzle-orm/pg-core";
import { labTestExecutions } from "./lab-test-core";
import { calibrationTypeEnum, calibrationResultEnum } from "./enums";

// Detalhe de uma calibração — relação 1:1 com lab_test_executions.
// Equipamentos (robotModel, firmware, bateria, sensor, motor, porta) e
// resultado ficam aqui porque são campos estruturados e específicos do
// CalibraBot, diferente dos parâmetros livres da modalidade Personalizado.
export const labTestCalibrationDetails = pgTable(
  "lab_test_calibration_details",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    calibrationType: calibrationTypeEnum("calibration_type").notNull(),
    robotModel: text("robot_model"),
    firmware: text("firmware"),
    batteryUsed: text("battery_used"),
    sensorUsed: text("sensor_used"),
    motorUsed: text("motor_used"),
    portUsed: text("port_used"),
    idealValueFound: text("ideal_value_found"),
    configurationUsed: text("configuration_used"),
    result: calibrationResultEnum("result")
      .notNull()
      .default("necessita_ajuste"),
    finalNotes: text("final_notes"),
  },
  (table) => ({
    executionIdUnique: unique(
      "lab_test_calibration_details_execution_unique"
    ).on(table.executionId),
    calibrationTypeIdx: index(
      "lab_test_calibration_details_type_idx"
    ).on(table.calibrationType),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_calibration_details_execution_id_fkey",
    }).onDelete("cascade"),
  })
);

// Leituras: série de medições dentro de uma calibração (múltiplas por execução).
export const labTestReadings = pgTable(
  "lab_test_readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    value: text("value").notNull(),
    unit: text("unit"),
    notes: text("notes"),
  },
  (table) => ({
    executionIdIdx: index("lab_test_readings_execution_id_idx").on(
      table.executionId
    ),
    executionFk: foreignKey({
      columns: [table.executionId],
      foreignColumns: [labTestExecutions.id],
      name: "lab_test_readings_execution_id_fkey",
    }).onDelete("cascade"),
  })
);

export type LabTestCalibrationDetailsRow =
  typeof labTestCalibrationDetails.$inferSelect;
export type LabTestReadingRow = typeof labTestReadings.$inferSelect;
