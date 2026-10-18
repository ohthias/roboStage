"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import {
  DEFAULT_TRANSFORMERS,
  MarkdownShortcutPlugin,
} from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { CHECK_LIST, type ElementTransformer } from "@lexical/markdown";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
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
import { useToast } from "@/app/context/ToastContext";
import { editorTheme } from "@/components/editor/editor-theme";
import "@/components/editor/editor.css";

import { AutosavePlugin } from "@/components/editor/plugins/auto-save-plugin";
import { BlockSelectionPlugin } from "@/components/editor/plugins/block-selection-plugin";
import { ContextualToolsPlugin } from "@/components/editor/plugins/contextual-tools-plugin";
import { SlashMenuPlugin } from "@/components/editor/plugins/slash-menu-plugin";
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

const EMOJI_OPTIONS = [
  "📝",
  "🤖",
  "🧪",
  "🏁",
  "⚙️",
  "📌",
  "💡",
  "🔧",
  "📊",
  "🗂️",
  "🎯",
  "🚀",
];
const COVER_OPTIONS = [
  { label: "Vermelho", value: "#cf2a2a" },
  { label: "Azul", value: "#1e459f" },
  { label: "Verde", value: "#16a34a" },
  { label: "Laranja", value: "#ea580c" },
  { label: "Roxo", value: "#7c3aed" },
  { label: "Rosa", value: "#db2777" },
  { label: "Cinza", value: "#64748b" },
  { label: "Amarelo", value: "#d4a017" },
  { label: "Turquesa", value: "#0d9488" },
  { label: "Preto", value: "#121212" },
  { label: "Branco", value: "#f3f3f3" },
];

// "---" / "***" / "___" viram um divisor.
const HR_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? "***" : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode();
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }
    line.selectNext();
  },
  type: "element",
};

const MARKDOWN_TRANSFORMERS = [
  HR_TRANSFORMER,
  CHECK_LIST, // "[] " / "- [ ] " → lista de tarefas (antes da lista comum)
  ...DEFAULT_TRANSFORMERS,
];

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
  const { addToast } = useToast();

  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [cover, setCover] = useState(initialCover);
  const [properties, setProperties] = useState(initialProperties);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropValue, setNewPropValue] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTarget, setMoveTarget] = useState(
    currentParentId
      ? `page:${currentParentId}`
      : currentFolderId
        ? `folder:${currentFolderId}`
        : "root",
  );

  const [, startTransition] = useTransition();
  const [editorAnchor, setEditorAnchor] = useState<HTMLDivElement | null>(null);

  const initialConfig = useMemo(
    () => ({
      namespace: `notebook-${documentId}`,
      theme: editorTheme,
      nodes: [
        CodeNode,
        HeadingNode,
        HorizontalRuleNode,
        LinkNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        TableCellNode,
        TableNode,
        TableRowNode,
      ],
      editorState: initialContent ? JSON.stringify(initialContent) : undefined,
      onError(error: Error) {
        console.error(error);
      },
    }),
    [documentId, initialContent],
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
          await moveNotebookItem("document", documentId, {
            folderId: null,
            parentPageId: null,
          });
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
        addToast("Página movida com sucesso.", "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível mover a página.",
          "error",
        );
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir esta página? Isso não pode ser desfeito."))
      return;
    startTransition(async () => {
      await deleteDocument(documentId);
      router.push("/dashboard/documents");
    });
  }

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <LexicalComposer initialConfig={initialConfig}>
        {/* Cover */}
        {cover && (
          <div
            className="h-36 w-full rounded-b-2xl sm:h-44"
            style={{ backgroundColor: cover }}
          />
        )}

        <div className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
          <header className="group relative my-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      className="flex size-14 items-center justify-center rounded-2xl border border-base-300/70 bg-base-200/70 text-3xl transition-all hover:border-primary/40 hover:bg-base-200 sm:size-16 sm:text-4xl"
                      title="Alterar ícone"
                      aria-label="Alterar ícone do documento"
                      onClick={() => setShowEmojiPicker((visible) => !visible)}
                    >
                      {icon ?? "📝"}
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute left-0 top-full z-50 mt-2 grid w-56 grid-cols-6 gap-1 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            aria-label={`Selecionar ${emoji}`}
                            className="flex size-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-base-200"
                            onClick={() => {
                              pickIcon(emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl border border-base-300/70 bg-base-100 px-3 py-2 text-xs font-medium text-base-content/65 transition-colors hover:border-primary/40 hover:text-base-content"
                      title="Personalizar capa"
                      onClick={() => setShowCoverPicker((visible) => !visible)}
                    >
                      <Palette size={15} />
                      {cover ? "Personalizar capa" : "Adicionar capa"}
                    </button>

                    {showCoverPicker && (
                      <div className="absolute left-0 top-full z-50 mt-2 flex w-60 flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl">
                        <p className="text-xs font-semibold text-base-content/70">
                          Cor da capa
                        </p>

                        <div className="grid grid-cols-6 gap-2">
                          {COVER_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              title={option.label}
                              aria-label={`Capa ${option.label}`}
                              aria-pressed={cover === option.value}
                              className={`size-7 rounded-lg border transition-transform hover:scale-110 ${
                                cover === option.value
                                  ? "border-base-content ring-2 ring-primary/40 ring-offset-2 ring-offset-base-100"
                                  : "border-base-300"
                              }`}
                              style={{ backgroundColor: option.value }}
                              onClick={() => {
                                pickCover(option.value);
                                setShowCoverPicker(false);
                              }}
                            />
                          ))}
                        </div>

                        {cover && (
                          <button
                            type="button"
                            className="rounded-lg px-2 py-1.5 text-left text-xs text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
                            onClick={() => {
                              pickCover(null);
                              setShowCoverPicker(false);
                            }}
                          >
                            Remover capa
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <input
                  className="block w-full border-0 bg-transparent p-0 text-3xl font-bold leading-tight tracking-tight text-base-content outline-none placeholder:text-base-content/25 focus:outline-none focus:ring-0 sm:text-4xl lg:text-5xl"
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
                  aria-label="Título do documento"
                />

                {/* Save status and document controls */}
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-base-content/50">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      saveState === "saved"
                        ? "text-success"
                        : saveState === "saving"
                          ? "text-base-content/60"
                          : "text-base-content/45"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {saveState === "saving" ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Salvando alterações
                      </>
                    ) : saveState === "saved" ? (
                      <>
                        <Check size={13} />
                        Salvo
                      </>
                    ) : (
                      "Alterações salvas"
                    )}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-base-200 hover:text-base-content"
                    onClick={() =>
                      setShowAdvancedOptions((visible) => !visible)
                    }
                    aria-expanded={showAdvancedOptions}
                  >
                    <ChevronRight
                      size={14}
                      className={`transition-transform duration-200 ${
                        showAdvancedOptions ? "rotate-90" : ""
                      }`}
                    />
                    {showAdvancedOptions ? "Ocultar detalhes" : "Detalhes"}
                  </button>
                </div>

                {/* Advanced document properties */}
                {showAdvancedOptions && (
                  <div className="mt-5 space-y-5 rounded-2xl border border-base-300/70 bg-base-200/30 p-4 sm:p-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-base-content/60">
                        Descrição
                      </label>
                      <input
                        className="w-full rounded-xl border border-base-300/70 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none transition-colors placeholder:text-base-content/35 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={commitDescription}
                        placeholder="Descreva o objetivo desta página..."
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-base-content/60">
                        Propriedades
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {Object.entries(properties).map(([key, value]) => (
                          <span
                            key={key}
                            className="group/prop inline-flex items-center gap-2 rounded-lg border border-base-300/70 bg-base-100 px-3 py-1.5 text-xs text-base-content/75"
                          >
                            <span className="text-base-content/50">{key}</span>
                            <span className="font-semibold">
                              {String(value)}
                            </span>
                            <button
                              type="button"
                              className="rounded p-0.5 text-base-content/40 transition-colors hover:bg-error/10 hover:text-error"
                              aria-label={`Remover propriedade ${key}`}
                              onClick={() => removeProperty(key)}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}

                        <div className="relative">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-base-300 px-3 py-1.5 text-xs text-base-content/60 transition-colors hover:border-primary/50 hover:text-primary"
                            onClick={() =>
                              setShowPropertyForm((visible) => !visible)
                            }
                          >
                            <Plus size={13} />
                            Adicionar
                          </button>

                          {showPropertyForm && (
                            <div className="absolute left-0 top-full z-50 mt-2 flex w-60 flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">
                              <input
                                className="input input-sm input-bordered w-full"
                                placeholder="Nome da propriedade"
                                value={newPropKey}
                                onChange={(e) => setNewPropKey(e.target.value)}
                              />
                              <input
                                className="input input-sm input-bordered w-full"
                                placeholder="Valor"
                                value={newPropValue}
                                onChange={(e) =>
                                  setNewPropValue(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" && addProperty()
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={addProperty}
                              >
                                Adicionar propriedade
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-base-content/60">
                        Etiquetas
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {tags.map((t) => (
                          <span
                            key={t.tagId}
                            className="group/tag inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-base-content/75 ring-1 ring-inset ring-primary/15"
                          >
                            {t.name}
                            <button
                              type="button"
                              className="rounded-full p-0.5 text-base-content/45 transition-colors hover:bg-error/10 hover:text-error"
                              aria-label={`Remover etiqueta ${t.name}`}
                              onClick={() => removeTag(t.name)}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}

                        <input
                          className="w-28 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-base-content/40 focus:border-base-300 focus:bg-base-100"
                          placeholder="+ Etiqueta"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addTag()}
                          aria-label="Adicionar etiqueta"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Page actions */}
              <div className="dropdown dropdown-end shrink-0">
                <button
                  type="button"
                  tabIndex={0}
                  aria-label="Ações da página"
                  title="Ações da página"
                  className="btn btn-ghost btn-square btn-sm rounded-xl text-base-content/55 hover:bg-base-200 hover:text-base-content"
                >
                  <MoreHorizontal size={20} />
                </button>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-50 mt-2 w-52 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl"
                >
                  <li>
                    <button
                      type="button"
                      className="rounded-xl text-sm"
                      onClick={handleDuplicate}
                    >
                      <FileText size={15} />
                      Duplicar página
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      className="rounded-xl text-sm"
                      onClick={() => {
                        setMoveTarget(
                          currentParentId
                            ? `page:${currentParentId}`
                            : currentFolderId
                              ? `folder:${currentFolderId}`
                              : "root",
                        );
                        setShowMoveDialog(true);
                      }}
                    >
                      Mover para...
                    </button>
                  </li>

                  <li className="mt-1 border-t border-base-300 pt-1">
                    <button
                      type="button"
                      className="rounded-xl text-sm text-error hover:bg-error/10"
                      onClick={handleDelete}
                    >
                      <Trash2 size={15} />
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
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowMoveDialog(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleMove}
                  >
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
          {/* pl-14: espaço à esquerda para o handle (+ / arrastar) dos blocos */}
          <div ref={setEditorAnchor} className="relative pl-14">
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
                  <div className="pointer-events-none absolute left-1 top-4 text-[15px] text-base-content/30">
                    Escreva algo ou digite &quot;/&quot; para ver os comandos...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
        </div>

        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
        <TablePlugin hasHorizontalScroll hasCellMerge />
        <SlashMenuPlugin />
        <BlockSelectionPlugin anchorElem={editorAnchor} />
        <ContextualToolsPlugin />

        <AutosavePlugin documentId={documentId} onStatusChange={setSaveState} />
      </LexicalComposer>
    </div>
  );
}
