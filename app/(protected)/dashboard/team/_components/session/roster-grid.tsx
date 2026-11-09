"use client";

import { useState } from "react";
import { Check, ListChecks, Lock, Minus, Plus, Send, X } from "lucide-react";
import {
  assignDuty,
  publishRoster,
  setCurrentRound,
  setRoundCount,
  unassignDuty,
} from "@/utils/stagebook/actions/roster";
import type { DutyAssignmentDTO, DutyRoleDTO } from "@/types/training";
import { useActionRunner } from "./use-action";

type Member = { userId: string; name: string | null; avatarUrl: string | null };

const firstName = (name: string | null) => (name ?? "Sem nome").split(/\s+/)[0];

/**
 * Grade função × rodada da escala. A coluna "Sessão" vale para a sessão
 * inteira; as colunas R1..Rn são rodadas específicas. A escala fica em
 * rascunho até ser publicada (é aí que os escalados são avisados).
 */
export function RosterGrid({
  teamId,
  sessionId,
  status,
  kind,
  roundCount,
  currentRound,
  rosterPublishedAt,
  rosterDirty,
  dutyRoles,
  assignments,
  members,
  attendeeIds,
  canEdit,
}: {
  teamId: string;
  sessionId: string;
  status: string;
  kind: string;
  roundCount: number;
  currentRound: number | null;
  rosterPublishedAt: string | null;
  rosterDirty: boolean;
  dutyRoles: DutyRoleDTO[];
  assignments: DutyAssignmentDTO[];
  members: Member[];
  attendeeIds: Set<string>;
  canEdit: boolean;
}) {
  const { run, isPending } = useActionRunner();
  const [onlyPresent, setOnlyPresent] = useState(false);
  const editable = canEdit && status !== "encerrada";
  const memberById = new Map(members.map((m) => [m.userId, m]));

  // Funções arquivadas só aparecem se já tiverem alguém escalado nesta sessão.
  const usedRoleIds = new Set(assignments.map((a) => a.dutyRoleId));
  const rows = dutyRoles.filter((r) => !r.archived || usedRoleIds.has(r.id));
  const rounds: (number | null)[] = [null, ...Array.from({ length: roundCount }, (_, i) => i + 1)];

  const cell = (roleId: string, round: number | null) =>
    assignments.filter((a) => a.dutyRoleId === roleId && a.round === round);

  const candidates = (roleId: string, round: number | null) => {
    const taken = new Set(cell(roleId, round).map((a) => a.userId));
    return members.filter((m) => !taken.has(m.userId) && (!onlyPresent || attendeeIds.has(m.userId)));
  };

  const publishLabel = !rosterPublishedAt ? "Publicar escala" : rosterDirty ? "Publicar alterações" : "Publicada";

  return (
    <section className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks size={15} className="text-primary" /> Escala
            {!rosterPublishedAt ? (
              <span className="badge badge-ghost badge-sm">Rascunho</span>
            ) : rosterDirty ? (
              <span className="badge badge-warning badge-soft badge-sm">Alterações não publicadas</span>
            ) : (
              <span className="badge badge-success badge-soft badge-sm" suppressHydrationWarning>
                Publicada {new Date(rosterPublishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            )}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {status === "em_andamento" && roundCount > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-base-content/60">
                Rodada atual
                <select
                  className="select select-xs w-auto"
                  value={currentRound ?? ""}
                  disabled={isPending}
                  onChange={(e) =>
                    run(() => setCurrentRound(teamId, sessionId, e.target.value ? Number(e.target.value) : null))
                  }
                >
                  <option value="">—</option>
                  {rounds
                    .filter((r): r is number => r !== null)
                    .map((r) => (
                      <option key={r} value={r}>
                        R{r}
                      </option>
                    ))}
                </select>
              </label>
            )}

            {editable && (
              <>
                <div className="join" aria-label="Rodadas">
                  <button
                    type="button"
                    className="btn btn-xs join-item"
                    title="Remover a última rodada"
                    disabled={isPending || roundCount === 0}
                    onClick={() => run(() => setRoundCount(teamId, sessionId, roundCount - 1))}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="btn btn-xs join-item pointer-events-none no-animation">
                    {roundCount === 0 ? "Sem rodadas" : `${roundCount} ${roundCount === 1 ? "rodada" : "rodadas"}`}
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs join-item"
                    title="Adicionar rodada"
                    disabled={isPending || roundCount >= 12}
                    onClick={() => run(() => setRoundCount(teamId, sessionId, roundCount + 1))}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-xs gap-1"
                  disabled={isPending || (!!rosterPublishedAt && !rosterDirty) || (assignments.length === 0 && !rosterPublishedAt)}
                  onClick={() =>
                    run(() => publishRoster(teamId, sessionId), {
                      success: rosterPublishedAt ? "Escala atualizada." : "Escala publicada. Os escalados foram avisados.",
                    })
                  }
                >
                  {rosterPublishedAt && !rosterDirty ? <Check size={12} /> : <Send size={12} />}
                  {publishLabel}
                </button>
              </>
            )}
          </div>
        </div>

        {!canEdit && status !== "encerrada" && (
          <p className="flex items-center gap-1.5 text-xs text-base-content/50">
            <Lock size={12} />
            {kind === "competicao"
              ? "Em competições, só técnicos e mentores montam a escala."
              : "Você não pode editar esta escala."}
          </p>
        )}

        {editable && (
          <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-base-content/60">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={onlyPresent}
              onChange={(e) => setOnlyPresent(e.target.checked)}
            />
            Sugerir só quem marcou presença
          </label>
        )}

        {rows.length === 0 ? (
          <p className="py-4 text-sm text-base-content/50">
            A equipe ainda não tem funções. Técnicos e mentores cadastram em Gerenciar equipe.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th className="min-w-36">Função</th>
                  {rounds.map((r) => (
                    <th
                      key={r ?? "all"}
                      className={`min-w-36 ${r !== null && r === currentRound ? "text-success" : ""}`}
                    >
                      {r === null ? "Sessão inteira" : `Rodada ${r}`}
                      {r !== null && r === currentRound && " · agora"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((role) => (
                  <tr key={role.id} className="align-top">
                    <td>
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {role.color && <span className="size-2 rounded-full" style={{ backgroundColor: role.color }} />}
                        {role.label}
                        {role.archived && <span className="badge badge-ghost badge-xs">arquivada</span>}
                      </p>
                      {role.maxPerSlot !== null && (
                        <p className="text-[11px] text-base-content/45">até {role.maxPerSlot} por vaga</p>
                      )}
                    </td>
                    {rounds.map((r) => {
                      const items = cell(role.id, r);
                      const full = role.maxPerSlot !== null && items.length >= role.maxPerSlot;
                      const options = candidates(role.id, r);
                      return (
                        <td key={r ?? "all"}>
                          <div className="flex flex-wrap gap-1">
                            {items.map((a) => (
                              <span key={a.id} className="badge badge-soft badge-primary gap-1 pr-1">
                                {firstName(memberById.get(a.userId)?.name ?? null)}
                                {editable && (
                                  <button
                                    type="button"
                                    className="rounded-full hover:bg-base-content/10"
                                    aria-label={`Tirar ${memberById.get(a.userId)?.name ?? "membro"} de ${role.label}`}
                                    disabled={isPending}
                                    onClick={() => run(() => unassignDuty(teamId, sessionId, a.id))}
                                  >
                                    <X size={11} />
                                  </button>
                                )}
                              </span>
                            ))}
                            {editable && !role.archived && !full && options.length > 0 && (
                              <select
                                className="select select-ghost select-xs w-28 text-base-content/50"
                                value=""
                                disabled={isPending}
                                aria-label={`Escalar em ${role.label}${r ? ` na rodada ${r}` : ""}`}
                                onChange={(e) =>
                                  e.target.value &&
                                  run(() =>
                                    assignDuty(teamId, sessionId, { dutyRoleId: role.id, userId: e.target.value, round: r }),
                                  )
                                }
                              >
                                <option value="">+ escalar</option>
                                {options.map((m) => (
                                  <option key={m.userId} value={m.userId}>
                                    {m.name ?? "Sem nome"}
                                    {attendeeIds.has(m.userId) ? " ✓" : ""}
                                  </option>
                                ))}
                              </select>
                            )}
                            {!editable && items.length === 0 && <span className="text-xs text-base-content/30">—</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
