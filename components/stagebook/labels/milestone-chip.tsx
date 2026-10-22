"use client";

import { CalendarClock, Flag } from "lucide-react";
import { resolveLabelColor } from "@/utils/stagebook/label-colors";
import type { MilestoneDTO } from "@/types/labels";

export const fmtMilestoneDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export const isMilestoneOverdue = (m: Pick<MilestoneDTO, "dueAt">) =>
  Boolean(m.dueAt && new Date(m.dueAt).getTime() < Date.now());

/** Milestone com a cor escolhida; vencida ganha destaque em vermelho. */
export function MilestoneChip({
  milestone,
  size = "sm",
  showDate = true,
  className = "",
}: {
  milestone: Pick<MilestoneDTO, "name" | "color" | "dueAt">;
  size?: "xs" | "sm";
  showDate?: boolean;
  className?: string;
}) {
  const color = resolveLabelColor(milestone.color, milestone.name);
  const overdue = isMilestoneOverdue(milestone);
  const pad = size === "xs" ? "px-1.5 py-px text-[10px]" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-md border font-medium leading-tight ${pad} ${className}`}
      style={{ borderColor: color, backgroundColor: `${color}1f` }}
      title={milestone.dueAt ? `Prazo: ${fmtMilestoneDate(milestone.dueAt)}` : "Sem prazo"}
      data-milestone-chip
    >
      <Flag size={size === "xs" ? 9 : 11} style={{ color }} className="shrink-0" fill={color} />
      <span className="truncate">{milestone.name}</span>
      {showDate && milestone.dueAt && (
        <span className={`inline-flex shrink-0 items-center gap-0.5 ${overdue ? "text-error" : "text-base-content/55"}`}>
          <CalendarClock size={size === "xs" ? 9 : 10} />
          {new Date(milestone.dueAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      )}
    </span>
  );
}
