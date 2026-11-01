import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NEWS_CACHE_TAG, sanitizeNewsSlug } from "@/utils/institutional/news";

/**
 * Chamado pelo editor de notícias depois de salvar ou excluir uma notícia,
 * para que o site mostre a mudança na hora (sem esperar o cache expirar).
 *
 * POST /api/revalidate/news
 * Authorization: Bearer <NEWS_REVALIDATE_SECRET>
 * Body (opcional): { "slug": "note_03_07_26" }
 */
function authorized(req: Request) {
  const secret = process.env.NEWS_REVALIDATE_SECRET;
  if (!secret) return false;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!process.env.NEWS_REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: "NEWS_REVALIDATE_SECRET não configurado" }, { status: 500 });
  }
  if (!authorized(req)) {
    return Response.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { slug?: unknown };
  const slug = sanitizeNewsSlug(body.slug);

  revalidateTag(NEWS_CACHE_TAG, { expire: 0 });
  // Páginas que listam notícias
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/[competicao]", "page");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/news/${slug}`);

  return Response.json({ ok: true, slug: slug || null, revalidatedAt: new Date().toISOString() });
}
