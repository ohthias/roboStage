"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, Loader2, Palette, Plus, Search, Tag as TagIcon } from "lucide-react";
import {
  createTag,
  listTags,
  updateTag,
} from "@/utils/stagebook/actions/tags";
import { LABEL_PALETTE, resolveLabelColor } from "@/utils/stagebook/label-colors";
import type { TagDTO } from "@/types/labels";
import { LabelColorPicker } from "./color-picker";
import { TagChip } from "./tag-chip";
import { usePopover } from "./use-popover";

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Seletor do catálogo UNIVERSAL de tags. Não sabe onde as tags serão gravadas:
 * o pai decide (`onAdd` / `onRemove`), o que permite usar o mesmo componente
 * em itens já existentes e em formulários de criação.
 *
 * Dentro do popover é possível buscar, criar (já escolhendo a cor), renomear e
 * mudar a cor de fundo de qualquer tag — a mudança vale em todas as ferramentas.
 */
export function TagSelector({
  value,
  onAdd,
  onRemove,
  onTagUpdated,
  chipSize = "sm",
  label = "Tag",
  disabled = false,
}: {
  value: TagDTO[];
  onAdd: (tag: TagDTO) => void | Promise<void>;
  onRemove: (tag: TagDTO) => void | Promise<void>;
  /** Chamado quando nome/cor de uma tag mudam, para o pai atualizar os chips. */
  onTagUpdated?: (tag: TagDTO) => void;
  chipSize?: "xs" | "sm" | "md";
  label?: string;
  disabled?: boolean;
}) {
  const { open, setOpen, ref } = usePopover();
  const [catalog, setCatalog] = useState<TagDTO[] | null>(null);
  const [query, setQuery] = useState("");
  const [newColor, setNewColor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let alive = true;
    listTags()
      .then((rows) => alive && setCatalog(rows))
      .catch(() => alive && setError("Não foi possível carregar as tags."));
    return () => {
      alive = false;
    };
  }, [open]);

  const selectedIds = useMemo(() => new Set(value.map((t) => t.id)), [value]);
  const trimmed = query.trim();
  const filtered = useMemo(() => {
    const tokens = norm(trimmed).split(/\s+/).filter(Boolean);
    return (catalog ?? []).filter((t) => tokens.every((tok) => norm(t.name).includes(tok)));
  }, [catalog, trimmed]);
  const exact = (catalog ?? []).some((t) => norm(t.name) === norm(trimmed));

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

  function toggle(tag: TagDTO) {
    run(async () => {
      if (selectedIds.has(tag.id)) await onRemove(tag);
      else await onAdd(tag);
    });
  }

  function create() {
    if (!trimmed) return;
    run(async () => {
      const tag = await createTag(trimmed, newColor);
      setCatalog((prev) => [...(prev ?? []), tag].sort((a, b) => a.name.localeCompare(b.name)));
      setQuery("");
      setNewColor(null);
      await onAdd(tag);
    });
  }

  function patch(tag: TagDTO, input: { name?: string; color?: string | null }) {
    run(async () => {
      const updated = await updateTag(tag.id, input);
      setCatalog((prev) => (prev ?? []).map((t) => (t.id === updated.id ? updated : t)));
      onTagUpdated?.(updated);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((tag) => (
        <TagChip key={tag.id} tag={tag} size={chipSize} onRemove={disabled ? undefined : () => run(async () => onRemove(tag))} />
      ))}

      {!disabled && (
        <div className="relative" ref={ref}>
          <button
            type="button"
            className="btn btn-ghost btn-xs gap-1 rounded-full border border-dashed border-base-content/25 text-base-content/60"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Plus size={12} />
            {label}
          </button>

          {open && (
            <div
              role="dialog"
              aria-label="Selecionar tags"
              className="absolute left-0 top-full z-50 mt-1.5 w-80 max-w-[85vw] rounded-xl border border-base-300 bg-base-100 p-2 shadow-2xl"
            >
              <label className="flex items-center gap-2 rounded-lg border border-base-300 px-2 py-1.5">
                <Search size={13} className="text-base-content/40" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!exact && trimmed) create();
                      else if (filtered[0]) toggle(filtered[0]);
                    }
                  }}
                  placeholder="Buscar ou criar tag…"
                  maxLength={40}
                  className="w-full bg-transparent text-sm outline-none"
                />
                {pending && <Loader2 size={13} className="animate-spin text-base-content/40" />}
              </label>

              <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto pr-0.5">
                {catalog === null ? (
                  <p className="py-6 text-center text-xs text-base-content/45">Carregando…</p>
                ) : filtered.length === 0 && !trimmed ? (
                  <p className="py-6 text-center text-xs text-base-content/45">
                    Nenhuma tag ainda. Digite um nome para criar a primeira.
                  </p>
                ) : (
                  filtered.map((tag) => {
                    const selected = selectedIds.has(tag.id);
                    const editing = editingId === tag.id;
                    return (
                      <div key={tag.id} className="rounded-lg">
                        <div className="flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-base-200/70">
                          <button
                            type="button"
                            onClick={() => toggle(tag)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            aria-pressed={selected}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                selected ? "border-primary bg-primary text-primary-content" : "border-base-content/25"
                              }`}
                            >
                              {selected && <Check size={11} />}
                            </span>
                            <TagChip tag={tag} size="sm" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-square"
                            title="Editar nome e cor"
                            aria-label={`Editar a tag ${tag.name}`}
                            onClick={() => {
                              setEditingId(editing ? null : tag.id);
                              setEditName(tag.name);
                            }}
                          >
                            <Palette size={13} />
                          </button>
                        </div>

                        {editing && (
                          <div className="mx-1.5 mb-1.5 space-y-2 rounded-lg border border-base-300 bg-base-200/40 p-2">
                            <form
                              className="flex gap-1.5"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (editName.trim() && editName.trim() !== tag.name) patch(tag, { name: editName });
                              }}
                            >
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={40}
                                className="input input-bordered input-xs flex-1"
                                aria-label="Nome da tag"
                              />
                              <button type="submit" className="btn btn-primary btn-xs">
                                Renomear
                              </button>
                            </form>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-base-content/45">
                              Cor de fundo
                            </p>
                            <LabelColorPicker
                              compact
                              value={tag.color ?? resolveLabelColor(null, tag.name)}
                              onChange={(hex) => patch(tag, { color: hex })}
                            />
                            <p className="text-[10px] text-base-content/45">
                              Vale para esta tag em todas as ferramentas.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {trimmed && !exact && (
                  <div className="mt-1 space-y-2 rounded-lg border border-dashed border-base-300 p-2">
                    <button
                      type="button"
                      onClick={create}
                      className="flex w-full items-center gap-2 text-left text-sm"
                    >
                      <TagIcon size={13} className="text-base-content/50" />
                      <span>Criar</span>
                      <TagChip tag={{ name: trimmed, color: newColor }} size="sm" />
                    </button>
                    <div className="flex flex-wrap gap-1">
                      {LABEL_PALETTE.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          title={c.name}
                          onClick={() => setNewColor(c.value)}
                          className={`h-4 w-4 rounded-full border border-black/10 ${
                            newColor === c.value ? "ring-2 ring-base-content/60 ring-offset-1 ring-offset-base-100" : ""
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="mt-1.5 px-1 text-xs text-error">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
