"use client";

import { useEffect, useState, useTransition } from "react";
import { BookOpen, CalendarClock, Check, CircleCheck, Trash2 } from "lucide-react";
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
import { ConfirmDialog } from "@/components/stagebook/modal";
import { ChipGroup, DialogNote, Field, FieldGroup, FormDialog } from "@/components/UI/Modal/FormDialog";
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
  { value: "baixa", label: "Baixa", dot: "#64748b" },
  { value: "media", label: "Média", dot: "#2563eb" },
  { value: "alta", label: "Alta", dot: "#ea580c" },
  { value: "urgente", label: "Urgente", dot: "#dc2626" },
];

const initials = (name: string | null) =>
  (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");


export function CardModal({
  boardId,
  card,
  columnName,
  assignees,
  tags,
  completed,
  completionLocked,
  onToggleCompleted,
  teamMembers,
  isTeamScope,
  milestones,
  onClose,
  onChanged,
}: {
  boardId: string;
  card: Card;
  /** Nome da coluna atual, exibido no cabeçalho. */
  columnName?: string;
  assignees: Assignee[];
  tags: CardTag[];
  /** Validação de tarefa concluída. */
  completed: boolean;
  /** A coluna atual conclui tarefas automaticamente: não dá para reabrir aqui. */
  completionLocked: boolean;
  onToggleCompleted: () => void;
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
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  /** Roda uma ação e mostra o erro no modal (ex.: regra da coluna violada). */
  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      }
    });
  }

  function save(patch: Partial<{ priority: string; milestoneId: string | null }> = {}) {
    if (!title.trim()) return;
    run(async () => {
      unwrapAction(
        await updateCard(boardId, card.id, {
          title,
          description,
          dueAt: dueAt || null,
          priority: patch.priority ?? priority,
          milestoneId: patch.milestoneId !== undefined ? patch.milestoneId : milestoneId || null,
        }),
      );
      onChanged();
    });
  }

  function handleDelete() {
    run(async () => {
      unwrapAction(await deleteCard(boardId, card.id));
      setConfirmDelete(false);
      onChanged();
      onClose();
    });
  }

  function toggleAssignee(userId: string) {
    run(async () => {
      unwrapAction(await toggleCardAssignee(boardId, card.id, userId));
      onChanged();
    });
  }

  function togglePageLink(pageId: string) {
    const isLinked = linkedPageIds.includes(pageId);
    setLinkedPageIds((prev) => (isLinked ? prev.filter((id) => id !== pageId) : [...prev, pageId]));
    run(async () => {
      unwrapAction(await toggleCardDocumentLink(boardId, card.id, pageId));
    });
  }

  function toggleEventLink(eventId: string) {
    const isLinked = linkedEventIds.includes(eventId);
    setLinkedEventIds((prev) => (isLinked ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
    run(async () => {
      unwrapAction(await toggleCardEventLink(boardId, card.id, eventId));
    });
  }

  const fmtEventDate = (v: Date | string) =>
    new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <>
      <FormDialog
        onClose={onClose}
        eyebrow={columnName ? `Kanban · ${columnName}` : "Kanban"}
        title={
          <input
            className="-mx-1 w-full rounded-md border-none bg-transparent px-1 text-lg font-bold tracking-tight outline-none transition hover:bg-base-200/70 focus:bg-base-200/70"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== card.title && save()}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            placeholder="Título do card"
            aria-label="Título do card"
          />
        }
        headerSlot={
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`badge badge-sm gap-1 ${completed ? "badge-success badge-soft" : "badge-ghost"}`}>
              <CircleCheck size={11} /> {completed ? "Concluída" : "Em andamento"}
            </span>
            {PRIORITIES.find((p) => p.value === priority) && (
              <span className="badge badge-sm badge-ghost gap-1">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: PRIORITIES.find((p) => p.value === priority)?.dot }}
                />
                {PRIORITIES.find((p) => p.value === priority)?.label}
              </span>
            )}
            <span className="ml-auto text-base-content/45">{isPending ? "Salvando…" : "Alterações salvas automaticamente"}</span>
          </div>
        }
        size="lg"
        busy={confirmDelete}
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1.5 rounded-lg text-error"
              onClick={() => setConfirmDelete(true)}
              disabled={isPending}
            >
              <Trash2 size={14} /> Excluir card
            </button>
            <button type="button" className="btn btn-primary rounded-lg" onClick={onClose}>
              Pronto
            </button>
          </>
        }
      >
        <Field label="Descrição" optional>
          <textarea
            className="textarea textarea-bordered w-full text-sm"
            rows={3}
            placeholder="Contexto, critério de pronto, links úteis…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (card.description ?? "") && save()}
          />
        </Field>

        <label
          className={`flex items-start gap-3 rounded-tl-xl rounded-br-xl border p-3 transition ${
            completed ? "border-success bg-success/5 ring-1 ring-success" : "border-base-300 hover:border-base-content/30"
          } ${completionLocked ? "cursor-default" : "cursor-pointer"}`}
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              completed ? "bg-success text-success-content" : "bg-base-200 text-base-content/60"
            }`}
          >
            <CircleCheck size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Tarefa concluída</span>
            <span id="card-completion-hint" className="block text-xs leading-snug text-base-content/55">
              {completionLocked
                ? "Esta coluna conclui automaticamente todas as tarefas. Mova o card para outra coluna para reabri-lo."
                : completed
                  ? "Validada como concluída — aparece no menu “Concluídas” da coluna."
                  : "Marque quando a tarefa estiver entregue. Ela vai para o menu “Concluídas” da coluna."}
            </span>
          </span>
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-success mt-1"
            checked={completed}
            disabled={completionLocked}
            onChange={onToggleCompleted}
            aria-describedby="card-completion-hint"
          />
        </label>

        <FieldGroup legend="Prioridade">
          <ChipGroup
            ariaLabel="Prioridade"
            value={priority}
            onChange={(value) => {
              setPriority(value);
              save({ priority: value });
            }}
            options={PRIORITIES}
          />
        </FieldGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prazo de entrega" optional>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              onBlur={() => dueAt !== (card.dueAt ? card.dueAt.slice(0, 10) : "") && save()}
            />
          </Field>
          <div>
            <p className="text-sm font-medium">
              Milestone <span className="font-normal text-base-content/45">(opcional)</span>
            </p>
            <div className="mt-1.5">
              <MilestoneSelector
                value={milestone}
                onChange={(m) => {
                  setMilestone(m);
                  setMilestoneId(m?.id ?? "");
                  // updateCard valida as regras da coluna (ex.: milestone exigida).
                  save({ milestoneId: m?.id ?? null });
                }}
              />
            </div>
          </div>
        </div>

        {isTeamScope && (
          <FieldGroup
            legend="Responsáveis"
            aside={assignees.length > 0 && <span className="badge badge-ghost badge-sm font-mono">{assignees.length}</span>}
          >
            <div className="flex flex-wrap gap-1.5">
              {teamMembers.map((member) => {
                const active = assignees.some((a) => a.userId === member.userId);
                return (
                  <button
                    key={member.userId}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAssignee(member.userId)}
                    className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition ${
                      active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-base-300 hover:border-base-content/30"
                    }`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold ${
                        active ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60"
                      }`}
                    >
                      {active ? (
                        <Check size={12} />
                      ) : member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.avatarUrl} alt="" className="size-full object-cover" />
                      ) : (
                        initials(member.name)
                      )}
                    </span>
                    {member.name ?? "Sem nome"}
                  </button>
                );
              })}
            </div>
          </FieldGroup>
        )}

        <FieldGroup legend="Tags" hint="As mesmas de páginas, calendário, ThinkLab e LabTest.">
          <ResourceLabels
            kind="kanban-card"
            resourceId={card.id}
            showMilestone={false}
            initialTags={tags.map((t) => ({ id: t.tagId, name: t.name, color: t.color }))}
            onChange={onChanged}
          />
        </FieldGroup>

        <FieldGroup legend="Recursos vinculados">
          <div className="grid gap-2 sm:grid-cols-2">
            <LinkList
              icon={<BookOpen size={13} />}
              label="Páginas"
              empty="Nenhuma página."
              items={availablePages.map((p) => ({
                id: p.id,
                label: p.title,
                leading: <DocIcon value={p.icon} size={16} />,
              }))}
              selected={linkedPageIds}
              onToggle={togglePageLink}
            />
            <LinkList
              icon={<CalendarClock size={13} />}
              label="Eventos"
              empty="Nenhum evento."
              items={availableEvents.map((ev) => ({
                id: ev.id,
                label: ev.title,
                trailing: <span className="font-mono text-[10px] text-base-content/45">{fmtEventDate(ev.startAt)}</span>,
              }))}
              selected={linkedEventIds}
              onToggle={toggleEventLink}
            />
          </div>
        </FieldGroup>

        {error && <DialogNote tone="error">{error}</DialogNote>}
      </FormDialog>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir card?"
        description={`“${title || card.title}” some do quadro. Páginas e eventos vinculados continuam existindo.`}
        pending={isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function LinkList({
  icon,
  label,
  empty,
  items,
  selected,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  empty: string;
  items: { id: string; label: string; leading?: React.ReactNode; trailing?: React.ReactNode }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const count = items.filter((i) => selected.includes(i.id)).length;
  return (
    <div className="rounded-tl-xl rounded-br-xl border border-base-300 p-1.5">
      <p className="flex items-center gap-1.5 px-1.5 pb-1 pt-0.5 text-xs font-medium text-base-content/60">
        {icon} {label}
        {count > 0 && <span className="badge badge-ghost badge-xs ml-auto font-mono">{count}</span>}
      </p>
      <div className="flex max-h-36 flex-col gap-0.5 overflow-y-auto">
        {items.length === 0 ? (
          <span className="px-1.5 py-1 text-xs text-base-content/40">{empty}</span>
        ) : (
          items.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-base-200"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              {item.leading}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.trailing}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
