"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { teams, teamMembers, users } from "@/db/schema";
import { requireStagebookAccess, StagebookAuthError, type TeamRole } from "@/utils/stagebook/scope";
import { cleanText } from "@/utils/stagebook/validation";

const PATH = "/dashboard/team";

// Papel atribuível via convite/edição nesta tela — não inclui "owner", que só
// existe um por equipe e é definido na criação (lib/stagebook/actions/teams.ts).
export type AssignableRole = "mentor" | "competidor" | "colaborador";
const ASSIGNABLE_ROLES: AssignableRole[] = ["mentor", "competidor", "colaborador"];

async function requireTeamOwner(teamId: string) {
  const scope = await requireStagebookAccess(teamId);
  if (scope.type !== "team") {
    throw new StagebookAuthError("Esta ação só existe dentro do espaço de uma equipe.");
  }
  if (scope.role !== "owner") {
    throw new StagebookAuthError(
      "Só o técnico responsável pela equipe (owner) pode gerenciar membros."
    );
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { id: true, clerkOrgId: true, name: true },
  });
  if (!team?.clerkOrgId) {
    throw new StagebookAuthError("Esta equipe não tem uma Organização do Clerk vinculada.");
  }

  return { scope, team };
}

/** Papel do usuário atual dentro de uma equipe específica (ou null se não for membro). */
export async function getMyRoleInTeam(teamId: string): Promise<TeamRole | null> {
  const scope = await requireStagebookAccess(teamId);
  return scope.type === "team" ? scope.role : null;
}

// ---------------------------------------------------------------------------
// Convites (Clerk Organization Invitations)
// ---------------------------------------------------------------------------

/**
 * Verifica se um e-mail já pertence a uma conta cadastrada no Clerk — chamada
 * pela tela de convite pra dar feedback antes de enviar ("já tem conta" vs
 * "vai precisar criar conta"). Isso é só informativo: convidar por e-mail
 * funciona nos dois casos (o Organization Invitation do Clerk cobre tanto
 * quem já tem conta quanto quem ainda vai criar uma ao aceitar), então essa
 * checagem nunca bloqueia o convite — só mostra o que vai acontecer.
 */
export async function checkEmailRegisteredInClerk(teamId: string, email: string) {
  await requireTeamOwner(teamId);

  const cleanEmail = cleanText(email, { maxLength: 200 }).toLowerCase();
  if (!cleanEmail.includes("@")) {
    return { valid: false as const, registered: false, name: null };
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserList({ emailAddress: [cleanEmail] });
  const match = data[0];

  return {
    valid: true as const,
    registered: data.length > 0,
    name: match ? [match.firstName, match.lastName].filter(Boolean).join(" ") || null : null,
  };
}

export async function inviteTeamMember(teamId: string, email: string, role: AssignableRole) {
  const { scope, team } = await requireTeamOwner(teamId);

  const cleanEmail = cleanText(email, { maxLength: 200 }).toLowerCase();
  if (!cleanEmail.includes("@")) {
    throw new StagebookAuthError("Informe um e-mail válido.");
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new StagebookAuthError("Papel inválido.");
  }

  const client = await clerkClient();

  // O e-mail real de convite (com link de aceite) é enviado pelo próprio
  // Clerk — não escrevemos nada na nossa tabela aqui. Quando a pessoa aceitar,
  // o webhook organizationMembership.created cria a linha em team_members,
  // lendo o papel do Stagebook de volta do publicMetadata do convite.
  await client.organizations.createOrganizationInvitation({
    organizationId: team.clerkOrgId!,
    inviterUserId: scope.userId,
    emailAddress: cleanEmail,
    role: "org:member",
    publicMetadata: { stagebookRole: role },
  });

  revalidatePath(PATH, "layout");
}

export async function listPendingInvitations(teamId: string) {
  const { team } = await requireTeamOwner(teamId);
  const client = await clerkClient();

  const { data } = await client.organizations.getOrganizationInvitationList({
    organizationId: team.clerkOrgId!,
    // Sem "status" explícito: a API já retorna só os pendentes por padrão.
  });

  return data.map((invitation) => ({
    id: invitation.id,
    emailAddress: invitation.emailAddress,
    role:
      ((invitation.publicMetadata as { stagebookRole?: AssignableRole } | undefined)?.stagebookRole) ??
      ("colaborador" as AssignableRole),
    createdAt: new Date(invitation.createdAt).toISOString(),
  }));
}

export async function revokeInvitation(teamId: string, invitationId: string) {
  const { scope, team } = await requireTeamOwner(teamId);
  const client = await clerkClient();

  await client.organizations.revokeOrganizationInvitation({
    organizationId: team.clerkOrgId!,
    invitationId,
    requestingUserId: scope.userId,
  });

  revalidatePath(PATH, "layout");
}

// ---------------------------------------------------------------------------
// Membros já aceitos
// ---------------------------------------------------------------------------

export async function listTeamMembersDetailed(teamId: string) {
  return db
    .select({
      userId: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(teamMembers.joinedAt);
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: AssignableRole) {
  await requireTeamOwner(teamId);

  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new StagebookAuthError("Papel inválido.");
  }

  const target = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });
  if (!target) throw new StagebookAuthError("Este usuário não é membro da equipe.");
  if (target.role === "owner") {
    throw new StagebookAuthError("O técnico responsável (owner) não pode ter o papel alterado por aqui.");
  }

  // Clerk só guarda admin/member — o papel fino (mentor/competidor/colaborador)
  // é conceito do Stagebook, então atualizamos só o nosso banco. A Organization
  // no Clerk permanece com esse usuário como "member" (org:member).
  await db
    .update(teamMembers)
    .set({ role })
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  revalidatePath(PATH, "layout");
}

export async function removeTeamMember(teamId: string, userId: string) {
  const { scope, team } = await requireTeamOwner(teamId);

  if (userId === scope.userId) {
    throw new StagebookAuthError(
      "Você não pode remover a si mesmo. Para sair da equipe, use a Organização no Clerk."
    );
  }

  const target = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });
  if (target?.role === "owner") {
    throw new StagebookAuthError("O técnico responsável (owner) não pode ser removido.");
  }

  const client = await clerkClient();
  // Clerk é a fonte de verdade da membership — remove lá primeiro.
  await client.organizations.deleteOrganizationMembership({
    organizationId: team.clerkOrgId!,
    userId,
  });

  // E também aqui, na hora, pra não esperar o round-trip do webhook.
  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  revalidatePath(PATH, "layout");
}
