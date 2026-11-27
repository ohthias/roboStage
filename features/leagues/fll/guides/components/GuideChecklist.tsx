"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { ChunkyProgress, StickerTag, cn } from "@/components/stage";

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
        <p className="stage-display flex items-center gap-3 text-4xl tabular-nums">
          {count}
          <span className="-ml-2 text-base text-base-content/45">/{items.length}</span>
          {count === items.length && (
            <StickerTag tone="success" rotate={-4} size="sm">
              Pronto!
            </StickerTag>
          )}
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
      <ChunkyProgress
        value={pct}
        tone="success"
        showValue={false}
        label={<span className="sr-only">Progresso do checklist</span>}
        className="mt-3"
      />

      <ul className="mt-5 space-y-1">
        {items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-3 rounded-tl-lg rounded-br-lg p-2 transition hover:bg-base-200/70 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary/30">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={done[i]}
                onChange={() => update(done.map((d, j) => (j === i ? !d : d)))}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-tl-md rounded-br-md border transition-colors",
                  done[i] ? "border-success bg-success text-success-content" : "border-base-content/25",
                )}
              >
                {done[i] && <Check size={12} strokeWidth={3} />}
              </span>
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
