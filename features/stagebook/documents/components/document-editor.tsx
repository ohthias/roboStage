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
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import type { LexicalEditor } from "lexical";
import { saveAs } from "file-saver";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  Check,
  ChevronRight,
  ClipboardCopy,
  CloudOff,
  Command,
  Copy,
  FileCode2,
  FileDown,
  FileText,
  FolderInput,
  History,
  Loader2,
  MoreHorizontal,
  MoveHorizontal,
  Palette,
  SlidersHorizontal,
  Smile,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";
import { editorTheme } from "@/features/stagebook/editor/editor-theme";
import { DocIcon } from "@/features/stagebook/editor/doc-icon";
import { DocIconPicker } from "@/features/stagebook/editor/doc-icon-picker";
import { DocCover } from "@/features/stagebook/editor/doc-cover";
import { EDITOR_NODES } from "@/features/stagebook/editor/editor-nodes";
import { MARKDOWN_SHORTCUTS } from "@/features/stagebook/editor/markdown-transformers";
import { documentToHtml, documentToMarkdown, exportFileName } from "@/features/stagebook/editor/export-document";
import { RichBlocksPlugin } from "@/features/stagebook/editor/plugins/rich-blocks-plugin";
import type { PaletteAction, PalettePage, PaletteSearchHit } from "@/features/stagebook/editor/plugins/command-palette";
import { recordRecentDoc } from "@/features/stagebook/editor/recent-docs";
import { usePrintDocument } from "@/features/stagebook/editor/use-print-document";
import { DocCoverPicker } from "@/features/stagebook/editor/doc-cover-picker";
import { EditorBodySkeleton } from "@/features/stagebook/editor/editor-skeleton";
import { freshestContent } from "@/features/stagebook/editor/doc-content-cache";
import "@/features/stagebook/editor/editor.css";

import { AutosavePlugin, type SaveState } from "@/features/stagebook/editor/plugins/auto-save-plugin";
import { LayoutPlugin } from "@/features/stagebook/editor/plugins/layout-plugin";
import { TimelinePlugin } from "@/features/stagebook/editor/plugins/timeline-plugin";
import { TabsPlugin } from "@/features/stagebook/editor/plugins/tabs-plugin";
import { StagebookEditorProvider, STAGEBOOK_SEARCH_EVENT } from "@/features/stagebook/editor/stagebook-context";
import { collectSyncIds } from "@/features/stagebook/lib/page-links";
import { getSyncedBlocksForExport, searchPages } from "../actions/blocks";
import { BacklinksPanel } from "./backlinks-panel";
import { DividerPlugin } from "@/features/stagebook/editor/plugins/divider-plugin";
import { EmbedPlugin } from "@/features/stagebook/editor/plugins/embed-plugin";
import {
  BlockSelectionPlugin,
  CodeToolsPlugin,
  CommandPalette,
  ContextualToolsPlugin,
  EmojiPlugin,
  MentionPlugin,
  SyncedBlocksPlugin,
  SlashMenuPlugin,
  TableToolsPlugin,
  TemplateGalleryPlugin,
} from "@/features/stagebook/editor/plugins/lazy-plugins";
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
} from "../actions/documents";
import { ResourceLabels } from "@/features/stagebook/components/labels/resource-labels";
import { PinToggle } from "@/features/stagebook/components/pin-toggle";
import type { MilestoneDTO, TagDTO } from "@/features/stagebook/types/labels";
import { findPath, moveOptions, nodeLabel, useNotebook } from "./notebook-context";
import { IntentLink } from "./intent-link";
import { HistoryPanel } from "./history-panel";
import { DocProperties, propertiesForExport } from "./doc-properties";
import { DOC_FONTS, docFontFamily, isDocFontId, type DocFontId } from "@/features/stagebook/lib/doc-fonts";

import { unwrapAction } from "@/lib/action-result";
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(
    Boolean(initialDescription) ||
      Object.keys(initialProperties).length > 0 ||
      initialTags.length > 0 ||
      Boolean(initialMilestone),
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const editorRef = useRef<LexicalEditor | null>(null);
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

  function commitDescription(value = description) {
    if (value === (initialDescription ?? "")) return;
    startTransition(async () => {
      try {
        unwrapAction(await updateDocumentDescription(documentId, value));
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível salvar a descrição.", "error");
      }
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

  function setProperty(key: string, value: string | null) {
    setProperties((prev) => {
      const next = { ...prev };
      if (value === null || value === "") delete next[key];
      else next[key] = value;
      return next;
    });
    if (value) setShowAdvancedOptions(true);
    startTransition(async () => {
      try {
        unwrapAction(await updateDocumentProperty(documentId, key, value));
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível salvar a propriedade.", "error");
      }
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

  /** Estado atual do editor + dados da página, para exportar. */
  async function exportSource() {
    const editor = editorRef.current;
    if (!editor) return null;
    const state = editor.getEditorState().toJSON();
    const ids = collectSyncIds(state);
    let synced = {};
    if (ids.length) {
      try {
        synced = unwrapAction(await getSyncedBlocksForExport(ids));
      } catch {
        addToast("Blocos sincronizados saíram sem conteúdo na exportação.", "warning");
      }
    }
    return {
      synced,
      state,
      meta: { title: title.trim() || "Sem título", icon, description, properties: propertiesForExport(properties) },
    };
  }

  async function handleExportHtml() {
    closeMenus();
    const source = await exportSource();
    if (!source) return;
    try {
      const hasMath = JSON.stringify(source.state).includes('"type":"equation"');
      const katex = hasMath ? (await import("katex")).default : null;
      const rootStyle = getComputedStyle(document.documentElement);
      const html = documentToHtml(source.state, source.meta, {
        renderMath: katex
          ? (latex, displayMode) =>
              katex.renderToString(latex, { displayMode, throwOnError: false, output: "htmlAndMathml", strict: "ignore" })
          : undefined,
        resolveColor: (value) => rootStyle.getPropertyValue(value.slice(4, -1)).trim() || value,
        fontFamily: docFontFamily(pageFont),
        synced: source.synced,
      });
      saveAs(new Blob([html], { type: "text/html;charset=utf-8" }), exportFileName(source.meta.title, "html"));
    } catch (error) {
      console.error(error);
      addToast("Não foi possível exportar em HTML.", "error");
    }
  }

  async function handleExportMarkdown() {
    closeMenus();
    const source = await exportSource();
    if (!source) return;
    const md = documentToMarkdown(source.state, source.meta, source.synced);
    saveAs(new Blob([md], { type: "text/markdown;charset=utf-8" }), exportFileName(source.meta.title, "md"));
  }

  async function handleCopyMarkdown() {
    const source = await exportSource();
    if (!source) return;
    try {
      await navigator.clipboard.writeText(documentToMarkdown(source.state, source.meta, source.synced));
      addToast("Markdown copiado.", "success");
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
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

  const palettePages = useMemo(() => {
    const out: PalettePage[] = [];
    const walk = (nodes: typeof tree) => {
      for (const node of nodes) {
        if (node.type === "document" && node.id !== documentId) {
          out.push({ id: node.id, title: nodeLabel(node), icon: node.icon, href: `/dashboard/documents/${node.id}` });
        }
        walk(node.children);
      }
    };
    walk(tree);
    return out;
  }, [tree, documentId]);

  const mentionPages = useMemo(
    () => [...palettePages, { id: documentId, title: title || "Sem título", icon, href: `/dashboard/documents/${documentId}` }],
    [palettePages, documentId, title, icon],
  );
  const navigate = useCallback((href: string) => router.push(href), [router]);
  const editorContext = useMemo(
    () => ({ documentId, pages: mentionPages, navigate }),
    [documentId, mentionPages, navigate],
  );

  const searchInPages = useCallback(async (query: string): Promise<PaletteSearchHit[]> => {
    const results = unwrapAction(await searchPages(query));
    return results.map((r) => ({ id: r.id, title: r.title, icon: r.icon, href: `/dashboard/documents/${r.id}`, snippet: r.snippet }));
  }, []);

  // "Buscar nas páginas" da barra de seleção abre a paleta com o termo.
  useEffect(() => {
    const onSearch = (e: Event) => {
      const term = (e as CustomEvent<string>).detail ?? "";
      setPaletteQuery(term);
      setShowPalette(true);
    };
    window.addEventListener(STAGEBOOK_SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(STAGEBOOK_SEARCH_EVENT, onSearch);
  }, []);

  const paletteActions: PaletteAction[] = [
    { id: "export-pdf", title: "Exportar como PDF", icon: <FileDown size={16} />, keywords: ["pdf", "imprimir", "exportar", "baixar"], shortcut: "Ctrl+P", run: handleExportPdf },
    { id: "export-html", title: "Exportar como HTML", icon: <FileCode2 size={16} />, keywords: ["html", "site", "exportar", "baixar", "web"], run: handleExportHtml },
    { id: "export-md", title: "Exportar como Markdown", icon: <FileText size={16} />, keywords: ["markdown", "md", "exportar", "baixar", "texto"], run: handleExportMarkdown },
    { id: "copy-md", title: "Copiar página como Markdown", icon: <ClipboardCopy size={16} />, keywords: ["copiar", "markdown", "md", "clipboard"], run: handleCopyMarkdown },
    { id: "history", title: "Histórico de versões", icon: <History size={16} />, keywords: ["historico", "versoes", "restaurar", "voltar"], run: () => setShowHistory(true) },
    { id: "width", title: fullWidth ? "Largura padrão" : "Largura total", icon: <MoveHorizontal size={16} />, keywords: ["largura", "largo", "tela cheia", "width"], run: toggleFullWidth },
    { id: "props", title: showAdvancedOptions ? "Ocultar propriedades" : "Mostrar propriedades", icon: <SlidersHorizontal size={16} />, keywords: ["propriedades", "descricao", "tags", "marcos"], run: () => setShowAdvancedOptions((v) => !v) },
    { id: "icon", title: "Alterar ícone da página", icon: <Smile size={16} />, keywords: ["icone", "emoji", "page icon"], run: () => setShowEmojiPicker(true) },
    { id: "cover", title: cover ? "Trocar capa" : "Adicionar capa", icon: <Palette size={16} />, keywords: ["capa", "cover", "imagem", "fundo"], run: () => setShowCoverPicker(true) },
    { id: "duplicate", title: "Duplicar página", icon: <Copy size={16} />, keywords: ["duplicar", "copia", "clonar"], run: handleDuplicate },
    {
      id: "move",
      title: "Mover para…",
      icon: <FolderInput size={16} />,
      keywords: ["mover", "pasta", "subpagina"],
      run: () => {
        setMoveTarget(currentParentId ? `page:${currentParentId}` : currentFolderId ? `folder:${currentFolderId}` : "root");
        setShowMoveDialog(true);
      },
    },
    { id: "trash", title: "Mover para a lixeira", icon: <Trash2 size={16} />, keywords: ["excluir", "apagar", "deletar", "lixeira"], run: handleDelete },
  ];

  const columnClass = fullWidth ? "max-w-none" : "max-w-[50rem]";
  const pageFontFamily = docFontFamily(pageFont);

  return (
    <div ref={printRootRef} className="doc-print-root min-h-[calc(100vh-3.5rem)]">
      <LexicalComposer initialConfig={initialConfig}>
       <StagebookEditorProvider value={editorContext}>
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
            onClick={() => setShowPalette(true)}
            title="Paleta de comandos (Ctrl/⌘ + K)"
            aria-label="Abrir paleta de comandos"
          >
            <Command size={16} />
            <span className="hidden md:inline">Comandos</span>
          </button>

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

              <li className="menu-title px-2 pb-1 pt-1 text-[11px] uppercase tracking-wider">Exportar</li>
              <li>
                <button type="button" onClick={handleExportPdf}>
                  <FileDown size={14} />
                  PDF
                  <span className="ml-auto text-[11px] text-base-content/40">imprimir</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={handleExportHtml}>
                  <FileCode2 size={14} />
                  HTML
                  <span className="ml-auto text-[11px] text-base-content/40">.html</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={handleExportMarkdown}>
                  <FileText size={14} />
                  Markdown
                  <span className="ml-auto text-[11px] text-base-content/40">.md</span>
                </button>
              </li>

              <div className="my-1 border-t border-base-300" />
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

            <DocProperties
              properties={properties}
              onSet={setProperty}
              description={description}
              onDescriptionCommit={(value) => {
                setDescription(value);
                commitDescription(value);
              }}
              hasLabels={initialTags.length > 0 || Boolean(initialMilestone)}
              open={showAdvancedOptions}
              onOpenChange={setShowAdvancedOptions}
              labels={
                <>
                  <ResourceLabels
                    kind="document"
                    resourceId={documentId}
                    initialTags={initialTags}
                    initialMilestone={initialMilestone}
                  />
                  <PinToggle kind="stagebook" resourceId={documentId} className="btn btn-ghost btn-xs gap-1 text-base-content/50" />
                </>
              }
            />
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
          {mounted && <BacklinksPanel documentId={documentId} title={title} />}
        </div>

        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        <MarkdownShortcutPlugin transformers={MARKDOWN_SHORTCUTS} />
        <TablePlugin hasHorizontalScroll hasCellMerge />
        <SlashMenuPlugin />
        <BlockSelectionPlugin anchorElem={editorAnchor} />
        <ContextualToolsPlugin />
        <LayoutPlugin />
        <TimelinePlugin />
        <DividerPlugin />
        <EmbedPlugin documentId={documentId} />
        <TableToolsPlugin />
        <CodeToolsPlugin />
        <RichBlocksPlugin />
        <EmojiPlugin />
        <EditorRefPlugin editorRef={editorRef} />
        <TabsPlugin />
        <MentionPlugin />
        <SyncedBlocksPlugin onError={(message) => addToast(message, "error")} />
        <CommandPalette
          open={showPalette}
          onOpenChange={(open) => {
            setShowPalette(open);
            if (!open) setPaletteQuery("");
          }}
          initialQuery={paletteQuery}
          onSearch={searchInPages}
          actions={paletteActions}
          pages={palettePages}
          onNavigate={(href) => router.push(href)}
        />

        <AutosavePlugin documentId={documentId} onStatusChange={handleSaveState} />

        <HistoryPanel
          documentId={documentId}
          open={showHistory}
          onClose={closeHistory}
          onRestored={handleRestored}
        />
       </StagebookEditorProvider>
      </LexicalComposer>
    </div>
  );
}
