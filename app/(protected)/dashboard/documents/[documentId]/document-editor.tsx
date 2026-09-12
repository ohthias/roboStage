"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import {
  Check,
  ChevronRight,
  FileText,
  Loader2,
  MoreHorizontal,
  Palette,
  Plus,
  SmilePlus,
  Trash2,
  X,
} from "lucide-react";

import { ToolbarPlugin } from "@/components/editor/plugins/toolbar-plugin";
import { AutosavePlugin } from "@/components/editor/plugins/auto-save-plugin";
import {
  deleteDocument,
  duplicateDocument,
  moveNotebookItem,
  renameDocument,
  updateDocumentCover,
  updateDocumentDescription,
  updateDocumentIcon,
  updateDocumentProperty,
  toggleDocumentTag,
} from "../actions";

const EMOJI_OPTIONS = ["📝", "🤖", "🧪", "🏁", "⚙️", "📌", "💡", "🔧", "📊", "🗂️", "🎯", "🚀"];
const COVER_OPTIONS = [
  { label: "Azul", value: "#2563eb" },
  { label: "Verde", value: "#16a34a" },
  { label: "Laranja", value: "#ea580c" },
  { label: "Roxo", value: "#7c3aed" },
  { label: "Rosa", value: "#db2777" },
  { label: "Cinza", value: "#475569" },
];

const editorTheme = {
  heading: {
    h1: "mt-8 mb-3 text-3xl font-bold tracking-tight",
    h2: "mt-7 mb-2 text-2xl font-semibold tracking-tight",
    h3: "mt-5 mb-2 text-xl font-semibold",
  },
  quote: "my-4 border-l-2 border-base-content/20 pl-4 italic text-base-content/60",
  list: {
    ul: "my-2 flex list-disc flex-col gap-1 pl-6",
    ol: "my-2 flex list-decimal flex-col gap-1 pl-6",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
  paragraph: "my-2 leading-7",
  code: "my-2 rounded-md bg-base-200/50 px-2 py-1 font-mono text-sm text-base-content/80",
};

export function NotebookEditor({
  documentId,
  initialTitle,
  initialIcon,
  initialDescription,
  initialCover,
  initialProperties,
  initialTags,
  initialContent,
  currentFolderId,
  currentParentId,
  folders,
  pages,
}: {
  documentId: string;
  initialTitle: string;
  initialIcon: string | null;
  initialDescription: string | null;
  initialCover: string | null;
  initialProperties: Record<string, unknown>;
  initialTags: { tagId: string; name: string }[];
  initialContent: Record<string, unknown> | null;
  currentFolderId: string | null;
  currentParentId: string | null;
  folders: { id: string; name: string; parentId: string | null }[];
  pages: { id: string; title: string }[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [cover, setCover] = useState(initialCover);
  const [properties, setProperties] = useState(initialProperties);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropValue, setNewPropValue] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTarget, setMoveTarget] = useState(
    currentParentId ? `page:${currentParentId}` : currentFolderId ? `folder:${currentFolderId}` : "root"
  );

  const [, startTransition] = useTransition();

  const initialConfig = useMemo(
    () => ({
      namespace: `notebook-${documentId}`,
      theme: editorTheme,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      editorState: initialContent ? JSON.stringify(initialContent) : undefined,
      onError(error: Error) {
        console.error(error);
      },
    }),
    [documentId, initialContent]
  );

  function commitTitle() {
    const value = title.trim() || "Sem título";
    setTitle(value);
    startTransition(async () => {
      await renameDocument(documentId, value);
      router.refresh();
    });
  }

  function commitDescription() {
    startTransition(async () => {
      await updateDocumentDescription(documentId, description);
      router.refresh();
    });
  }

  function pickIcon(next: string) {
    setIcon(next);
    startTransition(async () => {
      await updateDocumentIcon(documentId, next);
      router.refresh();
    });
  }

  function pickCover(next: string | null) {
    setCover(next);
    startTransition(async () => {
      await updateDocumentCover(documentId, next);
      router.refresh();
    });
  }

  function addProperty() {
    const key = newPropKey.trim();
    if (!key) return;
    setProperties((prev) => ({ ...prev, [key]: newPropValue.trim() }));
    startTransition(async () => {
      await updateDocumentProperty(documentId, key, newPropValue.trim());
    });
    setNewPropKey("");
    setNewPropValue("");
  }

  function removeProperty(key: string) {
    setProperties((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    startTransition(async () => {
      await updateDocumentProperty(documentId, key, null);
    });
  }

  function addTag() {
    const clean = tagInput.trim();
    if (!clean) return;
    if (!tags.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      setTags((prev) => [...prev, { tagId: `pending-${clean}`, name: clean }]);
    }
    setTagInput("");
    startTransition(async () => {
      await toggleDocumentTag(documentId, clean);
      router.refresh();
    });
  }

  function removeTag(name: string) {
    setTags((prev) => prev.filter((t) => t.name !== name));
    startTransition(async () => {
      await toggleDocumentTag(documentId, name);
      router.refresh();
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      const duplicated = await duplicateDocument(documentId);
      if (duplicated) router.push(`/dashboard/documents/${duplicated.id}`);
    });
  }

  function handleMove() {
    startTransition(async () => {
      try {
        if (moveTarget === "root") {
          await moveNotebookItem("document", documentId, { folderId: null, parentPageId: null });
        } else if (moveTarget.startsWith("folder:")) {
          await moveNotebookItem("document", documentId, {
            folderId: moveTarget.slice("folder:".length),
            parentPageId: null,
          });
        } else if (moveTarget.startsWith("page:")) {
          await moveNotebookItem("document", documentId, {
            parentPageId: moveTarget.slice("page:".length),
          });
        }
        setShowMoveDialog(false);
        router.refresh();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Não foi possível mover a página.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir esta página? Isso não pode ser desfeito.")) return;
    startTransition(async () => {
      await deleteDocument(documentId);
      router.push("/dashboard/documents");
    });
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] pt-8">
      <LexicalComposer initialConfig={initialConfig}>
        {cover && <div className="h-32 w-full rounded-b-lg" style={{ backgroundColor: cover }} />}

        <div className="w-full px-6 pb-32">
          <nav className="mb-8 mt-4 flex items-center gap-1 text-xs text-base-content/40">
            <Link href="/dashboard/documents" className="transition-colors hover:text-base-content">
              Páginas
            </Link>
            <ChevronRight size={12} />
            <span className="max-w-48 truncate text-base-content/60">{title || "Sem título"}</span>
          </nav>

          {/* Page header */}
          <header className="group mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="dropdown dropdown-start">
                    <button
                      type="button"
                      tabIndex={0}
                      className="flex h-16 w-16 items-center justify-center rounded-xl text-5xl transition-colors hover:bg-base-200"
                      title="Alterar ícone"
                    >
                      {icon ?? "📝"}
                    </button>

                    <div
                      tabIndex={0}
                      className="dropdown-content z-50 mt-2 grid w-52 grid-cols-6 gap-1 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl"
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-base-200"
                          onClick={() => pickIcon(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="dropdown dropdown-start opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      tabIndex={0}
                      className="btn btn-ghost btn-xs gap-1.5 text-base-content/50"
                      title="Capa"
                    >
                      <Palette size={13} />
                      {cover ? "Trocar capa" : "Adicionar capa"}
                    </button>

                    <div
                      tabIndex={0}
                      className="dropdown-content z-50 mt-2 flex w-56 flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl"
                    >
                      <div className="grid grid-cols-6 gap-1">
                        {COVER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            className="h-8 w-8 rounded-md border border-base-300"
                            style={{ backgroundColor: option.value }}
                            onClick={() => pickCover(option.value)}
                          />
                        ))}
                      </div>
                      {cover && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-base-content/50"
                          onClick={() => pickCover(null)}
                        >
                          Remover capa
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <input
                  className="block w-full border-none bg-transparent p-0 text-4xl font-bold tracking-tight text-base-content outline-none placeholder:text-base-content/25 focus:outline-none focus:ring-0 lg:text-5xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Sem título"
                />

                {/* Description */}
                <input
                  className="mt-2 block w-full border-none bg-transparent p-0 text-sm text-base-content/50 outline-none placeholder:text-base-content/25 focus:outline-none focus:ring-0"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={commitDescription}
                  placeholder="Adicionar uma descrição..."
                />

                {/* Properties */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {Object.entries(properties).map(([key, value]) => (
                    <span
                      key={key}
                      className="group/prop flex items-center gap-1 rounded-full bg-base-200 px-2.5 py-1 text-xs text-base-content/70"
                    >
                      <span className="font-medium">{key}:</span> {String(value)}
                      <button
                        type="button"
                        className="ml-0.5 opacity-0 transition-opacity group-hover/prop:opacity-100"
                        onClick={() => removeProperty(key)}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  <div className="dropdown dropdown-start">
                    <button
                      type="button"
                      tabIndex={0}
                      className="flex items-center gap-1 rounded-full border border-dashed border-base-300 px-2.5 py-1 text-xs text-base-content/40 hover:text-base-content/70"
                    >
                      <Plus size={11} />
                      Propriedade
                    </button>
                    <div
                      tabIndex={0}
                      className="dropdown-content z-50 mt-2 flex w-56 flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl"
                    >
                      <input
                        className="input input-xs input-bordered"
                        placeholder="Nome (ex: status)"
                        value={newPropKey}
                        onChange={(e) => setNewPropKey(e.target.value)}
                      />
                      <input
                        className="input input-xs input-bordered"
                        placeholder="Valor (ex: em andamento)"
                        value={newPropValue}
                        onChange={(e) => setNewPropValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addProperty()}
                      />
                      <button type="button" className="btn btn-xs btn-primary" onClick={addProperty}>
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t.tagId}
                      className="group/tag flex items-center gap-1 rounded-full border border-base-300 px-2.5 py-1 text-xs text-base-content/60"
                    >
                      {t.name}
                      <button
                        type="button"
                        className="opacity-0 transition-opacity group-hover/tag:opacity-100"
                        onClick={() => removeTag(t.name)}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="input input-xs input-bordered w-24"
                    placeholder="+ tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                  />
                </div>

                {/* Metadata */}
                <div className="mt-3 flex items-center gap-3 text-xs text-base-content/40">
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} />
                    Página
                  </span>

                  <span>•</span>

                  <div className="flex items-center gap-1">
                    {saveState === "saving" && (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Salvando
                      </>
                    )}
                    {saveState === "saved" && (
                      <>
                        <Check size={12} />
                        Salvo
                      </>
                    )}
                    {saveState === "idle" && "Alterações salvas"}
                  </div>
                </div>
              </div>

              {/* Page actions */}
              <div className="dropdown dropdown-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  tabIndex={0}
                  aria-label="Ações da página"
                  className="btn btn-ghost btn-sm btn-square text-base-content/40"
                >
                  <MoreHorizontal size={18} />
                </button>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-50 mt-1 w-48 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
                >
                  <li>
                    <button type="button" onClick={handleDuplicate}>
                      Duplicar página
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMoveTarget(
                          currentParentId
                            ? `page:${currentParentId}`
                            : currentFolderId
                            ? `folder:${currentFolderId}`
                            : "root"
                        );
                        setShowMoveDialog(true);
                      }}
                    >
                      Mover para...
                    </button>
                  </li>

                  <div className="my-1 border-t border-base-300" />

                  <li>
                    <button type="button" className="text-error" onClick={handleDelete}>
                      <Trash2 size={14} />
                      Excluir página
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          {showMoveDialog && (
            <div className="modal modal-open" role="dialog" aria-modal="true">
              <div className="modal-box max-w-sm">
                <h2 className="text-lg font-semibold">Mover página</h2>
                <select
                  className="select select-bordered mt-4 w-full"
                  value={moveTarget}
                  onChange={(event) => setMoveTarget(event.target.value)}
                >
                  <option value="root">Páginas (raiz)</option>
                  <optgroup label="Pastas">
                    {folders.map((folder) => (
                      <option key={folder.id} value={`folder:${folder.id}`}>
                        {folder.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Dentro de outra página (subpage)">
                    {pages.map((page) => (
                      <option key={page.id} value={`page:${page.id}`}>
                        {page.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="modal-action">
                  <button type="button" className="btn" onClick={() => setShowMoveDialog(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleMove}>
                    Mover
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="modal-backdrop"
                aria-label="Fechar"
                onClick={() => setShowMoveDialog(false)}
              />
            </div>
          )}

          {/* Editor */}
          <div className="relative">
            <div className="sticky top-20 z-20 mb-4">
              <div className="w-fit max-w-full rounded-lg border border-base-300/70 bg-base-100/90 shadow-sm backdrop-blur-md w-full">
                <ToolbarPlugin />
              </div>
            </div>

            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="
                      min-h-[65vh]
                      w-full
                      rounded-lg
                      bg-transparent
                      px-1
                      py-2
                      text-[15px]
                      leading-7
                      text-base-content
                      outline-none
                      focus:outline-none
                    "
                  />
                }
                placeholder={
                  <div className="pointer-events-none absolute left-1 top-2 text-[15px] text-base-content/30">
                    Comece a escrever...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
        </div>

        <HistoryPlugin />
        <ListPlugin />

        <AutosavePlugin documentId={documentId} onStatusChange={setSaveState} />
      </LexicalComposer>
    </div>
  );
}
