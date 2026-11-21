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
import { IconButton, ToolButton, ToolInput } from "@/components/stage";
import { usePopover } from "./use-popover";

import { unwrapAction } from "@/utils/stagebook/action-result";
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
      const tag = unwrapAction(await createTag(trimmed, newColor));
      setCatalog((prev) => [...(prev ?? []), tag].sort((a, b) => a.name.localeCompare(b.name)));
      setQuery("");
      setNewColor(null);
      await onAdd(tag);
    });
  }

  function patch(tag: TagDTO, input: { name?: string; color?: string | null }) {
    run(async () => {
      const updated = unwrapAction(await updateTag(tag.id, input));
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
          <ToolButton
            size="xs"
            variant="ghost"
            icon={<Plus />}
            className="rounded-full border-dashed border-base-content/25 text-base-content/60 hover:text-base-content [&_svg]:size-3"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            {label}
          </ToolButton>

          {open && (
            <div
              role="dialog"
              aria-label="Selecionar tags"
              className="absolute left-0 top-full z-50 mt-1.5 w-80 max-w-[85vw] rounded-lg border border-base-300 bg-base-100 p-2 text-[13px] shadow-xl"
            >
              <ToolInput
                autoFocus
                icon={<Search />}
                suffix={pending ? <Loader2 size={12} className="animate-spin" /> : undefined}
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
                aria-label="Buscar ou criar tag"
              />

              <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto pr-0.5">
                {catalog === null ? (
                  error ? null : <p className="flex items-center justify-center gap-1.5 py-6 text-xs text-base-content/45"><Loader2 size={12} className="animate-spin" /> Carregando…</p>
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
                        <div className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-base-content/[0.05]">
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
                          <IconButton
                            size="xs"
                            label={`Editar nome e cor de ${tag.name}`}
                            icon={<Palette />}
                            active={editing}
                            onClick={() => {
                              setEditingId(editing ? null : tag.id);
                              setEditName(tag.name);
                            }}
                          />
                        </div>

                        {editing && (
                          <div className="mx-1.5 mb-1.5 space-y-2 rounded-md border border-base-300 bg-base-200/40 p-2">
                            <form
                              className="flex gap-1.5"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (editName.trim() && editName.trim() !== tag.name) patch(tag, { name: editName });
                              }}
                            >
                              <ToolInput
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={40}
                                className="h-7 flex-1"
                                aria-label="Nome da tag"
                              />
                              <ToolButton type="submit" variant="primary" size="xs">
                                Renomear
                              </ToolButton>
                            </form>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
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
                  <div className="mt-1 space-y-2 rounded-md border border-dashed border-base-300 p-2">
                    <button
                      type="button"
                      onClick={create}
                      className="flex w-full items-center gap-2 rounded px-0.5 text-left text-[13px] font-semibold hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
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

              {error && <p role="alert" className="mt-1.5 rounded-md border border-error/30 bg-error/[0.07] px-2 py-1 text-xs text-error">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
