"use client";

import { useEffect, useState } from "react";
import type { FEData } from "@/utils/labtest/future-edition";

let cache: Promise<FEData> | null = null;

function load(): Promise<FEData> {
  if (!cache) {
    cache = fetch("/api/data/missions/future-edition")
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar a Future Edition.");
        return response.json() as Promise<FEData>;
      })
      .catch((error) => {
        cache = null; // permite tentar de novo
        throw error;
      });
  }
  return cache;
}

/** Carrega (uma vez) as missões e a tabela de penalidades da Future Edition. */
export function useFutureEditionData() {
  const [data, setData] = useState<FEData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    load()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Erro ao carregar dados."));
    return () => {
      active = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
