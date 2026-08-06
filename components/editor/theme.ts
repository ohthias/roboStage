import type { EditorThemeClasses } from "lexical";

/**
 * Tema visual do editor. Cada chave corresponde a um tipo de nó do Lexical;
 * o valor é a(s) classe(s) CSS aplicada(s) ao elemento renderizado.
 * Mantido alinhado à paleta daisyUI (base-*, primary, etc) do resto do app.
 */
export const editorTheme: EditorThemeClasses = {
  paragraph: "mb-3 leading-relaxed last:mb-0",
  heading: {
    h1: "mb-3 mt-6 text-3xl font-bold first:mt-0",
    h2: "mb-2 mt-5 text-2xl font-bold first:mt-0",
    h3: "mb-2 mt-4 text-xl font-semibold first:mt-0",
  },
  quote:
    "my-3 border-l-4 border-primary/40 pl-4 italic text-base-content/70",
  list: {
    ul: "mb-3 ml-5 list-disc",
    ol: "mb-3 ml-5 list-decimal",
    listitem: "mb-1 pl-1",
    nested: { listitem: "list-none" },
    checklist: "editor-checklist mb-3 ml-1",
  },
  code: "editor-code my-3 block overflow-x-auto rounded-lg bg-base-300 p-4 font-mono text-sm",
  codeHighlight: {
    atrule: "text-primary",
    attr: "text-primary",
    boolean: "text-secondary",
    builtin: "text-accent",
    cdata: "text-base-content/60",
    char: "text-success",
    class: "text-warning",
    "class-name": "text-warning",
    comment: "italic text-base-content/40",
    constant: "text-secondary",
    deleted: "text-error",
    doctype: "text-base-content/60",
    entity: "text-accent",
    function: "text-warning",
    important: "font-semibold text-error",
    inserted: "text-success",
    keyword: "text-primary",
    namespace: "text-accent",
    number: "text-secondary",
    operator: "text-base-content/80",
    prolog: "text-base-content/60",
    property: "text-warning",
    punctuation: "text-base-content/60",
    regex: "text-success",
    selector: "text-success",
    string: "text-success",
    symbol: "text-secondary",
    tag: "text-error",
    url: "text-info underline",
    variable: "text-warning",
  },
  link: "text-primary underline underline-offset-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "rounded bg-base-300 px-1.5 py-0.5 font-mono text-[0.85em]",
  },
};
