"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarClock, Flag, Milestone as MilestoneIcon, Plus, Search, X } from "lucide-react";
import { createMilestone } from "./actions";

type Milestone = { id: string; name: string; dueAt: string | Date | null };

function isPast(dueAt: string | Date | null) {
  return Boolean(dueAt && new Date(dueAt).getTime() < Date.now());
}

export function MilestonesModal({
  boardId,
  milestones,
  cards,
  onClose,
  onChanged,
}: {
  boardId: string;
  milestones: Milestone[];
  cards: { milestoneId: string | null }[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [, startTransition] = useTransition();

  const filtered = useMemo(
    () => milestones.filter((milestone) => milestone.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
    [milestones, search],
  );

  function addMilestone() {
    if (!name.trim()) return;
    startTransition(async () => {
      await createMilestone(boardId, name, dueAt || null);
      setName("");
      setDueAt("");
      onChanged();
    });
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="milestones-modal-title">
      <div className="modal-box max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="milestones-modal-title" className="flex items-center gap-2 text-lg font-bold">
              <MilestoneIcon size={19} className="text-primary" />
              Milestones do board
            </h2>
            <p className="mt-1 text-sm text-base-content/55">Acompanhe prazos e veja quantos cards estão vinculados a cada milestone.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); addMilestone(); }}>
          <input className="input input-bordered input-sm flex-1" placeholder="Nova milestone" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
          <input type="date" className="input input-bordered input-sm" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm gap-2"><Plus size={14} /> Criar</button>
        </form>

        <label className="input input-bordered input-sm mt-4 flex items-center gap-2">
          <Search size={14} className="text-base-content/40" />
          <input className="grow" placeholder="Buscar milestones..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {filtered.map((milestone) => {
            const linkedCards = cards.filter((card) => card.milestoneId === milestone.id).length;
            const past = isPast(milestone.dueAt);
            return (
              <div key={milestone.id} className="rounded-xl border border-base-300 bg-base-200/40 p-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${past ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
                    {past ? <Flag size={16} /> : <CalendarClock size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{milestone.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/55">
                      <span>{linkedCards} {linkedCards === 1 ? "card vinculado" : "cards vinculados"}</span>
                      {milestone.dueAt && (
                        <span className={past ? "font-medium text-error" : ""}>
                          {past ? "Prazo vencido em " : "Prazo: "}
                          {new Date(milestone.dueAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {!milestone.dueAt && <span>Sem prazo definido</span>}
                    </div>
                  </div>
                  {past && <span className="badge badge-error badge-outline badge-sm">Vencida</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-base-content/45">Nenhuma milestone encontrada.</p>}
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>Fechar</button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>
  );
}
