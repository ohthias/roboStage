/**
 * Matriz ÚNICA de permissões de equipe (sem dependências de servidor: usada
 * tanto pelas Server Actions — que são a barreira real — quanto pela UI, que
 * só a consulta para esconder/desabilitar controles).
 *
 * Regras de negócio:
 *
 *  - Membros (competidor, colaborador): acesso a tudo da equipe — veem e criam
 *    Kanbans, quadros do ThinkLab e LabTests, e editam o conteúdo. Não
 *    administram a equipe.
 *  - Técnico (owner) e Mentor: tudo que um membro faz, mais administrar a
 *    equipe — editar nome/foto/perfil (Organização do Clerk), convidar,
 *    remover e trocar cargos de membros — e criar os marcos (milestones) da
 *    equipe.
 *  - Só o Técnico concede/retira o cargo de Técnico e exclui a equipe (ação
 *    irreversível). Sempre sobra ao menos um Técnico.
 */

export type TeamRole = "owner" | "mentor" | "competidor" | "colaborador";

export const TEAM_ROLES: readonly TeamRole[] = [
  "owner",
  "mentor",
  "competidor",
  "colaborador",
];

/** Cargos com poderes de administração. */
export const STAFF_ROLES: readonly TeamRole[] = ["owner", "mentor"];

export type TeamCapability =
  /** Criar e editar Kanbans, ThinkLabs e LabTests da equipe. */
  | "tool.create"
  /** Excluir qualquer Kanban/ThinkLab/LabTest (os membros excluem só o que criaram). */
  | "tool.delete.any"
  /** Criar, editar e excluir milestones (marcos) da equipe. */
  | "milestone.manage"
  /** Nome, foto, temporada e demais dados da equipe (Organização do Clerk). */
  | "team.edit"
  /** Convidar, remover e trocar cargo de membros. */
  | "team.members.manage"
  /** Excluir a equipe e a Organização do Clerk. */
  | "team.delete";

const ALL: readonly TeamRole[] = TEAM_ROLES;

const MATRIX: Record<TeamCapability, readonly TeamRole[]> = {
  "tool.create": ALL,
  "tool.delete.any": STAFF_ROLES,
  "milestone.manage": STAFF_ROLES,
  "team.edit": STAFF_ROLES,
  "team.members.manage": STAFF_ROLES,
  "team.delete": ["owner"],
};

export const CAPABILITY_DENIED_MESSAGE: Record<TeamCapability, string> = {
  "tool.create": "Seu cargo nesta equipe não permite criar este recurso.",
  "tool.delete.any":
    "Só técnicos e mentores podem excluir recursos criados por outras pessoas.",
  "milestone.manage": "Só técnicos e mentores podem criar e editar os marcos da equipe.",
  "team.edit": "Só técnicos e mentores podem editar a equipe.",
  "team.members.manage": "Só técnicos e mentores podem gerenciar os membros da equipe.",
  "team.delete": "Só um técnico pode excluir a equipe.",
};

export function roleCan(role: TeamRole, capability: TeamCapability): boolean {
  return MATRIX[capability].includes(role);
}

export function isStaffRole(role: TeamRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function isTeamRole(value: unknown): value is TeamRole {
  return typeof value === "string" && (TEAM_ROLES as readonly string[]).includes(value);
}

export const ROLE_META: Record<
  TeamRole,
  { label: string; description: string; badgeClass: string }
> = {
  owner: {
    label: "Técnico",
    description: "Administra a equipe, os membros e os marcos. Único que exclui a equipe.",
    badgeClass: "badge-primary",
  },
  mentor: {
    label: "Mentor",
    description: "Administra a equipe, os membros e os marcos.",
    badgeClass: "badge-secondary",
  },
  competidor: {
    label: "Competidor",
    description: "Acesso a todos os recursos da equipe.",
    badgeClass: "badge-ghost",
  },
  colaborador: {
    label: "Colaborador",
    description: "Acesso a todos os recursos da equipe.",
    badgeClass: "badge-ghost",
  },
};

export function roleLabel(role: string): string {
  return isTeamRole(role) ? ROLE_META[role].label : role;
}

/**
 * Cargos que `actor` pode atribuir. Mentor não concede o cargo de Técnico —
 * isso evitaria que alguém se promovesse acima de quem o convidou.
 */
export function assignableRolesFor(actor: TeamRole): TeamRole[] {
  if (!roleCan(actor, "team.members.manage")) return [];
  return actor === "owner" ? [...TEAM_ROLES] : TEAM_ROLES.filter((r) => r !== "owner");
}

/**
 * Valida (de forma pura) se `actor` pode alterar o cargo de `target` para
 * `next`, ou removê-lo (`next === null`). Devolve a mensagem de erro, ou null
 * quando permitido. As Server Actions ainda checam "último técnico" no banco.
 */
export function memberChangeError(
  actor: TeamRole,
  target: TeamRole,
  next: TeamRole | null,
): string | null {
  if (!roleCan(actor, "team.members.manage")) {
    return CAPABILITY_DENIED_MESSAGE["team.members.manage"];
  }
  if (target === "owner" && actor !== "owner") {
    return "Só um técnico pode alterar ou remover outro técnico.";
  }
  if (next === "owner" && actor !== "owner") {
    return "Só um técnico pode conceder o cargo de técnico.";
  }
  return null;
}

/** Excluir um recurso: criador sempre pode; os demais só a equipe técnica. */
export function canDeleteResource(
  role: TeamRole,
  creatorId: string | null,
  userId: string,
): boolean {
  return creatorId === userId || roleCan(role, "tool.delete.any");
}

// ---------------------------------------------------------------------------
// Mapeamento com a Organização do Clerk
// ---------------------------------------------------------------------------

/**
 * O Clerk só conhece `org:admin` e `org:member`, e as operações de
 * edição da organização (nome, logo, perfil) exigem `org:admin`. Por isso a
 * equipe técnica (técnico + mentor) é `org:admin` no Clerk e os demais
 * `org:member`; o cargo fino continua sendo do Stagebook (`team_members.role`).
 */
export function clerkRoleFor(role: TeamRole): "org:admin" | "org:member" {
  return isStaffRole(role) ? "org:admin" : "org:member";
}
