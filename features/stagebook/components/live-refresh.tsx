"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * "Tempo real" via polling leve, não websockets — reconsulta os Server
 * Components da rota atual a cada `intervalMs`, só enquanto a aba está
 * visível.
 *
 * Atenção: `router.refresh()` re-renderiza a rota INTEIRA, incluindo o
 * layout do dashboard (scope, equipes, notificações, preferências...) e
 * chamadas ao Clerk. Com intervalo curto e várias abas abertas isso vira
 * rajada de requests e o Clerk/Vercel/Neon devolvem 429. Por isso:
 *  - intervalo padrão de 30s;
 *  - nunca dispara um refresh enquanto o anterior ainda não terminou;
 *  - ao voltar para a aba, faz um refresh imediato em vez de esperar.
 *
 * Não renderiza nada — só efeito colateral.
 */
export function LiveRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const routerRef = useRef(router);
  const lastRefreshRef = useRef(Date.now());

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      // Evita empilhar refreshes se o servidor estiver lento.
      if (Date.now() - lastRefreshRef.current < intervalMs / 2) return;
      lastRefreshRef.current = Date.now();
      routerRef.current.refresh();
    };

    const id = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [intervalMs]);

  return null;
}
