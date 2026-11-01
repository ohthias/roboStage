/**
 * Notícias do RoboStage.
 *
 * As notícias são escritas no editor (RoboStage News) e ficam na tabela
 * `news` do Supabase. Aqui elas são lidas pela API REST do Supabase com a
 * chave pública (anon): a política de RLS só devolve notícias publicadas
 * (`draft = false`), então rascunhos nunca chegam ao site.
 *
 * O cache usa a tag "news": o editor chama `/api/revalidate/news` ao salvar,
 * e o site atualiza na hora. Sem essa chamada, o cache expira sozinho em
 * `NEWS_REVALIDATE_SECONDS`.
 */

export const NEWS_CACHE_TAG = "news";
const NEWS_REVALIDATE_SECONDS = 300;

export type NewsSummary = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  category?: string;
  author?: string;
  cover?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
};

export type NewsArticle = { content: string; data: NewsSummary };

export type NewsHeading = { id: string; text: string; level: 2 | 3 };

type NewsRow = {
  slug: string;
  title: string;
  description: string | null;
  date: string | null;
  category: string | null;
  author: string | null;
  cover_url: string | null;
  tags: string[] | null;
  featured: boolean | null;
  draft: boolean | null;
  content?: string | null;
};

const SUMMARY_COLUMNS = "slug,title,description,date,category,author,cover_url,tags,featured,draft";

// Slug só com letras, números, "-" e "_".
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/i;

export const sanitizeNewsSlug = (slug: unknown): string => {
  if (typeof slug !== "string") return "";
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const newsHref = (slug: unknown) => {
  const safe = sanitizeNewsSlug(slug);
  return safe ? `/news/${encodeURIComponent(safe)}` : "/news";
};

function toTime(date?: string) {
  const t = date ? new Date(`${date}T12:00:00`).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

/* ------------------------------------------------------------- Supabase */

let warnedMissingEnv = false;

function supabaseConfig() {
  const url = process.env.NEWS_SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.NEWS_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      console.warn("[news] NEWS_SUPABASE_URL ou NEWS_SUPABASE_ANON_KEY não configurados — nenhuma notícia será exibida.");
    }
    return null;
  }
  return { url, key };
}

async function queryNews(params: Record<string, string>): Promise<NewsRow[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];

  const qs = new URLSearchParams({ draft: "eq.false", ...params });
  try {
    const res = await fetch(`${cfg.url}/rest/v1/news?${qs}`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_CACHE_TAG] },
    });
    if (!res.ok) {
      console.error(`[news] Supabase respondeu ${res.status}: ${await res.text()}`);
      return [];
    }
    return (await res.json()) as NewsRow[];
  } catch (err) {
    console.error("[news] Falha ao buscar notícias no Supabase:", err);
    return [];
  }
}

function toSummary(row: NewsRow): NewsSummary {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description || undefined,
    date: row.date || undefined,
    category: row.category || undefined,
    author: row.author || undefined,
    cover: row.cover_url || undefined,
    tags: row.tags ?? [],
    featured: !!row.featured,
    draft: !!row.draft,
  };
}

/* -------------------------------------------------------------- leitura */

/** Notícias públicas (sem rascunho e com título), da mais nova para a mais antiga. */
export async function getPublishedNews(): Promise<NewsSummary[]> {
  const rows = await queryNews({
    select: SUMMARY_COLUMNS,
    order: "date.desc,created_at.desc",
  });
  return rows
    .map(toSummary)
    .filter((n) => n.title && SLUG_RE.test(n.slug))
    .sort((a, b) => toTime(b.date) - toTime(a.date));
}

/** Mantido por compatibilidade: o site só enxerga notícias publicadas. */
export const getAllNews = getPublishedNews;

/** Lê uma notícia publicada. Retorna null se o slug for inválido ou não existir. */
export async function getNews(slug: string): Promise<NewsArticle | null> {
  if (!SLUG_RE.test(slug)) return null;
  const [row] = await queryNews({
    select: `${SUMMARY_COLUMNS},content`,
    slug: `eq.${slug}`,
    limit: "1",
  });
  if (!row || !row.title) return null;
  return { content: row.content ?? "", data: toSummary(row) };
}

// Últimas notícias publicadas. Com `preferTag`, as notícias com essa tag vêm
// primeiro e o restante completa a lista pelas mais recentes.
export async function getLatestNews(limit = 3, preferTag?: string): Promise<NewsSummary[]> {
  const all = await getPublishedNews();
  if (!preferTag) return all.slice(0, limit);
  const tag = preferTag.toLowerCase();
  const tagged = all.filter((n) => n.tags?.some((t) => String(t).toLowerCase() === tag));
  const rest = all.filter((n) => !tagged.includes(n));
  return [...tagged, ...rest].slice(0, limit);
}

/** Anterior (mais antiga) e próxima (mais nova) em relação ao slug. */
export function getAdjacentNews(all: NewsSummary[], slug: string) {
  const i = all.findIndex((n) => n.slug === slug);
  if (i === -1) return { newer: null, older: null };
  return { newer: all[i - 1] ?? null, older: all[i + 1] ?? null };
}

/** Notícias com mais tags/categoria em comum. */
export function getRelatedNews(all: NewsSummary[], current: NewsSummary, limit = 3): NewsSummary[] {
  const tags = new Set((current.tags ?? []).map((t) => String(t).toLowerCase()));
  return all
    .filter((n) => n.slug !== current.slug)
    .map((n) => ({
      n,
      score:
        (n.tags ?? []).filter((t) => tags.has(String(t).toLowerCase())).length +
        (n.category && n.category === current.category ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || toTime(b.n.date) - toTime(a.n.date))
    .slice(0, limit)
    .map(({ n }) => n);
}

/* ------------------------------------------------------------ formatação */

export function formatNewsDate(date?: string, style: "long" | "short" = "short") {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: style,
    year: "numeric",
  });
}

export function readingMinutes(content: string) {
  const words = content.replace(/[#>*_`\-[\]()!]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function headingId(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Títulos "#", "##" e "###" do markdown, fora de blocos de código. */
export function extractHeadings(content: string): NewsHeading[] {
  const out: NewsHeading[] = [];
  let inCode = false;
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inCode = !inCode;
    if (inCode) continue;
    const m = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const text = m[2].replace(/[*_`]/g, "");
      out.push({ id: headingId(text), text, level: m[1].length === 3 ? 3 : 2 });
    }
  }
  return out;
}
