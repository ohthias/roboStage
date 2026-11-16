"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { db } from "@/db/client";
import { teams, teamMembers, users } from "@/db/schema";
import {
  requireStagebookAccess,
  resolveStagebookScope,
  StagebookAuthError,
} from "@/utils/stagebook/scope";
import { requireCapability, requireTeamScope } from "@/utils/stagebook/permissions";
import { runAction, type ActionResult } from "@/utils/stagebook/action-result";
import {
  assignableRolesFor,
  isStaffRole,
  isTeamRole,
  memberChangeError,
  type TeamCapability,
  type TeamRole,
} from "@/utils/stagebook/team-permissions";
import {
  ValidationError,
  optionalText,
  requireEmail,
  requireOneOf,
  requireText,
  requireUuid,
  cleanText,
} from "@/utils/stagebook/validation";
import { switchStagebookScope } from "@/utils/stagebook/actions/teams";
import { recordTeamActivity } from "@/utils/stagebook/team-activity";
import { clerkRoleKeyFor, forgetClerkRoleKeys } from "@/utils/stagebook/clerk-org-roles";
import { emailOptedOutOfTeamInvites } from "@/utils/stagebook/preferences-core";

const PATH = "/dashboard/team";

/** Cargo atribuível pela tela de membros (o "Técnico" é o `owner` do banco). */
export type AssignableRole = TeamRole;

function refresh() {
  revalidatePath(PATH, "layout");
}

/**
 * Erros da API do Clerk viravam "Não foi possível concluir a ação" (o
 * `runAction` só repassa ValidationError/StagebookAuthError), escondendo o
 * motivo real de um convite falhar. Traduz os casos conhecidos e repassa a
 * mensagem do Clerk nos demais.
 */
/** O Clerk recusou porque o papel (`role`) não existe nesta Organização/instância. */
function isRoleNotFound(error: unknown): boolean {
  if (!isClerkAPIResponseError(error)) return false;
  return error.errors.some((e) => {
    const text = `${e.code} ${e.message} ${e.longMessage ?? ""}`.toLowerCase();
    return text.includes("role") && text.includes("not found");
  });
}

function clerkFailure(error: unknown, fallback: string): Error {
  if (!isClerkAPIResponseError(error)) return error instanceof Error ? error : new Error(String(error));
  const first = error.errors[0];
  const code = first?.code ?? "";
  console.error("[stagebook] Clerk recusou a operação:", code, first?.longMessage ?? first?.message);

  if (isRoleNotFound(error)) {
    return new ValidationError(
      "O Clerk não encontrou o papel de Organização usado pela equipe. Confira os papéis em Organizations → Roles no painel do Clerk (o RoboStage procura org:admin e org:member, ou o papel de criador e o papel padrão do role set).",
    );
  }
  if (code.includes("quota") || code.includes("limit")) {
    return new ValidationError(
      "A equipe atingiu o limite de membros/convites da Organização no Clerk. Remova convites pendentes ou aumente o limite no painel do Clerk.",
    );
  }
  if (code === "duplicate_record" || code.includes("already")) {
    return new ValidationError("Esta pessoa já faz parte da equipe ou já tem um convite pendente.");
  }
  if (error.status === 429) {
    return new ValidationError("Muitas tentativas seguidas. Aguarde alguns segundos e tente de novo.");
  }
  const detail = first?.longMessage || first?.message;
  return new ValidationError(detail ? `${fallback} (Clerk: ${detail})` : fallback);
}

/**
 * Resolve a equipe e exige a capacidade pedida. Toda ação administrativa
 * passa por aqui: a UI esconde botões, mas esta é a barreira de verdade.
 */
async function requireTeamCapability(teamId: string, capability: TeamCapability) {
  const scope = await requireStagebookAccess(requireUuid(teamId, "equipe"));
  requireTeamScope(scope);
  requireCapability(scope, capability);

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, scope.teamId),
    columns: { id: true, clerkOrgId: true, name: true },
  });
  if (!team) throw new StagebookAuthError("Equipe não encontrada.");
  if (!team.clerkOrgId) {
    throw new StagebookAuthError("Esta equipe não tem uma Organização do Clerk vinculada.");
  }

  return { scope, team: { ...team, clerkOrgId: team.clerkOrgId } };
}

/** Papel do usuário atual dentro de uma equipe específica (ou null se não for membro). */
export async function getMyRoleInTeam(teamId: string): Promise<TeamRole | null> {
  const scope = await requireStagebookAccess(teamId);
  return scope.type === "team" ? scope.role : null;
}

async function countOwners(teamId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, "owner")));
  return row?.value ?? 0;
}

// ---------------------------------------------------------------------------
// Convites (Clerk Organization Invitations)
// ---------------------------------------------------------------------------

/**
 * Informativo: diz se o e-mail já tem conta antes de enviar o convite. Nunca
 * bloqueia o convite (o Clerk cobre os dois casos) — só mostra o que vai
 * acontecer. Restrito à equipe técnica para não virar um oráculo de contas.
 */
export async function checkEmailRegisteredInClerk(
  teamId: string,
  email: string,
): Promise<ActionResult<{ valid: boolean; registered: boolean; name: string | null }>> {
  return runAction(async () => {
    await requireTeamCapability(teamId, "team.members.manage");

    let cleanEmail: string;
    try {
      cleanEmail = requireEmail(email);
    } catch {
      return { valid: false, registered: false, name: null };
    }

    const client = await clerkClient();
    const { data } = await client.users.getUserList({ emailAddress: [cleanEmail] });
    const match = data[0];

    return {
      valid: true,
      registered: data.length > 0,
      name: match ? [match.firstName, match.lastName].filter(Boolean).join(" ") || null : null,
    };
  });
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: AssignableRole,
): Promise<ActionResult> {
  return runAction(async () => {
    const { scope, team } = await requireTeamCapability(teamId, "team.members.manage");

    const cleanEmail = requireEmail(email);
    const nextRole = requireOneOf(role, assignableRolesFor(scope.role), "Cargo");

    // Já é membro? (compara pelo e-mail espelhado do Clerk em `users`)
    const [existing] = await db
      .select({ userId: teamMembers.userId })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(and(eq(teamMembers.teamId, team.id), sql`lower(${users.email}) = ${cleanEmail}`))
      .limit(1);
    if (existing) throw new ValidationError("Esta pessoa já faz parte da equipe.");

    // Preferência de privacidade: quem desativou convites não pode ser adicionado.
    if (await emailOptedOutOfTeamInvites(cleanEmail)) {
      throw new ValidationError("Esta pessoa não está aceitando convites para equipes.");
    }

    const client = await clerkClient();

    const { data: invitations } = await client.organizations
      .getOrganizationInvitationList({ organizationId: team.clerkOrgId, status: ["pending"], limit: 100 })
      .catch((error: unknown) => {
        throw clerkFailure(error, "Não foi possível consultar os convites da equipe.");
      });
    const pending = invitations.filter((inv) => inv.status === "pending");
    if (pending.some((inv) => inv.emailAddress.toLowerCase() === cleanEmail)) {
      throw new ValidationError("Já existe um convite pendente para este e-mail.");
    }

    // O e-mail de convite é enviado pelo Clerk. Quando a pessoa aceitar, o
    // webhook organizationMembership.created cria a linha em team_members
    // lendo o cargo de `publicMetadata.stagebookRole`. Equipe técnica entra
    // como admin no Clerk (necessário para editar a Organização).
    const invitation = {
      organizationId: team.clerkOrgId,
      emailAddress: cleanEmail,
      // Papel real desta Organização no Clerk (nem toda instância tem
      // org:admin/org:member — ver clerk-org-roles.ts).
      role: await clerkRoleKeyFor(team.clerkOrgId, nextRole),
      publicMetadata: { stagebookRole: nextRole },
    };
    try {
      try {
        await client.organizations.createOrganizationInvitation({
          ...invitation,
          inviterUserId: scope.userId,
        });
      } catch (error) {
        if (!isRoleNotFound(error)) throw error;
        // Papéis em cache desatualizados (mudaram no painel do Clerk): relê e tenta de novo.
        forgetClerkRoleKeys(team.clerkOrgId);
        invitation.role = await clerkRoleKeyFor(team.clerkOrgId, nextRole);
        await client.organizations.createOrganizationInvitation({
          ...invitation,
          inviterUserId: scope.userId,
        });
      }
    } catch (error) {
      // O Clerk exige que `inviterUserId` seja admin da Organização. Se o
      // cargo no RoboStage e no Clerk divergirem (ex.: mentor que entrou como
      // org:member), o convite era recusado. A permissão já foi checada acima
      // (`team.members.manage`), então reenviamos sem o convidante.
      const forbidden =
        isClerkAPIResponseError(error) && (error.status === 403 || error.status === 422) &&
        !isRoleNotFound(error) &&
        !error.errors.some((e) => e.code === "duplicate_record" || e.code.includes("quota"));
      if (!forbidden) throw clerkFailure(error, "Não foi possível enviar o convite.");
      try {
        await client.organizations.createOrganizationInvitation(invitation);
      } catch (retryError) {
        throw clerkFailure(retryError, "Não foi possível enviar o convite.");
      }
    }

    refresh();
  });
}

export type PendingInvitation = {
  id: string;
  emailAddress: string;
  role: AssignableRole;
  createdAt: string;
};

export async function listPendingInvitations(teamId: string): Promise<PendingInvitation[]> {
  const { team } = await requireTeamCapability(teamId, "team.members.manage");
  const client = await clerkClient();

  // Sem `status`, o Clerk devolve só os 10 convites mais recentes de QUALQUER
  // status — convites pendentes mais antigos sumiam da lista.
  const { data } = await client.organizations.getOrganizationInvitationList({
    organizationId: team.clerkOrgId,
    status: ["pending"],
    limit: 100,
  });

  return data
    .filter((invitation) => invitation.status === "pending")
    .map((invitation) => {
      const stored = (invitation.publicMetadata as { stagebookRole?: string } | undefined)
        ?.stagebookRole;
      const role: TeamRole =
        stored === "tecnico" ? "owner" : isTeamRole(stored) ? stored : "colaborador";
      return {
        id: invitation.id,
        emailAddress: invitation.emailAddress,
        role,
        createdAt: new Date(invitation.createdAt).toISOString(),
      };
    });
}

export async function revokeInvitation(teamId: string, invitationId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { scope, team } = await requireTeamCapability(teamId, "team.members.manage");
    const id = requireText(invitationId, "o convite", { maxLength: 100 });

    const client = await clerkClient();
    try {
      await client.organizations.revokeOrganizationInvitation({
        organizationId: team.clerkOrgId,
        invitationId: id,
        requestingUserId: scope.userId,
      });
    } catch (error) {
      throw clerkFailure(error, "Não foi possível cancelar o convite.");
    }

    refresh();
  });
}

// ---------------------------------------------------------------------------
// Membros já aceitos
// ---------------------------------------------------------------------------

export async function listTeamMembersDetailed(teamId: string) {
  const scope = await requireStagebookAccess(teamId);
  const canSeeEmail = scope.type === "team" && isStaffRole(scope.role);

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(teamMembers.joinedAt);

  // E-mail é dado pessoal: só a equipe técnica enxerga.
  return rows.map((row) => ({ ...row, email: canSeeEmail ? row.email : null }));
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: AssignableRole,
): Promise<ActionResult> {
  return runAction(async () => {
    const { scope, team } = await requireTeamCapability(teamId, "team.members.manage");
    const targetUserId = requireText(userId, "o membro", { maxLength: 100 });
    const nextRole = requireOneOf(role, assignableRolesFor(scope.role), "Cargo");

    const target = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)),
    });
    if (!target) throw new ValidationError("Este usuário não é membro da equipe.");
    const targetRole: TeamRole = isTeamRole(target.role) ? target.role : "colaborador";

    const denied = memberChangeError(scope.role, targetRole, nextRole);
    if (denied) throw new StagebookAuthError(denied);
    if (targetRole === nextRole) return;

    // Sempre sobra ao menos um técnico: sem ele ninguém exclui a equipe nem
    // concede o cargo de técnico.
    if (targetRole === "owner" && (await countOwners(team.id)) <= 1) {
      throw new ValidationError(
        "A equipe precisa ter ao menos um técnico. Promova outra pessoa a técnico antes de alterar este cargo.",
      );
    }

    // Banco primeiro: o webhook do Clerk que chega em seguida já enxerga o novo
    // cargo. Se o Clerk falhar, desfazemos para não deixar os dois divergentes.
    await db
      .update(teamMembers)
      .set({ role: nextRole })
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)));

    try {
      const client = await clerkClient();
      await client.organizations.updateOrganizationMembership({
        organizationId: team.clerkOrgId,
        userId: targetUserId,
        role: await clerkRoleKeyFor(team.clerkOrgId, nextRole),
      });
    } catch (error) {
      // 404: sem membership no Clerk (só no nosso banco) — o cargo local vale.
      if (isRoleNotFound(error)) forgetClerkRoleKeys(team.clerkOrgId);
      if (isRoleNotFound(error) || !(isClerkAPIResponseError(error) && error.status === 404)) {
        await db
          .update(teamMembers)
          .set({ role: targetRole })
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)));
        throw clerkFailure(error, "Não foi possível alterar o cargo.");
      }
    }

    const [targetUser] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);
    await recordTeamActivity({
      teamId: team.id,
      actorId: scope.userId,
      verb: "member.role_changed",
      entityType: "member",
      data: { userId: targetUserId, name: targetUser?.name ?? null, from: targetRole, to: nextRole },
      aggregate: false,
    });
    refresh();
  });
}

export async function removeTeamMember(teamId: string, userId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { scope, team } = await requireTeamCapability(teamId, "team.members.manage");
    const targetUserId = requireText(userId, "o membro", { maxLength: 100 });

    if (targetUserId === scope.userId) {
      throw new ValidationError(
        "Você não pode remover a si mesmo. Para sair da equipe, use a Organização no Clerk.",
      );
    }

    const target = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)),
    });
    if (!target) throw new ValidationError("Este usuário não é membro da equipe.");

    const denied = memberChangeError(
      scope.role,
      isTeamRole(target.role) ? target.role : "colaborador",
      null,
    );
    if (denied) throw new StagebookAuthError(denied);

    // Clerk é a fonte de verdade da membership — remove lá primeiro.
    const client = await clerkClient();
    try {
      await client.organizations.deleteOrganizationMembership({
        organizationId: team.clerkOrgId,
        userId: targetUserId,
      });
    } catch (error) {
      // 404: a pessoa só existe no nosso banco (membership do Clerk já
      // removida ou nunca criada) — segue e limpa a linha local.
      if (!(isClerkAPIResponseError(error) && error.status === 404)) {
        throw clerkFailure(error, "Não foi possível remover o membro.");
      }
    }

    // E aqui na hora, para não esperar o round-trip do webhook.
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)));

    refresh();
  });
}

// ---------------------------------------------------------------------------
// Configurações da equipe (nome, foto, perfil, exclusão)
// ---------------------------------------------------------------------------

/** Dados da equipe usados na página de configurações. Técnico e mentor. */
export async function getTeamSettingsInfo(teamId: string) {
  const { scope, team } = await requireTeamCapability(teamId, "team.edit");
  const client = await clerkClient();
  const organization = await client.organizations.getOrganization({
    organizationId: team.clerkOrgId,
  });

  const [profile] = await db
    .select({ season: teams.season, organizationName: teams.organizationName })
    .from(teams)
    .where(eq(teams.id, team.id))
    .limit(1);

  return {
    id: team.id,
    name: team.name,
    season: profile?.season ?? null,
    organizationName: profile?.organizationName ?? null,
    clerkOrgId: team.clerkOrgId,
    logoUrl: organization.imageUrl ?? null,
    hasCustomLogo: organization.hasImage,
    role: scope.role,
  };
}

/** Nome, temporada e organização/escola da equipe. Técnico e mentor. */
export async function updateTeamProfile(
  teamId: string,
  input: { name?: string; season?: string | null; organizationName?: string | null },
): Promise<ActionResult<{ name: string }>> {
  return runAction(async () => {
    const { team } = await requireTeamCapability(teamId, "team.edit");

    const patch: Partial<typeof teams.$inferInsert> = {};
    if (input.name !== undefined) patch.name = requireText(input.name, "o nome da equipe", { maxLength: 120 });
    if (input.season !== undefined) patch.season = optionalText(input.season, 40);
    if (input.organizationName !== undefined) {
      patch.organizationName = optionalText(input.organizationName, 120);
    }
    if (Object.keys(patch).length === 0) return { name: team.name };

    // Clerk é a fonte de verdade do nome — atualiza lá primeiro. O webhook
    // organization.updated também sincroniza `teams.name`, mas escrevemos aqui
    // para a UI não esperar o round-trip.
    if (patch.name && patch.name !== team.name) {
      const client = await clerkClient();
      await client.organizations.updateOrganization(team.clerkOrgId, { name: patch.name });
    }
    await db.update(teams).set(patch).where(eq(teams.id, team.id));

    refresh();
    return { name: patch.name ?? team.name };
  });
}

/** Mantido por compatibilidade: renomear é um caso de `updateTeamProfile`. */
export async function updateTeamName(
  teamId: string,
  name: string,
): Promise<ActionResult<{ name: string }>> {
  return updateTeamProfile(teamId, { name });
}

/**
 * Exclui a equipe de vez: apaga a Organization no Clerk (fonte de verdade)
 * e a linha local — a cascata das FKs cuida de páginas, boards, eventos e
 * tags. Irreversível, por isso SÓ o técnico (`team.delete`) e com o nome
 * digitado como confirmação. Se a equipe excluída for o espaço ativo de quem
 * chama, o scope volta para o pessoal.
 */
export async function deleteTeamOrganization(
  teamId: string,
  confirmedName: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const { team } = await requireTeamCapability(teamId, "team.delete");

    if (cleanText(confirmedName, { maxLength: 200 }) !== team.name) {
      throw new ValidationError("O nome digitado não confere com o nome da equipe.");
    }

    const active = await resolveStagebookScope();
    const client = await clerkClient();
    await client.organizations.deleteOrganization(team.clerkOrgId);
    await db.delete(teams).where(eq(teams.id, team.id));

    if (active.type === "team" && active.teamId === team.id) {
      await switchStagebookScope(null);
    }

    revalidatePath("/dashboard", "layout");
  });
}
