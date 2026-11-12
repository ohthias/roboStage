import { Webhook } from "svix";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { users, teams, teamMembers } from "./schema";
import { mapClerkOrgRole, reconcileClerkOrgRole } from "@/utils/stagebook/clerk-roles";
import { recordTeamActivity } from "@/utils/stagebook/team-activity";

async function ensureMembershipUser(userData: {
  user_id?: string;
  identifier?: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}) {
  if (!userData.user_id) return;

  await db
    .insert(users)
    .values({
      id: userData.user_id,
      email: userData.identifier ?? "",
      name: [userData.first_name, userData.last_name].filter(Boolean).join(" ") || null,
      avatarUrl: userData.image_url ?? null,
    })
    .onConflictDoNothing({ target: users.id });
}

/**
 * Handler para app/api/webhooks/clerk/route.ts (POST).
 * Configure no painel do Clerk os eventos: user.created, user.updated,
 * user.deleted, organization.updated, organization.deleted,
 * organizationMembership.created, organizationMembership.updated,
 * organizationMembership.deleted.
 * Requer CLERK_WEBHOOK_SECRET no ambiente.
 *
 * Observação: personaType e onboardingCompletedAt NÃO são preenchidos aqui —
 * eles são setados depois, quando o usuário concluir o onboarding no produto
 * (tela onde escolhe competidor/mentor-técnico/entusiasta/organizador e as
 * ligas que participa ou quer conhecer).
 *
 * Organizations: a CRIAÇÃO de uma equipe acontece de forma síncrona em
 * lib/stagebook/actions/teams.ts (cria a Organization no Clerk e a linha em
 * `teams` na mesma requisição) — por isso não tratamos organization.created
 * aqui, evitando corrida/duplicidade. Já a MEMBERSHIP (entrar/sair/mudar de
 * papel) pode acontecer fora do nosso app (ex: tela nativa de organização do
 * Clerk), então isso sim precisa ficar sincronizado via webhook.
 */
export async function handleClerkWebhook(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET não está configurado");
    return new Response("Webhook não configurado", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Cabeçalhos svix ausentes", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: any;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Assinatura inválida", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      const email = email_addresses?.[0]?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      await db
        .insert(users)
        .values({ id, email, name, avatarUrl: image_url ?? null })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email,
            name,
            avatarUrl: image_url ?? null,
            updatedAt: new Date(),
          },
        });
      break;
    }
    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        await db.delete(users).where(eq(users.id, id));
      }
      break;
    }

    // -----------------------------------------------------------------
    // Organizations (= equipes do Stagebook)
    // -----------------------------------------------------------------
    case "organization.updated": {
      const { id, name } = event.data;
      if (id && name) {
        await db.update(teams).set({ name }).where(eq(teams.clerkOrgId, id));
      }
      break;
    }
    case "organization.deleted": {
      const { id } = event.data;
      // onDelete cascade nas FKs de teamId cuida de folders/documents/boards/
      // calendar_events/tests dessa equipe automaticamente.
      if (id) {
        await db.delete(teams).where(eq(teams.clerkOrgId, id));
      }
      break;
    }

    case "organizationMembership.created": {
      const { organization, public_user_data, role, public_metadata } = event.data;
      const team = await db.query.teams.findFirst({
        where: eq(teams.clerkOrgId, organization?.id),
        columns: { id: true },
      });
      if (team && public_user_data?.user_id) {
        // Membership events can arrive before user.created/user.updated.
        // Satisfy the FK without depending on webhook delivery order.
        await ensureMembershipUser(public_user_data);
        const joined = await db
          .insert(teamMembers)
          .values({
            teamId: team.id,
            userId: public_user_data.user_id,
            role: mapClerkOrgRole(role, public_metadata?.stagebookRole),
          })
          .onConflictDoNothing({
            target: [teamMembers.teamId, teamMembers.userId],
          })
          .returning({ role: teamMembers.role });
        // Só quando a linha é nova: o criador da equipe já entra pela action
        // (e o webhook repetido não gera um segundo "entrou na equipe").
        if (joined.length) {
          await recordTeamActivity({
            teamId: team.id,
            actorId: public_user_data.user_id,
            verb: "member.joined",
            entityType: "member",
            data: {
              name:
                [public_user_data.first_name, public_user_data.last_name].filter(Boolean).join(" ") ||
                null,
              role: joined[0].role,
            },
            aggregate: false,
          });
        }
      }
      break;
    }
    case "organizationMembership.updated": {
      const { organization, public_user_data, role } = event.data;
      const team = await db.query.teams.findFirst({
        where: eq(teams.clerkOrgId, organization?.id),
        columns: { id: true },
      });
      if (team && public_user_data?.user_id) {
        const where = and(
          eq(teamMembers.teamId, team.id),
          eq(teamMembers.userId, public_user_data.user_id)
        );
        const current = await db.query.teamMembers.findFirst({ where, columns: { role: true } });
        // O Clerk só sabe admin/member: não rebaixa um "competidor" para
        // "colaborador" nem promove um "mentor" a técnico por causa disso.
        const nextRole = reconcileClerkOrgRole(current?.role, role);
        if (current && current.role !== nextRole) {
          await db.update(teamMembers).set({ role: nextRole }).where(where);
        }
      }
      break;
    }
    case "organizationMembership.deleted": {
      const { organization, public_user_data } = event.data;
      const team = await db.query.teams.findFirst({
        where: eq(teams.clerkOrgId, organization?.id),
        columns: { id: true },
      });
      if (team && public_user_data?.user_id) {
        await db
          .delete(teamMembers)
          .where(
            and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, public_user_data.user_id))
          );
      }
      break;
    }
  }

  return new Response("ok", { status: 200 });
}