"use client";

import { useEffect, useState, useTransition } from "react";
import {
  BookOpen,
  CalendarClock,
  Check,
  Flag,
  Link2,
  Milestone as MilestoneIcon,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  deleteCard,
  getCardLinks,
  listEventsForCard,
  listPagesForCard,
  toggleCardAssignee,
  toggleCardDocumentLink,
  toggleCardEventLink,
  updateCard,
} from "./actions";
import { ResourceLabels } from "@/components/stagebook/labels/resource-labels";
import { MilestoneSelector } from "@/components/stagebook/labels/milestone-selector";
import { DocIcon } from "@/components/editor/doc-icon";
import type { MilestoneDTO } from "@/types/labels";

import { unwrapAction } from "@/utils/stagebook/action-result";
type Card = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: string;
  milestoneId: string | null;
};
type Assignee = { userId: string; name: string | null; avatarUrl: string | null };
type CardTag = { tagId: string; name: string; color: string | null };
type TeamMember = { userId: string; name: string | null; avatarUrl: string | null; role: string };
type Milestone = { id: string; name: string; color?: string | null; dueAt: string | Date | null };

const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export function CardModal({
  boardId,
  card,
  assignees,
  tags,
  teamMembers,
  isTeamScope,
  milestones,
  onClose,
  onChanged,
}: {
  boardId: string;
  card: Card;
  assignees: Assignee[];
  tags: CardTag[];
  teamMembers: TeamMember[];
  isTeamScope: boolean;
  milestones: Milestone[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [priority, setPriority] = useState(card.priority);
  const [dueAt, setDueAt] = useState(card.dueAt ? card.dueAt.slice(0, 10) : "");
  const [milestoneId, setMilestoneId] = useState(card.milestoneId ?? "");
  const [isPending, startTransition] = useTransition();

  const [availablePages, setAvailablePages] = useState<{ id: string; title: string; icon: string | null }[]>([]);
  const [availableEvents, setAvailableEvents] = useState<{ id: string; title: string; startAt: Date | string }[]>([]);
  const [linkedPageIds, setLinkedPageIds] = useState<string[]>([]);
  const [linkedEventIds, setLinkedEventIds] = useState<string[]>([]);
  const [milestone, setMilestone] = useState<MilestoneDTO | null>(() => {
    const found = milestones.find((m) => m.id === (card.milestoneId ?? ""));
    return found
      ? { id: found.id, name: found.name, color: found.color ?? null, description: null, dueAt: found.dueAt ? new Date(found.dueAt).toISOString() : null }
      : null;
  });

  useEffect(() => {
    listPagesForCard().then(setAvailablePages);
    listEventsForCard().then(setAvailableEvents);
    getCardLinks(card.id).then((links) => {
      setLinkedPageIds(links.documents.map((d) => d.id));
      setLinkedEventIds(links.events.map((e) => e.id));
    });
  }, [card.id]);

  function save() {
    startTransition(async () => {
      unwrapAction(await updateCard(boardId, card.id, { title, description, dueAt: dueAt || null, priority, milestoneId: milestoneId || null }));
      onChanged();
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir este card?")) return;
    startTransition(async () => {
      unwrapAction(await deleteCard(boardId, card.id));
      onChanged();
      onClose();
    });
  }

  function toggleAssignee(userId: string) {
    startTransition(async () => {
      unwrapAction(await toggleCardAssignee(boardId, card.id, userId));
      onChanged();
    });
  }

  function togglePageLink(pageId: string) {
    const isLinked = linkedPageIds.includes(pageId);
    setLinkedPageIds((prev) => (isLinked ? prev.filter((id) => id !== pageId) : [...prev, pageId]));
    startTransition(async () => {
      unwrapAction(await toggleCardDocumentLink(boardId, card.id, pageId));
    });
  }

  function toggleEventLink(eventId: string) {
    const isLinked = linkedEventIds.includes(eventId);
    setLinkedEventIds((prev) => (isLinked ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
    startTransition(async () => {
      unwrapAction(await toggleCardEventLink(boardId, card.id, eventId));
    });
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-h-[80vh] min-h-0 max-w-2xl overflow-y-auto overscroll-contain p-0">
        <div className="border-b border-base-300 bg-base-200/40 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Flag size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <input
                className="w-full border-none bg-transparent p-0 text-xl font-bold tracking-tight outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={save}
                aria-label="Título do card"
              />
              <p className="mt-1 text-xs text-base-content/50">Edite os detalhes e acompanhe o progresso desta tarefa.</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Fechar card">
              <X size={17} />
            </button>
          </div>
          <textarea
            className="textarea textarea-bordered mt-4 w-full bg-base-100 text-sm"
            rows={3}
            placeholder="Adicione uma descrição para contextualizar a tarefa..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={save}
          />
        </div>

        <div className="space-y-5 px-6 py-5">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">Planejamento</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-base-content/60">
                Prioridade
                <select
                  className="select select-bordered select-sm w-full"
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    startTransition(async () => {
                      unwrapAction(await updateCard(boardId, card.id, { title, description, dueAt: dueAt || null, priority: e.target.value, milestoneId: milestoneId || null }));
                      onChanged();
                    });
                  }}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-base-content/60">
                Prazo de entrega
                <input type="date" className="input input-bordered input-sm w-full" value={dueAt} onChange={(e) => setDueAt(e.target.value)} onBlur={save} />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MilestoneIcon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Milestone</h3>
                <p className="mt-0.5 text-xs text-base-content/55">Etapa importante do projeto — compartilhada com páginas, eventos, ThinkLab e LabTest.</p>
              </div>
            </div>
            <MilestoneSelector
              value={milestone}
              onChange={async (m) => {
                setMilestone(m);
                setMilestoneId(m?.id ?? "");
                // updateCard valida as regras da coluna (ex.: milestone exigida).
                unwrapAction(await updateCard(boardId, card.id, { title, description, dueAt: dueAt || null, priority, milestoneId: m?.id ?? null }));
                onChanged();
              }}
            />
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <UserRound size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">Pessoas e tags</h3>
            </div>
            {isTeamScope && (
              <div className="rounded-xl border border-base-300 p-4">
                <p className="mb-2 text-xs font-medium text-base-content/60">Responsáveis</p>
                <div className="flex flex-wrap gap-1.5">
                  {teamMembers.map((member) => {
                    const active = assignees.some((a) => a.userId === member.userId);
                    return (
                      <button key={member.userId} type="button" className={`badge gap-1.5 p-3 ${active ? "badge-primary" : "badge-ghost"}`} onClick={() => toggleAssignee(member.userId)}>
                        {active && <Check size={11} />}
                        {member.name ?? "Sem nome"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3 rounded-xl border border-base-300 p-4">
              <p className="mb-2 text-xs font-medium text-base-content/60">
                Tags — as mesmas de páginas, calendário, ThinkLab e LabTest
              </p>
              <ResourceLabels
                kind="kanban-card"
                resourceId={card.id}
                showMilestone={false}
                initialTags={tags.map((t) => ({ id: t.tagId, name: t.name, color: t.color }))}
                onChange={onChanged}
              />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Link2 size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">Recursos vinculados</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-base-300 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-base-content/60"><BookOpen size={13} /> Páginas</p>
                <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
                  {availablePages.length === 0 ? <span className="text-xs text-base-content/40">Nenhuma página.</span> : availablePages.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 rounded-md px-1 py-1 text-xs hover:bg-base-200">
                      <input type="checkbox" className="checkbox checkbox-xs" checked={linkedPageIds.includes(p.id)} onChange={() => togglePageLink(p.id)} />
                      <span className="flex min-w-0 items-center gap-1 truncate">
                        <DocIcon value={p.icon} size={16} />
                        <span className="truncate">{p.title}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-base-300 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-base-content/60"><CalendarClock size={13} /> Eventos</p>
                <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
                  {availableEvents.length === 0 ? <span className="text-xs text-base-content/40">Nenhum evento.</span> : availableEvents.map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2 rounded-md px-1 py-1 text-xs hover:bg-base-200">
                      <input type="checkbox" className="checkbox checkbox-xs" checked={linkedEventIds.includes(ev.id)} onChange={() => toggleEventLink(ev.id)} />
                      <span className="truncate">{ev.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-base-300 pt-4">
            <button type="button" className="btn btn-ghost btn-sm text-error" onClick={handleDelete}><Trash2 size={14} /> Excluir card</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>Concluído</button>
          </div>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>
  );
}
