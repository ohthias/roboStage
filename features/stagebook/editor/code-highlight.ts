/**
 * Tokenizador leve (sem dependências) usado com a CSS Custom Highlight API.
 * Não altera os nós do Lexical: só pinta intervalos de texto.
 */
export type TokenType =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "function"
  | "type"
  | "property"
  | "tag"
  | "operator";

export type Token = { start: number; end: number; type: TokenType };

export const CODE_LANGUAGES: { value: string; label: string }[] = [
  { value: "plain", label: "Texto simples" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX / JSX" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];

const ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "tsx",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  xml: "html",
  svg: "html",
  "c#": "csharp",
  cs: "csharp",
  "c++": "cpp",
  golang: "go",
  rs: "rust",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
  scss: "css",
  less: "css",
};

export function normalizeLanguage(lang: string | null | undefined): string {
  const l = (lang ?? "").toLowerCase().trim();
  if (!l) return "plain";
  return ALIASES[l] ?? l;
}

const JS_KW =
  "break case catch class const continue debugger default delete do else export extends finally for from function if import in instanceof let new of return static super switch this throw try typeof var void while with yield async await as null true false undefined interface type enum implements public private protected readonly abstract declare namespace keyof satisfies";
const KEYWORDS: Record<string, string> = {
  javascript: JS_KW,
  typescript: JS_KW,
  tsx: JS_KW,
  python:
    "and as assert async await break class continue def del elif else except finally for from global if import in is lambda None nonlocal not or pass raise return try while with yield True False self print",
  bash: "if then else elif fi for while do done case esac function in return export local echo cd ls cat grep sudo exit set unset source alias",
  sql: "select from where and or not insert into values update set delete create table alter drop index join left right inner outer full on group by order having limit offset as distinct union all null is in like between exists case when then else end primary key foreign references default unique count sum avg min max asc desc with",
  java: "abstract boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void volatile while true false var record",
  csharp:
    "abstract as async await base bool break case catch char class const continue decimal default delegate do double else enum event false finally float for foreach if in int interface internal is lock long namespace new null object out override private protected public readonly ref return sealed short static string struct switch this throw true try typeof uint ulong using var virtual void while record",
  c: "auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while NULL true false #include #define",
  cpp: "auto break case catch char class const constexpr continue default delete do double else enum explicit extern false float for friend goto if inline int long namespace new nullptr operator private protected public return short signed sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void volatile while",
  go: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false",
  rust: "as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while",
  php: "abstract and array as break case catch class clone const continue declare default do echo else elseif empty extends final finally for foreach function global if implements include interface isset namespace new null or private protected public require return static switch throw trait try use var while true false",
  yaml: "true false null yes no",
  css: "important",
  json: "true false null",
  html: "",
  markdown: "",
};

const HASH_COMMENT = new Set(["python", "bash", "yaml", "php"]);
const SLASH_COMMENT = new Set([
  "javascript", "typescript", "tsx", "java", "csharp", "c", "cpp", "go", "rust", "php", "css",
]);

const cache = new Map<string, RegExp>();

function buildRegex(lang: string): RegExp {
  const hit = cache.get(lang);
  if (hit) return hit;
  const parts: string[] = [];
  // grupos: 1 comentário · 2 string · 3 número · 4 tag html · 5 palavra · 6 operador
  const comments: string[] = [];
  if (SLASH_COMMENT.has(lang)) comments.push("\\/\\/[^\\n]*", "\\/\\*[\\s\\S]*?(?:\\*\\/|$)");
  if (HASH_COMMENT.has(lang)) comments.push("#[^\\n]*");
  if (lang === "sql") comments.push("--[^\\n]*", "\\/\\*[\\s\\S]*?(?:\\*\\/|$)");
  if (lang === "html" || lang === "markdown") comments.push("<!--[\\s\\S]*?(?:-->|$)");
  parts.push(comments.length ? `(${comments.join("|")})` : "(\\b\\B)");
  parts.push(
    lang === "python"
      ? "(\"\"\"[\\s\\S]*?(?:\"\"\"|$)|'''[\\s\\S]*?(?:'''|$)|\"(?:\\\\.|[^\"\\\\\\n])*\"?|'(?:\\\\.|[^'\\\\\\n])*'?)"
      : "(`(?:\\\\[\\s\\S]|[^`\\\\])*`?|\"(?:\\\\.|[^\"\\\\\\n])*\"?|'(?:\\\\.|[^'\\\\\\n])*'?)",
  );
  parts.push("(\\b0x[\\da-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?\\b)");
  parts.push(lang === "html" || lang === "tsx" ? "(<\\/?[A-Za-z][\\w:.-]*|\\/?>)" : "(\\b\\B)");
  parts.push("([A-Za-z_$#@][\\w$-]*)");
  parts.push("(=>|[=!<>]=?=?|&&|\\|\\||[+\\-*/%?:])");
  const re = new RegExp(parts.join("|"), lang === "sql" ? "gi" : "g");
  cache.set(lang, re);
  return re;
}

export function tokenize(code: string, langInput: string): Token[] {
  const lang = normalizeLanguage(langInput);
  if (lang === "plain" || code.length > 60_000) return [];
  const re = buildRegex(lang);
  const kwSet = new Set(
    (KEYWORDS[lang] ?? "").split(" ").filter(Boolean).map((k) => (lang === "sql" ? k.toLowerCase() : k)),
  );
  const tokens: Token[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    const start = m.index;
    const end = start + m[0].length;
    if (m[1]) tokens.push({ start, end, type: "comment" });
    else if (m[2]) {
      // JSON/YAML/objetos: string seguida de ":" vira propriedade.
      const after = code.slice(end).match(/^\s*:/);
      tokens.push({ start, end, type: after && lang !== "python" ? "property" : "string" });
    } else if (m[3]) tokens.push({ start, end, type: "number" });
    else if (m[4]) tokens.push({ start, end, type: "tag" });
    else if (m[5]) {
      const word = lang === "sql" ? m[5].toLowerCase() : m[5];
      if (kwSet.has(word)) tokens.push({ start, end, type: "keyword" });
      else if (/^\s*\(/.test(code.slice(end, end + 20))) tokens.push({ start, end, type: "function" });
      else if (/^[A-Z][A-Za-z0-9]*$/.test(m[5]) && lang !== "sql" && lang !== "bash")
        tokens.push({ start, end, type: "type" });
      else if (lang === "css" && /^\s*:/.test(code.slice(end, end + 10)))
        tokens.push({ start, end, type: "property" });
      else if (lang === "yaml" && /^\s*:/.test(code.slice(end, end + 10)))
        tokens.push({ start, end, type: "property" });
    } else if (m[6]) tokens.push({ start, end, type: "operator" });
  }
  return tokens;
}
