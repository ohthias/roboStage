import fs from "fs/promises";
import path from "path";

const legalPath = path.join(process.cwd(), "content", "legal");

export async function getLegalDocument(slug: string) {
  const file = path.join(legalPath, `${slug}.md`);

  try {
    const content = await fs.readFile(file, "utf-8");

    return {
      slug,
      content,
    };
  } catch {
    return null;
  }
}

export async function getAllLegalDocuments() {
  const files = await fs.readdir(legalPath);

  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(".md", ""),
    }));
}