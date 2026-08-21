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

export type TreeNode =
  | {
      type: "folder";
      id: string;
      name: string;
      icon: string | null;
      children: TreeNode[];
    }
  | { type: "document"; id: string; title: string; icon: string | null };

export function NotebookTree({ tree }: { tree: TreeNode[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggedItem, setDraggedItem] = useState<{
    type: "folder" | "document";
    id: string;
  } | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);

  function moveItem(
    type: "folder" | "document",
    id: string,
    targetFolderId: string | null,
  ) {
    setDraggedItem(null);
    setDragOverRoot(false);
    startTransition(async () => {
      try {
        await moveNotebookItem(type, id, targetFolderId);
        router.refresh();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Não foi possível mover o item.");
      }
    });
  }

  function handleNewFolder() {
    startTransition(async () => {
      await createFolder(null);
      router.refresh();
    });
  }

  function handleNewDocument() {
    startTransition(async () => {
      const created = await createDocument(null);
      router.refresh();
      if (created) router.push(`/dashboard/documents/${created.id}`);
    });
  }

  return (
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
          if (draggedItem) moveItem(draggedItem.type, draggedItem.id, null);
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
          Caderno
        </span>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
            title="Nova página"
            onClick={handleNewDocument}
            disabled={isPending}
          >
            <FilePlus size={15} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
            title="Nova pasta"
            onClick={handleNewFolder}
            disabled={isPending}
          >
            <FolderPlus size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {tree.length === 0 ? (
        <div className="px-3 py-8 text-center">
          <FileText size={22} className="mx-auto mb-2 text-base-content/20" />

          <p className="text-xs text-base-content/40">Seu caderno está vazio</p>

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
  draggedItem: { type: "folder" | "document"; id: string } | null;
  setDraggedItem: (
    item: { type: "folder" | "document"; id: string } | null,
  ) => void;
  moveItem: (
    type: "folder" | "document",
    id: string,
    targetFolderId: string | null,
  ) => void;
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
    if (!window.confirm(`Excluir ${label}? Isso não pode ser desfeito.`))
      return;
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
    if (node.type !== "folder") return;
    setExpanded(true);
    startTransition(async () => {
      const created = await createDocument(node.id);
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
          if (node.type !== "folder" || draggedItem?.id === node.id) return;
          event.preventDefault();
          event.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(false);
          if (node.type === "folder" && draggedItem) {
            moveItem(draggedItem.type, draggedItem.id, node.id);
          }
        }}
        style={{
          paddingLeft: 4 + depth * 16,
          outline: dragOver ? "2px solid hsl(var(--p) / 0.45)" : undefined,
        }}
      >
        {node.type === "folder" ? (
          <button
            type="button"
            aria-label={expanded ? "Recolher pasta" : "Expandir pasta"}
            className="btn btn-ghost btn-xs btn-square h-6 w-6 min-h-0 shrink-0 p-0 text-base-content/40 hover:bg-transparent hover:text-base-content"
            onClick={() => setExpanded((v) => !v)}
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
        )}

        <span
          className={[
            "mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center",
            "text-base-content/50",
          ].join(" ")}
        >
          {node.icon ? (
            <span className="text-sm leading-none">{node.icon}</span>
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
            className="flex-1 py-1 text-[13px] max-w-[100px] truncate"
          >
            {node.title}
          </Link>
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate py-1 text-left text-[13px] max-w-[100px]"
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
            {node.type === "folder" && (
              <>
                <li>
                  <button
                    type="button"
                    onClick={handleNewChildDocument}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <FilePlus size={14} />
                    Nova página
                  </button>
                </li>

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

                <div className="my-1 border-t border-base-300" />
              </>
            )}

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

      {node.type === "folder" && expanded && node.children.length > 0 && (
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
