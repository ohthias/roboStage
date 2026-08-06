"use client";

import { useRef } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";

const AUTOSAVE_DELAY = 800;

export function AutoSavePlugin({
  onSave,
}: {
  onSave: (editorState: EditorState) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        // Ignora o primeiro disparo (ocorre ao montar o editor com o
        // conteúdo inicial, não é uma edição do usuário).
        if (isFirstRender.current) {
          isFirstRender.current = false;
          return;
        }

        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onSave(editorState), AUTOSAVE_DELAY);
      }}
    />
  );
}
