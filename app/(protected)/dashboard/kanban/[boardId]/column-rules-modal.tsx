"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Check, Milestone as MilestoneIcon, Settings2, X } from "lucide-react";
import { updateColumnRules } from "./actions";
import { createMilestone } from "@/utils/stagebook/actions/milestones";

export type ColumnRules = {
  maxCards?: number | null;
  allowedPriorities?: string[];
  dueDateRequired?: boolean;
  maxDueDays?: number | null;
  milestoneId?: string | null;
};

type Milestone = { id: string; name: string; dueAt: string | Date | null };

const PRIORITIES = [
  ["baixa", "Baixa"],
  ["media", "Média"],
  ["alta", "Alta"],
  ["urgente", "Urgente"],
];

export function ColumnRulesModal({
  boardId,
  columnId,
  columnName,
  initialRules,
  milestones,
  onClose,
  onChanged,
}: {
  boardId: string;
  columnId: string;
  columnName: string;
  initialRules: ColumnRules;
  milestones: Milestone[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [rules, setRules] = useState<ColumnRules>(initialRules ?? {});
  const [name, setName] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateColumnRules(boardId, columnId, rules);
      onChanged();
      onClose();
    });
  }

  function addMilestone() {
    if (!name.trim()) return;
    startTransition(async () => {
      await createMilestone({ name, dueAt: dueAt || null });
      setName("");
      setDueAt("");
      onChanged();
    });
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="column-rules-title">
      <div className="modal-box max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="column-rules-title" className="flex items-center gap-2 text-lg font-bold">
              <Settings2 size={18} className="text-primary" />
              Regras: {columnName}
            </h2>
            <p className="mt-1 text-sm text-base-content/55">Defina quais cards podem entrar nesta coluna.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-base-300 p-3">
            <input type="number" min={1} className="input input-bordered input-sm w-24" placeholder="Sem limite" value={rules.maxCards ?? ""} onChange={(e) => setRules((prev) => ({ ...prev, maxCards: e.target.value ? Number(e.target.value) : null }))} />
            <span className="text-sm">Máximo de cards</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-base-300 p-3">
            <input type="checkbox" className="checkbox checkbox-sm" checked={Boolean(rules.dueDateRequired)} onChange={(e) => setRules((prev) => ({ ...prev, dueDateRequired: e.target.checked }))} />
            <span className="text-sm">Exigir prazo</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-base-300 p-3">
            <input type="number" min={1} className="input input-bordered input-sm w-24" placeholder="Sem limite" value={rules.maxDueDays ?? ""} onChange={(e) => setRules((prev) => ({ ...prev, maxDueDays: e.target.value ? Number(e.target.value) : null }))} />
            <span className="text-sm">Prazo em até X dias</span>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Prioridades permitidas</p>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map(([value, label]) => {
              const checked = rules.allowedPriorities?.includes(value) ?? false;
              return (
                <label key={value} className={`badge cursor-pointer gap-1 p-3 ${checked ? "badge-primary" : "badge-ghost"}`}>
                  <input type="checkbox" className="checkbox checkbox-xs" checked={checked} onChange={() => setRules((prev) => ({ ...prev, allowedPriorities: checked ? (prev.allowedPriorities ?? []).filter((item) => item !== value) : [...(prev.allowedPriorities ?? []), value] }))} />
                  {label}
                </label>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-base-content/45">Sem seleção, qualquer prioridade é aceita.</p>
        </div>

        <div className="mt-5 rounded-xl border border-base-300 p-3">
          <p className="flex items-center gap-2 text-sm font-medium"><MilestoneIcon size={15} /> Milestone exigida</p>
          <select className="select select-bordered select-sm mt-2 w-full" value={rules.milestoneId ?? ""} onChange={(e) => setRules((prev) => ({ ...prev, milestoneId: e.target.value || null }))}>
            <option value="">Nenhuma milestone específica</option>
            {milestones.map((milestone) => <option key={milestone.id} value={milestone.id}>{milestone.name}{milestone.dueAt ? ` — ${new Date(milestone.dueAt).toLocaleDateString("pt-BR")}` : ""}</option>)}
          </select>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input className="input input-bordered input-sm flex-1" placeholder="Nome da nova milestone" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="date" className="input input-bordered input-sm" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            <button type="button" className="btn btn-outline btn-sm" onClick={addMilestone}>Criar</button>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm gap-2" onClick={save}><Check size={14} /> Salvar regras</button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>
  );
}
