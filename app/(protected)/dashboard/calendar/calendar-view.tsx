"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Users, X } from "lucide-react";
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
  teamId: string | null;
  teamName?: string | null;
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
  todayEvents,
  teams,
  selectedTeamIds,
  activeTeamId,
}: {
  monthStart: string;
  gridStart: string;
  events: CalendarEventClient[];
  todayEvents: CalendarEventClient[];
  teams: { id: string; name: string }[];
  selectedTeamIds: string[];
  activeTeamId: string | null;
}) {
  const router = useRouter();
  const month = new Date(monthStart);
  const [modalState, setModalState] = useState<
    | { mode: "create"; date: string }
    | { mode: "edit"; event: CalendarEventClient }
    | null
  >(null);
  const [isTodayPanelOpen, setIsTodayPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const todayKey = new Date().toISOString().slice(0, 10);

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
      const startKey = toDateKey(event.startAt);
      const endKey = event.endAt ? toDateKey(event.endAt) : startKey;
      for (const day of days) {
        const key = day.toISOString().slice(0, 10);
        if (key < startKey || key > endKey) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(event);
      }
    }
    return map;
  }, [days, events]);

  const agendaDateKey = selectedDate ?? todayKey;
  const agendaEvents = selectedDate ? eventsByDay.get(selectedDate) ?? [] : todayEvents;
  const viewAnchor = new Date(`${selectedDate ?? month.toISOString().slice(0, 10)}T12:00:00Z`);
  const weekStart = new Date(viewAnchor);
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setUTCDate(day.getUTCDate() + index);
    return day;
  });

  function toggleTeam(teamId: string) {
    const nextTeamIds = selectedTeamIds.includes(teamId)
      ? selectedTeamIds.filter((id) => id !== teamId)
      : [...selectedTeamIds, teamId];
    const params = new URLSearchParams();
    const currentMonth = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
    params.set("month", currentMonth);
    if (nextTeamIds.length > 0) params.set("teams", nextTeamIds.join(","));
    router.push(`/dashboard/calendar?${params.toString()}`);
  }

  function navigate(offset: number) {
    const current = calendarView === "month" ? month : viewAnchor;
    const next = new Date(current);
    if (calendarView === "month") {
      next.setUTCDate(1);
      next.setUTCMonth(next.getUTCMonth() + offset);
    } else if (calendarView === "week") {
      next.setUTCDate(next.getUTCDate() + offset * 7);
    } else {
      next.setUTCDate(next.getUTCDate() + offset);
    }
    const param = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
    setSelectedDate(calendarView === "month" ? null : next.toISOString().slice(0, 10));
    const params = new URLSearchParams({ month: param });
    if (selectedTeamIds.length > 0) params.set("teams", selectedTeamIds.join(","));
    router.push(`/dashboard/calendar?${params.toString()}`);
  }

  function goToday() {
    setSelectedDate(calendarView === "month" ? null : todayKey);
    const params = new URLSearchParams();
    if (selectedTeamIds.length > 0) params.set("teams", selectedTeamIds.join(","));
    router.push(`/dashboard/calendar${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="min-w-40 text-center text-lg font-semibold capitalize">
            {calendarView === "month"
              ? formatMonthLabel(month)
              : calendarView === "week"
              ? `${weekDays[0].getUTCDate()} - ${weekDays[6].getUTCDate()} ${new Intl.DateTimeFormat("pt-BR", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(weekDays[6])}`
              : new Intl.DateTimeFormat("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(viewAnchor)}
          </h2>
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="join">
          {(
            [
              ["month", "Mensal"],
              ["week", "Semanal"],
              ["day", "Diária"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm join-item ${calendarView === value ? "btn-primary" : "btn-outline"}`}
              onClick={() => setCalendarView(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {teams.length > 0 && (
            <details className="dropdown dropdown-end">
              <summary className="btn btn-outline btn-sm list-none gap-1.5">
                <Users size={15} />
                Eventos das equipes
              </summary>
              <div className="dropdown-content z-20 mt-2 w-72 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">
                <p className="mb-2 text-xs font-semibold text-base-content/60">
                  Incluir eventos das equipes
                </p>
                <div className="flex flex-col gap-2">
                  {teams.map((team) => (
                    <label key={team.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedTeamIds.includes(team.id)}
                        onChange={() => toggleTeam(team.id)}
                      />
                      <span className="truncate">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </details>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm gap-1.5"
            onClick={() => {
              setSelectedDate(null);
              setIsTodayPanelOpen(true);
            }}
            aria-haspopup="dialog"
            aria-expanded={isTodayPanelOpen}
          >
            <CalendarClock size={15} />
            Agenda de hoje
          </button>
        </div>
      </div>

      <div className={`flex items-start gap-4 ${isTodayPanelOpen ? "flex-col xl:flex-row" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className={`grid grid-cols-7 overflow-hidden rounded-xl border border-base-300 ${calendarView !== "month" ? "hidden" : ""}`}>
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
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;

              return (
                <div
                  key={key}
                  className={`flex min-h-[100px] cursor-pointer flex-col gap-1 border-b border-r border-base-300 p-1.5 last:border-r-0 ${
                    inMonth ? "bg-base-100" : "bg-base-200/30"
                  } ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                  onClick={() => {
                    setSelectedDate(key);
                    setIsTodayPanelOpen(true);
                  }}
                  onDoubleClick={() => setModalState({ mode: "create", date: day.toISOString() })}
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
                      (() => {
                        const eventStartKey = toDateKey(event.startAt);
                        const eventEndKey = event.endAt ? toDateKey(event.endAt) : eventStartKey;
                        const isFirstSegment = key === eventStartKey || key === days[0].toISOString().slice(0, 10);
                        const isLastSegment = key >= eventEndKey;

                        return (
                          <button
                            key={event.id}
                            type="button"
                            className={`-mx-1.5 w-[calc(100%+0.75rem)] truncate px-1.5 py-0.5 text-left text-[11px] font-medium text-white ${
                              isFirstSegment ? "rounded-l" : "rounded-l-none"
                            } ${isLastSegment ? "rounded-r" : "rounded-r-none"}`}
                            style={{ backgroundColor: event.color || TYPE_COLOR[event.type] || TYPE_COLOR.outro }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!event.teamId || event.teamId === activeTeamId) {
                                setModalState({ mode: "edit", event });
                              }
                            }}
                          >
                            {isFirstSegment && !event.allDay
                              ? `${new Date(event.startAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} `
                              : ""}
                            {event.title}
                          </button>
                        );
                      })()
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

          {calendarView !== "month" && (
            <div className="overflow-hidden rounded-xl border border-base-300">
              <div className={`grid ${calendarView === "week" ? "grid-cols-7" : "grid-cols-1"}`}>
                {(calendarView === "week" ? weekDays : [viewAnchor]).map((day) => {
                  const key = day.toISOString().slice(0, 10);
                  const selected = key === selectedDate;
                  const dayEvents = eventsByDay.get(key) ?? [];

                  return (
                    <div
                      key={key}
                      className={`min-h-[360px] border-base-300 p-3 ${calendarView === "week" ? "border-r last:border-r-0" : ""} ${
                        selected ? "bg-primary/5" : "bg-base-100"
                      }`}
                      onClick={() => {
                        setSelectedDate(key);
                        setIsTodayPanelOpen(true);
                      }}
                      onDoubleClick={() => setModalState({ mode: "create", date: day.toISOString() })}
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-base-300 pb-2">
                        <span className="text-sm font-semibold capitalize">
                          {new Intl.DateTimeFormat("pt-BR", {
                            weekday: "short",
                            day: "numeric",
                            month: calendarView === "day" ? "long" : "short",
                            timeZone: "UTC",
                          }).format(day)}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={(event) => {
                            event.stopPropagation();
                            setModalState({ mode: "create", date: day.toISOString() });
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {dayEvents.length === 0 ? (
                          <p className="py-8 text-center text-xs text-base-content/40">Nenhum evento</p>
                        ) : (
                          dayEvents.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              className="rounded-lg p-2 text-left text-xs font-medium text-white"
                              style={{ backgroundColor: event.color || TYPE_COLOR[event.type] || TYPE_COLOR.outro }}
                              onClick={(clickEvent) => {
                                clickEvent.stopPropagation();
                                if (!event.teamId || event.teamId === activeTeamId) {
                                  setModalState({ mode: "edit", event });
                                }
                              }}
                            >
                              <span className="block truncate">{event.title}</span>
                              <span className="mt-1 block text-[10px] opacity-80">
                                {event.allDay
                                  ? "Dia inteiro"
                                  : new Date(event.startAt).toLocaleTimeString("pt-BR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isTodayPanelOpen && (
          <aside
            className="flex w-full shrink-0 flex-col rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm xl:w-96"
            role="dialog"
            aria-modal="false"
            aria-labelledby="today-agenda-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-base-300 pb-4">
              <div>
                <h2 id="today-agenda-title" className="text-lg font-semibold">
                  Agenda do dia
                </h2>
                <p className="mt-1 text-sm text-base-content/60">
                  {new Intl.DateTimeFormat("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(new Date(`${agendaDateKey}T12:00:00`))}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setIsTodayPanelOpen(false)}
                aria-label="Fechar agenda de hoje"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex max-h-[calc(100vh-13rem)] flex-col gap-2 overflow-y-auto">
              {agendaEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-base-300 px-4 py-8 text-center">
                  <CalendarClock className="mx-auto mb-2 text-base-content/30" size={28} />
                  <p className="text-sm font-medium">Nada agendado para este dia</p>
                  <p className="mt-1 text-xs text-base-content/50">Você pode criar um evento com dois cliques na data.</p>
                </div>
              ) : (
                agendaEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="rounded-xl border border-base-300 p-3 text-left transition-colors hover:bg-base-200/60"
                    onClick={() => {
                      if (!event.teamId || event.teamId === activeTeamId) {
                        setIsTodayPanelOpen(false);
                        setModalState({ mode: "edit", event });
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: event.color || TYPE_COLOR[event.type] || TYPE_COLOR.outro }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{event.title}</span>
                        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/55">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {event.allDay
                              ? "Dia inteiro"
                              : new Date(event.startAt).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                            {event.endAt &&
                              ` - ${new Date(event.endAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} />
                              {event.location}
                            </span>
                          )}
                        </span>
                        {event.description && (
                          <span className="mt-2 block line-clamp-2 text-xs text-base-content/65">
                            {event.description}
                          </span>
                        )}
                        {event.teamName && (
                          <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {event.teamName}
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}
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
