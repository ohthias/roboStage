"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * "Tempo real" via polling leve, não websockets — reconsulta os Server
 * Components da rota atual a cada `intervalMs`, só enquanto a aba está
 * visível (evita gastar requests com a aba em segundo plano). Suficiente
 * pra ver membros entrando na equipe ou cards do Kanban se movendo sem
 * precisar apertar F5, sem adicionar infraestrutura nova (Pusher/Ably/
 * WebSocket dedicado) ao projeto.
 *
 * Não renderiza nada — só efeito colateral.
 */
export function LiveRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        routerRef.current.refresh();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return null;
}
