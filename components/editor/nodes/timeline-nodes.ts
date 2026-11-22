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

/* ------------------------------------------------------------------ */
/* Linha do tempo (stepper) — cada etapa guarda blocos livres           */
/*                                                                     */
/*  TimelineNode ── TimelineItemNode (etapa) ── parágrafos, listas,     */
/*                                             imagens, colunas…        */
/*                                                                     */
/* O primeiro bloco da etapa aparece como título (CSS). O marcador      */
/* (número / ✓) e o botão "Adicionar etapa" ficam fora da área          */
/* editável, via getDOMSlot.                                           */
/* ------------------------------------------------------------------ */

export type TimelineStatus = "pending" | "active" | "done";

export const TIMELINE_STATUSES: { value: TimelineStatus; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "active", label: "Em andamento" },
  { value: "done", label: "Concluída" },
];

export function isTimelineStatus(value: unknown): value is TimelineStatus {
  return value === "pending" || value === "active" || value === "done";
}

export function nextTimelineStatus(status: TimelineStatus): TimelineStatus {
  return status === "pending" ? "active" : status === "active" ? "done" : "pending";
}

/* ---------- container ---------- */

export class TimelineNode extends ElementNode {
  static getType(): string {
    return "timeline";
  }

  static clone(node: TimelineNode): TimelineNode {
    return new TimelineNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-timeline";
    dom.setAttribute("data-timeline", "true");

    const list = document.createElement("div");
    list.className = "editor-timeline-list";

    const add = document.createElement("button");
    add.type = "button";
    add.className = "editor-timeline-add";
    add.contentEditable = "false";
    add.tabIndex = -1;
    add.innerHTML = `${lucideSvg("plus", 14)}<span>Adicionar etapa</span>`;

    dom.append(list, add);
    return dom;
  }

  getDOMSlot(element: HTMLElement) {
    const list = element.querySelector<HTMLElement>(":scope > .editor-timeline-list");
    return super.getDOMSlot(element).withElement(list ?? element);
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(json: SerializedElementNode): TimelineNode {
    return $createTimelineNode().updateFromJSON(json);
  }

  exportJSON(): SerializedElementNode {
    return { ...super.exportJSON(), type: "timeline", version: 1 };
  }

  canBeEmpty(): boolean {
    return false;
  }

  canIndent(): boolean {
    return false;
  }
}

/* ---------- etapa ---------- */

export type SerializedTimelineItemNode = Spread<{ status: TimelineStatus }, SerializedElementNode>;

const STATUS_LABEL: Record<TimelineStatus, string> = {
  pending: "Etapa pendente — clique para marcar em andamento",
  active: "Etapa em andamento — clique para concluir",
  done: "Etapa concluída — clique para reabrir",
};

export class TimelineItemNode extends ElementNode {
  __status: TimelineStatus;

  constructor(status: TimelineStatus = "pending", key?: NodeKey) {
    super(key);
    this.__status = status;
  }

  static getType(): string {
    return "timeline-item";
  }

  static clone(node: TimelineItemNode): TimelineItemNode {
    return new TimelineItemNode(node.__status, node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "editor-timeline-item";
    dom.dataset.status = this.__status;

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "editor-timeline-marker";
    marker.contentEditable = "false";
    marker.tabIndex = -1;
    marker.title = STATUS_LABEL[this.__status];
    marker.setAttribute("aria-label", STATUS_LABEL[this.__status]);
    marker.innerHTML = `<span class="editor-timeline-num"></span>${lucideSvg("check", 14, 3)}`;

    const body = document.createElement("div");
    body.className = "editor-timeline-body";

    dom.append(marker, body);
    return dom;
  }

  getDOMSlot(element: HTMLElement) {
    const body = element.querySelector<HTMLElement>(":scope > .editor-timeline-body");
    return super.getDOMSlot(element).withElement(body ?? element);
  }

  updateDOM(prev: TimelineItemNode, dom: HTMLElement): boolean {
    if (prev.__status !== this.__status) {
      dom.dataset.status = this.__status;
      const marker = dom.querySelector(":scope > .editor-timeline-marker");
      marker?.setAttribute("title", STATUS_LABEL[this.__status]);
      marker?.setAttribute("aria-label", STATUS_LABEL[this.__status]);
    }
    return false;
  }

  static importJSON(json: SerializedTimelineItemNode): TimelineItemNode {
    return $createTimelineItemNode(isTimelineStatus(json.status) ? json.status : "pending").updateFromJSON(json);
  }

  exportJSON(): SerializedTimelineItemNode {
    return { ...super.exportJSON(), type: "timeline-item", version: 1, status: this.__status };
  }

  getStatus(): TimelineStatus {
    return this.getLatest().__status;
  }

  setStatus(status: TimelineStatus): this {
    const self = this.getWritable();
    self.__status = status;
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

/* ---------- helpers ---------- */

export function $createTimelineNode() {
  return new TimelineNode();
}
export function $createTimelineItemNode(status: TimelineStatus = "pending") {
  return new TimelineItemNode(status);
}
export function $isTimelineNode(node: LexicalNode | null | undefined): node is TimelineNode {
  return node instanceof TimelineNode;
}
export function $isTimelineItemNode(node: LexicalNode | null | undefined): node is TimelineItemNode {
  return node instanceof TimelineItemNode;
}

/** Etapa nova: título + descrição vazios (os textos-guia vêm do CSS). */
export function $buildTimelineItem(status: TimelineStatus = "pending", blocks?: LexicalNode[]) {
  const item = $createTimelineItemNode(status);
  item.append(...(blocks?.length ? blocks : [$createParagraphNode(), $createParagraphNode()]));
  return item;
}

/** Insere uma linha do tempo com N etapas no lugar do parágrafo vazio (ou abaixo). */
export function $insertTimeline(anchorBlock: LexicalNode | null, steps = 3): TimelineNode {
  const timeline = $createTimelineNode();
  for (let i = 0; i < steps; i++) timeline.append($buildTimelineItem(i === 0 ? "active" : "pending"));
  const isEmpty =
    anchorBlock &&
    $isElementNode(anchorBlock) &&
    anchorBlock.getType() === "paragraph" &&
    anchorBlock.getTextContentSize() === 0;
  if (anchorBlock && isEmpty) anchorBlock.replace(timeline);
  else if (anchorBlock) anchorBlock.insertAfter(timeline);
  if (!timeline.getNextSibling()) timeline.insertAfter($createParagraphNode());
  timeline.getFirstChild<TimelineItemNode>()?.getFirstChild<ElementNode>()?.selectStart();
  return timeline;
}

/** Adiciona uma etapa depois de `after` (ou no fim) e põe o cursor nela. */
export function $addTimelineItem(timeline: TimelineNode, after?: TimelineItemNode | null) {
  const item = $buildTimelineItem();
  if (after) after.insertAfter(item);
  else timeline.append(item);
  item.getFirstChild<ElementNode>()?.selectStart();
  return item;
}

/** Desfaz a linha do tempo: os blocos das etapas seguem em sequência. */
export function $unwrapTimeline(timeline: TimelineNode) {
  let anchor: LexicalNode = timeline;
  timeline.getChildren().forEach((item) => {
    if (!$isElementNode(item)) return;
    item.getChildren().forEach((block) => {
      anchor.insertAfter(block);
      anchor = block;
    });
  });
  timeline.remove();
}
