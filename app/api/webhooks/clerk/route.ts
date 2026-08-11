import { handleClerkWebhook } from "@/db/clerk-sync";

// O Clerk só faz POST. Qualquer outro verbo aqui não precisa existir.
export async function POST(req: Request) {
  return handleClerkWebhook(req);
}