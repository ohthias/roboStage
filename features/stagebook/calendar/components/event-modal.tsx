"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Dumbbell,
  Flag,
  Lightbulb,
  MapPin,
  MoreHorizontal,
  Play,
  Plus,
  Smile,
  Timer,
  Trash2,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  createEvent,
  deleteEvent,
  getEventWithDocuments,
  linkDocumentToEvent,
  listPagesForLinking,
  unlinkDocumentFromEvent,
  updateEvent,
} from "../actions";
import { EVENT_TYPES } from "../lib/constants";
import type { CalendarEventClient } from "./calendar-view";
import { ResourceLabels } from "@/features/stagebook/components/labels/resource-labels";
import { TagSelector } from "@/features/stagebook/components/labels/tag-selector";
import { MilestoneSelector } from "@/features/stagebook/components/labels/milestone-selector";
import { ConfirmDialog } from "@/features/stagebook/components/modal";
import { DialogNote, Field, FieldGroup, FormDialog, OptionCard, ToggleRow } from "@/components/stage/core/FormDialog";
import { DocIcon } from "@/features/stagebook/editor/doc-icon";
import { DocIconPicker } from "@/features/stagebook/editor/doc-icon-picker";
import { toggleResourceTag } from "@/features/stagebook/actions/tags";
import { setResourceMilestone } from "@/features/stagebook/actions/milestones";
import { sessionFromCalendarEvent } from "@/features/stagebook/actions/training";
import type { MilestoneDTO, TagDTO } from "@/features/stagebook/types/labels";
import { unwrapAction } from "@/lib/action-result";

const TYPE_ICON: Record<string, LucideIcon> = {
  treino: Dumbbell,
  reuniao: Users,
  competicao: Trophy,
  deadline: Flag,
  projeto: Lightbulb,
  evento: CalendarDays,
  outro: MoreHorizontal,
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

const fmtWhen = (value: string, allDay: boolean) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", allDay
    ? { weekday: "long", day: "numeric", month: "long" }
    : { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
};

type EventModalProps = {
  mode: "create" | "edit";
  initialDate?: string;
  event?: CalendarEventClient;
  onClose: () => void;
  onSaved: () => void;
};

export function EventModal(props: EventModalProps) {
  return <EventModalContent {...props} />;
}

function EventModalContent({
  mode,
  initialDate,
  event,
  onClose,
  onSaved,
}: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<string>(event?.type ?? "evento");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [icon, setIcon] = useState<string | null>(event?.icon ?? null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startAt, setStartAt] = useState(toLocalInput(event?.startAt ?? initialDate ?? new Date().toISOString()));
  const [endAt, setEndAt] = useState(event?.endAt ? toLocalInput(event.endAt) : "");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Tags/milestone de um evento NOVO ficam aqui até o evento existir.
  const [draftTags, setDraftTags] = useState<TagDTO[]>([]);
  const [draftMilestone, setDraftMilestone] = useState<MilestoneDTO | null>(null);

  const [availablePages, setAvailablePages] = useState<{ id: string; title: string; icon: string | null }[]>([]);
  const [linkedPageIds, setLinkedPageIds] = useState<string[]>([]);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const endBeforeStart = Boolean(endAt) && new Date(endAt).getTime() < new Date(startAt).getTime();
  const typeMeta = EVENT_TYPES.find((t) => t.value === type) ?? EVENT_TYPES[EVENT_TYPES.length - 1];
  const whenLabel = useMemo(() => fmtWhen(startAt, allDay), [startAt, allDay]);

  /** Cria (ou reabre) a sessão de treino deste evento e vai para ela. */
  function openSession(start: boolean) {
    if (!event) return;
    setSessionError(null);
    startTransition(async () => {
      const result = await sessionFromCalendarEvent(event.id, { start });
      if (!result.ok) {
        setSessionError(result.error);
        return;
      }
      router.push(`/dashboard/team/${result.data.teamId}/treinos/${result.data.sessionId}`);
    });
  }

  useEffect(() => {
    listPagesForLinking().then(setAvailablePages);
    if (mode === "edit" && event) {
      getEventWithDocuments(event.id).then((full) => {
        if (full) setLinkedPageIds(full.documents.map((d) => d.id));
      });
    }
  }, [mode, event]);

  function submit() {
    if (!title.trim() || endBeforeStart) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          title,
          description,
          startAt,
          endAt: endAt || null,
          allDay,
          type,
          icon,
          location,
        };
        if (mode === "edit" && event) {
          unwrapAction(await updateEvent(event.id, payload));
        } else {
          const created = unwrapAction(await createEvent(payload));
          for (const tag of draftTags) unwrapAction(await toggleResourceTag("calendar-event", created.id, tag.id));
          if (draftMilestone) unwrapAction(await setResourceMilestone("calendar-event", created.id, draftMilestone.id));
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar o evento.");
      }
    });
  }

  function handleDelete() {
    if (!event) return;
    startTransition(async () => {
      try {
        unwrapAction(await deleteEvent(event.id));
        setConfirmDelete(false);
        onSaved();
      } catch (err) {
        setConfirmDelete(false);
        setError(err instanceof Error ? err.message : "Não foi possível excluir o evento.");
      }
    });
  }

  function toggleLink(pageId: string) {
    if (mode !== "edit" || !event) return;
    const isLinked = linkedPageIds.includes(pageId);
    setLinkedPageIds((prev) => (isLinked ? prev.filter((id) => id !== pageId) : [...prev, pageId]));
    startTransition(async () => {
      if (isLinked) {
        unwrapAction(await unlinkDocumentFromEvent(event.id, pageId));
      } else {
        unwrapAction(await linkDocumentToEvent(event.id, pageId));
      }
    });
  }

  // "Dia inteiro" troca o campo por data pura, mas o valor guardado continua
  // no formato do datetime-local para o payload não mudar.
  const dateInput = (value: string, onChange: (v: string) => void, endOfDay = false) =>
    allDay ? (
      <input
        type="date"
        className="input input-bordered w-full"
        value={value.slice(0, 10)}
        onChange={(e) => onChange(e.target.value ? `${e.target.value}T${endOfDay ? "23:59" : "00:00"}` : "")}
      />
    ) : (
      <input
        type="datetime-local"
        className="input input-bordered w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );

  const canSession = mode === "edit" && event?.teamId && (event.type === "treino" || event.type === "competicao");

  return (
    <>
      <FormDialog
        onClose={onClose}
        eyebrow="Calendário"
        title={mode === "edit" ? "Editar evento" : "Novo evento"}
        description={
          whenLabel ? (
            <span className="inline-flex items-center gap-1.5">
              {icon ? (
                <DocIcon value={icon} size={14} fallback={null} />
              ) : (
                <span className="size-2 rounded-full" style={{ background: typeMeta.color }} aria-hidden />
              )}
              {typeMeta.label} · {whenLabel.charAt(0).toUpperCase() + whenLabel.slice(1)}
            </span>
          ) : undefined
        }
        size="lg"
        busy={isPending || confirmDelete}
        closeOnEscape={!iconPickerOpen}
        onSubmit={submit}
        footer={
          <>
            {mode === "edit" ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1.5 rounded-lg text-error"
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
              >
                <Trash2 size={14} /> Excluir
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost rounded-lg" onClick={onClose} disabled={isPending}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2 rounded-lg"
                disabled={isPending || !title.trim() || endBeforeStart}
              >
                {isPending ? <span className="loading loading-spinner loading-sm" /> : mode === "create" && <Plus size={16} />}
                {mode === "edit" ? "Salvar" : "Criar evento"}
              </button>
            </div>
          </>
        }
      >
        <div>
          <label htmlFor="event-title" className="text-sm font-medium">
            Título do evento
          </label>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              data-icon-trigger
              onClick={() => setIconPickerOpen((v) => !v)}
              aria-expanded={iconPickerOpen}
              aria-label={icon ? "Trocar ícone do evento" : "Escolher ícone do evento"}
              title={icon ? "Trocar ícone" : "Escolher ícone"}
              className={`btn btn-square shrink-0 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md border-base-300 bg-base-100 ${
                iconPickerOpen ? "ring-1 ring-primary" : ""
              }`}
            >
              {icon ? <DocIcon value={icon} size={22} fallback={null} /> : <Smile size={18} className="text-base-content/45" />}
            </button>
            <input
              id="event-title"
              className="input input-bordered w-full"
              placeholder="Ex.: Treino de missões — mesa oficial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              required
              autoFocus
            />
          </div>
          {iconPickerOpen && (
            // O seletor das páginas é um popover absoluto; aqui ele abre em linha
            // para não ser cortado pela rolagem do modal.
            <div className="mt-2 [&>[role=dialog]]:static [&>[role=dialog]]:mt-0 [&>[role=dialog]]:w-full [&>[role=dialog]]:max-w-none [&>[role=dialog]]:rounded-tl-xl [&>[role=dialog]]:rounded-br-xl [&>[role=dialog]]:shadow-none">
              <DocIconPicker value={icon} onChange={setIcon} onClose={() => setIconPickerOpen(false)} />
            </div>
          )}
          {!iconPickerOpen && (
            <p className="mt-1 text-xs text-base-content/55">
              {icon ? (
                <>
                  Ícone aparece no calendário.{" "}
                  <button type="button" className="link link-hover" onClick={() => setIcon(null)}>
                    Remover ícone
                  </button>
                </>
              ) : (
                "Toque no rosto para dar um ícone ao evento."
              )}
            </p>
          )}
        </div>

        <FieldGroup legend="Tipo">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Tipo do evento">
            {EVENT_TYPES.map((t) => {
              const Icon = TYPE_ICON[t.value] ?? MoreHorizontal;
              return (
                <OptionCard
                  key={t.value}
                  compact
                  active={type === t.value}
                  onClick={() => setType(t.value)}
                  color={t.color}
                  icon={<Icon size={16} />}
                  title={t.label}
                />
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup legend="Quando">
          <div className="space-y-3 rounded-tl-xl rounded-br-xl border border-base-300 p-3">
            <ToggleRow
              checked={allDay}
              onChange={setAllDay}
              title="Dia inteiro"
              description="Sem horário — ocupa o dia todo no calendário."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Início">{dateInput(startAt, setStartAt)}</Field>
              <Field label="Fim" optional>
                {dateInput(endAt, setEndAt, true)}
              </Field>
            </div>
            {endBeforeStart && <p className="text-xs text-error">O fim precisa ser depois do início.</p>}
          </div>
        </FieldGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Local" optional>
            <span className="input input-bordered flex w-full items-center gap-2">
              <MapPin size={15} className="shrink-0 text-base-content/45" />
              <input
                className="grow"
                placeholder="Ex.: Laboratório da escola"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </span>
          </Field>
          <Field label="Descrição" optional>
            <textarea
              className="textarea textarea-bordered min-h-10 w-full"
              placeholder="Pauta, o que levar, links…"
              rows={1}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>

        <FieldGroup legend="Tags e milestone" hint="As mesmas de páginas, kanban, ThinkLab e LabTest.">
          {mode === "edit" && event ? (
            <ResourceLabels
              kind="calendar-event"
              resourceId={event.id}
              initialTags={event.tags ?? []}
              initialMilestone={event.milestone ?? null}
              onChange={() => router.refresh()}
            />
          ) : (
            <div className="space-y-2">
              <TagSelector
                value={draftTags}
                onAdd={(tag) => setDraftTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]))}
                onRemove={(tag) => setDraftTags((prev) => prev.filter((t) => t.id !== tag.id))}
                onTagUpdated={(tag) => setDraftTags((prev) => prev.map((t) => (t.id === tag.id ? tag : t)))}
              />
              <MilestoneSelector value={draftMilestone} onChange={setDraftMilestone} />
            </div>
          )}
        </FieldGroup>

        {mode === "edit" && (
          <FieldGroup
            legend="Páginas relacionadas"
            aside={
              linkedPageIds.length > 0 && (
                <span className="badge badge-ghost badge-sm font-mono">{linkedPageIds.length}</span>
              )
            }
          >
            <div className="flex max-h-36 flex-col gap-0.5 overflow-y-auto rounded-tl-xl rounded-br-xl border border-base-300 p-1.5">
              {availablePages.length === 0 ? (
                <span className="px-1.5 py-1 text-xs text-base-content/45">Nenhuma página criada ainda.</span>
              ) : (
                availablePages.map((page) => (
                  <label
                    key={page.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-base-200"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={linkedPageIds.includes(page.id)}
                      onChange={() => toggleLink(page.id)}
                    />
                    <DocIcon value={page.icon} size={16} />
                    <span className="truncate">{page.title}</span>
                  </label>
                ))
              )}
            </div>
          </FieldGroup>
        )}

        {canSession && (
          <div className="flex flex-wrap items-center gap-3 rounded-tl-xl rounded-br-xl border border-primary/25 bg-primary/5 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content">
              <Timer size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                Sessão de {event.type === "competicao" ? "competição" : "treino"}
              </span>
              <span className="block text-xs text-base-content/60">
                Presença, escala e execuções registradas juntas.
              </span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-lg"
                disabled={isPending}
                onClick={() => openSession(false)}
              >
                Planejar
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm gap-1 rounded-lg"
                disabled={isPending}
                onClick={() => openSession(true)}
              >
                <Play size={13} /> Iniciar
              </button>
            </div>
            {sessionError && <p className="w-full text-xs text-error">{sessionError}</p>}
          </div>
        )}

        {error && <DialogNote tone="error">{error}</DialogNote>}
      </FormDialog>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir evento?"
        description={`“${event?.title ?? ""}” sai do calendário de todos. Páginas e cards vinculados continuam existindo.`}
        pending={isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
