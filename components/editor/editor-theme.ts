import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
  paragraph: "editor-paragraph my-1 leading-7",
  heading: {
    h1: "mt-8 mb-2 text-3xl font-bold tracking-tight",
    h2: "mt-6 mb-2 text-2xl font-semibold tracking-tight",
    h3: "mt-4 mb-1 text-xl font-semibold",
  },
  quote:
    "my-3 border-l-4 border-base-content/20 pl-4 italic text-base-content/70",
  list: {
    ul: "editor-ul my-1 list-disc pl-6",
    ol: "editor-ol my-1 list-decimal pl-6",
    listitem: "my-0.5 leading-7",
    listitemChecked: "editor-li-checked",
    listitemUnchecked: "editor-li-unchecked",
    nested: { listitem: "list-none" },
    olDepth: ["list-decimal", "list-[lower-alpha]", "list-[lower-roman]"],
    ulDepth: ["list-disc", "list-[circle]", "list-[square]"],
  },
  link: "cursor-pointer text-primary underline underline-offset-2",
  layoutContainer: "editor-layout",
  layoutItem: "editor-layout-item",
  hr: "my-6 h-px border-0 bg-base-content/15 [&.selected]:ring-2 [&.selected]:ring-primary/50",
  hrSelected: "ring-2 ring-primary/50",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "rounded bg-base-200 px-1.5 py-0.5 font-mono text-[0.85em] text-error",
  },
  code: "editor-code relative my-4 block overflow-x-auto whitespace-pre rounded-xl bg-[#0d1117] py-4 pl-14 pr-24 font-mono text-[13px] leading-6 text-[#e6edf3] [tab-size:2]",
  table: "editor-table my-4 w-full table-fixed border-collapse",
  tableScrollableWrapper: "my-4 overflow-x-auto",
  tableRow: "",
  tableCell:
    "editor-table-cell relative min-w-24 border border-base-300 px-3 py-2 text-left align-top",
  tableCellHeader: "bg-base-200 font-semibold",
  tableCellSelected: "editor-table-cell-selected",
  tableSelection: "editor-table-selection",
};
