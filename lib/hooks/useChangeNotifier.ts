"use client";

import { useEffect, useRef } from "react";

/**
 * Chama `onChange(value)` sempre que `value` muda, ignorando o valor inicial.
 * As ferramentas do QuickBrick usam para avisar o caderno (autosave) sem
 * mudar o próprio estado interno.
 */
export function useChangeNotifier<T>(value: T, onChange?: (value: T) => void) {
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  const initial = useRef(value);
  useEffect(() => {
    if (Object.is(initial.current, value)) return;
    callback.current?.(value);
  }, [value]);
}
