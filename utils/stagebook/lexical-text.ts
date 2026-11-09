/**
 * Extrai o texto puro de um estado serializado do Lexical (editorState.toJSON()),
 * para prévias leves (histórico de versões, lixeira) sem montar um editor.
 */

type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "quote",
  "listitem",
  "code",
  "tablerow",
  "callout",
  "layout-item",
]);

export function lexicalToPlainText(content: unknown, maxLength = 4000): string {
  const root = (content as { root?: LexicalNode } | null)?.root;
  if (!root) return "";

  const lines: string[] = [];
  let current = "";

  function walk(node: LexicalNode) {
    if (typeof node.text === "string") current += node.text;
    if (node.type === "linebreak") current += "\n";
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
