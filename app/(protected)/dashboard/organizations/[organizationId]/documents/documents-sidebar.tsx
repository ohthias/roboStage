"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import {
  ChevronRight,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  MoreHorizontal,
  NotebookPen,
  Plus,
} from "lucide-react";
import { createDocumentAction } from "./actions";
import {
  createFolderAction,
  deleteFolderAction,
  updateFolderAction,
} from "./folder-actions";
import { IconPickerButton } from "@/components/icons/icon-picker-button";

type DocSummary = {
  id: string;
  title: string;
  icon: string | null;
  folderId: string | null;
  updatedAt: Date;
};

type FolderSummary = {
  id: string;
  name: string;
  icon: string | null;
  parentId: string | null;
};

const INDENT_PX = 14;

export function DocumentsSidebar({
  organizationId,
  documents,
  folders,
}: {
  organizationId: string;
  documents: DocSummary[];
  folders: FolderSummary[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleCreateFolder(parentId: string | null) {
    setError(null);
    startTransition(async () => {
      const result = await createFolderAction(organizationId, parentId);
      if (result.success && result.data) {
        if (parentId) {
          setExpanded((prev) => new Set(prev).add(parentId));
        }
        setRenamingId(result.data.id);
        setRenameValue("Nova pasta");
        router.refresh();
      } else {
        setError(result.message ?? "Não foi possível criar a pasta.");
      }
    });
  }

  function handleCreateDocument(folderId: string | null) {
    setError(null);
    startTransition(async () => {
      const result = await createDocumentAction(organizationId, folderId);
      if (result.success && result.data) {
        router.push(
          `/dashboard/organizations/${organizationId}/documents/${result.data.id}`
        );
        router.refresh();
      } else {
        setError(result.message ?? "Não foi possível criar o documento.");
      }
    });
  }

  function submitRename(folderId: string) {
    const value = renameValue.trim();
    setRenamingId(null);
    if (!value) return;

    startTransition(async () => {
      const result = await updateFolderAction(organizationId, folderId, {
        name: value,
      });
      if (!result.success) {
        setError(result.message ?? "Não foi possível renomear a pasta.");
      }
      router.refresh();
    });
  }

  function handleIconChange(folderId: string, icon: string | null) {
    startTransition(async () => {
      const result = await updateFolderAction(organizationId, folderId, {
        icon,
      });
      if (!result.success) {
        setError(result.message ?? "Não foi possível atualizar o ícone.");
      }
      router.refresh();
    });
  }

  function confirmDeleteFolder() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;

    startTransition(async () => {
      const result = await deleteFolderAction(organizationId, id);
      setPendingDelete(null);
      dialogRef.current?.close();
      if (!result.success) {
        setError(result.message ?? "Não foi possível excluir a pasta.");
      }
      router.refresh();
    });
  }

  function renderNodes(parentId: string | null, depth: number): ReactNode {
    const childFolders = folders.filter((f) => f.parentId === parentId);
    const childDocs = documents.filter((d) => d.folderId === parentId);

    return (
      <>
        {childFolders.map((folder) => {
          const isExpanded = expanded.has(folder.id);
          const isRenaming = renamingId === folder.id;

          return (
            <div key={folder.id}>
              <div
                className="group flex items-center gap-1 rounded-lg py-1 pr-1 text-sm hover:bg-base-200"
                style={{ paddingLeft: depth * INDENT_PX + 4 }}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(folder.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-base-content/40"
                  aria-label={isExpanded ? "Recolher pasta" : "Expandir pasta"}
                >
                  <ChevronRight
                    size={13}
                    className={[
                      "transition-transform",
                      isExpanded ? "rotate-90" : "",
                    ].join(" ")}
                  />
                </button>

                <IconPickerButton
                  icon={folder.icon}
                  fallback={<Folder size={14} className="text-base-content/50" />}
                  onChange={(icon) => handleIconChange(folder.id, icon)}
                  className="h-6 w-6 shrink-0"
                  emojiClassName="text-sm"
                  title="Escolher ícone da pasta"
                />

                {isRenaming ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => submitRename(folder.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        submitRename(folder.id);
                      }
                      if (event.key === "Escape") {
                        setRenamingId(null);
                      }
                    }}
                    onClick={(event) => event.stopPropagation()}
                    className="input input-bordered input-xs flex-1"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpand(folder.id)}
                    className="flex-1 truncate text-left text-base-content/80"
                  >
                    {folder.name}
                  </button>
                )}

                <div className="hidden items-center gap-0.5 group-hover:flex">
                  <button
                    type="button"
                    title="Novo documento nesta pasta"
                    onClick={() => handleCreateDocument(folder.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-base-content/50 hover:bg-base-300"
                  >
                    <FilePlus size={13} />
                  </button>
                  <button
                    type="button"
                    title="Nova subpasta"
                    onClick={() => handleCreateFolder(folder.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-base-content/50 hover:bg-base-300"
                  >
                    <FolderPlus size={13} />
                  </button>

                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      title="Mais opções"
                      className="flex h-5 w-5 items-center justify-center rounded text-base-content/50 hover:bg-base-300"
                    >
                      <MoreHorizontal size={13} />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu menu-sm z-50 w-40 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
                    >
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(folder.id);
                            setRenameValue(folder.name);
                            (document.activeElement as HTMLElement)?.blur();
                          }}
                        >
                          Renomear
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="text-error"
                          onClick={() => {
                            setPendingDelete({ id: folder.id, name: folder.name });
                            dialogRef.current?.showModal();
                            (document.activeElement as HTMLElement)?.blur();
                          }}
                        >
                          Excluir pasta
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {isExpanded && renderNodes(folder.id, depth + 1)}
            </div>
          );
        })}

        {childDocs.map((doc) => {
          const href = `/dashboard/organizations/${organizationId}/documents/${doc.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={doc.id}
              href={href}
              style={{ paddingLeft: depth * INDENT_PX + 30 }}
              className={[
                "flex items-center gap-2 rounded-lg py-1.5 pr-2 text-sm transition",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-base-content/70 hover:bg-base-200",
              ].join(" ")}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-sm">
                {doc.icon ?? <FileText size={13} />}
              </span>
              <span className="truncate">{doc.title || "Sem título"}</span>
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <aside className="flex h-[calc(100vh-4rem)] flex-col gap-2 rounded-2xl border border-base-300 bg-base-100 p-4 sticky overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
          <NotebookPen size={15} /> Caderno da equipe
        </h2>
        {isPending && (
          <Loader2 size={13} className="animate-spin text-base-content/40" />
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleCreateDocument(null)}
          className="btn btn-primary btn-sm flex-1 gap-1"
        >
          <Plus size={14} />
          Documento
        </button>
        <button
          type="button"
          onClick={() => handleCreateFolder(null)}
          title="Nova pasta"
          className="btn btn-ghost btn-sm btn-square"
        >
          <FolderPlus size={14} />
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="mt-1 flex flex-col gap-0.5">
        {renderNodes(null, 0)}

        {folders.length === 0 && documents.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-base-content/40">
            Nenhum documento ou pasta ainda.
          </p>
        )}
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">Excluir pasta</h3>
          <p className="mt-2 text-sm text-base-content/70">
            A pasta{" "}
            <span className="font-semibold">{pendingDelete?.name}</span> e
            suas subpastas serão excluídas. Os documentos dentro delas não
            são apagados — voltam para a raiz do caderno.
          </p>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setPendingDelete(null);
                dialogRef.current?.close();
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDeleteFolder}
              disabled={isPending}
              className="btn btn-error gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Excluir pasta
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </aside>
  );
}