import fs from "fs";
import path from "path";
import matter from "gray-matter";

const newsDirectory = path.join(process.cwd(), "content/news");

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

export type NewsHeading = { id: string; text: string; level: 2 | 3 };

// Slug só com letras, números, "-" e "_". Barra qualquer tentativa de sair da pasta.
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

export function getAllNews(): NewsSummary[] {
  const files = fs.readdirSync(newsDirectory).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const file = fs.readFileSync(path.join(newsDirectory, filename), "utf8");
      const { data } = matter(file);
      return { slug, ...data } as NewsSummary;
    })
    .sort((a, b) => toTime(b.date) - toTime(a.date));
}

/** Notícias públicas: sem rascunho e com título. */
export function getPublishedNews(): NewsSummary[] {
  try {
    return getAllNews().filter((n) => !n.draft && n.title);
  } catch {
    return [];
  }
}

/** Lê uma notícia. Retorna null se o slug for inválido ou não existir. */
export function getNews(slug: string) {
  if (!SLUG_RE.test(slug)) return null;
  const file = path.join(newsDirectory, `${slug}.mdx`);
  if (path.dirname(file) !== newsDirectory || !fs.existsSync(file)) return null;
  return matter(fs.readFileSync(file, "utf8"));
}

// Últimas notícias publicadas. Com `preferTag`, as notícias com essa tag vêm
// primeiro e o restante completa a lista pelas mais recentes.
export function getLatestNews(limit = 3, preferTag?: string): NewsSummary[] {
  const all = getPublishedNews();
  if (!preferTag) return all.slice(0, limit);
  const tag = preferTag.toLowerCase();
  const tagged = all.filter((n) => n.tags?.some((t) => String(t).toLowerCase() === tag));
  const rest = all.filter((n) => !tagged.includes(n));
  return [...tagged, ...rest].slice(0, limit);
}

/** Anterior (mais antiga) e próxima (mais nova) em relação ao slug. */
export function getAdjacentNews(slug: string) {
  const all = getPublishedNews();
  const i = all.findIndex((n) => n.slug === slug);
  if (i === -1) return { newer: null, older: null };
  return { newer: all[i - 1] ?? null, older: all[i + 1] ?? null };
}

/** Notícias com mais tags/categoria em comum. */
export function getRelatedNews(current: NewsSummary, limit = 3): NewsSummary[] {
  const tags = new Set((current.tags ?? []).map((t) => String(t).toLowerCase()));
  return getPublishedNews()
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
