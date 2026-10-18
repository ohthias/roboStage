"use client";

import { useState, useTransition } from "react";
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
  Pencil,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
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

type DraggedItem = {
  type: "folder" | "document";
  id: string;
};

type MoveTarget = {
  folderId?: string | null;
  parentPageId?: string | null;
};

export function NotebookTree({ tree }: { tree: TreeNode[] }) {
  const router = useRouter();
  const { addToast } = useToast();

  const [isPending, startTransition] = useTransition();
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function moveItem(
    type: "folder" | "document",
    id: string,
    target: MoveTarget,
  ) {
    setDraggedItem(null);
    setDragOverRoot(false);

    startTransition(async () => {
      try {
        await moveNotebookItem(type, id, target);
        addToast("Item movido com sucesso.", "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível mover o item.",
          "error",
        );
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
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a pasta.",
          "error",
        );
      }
    });
  }

  function handleNewDocument() {
    startTransition(async () => {
      try {
        const created = await createDocument(null, null);
        addToast("Página criada com sucesso.", "success");
        router.refresh();

        if (created) {
          router.push(`/dashboard/documents/${created.id}`);
        }
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a página.",
          "error",
        );
      }
    });
  }

  return (
    <aside
      className={`flex h-full min-h-0 flex-col overflow-visible transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-80"
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex h-11 shrink-0 items-center justify-between gap-1 px-2">
        {!collapsed && (
          <span className="truncate pl-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
            Páginas
          </span>
        )}

        <div
          className={`flex items-center gap-1 ${collapsed ? "mx-auto" : ""}`}
        >
          <div
            className="tooltip tooltip-right"
            data-tip={collapsed ? "Expandir painel" : "Recolher painel"}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square"
              aria-label={collapsed ? "Expandir painel" : "Recolher painel"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
            </button>
          </div>

          {!collapsed && (
            <>
              <div className="tooltip tooltip-bottom" data-tip="Nova página">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label="Nova página"
                  onClick={handleNewDocument}
                  disabled={isPending}
                >
                  <FilePlus size={15} />
                </button>
              </div>

              <div className="tooltip tooltip-bottom" data-tip="Nova pasta">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label="Nova pasta"
                  onClick={handleNewFolder}
                  disabled={isPending}
                >
                  <FolderPlus size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Atalhos de criação no modo compacto */}
      {collapsed && (
        <div className="flex shrink-0 flex-col items-center gap-1 py-1">
          <div className="tooltip tooltip-right" data-tip="Nova página">
            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Nova página"
              onClick={handleNewDocument}
              disabled={isPending}
            >
              <FilePlus size={17} />
            </button>
          </div>

          <div className="tooltip tooltip-right" data-tip="Nova pasta">
            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Nova pasta"
              onClick={handleNewFolder}
              disabled={isPending}
            >
              <FolderPlus size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Árvore */}
      <div
        className={[
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
          collapsed ? "px-1" : "px-2",
        ].join(" ")}
        onDragOver={(event) => {
          if (!draggedItem) return;
          event.preventDefault();
          setDragOverRoot(true);
        }}
        onDragLeave={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setDragOverRoot(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (draggedItem) {
            moveItem(draggedItem.type, draggedItem.id, {
              folderId: null,
              parentPageId: null,
            });
          } else {
            setDragOverRoot(false);
          }
        }}
      >
        {tree.length === 0 ? (
          !collapsed && (
            <div className="px-2 py-8 text-center">
              <FileText
                size={22}
                className="mx-auto mb-2 text-base-content/20"
              />
              <p className="text-xs text-base-content/40">
                Nenhuma página por aqui ainda
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-base-content/60 hover:text-base-content"
                onClick={handleNewDocument}
                disabled={isPending}
              >
                Criar primeira página
              </button>
            </div>
          )
        ) : (
          <ul className="menu menu-sm w-full gap-0.5 p-0">
            {tree.map((node) => (
              <TreeItem
                key={`${node.type}-${node.id}`}
                node={node}
                depth={0}
                draggedItem={draggedItem}
                setDraggedItem={setDraggedItem}
                moveItem={moveItem}
                collapsed={collapsed}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function TreeItem({
  node,
  depth,
  draggedItem,
  setDraggedItem,
  moveItem,
  collapsed,
}: {
  node: TreeNode;
  depth: number;
  draggedItem: DraggedItem | null;
  setDraggedItem: (item: DraggedItem | null) => void;
  moveItem: (
    type: "folder" | "document",
    id: string,
    target: MoveTarget,
  ) => void;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(
    node.type === "folder" ? node.name : node.title,
  );
  const [, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const label = node.type === "folder" ? node.name : node.title;
  const hasChildren = node.children.length > 0;
  const isDragging = draggedItem?.id === node.id;

  const isActive =
    node.type === "document" && pathname === `/dashboard/documents/${node.id}`;

  function commitRename() {
    setEditing(false);

    const value = draftName.trim();

    if (!value || value === label) {
      setDraftName(label);
      return;
    }

    startTransition(async () => {
      try {
        if (node.type === "folder") {
          await renameFolder(node.id, value);
        } else {
          await renameDocument(node.id, value);
        }

        router.refresh();
      } catch {
        setDraftName(label);
      }
    });
  }

  function handleDelete() {
    const itemLabel = node.type === "folder" ? "esta pasta" : "esta página";

    const extra =
      node.type === "folder"
        ? "As páginas dentro dela voltam para a raiz."
        : "Subpages dentro dela sobem um nível.";

    if (
      !window.confirm(
        `Excluir ${itemLabel}? ${extra} Isso não pode ser desfeito.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        if (node.type === "folder") {
          await deleteFolder(node.id);
        } else {
          await deleteDocument(node.id);
        }

        if (isActive) {
          router.push("/dashboard/documents");
        }

        router.refresh();
      } catch {
        // Evita uma rejeição não tratada caso a exclusão falhe.
      }
    });
  }

  function handleNewSubfolder() {
    if (node.type !== "folder") return;

    setExpanded(true);

    startTransition(async () => {
      try {
        await createFolder(node.id);
        router.refresh();
      } catch {
        // Evita uma rejeição não tratada caso a criação falhe.
      }
    });
  }

  function handleNewChildDocument() {
    setExpanded(true);

    startTransition(async () => {
      try {
        const created =
          node.type === "folder"
            ? await createDocument(node.id, null)
            : await createDocument(null, node.id);

        router.refresh();

        if (created) {
          router.push(`/dashboard/documents/${created.id}`);
        }
      } catch {
        // Evita uma rejeição não tratada caso a criação falhe.
      }
    });
  }

  const itemClasses = [
    "group relative flex min-h-8 items-center rounded-md pr-1",
    "text-sm transition-colors z-10",
    collapsed ? "justify-center px-0" : "",
    isActive
      ? "bg-base-300 text-base-content"
      : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content",
    isDragging ? "opacity-50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const icon = node.icon ? (
    <span className="text-sm leading-none">{node.icon}</span>
  ) : node.type === "folder" ? (
    expanded ? (
      <FolderOpen size={15} strokeWidth={1.7} />
    ) : (
      <Folder size={15} strokeWidth={1.7} />
    )
  ) : (
    <FileText size={15} strokeWidth={1.7} />
  );

  return (
    <li>
      <div
        className={itemClasses}
        draggable={!editing}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", node.id);
          setDraggedItem({ type: node.type, id: node.id });
        }}
        onDragEnd={() => {
          setDraggedItem(null);
          setDragOver(false);
        }}
        onDragOver={(event) => {
          if (!draggedItem || isDragging) return;

          // Pastas aceitam pastas e páginas.
          // Páginas aceitam somente outras páginas.
          if (node.type === "document" && draggedItem.type === "folder") {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = "move";
          setDragOver(true);
        }}
        onDragLeave={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setDragOver(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(false);

          if (!draggedItem || isDragging) return;

          if (node.type === "folder") {
            moveItem(draggedItem.type, draggedItem.id, {
              folderId: node.id,
              parentPageId: null,
            });
          } else if (draggedItem.type === "document") {
            moveItem("document", draggedItem.id, {
              parentPageId: node.id,
            });
          }
        }}
        style={{
          paddingLeft: collapsed ? 0 : 4 + depth * 16,
          paddingRight: collapsed ? 0 : undefined,
          outline: dragOver ? "2px solid hsl(var(--p) / 0.45)" : undefined,
        }}
      >
        {/* Expansão individual: somente no painel aberto */}
        {!collapsed &&
          (hasChildren ? (
            <button
              type="button"
              aria-label={expanded ? "Recolher" : "Expandir"}
              aria-expanded={expanded}
              className="btn btn-ghost btn-xs btn-square h-6 w-6 min-h-0 shrink-0 p-0 text-base-content/40 hover:bg-transparent hover:text-base-content"
              onClick={() => setExpanded((value) => !value)}
            >
              <ChevronRight
                size={13}
                strokeWidth={2}
                className={`transition-transform duration-150 ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          ))}

        {/* Ícone com tooltip no painel compacto */}
        <div
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center",
            "text-base-content/60",
            collapsed ? "tooltip tooltip-right" : "mr-1.5",
          ].join(" ")}
          data-tip={collapsed ? label : undefined}
          aria-label={collapsed ? label : undefined}
        >
          {icon}
        </div>

        {/* Nome ou campo de edição */}
        {!collapsed &&
          (editing ? (
            <input
              autoFocus
              className="input input-xs input-bordered h-6 min-h-0 min-w-0 flex-1 px-1.5 text-xs"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitRename();
                }

                if (event.key === "Escape") {
                  setEditing(false);
                  setDraftName(label);
                }
              }}
            />
          ) : node.type === "document" ? (
            <Link
              href={`/dashboard/documents/${node.id}`}
              className="max-w-[125px] min-w-0 flex-1 truncate py-1 text-[13px]"
            >
              {node.title}
            </Link>
          ) : (
            <button
              type="button"
              className="max-w-[125px] min-w-0 flex-1 truncate py-1 text-left text-[13px]"
              onDoubleClick={() => {
                setDraftName(label);
                setEditing(true);
              }}
              onClick={() => setExpanded((value) => !value)}
            >
              {node.name}
            </button>
          ))}

        {/* Ações disponíveis no painel aberto */}
        {!collapsed && (
          <div
            className="dropdown dropdown-end ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              tabIndex={0}
              aria-label={`Ações para ${label}`}
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
                  {node.type === "folder" ? "Nova página" : "Nova Sub"}
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

              <li className="my-1 border-t border-base-300" />

              <li>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(label);
                    setEditing(true);
                  }}
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
        )}
      </div>

      {/* Subárvore visível somente no modo expandido */}
      {!collapsed && expanded && hasChildren && (
        <ul className="relative">
          {node.children.map((child) => (
            <TreeItem
              key={`${child.type}-${child.id}`}
              node={child}
              depth={depth + 1}
              draggedItem={draggedItem}
              setDraggedItem={setDraggedItem}
              moveItem={moveItem}
              collapsed={collapsed}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
