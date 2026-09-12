"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { EventModal } from "./event-modal";
import { EVENT_TYPES } from "./constants";

export type CalendarEventClient = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: string;
  status: string;
  color: string | null;
  location: string | null;
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const TYPE_COLOR: Record<string, string> = {
  treino: "#2563eb",
  reuniao: "#7c3aed",
  competicao: "#dc2626",
  deadline: "#ea580c",
  projeto: "#0891b2",
  evento: "#16a34a",
  outro: "#475569",
};

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function CalendarView({
  monthStart,
  gridStart,
  events,
}: {
  monthStart: string;
  gridStart: string;
  events: CalendarEventClient[];
}) {
  const router = useRouter();
  const month = new Date(monthStart);
  const [modalState, setModalState] = useState<
    | { mode: "create"; date: string }
    | { mode: "edit"; event: CalendarEventClient }
    | null
  >(null);

  const days = useMemo(() => {
    const start = new Date(gridStart);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [gridStart]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventClient[]>();
    for (const event of events) {
      const key = toDateKey(event.startAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  function navigate(offset: number) {
    const next = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + offset, 1));
    const param = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
    router.push(`/dashboard/calendar?month=${param}`);
  }

  function goToday() {
    router.push("/dashboard/calendar");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="w-40 text-center text-lg font-semibold capitalize">{formatMonthLabel(month)}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={() => navigate(1)}>
            <ChevronRight size={16} />
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={goToday}>
            Hoje
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm gap-1.5"
          onClick={() => setModalState({ mode: "create", date: new Date().toISOString() })}
        >
          <Plus size={15} />
          Novo evento
        </button>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-base-300">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-b border-base-300 bg-base-200/60 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-base-content/50"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = key === new Date().toISOString().slice(0, 10);

          return (
            <div
              key={key}
              className={`flex min-h-[100px] flex-col gap-1 border-b border-r border-base-300 p-1.5 last:border-r-0 ${
                inMonth ? "bg-base-100" : "bg-base-200/30"
              }`}
              onClick={() => setModalState({ mode: "create", date: day.toISOString() })}
            >
              <span
                className={`text-xs ${
                  isToday
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-semibold text-primary-content"
                    : inMonth
                    ? "text-base-content/60"
                    : "text-base-content/25"
                }`}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white"
                    style={{ backgroundColor: event.color || TYPE_COLOR[event.type] || TYPE_COLOR.outro }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalState({ mode: "edit", event });
                    }}
                  >
                    {event.allDay ? "" : `${new Date(event.startAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} `}
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="px-1.5 text-[10px] text-base-content/40">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {EVENT_TYPES.map((t) => (
          <span key={t.value} className="flex items-center gap-1.5 text-xs text-base-content/50">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_COLOR[t.value] }} />
            {t.label}
          </span>
        ))}
      </div>

      {modalState && (
        <EventModal
          mode={modalState.mode}
          initialDate={modalState.mode === "create" ? modalState.date : undefined}
          event={modalState.mode === "edit" ? modalState.event : undefined}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
