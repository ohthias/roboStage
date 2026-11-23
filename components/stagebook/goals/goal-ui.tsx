"use client";

import { useState } from "react";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { ToolBadge, cn } from "@/components/stage";
import { resolveLabelColor } from "@/utils/stagebook/label-colors";
import type { MilestoneCriterion, MilestoneDTO } from "@/types/labels";
import type { ActionResult } from "@/utils/stagebook/action-result";

/**
 * Peças das METAS (marcos com critérios), compartilhadas pela aba Marcos da
 * equipe e pelo Diário. Kit ferramenta da Stage UI: sóbrio e denso.
 */

/** Dias até o prazo (negativo = atrasado), comparando só as datas. `today` = "YYYY-MM-DD". */
export function daysUntil(dueAt: string | null, today: string | null): number | null {
  if (!dueAt || !today) return null;
  const due = Date.parse(dueAt.slice(0, 10));
  const now = Date.parse(today);
  return Math.round((due - now) / 86_400_000);
}

export function DueBadge({ milestone, today }: { milestone: Pick<MilestoneDTO, "dueAt" | "completedAt">; today: string | null }) {
  if (milestone.completedAt) {
    return (
      <ToolBadge tone="success">
        <CheckCircle2 className="size-3" /> Concluída
      </ToolBadge>
    );
  }
  const d = daysUntil(milestone.dueAt, today);
  if (d === null) return milestone.dueAt ? null : <ToolBadge>Sem prazo</ToolBadge>;
  if (d < 0) return <ToolBadge tone="primary">Atrasada {Math.abs(d)} {Math.abs(d) === 1 ? "dia" : "dias"}</ToolBadge>;
  if (d === 0) return <ToolBadge tone="warning">Vence hoje</ToolBadge>;
  return <ToolBadge tone={d <= 7 ? "warning" : "ink"}>Faltam {d} {d === 1 ? "dia" : "dias"}</ToolBadge>;
}

export function GoalFlag({ milestone, size = 32 }: { milestone: Pick<MilestoneDTO, "name" | "color">; size?: number }) {
  const color = resolveLabelColor(milestone.color, milestone.name);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-tl-lg rounded-br-lg"
      style={{ width: size, height: size, backgroundColor: `${color}26`, color }}
      aria-hidden
    >
      <Flag size={Math.round(size * 0.45)} fill={color} />
    </span>
  );
}

/** Barra de progresso fina com rótulo "3/5 · 60%". */
export function GoalProgressBar({
  progress,
  color,
  className,
}: {
  progress: { done: number; total: number; pct: number } | null;
  color?: string;
  className?: string;
}) {
  if (!progress) return <p className={cn("text-[11px] text-base-content/45", className)}>Sem critérios nem cards para medir o progresso.</p>;
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-[11px] text-base-content/60">
        <span>
          {progress.done}/{progress.total} feitos
        </span>
        <span className="font-mono font-semibold text-base-content/80">{progress.pct}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-base-200"
        role="progressbar"
        aria-valuenow={progress.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da meta"
      >
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${progress.pct}%`, background: color ?? "var(--color-primary)" }} />
      </div>
    </div>
  );
}

/**
 * Checklist de critérios da meta. Marcar chama `onToggle` (qualquer membro);
 * a lista é otimista e volta atrás se a ação falhar.
 */
export function GoalCriteria({
  criteria,
  disabled,
  onToggle,
  onError,
  onChange,
  compact,
}: {
  criteria: MilestoneCriterion[];
  disabled?: boolean;
  onToggle: (criterionId: string, done: boolean) => Promise<ActionResult<MilestoneDTO>>;
  onError?: (message: string) => void;
  onChange?: (milestone: MilestoneDTO) => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState(criteria);
  const [pending, setPending] = useState<string | null>(null);
  const [synced, setSynced] = useState(criteria);
  if (synced !== criteria) {
    // o pai trouxe dados novos (ex.: router.refresh)
    setSynced(criteria);
    setItems(criteria);
  }

  if (items.length === 0) return null;

  const toggle = async (c: MilestoneCriterion) => {
    const next = !c.done;
    setPending(c.id);
    setItems((list) => list.map((x) => (x.id === c.id ? { ...x, done: next } : x)));
    const res = await onToggle(c.id, next);
    setPending(null);
    if (!res.ok) {
      setItems((list) => list.map((x) => (x.id === c.id ? { ...x, done: c.done } : x)));
      onError?.(res.error);
      return;
    }
    setItems(res.data.criteria);
    onChange?.(res.data);
  };

  return (
    <ul className={cn("space-y-0.5", compact && "text-[12px]")}>
      {items.map((c) => (
        <li key={c.id}>
          <label
            className={cn(
              "flex items-start gap-2 rounded-md px-1 py-1 text-[13px]",
              !disabled && "cursor-pointer hover:bg-base-content/[0.04]",
              compact && "text-[12px]",
            )}
          >
            {pending === c.id ? (
              <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-base-content/50" />
            ) : (
              <input
                type="checkbox"
                className="checkbox checkbox-success checkbox-xs mt-0.5 rounded"
                checked={c.done}
                disabled={disabled || pending !== null}
                onChange={() => toggle(c)}
              />
            )}
            <span className={cn("min-w-0 flex-1", c.done && "text-base-content/50 line-through")}>{c.text}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
