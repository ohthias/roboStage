import {
  $createParagraphNode,
  $getRoot,
  $isElementNode,
  $isParagraphNode,
  ElementNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
} from "lexical";

/* ------------------------------------------------------------------ */
/* Bloco recolhível (toggle) no estilo Notion                          */
/*                                                                     */
/*  CollapsibleContainerNode  ─┬─ CollapsibleTitleNode   (texto)       */
/*                             └─ CollapsibleContentNode (blocos)      */
/*                                                                     */
/* O título pode ter tamanho de texto ou de título (h1–h6): é o        */
/* "toggle heading" do Notion. A seta fica no container, fora da área  */
/* editável (getDOMSlot).                                              */
/* ------------------------------------------------------------------ */

export type ToggleLevel = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const TOGGLE_LEVELS: ToggleLevel[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

export function isToggleLevel(value: unknown): value is ToggleLevel {
  return typeof value === "string" && (TOGGLE_LEVELS as string[]).includes(value);
}

/* ---------- container ---------- */

export type SerializedCollapsibleContainerNode = Spread<
  { open: boolean },
  SerializedElementNode
>;

export class CollapsibleContainerNode extends ElementNode {
  __open: boolean;

  constructor(open = true, key?: NodeKey) {
    super(key);
    this.__open = open;
  }

  static getType(): string {
    return "collapsible-container";
  }

  static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
    return new CollapsibleContainerNode(node.__open, node.__key);
  }

  static withTitleAndContent(
    level: ToggleLevel,
    titleChildren: LexicalNode[],
    contentBlocks: LexicalNode[],
  ): CollapsibleContainerNode {
    const container = new CollapsibleContainerNode(true);
    const title = new CollapsibleTitleNode(level);
    const content = new CollapsibleContentNode();
    if (titleChildren.length) title.append(...titleChildren);
    content.append(...(contentBlocks.length ? contentBlocks : [$createParagraphNode()]));
    container.append(title, content);
    return container;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-toggle";
    dom.dataset.open = String(this.__open);

    const chevron = document.createElement("button");
    chevron.type = "button";
    chevron.className = "editor-toggle-chevron";
    chevron.contentEditable = "false";
    chevron.tabIndex = -1;
    chevron.setAttribute("aria-label", this.__open ? "Recolher" : "Expandir");
    chevron.setAttribute("aria-expanded", String(this.__open));
    chevron.innerHTML =
      '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const body = document.createElement("div");
    body.className = "editor-toggle-body";

    dom.append(chevron, body);
    return dom;
  }

  getDOMSlot(element: HTMLElement) {
    const body = element.querySelector<HTMLElement>(":scope > .editor-toggle-body");
    return super.getDOMSlot(element).withElement(body ?? element);
  }

  updateDOM(prev: CollapsibleContainerNode, dom: HTMLElement): boolean {
    if (prev.__open !== this.__open) {
      dom.dataset.open = String(this.__open);
      const chevron = dom.querySelector(":scope > .editor-toggle-chevron");
      chevron?.setAttribute("aria-expanded", String(this.__open));
      chevron?.setAttribute("aria-label", this.__open ? "Recolher" : "Expandir");
    }
    return false;
  }

  static importJSON(json: SerializedCollapsibleContainerNode): CollapsibleContainerNode {
    return $createCollapsibleContainerNode(json.open !== false).updateFromJSON(json);
  }

  exportJSON(): SerializedCollapsibleContainerNode {
    return {
      ...super.exportJSON(),
      type: "collapsible-container",
      version: 1,
      open: this.__open,
    };
  }

  getOpen(): boolean {
    return this.getLatest().__open;
  }

  setOpen(open: boolean): this {
    const self = this.getWritable();
    self.__open = open;
    return self;
  }

  toggleOpen(): this {
    return this.setOpen(!this.getOpen());
  }

  getTitle(): CollapsibleTitleNode | null {
    const first = this.getFirstChild();
    return $isCollapsibleTitleNode(first) ? first : null;
  }

  getContent(): CollapsibleContentNode | null {
    const last = this.getLastChild();
    return $isCollapsibleContentNode(last) ? last : null;
  }

  canBeEmpty(): boolean {
    return false;
  }

  canIndent(): boolean {
    return false;
  }
}

/* ---------- título ---------- */

export type SerializedCollapsibleTitleNode = Spread<
  { level: ToggleLevel },
  SerializedElementNode
>;

export class CollapsibleTitleNode extends ElementNode {
  __level: ToggleLevel;

  constructor(level: ToggleLevel = "p", key?: NodeKey) {
    super(key);
    this.__level = level;
  }

  static getType(): string {
    return "collapsible-title";
  }

  static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
    return new CollapsibleTitleNode(node.__level, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-toggle-title";
    dom.dataset.level = this.__level;
    if (this.__level !== "p") {
      const theme = config.theme.heading as Record<string, string> | undefined;
      const cls = theme?.[this.__level];
      if (cls) dom.className += ` ${cls}`;
      dom.setAttribute("role", "heading");
      dom.setAttribute("aria-level", this.__level.slice(1));
    }
    return dom;
  }

  updateDOM(prev: CollapsibleTitleNode): boolean {
    return prev.__level !== this.__level;
  }

  static importJSON(json: SerializedCollapsibleTitleNode): CollapsibleTitleNode {
    return $createCollapsibleTitleNode(isToggleLevel(json.level) ? json.level : "p").updateFromJSON(json);
  }

  exportJSON(): SerializedCollapsibleTitleNode {
    return {
      ...super.exportJSON(),
      type: "collapsible-title",
      version: 1,
      level: this.__level,
    };
  }

  getLevel(): ToggleLevel {
    return this.getLatest().__level;
  }

  setLevel(level: ToggleLevel): this {
    const self = this.getWritable();
    self.__level = level;
    return self;
  }

  canIndent(): boolean {
    return false;
  }

  /** Enter no título: entra no conteúdo (aberto) ou cria um bloco abaixo (fechado). */
  insertNewAfter(_selection: RangeSelection, restoreSelection = true): ElementNode {
    const container = this.getParent();
    if (!$isCollapsibleContainerNode(container)) {
      return super.insertNewAfter(_selection, restoreSelection) as ElementNode;
    }
    if (container.getOpen()) {
      const content = container.getContent();
      if (content) {
        const first = content.getFirstChild();
        // Conteúdo ainda vazio: usa o parágrafo que já está lá.
        if ($isParagraphNode(first) && first.getTextContentSize() === 0 && first.getChildrenSize() === 0) {
          first.select();
          return first;
        }
        const paragraph = $createParagraphNode();
        if (first) first.insertBefore(paragraph);
        else content.append(paragraph);
        paragraph.select();
        return paragraph;
      }
    }
    const paragraph = $createParagraphNode();
    container.insertAfter(paragraph, restoreSelection);
    return paragraph;
  }

  /** Backspace no começo do título desfaz o bloco recolhível. */
  collapseAtStart(): boolean {
    const container = this.getParent();
    if ($isCollapsibleContainerNode(container)) {
      $unwrapCollapsible(container);
      return true;
    }
    return false;
  }
}

/* ---------- conteúdo ---------- */

export class CollapsibleContentNode extends ElementNode {
  static getType(): string {
    return "collapsible-content";
  }

  static clone(node: CollapsibleContentNode): CollapsibleContentNode {
    return new CollapsibleContentNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-toggle-content";
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(json: SerializedElementNode): CollapsibleContentNode {
    return $createCollapsibleContentNode().updateFromJSON(json);
  }

  exportJSON(): SerializedElementNode {
    return { ...super.exportJSON(), type: "collapsible-content", version: 1 };
  }

  isShadowRoot(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  canIndent(): boolean {
    return false;
  }
}

/* ---------- helpers ---------- */

export function $createCollapsibleContainerNode(open = true) {
  return new CollapsibleContainerNode(open);
}
export function $createCollapsibleTitleNode(level: ToggleLevel = "p") {
  return new CollapsibleTitleNode(level);
}
export function $createCollapsibleContentNode() {
  return new CollapsibleContentNode();
}
export function $isCollapsibleContainerNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
  return node instanceof CollapsibleContainerNode;
}
export function $isCollapsibleTitleNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
  return node instanceof CollapsibleTitleNode;
}
export function $isCollapsibleContentNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
  return node instanceof CollapsibleContentNode;
}

/** Monta um bloco recolhível com o título e o conteúdo dados (aberto). */
export function $buildCollapsible(
  level: ToggleLevel = "p",
  titleChildren: LexicalNode[] = [],
  contentBlocks: LexicalNode[] = [],
): CollapsibleContainerNode {
  return CollapsibleContainerNode.withTitleAndContent(level, titleChildren, contentBlocks);
}

/**
 * Converte um bloco (parágrafo, título…) em recolhível. O texto do bloco vira
 * o título. Retorna o título para posicionar o cursor.
 */
export function $wrapInCollapsible(block: ElementNode, level: ToggleLevel = "p"): CollapsibleTitleNode {
  const container = $buildCollapsible(level, block.getChildren());
  block.replace(container);
  const title = container.getTitle()!;
  title.selectEnd();
  return title;
}

/** Desfaz o recolhível: o título vira parágrafo e o conteúdo segue abaixo. */
export function $unwrapCollapsible(container: CollapsibleContainerNode): ElementNode {
  const title = container.getTitle();
  const content = container.getContent();
  const paragraph = $createParagraphNode();
  if (title) paragraph.append(...title.getChildren());
  container.insertBefore(paragraph);
  let anchor: LexicalNode = paragraph;
  const blocks = content?.getChildren() ?? [];
  // Conteúdo que é só um parágrafo vazio não deixa linha sobrando.
  const onlyEmpty =
    blocks.length === 1 && $isParagraphNode(blocks[0]) && blocks[0].getChildrenSize() === 0;
  (onlyEmpty ? [] : blocks).forEach((child) => {
    anchor.insertAfter(child);
    anchor = child;
  });
  container.remove();
  paragraph.selectStart();
  return paragraph;
}

/** Insere um recolhível no lugar do bloco vazio (ou logo abaixo). */
export function $insertCollapsible(anchorBlock: LexicalNode | null, level: ToggleLevel = "p") {
  const container = $buildCollapsible(level);
  const isEmptyBlock =
    anchorBlock &&
    $isElementNode(anchorBlock) &&
    anchorBlock.getType() === "paragraph" &&
    anchorBlock.getTextContentSize() === 0;
  if (anchorBlock && isEmptyBlock) anchorBlock.replace(container);
  else if (anchorBlock) anchorBlock.insertAfter(container);
  else $getRoot().append(container);
  container.getTitle()?.select();
  return container;
}
