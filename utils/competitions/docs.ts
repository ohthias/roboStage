import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

import { COMPETICOES } from "@/utils/competitions/competicoes";

export type Competicao = keyof typeof COMPETICOES;

export type RawDoc = {
  title: string;
  description: string;
  url: string;
  category?: string;
};

export type DocItem = RawDoc & {
  /** Âncora única na página, ex.: "bioglow-livro-de-regras". */
  id: string;
  href: string;
  external: boolean;
  source: string;
  isPdf: boolean;
};

export type DocGroup = { id: string; key: string; label: string; docs: DocItem[] };
export type DocSeason = { id: string; name: string; total: number; groups: DocGroup[] };

const CATEGORY_LABELS: Record<string, string> = {
  challenge: "Challenge",
  explore: "Explore",
  "future-edition": "Future Edition",
  geral: "Geral",
};
const CATEGORY_ORDER = ["challenge", "explore", "future-edition", "geral"];

export const isCompeticao = (c: string): c is Competicao => c in COMPETICOES;

/** Texto → âncora: minúsculas, sem acento, só letras/números/hífen. */
export function anchor(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function describeUrl(url: string) {
  const external = /^https?:\/\//i.test(url);
  const isPdf = /\.pdf($|[?#])/i.test(url);
  let source = "RoboStage";
  if (external) {
    try {
      source = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      source = "link externo";
    }
  }
  // Caminhos locais têm acentos e espaços: codifica para o link funcionar sempre.
  return { href: external ? url : encodeURI(url), external, isPdf, source };
}

/**
 * Lê public/data/<competicao>Docs.json. Única leitura do arquivo: a página, o
 * `generateMetadata` e a rota /api/data/<competicao>Docs passam por aqui, e
 * `cache()` faz página + metadata lerem uma vez só por render.
 */
export const readRawDocs = cache(async (competicao: Competicao) => {
  const file = path.join(process.cwd(), "public", "data", `${competicao}Docs.json`);
  return JSON.parse(await fs.readFile(file, "utf-8")) as Record<string, RawDoc[]>;
});

/**
 * Temporadas de <competicao>Docs.json já agrupadas por categoria, na ordem do
 * arquivo (a primeira é a mais recente).
 */
export const getCompetitionDocs = cache(async (competicao: Competicao): Promise<DocSeason[]> => {
  let raw: Record<string, RawDoc[]>;
  try {
    raw = await readRawDocs(competicao);
  } catch (err) {
    console.error(`Erro ao carregar ${competicao}Docs.json:`, err);
    return [];
  }

  return Object.entries(raw).map(([name, list]) => {
    const seasonId = anchor(name);
    const used = new Set<string>();
    const groups = new Map<string, DocItem[]>();

    for (const doc of list ?? []) {
      if (!doc?.title) continue;
      const key = doc.category?.trim() || "geral";
      // Mesmo título em categorias diferentes: inclui a categoria na âncora.
      let id = `${seasonId}-${anchor(doc.title)}`;
      if (used.has(id)) id = `${seasonId}-${anchor(key)}-${anchor(doc.title)}`;
      for (let n = 2; used.has(id); n++) id = `${seasonId}-${anchor(doc.title)}-${n}`;
      used.add(id);

      const item: DocItem = { ...doc, id, ...describeUrl(doc.url ?? "") };
      const group = groups.get(key);
      if (group) group.push(item);
      else groups.set(key, [item]);
    }

    const rank = (k: string) => (CATEGORY_ORDER.includes(k) ? CATEGORY_ORDER.indexOf(k) : CATEGORY_ORDER.length);
    const ordered = [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));

    return {
      id: seasonId,
      name,
      total: ordered.reduce((s, [, d]) => s + d.length, 0),
      groups: ordered.map(([key, docs]) => ({
        id: `${seasonId}-${anchor(key)}`,
        key,
        label: CATEGORY_LABELS[key] ?? key,
        docs,
      })),
    };
  });
});
