"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Flag, Loader2, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import {
  createTeamMilestone,
  deleteTeamMilestone,
  updateTeamMilestone,
} from "@/utils/stagebook/actions/milestones";
import { LABEL_PALETTE, resolveLabelColor } from "@/utils/stagebook/label-colors";
import { roleCan, type TeamRole } from "@/utils/stagebook/team-permissions";
import type { TeamMilestoneSummary } from "@/types/team-workspace";
import { ConfirmDialog, Modal } from "@/components/stagebook/modal";

// Prazo é uma data (sem hora), gravada como meia-noite UTC: formatar em UTC evita "um dia a menos" no Brasil.
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

type Draft = { id: string | null; name: string; dueAt: string; color: string | null; description: string };
const EMPTY: Draft = { id: null, name: "", dueAt: "", color: null, description: "" };

/**
 * Marcos (milestones) da equipe: datas-chave que Kanban, ThinkLab, LabTest,
 * páginas e eventos podem referenciar. Só técnico e mentor criam, editam e
 * excluem; os demais membros enxergam e vinculam itens a eles.
 */
export function MilestonesTab({
  teamId,
  viewerRole,
  milestones,
}: {
  teamId: string;
  viewerRole: TeamRole;
  milestones: TeamMilestoneSummary[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const canManage = roleCan(viewerRole, "milestone.manage");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<TeamMilestoneSummary | null>(null);

  const now = Date.now();
  const upcoming = milestones.filter((m) => !m.dueAt || new Date(m.dueAt).getTime() >= now);
  const past = milestones.filter((m) => m.dueAt && new Date(m.dueAt).getTime() < now);

  function close() {
    setDraft(null);
    setError(null);
  }

  function save() {
    if (!draft) return;
    setError(null);
    if (!draft.name.trim()) {
      setError("Informe um nome.");
      return;
    }
    startTransition(async () => {
      const input = {
        name: draft.name,
        dueAt: draft.dueAt || null,
        color: draft.color,
        description: draft.description || null,
      };
      const result = draft.id
        ? await updateTeamMilestone(teamId, draft.id, input)
        : await createTeamMilestone(teamId, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      addToast(draft.id ? "Marco atualizado." : "Marco criado.", "success");
      close();
      router.refresh();
    });
  }

  function confirmDelete() {
    const target = toDelete;
    if (!target) return;
    startTransition(async () => {
      const result = await deleteTeamMilestone(teamId, target.id);
      if (!result.ok) addToast(result.error, "error");
      else {
        addToast("Marco excluído.", "success");
        router.refresh();
      }
      setToDelete(null);
    });
  }

  function renderRow(m: TeamMilestoneSummary) {
    const color = resolveLabelColor(m.color, m.name);
    const overdue = m.dueAt !== null && new Date(m.dueAt).getTime() < now;
    return (
      <li key={m.id} className="flex items-start gap-3 py-3">
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}26`, color }}
        >
          <Flag size={15} fill={color} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{m.name}</p>
          {m.description && <p className="line-clamp-2 text-xs text-base-content/55">{m.description}</p>}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-base-content/50">
            <span className={`inline-flex items-center gap-1 ${overdue ? "text-error" : ""}`} suppressHydrationWarning>
              <CalendarClock size={11} />
              {m.dueAt ? fmt(m.dueAt) : "Sem prazo"}
            </span>
            <span>
              {m.usageTotal} {m.usageTotal === 1 ? "item vinculado" : "itens vinculados"}
            </span>
          </p>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-square"
              title="Editar"
              aria-label={`Editar ${m.name}`}
              onClick={() =>
                setDraft({
                  id: m.id,
                  name: m.name,
                  dueAt: toDateInput(m.dueAt),
                  color: m.color,
                  description: m.description ?? "",
                })
              }
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:bg-error/10 hover:text-error"
              title="Excluir"
              aria-label={`Excluir ${m.name}`}
              onClick={() => setToDelete(m)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </li>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Marcos da equipe</h2>
          <p className="text-sm text-base-content/60">
            Datas-chave da temporada — usadas em Kanban, ThinkLab, LabTests e eventos.
          </p>
        </div>
        {canManage ? (
          <button type="button" className="btn btn-primary btn-sm gap-1.5" onClick={() => setDraft({ ...EMPTY })}>
            <Plus size={15} /> Novo marco
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-base-content/45">
            <Lock size={12} /> Só técnicos e mentores criam marcos.
          </span>
        )}
      </div>

      {milestones.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Flag size={22} />
            </span>
            <h3 className="font-semibold">Nenhum marco ainda</h3>
            <p className="max-w-sm text-sm text-base-content/55">
              {canManage
                ? "Crie marcos como “Torneio regional” ou “Entrega do projeto” para a equipe se organizar em torno deles."
                : "Quando um técnico ou mentor criar marcos, eles aparecem aqui."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body gap-1 p-4">
              <h3 className="text-sm font-semibold">
                Próximos <span className="badge badge-ghost badge-sm ml-1">{upcoming.length}</span>
              </h3>
              {upcoming.length === 0 ? (
                <p className="py-4 text-sm text-base-content/50">Nenhum marco pela frente.</p>
              ) : (
                <ul className="divide-y divide-base-200">
                  {upcoming.map(renderRow)}
                </ul>
              )}
            </div>
          </div>

          <div className="card border border-base-300 bg-base-100">
            <div className="card-body gap-1 p-4">
              <h3 className="text-sm font-semibold">
                Passados <span className="badge badge-ghost badge-sm ml-1">{past.length}</span>
              </h3>
              {past.length === 0 ? (
                <p className="py-4 text-sm text-base-content/50">Nada por aqui ainda.</p>
              ) : (
                <ul className="divide-y divide-base-200">
                  {past.map(renderRow)}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={close}
        title={draft?.id ? "Editar marco" : "Novo marco"}
        description="Visível para toda a equipe."
      >
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
                maxLength={100}
                placeholder="Ex.: Torneio regional"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>

            <label className="fieldset">
              <span className="fieldset-legend">Prazo (opcional)</span>
              <input
                type="date"
                className="input w-full"
                value={draft.dueAt}
                onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })}
              />
            </label>

            <label className="fieldset">
              <span className="fieldset-legend">Descrição (opcional)</span>
              <textarea
                className="textarea h-20 w-full"
                maxLength={1000}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>

            <div>
              <span className="fieldset-legend">Cor</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor do marco">
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

            {error && (
              <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
                {error}
              </div>
            )}

            <div className="modal-action">
              <button type="button" className="btn btn-ghost btn-sm" onClick={close} disabled={isPending}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isPending || !draft.name.trim()}>
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {draft.id ? "Salvar" : "Criar"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Excluir “${toDelete?.name ?? ""}”?`}
        description={
          toDelete && toDelete.usageTotal > 0
            ? `Os ${toDelete.usageTotal} item(ns) vinculados ficam sem marco. Não pode ser desfeito.`
            : "Não pode ser desfeito."
        }
        pending={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
