/**
 * Utilitários sobre o JSON do Lexical (sem montar editor) para backlinks,
 * busca com contexto, blocos sincronizados e índice de decisões.
 * Funcionam no servidor e no cliente.
 */

export type LexicalJson = {
  type?: string;
  text?: string;
  children?: LexicalJson[];
  docId?: string;
  title?: string;
  url?: string;
  syncId?: string;
  kind?: string;
  data?: Record<string, unknown>;
  equation?: string;
};

const TEXT_BLOCKS = new Set([
  "paragraph",
  "heading",
  "quote",
  "listitem",
  "callout",
  "collapsible-title",
  "code",
]);

const rootOf = (content: unknown): LexicalJson | null =>
  ((content as { root?: LexicalJson } | null)?.root ?? null) as LexicalJson | null;

function walk(node: LexicalJson, visit: (n: LexicalJson) => void) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

/** Texto de um bloco (menções viram "@Título"). */
export function inlineText(node: LexicalJson): string {
  if (typeof node.text === "string") return node.text;
  if (node.type === "page-mention") return `@${node.title ?? "página"}`;
  if (node.type === "linebreak") return " ";
  if (node.type === "equation") return node.equation ?? "";
  return (node.children ?? [])
    .filter((c) => c.type !== "list")
    .map(inlineText)
    .join("");
}

/** O nó aponta para a página? (menção, link interno). */
function pointsTo(node: LexicalJson, docId: string) {
  if (node.type === "page-mention" && node.docId === docId) return true;
  if ((node.type === "link" || node.type === "autolink") && typeof node.url === "string") {
    return node.url.includes(`/dashboard/documents/${docId}`);
  }
  return false;
}

/** Trechos (blocos de texto) de `content` que citam a página `docId`. */
export function findReferenceSnippets(content: unknown, docId: string, max = 3): string[] {
  const root = rootOf(content);
  if (!root) return [];
  const out: string[] = [];
  const visitBlock = (block: LexicalJson) => {
    let hit = false;
    walk(block, (n) => {
      if (n !== block && n.type === "list") return;
      if (pointsTo(n, docId)) hit = true;
    });
    if (hit) {
      const text = inlineText(block).replace(/\s+/g, " ").trim();
      if (text && !out.includes(text)) out.push(text.length > 220 ? `${text.slice(0, 217)}…` : text);
    }
  };
  const visit = (node: LexicalJson) => {
    if (out.length >= max) return;
    if (node.type && TEXT_BLOCKS.has(node.type)) {
      visitBlock(node);
      // Listas aninhadas dentro do item continuam sendo visitadas.
      for (const child of node.children ?? []) if (child.type === "list") visit(child);
      return;
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return out;
}

/** Ids de blocos sincronizados usados no conteúdo. */
export function collectSyncIds(content: unknown): string[] {
  const root = rootOf(content);
  const ids = new Set<string>();
  if (root) walk(root, (n) => n.type === "synced-block" && n.syncId && ids.add(n.syncId));
  return [...ids];
}

export type DecisionData = {
  title?: string;
  date?: string;
  status?: string;
  decision?: string;
  reason?: string;
  participants?: string[];
  alternatives?: { text?: string; why?: string }[];
  result?: string;
  outcome?: string;
};

/** Registros de decisão (bloco inteligente "decision") do conteúdo. */
export function collectDecisions(content: unknown): DecisionData[] {
  const root = rootOf(content);
  const out: DecisionData[] = [];
  if (root) {
    walk(root, (n) => {
      if (n.type === "smart-block" && n.kind === "decision" && n.data) out.push(n.data as DecisionData);
    });
  }
  return out;
}

/* ---------- busca com contexto ---------- */

/** Minúsculas e sem acento, mantendo o índice de cada letra do original. */
function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = text[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    for (let j = 0; j < f.length; j++) {
      folded += f[j];
      map.push(i);
    }
  }
  return { folded, map };
}

export function foldText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export type Snippet = { before: string; match: string; after: string };

/**
 * Trecho em volta da primeira ocorrência de `query` (sem diferenciar
 * maiúsculas e acentos). `before`/`after` já vêm cortados com "…".
 */
export function searchSnippet(text: string, query: string, radius = 70): Snippet | null {
  const q = foldText(query.trim());
  if (!q) return null;
  const flat = text.replace(/\s+/g, " ");
  const { folded, map } = foldWithMap(flat);
  const at = folded.indexOf(q);
  if (at < 0) return null;
  const start = map[at];
  const end = map[at + q.length - 1] + 1;
  const from = Math.max(0, start - radius);
  const to = Math.min(flat.length, end + radius);
  // Corta em espaço para não partir palavras.
  const fromCut = from > 0 ? flat.indexOf(" ", from) + 1 || from : 0;
  const toCut = to < flat.length ? flat.lastIndexOf(" ", to) : flat.length;
  return {
    before: (fromCut > 0 ? "…" : "") + flat.slice(fromCut > start ? from : fromCut, start),
    match: flat.slice(start, end),
    after: flat.slice(end, toCut > end ? toCut : to) + (to < flat.length ? "…" : ""),
  };
}

/** Escapa % e _ para usar o termo num ILIKE. */
export function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
