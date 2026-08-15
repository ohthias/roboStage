"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { updateDocumentContent } from "@/app/(protected)/dashboard/documents/actions";

const DEBOUNCE_MS = 800;

export function AutosavePlugin({
  documentId,
  onStatusChange,
}: {
  documentId: string;
  onStatusChange: (status: "idle" | "saving" | "saved") => void;
}) {
  const [editor] = useLexicalComposerContext();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstUpdate = useRef(true);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // A primeira atualização é o carregamento do conteúdo inicial, não uma edição.
      if (isFirstUpdate.current) {
        isFirstUpdate.current = false;
        return;
      }
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onStatusChange("saving");

      timeoutRef.current = setTimeout(() => {
        const json = editorState.toJSON();
        updateDocumentContent(documentId, json)
          .then(() => onStatusChange("saved"))
          .catch(() => onStatusChange("idle"));
      }, DEBOUNCE_MS);
    });
  }, [editor, documentId, onStatusChange]);

  return null;
}