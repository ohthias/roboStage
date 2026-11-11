"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CircleStop,
  Clock,
  Cpu,
  FlaskConical,
  Link2,
  Loader2,
  MapPin,
  NotebookPen,
  Pencil,
  Play,
  Trash2,
  Trophy,
  Unlink,
  UserCheck,
  Users,
} from "lucide-react";
import {
  checkIn,
  deleteTrainingSession,
  endTrainingSession,
  linkExecution,
  removeAttendee,
  startTrainingSession,
  unlinkAnatixSession,
  unlinkExecution,
  updateTrainingSession,
} from "@/utils/stagebook/actions/training";
import type { TrainingSessionDetail } from "@/utils/stagebook/training-queries";
import {
  SESSION_KINDS,
  SESSION_KIND_LABEL,
  sessionKindLabel,
  sessionStatusLabel,
  type SessionExecutionDTO,
  type SessionKind,
} from "@/types/training";
import { ConfirmDialog, Modal } from "@/components/stagebook/modal";
import { PersonAvatar } from "../team-avatar";
import { RosterGrid } from "./roster-grid";
import { useActionRunner } from "./use-action";
import { teamToolHref } from "../team-links";

type Member = { userId: string; name: string | null; avatarUrl: string | null };

const STATUS_BADGE: Record<string, string> = {
  planejada: "badge-ghost",
  em_andamento: "badge-success",
  encerrada: "badge-neutral",
};

const fmtNum = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const fmtDateTime = (iso: string) =>
  new Date(iso)
    .toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(/\./g, "");
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function fmtDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}

/** Cronômetro da sessão em andamento (atualiza a cada 30 s). */
function useElapsedMinutes(startedAt: string | null, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [running]);
  if (!startedAt) return null;
  return Math.max(0, Math.round((now - new Date(startedAt).getTime()) / 60_000));
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionView({
  detail,
  members,
  viewerId,
  canDelete,
  canEditRoster,
  canChangeKindToCompetition,
}: {
  detail: TrainingSessionDetail;
  members: Member[];
  viewerId: string;
  canDelete: boolean;
  canEditRoster: boolean;
  canChangeKindToCompetition: boolean;
}) {
  const { session, attendees, executions, anatix } = detail;
  const summary = session.summary;
  const teamId = session.teamId;
  const { run, isPending, router } = useActionRunner();

  const running = session.status === "em_andamento";
  const ended = session.status === "encerrada";
  const elapsed = useElapsedMinutes(session.startedAt, running);
  const attendeeIds = new Set(attendees.map((a) => a.userId));
  const memberById = new Map(members.map((m) => [m.userId, m]));
  const checkedIn = attendeeIds.has(viewerId);

  const [confirm, setConfirm] = useState<"end" | "delete" | null>(null);
  const [editing, setEditing] = useState(false);
  const [linking, setLinking] = useState(false);

  // Execuções agrupadas por teste, na ordem em que aconteceram.
  const byTest = new Map<string, { name: string; items: SessionExecutionDTO[] }>();
  for (const e of executions) {
    const g = byTest.get(e.testId) ?? { name: e.testName, items: [] };
    g.items.push(e);
    byTest.set(e.testId, g);
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <header className="card border border-base-300 bg-base-100">
        <div className="card-body gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className={`badge badge-sm ${STATUS_BADGE[session.status] ?? "badge-ghost"}`}>
                  {running && <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current" />}
                  {sessionStatusLabel(session.status)}
                </span>
                <span className="badge badge-sm badge-outline">{sessionKindLabel(session.kind)}</span>
              </div>
              <h1 className="truncate text-xl font-bold">{session.title}</h1>
              <p
                className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/55"
                suppressHydrationWarning
              >
                {session.status === "planejada" && session.scheduledFor && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={12} /> {fmtDateTime(session.scheduledFor)}
                  </span>
                )}
                {session.startedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Play size={12} /> {fmtDateTime(session.startedAt)}
                    {session.endedAt && ` – ${fmtTime(session.endedAt)}`}
                  </span>
                )}
                {running && elapsed !== null && (
                  <span className="inline-flex items-center gap-1 font-medium text-success">
                    <Clock size={12} /> {fmtDuration(elapsed)}
                  </span>
                )}
                {ended && typeof summary.durationMin === "number" && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {fmtDuration(summary.durationMin)}
                  </span>
                )}
                {session.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {session.location}
                  </span>
                )}
                {session.creatorName && <span>criada por {session.creatorName}</span>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!ended && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  title="Editar"
                  aria-label="Editar sessão"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={15} />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:bg-error/10 hover:text-error"
                  title="Excluir"
                  aria-label="Excluir sessão"
                  onClick={() => setConfirm("delete")}
                >
                  <Trash2 size={15} />
                </button>
              )}
              {session.status === "planejada" && (
                <button
                  type="button"
                  className="btn btn-success btn-sm gap-1.5"
                  disabled={isPending}
                  onClick={() => run(() => startTrainingSession(teamId, session.id), { success: "Sessão iniciada." })}
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Iniciar
                </button>
              )}
              {running && (
                <button
                  type="button"
                  className="btn btn-error btn-sm gap-1.5"
                  disabled={isPending}
                  onClick={() => setConfirm("end")}
                >
                  <CircleStop size={14} /> Encerrar
                </button>
              )}
            </div>
          </div>

          {running && (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-xs text-base-content/70">
              Execuções lançadas nos LabTests da equipe e conexões do Anatix estão sendo registradas aqui. Sem
              atividade por 6 h, a sessão é encerrada automaticamente.
            </p>
          )}
        </div>
      </header>

      {/* Resumo (encerrada) */}
      {ended && <SummaryCard teamId={teamId} summary={summary} memberById={memberById} />}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <RosterGrid
            teamId={teamId}
            sessionId={session.id}
            status={session.status}
            kind={session.kind}
            roundCount={session.roundCount}
            currentRound={session.currentRound}
            rosterPublishedAt={session.rosterPublishedAt}
            rosterDirty={session.rosterDirty}
            dutyRoles={detail.dutyRoles}
            assignments={detail.assignments}
            members={members}
            attendeeIds={attendeeIds}
            canEdit={canEditRoster}
          />

          {/* Execuções */}
          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <FlaskConical size={15} className="text-primary" /> Execuções
                  <span className="badge badge-ghost badge-sm">{executions.length}</span>
                </h3>
                {detail.unlinkedExecutions.length > 0 && (
                  <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => setLinking(true)}>
                    <Link2 size={12} /> Vincular execuções
                  </button>
                )}
              </div>
              {executions.length === 0 ? (
                <p className="py-4 text-sm text-base-content/50">
                  {running
                    ? "Lance execuções em qualquer LabTest da equipe e elas aparecem aqui."
                    : "Nenhuma execução registrada nesta sessão."}
                </p>
              ) : (
                <div className="space-y-4">
                  {[...byTest.entries()].map(([testId, g]) => (
                    <div key={testId}>
                      <a
                        href={teamToolHref(teamId, `/dashboard/labtest/${testId}`)}
                        className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary"
                      >
                        {g.name} <span className="badge badge-ghost badge-xs">{g.items.length}</span>
                      </a>
                      <ul className="divide-y divide-base-200 rounded-lg border border-base-200">
                        {g.items.map((e) => (
                          <li key={e.id} className="flex items-center gap-3 px-3 py-1.5 text-sm">
                            <span className="w-10 text-xs text-base-content/45">#{e.executionNumber}</span>
                            <span className="w-20 font-semibold tabular-nums">
                              {e.score !== null ? `${fmtNum(e.score)} pts` : "—"}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs text-base-content/60">
                              {e.operatorId ? (e.operatorName ?? "Membro") : "Autor desconhecido"}
                            </span>
                            <span className="text-xs text-base-content/45" suppressHydrationWarning>
                              {fmtTime(e.createdAt)}
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-square text-base-content/35 hover:text-error"
                              title="Desvincular desta sessão"
                              aria-label={`Desvincular execução ${e.executionNumber}`}
                              disabled={isPending}
                              onClick={() => run(() => unlinkExecution(teamId, session.id, e.id))}
                            >
                              <Unlink size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Anatix */}
          {anatix.length > 0 && (
            <section className="card border border-base-300 bg-base-100">
              <div className="card-body gap-2 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Cpu size={15} className="text-primary" /> Sessões Anatix
                  <span className="badge badge-ghost badge-sm">{anatix.length}</span>
                </h3>
                <ul className="divide-y divide-base-200">
                  {anatix.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                      <a href={teamToolHref(teamId, `/dashboard/labtest/anatix/${a.labId}`)} className="min-w-0 flex-1 hover:text-primary">
                        <p className="truncate font-medium">{a.labName}</p>
                        <p className="text-xs text-base-content/50" suppressHydrationWarning>
                          {[a.robotName, `${fmtNum(a.frameCount)} frames`, fmtTime(a.startedAt)]
                            .filter(Boolean)
                            .join(" · ")}
                          {!a.endedAt && " · conectado"}
                        </p>
                      </a>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square text-base-content/35 hover:text-error"
                        title="Desvincular desta sessão"
                        aria-label="Desvincular sessão Anatix"
                        disabled={isPending}
                        onClick={() => run(() => unlinkAnatixSession(teamId, session.id, a.id))}
                      >
                        <Unlink size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          {/* Presença */}
          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Users size={15} className="text-primary" /> Presença
                  <span className="badge badge-ghost badge-sm">
                    {attendees.length}/{members.length}
                  </span>
                </h3>
                {!ended && !checkedIn && (
                  <button
                    type="button"
                    className="btn btn-success btn-xs gap-1"
                    disabled={isPending}
                    onClick={() => run(() => checkIn(teamId, session.id), { success: "Presença marcada." })}
                  >
                    <UserCheck size={12} /> Estou aqui
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                {members.map((m) => {
                  const present = attendeeIds.has(m.userId);
                  return (
                    <li key={m.userId}>
                      <button
                        type="button"
                        className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-sm transition-colors ${
                          ended ? "cursor-default" : "hover:bg-base-200"
                        } ${present ? "" : "opacity-45"}`}
                        disabled={ended || isPending}
                        title={ended ? undefined : present ? "Tirar presença" : "Marcar presença"}
                        onClick={() =>
                          run(() =>
                            present ? removeAttendee(teamId, session.id, m.userId) : checkIn(teamId, session.id, m.userId),
                          )
                        }
                      >
                        <PersonAvatar name={m.name} imageUrl={m.avatarUrl} size="size-7" />
                        <span className="min-w-0 flex-1 truncate">
                          {m.name ?? "Sem nome"}
                          {m.userId === viewerId && <span className="ml-1 text-xs text-base-content/40">(você)</span>}
                        </span>
                        {present && <UserCheck size={14} className="shrink-0 text-success" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <NotesCard
            key={session.notes ?? ""}
            initial={session.notes ?? ""}
            onSave={(notes) => run(() => updateTrainingSession(teamId, session.id, { notes }), { success: "Notas salvas." })}
            pending={isPending}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirm === "end"}
        title="Encerrar a sessão?"
        description="O resumo é calculado agora, e novas execuções deixam de ser registradas nela."
        confirmLabel="Encerrar"
        pending={isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          run(() => endTrainingSession(teamId, session.id), {
            success: "Sessão encerrada.",
            onDone: () => setConfirm(null),
          })
        }
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title={`Excluir “${session.title}”?`}
        description="As execuções e sessões Anatix continuam existindo, só deixam de estar agrupadas. Não pode ser desfeito."
        pending={isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          run(() => deleteTrainingSession(teamId, session.id), {
            success: "Sessão excluída.",
            onDone: () => router.push(`/dashboard/team/${teamId}?tab=treinos`),
          })
        }
      />

      {editing && (
        <EditModal
          session={session}
          canChooseCompetition={canChangeKindToCompetition}
          pending={isPending}
          onClose={() => setEditing(false)}
          onSave={(input) =>
            run(() => updateTrainingSession(teamId, session.id, input), {
              success: "Sessão atualizada.",
              onDone: () => setEditing(false),
            })
          }
        />
      )}

      {linking && (
        <LinkModal
          executions={detail.unlinkedExecutions}
          pending={isPending}
          onClose={() => setLinking(false)}
          onLink={(ids) =>
            run(() => linkExecution(teamId, session.id, ids), {
              success: ids.length === 1 ? "Execução vinculada." : `${ids.length} execuções vinculadas.`,
              onDone: () => setLinking(false),
            })
          }
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function SummaryCard({
  teamId,
  summary,
  memberById,
}: {
  teamId: string;
  summary: TrainingSessionDetail["session"]["summary"];
  memberById: Map<string, Member>;
}) {
  const name = (id: string | null) => (id ? (memberById.get(id)?.name ?? "Ex-membro") : "Autor desconhecido");
  const stats = [
    { label: "Duração", value: typeof summary.durationMin === "number" ? fmtDuration(summary.durationMin) : "—" },
    { label: "Presentes", value: String(summary.attendees ?? 0) },
    { label: "Execuções", value: String(summary.executions ?? 0) },
    { label: "Sessões Anatix", value: String(summary.anatix?.length ?? 0) },
  ];

  return (
    <section className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Trophy size={15} className="text-primary" /> Resumo
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-base-200/60 px-3 py-2">
              <p className="text-lg font-bold leading-tight">{s.value}</p>
              <p className="text-xs text-base-content/55">{s.label}</p>
            </div>
          ))}
        </div>

        {!!summary.tests?.length && (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Teste</th>
                  <th className="text-right">Rodadas</th>
                  <th className="text-right">Melhor</th>
                  <th className="text-right">Média</th>
                  <th className="text-right">vs. sessão anterior</th>
                </tr>
              </thead>
              <tbody>
                {summary.tests.map((t) => {
                  const delta = t.avg !== null && t.prevAvg !== null ? t.avg - t.prevAvg : null;
                  return (
                    <tr key={t.testId}>
                      <td>
                        <a href={teamToolHref(teamId, `/dashboard/labtest/${t.testId}`)} className="hover:text-primary">
                          {t.name}
                        </a>
                      </td>
                      <td className="text-right tabular-nums">{t.runs}</td>
                      <td className="text-right tabular-nums">{t.best !== null ? fmtNum(t.best) : "—"}</td>
                      <td className="text-right tabular-nums">{t.avg !== null ? fmtNum(t.avg) : "—"}</td>
                      <td className="text-right tabular-nums">
                        {delta === null ? (
                          <span className="text-base-content/35">—</span>
                        ) : (
                          <span className={`inline-flex items-center gap-0.5 ${delta >= 0 ? "text-success" : "text-error"}`}>
                            {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {delta >= 0 ? "+" : ""}
                            {fmtNum(delta)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {!!summary.byOperator?.length && (
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/45">
                <Activity size={12} /> Por operador
              </p>
              <ul className="space-y-1 text-sm">
                {summary.byOperator.map((o) => (
                  <li key={o.userId ?? "?"} className="flex justify-between gap-3">
                    <span className="truncate">{name(o.userId)}</span>
                    <span className="tabular-nums text-base-content/60">
                      {o.runs} {o.runs === 1 ? "rodada" : "rodadas"}
                      {o.avg !== null && ` · média ${fmtNum(o.avg)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!summary.byDuty?.length && (
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/45">
                <Users size={12} /> Por função
              </p>
              <ul className="space-y-1 text-sm">
                {summary.byDuty.map((d) => (
                  <li key={`${d.dutyRoleId}:${d.userId}`} className="flex justify-between gap-3">
                    <span className="truncate">
                      {d.label}: {name(d.userId)}
                      {d.rounds.length > 0 && (
                        <span className="text-base-content/45"> ({d.rounds.map((r) => `R${r}`).join(", ")})</span>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums text-base-content/60">
                      {d.runs ? `${d.runs} · ${d.avg !== null ? `média ${fmtNum(d.avg)}` : "—"}` : "sem execuções"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function NotesCard({ initial, onSave, pending }: { initial: string; onSave: (notes: string) => void; pending: boolean }) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <section className="card border border-base-300 bg-base-100">
      <div className="card-body gap-2 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <NotebookPen size={15} className="text-primary" /> Notas
        </h3>
        <textarea
          className="textarea h-28 w-full text-sm"
          maxLength={4000}
          placeholder="O que funcionou, o que ajustar no próximo treino..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {dirty && (
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setValue(initial)} disabled={pending}>
              Descartar
            </button>
            <button type="button" className="btn btn-primary btn-xs" onClick={() => onSave(value)} disabled={pending}>
              Salvar notas
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function EditModal({
  session,
  canChooseCompetition,
  pending,
  onClose,
  onSave,
}: {
  session: TrainingSessionDetail["session"];
  canChooseCompetition: boolean;
  pending: boolean;
  onClose: () => void;
  onSave: (input: { title: string; kind: string; scheduledFor: string | null; location: string | null }) => void;
}) {
  const [title, setTitle] = useState(session.title);
  const [kind, setKind] = useState<SessionKind>(session.kind as SessionKind);
  const [scheduledFor, setScheduledFor] = useState(toLocalInput(session.scheduledFor));
  const [location, setLocation] = useState(session.location ?? "");
  // Entrar ou sair de "competição" muda quem edita a escala: só staff.
  const kindLocked = !canChooseCompetition && session.kind === "competicao";

  return (
    <Modal open onClose={onClose} title="Editar sessão">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            title,
            kind,
            scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
            location: location || null,
          });
        }}
      >
        <label className="fieldset">
          <span className="fieldset-legend">Título</span>
          <input className="input w-full" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div>
          <span className="fieldset-legend">Tipo</span>
          <div className="join w-full">
            {SESSION_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={`btn join-item btn-sm flex-1 ${kind === k ? "btn-primary" : ""}`}
                disabled={kindLocked || (k === "competicao" && !canChooseCompetition)}
                onClick={() => setKind(k)}
              >
                {SESSION_KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="fieldset">
            <span className="fieldset-legend">Quando</span>
            <input
              type="datetime-local"
              className="input w-full"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </label>
          <label className="fieldset">
            <span className="fieldset-legend">Local</span>
            <input className="input w-full" maxLength={120} value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={pending}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={pending || !title.trim()}>
            {pending && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LinkModal({
  executions,
  pending,
  onClose,
  onLink,
}: {
  executions: SessionExecutionDTO[];
  pending: boolean;
  onClose: () => void;
  onLink: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Modal
      open
      onClose={onClose}
      title="Vincular execuções"
      description="Execuções recentes dos testes da equipe que não estão em nenhuma sessão."
      size="lg"
    >
      <ul className="max-h-80 divide-y divide-base-200 overflow-y-auto rounded-lg border border-base-200">
        {executions.map((e) => (
          <li key={e.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-base-200/50">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selected.has(e.id)}
                onChange={() => toggle(e.id)}
              />
              <span className="min-w-0 flex-1 truncate">
                {e.testName} <span className="text-base-content/45">#{e.executionNumber}</span>
              </span>
              <span className="tabular-nums">{e.score !== null ? `${fmtNum(e.score)} pts` : "—"}</span>
              <span className="w-36 text-right text-xs text-base-content/45" suppressHydrationWarning>
                {fmtDateTime(e.createdAt)}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="modal-action">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={pending}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={pending || selected.size === 0}
          onClick={() => onLink([...selected])}
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Vincular {selected.size > 0 ? selected.size : ""}
        </button>
      </div>
    </Modal>
  );
}
