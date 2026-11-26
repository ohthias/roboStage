import "server-only";
import fs from "fs";
import path from "path";
import { getGithubReleases } from "./github";

export type ChangelogEntry = {
  version: string;
  title: string;
  date: string | null; // ISO yyyy-mm-dd
  body: string;
  url: string | null;
  changes: number; // itens de lista no texto
};

export type Changelog = {
  source: "github" | "local" | "none";
  entries: ChangelogEntry[];
};

const RELEASES_URL = "https://github.com/ohthias/roboStage/releases";

function countChanges(body: string) {
  return (body.match(/^\s*[*-]\s+/gm) ?? []).length;
}

// Lê o .github/CHANGELOG.md do projeto. Cabeçalhos no formato:
// "## [2026.4] — Título" seguidos de "**Data:** 19/10/2026".
export function parseLocalChangelog(markdown: string): ChangelogEntry[] {
  const parts = markdown.split(/^## /m).slice(1);
  const entries: ChangelogEntry[] = [];

  for (const part of parts) {
    const [headLine, ...rest] = part.split("\n");
    const head = headLine.match(/^\[(.+?)\]\s*[—–-]\s*(.+)$/);
    if (!head) continue; // ignora "Histórico", "Versionamento" etc.

    let body = rest.join("\n");
    let date: string | null = null;
    const dateMatch = body.match(/\*\*Data:\*\*\s*(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
      body = body.replace(dateMatch[0], "");
    }
    body = body.replace(/\n-{3,}\s*$/m, "").trim();

    entries.push({
      version: head[1].trim(),
      title: head[2].trim(),
      date,
      body,
      url: `${RELEASES_URL}`,
      changes: countChanges(body),
    });
  }
  return entries;
}

function readLocal(): ChangelogEntry[] {
  try {
    const file = fs.readFileSync(path.join(process.cwd(), ".github", "CHANGELOG.md"), "utf8");
    return parseLocalChangelog(file);
  } catch {
    return [];
  }
}

// Usa as releases do GitHub; se a API falhar ou vier vazia, usa o arquivo local.
export async function getChangelog(): Promise<Changelog> {
  try {
    const releases = await getGithubReleases();
    if (releases.length > 0) {
      return {
        source: "github",
        entries: releases.map((r) => {
          const version = r.tag_name.replace(/^v/, "");
          const body = r.body ?? "";
          return {
            version,
            title: r.name && r.name !== r.tag_name ? r.name : version,
            date: r.published_at ? r.published_at.slice(0, 10) : null,
            body,
            url: r.html_url,
            changes: countChanges(body),
          };
        }),
      };
    }
  } catch {
    /* segue para o arquivo local */
  }

  const local = readLocal();
  return { source: local.length ? "local" : "none", entries: local };
}

export { RELEASES_URL };
