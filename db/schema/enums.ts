import { pgEnum } from "drizzle-orm/pg-core";

// Perfil do usuário dentro do universo de robótica.
export const personaTypeEnum = pgEnum("persona_type", [
  "competidor",
  "mentor_tecnico",
  "entusiasta",
  "organizador",
]);

// Relação do usuário com uma liga/competição: já participa ou só tem interesse.
export const leagueRelationEnum = pgEnum("league_relation_type", [
  "participante",
  "interessado",
]);

export const teamRoleEnum = pgEnum("team_role", [
  "owner",
  "mentor",
  "competidor",
  "colaborador",
]);

export const testTypeEnum = pgEnum("lab_test_type", [
  "run",
  "calibrabot",
  "personalizado",
]);

export const testStatusEnum = pgEnum("lab_test_status", [
  "rascunho",
  "ativo",
  "arquivado",
]);

export const parameterTypeEnum = pgEnum("parameter_type", [
  "number",
  "text",
  "boolean",
  "select",
]);

export const metricTypeEnum = pgEnum("metric_type", [
  "number",
  "text",
  "boolean",
]);

export const failureSeverityEnum = pgEnum("failure_severity", [
  "baixa",
  "media",
  "alta",
  "critica",
]);

export const calibrationTypeEnum = pgEnum("calibration_type", [
  "sensor",
  "motor",
  "servo",
  "pid",
  "giroscopio",
  "sensor_cor",
  "sensor_distancia",
  "linha",
  "curvas",
  "outro",
]);

export const calibrationResultEnum = pgEnum("calibration_result", [
  "aprovado",
  "necessita_ajuste",
  "reprovado",
]);
