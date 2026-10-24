"use client";

import { useCallback, useEffect, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  FolderPlus,
  FilePlus,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { DocIcon } from "@/components/editor/doc-icon";
import {
  createFolder,
  createDocument,
  renameFolder,
  renameDocument,
  deleteFolder,
  deleteDocument,
  moveNotebookItem,
} from "./actions";
import { useToast } from "@/app/context/ToastContext";

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

type DraggedItem = { type: "folder" | "document"; id: string };
type MoveTarget = { folderId?: string | null; parentPageId?: string | null };


const COLLAPSE_KEY = "notebook-tree:collapsed";

/** Achata a árvore (profundidade primeiro) para a versão compacta. */
function flattenTree(nodes: TreeNode[], out: TreeNode[] = []): TreeNode[] {
  for (const n of nodes) {
    out.push(n);
    flattenTree(n.children, out);
  }
  return out;
}

function nodeLabel(node: TreeNode) {
  return node.type === "folder" ? node.name : node.title;
}

function NodeIcon({ node, expanded = false }: { node: TreeNode; expanded?: boolean }) {
  if (node.icon) return <DocIcon value={node.icon} size={18} fallback={null} />;
  if (node.type === "folder") {
    return expanded ? <FolderOpen size={16} strokeWidth={1.7} /> : <Folder size={16} strokeWidth={1.7} />;
  }
  return <FileText size={16} strokeWidth={1.7} />;
}

/**
 * Tooltip do daisyUI sem clipping: o aside rola (overflow), o que cortaria um
 * `.tooltip` comum. Renderizamos o mesmo componente (`tooltip tooltip-open`)
 * num portal, posicionado ao lado do item sob o cursor/foco.
 */
function useRailTooltip() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  const bind = useCallback(
    (text: string) => ({
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => show(e.currentTarget, text),
      onFocus: (e: React.FocusEvent<HTMLElement>) => show(e.currentTarget, text),
      onMouseLeave: () => setTip(null),
      onBlur: () => setTip(null),
    }),
    []
  );

  function show(el: HTMLElement, text: string) {
    const r = el.getBoundingClientRect();
    setTip({ text, x: r.right + 6, y: r.top + r.height / 2 });
  }

  const node: ReactNode =
    tip && typeof document !== "undefined"
      ? createPortal(
          <div className="pointer-events-none fixed z-[100]" style={{ left: tip.x, top: tip.y }}>
            <div className="tooltip tooltip-open tooltip-right" data-tip={tip.text}>
              <span className="block h-0 w-0" />
            </div>
          </div>,
          document.body
        )
      : null;

  return { bind, node, hide: () => setTip(null) };
}

export function NotebookTree({ tree }: { tree: TreeNode[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const rail = useRailTooltip();

  useEffect(() => {
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = useCallback(() => {
    rail.hide();
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        toggleCollapsed();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  function moveItem(type: "folder" | "document", id: string, target: MoveTarget) {
    setDraggedItem(null);
    setDragOverRoot(false);
    startTransition(async () => {
      try {
        await moveNotebookItem(type, id, target);
          addToast("Item movido com sucesso.", "success");
          router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível mover o item.", "error");
      }
    });
  }

  function handleNewFolder() {
    startTransition(async () => {
        try {
          await createFolder(null);
          addToast("Pasta criada com sucesso.", "success");
          router.refresh();
        } catch (error) {
          addToast(error instanceof Error ? error.message : "Não foi possível criar a pasta.", "error");
        }
    });
  }

  function handleNewDocument() {
    startTransition(async () => {
        try {
          const created = await createDocument(null, null);
          addToast("Página criada com sucesso.", "success");
          router.refresh();
          if (created) router.push(`/dashboard/documents/${created.id}`);
        } catch (error) {
          addToast(error instanceof Error ? error.message : "Não foi possível criar a página.", "error");
        }
    });
  }

  const aside = collapsed ? (
    <aside
      aria-label="Páginas (compacto)"
      className="sticky top-16 flex h-[calc(100vh-4rem)] w-14 flex-shrink-0 flex-col items-center gap-1 overflow-y-auto overflow-x-hidden border-r border-base-300/50 bg-base-100/90 px-1.5 py-3 backdrop-blur-md transition-[width] duration-200"
    >
      <RailButton label="Expandir menu (Ctrl+\)" onClick={toggleCollapsed} rail={rail}>
        <PanelLeftOpen size={17} strokeWidth={1.8} />
      </RailButton>
      <RailButton label="Nova página" onClick={handleNewDocument} disabled={isPending} rail={rail}>
        <FilePlus size={16} strokeWidth={1.8} />
      </RailButton>
      <RailButton label="Nova pasta" onClick={handleNewFolder} disabled={isPending} rail={rail}>
        <FolderPlus size={16} strokeWidth={1.8} />
      </RailButton>

      <div className="my-1 h-px w-6 shrink-0 bg-base-300" />

      <ul className="flex w-full flex-col items-center gap-1">
        {flattenTree(tree).map((node) => (
          <RailItem
            key={node.id}
            node={node}
            rail={rail}
            onFolderClick={toggleCollapsed}
          />
        ))}
      </ul>
    </aside>
  ) : (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-full max-w-[250px] flex-col gap-2 overflow-y-auto border-r border-base-300/50 bg-base-100/90 px-2 py-3 backdrop-blur-md transition-[width] duration-200 lg:w-[250px] lg:flex-shrink-0 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <div
          className={`flex h-8 items-center justify-between rounded-md px-2 transition-colors ${
            dragOverRoot ? "bg-primary/15" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOverRoot(true);
          }}
          onDragLeave={() => setDragOverRoot(false)}
          onDrop={(event) => {
            event.preventDefault();
            if (draggedItem) moveItem(draggedItem.type, draggedItem.id, { folderId: null, parentPageId: null });
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
            Páginas
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="tooltip tooltip-bottom btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
              data-tip="Nova página"
              aria-label="Nova página"
              onClick={handleNewDocument}
              disabled={isPending}
            >
              <FilePlus size={15} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className="tooltip tooltip-bottom btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
              data-tip="Nova pasta"
              aria-label="Nova pasta"
              onClick={handleNewFolder}
              disabled={isPending}
            >
              <FolderPlus size={15} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className="tooltip tooltip-bottom btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
              data-tip="Recolher menu (Ctrl+\)"
              aria-label="Recolher menu"
              onClick={toggleCollapsed}
            >
              <PanelLeftClose size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {tree.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <FileText size={22} className="mx-auto mb-2 text-base-content/20" />

            <p className="text-xs text-base-content/40">Nenhuma página por aqui ainda</p>

            <button
              type="button"
              className="mt-2 text-xs font-medium text-base-content/60 hover:text-base-content"
              onClick={handleNewDocument}
            >
              Criar primeira página
            </button>
          </div>
        ) : (
          <ul className="menu menu-sm w-full gap-0.5 p-0">
            {tree.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                depth={0}
                draggedItem={draggedItem}
                setDraggedItem={setDraggedItem}
                moveItem={moveItem}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {aside}
      {rail.node}
    </>
  );
}

function RailButton({
  label,
  onClick,
  disabled,
  rail,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  rail: ReturnType<typeof useRailTooltip>;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="btn btn-ghost btn-sm btn-square shrink-0 text-base-content/60 hover:text-base-content"
      {...rail.bind(label)}
    >
      {children}
    </button>
  );
}

function RailItem({
  node,
  rail,
  onFolderClick,
}: {
  node: TreeNode;
  rail: ReturnType<typeof useRailTooltip>;
  onFolderClick: () => void;
}) {
  const pathname = usePathname();
  const label = nodeLabel(node);
  const isActive = node.type === "document" && pathname === `/dashboard/documents/${node.id}`;
  const cls = [
    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
    isActive
      ? "bg-base-300 text-base-content ring-1 ring-primary/40"
      : "text-base-content/60 hover:bg-base-300/60 hover:text-base-content",
  ].join(" ");

  return (
    <li>
      {node.type === "document" ? (
        <Link href={`/dashboard/documents/${node.id}`} aria-label={label} className={cls} {...rail.bind(label)}>
          <NodeIcon node={node} />
        </Link>
      ) : (
        <button type="button" aria-label={`${label} (expandir menu)`} className={cls} onClick={onFolderClick} {...rail.bind(label)}>
          <NodeIcon node={node} />
        </button>
      )}
    </li>
  );
}

function TreeItem({
  node,
  depth,
  draggedItem,
  setDraggedItem,
  moveItem,
}: {
  node: TreeNode;
  depth: number;
  draggedItem: DraggedItem | null;
  setDraggedItem: (item: DraggedItem | null) => void;
  moveItem: (type: "folder" | "document", id: string, target: MoveTarget) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(
    node.type === "folder" ? node.name : node.title
  );
  const [, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const isActive =
    node.type === "document" && pathname === `/dashboard/documents/${node.id}`;

  function currentLabel() {
    return node.type === "folder" ? node.name : node.title;
  }

  function commitRename() {
    setEditing(false);
    const value = draftName.trim();
    if (!value) {
      setDraftName(currentLabel());
      return;
    }
    startTransition(async () => {
      if (node.type === "folder") {
        await renameFolder(node.id, value);
      } else {
        await renameDocument(node.id, value);
      }
      router.refresh();
    });
  }

  function handleDelete() {
    const label = node.type === "folder" ? "esta pasta" : "esta página";
    const extra =
      node.type === "folder"
        ? "As páginas dentro dela voltam para a raiz."
        : "Subpages dentro dela sobem um nível.";
    if (!window.confirm(`Excluir ${label}? ${extra} Isso não pode ser desfeito.`)) return;
    startTransition(async () => {
      if (node.type === "folder") {
        await deleteFolder(node.id);
      } else {
        await deleteDocument(node.id);
      }
      if (isActive) router.push("/dashboard/documents");
      router.refresh();
    });
  }

  function handleNewSubfolder() {
    if (node.type !== "folder") return;
    setExpanded(true);
    startTransition(async () => {
      await createFolder(node.id);
      router.refresh();
    });
  }

  function handleNewChildDocument() {
    setExpanded(true);
    startTransition(async () => {
      const created =
        node.type === "folder"
          ? await createDocument(node.id, null)
          : await createDocument(null, node.id);
      router.refresh();
      if (created) router.push(`/dashboard/documents/${created.id}`);
    });
  }

  return (
    <li>
      <div
        className={[
          "group relative flex min-h-8 items-center rounded-md pr-1",
          "text-sm transition-colors",
          isActive
            ? "bg-base-300 text-base-content"
            : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content",
        ].join(" ")}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", node.id);
          setDraggedItem({ type: node.type, id: node.id });
        }}
        onDragEnd={() => setDraggedItem(null)}
        onDragOver={(event) => {
          if (draggedItem?.id === node.id) return;
          // Pastas aceitam pastas e páginas; páginas só aceitam páginas (como subpage).
          if (node.type === "document" && draggedItem?.type === "folder") return;
          event.preventDefault();
          event.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(false);
          if (!draggedItem) return;
          if (node.type === "folder") {
            moveItem(draggedItem.type, draggedItem.id, { folderId: node.id, parentPageId: null });
          } else if (draggedItem.type === "document") {
            moveItem("document", draggedItem.id, { parentPageId: node.id });
          }
        }}
        style={{
          paddingLeft: 4 + depth * 16,
          outline: dragOver ? "2px solid hsl(var(--p) / 0.45)" : undefined,
        }}
      >
        {node.children.length > 0 ? (
          <button
            type="button"
            aria-label={expanded ? "Recolher" : "Expandir"}
            className="btn btn-ghost btn-xs btn-square h-6 w-6 min-h-0 shrink-0 p-0 text-base-content/40 hover:bg-transparent hover:text-base-content"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronRight
              size={13}
              strokeWidth={2}
              className={`transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        <span className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center text-base-content/50">
          {node.icon ? (
            <DocIcon value={node.icon} size={18} fallback={null} />
          ) : node.type === "folder" ? (
            expanded ? (
              <FolderOpen size={15} strokeWidth={1.7} />
            ) : (
              <Folder size={15} strokeWidth={1.7} />
            )
          ) : (
            <FileText size={15} strokeWidth={1.7} />
          )}
        </span>

        {editing ? (
          <input
            autoFocus
            className="input input-xs input-bordered h-6 min-h-0 flex-1 px-1.5 text-xs"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setEditing(false);
                setDraftName(currentLabel());
              }
            }}
          />
        ) : node.type === "document" ? (
          <Link
            href={`/dashboard/documents/${node.id}`}
            className="min-w-0 flex-1 truncate py-1 text-[13px] max-w-[90px]"
          >
            {node.title}
          </Link>
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate py-1 text-left text-[13px] max-w-[90px]"
            onDoubleClick={() => setEditing(true)}
            onClick={() => setExpanded((v) => !v)}
          >
            {node.name}
          </button>
        )}

        <div
          className="dropdown dropdown-end ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            tabIndex={0}
            aria-label={`Ações para ${currentLabel()}`}
            className="btn btn-ghost btn-xs btn-square h-6 w-6 min-h-0 text-base-content/40 hover:bg-base-300 hover:text-base-content"
          >
            <MoreHorizontal size={14} />
          </button>

          <ul
            tabIndex={0}
            className="menu dropdown-content z-50 mt-1 w-48 rounded-lg border border-base-300 bg-base-100 p-1 shadow-xl"
          >
            <li>
              <button
                type="button"
                onClick={handleNewChildDocument}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <FilePlus size={14} />
                {node.type === "folder" ? "Nova página" : "Nova subpage"}
              </button>
            </li>

            {node.type === "folder" && (
              <li>
                <button
                  type="button"
                  onClick={handleNewSubfolder}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <FolderPlus size={14} />
                  Nova subpasta
                </button>
              </li>
            )}

            <div className="my-1 border-t border-base-300" />

            <li>
              <button
                type="button"
                onClick={() => setEditing(true)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Pencil size={14} />
                Renomear
              </button>
            </li>

            <li>
              <button
                type="button"
                className="text-error"
                onClick={handleDelete}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </li>
          </ul>
        </div>
      </div>

      {expanded && node.children.length > 0 && (
        <ul className="relative">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              draggedItem={draggedItem}
              setDraggedItem={setDraggedItem}
              moveItem={moveItem}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
