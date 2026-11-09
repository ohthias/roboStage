"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { switchStagebookScope } from "@/utils/stagebook/actions/teams";
import { useToast } from "@/app/context/ToastContext";

/**
 * Cartão do hub: entrar num espaço também o torna o espaço ATIVO (o mesmo da
 * barra lateral), para que Kanban, LabTest, StageBook... abram nele em seguida.
 */
export function EnterSpaceCard({
  teamId,
  isActive,
  href,
  className,
  children,
}: {
  teamId: string | null;
  isActive: boolean;
  href: string;
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function enter() {
    startTransition(async () => {
      try {
        if (!isActive) await switchStagebookScope(teamId);
        router.push(href);
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível abrir este espaço.", "error");
      }
    });
  }

  return (
    <button type="button" onClick={enter} disabled={isPending} className={`relative text-left ${className}`}>
      {children}
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-base-100/60">
          <Loader2 size={20} className="animate-spin text-primary" />
        </span>
      )}
    </button>
  );
}
