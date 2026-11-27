"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { MarkdownShortcutPlugin, DEFAULT_TRANSFORMERS } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $parseSerializedNode,
  createEditor,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";
import { Check, CloudOff, Copy, FileText, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import {
  getSyncedBlock,
  getSyncedBlockUsage,
  updateSyncedBlock,
} from "@/features/stagebook/documents/actions/blocks";
import { unwrapAction } from "@/lib/action-result";
import { EDITOR_NODES } from "../editor-nodes";
import { RichBlocksPlugin } from "../plugins/rich-blocks-plugin";
import { DocIcon } from "../doc-icon";
import { useStagebookEditor } from "../stagebook-context";

const LOAD_TAG = "synced-load";
const SAVE_DELAY = 700;
const REFRESH_MS = 15_000;
/** Avisa as outras cópias abertas (mesma aba) que o bloco mudou. */
const SYNC_EVENT = "stagebook:synced-saved";

type Usage = { id: string; title: string; icon: string | null }[];

export function SyncedBlockView({ nodeKey, syncId }: { nodeKey: NodeKey; syncId: string }) {
  const [parent] = useLexicalComposerContext();
  const editable = useLexicalEditable();
  const { navigate, documentId } = useStagebookEditor();
  const nested = useMemo(
    () =>
      createEditor({
        namespace: `synced-${syncId}`,
        nodes: EDITOR_NODES,
        parentEditor: parent,
        onError: (e) => console.error(e),
      }),
    [syncId, parent],
  );
  const [title, setTitle] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ updatedAt: string; by: string | null } | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [showUsage, setShowUsage] = useState(false);
  const knownAt = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /** Põe o conteúdo do servidor no editor aninhado (sem disparar salvamento). */
  const apply = useCallback(
    (content: Record<string, unknown> | null) => {
      const children = (content as { root?: { children?: unknown[] } } | null)?.root?.children;
      if (content && Array.isArray(children) && children.length > 0) {
        nested.setEditorState(nested.parseEditorState(JSON.stringify(content)), { tag: LOAD_TAG });
      } else {
        nested.update(
          () => {
            const root = $getRoot();
            if (root.getChildrenSize() === 0) root.append($createParagraphNode());
          },
          { tag: LOAD_TAG },
        );
      }
    },
    [nested],
  );

  const load = useCallback(
    async (force = false) => {
      try {
        const data = unwrapAction(await getSyncedBlock(syncId));
        setTitle(data.title);
        setMeta({ updatedAt: data.updatedAt, by: data.updatedByName });
        if (force || data.updatedAt !== knownAt.current) {
          knownAt.current = data.updatedAt;
          apply(data.content);
        }
        setState("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível carregar o bloco.");
        setState("error");
      }
    },
    [syncId, apply],
  );

  useEffect(() => {
    // Carrega na próxima volta do event loop (depois de montar o editor aninhado).
    const t = setTimeout(() => void load(true), 0);
    return () => clearTimeout(t);
  }, [load]);

  // Salva as edições (com atraso curto) — todas as páginas passam a ver.
  useEffect(
    () =>
      nested.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, tags }) => {
        if (tags.has(LOAD_TAG) || (dirtyElements.size === 0 && dirtyLeaves.size === 0)) return;
        if (timer.current) clearTimeout(timer.current);
        setSave("saving");
        timer.current = setTimeout(async () => {
          timer.current = null;
          try {
            const r = unwrapAction(await updateSyncedBlock(syncId, { content: editorState.toJSON() }));
            knownAt.current = r.updatedAt;
            setMeta((m) => ({ updatedAt: r.updatedAt, by: m?.by ?? null }));
            setSave("saved");
            window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { id: syncId, from: nested.getKey() } }));
          } catch {
            setSave("error");
          }
        }, SAVE_DELAY);
      }),
    [nested, syncId],
  );

  // Puxa mudanças feitas em outras páginas (ao voltar para a aba e a cada 15 s),
  // mas nunca enquanto a pessoa está digitando aqui.
  useEffect(() => {
    const refresh = () => {
      const typing = bodyRef.current?.contains(document.activeElement);
      if (!typing && !timer.current && document.visibilityState === "visible") void load();
    };
    const onSaved = (e: Event) => {
      const { id: savedId, from } = (e as CustomEvent<{ id: string; from: string }>).detail;
      if (savedId === syncId && from !== nested.getKey()) refresh();
    };
    const id = setInterval(refresh, REFRESH_MS);
    window.addEventListener("focus", refresh);
    window.addEventListener(SYNC_EVENT, onSaved);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(SYNC_EVENT, onSaved);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load, syncId, nested]);

  const commitTitle = async (value: string) => {
    const clean = value.trim() || "Bloco sincronizado";
    setTitle(clean);
    try {
      unwrapAction(await updateSyncedBlock(syncId, { title: clean }));
    } catch {
      setSave("error");
    }
  };

  const openUsage = async () => {
    setShowUsage((v) => !v);
    if (usage) return;
    try {
      setUsage(unwrapAction(await getSyncedBlockUsage(syncId)));
    } catch {
      setUsage([]);
    }
  };

  /** Desvincula: o conteúdo atual vira blocos normais só nesta página. */
  const unlink = () => {
    const children = nested.getEditorState().toJSON().root.children as SerializedLexicalNode[];
    parent.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;
      children.forEach((json) => node.insertBefore($parseSerializedNode(json)));
      node.remove();
    });
  };

  const removeHere = () =>
    parent.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });

  const when = meta ? new Date(meta.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";

  return (
    <div className="synced-block" contentEditable={false} data-state={state}>
      <div className="synced-block-bar no-print" onMouseDown={(e) => e.stopPropagation()}>
        <RefreshCcw size={13} className="text-error/80" />
        {editable ? (
          <input
            className="synced-block-title"
            value={title}
            aria-label="Nome do bloco sincronizado"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => commitTitle(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        ) : (
          <span className="synced-block-title">{title}</span>
        )}
        <span className="text-[11px] text-base-content/45" role="status" aria-live="polite">
          {save === "saving" && (
            <>
              <Loader2 size={11} className="mr-0.5 inline animate-spin" />
              Salvando em todas as páginas…
            </>
          )}
          {save === "saved" && (
            <>
              <Check size={11} className="mr-0.5 inline" />
              Sincronizado
            </>
          )}
          {save === "error" && (
            <>
              <CloudOff size={11} className="mr-0.5 inline" />
              Não salvo
            </>
          )}
          {save === "idle" && meta && `Editado ${when}${meta.by ? ` por ${meta.by}` : ""}`}
        </span>
        <span className="ml-auto flex items-center gap-0.5">
          <div className="relative">
            <button type="button" className="smart-icon-btn gap-1 px-1.5 text-[11px]" onClick={openUsage} aria-expanded={showUsage}>
              <FileText size={12} /> Onde é usado
            </button>
            {showUsage && (
              <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl">
                {!usage ? (
                  <p className="px-2 py-1.5 text-xs text-base-content/50">Carregando…</p>
                ) : usage.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-base-content/50">Ainda não está salvo em nenhuma página.</p>
                ) : (
                  usage.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-base-200"
                      onClick={() => p.id !== documentId && navigate(`/dashboard/documents/${p.id}`)}
                    >
                      <DocIcon value={p.icon} size={15} />
                      <span className="truncate">{p.title}</span>
                      {p.id === documentId && <span className="ml-auto text-[10px] text-base-content/40">esta</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {editable && (
            <>
              <button type="button" className="smart-icon-btn" title="Desvincular: vira uma cópia só desta página" aria-label="Desvincular" onClick={unlink} disabled={state !== "ready"}>
                <Copy size={13} />
              </button>
              <button type="button" className="smart-icon-btn hover:text-error" title="Remover desta página (o bloco continua nas outras)" aria-label="Remover desta página" onClick={removeHere}>
                <Trash2 size={13} />
              </button>
            </>
          )}
        </span>
      </div>
      {state === "error" ? (
        <p className="px-3 py-2 text-sm text-error">{error}</p>
      ) : (
        <div ref={bodyRef} className="synced-block-body" onMouseDown={(e) => e.stopPropagation()}>
          <LexicalNestedComposer initialEditor={nested}>
            <RichTextPlugin
              contentEditable={<ContentEditable className="synced-block-editable" aria-label={`Bloco sincronizado: ${title}`} />}
              placeholder={<div className="synced-block-placeholder">Escreva o conteúdo compartilhado…</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <LinkPlugin />
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin transformers={DEFAULT_TRANSFORMERS} />
            <RichBlocksPlugin />
          </LexicalNestedComposer>
        </div>
      )}
    </div>
  );
}
