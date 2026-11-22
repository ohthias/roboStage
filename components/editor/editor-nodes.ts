import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { CalloutNode } from "./nodes/callout-node";
import {
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
} from "./nodes/collapsible-nodes";
import { DividerNode } from "./nodes/divider-node";
import { EmbedNode } from "./nodes/embed-node";
import { EquationNode } from "./nodes/equation-node";
import { LayoutContainerNode, LayoutItemNode } from "./nodes/layout-nodes";
import { TimelineItemNode, TimelineNode } from "./nodes/timeline-nodes";
import { TabNode, TabsNode } from "./nodes/tabs-nodes";
import { PageMentionNode } from "./nodes/page-mention-node";
import { SmartBlockNode } from "./nodes/smart-block-node";
import { SyncedBlockNode } from "./nodes/synced-block-node";
import { TocNode } from "./nodes/toc-node";

/** Nós registrados no editor (usado também para gerar conteúdo fora da tela). */
export const EDITOR_NODES = [
  CalloutNode,
  CodeNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  HeadingNode,
  HorizontalRuleNode, // mantido para ler documentos antigos (vira DividerNode)
  DividerNode,
  EmbedNode,
  EquationNode,
  LayoutContainerNode,
  LayoutItemNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TimelineItemNode,
  TimelineNode,
  TocNode,
  TabsNode,
  TabNode,
  PageMentionNode,
  SmartBlockNode,
  SyncedBlockNode,
];
