import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { DividerNode } from "./nodes/divider-node";
import { LayoutContainerNode, LayoutItemNode } from "./nodes/layout-nodes";

/** Nós registrados no editor (usado também para gerar conteúdo fora da tela). */
export const EDITOR_NODES = [
  CodeNode,
  HeadingNode,
  HorizontalRuleNode, // mantido para ler documentos antigos (vira DividerNode)
  DividerNode,
  LayoutContainerNode,
  LayoutItemNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  TableCellNode,
  TableNode,
  TableRowNode,
];
