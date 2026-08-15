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
  SmilePlus,
  Trash2,
} from "lucide-react";

import { ToolbarPlugin } from "@/components/editor/plugins/toolbar-plugin";
import { AutosavePlugin } from "@/components/editor/plugins/auto-save-plugin";
import { renameDocument, updateDocumentIcon } from "../actions";

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

const editorTheme = {
  heading: {
    h1: "mt-8 mb-3 text-3xl font-bold tracking-tight",
    h2: "mt-7 mb-2 text-2xl font-semibold tracking-tight",
    h3: "mt-5 mb-2 text-xl font-semibold",
  },

  quote:
    "my-4 border-l-2 border-base-content/20 pl-4 italic text-base-content/60",

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
};

export function NotebookEditor({
  documentId,
  initialTitle,
  initialIcon,
  initialContent,
}: {
  documentId: string;
  initialTitle: string;
  initialIcon: string | null;
  initialContent: Record<string, unknown> | null;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  const [, startTransition] = useTransition();

  const initialConfig = useMemo(
    () => ({
      namespace: `notebook-${documentId}`,
      theme: editorTheme,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      editorState: initialContent
        ? JSON.stringify(initialContent)
        : undefined,

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

  function pickIcon(next: string) {
    setIcon(next);

    startTransition(async () => {
      await updateDocumentIcon(documentId, next);
      router.refresh();
    });
  }

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="w-full px-6 pb-32">
          <nav className="mb-8 flex items-center gap-1 text-xs text-base-content/40">
            <Link
              href="/dashboard/documents"
              className="transition-colors hover:text-base-content"
            >
              Caderno
            </Link>
            <ChevronRight size={12} />
            <span className="max-w-48 truncate text-base-content/60">
              {title || "Sem título"}
            </span>
          </nav>

          {/* Page header */}
          <header className="group mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Icon */}
                <div className="dropdown dropdown-start mb-3">
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

                    <button
                      type="button"
                      className="col-span-6 mt-1 flex h-8 items-center justify-center gap-2 rounded-md border-t border-base-300 pt-1 text-xs text-base-content/50 hover:text-base-content"
                    >
                      <SmilePlus size={13} />
                      Escolher ícone
                    </button>
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
                <div className="mt-3 flex items-center gap-3 text-xs text-base-content/40">
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} />
                    Página
                  </span>

                  <span>•</span>

                  <div className="flex items-center gap-1">
                    {saveState === "saving" && (
                      <>
                        <Loader2
                          size={12}
                          className="animate-spin"
                        />
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
                  className="btn btn-ghost btn-sm btn-square text-base-content/40"
                >
                  <MoreHorizontal size={18} />
                </button>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-50 mt-1 w-48 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
                >
                  <li>
                    <button type="button">
                      Duplicar página
                    </button>
                  </li>

                  <li>
                    <button type="button">
                      Mover para...
                    </button>
                  </li>

                  <div className="my-1 border-t border-base-300" />

                  <li>
                    <button
                      type="button"
                      className="text-error"
                    >
                      <Trash2 size={14} />
                      Excluir página
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          {/* Editor */}
          <div className="relative">
            <div className="sticky top-16 z-20 mb-4">
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

        <AutosavePlugin
          documentId={documentId}
          onStatusChange={setSaveState}
        />
      </LexicalComposer>
    </div>
  );
}