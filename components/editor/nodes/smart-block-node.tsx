import type { JSX } from "react";
import dynamic from "next/dynamic";
import {
  $applyNodeReplacement,
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { EmbedSkeleton } from "../embeds/embed-shell";

/**
 * Blocos inteligentes: componentes próprios do Stagebook com dados
 * estruturados guardados no próprio nó (salvos junto com a página).
 *  - robot-sheet            ficha do robô (puxa o caderno do QuickBrick)
 *  - competition-checklist  checklist de competição (modelos do ConfereAí)
 *  - programming-strategy   estratégia de programação de uma missão
 *  - decision               registro de decisão da equipe
 *  - decision-log           índice de todas as decisões do espaço
 */
export type SmartBlockKind =
  | "robot-sheet"
  | "competition-checklist"
  | "programming-strategy"
  | "decision"
  | "decision-log";

export const SMART_BLOCK_KINDS: SmartBlockKind[] = [
  "robot-sheet",
  "competition-checklist",
  "programming-strategy",
  "decision",
  "decision-log",
];

export const SMART_BLOCK_LABELS: Record<SmartBlockKind, string> = {
  "robot-sheet": "Ficha do robô",
  "competition-checklist": "Checklist de competição",
  "programming-strategy": "Estratégia de programação",
  decision: "Registro de decisão",
  "decision-log": "Histórico de decisões",
};

export type SmartBlockData = Record<string, unknown>;

const loading = () => <EmbedSkeleton height="h-40" />;
const RobotSheetBlock = dynamic(() => import("../smart-blocks/robot-sheet-block").then((m) => m.RobotSheetBlock), { ssr: false, loading });
const ChecklistBlock = dynamic(() => import("../smart-blocks/checklist-block").then((m) => m.ChecklistBlock), { ssr: false, loading });
const StrategyBlock = dynamic(() => import("../smart-blocks/strategy-block").then((m) => m.StrategyBlock), { ssr: false, loading });
const DecisionBlock = dynamic(() => import("../smart-blocks/decision-block").then((m) => m.DecisionBlock), { ssr: false, loading });
const DecisionLogBlock = dynamic(() => import("../smart-blocks/decision-log-block").then((m) => m.DecisionLogBlock), { ssr: false, loading });

export type SerializedSmartBlockNode = Spread<{ kind: SmartBlockKind; data: SmartBlockData }, SerializedLexicalNode>;

export class SmartBlockNode extends DecoratorNode<JSX.Element> {
  __kind: SmartBlockKind;
  __data: SmartBlockData;

  constructor(kind: SmartBlockKind, data: SmartBlockData = {}, key?: NodeKey) {
    super(key);
    this.__kind = kind;
    this.__data = data;
  }

  static getType(): string {
    return "smart-block";
  }

  static clone(node: SmartBlockNode): SmartBlockNode {
    return new SmartBlockNode(node.__kind, node.__data, node.__key);
  }

  static importJSON(json: SerializedSmartBlockNode): SmartBlockNode {
    const kind = SMART_BLOCK_KINDS.includes(json.kind) ? json.kind : "decision";
    const data = json.data && typeof json.data === "object" ? json.data : {};
    return $createSmartBlockNode(kind, data);
  }

  exportJSON(): SerializedSmartBlockNode {
    return { ...super.exportJSON(), type: "smart-block", version: 1, kind: this.__kind, data: this.__data };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement("div");
    el.className = "editor-smart-block";
    el.dataset.kind = this.__kind;
    return el;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return `[${SMART_BLOCK_LABELS[this.__kind]}]`;
  }

  isInline(): false {
    return false;
  }

  getKind() {
    return this.getLatest().__kind;
  }

  getData() {
    return this.getLatest().__data;
  }

  setData(data: SmartBlockData): this {
    const self = this.getWritable();
    self.__data = data;
    return self;
  }

  decorate(): JSX.Element {
    const props = { nodeKey: this.__key, data: this.__data };
    switch (this.__kind) {
      case "robot-sheet":
        return <RobotSheetBlock {...props} />;
      case "competition-checklist":
        return <ChecklistBlock {...props} />;
      case "programming-strategy":
        return <StrategyBlock {...props} />;
      case "decision":
        return <DecisionBlock {...props} />;
      case "decision-log":
        return <DecisionLogBlock {...props} />;
    }
  }
}

export function $createSmartBlockNode(kind: SmartBlockKind, data: SmartBlockData = {}): SmartBlockNode {
  return $applyNodeReplacement(new SmartBlockNode(kind, data));
}

export function $isSmartBlockNode(node: LexicalNode | null | undefined): node is SmartBlockNode {
  return node instanceof SmartBlockNode;
}
