"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleStop, Loader2, Timer, UserRound } from "lucide-react";
import { endTrainingSession } from "@/utils/stagebook/actions/training";
import { sessionKindLabel, type ActiveSessionRef } from "@/types/training";
import { ConfirmDialog } from "@/components/stagebook/modal";
import { useToast } from "@/app/context/ToastContext";

/**
 * Faixa discreta nas telas do LabTest e do Anatix: deixa claro que os dados
 * estão indo para a sessão de treino em andamento da equipe.
 */
export function TrainingSessionBanner({
  session,
  onEnded,
  children,
}: {
  session: ActiveSessionRef;
  onEnded?: () => void;
  /** Controles extras à direita (ex.: escolha do operador). */
  children?: React.ReactNode;
}) {
  const { addToast } = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function end() {
    startTransition(async () => {
      const result = await endTrainingSession(session.teamId, session.id);
      if (!result.ok) {
        addToast(result.error, "error", 5000);
        return;
      }
      addToast("Sessão encerrada.", "success");
      setConfirm(false);
      if (onEnded) onEnded();
      else router.refresh();
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      <Timer size={14} className="text-success" />
      <span className="min-w-0 flex-1">
        Registrando {session.kind === "competicao" ? "na competição" : "na sessão"}{" "}
        <Link href={`/dashboard/team/${session.teamId}/treinos/${session.id}`} className="font-semibold hover:underline">
          {session.title}
        </Link>
        <span className="text-base-content/50"> · {sessionKindLabel(session.kind)}</span>
      </span>
      {children}
      <button
        type="button"
        className="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-error"
        onClick={() => setConfirm(true)}
        disabled={isPending}
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : <CircleStop size={12} />}
        Encerrar
      </button>
      <ConfirmDialog
        open={confirm}
        title="Encerrar a sessão?"
        description="O resumo é calculado agora, e novos lançamentos deixam de ser registrados nela."
        confirmLabel="Encerrar"
        pending={isPending}
        onConfirm={end}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

/** Seletor do operador da rodada (testes de equipe). */
export function OperatorSelect({
  members,
  viewerId,
  value,
  onChange,
  suggestedDuty,
  suggestedOperatorId,
}: {
  members: { userId: string; name: string | null }[];
  viewerId: string | null;
  value: string;
  onChange: (userId: string) => void;
  suggestedDuty: string | null;
  suggestedOperatorId: string | null;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-base-content/60">
      <UserRound size={13} />
      Operador
      <select className="select select-xs w-auto max-w-44" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">
          Eu{viewerId === suggestedOperatorId && suggestedDuty ? ` (${suggestedDuty})` : ""}
        </option>
        {members.filter((m) => m.userId !== viewerId).map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.name ?? "Sem nome"}
            {m.userId === suggestedOperatorId && suggestedDuty ? ` (${suggestedDuty})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
