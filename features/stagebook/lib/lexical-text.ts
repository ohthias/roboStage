/**
 * Extrai o texto puro de um estado serializado do Lexical (editorState.toJSON()),
 * para prévias leves (histórico de versões, lixeira) sem montar um editor.
 */

type LexicalNode = {
  type?: string;
  text?: string;
  equation?: string;
  title?: string;
  kind?: string;
  data?: unknown;
  children?: LexicalNode[];
};

/** Todos os textos de um objeto de dados (blocos inteligentes). */
function dataStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (value.trim() && !/^[0-9a-f-]{36}$/i.test(value)) out.push(value.trim());
  } else if (Array.isArray(value)) value.forEach((v) => dataStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => dataStrings(v, out));
  return out;
}

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "quote",
  "listitem",
  "code",
  "tablerow",
  "callout",
  "layout-item",
  "collapsible-title",
]);

export function lexicalToPlainText(content: unknown, maxLength = 4000): string {
  const root = (content as { root?: LexicalNode } | null)?.root;
  if (!root) return "";

  const lines: string[] = [];
  let current = "";

  function walk(node: LexicalNode) {
    if (typeof node.text === "string") current += node.text;
    if (node.type === "linebreak") current += "\n";
    if (node.type === "equation" && node.equation) current += node.equation;
    if (node.type === "page-mention") current += `@${node.title ?? "página"}`;
    if (node.type === "tab" && node.title) lines.push(node.title);
    if (node.type === "smart-block" && node.data) {
      if (current.trim()) lines.push(current.trimEnd());
      current = "";
      lines.push(dataStrings(node.data).join(" · "));
    }
    if (node.type === "tablecell" && current) current += " · ";
    for (const child of node.children ?? []) walk(child);
    if (node.type && BLOCK_TYPES.has(node.type)) {
      lines.push(current.trimEnd());
      current = "";
    }
  }

  walk(root);
  if (current.trim()) lines.push(current.trimEnd());

  const text = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
