"use client";

import { useEffect, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  createEvent,
  deleteEvent,
  getEventWithDocuments,
  linkDocumentToEvent,
  listPagesForLinking,
  unlinkDocumentFromEvent,
  updateEvent,
} from "./actions";
import { EVENT_TYPES } from "./constants";
import type { CalendarEventClient } from "./calendar-view";

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function EventModal({
  mode,
  initialDate,
  event,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initialDate?: string;
  event?: CalendarEventClient;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState(event?.type ?? "evento");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startAt, setStartAt] = useState(toLocalInput(event?.startAt ?? initialDate ?? new Date().toISOString()));
  const [endAt, setEndAt] = useState(event?.endAt ? toLocalInput(event.endAt) : "");
  const [isPending, startTransition] = useTransition();

  const [availablePages, setAvailablePages] = useState<{ id: string; title: string; icon: string | null }[]>([]);
  const [linkedPageIds, setLinkedPageIds] = useState<string[]>([]);

  useEffect(() => {
    listPagesForLinking().then(setAvailablePages);
    if (mode === "edit" && event) {
      getEventWithDocuments(event.id).then((full) => {
        if (full) setLinkedPageIds(full.documents.map((d) => d.id));
      });
    }
  }, [mode, event]);

  function submit() {
    if (!title.trim()) return;
    startTransition(async () => {
      const payload = {
        title,
        description,
        startAt,
        endAt: endAt || null,
        allDay,
        type,
        location,
      };
      if (mode === "edit" && event) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }
      onSaved();
    });
  }

  function handleDelete() {
    if (!event) return;
    if (!window.confirm("Excluir este evento?")) return;
    startTransition(async () => {
      await deleteEvent(event.id);
      onSaved();
    });
  }

  function toggleLink(pageId: string) {
    if (mode !== "edit" || !event) return;
    const isLinked = linkedPageIds.includes(pageId);
    setLinkedPageIds((prev) => (isLinked ? prev.filter((id) => id !== pageId) : [...prev, pageId]));
    startTransition(async () => {
      if (isLinked) {
        await unlinkDocumentFromEvent(event.id, pageId);
      } else {
        await linkDocumentToEvent(event.id, pageId);
      }
    });
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-w-md">
        <h2 className="text-lg font-semibold">{mode === "edit" ? "Editar evento" : "Novo evento"}</h2>

        <div className="mt-4 flex flex-col gap-3">
          <input
            className="input input-bordered"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <select className="select select-bordered" value={type} onChange={(e) => setType(e.target.value)}>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox checkbox-sm" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
              Dia inteiro
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-base-content/60">
              Início
              <input
                type="datetime-local"
                className="input input-bordered input-sm"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-base-content/60">
              Fim (opcional)
              <input
                type="datetime-local"
                className="input input-bordered input-sm"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </label>
          </div>

          <input
            className="input input-bordered input-sm"
            placeholder="Local (opcional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <textarea
            className="textarea textarea-bordered textarea-sm"
            placeholder="Descrição (opcional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {mode === "edit" && (
            <div>
              <p className="mb-1 text-xs font-medium text-base-content/50">Páginas relacionadas</p>
              <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-base-300 p-2">
                {availablePages.length === 0 ? (
                  <span className="text-xs text-base-content/40">Nenhuma página criada ainda.</span>
                ) : (
                  availablePages.map((page) => (
                    <label key={page.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={linkedPageIds.includes(page.id)}
                        onChange={() => toggleLink(page.id)}
                      />
                      {page.icon ?? "📝"} {page.title}
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-action justify-between">
          {mode === "edit" ? (
            <button type="button" className="btn btn-ghost btn-sm text-error" onClick={handleDelete}>
              <Trash2 size={14} />
              Excluir
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button type="button" className="btn btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={isPending || !title.trim()}>
              Salvar
            </button>
          </div>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>
  );
}
