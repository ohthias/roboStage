"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Flag, Loader2, Plus, X } from "lucide-react";
import { createMilestone, getMilestoneAccess, listMilestones } from "@/utils/stagebook/actions/milestones";
import { LABEL_PALETTE } from "@/utils/stagebook/label-colors";
import type { MilestoneDTO } from "@/types/labels";
import { MilestoneChip, fmtMilestoneDate } from "./milestone-chip";
import { usePopover } from "./use-popover";
import { IconButton, ToolButton, ToolInput } from "@/components/stage";

import { unwrapAction } from "@/utils/stagebook/action-result";
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
  // Em equipes, só técnico e mentor criam milestones; os demais só escolhem uma existente.
  const [canCreate, setCanCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let alive = true;
    Promise.all([listMilestones(), getMilestoneAccess()])
      .then(([rows, access]) => {
        if (!alive) return;
        setCatalog(rows);
        setCanCreate(access.canManage);
      })
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
      const m = unwrapAction(await createMilestone({ name, dueAt: dueAt || null, color }));
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
            <IconButton size="xs" label="Remover meta" icon={<X />} onClick={() => pick(null)} />
          )}
        </>
      ) : null}

      {!disabled && (
        <ToolButton
          size="xs"
          variant="ghost"
          icon={<Flag />}
          className="rounded-full border-dashed border-base-content/25 text-base-content/60 hover:text-base-content [&_svg]:size-3"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {value ? "Trocar" : label}
        </ToolButton>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Selecionar milestone"
          className="absolute left-0 top-full z-50 mt-1.5 w-80 max-w-[85vw] rounded-lg border border-base-300 bg-base-100 p-2 text-[13px] shadow-xl"
        >
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {catalog === null ? (
              error ? null : <p className="flex items-center justify-center gap-1.5 py-6 text-xs text-base-content/45"><Loader2 size={12} className="animate-spin" /> Carregando…</p>
            ) : catalog.length === 0 ? (
              <p className="py-6 text-center text-xs text-base-content/45">
                Nenhuma meta ainda{canCreate ? "." : " — peça a um técnico ou mentor para criar."}
              </p>
            ) : (
              catalog.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pick(m)}
                  aria-current={value?.id === m.id ? "true" : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                    value?.id === m.id ? "bg-primary/10" : "hover:bg-base-content/[0.05]"
                  }`}
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

          {canCreate && (
          <div className="mt-2 border-t border-base-300 pt-2">
            {creating ? (
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  create();
                }}
              >
                <ToolInput
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da meta"
                  maxLength={100}
                  aria-label="Nome da meta"
                />
                <ToolInput type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} aria-label="Prazo" />
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
                  <ToolButton size="xs" onClick={() => setCreating(false)}>
                    Cancelar
                  </ToolButton>
                  <ToolButton type="submit" size="xs" variant="primary" disabled={!name.trim() || pending} icon={pending ? <Loader2 className="animate-spin" /> : undefined}>
                    Criar e usar
                  </ToolButton>
                </div>
              </form>
            ) : (
              <ToolButton size="xs" variant="ghost" icon={<Plus />} className="w-full justify-start" onClick={() => setCreating(true)}>
                Nova meta
              </ToolButton>
            )}
          </div>
          )}

          {error && <p role="alert" className="mt-1.5 rounded-md border border-error/30 bg-error/[0.07] px-2 py-1 text-xs text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
