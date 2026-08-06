"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TRANSFORMERS } from "@lexical/markdown";
import type { EditorState, SerializedEditorState } from "lexical";
import { Check, Loader2, Trash2 } from "lucide-react";
import { editorNodes } from "@/components/editor/nodes";
import { editorTheme } from "@/components/editor/theme";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar-plugin";
import { AutoSavePlugin } from "@/components/editor/plugins/auto-save-plugin";
import "@/components/editor/editor.css";
import { deleteDocumentAction, updateDocumentAction } from "../actions";

const TITLE_AUTOSAVE_DELAY = 800;

export function DocumentEditor({
  organizationId,
  documentId,
  initialTitle,
  initialContent,
  updatedAt,
}: {
  organizationId: string;
  documentId: string;
  initialTitle: string;
  initialContent: SerializedEditorState | null;
  updatedAt: Date;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialConfig = {
    namespace: `document-${documentId}`,
    theme: editorTheme,
    nodes: editorNodes,
    editorState: initialContent ? JSON.stringify(initialContent) : undefined,
    onError(error: Error) {
      console.error("Lexical error:", error);
    },
  };

  const persistTitle = useCallback(
    (value: string) => {
      setStatus("saving");
      setErrorMessage(null);
      if (titleTimer.current) clearTimeout(titleTimer.current);

      titleTimer.current = setTimeout(async () => {
        const result = await updateDocumentAction(organizationId, documentId, {
          title: value,
        });
        if (result.success) {
          setStatus("saved");
        } else {
          setStatus("error");
          setErrorMessage(result.message ?? "Erro ao salvar o título.");
        }
      }, TITLE_AUTOSAVE_DELAY);
    },
    [documentId, organizationId]
  );

  const persistContent = useCallback(
    (editorState: EditorState) => {
      setStatus("saving");
      setErrorMessage(null);

      updateDocumentAction(organizationId, documentId, {
        content: editorState.toJSON(),
      }).then((result) => {
        if (result.success) {
          setStatus("saved");
        } else {
          setStatus("error");
          setErrorMessage(result.message ?? "Erro ao salvar o conteúdo.");
        }
      });
    },
    [documentId, organizationId]
  );

  function handleTitleChange(event: FormEvent<HTMLTextAreaElement>) {
    const value = event.currentTarget.value;
    setTitle(value);
    persistTitle(value);
  }

  function handleDelete() {
    setIsDeleting(true);
    deleteDocumentAction(organizationId, documentId).then((result) => {
      if (result.success) {
        router.push(`/dashboard/organizations/${organizationId}/documents`);
        router.refresh();
      } else {
        setIsDeleting(false);
        setErrorMessage(result.message ?? "Não foi possível excluir.");
        dialogRef.current?.close();
      }
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-base-200 px-6 py-3">
          <SaveIndicator status={status} updatedAt={updatedAt} />
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="btn btn-ghost btn-sm gap-2 text-error"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-error mx-6 mt-4 py-2 text-sm">
            <span>{errorMessage}</span>
          </div>
        )}

        <ToolbarPlugin />

        <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">
          <textarea
            value={title}
            onChange={handleTitleChange}
            rows={1}
            placeholder="Sem título"
            className="mb-4 w-full resize-none overflow-hidden border-none bg-transparent text-3xl font-bold outline-none placeholder:text-base-content/30"
            onInput={(event) => {
              const el = event.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[420px] outline-none" />
              }
              placeholder={
                <div className="editor-placeholder">
                  Escreva algo… use <code>**negrito**</code>,{" "}
                  <code>#</code> para título, <code>-</code> para lista ou{" "}
                  <code>[]</code> para tarefa.
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <LinkPlugin />
            <ClickableLinkPlugin />
            <TabIndentationPlugin />
            <AutoFocusPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <AutoSavePlugin onSave={persistContent} />
          </div>
        </div>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">Excluir documento</h3>
          <p className="mt-2 text-sm text-base-content/70">
            Essa ação é permanente. O documento{" "}
            <span className="font-semibold">{title || "Sem título"}</span>{" "}
            será removido para toda a organização.
          </p>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-error gap-2"
            >
              {isDeleting && <Loader2 size={16} className="animate-spin" />}
              Excluir definitivamente
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </LexicalComposer>
  );
}

function SaveIndicator({
  status,
  updatedAt,
}: {
  status: "idle" | "saving" | "saved" | "error";
  updatedAt: Date;
}) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-2 text-xs text-base-content/50">
        <Loader2 size={12} className="animate-spin" /> Salvando…
      </span>
    );
  }

  if (status === "error") {
    return <span className="text-xs text-error">Erro ao salvar</span>;
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-2 text-xs text-success">
        <Check size={12} /> Salvo
      </span>
    );
  }

  return (
    <span className="text-xs text-base-content/40">
      Editado em{" "}
      {new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(updatedAt)}
    </span>
  );
}
