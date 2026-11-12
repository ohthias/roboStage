import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { teamMembers, teams } from "@/db/schema";
import { mapClerkOrgRole } from "./clerk-roles";
import { recordTeamActivity } from "./team-activity";

/**
 * Rede de segurança para convites aceitos.
 *
 * Quem aceita um convite vira membro da Organização no Clerk, mas a linha em
 * `team_members` (que é o que o RoboStage consulta para permissões) só era
 * criada pelo webhook `organizationMembership.created`. Sem o webhook
 * configurado — ou com a entrega atrasada/falhando — a pessoa aceitava o
 * convite e nunca aparecia na equipe.
 *
 * Aqui lemos as memberships do usuário direto no Clerk e criamos as que
 * faltam. Idempotente (`onConflictDoNothing`) e tolerante a falhas: se o
 * Clerk não responder, a página segue como antes.
 *
 * Retorna os ids das equipes que acabaram de ganhar este usuário.
 */
export async function syncClerkMembershipsFor(userId: string): Promise<string[]> {
  try {
    const client = await clerkClient();
    const { data: memberships } = await client.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });
    if (memberships.length === 0) return [];

    const byOrg = new Map(memberships.map((m) => [m.organization.id, m]));
    const linked = await db
      .select({ id: teams.id, clerkOrgId: teams.clerkOrgId })
      .from(teams)
      .where(inArray(teams.clerkOrgId, [...byOrg.keys()]));
    if (linked.length === 0) return [];

    const existing = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, userId),
          inArray(
            teamMembers.teamId,
            linked.map((t) => t.id),
          ),
        ),
      );
    const already = new Set(existing.map((row) => row.teamId));

    const joinedTeams: string[] = [];
    for (const team of linked) {
      if (already.has(team.id) || !team.clerkOrgId) continue;
      const membership = byOrg.get(team.clerkOrgId);
      if (!membership) continue;

      const publicMetadata = (membership.publicMetadata ?? {}) as { stagebookRole?: unknown };
      const inserted = await db
        .insert(teamMembers)
        .values({
          teamId: team.id,
          userId,
          role: mapClerkOrgRole(membership.role, publicMetadata.stagebookRole),
        })
        .onConflictDoNothing({ target: [teamMembers.teamId, teamMembers.userId] })
        .returning({ role: teamMembers.role });

      if (inserted.length) {
        joinedTeams.push(team.id);
        const user = membership.publicUserData;
        await recordTeamActivity({
          teamId: team.id,
          actorId: userId,
          verb: "member.joined",
          entityType: "member",
          data: {
            name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
            role: inserted[0].role,
          },
          aggregate: false,
        }).catch(() => {});
      }
    }
    return joinedTeams;
  } catch (error) {
    console.error("[stagebook] falha ao sincronizar memberships do Clerk:", error);
    return [];
  }
}
