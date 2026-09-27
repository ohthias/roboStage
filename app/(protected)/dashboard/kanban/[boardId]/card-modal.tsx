"use client";

import { useEffect, useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import {
  deleteCard,
  getCardLinks,
  listEventsForCard,
  listPagesForCard,
  toggleCardAssignee,
  toggleCardDocumentLink,
  toggleCardEventLink,
  toggleCardTag,
  updateCard,
} from "./actions";

type Card = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: string;
};
type Assignee = { userId: string; name: string | null; avatarUrl: string | null };
type CardTag = { tagId: string; name: string };
type TeamMember = { userId: string; name: string | null; avatarUrl: string | null; role: string };

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
  onClose,
  onChanged,
}: {
  boardId: string;
  card: Card;
  assignees: Assignee[];
  tags: CardTag[];
  teamMembers: TeamMember[];
  isTeamScope: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [priority, setPriority] = useState(card.priority);
  const [dueAt, setDueAt] = useState(card.dueAt ? card.dueAt.slice(0, 10) : "");
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const [availablePages, setAvailablePages] = useState<{ id: string; title: string; icon: string | null }[]>([]);
  const [availableEvents, setAvailableEvents] = useState<{ id: string; title: string; startAt: Date | string }[]>([]);
  const [linkedPageIds, setLinkedPageIds] = useState<string[]>([]);
  const [linkedEventIds, setLinkedEventIds] = useState<string[]>([]);

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
      await updateCard(boardId, card.id, { title, description, dueAt: dueAt || null, priority });
      onChanged();
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir este card?")) return;
    startTransition(async () => {
      await deleteCard(boardId, card.id);
      onChanged();
      onClose();
    });
  }

  function toggleAssignee(userId: string) {
    startTransition(async () => {
      await toggleCardAssignee(boardId, card.id, userId);
      onChanged();
    });
  }

  function addTag() {
    const clean = tagInput.trim();
    if (!clean) return;
    startTransition(async () => {
      await toggleCardTag(boardId, card.id, clean);
      setTagInput("");
      onChanged();
    });
  }

  function removeTag(name: string) {
    startTransition(async () => {
      await toggleCardTag(boardId, card.id, name);
      onChanged();
    });
  }

  function togglePageLink(pageId: string) {
    const isLinked = linkedPageIds.includes(pageId);
    setLinkedPageIds((prev) => (isLinked ? prev.filter((id) => id !== pageId) : [...prev, pageId]));
    startTransition(async () => {
      await toggleCardDocumentLink(boardId, card.id, pageId);
    });
  }

  function toggleEventLink(eventId: string) {
    const isLinked = linkedEventIds.includes(eventId);
    setLinkedEventIds((prev) => (isLinked ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
    startTransition(async () => {
      await toggleCardEventLink(boardId, card.id, eventId);
    });
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-w-lg">
        <input
          className="w-full border-none bg-transparent p-0 text-lg font-semibold outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
        />

        <textarea
          className="textarea textarea-bordered mt-3 w-full text-sm"
          rows={3}
          placeholder="Descrição..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={save}
        />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-base-content/60">
            Prioridade
            <select
              className="select select-bordered select-sm"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                startTransition(async () => {
                  await updateCard(boardId, card.id, { title, description, dueAt: dueAt || null, priority: e.target.value });
                  onChanged();
                });
              }}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-base-content/60">
            Prazo
            <input
              type="date"
              className="input input-bordered input-sm"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              onBlur={save}
            />
          </label>
        </div>

        {isTeamScope && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-medium text-base-content/50">Responsáveis</p>
            <div className="flex flex-wrap gap-1.5">
              {teamMembers.map((member) => {
                const active = assignees.some((a) => a.userId === member.userId);
                return (
                  <button
                    key={member.userId}
                    type="button"
                    className={`badge gap-1 ${active ? "badge-primary" : "badge-ghost"}`}
                    onClick={() => toggleAssignee(member.userId)}
                  >
                    {member.name ?? "Sem nome"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-base-content/50">Tags</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span key={t.tagId} className="badge badge-outline gap-1">
                {t.name}
                <button type="button" onClick={() => removeTag(t.name)}>
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              className="input input-xs input-bordered w-28"
              placeholder="+ tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-base-content/50">Páginas</p>
            <div className="flex max-h-28 flex-col gap-1 overflow-y-auto rounded-lg border border-base-300 p-2">
              {availablePages.length === 0 ? (
                <span className="text-xs text-base-content/40">Nenhuma página.</span>
              ) : (
                availablePages.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={linkedPageIds.includes(p.id)}
                      onChange={() => togglePageLink(p.id)}
                    />
                    {p.icon ?? "📝"} {p.title}
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-base-content/50">Eventos</p>
            <div className="flex max-h-28 flex-col gap-1 overflow-y-auto rounded-lg border border-base-300 p-2">
              {availableEvents.length === 0 ? (
                <span className="text-xs text-base-content/40">Nenhum evento.</span>
              ) : (
                availableEvents.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={linkedEventIds.includes(ev.id)}
                      onChange={() => toggleEventLink(ev.id)}
                    />
                    {ev.title}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-action justify-between">
          <button type="button" className="btn btn-ghost btn-sm text-error" onClick={handleDelete}>
            <Trash2 size={14} />
            Excluir card
          </button>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>
  );
}
