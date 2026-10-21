"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import {
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import {
  Check,
  ChevronRight,
  FileDown,
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
import { DocIcon } from "@/components/editor/doc-icon";
import { DocIconPicker } from "@/components/editor/doc-icon-picker";
import { DocCover } from "@/components/editor/doc-cover";
import { usePrintDocument } from "@/components/editor/use-print-document";
import { DocCoverPicker } from "@/components/editor/doc-cover-picker";
import { EditorBodySkeleton } from "@/components/editor/editor-skeleton";
import { TemplateGalleryPlugin } from "@/components/editor/plugins/template-gallery-plugin";
import "@/components/editor/editor.css";

import { AutosavePlugin } from "@/components/editor/plugins/auto-save-plugin";
import { BlockSelectionPlugin } from "@/components/editor/plugins/block-selection-plugin";
import { ContextualToolsPlugin } from "@/components/editor/plugins/contextual-tools-plugin";
import { SlashMenuPlugin } from "@/components/editor/plugins/slash-menu-plugin";
import { LayoutPlugin } from "@/components/editor/plugins/layout-plugin";
import { DividerPlugin } from "@/components/editor/plugins/divider-plugin";
import {
  LayoutContainerNode,
  LayoutItemNode,
} from "@/components/editor/nodes/layout-nodes";
import { DividerNode } from "@/components/editor/nodes/divider-node";
import { TableToolsPlugin } from "@/components/editor/plugins/table-tools-plugin";
import { CodeToolsPlugin } from "@/components/editor/plugins/code-tools-plugin";
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
  // Mostra o skeleton até o editor (cliente) estar montado.
  const printRootRef = useRef<HTMLDivElement>(null);
  usePrintDocument(printRootRef, title);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [editorAnchor, setEditorAnchor] = useState<HTMLDivElement | null>(
    null,
  );

  const initialConfig = useMemo(
    () => ({
      namespace: `notebook-${documentId}`,
      theme: editorTheme,
      nodes: [
        CodeNode,
        HeadingNode,
        HorizontalRuleNode, // mantido para ler documentos antigos (vira DividerNode)
        DividerNode,
        LayoutContainerNode,
        LayoutItemNode,
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

  function pickIcon(next: string | null) {
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

  function handleExportPdf() {
    // Fecha o menu (dropdown do daisyUI abre por foco) e abre o diálogo de
    // impressão: em "Destino", escolha "Salvar como PDF".
    (document.activeElement as HTMLElement | null)?.blur();
    setShowEmojiPicker(false);
    setShowCoverPicker(false);
    setTimeout(() => window.print(), 150);
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
    <div ref={printRootRef} className="doc-print-root min-h-[calc(100vh-5rem)]">
      <LexicalComposer initialConfig={initialConfig}>
        {cover && <DocCover value={cover} className="doc-print-cover h-44 rounded-b-xl" />}

        <div className="doc-print-body w-full px-6 pb-32">
          <header className="group mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      className="flex h-16 w-16 items-center justify-center rounded-xl transition-colors hover:bg-base-200"
                      title="Alterar ícone"
                      data-icon-trigger
                      aria-haspopup="dialog"
                      aria-expanded={showEmojiPicker}
                      onClick={() => setShowEmojiPicker((visible) => !visible)}
                    >
                      <DocIcon value={icon} size={56} />
                    </button>

                    {showEmojiPicker && (
                      <DocIconPicker
                        value={icon}
                        onChange={pickIcon}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>

                  <div className="no-print relative">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs gap-1.5 text-base-content/50"
                      title="Capa"
                      data-cover-trigger
                      onClick={() => setShowCoverPicker((visible) => !visible)}
                    >
                      <Palette size={13} />
                      {cover ? "Trocar capa" : "Adicionar capa"}
                    </button>

                    {showCoverPicker && (
                      <DocCoverPicker
                        value={cover}
                        onChange={pickCover}
                        onClose={() => setShowCoverPicker(false)}
                      />
                    )}
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

                {/* Metadata */}
                <div className="no-print mt-3 flex items-center gap-3 text-xs text-base-content/40">
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

                  <span>•</span>

                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-base-content/40 transition-colors hover:text-base-content/70"
                    onClick={() =>
                      setShowAdvancedOptions((visible) => !visible)
                    }
                    aria-expanded={showAdvancedOptions}
                  >
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${showAdvancedOptions ? "rotate-90" : ""}`}
                    />
                    Opções avançadas do documento
                  </button>
                </div>

                {showAdvancedOptions && (
                  <div className="no-print mt-2 rounded-xl border border-base-200 bg-base-100/50 p-3">
                    {/* Description */}
                    <input
                      className="block w-full border-none bg-transparent p-0 text-sm text-base-content/50 outline-none placeholder:text-base-content/25 focus:outline-none focus:ring-0"
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
                          <span className="font-medium">{key}:</span>{" "}
                          {String(value)}
                          <button
                            type="button"
                            className="ml-0.5 opacity-0 transition-opacity group-hover/prop:opacity-100"
                            onClick={() => removeProperty(key)}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}

                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full border border-dashed border-base-300 px-2.5 py-1 text-xs text-base-content/40 hover:text-base-content/70"
                          onClick={() =>
                            setShowPropertyForm((visible) => !visible)
                          }
                        >
                          <Plus size={11} />
                          Propriedade
                        </button>
                        {showPropertyForm && (
                          <div className="absolute left-0 top-full z-50 mt-2 flex w-56 flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">
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
                              onKeyDown={(e) =>
                                e.key === "Enter" && addProperty()
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-xs btn-primary"
                              onClick={addProperty}
                            >
                              Adicionar
                            </button>
                          </div>
                        )}
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
                  </div>
                )}
              </div>

              {/* Page actions */}
              <div className="no-print dropdown dropdown-end">
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
                    <button type="button" onClick={handleExportPdf}>
                      <FileDown size={14} />
                      Exportar como PDF
                    </button>
                  </li>

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
                              : "root",
                        );
                        setShowMoveDialog(true);
                      }}
                    >
                      Mover para...
                    </button>
                  </li>

                  <div className="my-1 border-t border-base-300" />

                  <li>
                    <button
                      type="button"
                      className="text-error"
                      onClick={handleDelete}
                    >
                      <Trash2 size={14} />
                      Excluir página
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          {showMoveDialog && (
            <div className="no-print modal modal-open" role="dialog" aria-modal="true">
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
                  <optgroup label="Dentro de outra página (subpágina)">
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
          {!mounted && <EditorBodySkeleton />}
          <div ref={setEditorAnchor} className={mounted ? "doc-print-editor relative pl-14" : "hidden"}>
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
                    Escreva algo ou digite &quot;/&quot; para ver os comandos...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <TemplateGalleryPlugin />
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
        <LayoutPlugin />
        <DividerPlugin />
        <TableToolsPlugin />
        <CodeToolsPlugin />

        <AutosavePlugin documentId={documentId} onStatusChange={setSaveState} />
      </LexicalComposer>
    </div>
  );
}
