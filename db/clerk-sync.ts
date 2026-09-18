import { Webhook } from "svix";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { users, teams, teamMembers } from "./schema";
import type { TeamRole } from "@/utils/stagebook/scope";

/** Roles padrão do Clerk (org:admin / org:member) mapeados pro nosso enum. Se
 * no futuro forem criadas Roles customizadas no Clerk, caem em "colaborador".
 * `stagebookRole` (metadata pública que a gente manda no convite — ver
 * app/(protected)/dashboard/team/actions.ts) tem prioridade quando presente,
 * porque é o papel que o "técnico" (owner) realmente escolheu pra pessoa
 * (mentor/competidor/colaborador), mais granular do que admin/member.
 */
function mapClerkOrgRole(role: string, stagebookRole?: unknown): TeamRole {
  if (role === "org:admin") return "owner";
  if (stagebookRole === "mentor" || stagebookRole === "competidor" || stagebookRole === "colaborador") {
    return stagebookRole;
  }
  return "colaborador";
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
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Cabeçalhos svix ausentes", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

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
        await db
          .insert(teamMembers)
          .values({
            teamId: team.id,
            userId: public_user_data.user_id,
            role: mapClerkOrgRole(role, public_metadata?.stagebookRole),
          })
          .onConflictDoNothing({
            target: [teamMembers.teamId, teamMembers.userId],
          });
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
        await db
          .update(teamMembers)
          .set({ role: mapClerkOrgRole(role) })
          .where(
            and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, public_user_data.user_id))
          );
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