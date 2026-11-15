"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getNodeByKey, type NodeKey } from "lexical";
import { Plus, Trash2, X } from "lucide-react";
import { $isSmartBlockNode, type SmartBlockData } from "../nodes/smart-block-node";

/** Lê/grava os dados do bloco inteligente (salvos no nó → autosave da página). */
export function useSmartBlock<T extends SmartBlockData>(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const editable = useLexicalEditable();
  const update = useCallback(
    (fn: (prev: T) => T) =>
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isSmartBlockNode(node)) node.setData(fn(node.getData() as T));
      }),
    [editor, nodeKey],
  );
  const patch = useCallback((values: Partial<T>) => update((prev) => ({ ...prev, ...values })), [update]);
  const remove = useCallback(
    () =>
      editor.update(() => {
        $getNodeByKey(nodeKey)?.remove();
      }),
    [editor, nodeKey],
  );
  return { editor, editable, update, patch, remove };
}

export const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
export const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
export const newId = () => Math.random().toString(36).slice(2, 10);

/** Moldura padrão: cabeçalho com ícone, título e ações. */
export function SmartShell({
  icon,
  label,
  tone = "primary",
  actions,
  editable,
  onRemove,
  children,
}: {
  icon: ReactNode;
  label: ReactNode;
  tone?: "primary" | "info" | "warning" | "success" | "secondary" | "accent";
  actions?: ReactNode;
  editable: boolean;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="smart-shell" data-tone={tone} contentEditable={false} onMouseDown={(e) => e.stopPropagation()}>
      <div className="smart-shell-head">
        <span className="smart-shell-icon">{icon}</span>
        <span className="smart-shell-label">{label}</span>
        <span className="ml-auto flex items-center gap-1">
          {actions}
          {editable && onRemove && (
            <button
              type="button"
              className="smart-icon-btn no-print hover:text-error"
              title="Excluir bloco"
              aria-label="Excluir bloco"
              onClick={onRemove}
            >
              <Trash2 size={14} />
            </button>
          )}
        </span>
      </div>
      <div className="smart-shell-body">{children}</div>
    </div>
  );
}

/** Campo de texto que salva ao sair (Enter confirma, Esc desfaz). */
export function InlineText({
  value,
  onCommit,
  placeholder,
  multiline,
  editable,
  className = "",
  ariaLabel,
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  editable: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  if (prev !== value) {
    setPrev(value);
    setDraft(value);
  }
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);
  if (!editable) {
    return value ? (
      <p className={`whitespace-pre-wrap ${className}`}>{value}</p>
    ) : (
      <p className={`text-base-content/35 ${className}`}>—</p>
    );
  }
  return (
    <textarea
      ref={ref}
      rows={1}
      value={draft}
      aria-label={ariaLabel ?? placeholder}
      placeholder={placeholder}
      className={`smart-input ${className}`}
      onChange={(e) => setDraft(multiline ? e.target.value : e.target.value.replace(/\n/g, " "))}
      onBlur={() => draft !== value && onCommit(draft)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          (e.target as HTMLTextAreaElement).blur();
        }
        if (e.key === "Escape") {
          setDraft(value);
          requestAnimationFrame(() => ref.current?.blur());
        }
      }}
    />
  );
}

/** Rótulo + valor numa grade de duas colunas. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="smart-field">
      <div className="smart-field-label">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Lista de etiquetas editável (participantes, sensores…). */
export function ChipsInput({
  values,
  onChange,
  placeholder,
  editable,
  suggestions = [],
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  editable: boolean;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const clean = v.trim().slice(0, 60);
    if (clean && !values.includes(clean)) onChange([...values, clean]);
    setDraft("");
  };
  const rest = suggestions.filter((s) => !values.includes(s));
  return (
    <div className="flex flex-wrap items-center gap-1">
      {values.map((v) => (
        <span key={v} className="smart-chip">
          {v}
          {editable && (
            <button type="button" aria-label={`Remover ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
              <X size={11} />
            </button>
          )}
        </span>
      ))}
      {editable && (
        <input
          value={draft}
          placeholder={values.length ? "+" : placeholder}
          aria-label={placeholder}
          className="smart-chip-input"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft && add(draft)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
        />
      )}
      {editable &&
        rest.slice(0, 6).map((s) => (
          <button key={s} type="button" className="smart-chip-suggestion no-print" onClick={() => add(s)}>
            <Plus size={10} />
            {s}
          </button>
        ))}
    </div>
  );
}

/** Grupo de botões de escolha única (status, plataforma…). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  editable,
}: {
  value: T | "";
  options: { value: T; label: string; tone?: string }[];
  onChange: (value: T) => void;
  editable: boolean;
}) {
  if (!editable) {
    const current = options.find((o) => o.value === value);
    return current ? <span className={`smart-pill ${current.tone ?? ""}`}>{current.label}</span> : <span className="text-base-content/35">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={`smart-pill ${value === o.value ? `is-on ${o.tone ?? ""}` : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
