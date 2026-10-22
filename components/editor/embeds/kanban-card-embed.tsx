"use client";

import { CalendarClock, Flag, KanbanSquare } from "lucide-react";
import { MilestoneChip } from "@/components/stagebook/labels/milestone-chip";
import { TagChip } from "@/components/stagebook/labels/tag-chip";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { EMBED_HREF } from "./embed-types";

const PRIORITY: Record<string, { label: string; cls: string }> = {
  baixa: { label: "Baixa", cls: "badge-ghost" },
  media: { label: "Média", cls: "badge-info badge-soft" },
  alta: { label: "Alta", cls: "badge-warning badge-soft" },
  urgente: { label: "Urgente", cls: "badge-error badge-soft" },
};

const fmtDue = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export function KanbanCardEmbed({
  refId,
  label,
  onRemove,
}: {
  refId: string;
  label: string;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("kanban-card", refId);
  const priority = data ? (PRIORITY[data.priority] ?? PRIORITY.media) : null;
  const overdue =
    data?.dueAt && new Date(data.dueAt).getTime() < Date.now() && !/conclu/i.test(data.columnName);

  return (
    <EmbedShell
      kind="kanban-card"
      icon={KanbanSquare}
      href={data ? EMBED_HREF["kanban-card"](data.id, data.boardId) : undefined}
      loading={loading}
      error={error}
      fallbackLabel={label}
      onRefresh={refresh}
      onRemove={onRemove}
    >
      {!data ? (
        <EmbedSkeleton />
      ) : (
        <div className="space-y-2.5 p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/55">
            <span className="truncate">{data.boardName}</span>
            <span aria-hidden>›</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-base-content/75">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: data.columnColor ?? "#64748b" }}
              />
              {data.columnName}
            </span>
          </div>

          <h4 className="text-base font-semibold leading-snug">{data.title}</h4>

          {data.description && (
            <p className="line-clamp-3 whitespace-pre-line text-sm text-base-content/65">
              {data.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {priority && (
              <span className={`badge badge-sm gap-1 ${priority.cls}`}>
                <Flag size={11} />
                {priority.label}
              </span>
            )}
            {data.dueAt && (
              <span
                className={`inline-flex items-center gap-1 ${
                  overdue ? "font-medium text-error" : "text-base-content/60"
                }`}
              >
                <CalendarClock size={12} />
                {fmtDue(data.dueAt)}
                {overdue && " · atrasado"}
              </span>
            )}
            {data.milestone && <MilestoneChip milestone={data.milestone} size="xs" />}
            {data.tags.map((tag) => (
              <TagChip key={tag.name} tag={tag} size="xs" />
            ))}
            {data.assignees.length > 0 && (
              <span className="ml-auto flex -space-x-1.5">
                {data.assignees.slice(0, 5).map((a) => (
                  <span
                    key={a.userId}
                    title={a.name ?? undefined}
                    className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-base-100 bg-primary/15 text-[10px] font-semibold text-primary"
                  >
                    {a.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.avatarUrl} alt={a.name ?? ""} className="h-full w-full object-cover" />
                    ) : (
                      (a.name ?? "?").slice(0, 1).toUpperCase()
                    )}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      )}
    </EmbedShell>
  );
}
