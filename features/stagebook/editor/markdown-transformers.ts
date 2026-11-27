import { DEFAULT_TRANSFORMERS } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import {
  CHECK_LIST,
  QUOTE,
  type ElementTransformer,
  type TextMatchTransformer,
  type Transformer,
} from "@lexical/markdown";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { $createQuoteNode, $isHeadingNode, QuoteNode } from "@lexical/rich-text";
import { $createParagraphNode, $isElementNode, $isParagraphNode } from "lexical";
import {
  $buildCollapsible,
  CollapsibleContainerNode,
  type ToggleLevel,
} from "./nodes/collapsible-nodes";
import { $createEquationNode, $isEquationNode, EquationNode } from "./nodes/equation-node";

// "---" / "***" / "___" viram um divisor.
const HR_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? "***" : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode();
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }
    line.selectNext();
  },
  type: "element",
};

/**
 * "> " vira bloco recolhível, como no Notion. Num título ("> " no começo de
 * um H2, por exemplo) vira um título recolhível do mesmo nível.
 */
export const TOGGLE_TRANSFORMER: ElementTransformer = {
  dependencies: [CollapsibleContainerNode],
  export: () => null,
  regExp: /^>\s/,
  replace: (parentNode, children, _match, isImport) => {
    if (isImport) return false;
    if (!$isParagraphNode(parentNode) && !$isHeadingNode(parentNode)) return false;
    const level: ToggleLevel = $isHeadingNode(parentNode) ? (parentNode.getTag() as ToggleLevel) : "p";
    const container = $buildCollapsible(level, children);
    parentNode.replace(container);
    container.getTitle()?.select(0, 0);
  },
  type: "element",
};

/** Com o ">" usado pelo recolhível, a citação passa a ser '" ' (Notion). */
const QUOTE_SHORTCUT: ElementTransformer = {
  dependencies: [QuoteNode],
  export: () => null,
  regExp: /^["“”]\s/,
  replace: (parentNode, children, _match, isImport) => {
    if (isImport) return false;
    const node = $createQuoteNode();
    node.append(...children);
    parentNode.replace(node);
    node.select(0, 0);
  },
  type: "element",
};

/** "$$ " numa linha abre uma equação em bloco. */
const EQUATION_BLOCK: ElementTransformer = {
  dependencies: [EquationNode],
  export: (node) => ($isEquationNode(node) && !node.isInline() ? `$$\n${node.getEquation()}\n$$` : null),
  regExp: /^\$\$\s/,
  replace: (parentNode, children, _match, isImport) => {
    if (isImport) return false;
    const equation = children.map((c) => c.getTextContent()).join("").trim();
    const node = $createEquationNode(equation, false);
    parentNode.replace(node);
    // O parágrafo com o cursor sumiu: o cursor vai para o bloco seguinte
    // (a equação vazia abre o campo de edição sozinha).
    const next = node.getNextSibling();
    if ($isElementNode(next)) next.selectStart();
    else {
      const p = $createParagraphNode();
      node.insertAfter(p);
      p.select();
    }
  },
  type: "element",
};

/**
 * "$x^2$" vira equação inline. Exige caractere não-espaço logo após o "$" de
 * abertura e antes do de fechamento, e nada de letra/número antes da abertura,
 * para não pegar valores em reais ("R$ 10 e R$ 20").
 */
export const EQUATION_INLINE: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => ($isEquationNode(node) && node.isInline() ? `$${node.getEquation()}$` : null),
  importRegExp: /(?<![\p{L}\p{N}$\\])\$([^$\s](?:[^$\n]*[^$\s\\])?)\$/u,
  regExp: /(?<![\p{L}\p{N}$\\])\$([^$\s](?:[^$\n]*[^$\s\\])?)\$$/u,
  replace: (textNode, match) => {
    textNode.replace($createEquationNode(match[1], true));
  },
  trigger: "$",
  type: "text-match",
};

/** Atalhos de digitação (markdown) do editor de páginas. */
export const MARKDOWN_SHORTCUTS: Transformer[] = [
  HR_TRANSFORMER,
  CHECK_LIST, // "[] " / "- [ ] " → lista de tarefas (antes da lista comum)
  TOGGLE_TRANSFORMER,
  QUOTE_SHORTCUT,
  EQUATION_BLOCK,
  EQUATION_INLINE,
  ...DEFAULT_TRANSFORMERS.filter((t) => t !== QUOTE),
];
