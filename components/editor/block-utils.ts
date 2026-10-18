import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  $isRootNode,
  $parseSerializedNode,
  type ElementNode,
  type LexicalNode,
  type SerializedLexicalNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  type ListNode,
  type ListType,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $findMatchingParent } from "@lexical/utils";

/** Tipos de bloco que o editor sabe criar / converter. */
export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "number"
  | "check"
  | "quote"
  | "code";

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: "Texto",
  h1: "Título 1",
  h2: "Título 2",
  h3: "Título 3",
  bullet: "Lista com marcadores",
  number: "Lista numerada",
  check: "Lista de tarefas",
  quote: "Citação",
  code: "Código",
};

const LIST_TYPES: Partial<Record<BlockType, ListType>> = {
  bullet: "bullet",
  number: "number",
  check: "check",
};

function createTextBlock(type: BlockType): ElementNode {
  switch (type) {
    case "h1":
    case "h2":
    case "h3":
      return $createHeadingNode(type as HeadingTagType);
    case "quote":
      return $createQuoteNode();
    case "code":
      return $createCodeNode();
    default:
      return $createParagraphNode();
  }
}

/** Retorna o bloco de primeiro nível (filho direto do root) que contém o nó. */
export function $getTopLevelBlock(node: LexicalNode): LexicalNode | null {
  const top = $findMatchingParent(node, (p) => $isRootNode(p.getParent()));
  if (top) return top;
  return $isRootNode(node.getParent()) ? node : null;
}

/** Descobre o tipo atual de um bloco de primeiro nível. */
export function $getBlockType(node: LexicalNode): BlockType | null {
  if ($isHeadingNode(node)) return node.getTag() as BlockType;
  if ($isListNode(node)) {
    const t = node.getListType();
    return t === "bullet" ? "bullet" : t === "number" ? "number" : "check";
  }
  switch (node.getType()) {
    case "paragraph":
      return "paragraph";
    case "quote":
      return "quote";
    case "code":
      return "code";
    default:
      return null;
  }
}

/** Achata os itens de uma lista (inclusive aninhados) em blocos de texto. */
function $listToBlocks(list: ListNode, type: BlockType): ElementNode[] {
  const created: ElementNode[] = [];
  const walk = (l: ListNode) => {
    for (const item of l.getChildren()) {
      if (!$isListItemNode(item)) continue;
      const children = item.getChildren();
      const own = children.filter((c) => !$isListNode(c));
      const nested = children.filter((c): c is ListNode => $isListNode(c));
      if (own.length > 0 || nested.length === 0) {
        const block = createTextBlock(type);
        block.append(...own);
        list.insertBefore(block);
        created.push(block);
      }
      nested.forEach(walk);
    }
  };
  walk(list);
  list.remove();
  return created;
}

/** Converte (transforma) um bloco de primeiro nível em outro tipo. */
export function $transformBlock(key: string, type: BlockType): void {
  const node = $getNodeByKey(key);
  if (!node) return;
  const current = $getBlockType(node);
  if (current === null || current === type) return;

  const listType = LIST_TYPES[type];

  if ($isListNode(node)) {
    if (listType) {
      node.setListType(listType);
      // Itens aninhados acompanham o tipo da lista pai.
      node
        .getChildren()
        .forEach((item) =>
          (item as ElementNode)
            .getChildren()
            .filter($isListNode)
            .forEach((nested) => (nested as ListNode).setListType(listType)),
        );
      return;
    }
    const blocks = $listToBlocks(node, type);
    blocks[0]?.selectEnd();
    return;
  }

  if (!$isElementNode(node)) return;

  if (listType) {
    const list = $createListNode(listType);
    const item = $createListItemNode(listType === "check" ? false : undefined);
    item.append(...node.getChildren());
    list.append(item);
    node.replace(list);
    item.selectEnd();
    return;
  }

  const next = createTextBlock(type);
  node.replace(next, true);
  next.selectEnd();
}

type SerializedWithChildren = SerializedLexicalNode & {
  children?: SerializedLexicalNode[];
};

function serialize(node: LexicalNode): SerializedLexicalNode {
  const json = node.exportJSON() as SerializedWithChildren;
  if ($isElementNode(node)) {
    json.children = node.getChildren().map(serialize);
  }
  return json;
}

/** Duplica um bloco logo abaixo do original. */
export function $duplicateBlock(key: string): void {
  const node = $getNodeByKey(key);
  if (!node) return;
  const clone = $parseSerializedNode(serialize(node));
  node.insertAfter(clone);
  if ($isElementNode(clone)) clone.selectEnd();
}

/** Remove um bloco garantindo que o documento nunca fique sem parágrafos. */
export function $deleteBlock(key: string): void {
  const node = $getNodeByKey(key);
  if (!node) return;
  const next = node.getNextSibling() ?? node.getPreviousSibling();
  node.remove();
  if ($getRoot().getChildrenSize() === 0) {
    const p = $createParagraphNode();
    $getRoot().append(p);
    p.select();
  } else if (next && $isElementNode(next)) {
    next.selectStart();
  }
}

/** Insere um parágrafo vazio abaixo do bloco (usado pelo botão "+"). */
export function $insertParagraphAfter(key: string): ElementNode | null {
  const node = $getNodeByKey(key);
  if (!node) return null;
  const p = $createParagraphNode();
  node.insertAfter(p);
  p.select();
  return p;
}

/**
 * Agrupa um bloco com a "seção" dele: um título leva consigo tudo o que vem
 * depois até o próximo título de nível igual ou superior.
 */
export function $getSectionNodes(node: LexicalNode): LexicalNode[] {
  if (!$isHeadingNode(node)) return [node];
  const level = Number(node.getTag().slice(1));
  const nodes: LexicalNode[] = [node];
  let sib = node.getNextSibling();
  while (sib) {
    if ($isHeadingNode(sib) && Number(sib.getTag().slice(1)) <= level) break;
    nodes.push(sib);
    sib = sib.getNextSibling();
  }
  return nodes;
}

/** Move um bloco (ou a seção inteira, se for título) para cima/baixo. */
export function $moveBlock(
  key: string,
  direction: "up" | "down",
  withSection = true,
): boolean {
  const node = $getNodeByKey(key);
  if (!node) return false;
  const group = withSection ? $getSectionNodes(node) : [node];

  if (direction === "up") {
    const prev = group[0].getPreviousSibling();
    if (!prev) return false;
    // Anda por cima do bloco anterior inteiro (seção incluída, se título).
    for (const n of group) prev.insertBefore(n);
    return true;
  }

  const next = group[group.length - 1].getNextSibling();
  if (!next) return false;
  let anchor: LexicalNode = next;
  for (const n of group) {
    anchor.insertAfter(n);
    anchor = n;
  }
  return true;
}

/** Move um item de lista entre os irmãos dele. */
export function $moveListItem(
  itemKey: string,
  direction: "up" | "down",
): boolean {
  const item = $getNodeByKey(itemKey);
  if (!item || !$isListItemNode(item)) return false;
  const isWrapper = (n: LexicalNode | null) =>
    !!n && $isListItemNode(n) && n.getChildren().some($isListNode);
  if (direction === "up") {
    const prev = item.getPreviousSibling();
    if (!prev || isWrapper(prev) || isWrapper(item)) return false;
    prev.insertBefore(item);
  } else {
    const next = item.getNextSibling();
    if (!next || isWrapper(next) || isWrapper(item)) return false;
    next.insertAfter(item);
  }
  return true;
}
