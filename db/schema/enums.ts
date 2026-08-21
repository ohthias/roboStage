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
