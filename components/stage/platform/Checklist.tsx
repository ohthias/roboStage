"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../lib";
import { ChunkyProgress } from "../core/Data";

/* ------------------------------------------------------------------ */
/*  ChecklistCard — lista marcável com progresso                       */
/*  (checklist do torneio, inspeção do robô, tarefas do treino).       */
/* ------------------------------------------------------------------ */

export type ChecklistItem = { id: string; label: string; hint?: string; done?: boolean };

export function ChecklistCard({
  title,
  items,
  onChange,
  className,
}: {
  title: string;
  items: ChecklistItem[];
  /** Recebe a lista atualizada a cada marcação. */
  onChange?: (items: ChecklistItem[]) => void;
  className?: string;
}) {
  const [list, setList] = useState(items);
  const baseId = useId();
  const done = list.filter((i) => i.done).length;

  const toggle = (id: string) => {
    const next = list.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setList(next);
    onChange?.(next);
  };

  return (
    <section className={cn("stage-paper stage-ink rounded-tl-[30px] rounded-br-[30px] bg-base-100 p-6", className)} aria-labelledby={`${baseId}-t`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`${baseId}-t`} className="text-lg font-black tracking-tight">
          {title}
        </h3>
        <span className="font-mono text-xs tabular-nums text-base-content/50">
          {done}/{list.length}
        </span>
      </div>
      <ChunkyProgress value={done} max={list.length} tone={done === list.length ? "success" : "primary"} showValue={false} className="mt-3" />
      <ul className="mt-4 space-y-1">
        {list.map((item) => (
          <li key={item.id}>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-tl-lg rounded-br-lg px-2 py-2 transition-colors hover:bg-base-200/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
              )}
            >
              <input type="checkbox" className="sr-only" checked={!!item.done} onChange={() => toggle(item.id)} />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-tl-md rounded-br-md border transition-all",
                  item.done ? "scale-105 border-success bg-success text-success-content" : "border-base-content/30 bg-base-100",
                )}
              >
                {item.done && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-sm font-semibold transition-colors", item.done && "text-base-content/45 line-through decoration-2")}>{item.label}</span>
                {item.hint && <span className="block text-xs text-base-content/50">{item.hint}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
