"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getEmbedCard,
  getEmbedEvent,
  getEmbedLabTest,
  getEmbedThinkLab,
} from "@/app/(protected)/dashboard/documents/embed-actions";
import type { EmbedDataMap, EmbedKind } from "./embed-types";

const fetchers: { [K in EmbedKind]: (id: string) => Promise<EmbedDataMap[K]> } = {
  "kanban-card": getEmbedCard,
  "calendar-event": getEmbedEvent,
  "labtest-chart": getEmbedLabTest,
  "thinklab-board": getEmbedThinkLab,
};

/**
 * Cache curto por (tipo, id): um documento com vários blocos do mesmo item — ou
 * o remontar de um bloco ao arrastá-lo — não dispara uma consulta por render.
 */
const TTL_MS = 20_000;
const cache = new Map<string, { at: number; promise: Promise<unknown> }>();

function load<K extends EmbedKind>(kind: K, id: string, force: boolean): Promise<EmbedDataMap[K]> {
  const key = `${kind}:${id}`;
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < TTL_MS) {
    return hit.promise as Promise<EmbedDataMap[K]>;
  }
  const promise = fetchers[kind](id);
  cache.set(key, { at: Date.now(), promise });
  // Não guarda falhas: a próxima tentativa consulta de novo.
  promise.catch(() => {
    if (cache.get(key)?.promise === promise) cache.delete(key);
  });
  return promise;
}

export function useEmbedData<K extends EmbedKind>(kind: K, id: string) {
  const [state, setState] = useState<{
    data: EmbedDataMap[K] | null;
    error: string | null;
    loading: boolean;
  }>({ data: null, error: null, loading: true });

  const run = useCallback(
    (force: boolean) => {
      let active = true;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      load(kind, id, force)
        .then((data) => active && setState({ data, error: null, loading: false }))
        .catch((err: unknown) =>
          active &&
          setState({
            data: null,
            error: err instanceof Error ? err.message : "Item indisponível.",
            loading: false,
          }),
        );
      return () => {
        active = false;
      };
    },
    [kind, id],
  );

  useEffect(() => run(false), [run]);

  const refresh = useCallback(() => {
    run(true);
  }, [run]);

  return { ...state, refresh };
}
