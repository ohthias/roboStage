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
import { createFolder, deleteFolder, renameFolder } from "../documents/actions";

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
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a pasta.",
          "error",
        );
      }
    });
  }

  function addFolder(parentId: string | null) {
    runAction(
      () => createFolder(parentId).then(() => undefined),
      "Pasta criada.",
    );
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
    if (
      !window.confirm(
        `Excluir "${folder.name}"? As páginas voltam para a raiz.`,
      )
    )
      return;
    runAction(() => deleteFolder(folder.id), "Pasta excluída.");
  }

  return (
    <section className="mx-auto w-full p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
            Pastas
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
            Organize suas páginas em pastas, crie subpastas e gerencie a
            estrutura de forma eficiente.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm shrink-0 gap-2 self-start sm:self-auto"
          onClick={() => addFolder(null)}
          disabled={isPending}
        >
          <Plus size={16} strokeWidth={2} />
          Nova pasta
        </button>
      </header>

      {folders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
          <Folder size={40} className="mx-auto mb-4 text-base-content/25" />
          <h2 className="font-medium">Nenhuma pasta criada</h2>
          <p className="mt-1 text-sm text-base-content/55">
            Crie sua primeira pasta para começar a se organizar.
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
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
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
        className="group relative flex min-h-[58px] items-center gap-2 rounded-lg rounded-tl-none border border-base-300 bg-base-100 px-3 py-2 pt-3 transition-all duration-200 hover:border-primary/40 hover:bg-base-200/50 hover:shadow-sm"
        style={{
          marginTop: "7px",
        }}
      >
        {/* Aba superior da pasta */}
        <div
          aria-hidden="true"
          className="absolute -top-[7px] left-0 h-[7px] w-12 rounded-t-md border border-b-0 border-base-300 bg-base-100 transition-colors duration-200 group-hover:border-primary/40 group-hover:bg-base-200/50"
        />

        {/* Nome da pasta */}
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
            className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-medium text-base-content/85 transition-colors hover:text-primary"
          >
            <Folder
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-primary"
            />
            <span className="truncate">{folder.name}</span>
          </Link>
        )}

        {/* Ações */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            title="Nova subpasta"
            aria-label="Nova subpasta"
            onClick={() => onAdd(folder.id)}
            disabled={disabled}
          >
            <FolderPlus size={15} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            title="Renomear"
            aria-label="Renomear pasta"
            onClick={() => onStartRename(folder)}
            disabled={disabled}
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square text-error"
            title="Excluir"
            aria-label="Excluir pasta"
            onClick={() => onDelete(folder)}
            disabled={disabled}
          >
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
