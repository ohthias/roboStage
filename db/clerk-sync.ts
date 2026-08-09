import { Webhook } from "svix";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

/**
 * Handler para app/api/webhooks/clerk/route.ts (POST).
 * Configure no painel do Clerk os eventos: user.created, user.updated, user.deleted.
 * Requer CLERK_WEBHOOK_SECRET no ambiente.
 *
 * Observação: personaType e onboardingCompletedAt NÃO são preenchidos aqui —
 * eles são setados depois, quando o usuário concluir o onboarding no produto
 * (tela onde escolhe competidor/mentor-técnico/entusiasta/organizador e as
 * ligas que participa ou quer conhecer).
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
  }

  return new Response("ok", { status: 200 });
}