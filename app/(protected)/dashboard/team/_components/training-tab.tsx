"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronRight, Loader2, MapPin, Play, Plus, Timer, Users } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { createTrainingSession } from "@/utils/stagebook/actions/training";
import type { TeamRole } from "@/utils/stagebook/team-permissions";
import {
  SESSION_KINDS,
  SESSION_KIND_LABEL,
  sessionKindLabel,
  type SessionKind,
  type TrainingSessionListItem,
} from "@/types/training";
import { Modal } from "@/components/stagebook/modal";

const KIND_BADGE: Record<string, string> = {
  treino: "badge-ghost",
  simulado: "badge-info badge-soft",
  competicao: "badge-secondary badge-soft",
};

const fmtWhen = (iso: string) =>
  new Date(iso)
    .toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(/\./g, "");

const fmtNum = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/** Resumo de uma linha de uma sessão encerrada. */
function summaryLine(s: TrainingSessionListItem): string {
  const sum = s.summary;
  const parts: string[] = [];
  if (typeof sum.durationMin === "number") parts.push(`${sum.durationMin} min`);
  parts.push(`${sum.attendees ?? s.attendeeCount} ${(sum.attendees ?? s.attendeeCount) === 1 ? "presente" : "presentes"}`);
  parts.push(`${sum.executions ?? s.executionCount} ${(sum.executions ?? s.executionCount) === 1 ? "execução" : "execuções"}`);
  const top = sum.tests?.find((t) => t.best !== null);
  if (top && top.best !== null) parts.push(`${top.name}: melhor ${fmtNum(top.best)}`);
  return parts.join(" · ");
}

type Draft = { title: string; kind: SessionKind; scheduledFor: string; location: string; notes: string };
const EMPTY: Draft = { title: "", kind: "treino", scheduledFor: "", location: "", notes: "" };

/**
 * Aba "Treinos": sessões em andamento no topo, depois as planejadas e as
 * encerradas (com o resumo em uma linha). Qualquer membro cria e conduz.
 */
export function TrainingTab({
  teamId,
  sessions,
}: {
  teamId: string;
  viewerId: string;
  viewerRole: TeamRole;
  sessions: TrainingSessionListItem[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = sessions.filter((s) => s.status === "em_andamento");
  const planned = sessions.filter((s) => s.status === "planejada");
  const ended = sessions.filter((s) => s.status === "encerrada");
  const base = `/dashboard/team/${teamId}/treinos`;

  function close() {
    setDraft(null);
    setError(null);
  }

  function save(startNow: boolean) {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const result = await createTrainingSession(teamId, {
        title: draft.title,
        kind: draft.kind,
        // datetime-local vem sem fuso: o navegador interpreta no fuso local.
        scheduledFor: draft.scheduledFor ? new Date(draft.scheduledFor).toISOString() : null,
        location: draft.location || null,
        notes: draft.notes || null,
        startNow,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data.warning) addToast(`Sessão planejada. ${result.data.warning}`, "warning");
      else addToast(result.data.started ? "Sessão iniciada." : "Sessão planejada.", "success");
      close();
      router.push(`${base}/${result.data.id}`);
    });
  }

  function row(s: TrainingSessionListItem) {
    const when = s.status === "planejada" ? s.scheduledFor : (s.startedAt ?? s.scheduledFor);
    return (
      <li key={s.id}>
        <Link href={`${base}/${s.id}`} className="flex items-center gap-3 px-1 py-3 hover:text-primary">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              s.status === "em_andamento" ? "bg-success/15 text-success" : "bg-base-200 text-base-content/55"
            }`}
          >
            {s.status === "em_andamento" ? <Play size={15} /> : <Timer size={15} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="truncate">{s.title}</span>
              <span className={`badge badge-xs ${KIND_BADGE[s.kind] ?? "badge-ghost"}`}>{sessionKindLabel(s.kind)}</span>
              {s.status === "planejada" && s.rosterPublishedAt && (
                <span className="badge badge-xs badge-success badge-soft">Escala publicada</span>
              )}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-base-content/50" suppressHydrationWarning>
              {s.status === "encerrada" ? (
                <span>{summaryLine(s)}</span>
              ) : (
                <>
                  {when && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={11} /> {fmtWhen(when)}
                    </span>
                  )}
                  {s.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} /> {s.location}
                    </span>
                  )}
                  {s.status === "em_andamento" && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} /> {s.attendeeCount} · {s.executionCount}{" "}
                      {s.executionCount === 1 ? "execução" : "execuções"}
                    </span>
                  )}
                </>
              )}
              {s.status === "encerrada" && s.endedAt && <span>{fmtWhen(s.startedAt ?? s.endedAt)}</span>}
            </p>
          </div>
          <ChevronRight size={16} className="shrink-0 text-base-content/30" />
        </Link>
      </li>
    );
  }

  function group(title: string, items: TrainingSessionListItem[], empty: string) {
    return (
      <div className="card border border-base-300 bg-base-100">
        <div className="card-body gap-0 p-4">
          <h3 className="text-sm font-semibold">
            {title} <span className="badge badge-ghost badge-sm ml-1">{items.length}</span>
          </h3>
          {items.length === 0 ? (
            <p className="py-4 text-sm text-base-content/50">{empty}</p>
          ) : (
            <ul className="divide-y divide-base-200">{items.map(row)}</ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Treinos e competições</h2>
          <p className="max-w-xl text-sm text-base-content/60">
            Com uma sessão em andamento, as execuções do LabTest e as conexões do Anatix da equipe são registradas
            nela automaticamente.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm gap-1.5" onClick={() => setDraft({ ...EMPTY })}>
          <Plus size={15} /> Nova sessão
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Timer size={22} />
            </span>
            <h3 className="font-semibold">Nenhuma sessão ainda</h3>
            <p className="max-w-sm text-sm text-base-content/55">
              Inicie um treino para registrar presença, execuções e o desempenho de cada piloto — ou planeje uma
              competição e monte a escala antes do dia.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div className="card border border-success/40 bg-base-100">
              <div className="card-body gap-0 p-4">
                <h3 className="text-sm font-semibold text-success">Em andamento</h3>
                <ul className="divide-y divide-base-200">{active.map(row)}</ul>
              </div>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {group("Planejadas", planned, "Nada planejado.")}
            {group("Encerradas", ended, "Nenhuma sessão encerrada ainda.")}
          </div>
        </div>
      )}

      <Modal open={draft !== null} onClose={close} title="Nova sessão" description="Visível para toda a equipe.">
        {draft && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save(false);
            }}
          >
            <label className="fieldset">
              <span className="fieldset-legend">Título</span>
              <input
                autoFocus
                className="input w-full"
                maxLength={100}
                placeholder="Ex.: Treino de sábado"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>

            <div>
              <span className="fieldset-legend">Tipo</span>
              <div className="join w-full" role="radiogroup" aria-label="Tipo de sessão">
                {SESSION_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={draft.kind === k}
                    className={`btn join-item btn-sm flex-1 ${draft.kind === k ? "btn-primary" : ""}`}
                    onClick={() => setDraft({ ...draft, kind: k })}
                  >
                    {SESSION_KIND_LABEL[k]}
                  </button>
                ))}
              </div>
              {draft.kind === "competicao" && (
                <p className="mt-1 text-xs text-base-content/50">Em competições, só técnicos e mentores montam a escala.</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="fieldset">
                <span className="fieldset-legend">Quando (opcional)</span>
                <input
                  type="datetime-local"
                  className="input w-full"
                  value={draft.scheduledFor}
                  onChange={(e) => setDraft({ ...draft, scheduledFor: e.target.value })}
                />
              </label>
              <label className="fieldset">
                <span className="fieldset-legend">Local (opcional)</span>
                <input
                  className="input w-full"
                  maxLength={120}
                  placeholder="Ex.: Laboratório"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                />
              </label>
            </div>

            <label className="fieldset">
              <span className="fieldset-legend">Notas (opcional)</span>
              <textarea
                className="textarea h-20 w-full"
                maxLength={4000}
                placeholder="Objetivo do treino, o que testar..."
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>

            {error && (
              <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
                {error}
              </div>
            )}

            <div className="modal-action flex-wrap">
              <button type="button" className="btn btn-ghost btn-sm" onClick={close} disabled={isPending}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-sm" disabled={isPending || !draft.title.trim()}>
                Planejar
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm gap-1.5"
                disabled={isPending || !draft.title.trim()}
                onClick={() => save(true)}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Iniciar agora
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
