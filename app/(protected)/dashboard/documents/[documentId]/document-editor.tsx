"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
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
import {
  Check,
  ChevronRight,
  CloudOff,
  Copy,
  FileDown,
  FolderInput,
  History,
  Loader2,
  MoreHorizontal,
  MoveHorizontal,
  Palette,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { editorTheme } from "@/components/editor/editor-theme";
import { DocIcon } from "@/components/editor/doc-icon";
import { DocIconPicker } from "@/components/editor/doc-icon-picker";
import { DocCover } from "@/components/editor/doc-cover";
import { EDITOR_NODES } from "@/components/editor/editor-nodes";
import { recordRecentDoc } from "@/components/editor/recent-docs";
import { usePrintDocument } from "@/components/editor/use-print-document";
import { DocCoverPicker } from "@/components/editor/doc-cover-picker";
import { EditorBodySkeleton } from "@/components/editor/editor-skeleton";
import { freshestContent } from "@/components/editor/doc-content-cache";
import "@/components/editor/editor.css";

import { AutosavePlugin, type SaveState } from "@/components/editor/plugins/auto-save-plugin";
import { LayoutPlugin } from "@/components/editor/plugins/layout-plugin";
import { DividerPlugin } from "@/components/editor/plugins/divider-plugin";
import { EmbedPlugin } from "@/components/editor/plugins/embed-plugin";
import {
  BlockSelectionPlugin,
  CodeToolsPlugin,
  ContextualToolsPlugin,
  SlashMenuPlugin,
  TableToolsPlugin,
  TemplateGalleryPlugin,
} from "@/components/editor/plugins/lazy-plugins";
import {
  deleteDocument,
  duplicateDocument,
  moveNotebookItem,
  renameDocument,
  updateDocumentCover,
  updateDocumentDescription,
  updateDocumentFont,
  updateDocumentIcon,
  updateDocumentProperty,
} from "../actions";
import { ResourceLabels } from "@/components/stagebook/labels/resource-labels";
import type { MilestoneDTO, TagDTO } from "@/types/labels";
import { findPath, moveOptions, nodeLabel, useNotebook } from "../notebook-context";
import { IntentLink } from "../intent-link";
import { HistoryPanel } from "./history-panel";
import { DOC_FONTS, docFontFamily, isDocFontId, type DocFontId } from "@/utils/stagebook/doc-fonts";

import { unwrapAction } from "@/utils/stagebook/action-result";
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

const FULL_WIDTH_KEY = "notebook:full-width";
const fullWidthListeners = new Set<() => void>();

function readFullWidth() {
  try {
    return localStorage.getItem(FULL_WIDTH_KEY) === "1";
  } catch {
    return false;
  }
}

function setFullWidthPreference(next: boolean) {
  try {
    localStorage.setItem(FULL_WIDTH_KEY, next ? "1" : "0");
  } catch {}
  fullWidthListeners.forEach((listener) => listener());
}

/** Preferência "largura total" do editor, guardada neste navegador. */
function useFullWidthPreference() {
  return useSyncExternalStore(
    (listener) => {
      fullWidthListeners.add(listener);
      window.addEventListener("storage", listener);
      return () => {
        fullWidthListeners.delete(listener);
        window.removeEventListener("storage", listener);
      };
    },
    readFullWidth,
    () => false,
  );
}

export function NotebookEditor({
  documentId,
  initialTitle,
  initialIcon,
  initialDescription,
  initialCover,
  initialFont,
  initialProperties,
  initialTags,
  initialMilestone,
  initialContent,
  initialUpdatedAt,
  currentFolderId,
  currentParentId,
}: {
  documentId: string;
  initialTitle: string;
  initialIcon: string | null;
  initialDescription: string | null;
  initialCover: string | null;
  initialFont: string | null;
  initialProperties: Record<string, unknown>;
  initialTags: TagDTO[];
  initialMilestone: MilestoneDTO | null;
  initialContent: Record<string, unknown> | null;
  initialUpdatedAt: string;
  currentFolderId: string | null;
  currentParentId: string | null;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const { tree } = useNotebook();

  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [cover, setCover] = useState(initialCover);
  const [pageFont, setPageFont] = useState<DocFontId>(isDocFontId(initialFont) ? initialFont : "default");
  const [properties, setProperties] = useState(initialProperties);
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropValue, setNewPropValue] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(
    Boolean(initialDescription) || Object.keys(initialProperties).length > 0,
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fullWidth = useFullWidthPreference();
  const [moveTarget, setMoveTarget] = useState(
    currentParentId
      ? `page:${currentParentId}`
      : currentFolderId
        ? `folder:${currentFolderId}`
        : "root",
  );

  const [, startTransition] = useTransition();
  const printRootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  // Ajusta a altura do título ao conteúdo (quebra de linha em telas estreitas).
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement ?? el); // largura muda → recalcula
    return () => observer.disconnect();
  }, [title]);
  usePrintDocument(printRootRef, title);
  // Mostra o skeleton até o editor (cliente) estar montado.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => recordRecentDoc(documentId), [documentId]);
  const [editorAnchor, setEditorAnchor] = useState<HTMLDivElement | null>(
    null,
  );

  // Caminho na árvore (pastas e páginas-pai) para o breadcrumb, vindo do layout.
  const ancestors = useMemo(() => findPath(tree, documentId).slice(0, -1), [tree, documentId]);
  const moveChoices = useMemo(() => moveOptions(tree, documentId), [tree, documentId]);

  const initialConfig = useMemo(
    () => {
      // Se esta aba salvou algo mais novo do que o que veio do servidor
      // (página pré-carregada ou voltando pelo histórico do navegador), usa o
      // conteúdo salvo — nunca reabre uma versão antiga.
      const content = freshestContent(documentId, initialContent, initialUpdatedAt);
      return {
        namespace: `notebook-${documentId}`,
        theme: editorTheme,
        nodes: EDITOR_NODES,
        editorState: content ? JSON.stringify(content) : undefined,
        onError(error: Error) {
          console.error(error);
        },
      };
    },
    // O LexicalComposer só lê a configuração ao montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentId],
  );

  const handleSaveState = useCallback((state: SaveState) => {
    setSaveState(state);
  }, []);

  function toggleFullWidth() {
    setFullWidthPreference(!fullWidth);
  }

  function closeMenus() {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  function commitTitle() {
    const value = title.trim() || "Sem título";
    setTitle(value);
    if (value === initialTitle) return;
    startTransition(async () => {
      try {
        unwrapAction(await renameDocument(documentId, value));
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível renomear.", "error");
      }
    });
  }

  function commitDescription() {
    if (description === (initialDescription ?? "")) return;
    startTransition(async () => {
      unwrapAction(await updateDocumentDescription(documentId, description));
      router.refresh();
    });
  }

  function pickIcon(next: string | null) {
    setIcon(next);
    startTransition(async () => {
      unwrapAction(await updateDocumentIcon(documentId, next));
      router.refresh();
    });
  }

  function pickCover(next: string | null) {
    setCover(next);
    startTransition(async () => {
      unwrapAction(await updateDocumentCover(documentId, next));
      router.refresh();
    });
  }

  function pickPageFont(next: DocFontId) {
    closeMenus();
    setPageFont(next);
    startTransition(async () => {
      try {
        unwrapAction(await updateDocumentFont(documentId, next));
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível trocar a fonte.", "error");
      }
    });
  }

  function addProperty() {
    const key = newPropKey.trim();
    if (!key) return;
    setProperties((prev) => ({ ...prev, [key]: newPropValue.trim() }));
    startTransition(async () => {
      unwrapAction(await updateDocumentProperty(documentId, key, newPropValue.trim()));
    });
    setNewPropKey("");
    setNewPropValue("");
    setShowPropertyForm(false);
  }

  function removeProperty(key: string) {
    setProperties((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    startTransition(async () => {
      unwrapAction(await updateDocumentProperty(documentId, key, null));
    });
  }

  function handleExportPdf() {
    // Fecha o menu (dropdown do daisyUI abre por foco) e abre o diálogo de
    // impressão: em "Destino", escolha "Salvar como PDF".
    closeMenus();
    setShowEmojiPicker(false);
    setShowCoverPicker(false);
    setTimeout(() => window.print(), 150);
  }

  function handleDuplicate() {
    closeMenus();
    startTransition(async () => {
      try {
        const duplicated = unwrapAction(await duplicateDocument(documentId));
        if (duplicated) router.push(`/dashboard/documents/${duplicated.id}`);
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível duplicar.", "error");
      }
    });
  }

  function handleMove() {
    startTransition(async () => {
      try {
        if (moveTarget === "root") {
          unwrapAction(await moveNotebookItem("document", documentId, {
            folderId: null,
            parentPageId: null,
          }));
        } else if (moveTarget.startsWith("folder:")) {
          unwrapAction(await moveNotebookItem("document", documentId, {
            folderId: moveTarget.slice("folder:".length),
            parentPageId: null,
          }));
        } else if (moveTarget.startsWith("page:")) {
          unwrapAction(await moveNotebookItem("document", documentId, {
            parentPageId: moveTarget.slice("page:".length),
          }));
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
    closeMenus();
    if (
      !window.confirm(
        "Mover esta página para a lixeira? Ela pode ser restaurada por 7 dias.",
      )
    )
      return;
    startTransition(async () => {
      try {
        unwrapAction(await deleteDocument(documentId));
        addToast("Página movida para a lixeira.", "success");
        router.push("/dashboard/documents");
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível excluir.", "error");
      }
    });
  }

  const handleRestored = useCallback(
    (version: { title: string; icon: string | null }) => {
      setTitle(version.title);
      setIcon(version.icon);
      router.refresh();
    },
    [router],
  );
  const closeHistory = useCallback(() => setShowHistory(false), []);

  const columnClass = fullWidth ? "max-w-none" : "max-w-[50rem]";
  const pageFontFamily = docFontFamily(pageFont);

  return (
    <div ref={printRootRef} className="doc-print-root min-h-[calc(100vh-3.5rem)]">
      <LexicalComposer initialConfig={initialConfig}>
        {/* Barra superior: caminho, status do salvamento e ações */}
        <div className="no-print sticky top-14 z-20 flex h-11 items-center gap-2 border-b border-base-300/50 bg-base-100/90 px-3 backdrop-blur sm:px-5">
          <nav aria-label="Caminho" className="flex min-w-0 flex-1 items-center gap-1 text-[13px] text-base-content/55">
            <IntentLink
              href="/dashboard/documents"
              className="shrink-0 rounded px-1.5 py-0.5 hover:bg-base-200 hover:text-base-content"
            >
              Páginas
            </IntentLink>
            {ancestors.map((node) => (
              <span key={node.id} className="flex min-w-0 items-center gap-1">
                <ChevronRight size={13} className="shrink-0 text-base-content/30" />
                {node.type === "document" ? (
                  <IntentLink
                    href={`/dashboard/documents/${node.id}`}
                    className="flex min-w-0 items-center gap-1 rounded px-1.5 py-0.5 hover:bg-base-200 hover:text-base-content"
                  >
                    <DocIcon value={node.icon} size={14} fallback={null} />
                    <span className="max-w-[10rem] truncate">{nodeLabel(node) || "Sem título"}</span>
                  </IntentLink>
                ) : (
                  <IntentLink
                    href={`/dashboard/folders/${node.id}`}
                    className="flex min-w-0 items-center gap-1 rounded px-1.5 py-0.5 hover:bg-base-200 hover:text-base-content"
                  >
                    <DocIcon value={node.icon} size={14} fallback={null} />
                    <span className="max-w-[10rem] truncate">{nodeLabel(node)}</span>
                  </IntentLink>
                )}
              </span>
            ))}
            <ChevronRight size={13} className="shrink-0 text-base-content/30" />
            <span className="flex min-w-0 items-center gap-1 px-1.5 font-medium text-base-content/80">
              <DocIcon value={icon} size={14} />
              <span className="truncate">{title || "Sem título"}</span>
            </span>
          </nav>

          <span
            className="hidden shrink-0 items-center gap-1 text-xs text-base-content/45 sm:flex"
            role="status"
            aria-live="polite"
          >
            {saveState === "saving" && (
              <>
                <Loader2 size={12} className="animate-spin" />
                Salvando…
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check size={12} />
                Salvo
              </>
            )}
            {saveState === "error" && (
              <>
                <CloudOff size={12} />
                Não salvo
              </>
            )}
          </span>

          <button
            type="button"
            className="btn btn-ghost btn-sm gap-1.5 px-2 text-base-content/60 hover:text-base-content"
            onClick={() => setShowHistory(true)}
            title="Histórico de versões"
          >
            <History size={16} />
            <span className="hidden md:inline">Histórico</span>
          </button>

          {/* Page actions */}
          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              aria-label="Ações da página"
              className="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-base-content"
            >
              <MoreHorizontal size={18} />
            </button>

            <ul
              tabIndex={0}
              className="menu dropdown-content z-50 mt-1 w-64 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
            >
              <li className="menu-title px-2 pb-1 pt-1.5 text-[11px] uppercase tracking-wider">Fonte da página</li>
              <div className="grid grid-cols-5 gap-1 px-1 pb-1.5" role="radiogroup" aria-label="Fonte da página">
                {DOC_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    role="radio"
                    aria-checked={pageFont === font.id}
                    title={font.label}
                    onClick={() => pickPageFont(font.id)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors ${
                      pageFont === font.id
                        ? "bg-primary/10 text-primary ring-1 ring-primary/40"
                        : "text-base-content/70 hover:bg-base-200"
                    }`}
                  >
                    <span className="text-lg leading-none" style={{ fontFamily: font.family ?? undefined }}>
                      Ag
                    </span>
                    <span className="text-[10px] leading-tight">{font.label}</span>
                  </button>
                ))}
              </div>
              <div className="my-1 border-t border-base-300" />
              <li>
                <button type="button" onClick={() => { closeMenus(); setShowHistory(true); }}>
                  <History size={14} />
                  Histórico de versões
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { closeMenus(); toggleFullWidth(); }}>
                  <MoveHorizontal size={14} />
                  {fullWidth ? "Largura padrão" : "Largura total"}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { closeMenus(); setShowAdvancedOptions((v) => !v); }}>
                  <SlidersHorizontal size={14} />
                  {showAdvancedOptions ? "Ocultar propriedades" : "Mostrar propriedades"}
                </button>
              </li>

              <div className="my-1 border-t border-base-300" />

              <li>
                <button type="button" onClick={handleExportPdf}>
                  <FileDown size={14} />
                  Exportar como PDF
                </button>
              </li>
              <li>
                <button type="button" onClick={handleDuplicate}>
                  <Copy size={14} />
                  Duplicar página
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
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
                  <FolderInput size={14} />
                  Mover para...
                </button>
              </li>

              <div className="my-1 border-t border-base-300" />

              <li>
                <button type="button" className="text-error" onClick={handleDelete}>
                  <Trash2 size={14} />
                  Mover para a lixeira
                </button>
              </li>
            </ul>
          </div>
        </div>

        {cover && (
          <DocCover value={cover} className="doc-print-cover h-36 sm:h-52" />
        )}

        <div
          className={`doc-print-body mx-auto w-full px-5 pb-44 sm:px-10 md:pb-32 ${columnClass}`}
          style={pageFontFamily ? { fontFamily: pageFontFamily } : undefined}
        >
          <header className={`group ${cover ? "-mt-10" : "pt-10 sm:pt-14"} mb-4`}>
            <div className="relative mb-2 w-fit">
              <button
                type="button"
                className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl transition-colors hover:bg-base-200 ${
                  cover ? "bg-base-100 shadow-sm ring-1 ring-base-300/60" : ""
                }`}
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

            {/* Ações rápidas — aparecem ao passar o mouse no cabeçalho */}
            <div className="no-print mb-1 flex flex-wrap items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <div className="relative">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs gap-1.5 font-normal text-base-content/50"
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

              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1.5 font-normal text-base-content/50"
                onClick={() => setShowAdvancedOptions((visible) => !visible)}
                aria-expanded={showAdvancedOptions}
              >
                <SlidersHorizontal size={13} />
                {showAdvancedOptions ? "Ocultar propriedades" : "Propriedades"}
              </button>
            </div>

            {/* Title — textarea para quebrar linha em títulos longos (celular) */}
            <textarea
              ref={titleRef}
              rows={1}
              className="block w-full resize-none overflow-hidden border-none bg-transparent p-0 text-3xl font-bold leading-tight tracking-tight text-base-content outline-none sm:text-4xl placeholder:text-base-content/25 focus:outline-none focus:ring-0 lg:text-[2.75rem]"
              value={title}
              onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).blur();
                }
              }}
              placeholder="Sem título"
              aria-label="Título da página"
            />

            {showAdvancedOptions && (
              <div className="no-print mt-4 space-y-3 rounded-xl border border-base-300/70 bg-base-200/30 p-3 sm:p-4">
                {/* Description */}
                <input
                  className="block w-full border-none bg-transparent p-0 text-sm text-base-content/70 outline-none placeholder:text-base-content/30 focus:outline-none focus:ring-0"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={commitDescription}
                  placeholder="Adicionar uma descrição..."
                  aria-label="Descrição"
                />

                {/* Properties */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {Object.entries(properties).map(([key, value]) => (
                    <span
                      key={key}
                      className="group/prop flex items-center gap-1 rounded-full bg-base-100 px-2.5 py-1 text-xs text-base-content/70 ring-1 ring-base-300/70"
                    >
                      <span className="font-medium">{key}:</span>{" "}
                      {String(value)}
                      <button
                        type="button"
                        aria-label={`Remover ${key}`}
                        className="ml-0.5 p-1 opacity-100 transition-opacity md:p-0 md:opacity-0 md:group-hover/prop:opacity-100"
                        onClick={() => removeProperty(key)}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-full border border-dashed border-base-300 px-2.5 py-1 text-xs text-base-content/45 hover:text-base-content/70"
                      onClick={() => setShowPropertyForm((visible) => !visible)}
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
                          autoFocus
                        />
                        <input
                          className="input input-xs input-bordered"
                          placeholder="Valor (ex: em andamento)"
                          value={newPropValue}
                          onChange={(e) => setNewPropValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addProperty()}
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

                {/* Tags e milestone — catálogo universal (Kanban, Calendário, ThinkLab, LabTest) */}
                <ResourceLabels
                  kind="document"
                  resourceId={documentId}
                  initialTags={initialTags}
                  initialMilestone={initialMilestone}
                />
              </div>
            )}
          </header>

          {showMoveDialog && (
            <div className="no-print modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true">
              <div className="modal-box max-w-sm">
                <h2 className="text-lg font-semibold">Mover página</h2>
                <select
                  className="select select-bordered mt-4 w-full"
                  value={moveTarget}
                  onChange={(event) => setMoveTarget(event.target.value)}
                >
                  <option value="root">Páginas (raiz)</option>
                  {moveChoices.folders.length > 0 && (
                    <optgroup label="Pastas">
                      {moveChoices.folders.map((folder) => (
                        <option key={folder.value} value={folder.value}>
                          {"  ".repeat(folder.depth) + folder.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {moveChoices.pages.length > 0 && (
                    <optgroup label="Dentro de outra página (subpage)">
                      {moveChoices.pages.map((page) => (
                        <option key={page.value} value={page.value}>
                          {"  ".repeat(page.depth) + page.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
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
          {/* md:pl-14 reserva espaço à esquerda para o handle (+ / arrastar) dos
              blocos; o -ml-14 mantém o texto alinhado com o título. */}
          {!mounted && <EditorBodySkeleton />}
          <div
            ref={setEditorAnchor}
            className={mounted ? "doc-print-editor relative pl-0 md:-ml-14 md:pl-14" : "hidden"}
          >
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    aria-label="Conteúdo da página"
                    className="
                      min-h-[60vh]
                      w-full
                      rounded-lg
                      bg-transparent
                      px-1
                      py-2
                      text-base
                      leading-7
                      md:text-[15px]
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
        <EmbedPlugin documentId={documentId} />
        <TableToolsPlugin />
        <CodeToolsPlugin />

        <AutosavePlugin documentId={documentId} onStatusChange={handleSaveState} />

        <HistoryPanel
          documentId={documentId}
          open={showHistory}
          onClose={closeHistory}
          onRestored={handleRestored}
        />
      </LexicalComposer>
    </div>
  );
}
