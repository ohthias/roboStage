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
