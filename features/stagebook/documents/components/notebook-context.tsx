"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type TreeNode =
  | {
      type: "folder";
      id: string;
      name: string;
      icon: string | null;
      children: TreeNode[];
    }
  | {
      type: "document";
      id: string;
      title: string;
      icon: string | null;
      children: TreeNode[];
    };

type NotebookContextValue = { tree: TreeNode[]; trashCount: number };

const NotebookContext = createContext<NotebookContextValue>({ tree: [], trashCount: 0 });

/**
 * A árvore de pastas/páginas já é carregada pelo layout do Stagebook. Ela fica
 * disponível aqui para o editor montar o breadcrumb e o "Mover para..." sem
 * nenhuma consulta extra ao banco ao abrir uma página.
 */
export function NotebookProvider({
  tree,
  trashCount,
  children,
}: NotebookContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ tree, trashCount }), [tree, trashCount]);
  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>;
}

export function useNotebook() {
  return useContext(NotebookContext);
}

export function nodeLabel(node: TreeNode) {
  return node.type === "folder" ? node.name : node.title;
}

/** Caminho da raiz até o nó `id` (inclusive), ou [] se não estiver na árvore. */
export function findPath(nodes: TreeNode[], id: string): TreeNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const sub = findPath(node.children, id);
    if (sub.length) return [node, ...sub];
  }
  return [];
}

export type MoveOption = { value: string; label: string; depth: number };

/**
 * Destinos possíveis para mover a página `id`: pastas e outras páginas, sem
 * ela mesma e sem as suas subpages (o servidor também barra ciclos).
 */
export function moveOptions(tree: TreeNode[], id: string) {
  const folders: MoveOption[] = [];
  const pages: MoveOption[] = [];

  function walk(nodes: TreeNode[], depth: number) {
    for (const node of nodes) {
      if (node.type === "document" && node.id === id) continue;
      if (node.type === "folder") {
        folders.push({ value: `folder:${node.id}`, label: node.name, depth });
      } else {
        pages.push({ value: `page:${node.id}`, label: node.title || "Sem título", depth });
      }
      walk(node.children, depth + 1);
    }
  }

  walk(tree, 0);
  return { folders, pages };
}
