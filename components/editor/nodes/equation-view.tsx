"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getNodeByKey, type NodeKey } from "lexical";
import { Sigma } from "lucide-react";
import { $isEquationNode } from "./equation-node";

function renderTo(el: HTMLElement, equation: string, inline: boolean) {
  katex.render(equation, el, {
    displayMode: !inline,
    throwOnError: false,
    errorColor: "var(--color-error, #dc2626)",
    output: "htmlAndMathml",
    strict: "ignore",
  });
}

/** Mostra a equação renderizada; clique para editar o LaTeX com prévia ao vivo. */
export function EquationView({
  nodeKey,
  equation,
  inline,
}: {
  nodeKey: NodeKey;
  equation: string;
  inline: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const editable = useLexicalEditable();
  const [editing, setEditing] = useState(equation.trim() === "");
  const [draft, setDraft] = useState(equation);
  const previewRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Prévia: enquanto edita mostra o rascunho, senão o valor salvo.
  const shown = editing ? draft : equation;
  useLayoutEffect(() => {
    if (previewRef.current) renderTo(previewRef.current, shown || "\\square", inline);
  }, [shown, inline]);

  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const commit = (value: string) => {
    setEditing(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isEquationNode(node)) return;
      const clean = value.trim();
      if (!clean && inline) {
        // Equação inline vazia não deixa rastro.
        node.selectPrevious();
        node.remove();
        return;
      }
      if (clean !== node.getEquation()) node.setEquation(clean);
      if (inline) node.selectNext(0, 0);
    });
    if (inline) editor.focus();
  };

  const cancel = () => {
    if (!equation.trim()) {
      commit("");
      return;
    }
    setDraft(equation);
    setEditing(false);
    editor.focus();
  };

  const startEditing = () => {
    if (!editable) return;
    setDraft(equation);
    setEditing(true);
  };

  return (
    <span
      className={`editor-equation ${inline ? "is-inline" : "is-block"} ${editing ? "is-editing" : ""}`}
      data-empty={!equation.trim() || undefined}
    >
      <span
        ref={previewRef}
        role={editable ? "button" : undefined}
        tabIndex={editable && !editing ? 0 : undefined}
        title={editable ? "Clique para editar a equação" : undefined}
        className="editor-equation-render"
        onClick={startEditing}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            startEditing();
          }
        }}
      />
      {editing && (
        <span
          className="editor-equation-editor"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="editor-equation-editor-label">
            <Sigma size={12} /> LaTeX
          </span>
          <textarea
            ref={inputRef}
            value={draft}
            rows={inline ? 1 : 3}
            spellCheck={false}
            placeholder={inline ? "x^2 + y^2 = r^2" : "\\int_0^1 x^2\\,dx = \\frac{1}{3}"}
            aria-label="Equação em LaTeX"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              } else if (e.key === "Enter" && (inline ? !e.shiftKey : e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                commit(draft);
              }
            }}
          />
          <span className="editor-equation-editor-hint">
            {inline ? "Enter para salvar · Esc para cancelar" : "Ctrl+Enter para salvar · Esc para cancelar"}
          </span>
        </span>
      )}
    </span>
  );
}
