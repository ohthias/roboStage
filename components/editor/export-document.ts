/**
 * Exportação de páginas para Markdown e HTML a partir do estado serializado
 * do Lexical (editorState.toJSON()). Trabalha só com JSON, então cobre também
 * os nós próprios do StageBook (destaques, recolhíveis, equações, colunas…).
 */
import { markerToText, readMarkerFromJSON } from "./list-markers";
import { lucideSvg, type LucideSvgName } from "./lucide-svg";

export type JsonNode = {
  type: string;
  children?: JsonNode[];
  text?: string;
  format?: number | string;
  style?: string;
  tag?: string;
  listType?: "bullet" | "number" | "check";
  start?: number;
  checked?: boolean;
  url?: string;
  language?: string;
  headerState?: number;
  variant?: string;
  emoji?: string | null;
  level?: string;
  open?: boolean;
  equation?: string;
  inline?: boolean;
  embedKind?: string;
  label?: string;
  templateColumns?: string;
  status?: string;
  $?: Record<string, unknown>;
};

export type ExportMeta = {
  title: string;
  icon?: string | null;
  description?: string | null;
  /** Propriedades já formatadas (status, prazo…), mostradas sob o título. */
  properties?: { label: string; value: string }[];
};

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;
const IS_HIGHLIGHT = 128;

const CALLOUT_LABEL: Record<string, string> = { info: "Info", alerta: "Alerta", fazer: "Fazer" };
const CALLOUT_ICON: Record<string, LucideSvgName> = { info: "info", alerta: "triangle-alert", fazer: "square-check-big" };
const STEP_MARK: Record<string, string> = { done: "✅", active: "🔵", pending: "⚪" };
const STEP_LABEL: Record<string, string> = { done: "Concluída", active: "Em andamento", pending: "Pendente" };
const CALLOUT_GFM: Record<string, string> = { info: "NOTE", alerta: "WARNING", fazer: "TIP" };

const EMBED_LABEL: Record<string, string> = {
  "kanban-card": "Card do Kanban",
  "calendar-event": "Evento do calendário",
  "labtest-chart": "Gráfico do LabTest",
  "thinklab-board": "Quadro do ThinkLab",
  "quickbrick-photo": "Foto do robô",
  "quickbrick-diagram": "Diagrama do QuickBrick",
};

const rootChildren = (state: unknown): JsonNode[] =>
  ((state as { root?: JsonNode } | null)?.root?.children ?? []) as JsonNode[];

/** Texto puro de um nó (para títulos, sumário e âncoras). */
function plain(node: JsonNode): string {
  if (typeof node.text === "string") return node.text;
  if (node.type === "linebreak") return " ";
  if (node.type === "equation") return node.equation ?? "";
  return (node.children ?? []).map(plain).join("");
}

export function slugify(text: string) {
  // Mesmo formato das âncoras do GitHub (mantém acentos).
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-") || "secao"
  );
}

type Heading = { level: number; text: string; id: string };

/** Títulos em ordem (inclusive títulos recolhíveis), com âncoras únicas. */
function collectHeadings(nodes: JsonNode[]): Heading[] {
  const out: Heading[] = [];
  const used = new Map<string, number>();
  const walk = (list: JsonNode[]) => {
    for (const node of list) {
      let level = 0;
      if (node.type === "heading" && node.tag) level = Number(node.tag.slice(1));
      if (node.type === "collapsible-title" && node.level && node.level !== "p") level = Number(node.level.slice(1));
      if (level) {
        const text = plain(node).trim();
        const base = slugify(text);
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        out.push({ level, text, id: n ? `${base}-${n}` : base });
        continue;
      }
      if (node.children && node.type !== "table" && node.type !== "paragraph") walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

/* ================================================================== */
/* Markdown                                                            */
/* ================================================================== */

function escapeMd(text: string) {
  return text.replace(/([\\`*_[\]<>#|])/g, "\\$1");
}

function mdInline(nodes: JsonNode[] = []): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
        case "code-highlight": {
          const raw = node.text ?? "";
          const f = typeof node.format === "number" ? node.format : 0;
          if (!raw) return "";
          if (f & IS_CODE) return `\`${raw.replace(/`/g, "\\`")}\``;
          // Espaços nas pontas ficam fora da marcação (senão o markdown quebra).
          const lead = raw.match(/^\s*/)![0];
          const trail = raw.match(/\s*$/)![0];
          let t = escapeMd(raw.trim());
          if (!t) return raw;
          if (f & IS_BOLD) t = `**${t}**`;
          if (f & IS_ITALIC) t = `*${t}*`;
          if (f & IS_STRIKETHROUGH) t = `~~${t}~~`;
          if (f & IS_HIGHLIGHT) t = `==${t}==`;
          if (f & IS_UNDERLINE) t = `<u>${t}</u>`;
          if (f & IS_SUBSCRIPT) t = `<sub>${t}</sub>`;
          if (f & IS_SUPERSCRIPT) t = `<sup>${t}</sup>`;
          return lead + t + trail;
        }
        case "linebreak":
          return "  \n";
        case "tab":
          return "\t";
        case "link":
        case "autolink":
          return `[${mdInline(node.children)}](${node.url ?? ""})`;
        case "equation":
          return node.inline ? `$${node.equation ?? ""}$` : `\n$$\n${node.equation ?? ""}\n$$\n`;
        default:
          return node.children ? mdInline(node.children) : (node.text ?? "");
      }
    })
    .join("");
}

function prefixLines(text: string, prefix: string) {
  return text
    .split("\n")
    .map((line) => (line ? prefix + line : prefix.trimEnd()))
    .join("\n");
}

function mdList(node: JsonNode, depth: number): string {
  const indent = "  ".repeat(depth);
  const custom = markerToText(readMarkerFromJSON(node));
  let n = node.start ?? 1;
  const lines: string[] = [];
  for (const item of node.children ?? []) {
    if (item.type !== "listitem") continue;
    const nested = (item.children ?? []).filter((c) => c.type === "list");
    const own = (item.children ?? []).filter((c) => c.type !== "list");
    if (own.length > 0 || nested.length === 0) {
      let marker = "-";
      if (node.listType === "number") marker = `${n++}.`;
      if (node.listType === "check") marker = item.checked ? "- [x]" : "- [ ]";
      // Marcador livre (seta, emoji…) não existe em markdown: vai no texto.
      const lead = node.listType === "bullet" && custom && !["•", "◦", "▪"].includes(custom) ? `${custom} ` : "";
      lines.push(`${indent}${marker} ${lead}${mdInline(own)}`);
    }
    nested.forEach((l) => lines.push(mdList(l, depth + 1)));
  }
  return lines.join("\n");
}

function mdTable(node: JsonNode): string {
  const rows = (node.children ?? []).filter((r) => r.type === "tablerow");
  if (!rows.length) return "";
  const cells = rows.map((r) =>
    (r.children ?? []).map((c) =>
      (c.children ?? [])
        .map((p) => mdInline(p.children))
        .join("<br>")
        .replace(/\|/g, "\\|")
        .replace(/\n/g, " "),
    ),
  );
  const width = Math.max(...cells.map((r) => r.length));
  const pad = (r: string[]) => [...r, ...Array(width - r.length).fill("")];
  const [head, ...body] = cells;
  return [
    `| ${pad(head).join(" | ")} |`,
    `| ${Array(width).fill("---").join(" | ")} |`,
    ...body.map((r) => `| ${pad(r).join(" | ")} |`),
  ].join("\n");
}

function mdBlocks(nodes: JsonNode[], headings: Heading[]): string {
  return nodes
    .map((node) => mdBlock(node, headings))
    .filter((s) => s !== null)
    .join("\n\n");
}

function mdBlock(node: JsonNode, headings: Heading[]): string | null {
  switch (node.type) {
    case "paragraph":
      return mdInline(node.children);
    case "heading":
      return `${"#".repeat(Number(node.tag?.slice(1) ?? 1))} ${mdInline(node.children)}`;
    case "quote":
      return prefixLines(mdInline(node.children), "> ");
    case "list":
      return mdList(node, 0);
    case "code": {
      const body = (node.children ?? [])
        .map((c) => (c.type === "linebreak" ? "\n" : c.type === "tab" ? "\t" : (c.text ?? "")))
        .join("");
      const fence = body.includes("```") ? "~~~~" : "```";
      return `${fence}${node.language ?? ""}\n${body}\n${fence}`;
    }
    case "horizontalrule":
    case "divider":
      return "---";
    case "table":
      return mdTable(node);
    case "layout-container":
      return (node.children ?? []).map((item) => mdBlocks(item.children ?? [], headings)).join("\n\n");
    case "callout": {
      const variant = node.variant ?? "info";
      const emoji = node.emoji ? `${node.emoji} ` : "";
      return `> [!${CALLOUT_GFM[variant] ?? "NOTE"}]\n${prefixLines(`${emoji}${mdInline(node.children)}`.trim(), "> ")}`;
    }
    case "collapsible-container": {
      const title = node.children?.find((c) => c.type === "collapsible-title");
      const content = node.children?.find((c) => c.type === "collapsible-content");
      const level = title?.level && title.level !== "p" ? Number(title.level.slice(1)) : 0;
      const summary = mdInline(title?.children);
      const inner = mdBlocks(content?.children ?? [], headings);
      if (level) return `${"#".repeat(level)} ${summary}\n\n${inner}`;
      return `<details${node.open ? " open" : ""}>\n<summary>${summary}</summary>\n\n${inner}\n\n</details>`;
    }
    case "equation":
      return `$$\n${node.equation ?? ""}\n$$`;
    case "timeline": {
      const steps = (node.children ?? []).filter((c) => c.type === "timeline-item");
      return steps
        .map((step, i) => {
          const [first, ...rest] = step.children ?? [];
          const title = first ? (mdBlock(first, headings) ?? "").replace(/\n/g, " ") : "";
          const mark = STEP_MARK[step.status ?? "pending"] ?? "⚪";
          const body = mdBlocks(rest, headings);
          const head = `${i + 1}. ${mark} **${title.trim() || `Etapa ${i + 1}`}**`;
          return body ? `${head}\n\n${prefixLines(body, "   ")}` : head;
        })
        .join("\n\n");
    }
    case "toc":
      if (!headings.length) return null;
      {
        const min = Math.min(...headings.map((h) => h.level));
        return headings
          .map((h) => `${"  ".repeat(h.level - min)}- [${escapeMd(h.text || "Sem título")}](#${h.id})`)
          .join("\n");
      }
    case "stagebook-embed":
      return `> 📎 **${EMBED_LABEL[node.embedKind ?? ""] ?? "Item incorporado"}:** ${escapeMd(node.label || "sem título")}`;
    default:
      return node.children ? mdBlocks(node.children, headings) : null;
  }
}

/** Página inteira em Markdown (GFM). */
export function documentToMarkdown(state: unknown, meta: ExportMeta): string {
  const nodes = rootChildren(state);
  const headings = collectHeadings(nodes);
  const head = [`# ${meta.icon && !meta.icon.includes(":") ? `${meta.icon} ` : ""}${meta.title || "Sem título"}`];
  if (meta.description) head.push(`> ${meta.description}`);
  if (meta.properties?.length) {
    head.push(meta.properties.map((p) => `**${escapeMd(p.label)}:** ${escapeMd(p.value)}`).join("  \n"));
  }
  const body = mdBlocks(nodes, headings).replace(/\n{3,}/g, "\n\n").trim();
  return `${head.join("\n\n")}\n\n${body}\n`;
}

/* ================================================================== */
/* HTML                                                                */
/* ================================================================== */

export type HtmlOptions = {
  /** Converte LaTeX em HTML (KaTeX.renderToString). */
  renderMath?: (latex: string, displayMode: boolean) => string;
  /** Troca var(--ed-…) pelos valores reais (o arquivo não tem o CSS do app). */
  resolveColor?: (value: string) => string;
  fontFamily?: string | null;
};

function esc(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(url = "") {
  return /^(https?:|mailto:|tel:|#|\/)/i.test(url.trim()) ? url : "#";
}

function cleanStyle(style: string | undefined, opts: HtmlOptions) {
  if (!style) return "";
  const allowed = style
    .split(";")
    .map((d) => d.trim())
    .filter((d) => /^(color|background-color|font-family|font-size)\s*:/i.test(d))
    .map((d) => (opts.resolveColor ? d.replace(/var\(--[\w-]+\)/g, (v) => opts.resolveColor!(v)) : d))
    .join("; ");
  return allowed ? ` style="${esc(allowed)}"` : "";
}

function htmlInline(nodes: JsonNode[] = [], opts: HtmlOptions): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
        case "code-highlight": {
          const f = typeof node.format === "number" ? node.format : 0;
          let t = esc(node.text ?? "");
          if (f & IS_CODE) t = `<code>${t}</code>`;
          if (f & IS_BOLD) t = `<strong>${t}</strong>`;
          if (f & IS_ITALIC) t = `<em>${t}</em>`;
          if (f & IS_UNDERLINE) t = `<u>${t}</u>`;
          if (f & IS_STRIKETHROUGH) t = `<s>${t}</s>`;
          if (f & IS_HIGHLIGHT) t = `<mark>${t}</mark>`;
          if (f & IS_SUBSCRIPT) t = `<sub>${t}</sub>`;
          if (f & IS_SUPERSCRIPT) t = `<sup>${t}</sup>`;
          const style = cleanStyle(node.style, opts);
          return style ? `<span${style}>${t}</span>` : t;
        }
        case "linebreak":
          return "<br>";
        case "tab":
          return "\t";
        case "link":
        case "autolink":
          return `<a href="${esc(safeUrl(node.url))}">${htmlInline(node.children, opts)}</a>`;
        case "equation":
          return htmlEquation(node.equation ?? "", !node.inline, opts);
        default:
          return node.children ? htmlInline(node.children, opts) : esc(node.text ?? "");
      }
    })
    .join("");
}

function htmlEquation(latex: string, display: boolean, opts: HtmlOptions) {
  const rendered = opts.renderMath ? opts.renderMath(latex, display) : esc(display ? `$$${latex}$$` : `$${latex}$`);
  return display ? `<div class="sb-equation">${rendered}</div>` : `<span class="sb-equation-inline">${rendered}</span>`;
}

function listStyleAttr(node: JsonNode) {
  const marker = readMarkerFromJSON(node);
  if (!marker || node.listType === "check") return "";
  const text = markerToText(marker);
  const keyword: Record<string, string> = {
    disc: "disc", circle: "circle", square: "square", decimal: "decimal",
    "decimal-leading-zero": "decimal-leading-zero", "lower-alpha": "lower-alpha",
    "upper-alpha": "upper-alpha", "lower-roman": "lower-roman", "upper-roman": "upper-roman",
  };
  const css = keyword[marker] ?? (text ? `"${text.replace(/["\\]/g, "")}  "` : "");
  return css ? ` style="list-style-type: ${esc(css)}"` : "";
}

function htmlList(node: JsonNode, opts: HtmlOptions): string {
  const tag = node.listType === "number" ? "ol" : "ul";
  const cls = node.listType === "check" ? ' class="sb-checklist"' : "";
  const start = node.listType === "number" && node.start && node.start !== 1 ? ` start="${node.start}"` : "";
  const items = (node.children ?? [])
    .filter((i) => i.type === "listitem")
    .map((item) => {
      const nested = (item.children ?? []).filter((c) => c.type === "list");
      const own = (item.children ?? []).filter((c) => c.type !== "list");
      const check =
        node.listType === "check"
          ? `<input type="checkbox" disabled${item.checked ? " checked" : ""}> `
          : "";
      const nestedHtml = nested.map((l) => htmlList(l, opts)).join("");
      const liClass = node.listType === "check" ? ` class="${item.checked ? "done" : ""}"` : nested.length && !own.length ? ' class="nested"' : "";
      return `<li${liClass}>${check}${htmlInline(own, opts)}${nestedHtml}</li>`;
    })
    .join("");
  return `<${tag}${cls}${start}${listStyleAttr(node)}>${items}</${tag}>`;
}

function htmlBlocks(nodes: JsonNode[], opts: HtmlOptions, ctx: HtmlCtx): string {
  return nodes.map((n) => htmlBlock(n, opts, ctx)).join("\n");
}

type HtmlCtx = { headings: Heading[]; next: number };

function nextHeadingId(ctx: HtmlCtx) {
  return ctx.headings[ctx.next++]?.id ?? `secao-${ctx.next}`;
}

function htmlBlock(node: JsonNode, opts: HtmlOptions, ctx: HtmlCtx): string {
  switch (node.type) {
    case "paragraph": {
      const inner = htmlInline(node.children, opts);
      return inner ? `<p>${inner}</p>` : `<p class="empty"><br></p>`;
    }
    case "heading": {
      const tag = /^h[1-6]$/.test(node.tag ?? "") ? node.tag : "h2";
      return `<${tag} id="${nextHeadingId(ctx)}">${htmlInline(node.children, opts)}</${tag}>`;
    }
    case "quote":
      return `<blockquote>${htmlInline(node.children, opts)}</blockquote>`;
    case "list":
      return htmlList(node, opts);
    case "code": {
      const body = (node.children ?? [])
        .map((c) => (c.type === "linebreak" ? "\n" : c.type === "tab" ? "\t" : (c.text ?? "")))
        .join("");
      const lang = node.language ? ` data-language="${esc(node.language)}"` : "";
      return `<pre${lang}><code>${esc(body)}</code></pre>`;
    }
    case "horizontalrule":
    case "divider":
      return "<hr>";
    case "table": {
      const rows = (node.children ?? [])
        .filter((r) => r.type === "tablerow")
        .map(
          (r) =>
            `<tr>${(r.children ?? [])
              .map((c) => {
                const tag = c.headerState ? "th" : "td";
                return `<${tag}>${(c.children ?? []).map((p) => htmlInline(p.children, opts)).join("<br>")}</${tag}>`;
              })
              .join("")}</tr>`,
        )
        .join("");
      return `<div class="sb-table"><table>${rows}</table></div>`;
    }
    case "layout-container": {
      const cols = esc(node.templateColumns ?? "1fr 1fr");
      return `<div class="sb-columns" style="grid-template-columns: ${cols}">${(node.children ?? [])
        .map((item) => `<div>${htmlBlocks(item.children ?? [], opts, ctx)}</div>`)
        .join("")}</div>`;
    }
    case "callout": {
      const variant = node.variant ?? "info";
      const icon = node.emoji ? esc(node.emoji) : lucideSvg(CALLOUT_ICON[variant] ?? "info", 18, 2.2);
      return `<div class="sb-callout sb-callout-${esc(variant)}" role="note" aria-label="${esc(CALLOUT_LABEL[variant] ?? "Nota")}"><span class="sb-callout-icon">${icon}</span><div>${htmlInline(node.children, opts)}</div></div>`;
    }
    case "collapsible-container": {
      const title = node.children?.find((c) => c.type === "collapsible-title");
      const content = node.children?.find((c) => c.type === "collapsible-content");
      const level = title?.level && title.level !== "p" ? title.level : null;
      const summaryInner = htmlInline(title?.children, opts);
      const summary = level
        ? `<${level} id="${nextHeadingId(ctx)}">${summaryInner}</${level}>`
        : summaryInner;
      return `<details${node.open ? " open" : ""}><summary>${summary}</summary><div class="sb-toggle-content">${htmlBlocks(content?.children ?? [], opts, ctx)}</div></details>`;
    }
    case "equation":
      return htmlEquation(node.equation ?? "", true, opts);
    case "timeline": {
      const steps = (node.children ?? []).filter((c) => c.type === "timeline-item");
      return `<ol class="sb-timeline">${steps
        .map((step) => {
          const status = STEP_LABEL[step.status ?? ""] ? step.status! : "pending";
          return `<li class="sb-step sb-step-${status}" aria-label="${STEP_LABEL[status]}"><div class="sb-step-body">${htmlBlocks(step.children ?? [], opts, ctx)}</div></li>`;
        })
        .join("")}</ol>`;
    }
    case "toc": {
      if (!ctx.headings.length) return "";
      const min = Math.min(...ctx.headings.map((h) => h.level));
      return `<nav class="sb-toc" aria-label="Sumário"><strong>Sumário</strong><ol>${ctx.headings
        .map((h) => `<li style="padding-left:${(h.level - min) * 1.1}rem"><a href="#${h.id}">${esc(h.text || "Sem título")}</a></li>`)
        .join("")}</ol></nav>`;
    }
    case "stagebook-embed":
      return `<div class="sb-embed">📎 <strong>${esc(EMBED_LABEL[node.embedKind ?? ""] ?? "Item incorporado")}:</strong> ${esc(node.label || "sem título")}</div>`;
    default:
      return node.children ? htmlBlocks(node.children, opts, ctx) : "";
  }
}

const KATEX_CSS = "https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.css";

const HTML_CSS = `
:root{color-scheme:light;--fg:#1f2328;--muted:#59636e;--line:#d1d9e0;--soft:#f6f8fa}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--fg);font:16px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:50rem;margin:0 auto;padding:3rem 1.5rem 5rem}
.sb-title{font-size:2.5rem;line-height:1.15;margin:0 0 .5rem;letter-spacing:-.02em}
.sb-desc{color:var(--muted);margin:0 0 1rem}
.sb-props{display:grid;grid-template-columns:max-content 1fr;gap:.25rem 1.25rem;margin:0 0 2rem;padding:.75rem 1rem;border:1px solid var(--line);border-radius:12px;font-size:.9rem}
.sb-props dt{color:var(--muted)}.sb-props dd{margin:0}
h1,h2,h3,h4,h5,h6{line-height:1.3;margin:1.8em 0 .4em}
h1{font-size:1.9rem}h2{font-size:1.5rem}h3{font-size:1.25rem}h4{font-size:1.1rem}h5{font-size:1rem}
h6{font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
p{margin:.3em 0}p.empty{margin:0}
a{color:#0969da}
blockquote{margin:1em 0;padding-left:1em;border-left:4px solid var(--line);color:var(--muted);font-style:italic}
code{background:var(--soft);border-radius:4px;padding:.1em .35em;font-size:.88em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#cf222e}
pre{background:#0d1117;color:#e6edf3;border-radius:12px;padding:1rem 1.25rem;overflow-x:auto;font-size:13px;line-height:1.6}
pre code{background:none;color:inherit;padding:0}
hr{border:0;border-top:1px solid var(--line);margin:2rem 0}
ul,ol{padding-left:1.6rem;margin:.3em 0}li.nested{list-style:none}
ul.sb-checklist{list-style:none;padding-left:.25rem}ul.sb-checklist li.done{opacity:.55;text-decoration:line-through}
.sb-table{overflow-x:auto;margin:1rem 0}table{border-collapse:collapse;width:100%}
th,td{border:1px solid var(--line);padding:.45rem .75rem;text-align:left;vertical-align:top}th{background:var(--soft)}
.sb-columns{display:grid;gap:1.5rem;margin:1rem 0}
.sb-callout{display:flex;gap:.75rem;margin:1rem 0;padding:.9rem 1rem;border-radius:12px;border:1px solid}
.sb-callout-icon{font-size:1.2rem;line-height:1.5;display:flex;padding-top:.15rem}
.sb-callout-info{background:#eef6ff;border-color:#b6d7ff}.sb-callout-info .sb-callout-icon{color:#1d6fd8}
.sb-callout-alerta{background:#fff8e6;border-color:#f5d48a}.sb-callout-alerta .sb-callout-icon{color:#b26a00}
.sb-callout-fazer{background:#ecfaef;border-color:#a8e0b5}.sb-callout-fazer .sb-callout-icon{color:#1a7f37}
details{margin:.5rem 0}summary{cursor:pointer}summary>h1,summary>h2,summary>h3,summary>h4,summary>h5,summary>h6{display:inline;margin:0}
.sb-toggle-content{padding-left:1.4rem}
.sb-equation{margin:1rem 0;overflow-x:auto;text-align:center}
.sb-toc{margin:1rem 0;padding:.9rem 1rem;border:1px solid var(--line);border-radius:12px;background:var(--soft)}
.sb-toc ol{list-style:none;margin:.4rem 0 0;padding:0}.sb-toc a{text-decoration:none}
.sb-embed{margin:1rem 0;padding:.75rem 1rem;border:1px dashed var(--line);border-radius:12px;color:var(--muted)}
mark{background:#fff3a3}
.sb-timeline{list-style:none;counter-reset:step;margin:1rem 0;padding:0}
.sb-step{position:relative;counter-increment:step;padding:0 0 1.1rem 2.6rem}
.sb-step::before{content:counter(step);position:absolute;left:0;top:.1rem;width:1.75rem;height:1.75rem;border-radius:50%;display:grid;place-items:center;font-size:.8rem;font-weight:600;border:2px solid var(--line);background:#fff;color:var(--muted)}
.sb-step::after{content:"";position:absolute;left:.85rem;top:2.05rem;bottom:.15rem;width:2px;background:var(--line)}
.sb-step:last-child::after{display:none}
.sb-step-active::before{border-color:#0969da;color:#0969da}
.sb-step-done::before{content:"✓";background:#1a7f37;border-color:#1a7f37;color:#fff}
.sb-step-done::after{background:#1a7f37}
.sb-step-body>:first-child{font-weight:600;margin-top:0}
@media print{main{padding:0}}
`;

/** Página inteira como documento HTML autônomo (abre em qualquer navegador). */
export function documentToHtml(state: unknown, meta: ExportMeta, opts: HtmlOptions = {}): string {
  const nodes = rootChildren(state);
  const ctx: HtmlCtx = { headings: collectHeadings(nodes), next: 0 };
  const body = htmlBlocks(nodes, opts, ctx);
  const title = meta.title || "Sem título";
  const icon = meta.icon && !meta.icon.includes(":") ? `${esc(meta.icon)} ` : "";
  const hasMath = JSON.stringify(state).includes('"type":"equation"');
  const font = opts.fontFamily ? `body{font-family:${opts.fontFamily.replace(/[<>{}]/g, "")}}` : "";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="generator" content="RoboStage · StageBook">
${hasMath ? `<link rel="stylesheet" href="${KATEX_CSS}">\n` : ""}<style>${HTML_CSS}${font}</style>
</head>
<body>
<main>
<h1 class="sb-title">${icon}${esc(title)}</h1>
${meta.description ? `<p class="sb-desc">${esc(meta.description)}</p>\n` : ""}${
    meta.properties?.length
      ? `<dl class="sb-props">${meta.properties.map((p) => `<dt>${esc(p.label)}</dt><dd>${esc(p.value)}</dd>`).join("")}</dl>\n`
      : ""
  }${body}
</main>
</body>
</html>
`;
}

/** Nome de arquivo seguro a partir do título. */
export function exportFileName(title: string, ext: string) {
  const base =
    (title || "pagina")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 80) || "pagina";
  return `${base}.${ext}`;
}
