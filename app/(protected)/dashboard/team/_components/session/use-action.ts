"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import type { ActionResult } from "@/utils/stagebook/action-result";

/**
 * Roda uma Server Action que devolve `ActionResult`: mostra o erro num toast,
 * o sucesso (se houver mensagem) e atualiza a página.
 */
export function useActionRunner() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function run<T>(
    task: () => Promise<ActionResult<T>>,
    { success, onDone }: { success?: string; onDone?: (data: T) => void } = {},
  ) {
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        addToast(result.error, "error", 5000);
        return;
      }
      if (success) addToast(success, "success");
      onDone?.(result.data);
      router.refresh();
    });
  }

  return { run, isPending, addToast, router };
}
