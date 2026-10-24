"use client";

import { MilestoneChip } from "@/components/stagebook/labels/milestone-chip";
import { CalendarDays, Clock3, List, Table2 } from "lucide-react";

type Column = { id: string; name: string; color: string | null };
type Card = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: string;
  milestoneId: string | null;
};
type Milestone = { id: string; name: string; color?: string | null; dueAt: string | Date | null };

function formatDate(value: string | Date | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "Sem prazo";
}

export function BoardAlternativeViews({
  mode,
  columns,
  cards,
  milestones,
  onSelectCard,
}: {
  mode: "list" | "calendar" | "timeline" | "table";
  columns: Column[];
  cards: Card[];
  milestones: Milestone[];
  onSelectCard: (cardId: string) => void;
}) {
  const columnById = new Map(columns.map((column) => [column.id, column]));
  const milestoneById = new Map(milestones.map((milestone) => [milestone.id, milestone]));
  const sortedCards = [...cards].sort((a, b) => {
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  if (mode === "table") {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
        <table className="table">
          <thead><tr><th>Tarefa</th><th>Coluna</th><th>Prioridade</th><th>Prazo</th><th>Milestone</th></tr></thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="cursor-pointer hover:bg-base-200/60" onClick={() => onSelectCard(card.id)}>
                <td className="max-w-xs truncate font-medium">{card.title}</td>
                <td>{columnById.get(card.columnId)?.name ?? "Sem coluna"}</td>
                <td><span className="badge badge-ghost">{card.priority}</span></td>
                <td>{formatDate(card.dueAt)}</td>
                <td>{card.milestoneId && milestoneById.get(card.milestoneId) ? <MilestoneChip milestone={{ ...milestoneById.get(card.milestoneId)!, color: milestoneById.get(card.milestoneId)!.color ?? null, dueAt: null }} showDate={false} size="xs" /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {cards.length === 0 && <p className="p-8 text-center text-sm text-base-content/45">Nenhum card no board.</p>}
      </div>
    );
  }

  if (mode === "calendar") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCards.map((card) => (
          <button key={card.id} type="button" onClick={() => onSelectCard(card.id)} className="rounded-xl border border-base-300 bg-base-100 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
            <div className="flex items-center gap-2 text-xs text-base-content/50"><CalendarDays size={14} /> {formatDate(card.dueAt)}</div>
            <p className="mt-3 font-medium">{card.title}</p>
            <p className="mt-1 text-xs text-base-content/55">{columnById.get(card.columnId)?.name ?? "Sem coluna"} · {card.priority}</p>
          </button>
        ))}
        {cards.length === 0 && <p className="col-span-full p-8 text-center text-sm text-base-content/45">Nenhum card com prazo.</p>}
      </div>
    );
  }

  if (mode === "timeline") {
    return (
      <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5">
        {sortedCards.map((card) => (
          <button key={card.id} type="button" onClick={() => onSelectCard(card.id)} className="group flex w-full items-start gap-4 text-left">
            <div className="flex w-28 shrink-0 items-center gap-1.5 pt-1 text-xs text-base-content/50"><Clock3 size={14} />{formatDate(card.dueAt)}</div>
            <div className="relative flex-1 border-l-2 border-primary/25 pb-4 pl-5 before:absolute before:-left-[7px] before:top-1 before:size-3 before:rounded-full before:bg-primary">
              <p className="font-medium group-hover:text-primary">{card.title}</p>
              <p className="mt-1 text-xs text-base-content/55">{columnById.get(card.columnId)?.name ?? "Sem coluna"} · {card.priority}{card.milestoneId ? ` · ${milestoneById.get(card.milestoneId)?.name ?? "Milestone"}` : ""}</p>
            </div>
          </button>
        ))}
        {cards.length === 0 && <p className="p-8 text-center text-sm text-base-content/45">Nenhum card para exibir.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <button key={card.id} type="button" onClick={() => onSelectCard(card.id)} className="flex w-full items-center gap-4 rounded-xl border border-base-300 bg-base-100 p-4 text-left hover:border-primary/40">
          <List size={16} className="shrink-0 text-base-content/40" />
          <span className="min-w-0 flex-1 truncate font-medium">{card.title}</span>
          <span className="hidden text-xs text-base-content/50 sm:inline">{columnById.get(card.columnId)?.name}</span>
          <span className="badge badge-ghost badge-sm">{card.priority}</span>
          <span className="text-xs text-base-content/50">{formatDate(card.dueAt)}</span>
        </button>
      ))}
      {cards.length === 0 && <p className="p-8 text-center text-sm text-base-content/45">Nenhum card no board.</p>}
    </div>
  );
}

export const VIEW_OPTIONS = [
  { value: "kanban", label: "Kanban", icon: Table2 },
  { value: "list", label: "Lista", icon: List },
  { value: "calendar", label: "Calendário", icon: CalendarDays },
  { value: "timeline", label: "Timeline", icon: Clock3 },
] as const;
