"use client";

import { useEffect, useState } from "react";
import type { FEData } from "@/features/labtest/lib/future-edition";
import { loadFutureEditionData } from "@/lib/data/missions-client";

/** Carrega (uma vez) as missões e a tabela de penalidades da Future Edition. */
export function useFutureEditionData() {
  const [data, setData] = useState<FEData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadFutureEditionData()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Erro ao carregar dados."));
    return () => {
      active = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
