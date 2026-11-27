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

// KaTeX (JS + CSS + fontes) só carrega quando a página tem uma equação.
const EquationView = dynamic(() => import("./equation-view").then((m) => m.EquationView), {
  ssr: false,
  loading: () => <span className="editor-equation-loading">…</span>,
});

export type SerializedEquationNode = Spread<
  { equation: string; inline: boolean },
  SerializedLexicalNode
>;

/**
 * Equação matemática em LaTeX (KaTeX). Inline (`$x^2$`, no meio do texto) ou
 * em bloco (`$$`, centralizada em linha própria).
 */
export class EquationNode extends DecoratorNode<JSX.Element> {
  __equation: string;
  __inline: boolean;

  constructor(equation = "", inline = false, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline;
  }

  static getType(): string {
    return "equation";
  }

  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }

  static importJSON(json: SerializedEquationNode): EquationNode {
    return $createEquationNode(String(json.equation ?? ""), Boolean(json.inline));
  }

  exportJSON(): SerializedEquationNode {
    return {
      ...super.exportJSON(),
      type: "equation",
      version: 1,
      equation: this.__equation,
      inline: this.__inline,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement(this.__inline ? "span" : "div");
    el.className = this.__inline ? "editor-equation-inline" : "editor-equation-block";
    return el;
  }

  updateDOM(prev: EquationNode): boolean {
    return prev.__inline !== this.__inline;
  }

  getTextContent(): string {
    return this.__inline ? `$${this.__equation}$` : `$$${this.__equation}$$`;
  }

  isInline(): boolean {
    return this.__inline;
  }

  getEquation(): string {
    return this.getLatest().__equation;
  }

  setEquation(equation: string): this {
    const self = this.getWritable();
    self.__equation = equation;
    return self;
  }

  decorate(): JSX.Element {
    return <EquationView nodeKey={this.__key} equation={this.__equation} inline={this.__inline} />;
  }
}

export function $createEquationNode(equation = "", inline = false): EquationNode {
  return $applyNodeReplacement(new EquationNode(equation, inline));
}

export function $isEquationNode(node: LexicalNode | null | undefined): node is EquationNode {
  return node instanceof EquationNode;
}
