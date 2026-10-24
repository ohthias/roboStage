"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";
import { EVENT_TYPES } from "@/app/(protected)/dashboard/calendar/constants";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { EMBED_HREF } from "./embed-types";

// Mesmas cores do calendar-view.tsx.
export const EVENT_TYPE_COLOR: Record<string, string> = {
  treino: "#2563eb",
  reuniao: "#7c3aed",
  competicao: "#dc2626",
  deadline: "#ea580c",
  projeto: "#0891b2",
  evento: "#16a34a",
  outro: "#475569",
};

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export function CalendarEventEmbed({
  refId,
  label,
  onRemove,
}: {
  refId: string;
  label: string;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("calendar-event", refId);

  const color = data ? (data.color ?? EVENT_TYPE_COLOR[data.type] ?? EVENT_TYPE_COLOR.outro) : "#475569";
  const typeLabel = data ? EVENT_TYPES.find((t) => t.value === data.type)?.label ?? data.type : "";
  const start = data ? new Date(data.startAt) : null;
  const sameDay = data?.endAt && start && new Date(data.endAt).toDateString() === start.toDateString();

  let when = "";
  if (data) {
    if (data.allDay) {
      when = data.endAt && !sameDay ? `${longDate(data.startAt)} → ${longDate(data.endAt)}` : longDate(data.startAt);
    } else if (data.endAt && sameDay) {
      when = `${longDate(data.startAt)}, ${time(data.startAt)} – ${time(data.endAt)}`;
    } else if (data.endAt) {
      when = `${longDate(data.startAt)} ${time(data.startAt)} → ${longDate(data.endAt)} ${time(data.endAt)}`;
    } else {
      when = `${longDate(data.startAt)}, ${time(data.startAt)}`;
    }
  }

  return (
    <EmbedShell
      kind="calendar-event"
      icon={CalendarDays}
      href={EMBED_HREF["calendar-event"](refId)}
      loading={loading}
      error={error}
      fallbackLabel={label}
      onRefresh={refresh}
      onRemove={onRemove}
    >
      {!data || !start ? (
        <EmbedSkeleton />
      ) : (
        <div className="flex gap-4 p-4">
          <div
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: color }}
          >
            <span className="text-2xl font-bold leading-none">{start.getDate()}</span>
            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide opacity-90">
              {start.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold leading-snug">{data.title}</h4>
              <span
                className="badge badge-sm border-0 text-white"
                style={{ backgroundColor: color }}
              >
                {typeLabel}
              </span>
              {data.status && data.status !== "confirmado" && (
                <span className="badge badge-ghost badge-sm capitalize">{data.status}</span>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-sm text-base-content/65">
              <Clock size={13} className="shrink-0" />
              <span className="first-letter:uppercase">{when}</span>
            </p>

            {data.location && (
              <p className="flex items-center gap-1.5 text-sm text-base-content/65">
                <MapPin size={13} className="shrink-0" />
                <span className="truncate">{data.location}</span>
              </p>
            )}

            {data.description && (
              <p className="line-clamp-3 whitespace-pre-line text-sm text-base-content/60">
                {data.description}
              </p>
            )}
          </div>
        </div>
      )}
    </EmbedShell>
  );
}
