"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { createTrainingSession } from "@/utils/stagebook/actions/training";
import { CORNER } from "./team-ui";

const defaultTitle = () =>
  `Treino de ${new Date().toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "")}`;

/**
 * "Treino rápido": campo + botão, no lugar da busca da referência. Começa uma
 * sessão já em andamento e abre a página dela.
 */
export function QuickStart({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function start() {
    startTransition(async () => {
      const result = await createTrainingSession(teamId, {
        title: title.trim() || defaultTitle(),
        kind: "treino",
        startNow: true,
      });
      if (!result.ok) {
        addToast(result.error, "error", 5000);
        return;
      }
      if (result.data.warning) addToast(result.data.warning, "warning", 5000);
      router.push(`/dashboard/team/${teamId}/treinos/${result.data.id}`);
    });
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      <input
        className={`input input-sm h-10 min-w-0 flex-1 border-0 bg-base-200/80 focus:bg-base-100 ${CORNER.sm}`}
        placeholder="Nome do treino (opcional)"
        maxLength={100}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Nome do treino"
      />
      <button type="submit" className={`btn btn-primary h-10 min-h-0 gap-1.5 px-4 ${CORNER.sm}`} disabled={isPending}>
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        Iniciar
      </button>
    </form>
  );
}
