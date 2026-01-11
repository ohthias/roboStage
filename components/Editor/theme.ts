import { EditorThemeClasses } from "lexical";

const theme: EditorThemeClasses = {
  paragraph: "mb-3",

  heading: {
    h1: "text-3xl font-semibold mt-6 mb-3",
    h2: "text-2xl font-semibold mt-5 mb-3",
    h3: "text-xl font-semibold mt-4 mb-2",
  },

  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    code:
      "font-mono bg-base-200 px-1.5 py-0.5 rounded text-sm",
  },

  code:
    "block bg-base-200 text-sm font-mono p-4 rounded-lg my-4 overflow-x-auto",

  codeHighlight: {
    comment: "text-base-content/40 italic",
    keyword: "text-primary",
    string: "text-success",
    function: "text-secondary",
    number: "text-warning",
    operator: "text-base-content",
    punctuation: "text-base-content/60",
    class: "text-info",
    variable: "text-accent",
  },

  list: {
    ul: "list-disc pl-6 my-3",
    ol: "list-decimal pl-6 my-3",
    listitem: "mb-1",
  },

  quote:
    "border-l-2 border-base-300 pl-4 italic text-base-content/70 my-3",

  align: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  },
};

export default theme;