import {
  $createParagraphNode,
  $getRoot,
  ElementNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type Spread,
} from "lexical";

/* ------------------------------------------------------------------ */
/* Container (grid) + colunas, no estilo "seção de colunas" do Notion  */
/* ------------------------------------------------------------------ */

export type SerializedLayoutContainerNode = Spread<
  { templateColumns: string },
  SerializedElementNode
>;

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string;

  constructor(templateColumns = "1fr 1fr", key?: NodeKey) {
    super(key);
    this.__templateColumns = templateColumns;
  }

  static getType(): string {
    return "layout-container";
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.style.gridTemplateColumns = this.__templateColumns;
    dom.setAttribute("data-layout-container", "true");
    const cls = config.theme.layoutContainer;
    dom.className = typeof cls === "string" ? cls : "editor-layout";
    return dom;
  }

  updateDOM(prev: LayoutContainerNode, dom: HTMLElement): boolean {
    if (prev.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }
    return false;
  }

  static importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
    return $createLayoutContainerNode(json.templateColumns);
  }

  exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      type: "layout-container",
      version: 1,
      templateColumns: this.__templateColumns,
    };
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns;
  }

  setTemplateColumns(templateColumns: string): this {
    const self = this.getWritable();
    self.__templateColumns = templateColumns;
    return self;
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

export class LayoutItemNode extends ElementNode {
  static getType(): string {
    return "layout-item";
  }

  static clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.setAttribute("data-layout-item", "true");
    const cls = config.theme.layoutItem;
    dom.className = typeof cls === "string" ? cls : "editor-layout-item";
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(): LayoutItemNode {
    return $createLayoutItemNode();
  }

  exportJSON(): SerializedElementNode {
    return { ...super.exportJSON(), type: "layout-item", version: 1 };
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

export function $createLayoutContainerNode(templateColumns = "1fr 1fr") {
  return new LayoutContainerNode(templateColumns);
}
export function $createLayoutItemNode() {
  return new LayoutItemNode();
}
export function $isLayoutContainerNode(
  node: LexicalNode | null | undefined,
): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode;
}
export function $isLayoutItemNode(
  node: LexicalNode | null | undefined,
): node is LayoutItemNode {
  return node instanceof LayoutItemNode;
}

/** Colunas com larguras iguais: "1fr 1fr 1fr". */
export const equalColumns = (n: number) => Array(n).fill("1fr").join(" ");

/** Distribuições de largura oferecidas na barra da seção. */
export const LAYOUT_PRESETS: Record<2 | 3, { label: string; value: string }[]> = {
  2: [
    { label: "1 : 1", value: "1fr 1fr" },
    { label: "1 : 2", value: "1fr 2fr" },
    { label: "2 : 1", value: "2fr 1fr" },
    { label: "1 : 3", value: "1fr 3fr" },
    { label: "3 : 1", value: "3fr 1fr" },
  ],
  3: [
    { label: "1 : 1 : 1", value: "1fr 1fr 1fr" },
    { label: "2 : 1 : 1", value: "2fr 1fr 1fr" },
    { label: "1 : 2 : 1", value: "1fr 2fr 1fr" },
    { label: "1 : 1 : 2", value: "1fr 1fr 2fr" },
  ],
};

/** Insere uma seção de N colunas no lugar do bloco atual (se vazio) ou logo abaixo. */
export function $insertLayout(columns: 2 | 3, anchor: LexicalNode): LayoutContainerNode {
  // Nunca aninha: sobe até o bloco de primeiro nível.
  let top: LexicalNode = anchor;
  while (top.getParent() && top.getParent() !== $getRoot()) {
    top = top.getParent() as LexicalNode;
  }

  const container = $createLayoutContainerNode(equalColumns(columns));
  for (let i = 0; i < columns; i++) {
    const item = $createLayoutItemNode();
    item.append($createParagraphNode());
    container.append(item);
  }

  const isEmptyParagraph =
    top.getType() === "paragraph" &&
    "getTextContentSize" in top &&
    (top as ElementNode).getTextContentSize() === 0;

  if (isEmptyParagraph && top.getParent() === $getRoot()) {
    top.replace(container);
  } else {
    top.insertAfter(container);
  }
  container.getFirstDescendant()?.selectStart?.();
  const firstPara = container.getFirstChild<LayoutItemNode>()?.getFirstChild<ElementNode>();
  firstPara?.selectStart();
  return container;
}

/** Muda o número de colunas preservando o conteúdo. */
export function $setLayoutColumns(container: LayoutContainerNode, columns: 2 | 3) {
  const items = container.getChildren<LayoutItemNode>();
  if (items.length === columns) return;
  if (items.length < columns) {
    for (let i = items.length; i < columns; i++) {
      const item = $createLayoutItemNode();
      item.append($createParagraphNode());
      container.append(item);
    }
  } else {
    // Junta o conteúdo das colunas excedentes na última coluna que sobra.
    const keep = items[columns - 1];
    for (let i = columns; i < items.length; i++) {
      items[i].getChildren().forEach((c) => keep.append(c));
      items[i].remove();
    }
  }
  container.setTemplateColumns(equalColumns(columns));
}

/** Desfaz a seção: o conteúdo das colunas vira blocos normais, em sequência. */
export function $unwrapLayout(container: LayoutContainerNode) {
  const blocks: LexicalNode[] = [];
  container.getChildren<LayoutItemNode>().forEach((item) => {
    item.getChildren().forEach((c) => blocks.push(c));
  });
  let anchor: LexicalNode = container;
  blocks.forEach((b) => {
    anchor.insertAfter(b);
    anchor = b;
  });
  container.remove();
}
