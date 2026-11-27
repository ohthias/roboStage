"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";

// Checklist com progresso. O estado fica só neste navegador (localStorage).
export default function GuideChecklist({ items, storageKey }: { items: string[]; storageKey: string }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length === items.length) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restaura progresso salvo após montar
        setDone(saved.map(Boolean));
      }
    } catch {
      /* armazenamento indisponível */
    }
  }, [storageKey, items.length]);

  const update = (next: boolean[]) => {
    setDone(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* armazenamento indisponível */
    }
  };

  const count = done.filter(Boolean).length;
  const pct = Math.round((count / items.length) * 100);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-bold tabular-nums">
          {count}
          <span className="text-base text-base-content/45">/{items.length}</span>
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={() => update(items.map(() => false))}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-base-content/50 hover:text-primary"
          >
            <RotateCcw size={12} />
            limpar
          </button>
        )}
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-base-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do checklist"
      >
        <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-5 space-y-1">
        {items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-3 rounded-tl-lg rounded-br-lg p-2 transition hover:bg-base-200/70">
              <input
                type="checkbox"
                className="sr-only"
                checked={done[i]}
                onChange={() => update(done.map((d, j) => (j === i ? !d : d)))}
              />
              {done[i] ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-base-content/25" />
              )}
              <span
                className={`text-sm leading-6 ${done[i] ? "text-base-content/45 line-through" : "text-base-content/80"}`}
              >
                <span className="mr-1.5 font-mono text-[11px] text-base-content/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[10px] tracking-wide text-base-content/40">
        O progresso fica salvo neste navegador.
      </p>
    </div>
  );
}
