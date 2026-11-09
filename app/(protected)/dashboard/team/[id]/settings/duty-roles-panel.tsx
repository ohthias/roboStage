"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, ListChecks, Loader2, Pencil, Plus } from "lucide-react";
import { createDutyRole, moveDutyRole, updateDutyRole } from "@/utils/stagebook/actions/roster";
import { LABEL_PALETTE } from "@/utils/stagebook/label-colors";
import type { DutyRoleDTO } from "@/types/training";
import { Modal } from "@/components/stagebook/modal";
import { useActionRunner } from "../../_components/session/use-action";

type Draft = { id: string | null; label: string; description: string; color: string | null; maxPerSlot: string };
const EMPTY: Draft = { id: null, label: "", description: "", color: null, maxPerSlot: "" };

/**
 * "Funções da competição": o catálogo da escala (Piloto, Estrategista...).
 * A primeira função ativa é a de quem opera o robô — sugere o operador das
 * execuções do LabTest durante a sessão. Funções são arquivadas, não
 * excluídas, para o histórico da escala continuar legível.
 */
export function DutyRolesPanel({ teamId, roles }: { teamId: string; roles: DutyRoleDTO[] }) {
  const { run, isPending } = useActionRunner();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const active = roles.filter((r) => !r.archived);
  const archived = roles.filter((r) => r.archived);

  function save() {
    if (!draft) return;
    const input = {
      label: draft.label,
      description: draft.description || null,
      color: draft.color,
      maxPerSlot: draft.maxPerSlot ? Number(draft.maxPerSlot) : null,
    };
    const id = draft.id;
    run<unknown>(() => (id ? updateDutyRole(teamId, id, input) : createDutyRole(teamId, input)), {
      success: draft.id ? "Função atualizada." : "Função criada.",
      onDone: () => setDraft(null),
    });
  }

  return (
    <section className="card mt-6 border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <ListChecks size={17} className="text-primary" /> Funções da competição
            </h2>
            <p className="mt-0.5 max-w-xl text-sm text-base-content/60">
              As funções que aparecem na escala dos treinos e competições. A primeira da lista é a de quem opera o
              robô: ela sugere o operador das execuções durante a sessão.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm gap-1.5" onClick={() => setDraft({ ...EMPTY })}>
            <Plus size={15} /> Nova função
          </button>
        </div>

        <ul className="divide-y divide-base-200 rounded-lg border border-base-200">
          {active.map((role, index) => (
            <li key={role.id} className="flex items-center gap-3 px-3 py-2">
              <span
                className="size-2.5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: role.color ?? "transparent" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {role.label}
                  {index === 0 && <span className="badge badge-primary badge-soft badge-xs ml-2">operador</span>}
                </p>
                <p className="truncate text-xs text-base-content/50">
                  {[role.description, role.maxPerSlot ? `até ${role.maxPerSlot} por vaga` : null]
                    .filter(Boolean)
                    .join(" · ") || "Sem descrição"}
                </p>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label={`Subir ${role.label}`}
                  disabled={isPending || index === 0}
                  onClick={() => run(() => moveDutyRole(teamId, role.id, "up"))}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label={`Descer ${role.label}`}
                  disabled={isPending || index === active.length - 1}
                  onClick={() => run(() => moveDutyRole(teamId, role.id, "down"))}
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label={`Editar ${role.label}`}
                  onClick={() =>
                    setDraft({
                      id: role.id,
                      label: role.label,
                      description: role.description ?? "",
                      color: role.color,
                      maxPerSlot: role.maxPerSlot ? String(role.maxPerSlot) : "",
                    })
                  }
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square text-base-content/45 hover:text-warning"
                  aria-label={`Arquivar ${role.label}`}
                  title="Arquivar (o histórico continua)"
                  disabled={isPending}
                  onClick={() => run(() => updateDutyRole(teamId, role.id, { archived: true }), { success: "Função arquivada." })}
                >
                  <Archive size={13} />
                </button>
              </div>
            </li>
          ))}
          {active.length === 0 && <li className="px-3 py-4 text-sm text-base-content/50">Nenhuma função ativa.</li>}
        </ul>

        {archived.length > 0 && (
          <div>
            <button type="button" className="link link-hover text-xs text-base-content/50" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Esconder" : "Mostrar"} arquivadas ({archived.length})
            </button>
            {showArchived && (
              <ul className="mt-2 space-y-1">
                {archived.map((role) => (
                  <li key={role.id} className="flex items-center justify-between gap-3 text-sm text-base-content/55">
                    {role.label}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs gap-1"
                      disabled={isPending}
                      onClick={() => run(() => updateDutyRole(teamId, role.id, { archived: false }), { success: "Função restaurada." })}
                    >
                      <ArchiveRestore size={12} /> Restaurar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "Editar função" : "Nova função"}>
        {draft && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <label className="fieldset">
              <span className="fieldset-legend">Nome</span>
              <input
                autoFocus
                className="input w-full"
                maxLength={60}
                placeholder="Ex.: Piloto"
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              />
              {/^t[ée]cnico$/i.test(draft.label.trim()) && (
                <span className="text-xs text-warning">“Técnico” já é um cargo da equipe; prefira outro nome.</span>
              )}
            </label>
            <label className="fieldset">
              <span className="fieldset-legend">Descrição (opcional)</span>
              <input
                className="input w-full"
                maxLength={200}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
            <label className="fieldset">
              <span className="fieldset-legend">Máximo de pessoas por rodada (opcional)</span>
              <input
                type="number"
                min={1}
                max={20}
                className="input w-32"
                value={draft.maxPerSlot}
                onChange={(e) => setDraft({ ...draft, maxPerSlot: e.target.value })}
              />
            </label>
            <div>
              <span className="fieldset-legend">Cor</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da função">
                {LABEL_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={draft.color === c.value}
                    title={c.name}
                    onClick={() => setDraft({ ...draft, color: draft.color === c.value ? null : c.value })}
                    className={`size-6 rounded-full border border-black/10 ${
                      draft.color === c.value ? "ring-2 ring-base-content/60 ring-offset-2 ring-offset-base-100" : ""
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDraft(null)} disabled={isPending}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isPending || !draft.label.trim()}>
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {draft.id ? "Salvar" : "Criar"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
