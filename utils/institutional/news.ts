import fs from "fs";
import path from "path";
import matter from "gray-matter";

const newsDirectory = path.join(process.cwd(), "content/news");

export function getAllNews() {
  const files = fs.readdirSync(newsDirectory);

  return files
    .map((filename) => {
      const slug = filename.replace(".mdx", "");

      const file = fs.readFileSync(path.join(newsDirectory, filename), "utf8");

      const { data } = matter(file);

      return {
        slug,
        ...data,
      };
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

export function getNews(slug: string) {
  const file = fs.readFileSync(path.join(newsDirectory, `${slug}.mdx`), "utf8");

  return matter(file);
}

type NewsSummary = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  category?: string;
  cover?: string;
  tags?: string[];
  draft?: boolean;
};

// Últimas notícias publicadas. Com `preferTag`, as notícias com essa tag vêm
// primeiro e o restante completa a lista pelas mais recentes.
export function getLatestNews(limit = 3, preferTag?: string): NewsSummary[] {
  try {
    const all = (getAllNews() as NewsSummary[]).filter((n) => !n.draft && n.title);
    if (!preferTag) return all.slice(0, limit);
    const tag = preferTag.toLowerCase();
    const tagged = all.filter((n) => n.tags?.some((t) => String(t).toLowerCase() === tag));
    const rest = all.filter((n) => !tagged.includes(n));
    return [...tagged, ...rest].slice(0, limit);
  } catch {
    return [];
  }
}
