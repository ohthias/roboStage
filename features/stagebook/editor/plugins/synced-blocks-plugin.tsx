"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getNodeByKey,
  $isElementNode,
  $parseSerializedNode,
  COMMAND_PRIORITY_LOW,
  createCommand,
  type LexicalNode,
  type SerializedLexicalNode,
} from "lexical";
import { Copy, Plus, RefreshCcw, Search, X } from "lucide-react";
import {
  createSyncedBlock,
  getSyncedBlock,
  listSyncedBlocks,
  type SyncedBlockListItem,
} from "@/features/stagebook/documents/actions/blocks";
import { unwrapAction } from "@/lib/action-result";
import { $createSyncedBlockNode, $isSyncedBlockNode } from "../nodes/synced-block-node";
import { foldText } from "@/features/stagebook/lib/page-links";

/** Abre a biblioteca de blocos sincronizados; insere perto de `anchorKey`. */
export const OPEN_SYNCED_PICKER_COMMAND = createCommand<{ anchorKey: string | null }>("OPEN_SYNCED_PICKER_COMMAND");
/** Transforma o bloco `key` (com o conteúdo dele) num bloco sincronizado novo. */
export const CONVERT_TO_SYNCED_COMMAND = createCommand<{ key: string }>("CONVERT_TO_SYNCED_COMMAND");

type SerializedWithChildren = SerializedLexicalNode & { children?: SerializedLexicalNode[] };

function serialize(node: LexicalNode): SerializedLexicalNode {
  const json = node.exportJSON() as SerializedWithChildren;
  if ($isElementNode(node)) json.children = node.getChildren().map(serialize);
  return json;
}

/** Estado de editor com os blocos dados (formato aceito por parseEditorState). */
export function editorStateFrom(children: SerializedLexicalNode[]) {
  return {
    root: { type: "root", version: 1, direction: null, format: "", indent: 0, children },
  };
}

function placeAt(anchorKey: string | null, node: LexicalNode) {
  const anchor = anchorKey ? $getNodeByKey(anchorKey) : null;
  const empty = anchor && anchor.getType() === "paragraph" && $isElementNode(anchor) && anchor.getTextContentSize() === 0;
  if (anchor && empty) anchor.replace(node);
  else if (anchor) anchor.insertAfter(node);
  $selectAfter(node);
}

/** Cursor no bloco seguinte (o nó trocado podia ter a seleção). */
function $selectAfter(node: LexicalNode) {
  let next = node.getNextSibling();
  if (!$isElementNode(next)) {
    next = $createParagraphNode();
    node.insertAfter(next);
  }
  (next as import("lexical").ElementNode).selectStart();
}

export function SyncedBlocksPlugin({ onError }: { onError?: (message: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const [picker, setPicker] = useState<{ anchorKey: string | null } | null>(null);
  const [items, setItems] = useState<SyncedBlockListItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const fail = useCallback((e: unknown) => onError?.(e instanceof Error ? e.message : "Algo deu errado."), [onError]);

  useEffect(
    () =>
      editor.registerCommand(
        OPEN_SYNCED_PICKER_COMMAND,
        (payload) => {
          setPicker(payload);
          setQuery("");
          setItems(null);
          listSyncedBlocks()
            .then((r) => setItems(unwrapAction(r)))
            .catch((e) => {
              setItems([]);
              fail(e);
            });
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor, fail],
  );

  useEffect(
    () =>
      editor.registerCommand(
        CONVERT_TO_SYNCED_COMMAND,
        ({ key }) => {
          let json: SerializedLexicalNode | null = null;
          let title = "Bloco sincronizado";
          editor.read(() => {
            const node = $getNodeByKey(key);
            if (!node || $isSyncedBlockNode(node)) return;
            json = serialize(node);
            const text = node.getTextContent().trim();
            if (text) title = text.slice(0, 60);
          });
          if (!json) return true;
          createSyncedBlock(title, editorStateFrom([json]))
            .then((r) => {
              const { id } = unwrapAction(r);
              editor.update(() => {
                const node = $getNodeByKey(key);
                if (!node) return;
                const synced = $createSyncedBlockNode(id);
                node.replace(synced);
                $selectAfter(synced);
              });
            })
            .catch(fail);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor, fail],
  );

  const close = () => {
    setPicker(null);
    editor.focus();
  };

  const insertSynced = (id: string) => {
    const anchorKey = picker?.anchorKey ?? null;
    editor.update(() => placeAt(anchorKey, $createSyncedBlockNode(id)));
    close();
  };

  /** Cópia independente (o conteúdo de agora, sem sincronizar depois). */
  const insertCopy = async (id: string) => {
    const anchorKey = picker?.anchorKey ?? null;
    setBusy(true);
    try {
      const data = unwrapAction(await getSyncedBlock(id));
      const children = ((data.content as { root?: { children?: SerializedLexicalNode[] } } | null)?.root?.children ?? []);
      editor.update(() => {
        const nodes = children.map((c) => $parseSerializedNode(c));
        if (nodes.length === 0) return;
        placeAt(anchorKey, nodes[0]);
        let prev = nodes[0];
        nodes.slice(1).forEach((n) => {
          prev.insertAfter(n);
          prev = n;
        });
        $selectAfter(prev);
      });
      close();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const createNew = async () => {
    const anchorKey = picker?.anchorKey ?? null;
    setBusy(true);
    try {
      const empty = editorStateFrom([{ type: "paragraph", version: 1, children: [], direction: null, format: "", indent: 0, textFormat: 0, textStyle: "" } as SerializedLexicalNode]);
      const { id } = unwrapAction(await createSyncedBlock(query.trim() || "Bloco sincronizado", empty));
      editor.update(() => placeAt(anchorKey, $createSyncedBlockNode(id)));
      close();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  if (!picker) return null;
  const q = foldText(query.trim());
  const shown = (items ?? []).filter((i) => !q || foldText(`${i.title} ${i.preview}`).includes(q));

  return createPortal(
    <div className="no-print modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true" aria-label="Blocos sincronizados">
      <div className="modal-box max-w-lg p-0">
        <div className="flex items-center gap-2 border-b border-base-300 px-4 py-3">
          <RefreshCcw size={16} className="text-error/80" />
          <h2 className="font-semibold">Blocos sincronizados</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-square ml-auto" aria-label="Fechar" onClick={close}>
            <X size={16} />
          </button>
        </div>
        <p className="px-4 pt-3 text-sm text-base-content/60">
          Conteúdo reutilizável: edite em qualquer página e todas as cópias sincronizadas mudam juntas.
        </p>
        <label className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-base-200 px-3 py-2">
          <Search size={14} className="text-base-content/50" />
          <input
            autoFocus
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Buscar ou dar nome a um bloco novo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && close()}
          />
        </label>
        <div className="max-h-80 overflow-y-auto p-2">
          <button type="button" disabled={busy} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-base-200" onClick={createNew}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-base-300">
              <Plus size={15} />
            </span>
            <span className="text-sm font-medium">Criar bloco novo{query.trim() ? ` “${query.trim()}”` : ""}</span>
          </button>
          {!items ? (
            <p className="px-2 py-3 text-sm text-base-content/50">Carregando…</p>
          ) : shown.length === 0 ? (
            <p className="px-2 py-3 text-sm text-base-content/50">
              {items.length === 0 ? "Nenhum bloco ainda. Use “Transformar em bloco sincronizado” no menu de qualquer bloco." : "Nada encontrado."}
            </p>
          ) : (
            shown.map((item) => (
              <div key={item.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-base-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-error/10 text-error/80">
                  <RefreshCcw size={14} />
                </span>
                <button type="button" disabled={busy} className="min-w-0 flex-1 text-left" onClick={() => insertSynced(item.id)}>
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block truncate text-xs text-base-content/50">
                    {item.usage} {item.usage === 1 ? "página" : "páginas"} · {item.preview || "vazio"}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="btn btn-ghost btn-xs gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="Inserir uma cópia independente (não sincroniza)"
                  onClick={() => insertCopy(item.id)}
                >
                  <Copy size={12} /> Cópia
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={close} />
    </div>,
    document.body,
  );
}
