/** Tipos de conta (perfil no universo de robótica). Sem dependências de servidor. */
export type PersonaType = "competidor" | "mentor_tecnico" | "entusiasta" | "organizador";

export const PERSONA_TYPES: readonly PersonaType[] = [
  "competidor",
  "mentor_tecnico",
  "entusiasta",
  "organizador",
];

export const PERSONA_META: Record<PersonaType, { label: string; description: string }> = {
  competidor: {
    label: "Competidor",
    description: "Participa de equipes já existentes, por convite. Não cria equipes.",
  },
  mentor_tecnico: {
    label: "Mentor técnico",
    description: "Orienta equipes e pode criar espaços de equipe como técnico responsável.",
  },
  entusiasta: {
    label: "Entusiasta",
    description: "Acompanha e estuda robótica. Pode criar equipes e ser convidado para outras.",
  },
  organizador: {
    label: "Organizador",
    description: "Organiza eventos e competições. Pode criar equipes.",
  },
};

export function isPersonaType(value: unknown): value is PersonaType {
  return typeof value === "string" && (PERSONA_TYPES as readonly string[]).includes(value);
}

/** Regra de produto: só quem NÃO é competidor cria um espaço de equipe. */
export function personaCanCreateTeam(persona: string | null | undefined): boolean {
  return isPersonaType(persona) && persona !== "competidor";
}
