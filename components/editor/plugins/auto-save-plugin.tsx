"use client";

import { useCallback, useEffect, useRef } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { updateDocumentContent } from "@/app/(protected)/dashboard/documents/actions";

import { unwrapAction } from "@/utils/stagebook/action-result";
import { rememberSavedContent } from "../doc-content-cache";
export type SaveState = "idle" | "saving" | "saved" | "error";

export function AutosavePlugin({
  documentId,
  onStatusChange,
  delay = 800,
}: {
  documentId: string;
  onStatusChange?: (state: SaveState) => void;
  delay?: number;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<EditorState | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const state = pending.current;
    if (!state) return;
    pending.current = null;
    onStatusChange?.("saving");
    try {
      const json = state.toJSON() as unknown as Record<string, unknown>;
      const saved = unwrapAction(await updateDocumentContent(documentId, json));
      rememberSavedContent(documentId, json, saved.updatedAt);
      onStatusChange?.("saved");
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => onStatusChange?.("idle"), 1500);
    } catch (error) {
      console.error("Falha ao salvar documento", error);
      onStatusChange?.("error");
    }
  }, [documentId, onStatusChange]);

  // Salva o que estiver pendente ao sair da página / desmontar.
  useEffect(() => {
    const onHide = () => {
      if (timer.current) clearTimeout(timer.current);
      void flush();
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      if (timer.current) clearTimeout(timer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      void flush();
    };
  }, [flush]);

  return (
    <OnChangePlugin
      ignoreSelectionChange
      ignoreHistoryMergeTagChange
      onChange={(state) => {
        pending.current = state;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), delay);
      }}
    />
  );
}
