import {
  $createParagraphNode,
  $isElementNode,
  ElementNode,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
} from "lexical";
import { lucideSvg, type LucideSvgName } from "../lucide-svg";

/* ------------------------------------------------------------------ */
/* Bloco de destaque (callout): Info, Alerta e Fazer                    */
/* ------------------------------------------------------------------ */

export type CalloutVariant = "info" | "alerta" | "fazer";

export const CALLOUT_VARIANTS: {
  value: CalloutVariant;
  label: string;
  /** Ícone padrão (Lucide) — cada tipo tem forma própria, não só cor. */
  icon: LucideSvgName;
  /** Equivalente em emoji, usado no Markdown. */
  emoji: string;
  description: string;
}[] = [
  { value: "info", label: "Info", icon: "info", emoji: "ℹ️", description: "Nota ou dica para o leitor" },
  { value: "alerta", label: "Alerta", icon: "triangle-alert", emoji: "⚠️", description: "Cuidado, risco ou aviso importante" },
  { value: "fazer", label: "Fazer", icon: "square-check-big", emoji: "✅", description: "Ação, próximo passo ou tarefa" },
];

export function isCalloutVariant(value: unknown): value is CalloutVariant {
  return value === "info" || value === "alerta" || value === "fazer";
}

export function calloutDefaultEmoji(variant: CalloutVariant) {
  return CALLOUT_VARIANTS.find((v) => v.value === variant)!.emoji;
}

export function calloutIconName(variant: CalloutVariant): LucideSvgName {
  return CALLOUT_VARIANTS.find((v) => v.value === variant)!.icon;
}

/** Mostra o emoji escolhido ou, sem ele, o ícone Lucide do tipo. */
function paintIcon(el: Element, variant: CalloutVariant, emoji: string | null) {
  if (emoji) {
    el.textContent = emoji;
    el.setAttribute("data-icon", "emoji");
  } else {
    el.innerHTML = lucideSvg(calloutIconName(variant), 18, 2.2);
    el.setAttribute("data-icon", "lucide");
  }
}

export type SerializedCalloutNode = Spread<
  { variant: CalloutVariant; emoji: string | null },
  SerializedElementNode
>;

export class CalloutNode extends ElementNode {
  __variant: CalloutVariant;
  /** Emoji escolhido pelo usuário; null = ícone Lucide padrão do tipo. */
  __emoji: string | null;

  constructor(variant: CalloutVariant = "info", emoji: string | null = null, key?: NodeKey) {
    super(key);
    this.__variant = variant;
    this.__emoji = emoji;
  }

  static getType(): string {
    return "callout";
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__variant, node.__emoji, node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-callout";
    dom.dataset.variant = this.__variant;

    const icon = document.createElement("button");
    icon.type = "button";
    icon.className = "editor-callout-icon";
    icon.contentEditable = "false";
    icon.tabIndex = -1;
    icon.title = "Mudar tipo ou ícone";
    icon.setAttribute("aria-label", "Mudar tipo ou ícone do destaque");
    paintIcon(icon, this.__variant, this.__emoji);

    const body = document.createElement("div");
    body.className = "editor-callout-body";

    dom.append(icon, body);
    return dom;
  }

  getDOMSlot(element: HTMLElement) {
    const body = element.querySelector<HTMLElement>(":scope > .editor-callout-body");
    return super.getDOMSlot(element).withElement(body ?? element);
  }

  updateDOM(prev: CalloutNode, dom: HTMLElement): boolean {
    if (prev.__variant !== this.__variant) dom.dataset.variant = this.__variant;
    if (prev.__variant !== this.__variant || prev.__emoji !== this.__emoji) {
      const icon = dom.querySelector(":scope > .editor-callout-icon");
      if (icon) paintIcon(icon, this.__variant, this.__emoji);
    }
    return false;
  }

  static importJSON(json: SerializedCalloutNode): CalloutNode {
    return $createCalloutNode(
      isCalloutVariant(json.variant) ? json.variant : "info",
      typeof json.emoji === "string" ? json.emoji : null,
    ).updateFromJSON(json);
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      type: "callout",
      version: 1,
      variant: this.__variant,
      emoji: this.__emoji,
    };
  }

  getVariant(): CalloutVariant {
    return this.getLatest().__variant;
  }

  setVariant(variant: CalloutVariant): this {
    const self = this.getWritable();
    self.__variant = variant;
    return self;
  }

  getEmoji(): string | null {
    return this.getLatest().__emoji;
  }

  setEmoji(emoji: string | null): this {
    const self = this.getWritable();
    self.__emoji = emoji;
    return self;
  }

  canIndent(): boolean {
    return false;
  }

  /** Enter cria um parágrafo abaixo (Shift+Enter quebra a linha dentro). */
  insertNewAfter(_selection: RangeSelection, restoreSelection = true): ElementNode {
    const paragraph = $createParagraphNode();
    this.insertAfter(paragraph, restoreSelection);
    return paragraph;
  }

  /** Backspace no começo vira parágrafo comum. */
  collapseAtStart(): boolean {
    const paragraph = $createParagraphNode();
    this.getChildren().forEach((child) => paragraph.append(child));
    this.replace(paragraph);
    paragraph.selectStart();
    return true;
  }
}

export function $createCalloutNode(variant: CalloutVariant = "info", emoji: string | null = null) {
  return new CalloutNode(variant, emoji);
}

export function $isCalloutNode(node: LexicalNode | null | undefined): node is CalloutNode {
  return node instanceof CalloutNode;
}

/** Converte um bloco de texto em destaque, ou insere um destaque vazio abaixo. */
export function $insertCallout(anchorBlock: LexicalNode | null, variant: CalloutVariant) {
  if ($isCalloutNode(anchorBlock)) {
    anchorBlock.setVariant(variant).setEmoji(null);
    anchorBlock.selectEnd();
    return anchorBlock;
  }
  const callout = $createCalloutNode(variant);
  if (
    anchorBlock &&
    $isElementNode(anchorBlock) &&
    !anchorBlock.isInline() &&
    (anchorBlock.getType() === "paragraph" || anchorBlock.getType() === "heading" || anchorBlock.getType() === "quote")
  ) {
    callout.append(...anchorBlock.getChildren());
    anchorBlock.replace(callout);
  } else if (anchorBlock) {
    anchorBlock.insertAfter(callout);
  }
  callout.selectEnd();
  return callout;
}
