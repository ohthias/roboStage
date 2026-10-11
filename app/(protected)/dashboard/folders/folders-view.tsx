"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import {
  createFolder,
  deleteFolder,
  renameFolder,
} from "../documents/actions";

export type FolderItem = {
  id: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  position: number;
  documentCount: number;
};

export function FoldersView({ folders }: { folders: FolderItem[] }) {
  const { addToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const childrenOf = (parentId: string | null) =>
    folders.filter((folder) => folder.parentId === parentId);

  function runAction(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action();
        addToast(success, "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Não foi possível atualizar a pasta.",
          "error"
        );
      }
    });
  }

  function addFolder(parentId: string | null) {
    runAction(() => createFolder(parentId).then(() => undefined), "Pasta criada.");
  }

  function startRename(folder: FolderItem) {
    setEditingId(folder.id);
    setDraftName(folder.name);
  }

  function saveRename(folder: FolderItem) {
    const name = draftName.trim();
    if (!name) return;
    setEditingId(null);
    runAction(() => renameFolder(folder.id, name), "Pasta renomeada.");
  }

  function removeFolder(folder: FolderItem) {
    if (!window.confirm(`Excluir "${folder.name}"? As páginas voltam para a raiz.`)) return;
    runAction(() => deleteFolder(folder.id), "Pasta excluída.");
  }

  return (
    <section className="mx-auto w-full max-w-5xl p-6 lg:p-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Organização
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Pastas</h1>
          <p className="mt-2 text-sm text-base-content/60">
            Organize as páginas do Stagebook por assunto, projeto ou equipe.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm gap-2"
          onClick={() => addFolder(null)}
          disabled={isPending}
        >
          <Plus size={16} />
          Nova pasta
        </button>
      </header>

      {folders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
          <Folder size={40} className="mx-auto mb-4 text-base-content/25" />
          <h2 className="font-medium">Nenhuma pasta criada</h2>
          <p className="mt-1 text-sm text-base-content/55">
            Crie sua primeira pasta para começar a organizar o Stagebook.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-5 gap-2"
            onClick={() => addFolder(null)}
            disabled={isPending}
          >
            <FolderPlus size={16} />
            Criar pasta
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm">
          {childrenOf(null).map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              depth={0}
              childrenOf={childrenOf}
              editingId={editingId}
              draftName={draftName}
              setDraftName={setDraftName}
              onStartRename={startRename}
              onSaveRename={saveRename}
              onCancelRename={() => setEditingId(null)}
              onAdd={addFolder}
              onDelete={removeFolder}
              disabled={isPending}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FolderRow({
  folder,
  depth,
  childrenOf,
  editingId,
  draftName,
  setDraftName,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onAdd,
  onDelete,
  disabled,
}: {
  folder: FolderItem;
  depth: number;
  childrenOf: (parentId: string | null) => FolderItem[];
  editingId: string | null;
  draftName: string;
  setDraftName: (value: string) => void;
  onStartRename: (folder: FolderItem) => void;
  onSaveRename: (folder: FolderItem) => void;
  onCancelRename: () => void;
  onAdd: (parentId: string | null) => void;
  onDelete: (folder: FolderItem) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = childrenOf(folder.id);
  const editing = editingId === folder.id;

  return (
    <div>
      <div
        className="group flex min-h-14 items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-base-200"
        style={{ paddingLeft: `${12 + depth * 28}px` }}
      >
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Recolher pasta" : "Expandir pasta"}
          disabled={children.length === 0}
        >
          {children.length > 0 &&
            (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>
        <Folder size={20} className="shrink-0 text-primary" />
        {editing ? (
          <input
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={() => onSaveRename(folder)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSaveRename(folder);
              if (event.key === "Escape") onCancelRename();
            }}
            className="input input-sm h-8 min-w-0 flex-1"
          />
        ) : (
          <Link
            href={`/dashboard/folders/${folder.id}`}
            className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
          >
            {folder.icon ?? "📁"} {folder.name}
          </Link>
        )}
        <span className="hidden items-center gap-1 text-xs text-base-content/45 sm:flex">
          <FileText size={14} />
          {folder.documentCount}
        </span>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button type="button" className="btn btn-ghost btn-xs btn-square" title="Nova subpasta" onClick={() => onAdd(folder.id)} disabled={disabled}>
            <FolderPlus size={15} />
          </button>
          <button type="button" className="btn btn-ghost btn-xs btn-square" title="Renomear" onClick={() => onStartRename(folder)} disabled={disabled}>
            <Pencil size={15} />
          </button>
          <button type="button" className="btn btn-ghost btn-xs btn-square text-error" title="Excluir" onClick={() => onDelete(folder)} disabled={disabled}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {expanded &&
        children.map((child) => (
          <FolderRow
            key={child.id}
            folder={child}
            depth={depth + 1}
            childrenOf={childrenOf}
            editingId={editingId}
            draftName={draftName}
            setDraftName={setDraftName}
            onStartRename={onStartRename}
            onSaveRename={onSaveRename}
            onCancelRename={onCancelRename}
            onAdd={onAdd}
            onDelete={onDelete}
            disabled={disabled}
          />
        ))}
    </div>
  );
}
