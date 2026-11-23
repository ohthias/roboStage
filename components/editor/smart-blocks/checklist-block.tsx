"use client";

import { useEffect, useState } from "react";
import type { NodeKey } from "lexical";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Plus, RotateCcw, Star, X } from "lucide-react";
import type { SmartBlockData } from "../nodes/smart-block-node";
import { InlineText, SmartShell, newId, str, useSmartBlock } from "./shared";

type Item = { id: string; text: string; important?: boolean; checked?: boolean };
type Group = { id: string; title: string; items: Item[] };
type ChecklistData = { modeId?: string; title?: string; groups?: Group[] };

type Template = {
  id: string;
  name: string;
  description: string;
  checklists: { id: string; title: string; items: { id: string; text: string; important?: boolean }[] }[];
};

/**
 * Checklist de competição no espírito do "Confia, mas confere": parte dos
 * modelos do ConfereAí (treino, pré-campeonato, campeonato) e vira uma cópia
 * editável dentro da página.
 */
export function ChecklistBlock({ nodeKey, data }: { nodeKey: NodeKey; data: SmartBlockData }) {
  const { editable, patch, update, remove } = useSmartBlock<ChecklistData>(nodeKey);
  const d = data as ChecklistData;
  const groups = Array.isArray(d.groups) ? d.groups : [];
  const [templates, setTemplates] = useState<Template[] | null>(null);

  useEffect(() => {
    if (groups.length) return;
    import("@/public/data/confere-ai.json").then((m) => {
      const json = (m.default ?? m) as unknown as { modes: Template[] };
      setTemplates(json.modes);
    });
  }, [groups.length]);

  const all = groups.flatMap((g) => g.items);
  const done = all.filter((i) => i.checked).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const importantLeft = all.filter((i) => i.important && !i.checked).length;

  const setItems = (groupId: string, fn: (items: Item[]) => Item[]) =>
    update((prev) => ({
      ...prev,
      groups: (prev.groups ?? []).map((g) => (g.id === groupId ? { ...g, items: fn(g.items) } : g)),
    }));

  const applyTemplate = (t: Template) =>
    patch({
      modeId: t.id,
      title: `Checklist — ${t.name}`,
      groups: t.checklists.map((c) => ({
        id: c.id,
        title: c.title,
        items: c.items.map((i) => ({ id: i.id, text: i.text, important: i.important, checked: false })),
      })),
    });

  if (!groups.length) {
    return (
      <SmartShell icon={<ClipboardCheck size={15} />} label="Checklist de competição" tone="success" editable={editable} onRemove={remove}>
        <p className="mb-2 text-sm text-base-content/60">Confia, mas confere. Escolha um modelo para começar — depois dá para editar os itens.</p>
        {!templates ? (
          <p className="text-sm text-base-content/50">Carregando modelos…</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            {templates.map((t) => (
              <button key={t.id} type="button" disabled={!editable} className="smart-option-card" onClick={() => applyTemplate(t)}>
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-base-content/55">{t.description}</span>
                <span className="mt-1 text-[11px] text-base-content/45">
                  {t.checklists.reduce((n, c) => n + c.items.length, 0)} itens · {t.checklists.length} grupos
                </span>
              </button>
            ))}
            <button
              type="button"
              disabled={!editable}
              className="smart-option-card"
              onClick={() => patch({ modeId: "custom", title: "Checklist", groups: [{ id: newId(), title: "Itens", items: [{ id: newId(), text: "" }] }] })}
            >
              <span className="font-medium">Em branco</span>
              <span className="text-xs text-base-content/55">Monte a sua do zero.</span>
            </button>
          </div>
        )}
      </SmartShell>
    );
  }

  return (
    <SmartShell
      icon={<ClipboardCheck size={15} />}
      label={
        <InlineText value={str(d.title, "Checklist")} onCommit={(title) => patch({ title })} editable={editable} placeholder="Título" className="font-semibold" />
      }
      tone="success"
      editable={editable}
      onRemove={remove}
      actions={
        editable && done > 0 ? (
          <button
            type="button"
            className="smart-icon-btn no-print"
            title="Desmarcar tudo (nova conferência)"
            aria-label="Desmarcar tudo"
            onClick={() =>
              update((prev) => ({
                ...prev,
                groups: (prev.groups ?? []).map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, checked: false })) })),
              }))
            }
          >
            <RotateCcw size={13} />
          </button>
        ) : null
      }
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs tabular-nums text-base-content/60">
          {done}/{all.length}
        </span>
      </div>
      {pct === 100 ? (
        <p className="mb-2 flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 size={15} /> Tudo conferido. Boa sorte!
        </p>
      ) : importantLeft > 0 ? (
        <p className="mb-2 flex items-center gap-1.5 text-sm text-warning-content dark:text-warning">
          <AlertTriangle size={15} /> {importantLeft} {importantLeft === 1 ? "item importante pendente" : "itens importantes pendentes"}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((g) => {
          const gDone = g.items.filter((i) => i.checked).length;
          return (
            <section key={g.id} className="smart-group">
              <div className="mb-1 flex items-center justify-between gap-2">
                <InlineText
                  value={g.title}
                  editable={editable}
                  placeholder="Grupo"
                  className="text-sm font-semibold"
                  onCommit={(title) => update((prev) => ({ ...prev, groups: (prev.groups ?? []).map((x) => (x.id === g.id ? { ...x, title } : x)) }))}
                />
                <span className="shrink-0 text-[11px] text-base-content/45">
                  {gDone}/{g.items.length}
                </span>
              </div>
              <ul className="space-y-0.5">
                {g.items.map((item) => (
                  <li key={item.id} className="group/item flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary mt-1"
                      checked={!!item.checked}
                      disabled={!editable}
                      aria-label={item.text || "Item"}
                      onChange={(e) => setItems(g.id, (items) => items.map((i) => (i.id === item.id ? { ...i, checked: e.target.checked } : i)))}
                    />
                    <div className={`min-w-0 flex-1 ${item.checked ? "text-base-content/45 line-through" : ""}`}>
                      <InlineText
                        value={item.text}
                        editable={editable}
                        placeholder="Novo item"
                        className="text-sm"
                        onCommit={(text) => setItems(g.id, (items) => items.map((i) => (i.id === item.id ? { ...i, text } : i)))}
                      />
                    </div>
                    {editable ? (
                      <span className="flex shrink-0 items-center opacity-100 md:opacity-0 md:group-hover/item:opacity-100">
                        <button
                          type="button"
                          className={`smart-icon-btn ${item.important ? "text-warning" : ""}`}
                          title={item.important ? "Importante" : "Marcar como importante"}
                          aria-pressed={!!item.important}
                          onClick={() => setItems(g.id, (items) => items.map((i) => (i.id === item.id ? { ...i, important: !i.important } : i)))}
                        >
                          <Star size={12} fill={item.important ? "currentColor" : "none"} />
                        </button>
                        <button type="button" className="smart-icon-btn" aria-label="Remover item" onClick={() => setItems(g.id, (items) => items.filter((i) => i.id !== item.id))}>
                          <X size={12} />
                        </button>
                      </span>
                    ) : (
                      item.important && <Star size={12} className="mt-1.5 text-warning" fill="currentColor" />
                    )}
                  </li>
                ))}
              </ul>
              {editable && (
                <button type="button" className="smart-add-btn mt-1" onClick={() => setItems(g.id, (items) => [...items, { id: newId(), text: "" }])}>
                  <Plus size={12} /> Item
                </button>
              )}
            </section>
          );
        })}
      </div>
      {editable && (
        <button
          type="button"
          className="smart-add-btn mt-2"
          onClick={() => patch({ groups: [...groups, { id: newId(), title: "Novo grupo", items: [{ id: newId(), text: "" }] }] })}
        >
          <Plus size={12} /> Grupo
        </button>
      )}
    </SmartShell>
  );
}
