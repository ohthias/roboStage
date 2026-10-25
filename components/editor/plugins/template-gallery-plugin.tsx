"use client";

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { DocIcon } from "../doc-icon";
import { bgVar, textVar } from "../editor-colors";
import { $applyTemplateToDocument, TEMPLATES } from "../templates";

/** Galeria "Comece com um modelo": só aparece enquanto a página está vazia. */
export function TemplateGalleryPlugin() {
  const [editor] = useLexicalComposerContext();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const check = () =>
      editor.getEditorState().read(() => {
        const root = $getRoot();
        setEmpty(root.getTextContentSize() === 0 && root.getChildrenSize() <= 1 && root.getFirstChild()?.getType() === "paragraph");
      });
    check();
    return editor.registerUpdateListener(check);
  }, [editor]);

  if (!empty) return null;

  return (
    <div
      className="pointer-events-none absolute left-1 right-1 top-14 z-[1]"
      // Não rouba o foco do editor ao clicar nos cartões.
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-base-content/40">
        Comece com um modelo
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => editor.update(() => $applyTemplateToDocument(tpl))}
            className="group pointer-events-auto flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
              style={{ background: bgVar(tpl.accent), color: textVar(tpl.accent) }}
            >
              <DocIcon value={tpl.emoji} size={24} fallback={null} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{tpl.title}</span>
              <span className="block truncate text-xs text-base-content/50">{tpl.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
