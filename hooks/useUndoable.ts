"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Estado com histórico de desfazer/refazer (extraído do Criador de Arenas).
 *
 * - `live(v)`: altera sem criar ponto no histórico (arrastes, digitação).
 * - `checkpoint()`: guarda o estado atual antes de uma série de `live`.
 * - `commit(v)`: guarda o estado atual e aplica `v` (uma ação = um passo).
 */
export function useUndoable<T>(initial: T | (() => T), limit = 100) {
  const [value, setValue] = useState<T>(initial);
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const [sizes, setSizes] = useState({ past: 0, future: 0 });
  const sync = useCallback(() => setSizes({ past: past.current.length, future: future.current.length }), []);

  const checkpoint = useCallback(() => {
    past.current.push(ref.current);
    if (past.current.length > limit) past.current.shift();
    future.current = [];
    sync();
  }, [limit, sync]);

  const live = useCallback((v: T) => {
    ref.current = v;
    setValue(v);
  }, []);

  const commit = useCallback(
    (v: T) => {
      checkpoint();
      live(v);
    },
    [checkpoint, live],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(ref.current);
    live(prev);
    sync();
  }, [live, sync]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(ref.current);
    live(next);
    sync();
  }, [live, sync]);

  return {
    value,
    /** sempre o valor mais recente (útil dentro de callbacks) */
    ref,
    live,
    commit,
    checkpoint,
    undo,
    redo,
    canUndo: sizes.past > 0,
    canRedo: sizes.future > 0,
  };
}

/** Atalhos globais Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z e Ctrl/Cmd+Y (ignora campos de texto). */
export function useUndoShortcuts(undo: () => void, redo: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);
}
