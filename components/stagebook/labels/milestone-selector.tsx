"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Flag, Loader2, Plus, X } from "lucide-react";
import { createMilestone, listMilestones } from "@/utils/stagebook/actions/milestones";
import { LABEL_PALETTE } from "@/utils/stagebook/label-colors";
import type { MilestoneDTO } from "@/types/labels";
import { MilestoneChip, fmtMilestoneDate } from "./milestone-chip";
import { usePopover } from "./use-popover";

/**
 * Seletor do catálogo UNIVERSAL de milestones. O pai persiste a escolha
 * (`onChange`), então vale para qualquer ferramenta ou formulário.
 */
export function MilestoneSelector({
  value,
  onChange,
  disabled = false,
  label = "Milestone",
}: {
  value: MilestoneDTO | null;
  onChange: (milestone: MilestoneDTO | null) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
}) {
  const { open, setOpen, ref } = usePopover();
  const [catalog, setCatalog] = useState<MilestoneDTO[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let alive = true;
    listMilestones()
      .then((rows) => alive && setCatalog(rows))
      .catch(() => alive && setError("Não foi possível carregar as milestones."));
    return () => {
      alive = false;
    };
  }, [open]);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo deu errado.");
      }
    });
  }

  function pick(m: MilestoneDTO | null) {
    run(async () => {
      await onChange(m);
      setOpen(false);
    });
  }

  function create() {
    if (!name.trim()) return;
    run(async () => {
      const m = await createMilestone({ name, dueAt: dueAt || null, color });
      setCatalog((prev) => [...(prev ?? []), m]);
      setName("");
      setDueAt("");
      setColor(null);
      setCreating(false);
      await onChange(m);
      setOpen(false);
    });
  }

  return (
    <div className="relative inline-flex flex-wrap items-center gap-1.5" ref={ref}>
      {value ? (
        <>
          <MilestoneChip milestone={value} />
          {!disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-square"
              aria-label="Remover milestone"
              onClick={() => pick(null)}
            >
              <X size={12} />
            </button>
          )}
        </>
      ) : null}

      {!disabled && (
        <button
          type="button"
          className="btn btn-ghost btn-xs gap-1 rounded-full border border-dashed border-base-content/25 text-base-content/60"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Flag size={12} />
          {value ? "Trocar" : label}
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Selecionar milestone"
          className="absolute left-0 top-full z-50 mt-1.5 w-80 max-w-[85vw] rounded-xl border border-base-300 bg-base-100 p-2 shadow-2xl"
        >
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {catalog === null ? (
              <p className="py-6 text-center text-xs text-base-content/45">Carregando…</p>
            ) : catalog.length === 0 ? (
              <p className="py-6 text-center text-xs text-base-content/45">Nenhuma milestone ainda.</p>
            ) : (
              catalog.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pick(m)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-base-200/70"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {value?.id === m.id && <Check size={13} className="text-primary" />}
                  </span>
                  <MilestoneChip milestone={m} showDate={false} />
                  <span className="ml-auto shrink-0 text-[11px] text-base-content/45">
                    {m.dueAt ? fmtMilestoneDate(m.dueAt) : "sem prazo"}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="mt-2 border-t border-base-200 pt-2">
            {creating ? (
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  create();
                }}
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da milestone"
                  maxLength={100}
                  className="input input-bordered input-xs w-full"
                />
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="input input-bordered input-xs w-full"
                  aria-label="Prazo"
                />
                <div className="flex flex-wrap gap-1">
                  {LABEL_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => setColor(c.value)}
                      className={`h-4 w-4 rounded-full border border-black/10 ${
                        color === c.value ? "ring-2 ring-base-content/60 ring-offset-1 ring-offset-base-100" : ""
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-1.5">
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => setCreating(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-xs" disabled={!name.trim() || pending}>
                    {pending ? <Loader2 size={12} className="animate-spin" /> : "Criar e usar"}
                  </button>
                </div>
              </form>
            ) : (
              <button type="button" className="btn btn-ghost btn-xs w-full justify-start gap-1.5" onClick={() => setCreating(true)}>
                <Plus size={12} /> Nova milestone
              </button>
            )}
          </div>

          {error && <p className="mt-1.5 px-1 text-xs text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
