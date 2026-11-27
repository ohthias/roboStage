import {
  $createParagraphNode,
  $isElementNode,
  ElementNode,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type Spread,
} from "lexical";
import { lucideSvg } from "../lucide-svg";

const UNWRAP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/></svg>';
const CLOSE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

/**
 * Desenha a barra de abas. Roda dentro de createDOM/updateDOM: o Lexical
 * desfaz mudanças feitas no DOM do editor fora da reconciliação.
 * Os controles de edição somem por CSS quando o editor está só leitura.
 */
function paintBar(bar: HTMLElement, titles: string[], active: number) {
  bar.replaceChildren();
  titles.forEach((title, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "editor-tab-btn";
    btn.dataset.index = String(i);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(i === active));
    btn.tabIndex = -1;
    btn.title = "Clique para abrir · duplo clique para renomear";
    const label = document.createElement("span");
    label.className = "editor-tab-label";
    label.textContent = title || `Aba ${i + 1}`;
    btn.append(label);
    if (titles.length > 1) {
      const close = document.createElement("span");
      close.className = "editor-tab-close";
      close.setAttribute("role", "button");
      close.setAttribute("aria-label", `Excluir aba ${title || i + 1}`);
      close.title = "Excluir aba";
      close.innerHTML = CLOSE_SVG;
      btn.append(close);
    }
    bar.append(btn);
  });
  const add = document.createElement("button");
  add.type = "button";
  add.className = "editor-tab-add";
  add.tabIndex = -1;
  add.title = "Nova aba";
  add.setAttribute("aria-label", "Nova aba");
  add.innerHTML = lucideSvg("plus", 14);
  const unwrap = document.createElement("button");
  unwrap.type = "button";
  unwrap.className = "editor-tab-unwrap";
  unwrap.tabIndex = -1;
  unwrap.title = "Desfazer abas (cada aba vira um título)";
  unwrap.setAttribute("aria-label", "Desfazer abas");
  unwrap.innerHTML = UNWRAP_SVG;
  bar.append(add, unwrap);
}

/* ------------------------------------------------------------------ */
/* Abas (tabs) — cada aba guarda blocos livres; só uma aparece por vez  */
/*                                                                     */
/*  TabsNode ── TabNode (título) ── parágrafos, listas, embeds…         */
/*                                                                     */
/* A barra de abas fica fora da área editável (getDOMSlot) e é montada  */
/* pelo TabsPlugin a partir dos títulos dos filhos.                    */
/* ------------------------------------------------------------------ */

export type SerializedTabsNode = Spread<{ active: number }, SerializedElementNode>;

export class TabsNode extends ElementNode {
  __active: number;

  constructor(active = 0, key?: NodeKey) {
    super(key);
    this.__active = active;
  }

  static getType(): string {
    return "tabs";
  }

  static clone(node: TabsNode): TabsNode {
    return new TabsNode(node.__active, node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-tabs";
    dom.setAttribute("data-tabs", "true");

    const bar = document.createElement("div");
    bar.className = "editor-tabs-bar";
    bar.contentEditable = "false";
    bar.setAttribute("role", "tablist");

    const panels = document.createElement("div");
    panels.className = "editor-tabs-panels";

    dom.append(bar, panels);
    this.paint(dom);
    return dom;
  }

  getDOMSlot(element: HTMLElement) {
    const panels = element.querySelector<HTMLElement>(":scope > .editor-tabs-panels");
    return super.getDOMSlot(element).withElement(panels ?? element);
  }

  /** Títulos/aba ativa mudaram (filho editado também passa por aqui). */
  updateDOM(_prev: TabsNode, dom: HTMLElement): boolean {
    this.paint(dom);
    return false;
  }

  private paint(dom: HTMLElement) {
    const bar = dom.querySelector<HTMLElement>(":scope > .editor-tabs-bar");
    if (!bar) return;
    const titles = this.getChildren().map((c) => ($isTabNode(c) ? c.getTitle() : ""));
    const signature = JSON.stringify([titles, this.getActive()]);
    if (bar.dataset.sig === signature) return;
    bar.dataset.sig = signature;
    paintBar(bar, titles, this.getActive());
  }

  static importJSON(json: SerializedTabsNode): TabsNode {
    return $createTabsNode(Number.isInteger(json.active) ? json.active : 0).updateFromJSON(json);
  }

  exportJSON(): SerializedTabsNode {
    return { ...super.exportJSON(), type: "tabs", version: 1, active: this.__active };
  }

  getActive(): number {
    const self = this.getLatest();
    return Math.min(Math.max(0, self.__active), Math.max(0, self.getChildrenSize() - 1));
  }

  setActive(index: number): this {
    const self = this.getWritable();
    self.__active = index;
    return self;
  }

  canBeEmpty(): boolean {
    return false;
  }

  canIndent(): boolean {
    return false;
  }
}

export type SerializedTabNode = Spread<{ title: string }, SerializedElementNode>;

export class TabNode extends ElementNode {
  __title: string;

  constructor(title = "", key?: NodeKey) {
    super(key);
    this.__title = title;
  }

  static getType(): string {
    return "tab";
  }

  static clone(node: TabNode): TabNode {
    return new TabNode(node.__title, node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-tab-panel";
    dom.setAttribute("role", "tabpanel");
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(json: SerializedTabNode): TabNode {
    return $createTabNode(typeof json.title === "string" ? json.title : "").updateFromJSON(json);
  }

  exportJSON(): SerializedTabNode {
    return { ...super.exportJSON(), type: "tab", version: 1, title: this.__title };
  }

  getTitle(): string {
    return this.getLatest().__title;
  }

  setTitle(title: string): this {
    const self = this.getWritable();
    self.__title = title.slice(0, 60);
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

export function $createTabsNode(active = 0) {
  return new TabsNode(active);
}
export function $createTabNode(title = "") {
  return new TabNode(title);
}
export function $isTabsNode(node: LexicalNode | null | undefined): node is TabsNode {
  return node instanceof TabsNode;
}
export function $isTabNode(node: LexicalNode | null | undefined): node is TabNode {
  return node instanceof TabNode;
}

export function $buildTab(title: string, blocks?: LexicalNode[]) {
  const tab = $createTabNode(title);
  tab.append(...(blocks?.length ? blocks : [$createParagraphNode()]));
  return tab;
}

/** Insere um bloco de abas no lugar do parágrafo vazio (ou abaixo). */
export function $insertTabs(anchorBlock: LexicalNode | null, titles = ["Aba 1", "Aba 2"]): TabsNode {
  const tabs = $createTabsNode(0);
  titles.forEach((t) => tabs.append($buildTab(t)));
  const isEmpty =
    anchorBlock && $isElementNode(anchorBlock) && anchorBlock.getType() === "paragraph" && anchorBlock.getTextContentSize() === 0;
  if (anchorBlock && isEmpty) anchorBlock.replace(tabs);
  else if (anchorBlock) anchorBlock.insertAfter(tabs);
  if (!tabs.getNextSibling()) tabs.insertAfter($createParagraphNode());
  tabs.getFirstChild<TabNode>()?.getFirstChild<ElementNode>()?.selectStart();
  return tabs;
}

/** Abre a aba que contém o nó (usado pelo sumário e pela busca). */
export function $revealInTabs(node: LexicalNode) {
  let current: LexicalNode | null = node;
  while (current) {
    const parent: LexicalNode | null = current.getParent();
    if ($isTabNode(current) && $isTabsNode(parent)) {
      const index = current.getIndexWithinParent();
      if (parent.getActive() !== index) parent.setActive(index);
    }
    current = parent;
  }
}

/** Desfaz as abas: cada aba vira um título (H3) seguido do conteúdo. */
export function $unwrapTabs(tabs: TabsNode, makeHeading: (text: string) => LexicalNode) {
  let anchor: LexicalNode = tabs;
  tabs.getChildren().forEach((tab) => {
    if (!$isTabNode(tab)) return;
    const heading = makeHeading(tab.getTitle() || "Aba");
    anchor.insertAfter(heading);
    anchor = heading;
    tab.getChildren().forEach((block) => {
      anchor.insertAfter(block);
      anchor = block;
    });
  });
  tabs.remove();
}
