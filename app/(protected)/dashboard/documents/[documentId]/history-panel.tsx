"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot } from "lexical";
import { History, Loader2, RotateCcw, Save, X } from "lucide-react";
import { DocIcon } from "@/components/editor/doc-icon";
import { rememberSavedContent } from "@/components/editor/doc-content-cache";
import { useToast } from "@/app/context/ToastContext";
import { unwrapAction } from "@/utils/stagebook/action-result";
import { MAX_DOCUMENT_VERSIONS } from "@/utils/stagebook/document-history";
import { updateDocumentContent } from "../actions";
import {
  listDocumentVersions,
  restoreDocumentVersion,
  saveDocumentVersion,
  type DocumentVersionSummary,
} from "../history-actions";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function relative(iso: string) {
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  if (abs < 45) return "agora mesmo";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

/**
 * Painel lateral com as últimas versões da página. Fica dentro do
 * LexicalComposer para poder trocar o conteúdo do editor ao restaurar.
 */
export function HistoryPanel({
  documentId,
  open,
  onClose,
  onRestored,
}: {
  documentId: string;
  open: boolean;
  onClose: () => void;
  onRestored: (version: { title: string; icon: string | null }) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { addToast } = useToast();
  const [versions, setVersions] = useState<DocumentVersionSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "restore" | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = unwrapAction(await listDocumentVersions(documentId));
      setVersions(list);
      setSelectedId((current) =>
        current && list.some((v) => v.id === current) ? current : (list[0]?.id ?? null),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o histórico.");
      setVersions([]);
    }
  }, [documentId]);

  useEffect(() => {
    if (open) startTransition(() => void load());
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function saveNow() {
    setBusy("save");
    try {
      // Grava o que está na tela antes (o autosave pode estar aguardando).
      const json = editor.getEditorState().toJSON() as unknown as Record<string, unknown>;
      const saved = unwrapAction(await updateDocumentContent(documentId, json));
      rememberSavedContent(documentId, json, saved.updatedAt);
      const { created } = unwrapAction(await saveDocumentVersion(documentId));
      addToast(created ? "Versão salva no histórico." : "Esta versão já está no histórico.", "success");
      await load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Não foi possível salvar a versão.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function restore(version: DocumentVersionSummary) {
    if (
      !window.confirm(
        `Restaurar a versão de ${dateFormat.format(new Date(version.createdAt))}? ` +
          "O conteúdo atual vai para o histórico, então dá para voltar depois.",
      )
    ) {
      return;
    }
    setBusy("restore");
    try {
      // Garante que o que está na tela (inclusive o que o autosave ainda não
      // gravou) entre no histórico antes de ser substituído.
      const current = editor.getEditorState().toJSON() as unknown as Record<string, unknown>;
      unwrapAction(await updateDocumentContent(documentId, current));
      const restored = unwrapAction(await restoreDocumentVersion(documentId, version.id));
      if (restored.content) {
        editor.setEditorState(editor.parseEditorState(JSON.stringify(restored.content)));
      } else {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        });
      }
      onRestored({ title: restored.title, icon: restored.icon });
      addToast("Versão restaurada.", "success");
      await load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Não foi possível restaurar a versão.", "error");
    } finally {
      setBusy(null);
    }
  }

  if (!open) return null;

  const selected = versions?.find((v) => v.id === selectedId) ?? null;

  return (
    <>
      <button
        type="button"
        aria-label="Fechar histórico"
        className="no-print fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        className="no-print fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-base-300 bg-base-100 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-base-300 px-5 py-4">
          <div>
            <h2 id="history-title" className="flex items-center gap-2 text-base font-semibold">
              <History size={17} /> Histórico da página
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-base-content/55">
              Guardamos as {MAX_DOCUMENT_VERSIONS} versões mais recentes — uma por sessão de edição. As
              mais antigas são apagadas automaticamente.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Fechar">
            <X size={17} />
          </button>
        </header>

        <div className="border-b border-base-300 px-5 py-3">
          <button
            type="button"
            className="btn btn-sm w-full gap-1.5"
            onClick={saveNow}
            disabled={busy !== null}
          >
            {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar versão agora
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {versions === null ? (
            <div className="space-y-2 p-5" role="status" aria-label="Carregando histórico">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-base-content/10" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <History size={26} className="mx-auto mb-3 text-base-content/25" />
              <p className="text-sm font-medium text-base-content/70">Nenhuma versão ainda</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-base-content/50">
                {error ??
                  "As versões aparecem aqui conforme você edita. Use “Salvar versão agora” para marcar um ponto específico."}
              </p>
            </div>
          ) : (
            <>
              <ol className="max-h-[45%] shrink-0 overflow-y-auto p-2">
                {versions.map((version, index) => {
                  const active = version.id === selectedId;
                  return (
                    <li key={version.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(version.id)}
                        aria-current={active || undefined}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          active ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-base-200"
                        }`}
                      >
                        <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-base-content/25" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-medium">
                              {dateFormat.format(new Date(version.createdAt))}
                            </span>
                            {index === 0 && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                                Mais recente
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-base-content/55">
                            {relative(version.createdAt)}
                            {version.authorName ? ` · ${version.authorName}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {selected && (
                <div className="flex min-h-0 flex-1 flex-col border-t border-base-300">
                  <div className="flex items-center gap-2 px-5 pb-2 pt-4">
                    <DocIcon value={selected.icon} size={20} />
                    <span className="truncate text-sm font-semibold">{selected.title || "Sem título"}</span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
                    {selected.text ? (
                      <p className="whitespace-pre-wrap text-[13px] leading-6 text-base-content/75">
                        {selected.text}
                      </p>
                    ) : (
                      <p className="text-xs italic text-base-content/45">Esta versão está vazia.</p>
                    )}
                  </div>
                  <div className="border-t border-base-300 px-5 py-3">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm w-full gap-1.5"
                      onClick={() => restore(selected)}
                      disabled={busy !== null}
                    >
                      {busy === "restore" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                      Restaurar esta versão
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
