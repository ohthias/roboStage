"use client";

/**
 * lib/mission-timer/useClockTick.ts
 *
 * Hook minimalista que força um re-render em intervalos regulares para que
 * componentes que calculam tempo a partir de `Date.now()` (e não de um
 * contador incrementado por `setInterval`) fiquem visualmente atualizados.
 * O VALOR do tempo nunca vem daqui — apenas o "sinal para recalcular".
 */

import { useEffect, useState } from "react";

export function useClockTick(active: boolean, intervalMs = 250): number {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);

  return Date.now();
}
