"use client";

// ---------------------------------------------------------------------------
// Painel personalizado do laboratório Anatix: o usuário monta os blocos
// (gráficos e tabelas), escolhe métricas, janela e tamanho, reordena
// arrastando e aplica modelos prontos. A lista fica salva no laboratório.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  EllipsisVertical,
  GripVertical,
  LayoutDashboard,
  LayoutGrid,
  Pencil,
  Plus,
  Sparkles,
  Timer,
  Trash2,
  Upload,
} from "lucide-react";
import { useChartTheme } from "@/components/labtest/charts/chart-theme";
import { ANATIX_MAX_WIDGETS, type AnatixWidget, type AnatixWidgetSize } from "@/types/anatix.types";
import {
  DASHBOARD_PRESETS,
  WIDGET_SIZES,
  WIDGET_SPEC,
  WIDGET_WINDOWS,
  newWidgetId,
  normalizeDashboard,
} from "@/utils/labtest/anatix/dashboard";
import type { AnatixStore } from "@/utils/labtest/anatix/store";
import { AnatixWidgetView, type WidgetContext } from "./AnatixWidgetView";
import { AnatixWidgetEditor, WIDGET_ICON } from "./AnatixWidgetEditor";

const SPAN: Record<AnatixWidgetSize, string> = {
  sm: "",
  md: "md:col-span-2",
  lg: "md:col-span-2 xl:col-span-3",
  full: "md:col-span-2 xl:col-span-4",
};

function windowLabel(sec: number | null) {
  return WIDGET_WINDOWS.find((w) => w.value === sec)?.label ?? (sec ? `${sec} s` : "Tudo");
}

export function AnatixDashboard({
  store,
  version,
  widgets,
  onChange,
  fileName,
}: {
  store: AnatixStore;
  version: number;
  widgets: AnatixWidget[];
  onChange: (widgets: AnatixWidget[]) => void;
  fileName: string;
}) {
  const { ref, theme } = useChartTheme();
  const ctx: WidgetContext = { store, version, theme, fileName };
  const editorRef = useRef<HTMLDialogElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<{ key: number; widget: AnatixWidget | null } | null>(null);
  const [arranging, setArranging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const full = widgets.length >= ANATIX_MAX_WIDGETS;
  const names = [...store.metrics.keys()].sort();

  // Abre o editor depois que ele monta (é remontado a cada abertura via `key`).
  useEffect(() => {
    if (editing) editorRef.current?.showModal();
  }, [editing]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(id);
  }, [notice]);

  function openEditor(widget: AnatixWidget | null) {
    if (!widget && full) return setNotice(`O painel aceita até ${ANATIX_MAX_WIDGETS} blocos.`);
    setEditing({ key: Date.now(), widget });
  }

  function save(widget: AnatixWidget) {
    const exists = widgets.some((w) => w.id === widget.id);
    onChange(exists ? widgets.map((w) => (w.id === widget.id ? widget : w)) : [...widgets, widget]);
  }

  function update(id: string, patch: Partial<AnatixWidget>) {
    onChange(widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  function remove(id: string) {
    onChange(widgets.filter((w) => w.id !== id));
  }

  function duplicate(id: string) {
    if (full) return setNotice(`O painel aceita até ${ANATIX_MAX_WIDGETS} blocos.`);
    const i = widgets.findIndex((w) => w.id === id);
    const copy = { ...widgets[i], id: newWidgetId(), title: `${widgets[i].title} (cópia)` };
    onChange([...widgets.slice(0, i + 1), copy, ...widgets.slice(i + 1)]);
  }

  function move(id: string, delta: number) {
    const i = widgets.findIndex((w) => w.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= widgets.length) return;
    const next = [...widgets];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = widgets.findIndex((w) => w.id === dragId);
    const to = widgets.findIndex((w) => w.id === targetId);
    const next = [...widgets];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function applyPreset(key: string, mode: "replace" | "append") {
    const preset = DASHBOARD_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const built = preset.build(names);
    if (mode === "replace" && widgets.length && !confirm("Trocar os blocos atuais pelo modelo?")) return;
    const next = (mode === "replace" ? built : [...widgets, ...built]).slice(0, ANATIX_MAX_WIDGETS);
    onChange(next);
    if (!names.length) setNotice("Modelo aplicado. Os blocos se preenchem assim que as métricas chegarem.");
  }

  function setAllWindows(sec: number | null) {
    onChange(widgets.map((w) => (WIDGET_SPEC[w.type].windowed ? { ...w, windowSec: sec } : w)));
  }

  function exportLayout() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ anatixDashboard: 1, widgets }, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}-painel.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importLayout(file: File) {
    try {
      const data = JSON.parse(await file.text());
      const imported = normalizeDashboard(Array.isArray(data) ? data : data?.widgets).map((w) => ({ ...w, id: newWidgetId() }));
      if (!imported.length) return setNotice("O arquivo não tem blocos de painel válidos.");
      if (widgets.length && !confirm(`Trocar os ${widgets.length} blocos atuais pelos ${imported.length} do arquivo?`)) return;
      onChange(imported);
      setNotice(`${imported.length} blocos importados.`);
    } catch {
      setNotice("Não foi possível ler o arquivo de layout.");
    }
  }

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <LayoutDashboard size={16} className="text-primary" />
          <span className="font-bold">Meu painel</span>
          <span className="text-xs text-base-content/50">
            {widgets.length}/{ANATIX_MAX_WIDGETS} blocos · salvo automaticamente
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openEditor(null)} disabled={full}>
            <Plus size={15} /> Adicionar bloco
          </button>

          <div className="dropdown dropdown-end">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-sm border-base-300">
              <Sparkles size={14} /> Modelos
            </button>
            <ul tabIndex={0} className="dropdown-content menu z-20 mt-1 w-80 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
              {DASHBOARD_PRESETS.map((p) => (
                <li key={p.key}>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="text-xs text-base-content/55">{p.description}</span>
                    <span className="mt-1 flex gap-1">
                      <button type="button" className="btn btn-xs btn-primary" onClick={() => applyPreset(p.key, "replace")}>
                        Usar
                      </button>
                      <button type="button" className="btn btn-xs btn-ghost border-base-300" onClick={() => applyPreset(p.key, "append")} disabled={full}>
                        Somar ao painel
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {widgets.length > 0 && (
            <>
              <select
                className="select select-sm select-bordered w-auto"
                value=""
                aria-label="Janela de tempo de todos os blocos"
                onChange={(e) => {
                  if (e.target.value) setAllWindows(e.target.value === "all" ? null : Number(e.target.value));
                }}
              >
                <option value="" disabled>Janela de todos…</option>
                {WIDGET_WINDOWS.map((w) => (
                  <option key={w.label} value={w.value ?? "all"}>{w.label}</option>
                ))}
              </select>
              <button
                type="button"
                className={`btn btn-sm ${arranging ? "btn-neutral" : "btn-ghost border-base-300"}`}
                onClick={() => setArranging((a) => !a)}
              >
                {arranging ? <Check size={14} /> : <LayoutGrid size={14} />}
                {arranging ? "Concluir" : "Organizar"}
              </button>
            </>
          )}

          <div className="dropdown dropdown-end">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-sm btn-square border-base-300" aria-label="Mais opções do painel">
              <EllipsisVertical size={15} />
            </button>
            <ul tabIndex={0} className="dropdown-content menu z-20 mt-1 w-56 rounded-box border border-base-300 bg-base-100 p-1.5 text-sm shadow-lg">
              <li>
                <button type="button" onClick={exportLayout} disabled={!widgets.length}>
                  <Download size={14} /> Exportar layout (.json)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => importRef.current?.click()}>
                  <Upload size={14} /> Importar layout
                </button>
              </li>
              {widgets.length > 0 && (
                <li>
                  <button
                    type="button"
                    className="text-error"
                    onClick={() => confirm("Remover todos os blocos do painel?") && onChange([])}
                  >
                    <Trash2 size={14} /> Limpar painel
                  </button>
                </li>
              )}
            </ul>
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importLayout(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {notice && (
        <div role="status" className="alert alert-info alert-soft py-2 text-sm">
          {notice}
        </div>
      )}

      {widgets.length === 0 ? (
        <EmptyDashboard onAdd={() => openEditor(null)} onPreset={(key) => applyPreset(key, "replace")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {widgets.map((w, i) => {
            const spec = WIDGET_SPEC[w.type];
            const Icon = WIDGET_ICON[w.type];
            const metricsLabel =
              spec.metrics.max === 0
                ? spec.group === "table" || w.type === "state-pie"
                  ? (w.options.machine ?? null)
                  : null
                : w.metrics.length
                  ? w.metrics.join(", ")
                  : "automático";
            return (
              <article
                key={w.id}
                className={`flex min-w-0 flex-col rounded-2xl border bg-base-100 p-4 transition sm:p-5 ${SPAN[w.size]} ${
                  overId === w.id && dragId !== w.id ? "border-primary ring-2 ring-primary/30" : "border-base-300"
                } ${dragId === w.id ? "opacity-50" : ""} ${arranging ? "cursor-grab" : ""}`}
                draggable={arranging}
                onDragStart={(e) => {
                  setDragId(w.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!dragId) return;
                  e.preventDefault();
                  if (overId !== w.id) setOverId(w.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  dropOn(w.id);
                  setDragId(null);
                  setOverId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
              >
                <header className={`mb-3 flex items-start justify-between gap-2 ${arranging ? "flex-wrap" : ""}`}>
                  <div className="flex min-w-0 items-start gap-2">
                    {arranging ? (
                      <GripVertical size={16} className="mt-0.5 shrink-0 text-base-content/40" />
                    ) : (
                      <Icon size={15} className="mt-0.5 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold tracking-tight" title={w.title}>{w.title}</h3>
                      <p className="truncate text-xs text-base-content/50">
                        {spec.label}
                        {spec.windowed && ` · ${windowLabel(w.windowSec)}`}
                        {metricsLabel && ` · ${metricsLabel}`}
                      </p>
                    </div>
                  </div>

                  {arranging ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <div className="join">
                        {WIDGET_SIZES.map((s) => (
                          <button
                            key={s.key}
                            type="button"
                            className={`btn join-item btn-xs ${w.size === s.key ? "btn-neutral" : "btn-ghost border-base-300"}`}
                            onClick={() => update(w.id, { size: s.key })}
                            title={`Largura ${s.label}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={i === 0} onClick={() => move(w.id, -1)} aria-label="Mover para antes">
                        <ArrowLeft size={13} />
                      </button>
                      <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={i === widgets.length - 1} onClick={() => move(w.id, 1)} aria-label="Mover para depois">
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-0.5">
                      {spec.windowed && (
                        <div className="dropdown dropdown-end">
                          <button type="button" tabIndex={0} className="btn btn-ghost btn-xs gap-1 px-1.5 text-base-content/60" aria-label="Janela de tempo">
                            <Timer size={12} /> {windowLabel(w.windowSec)}
                          </button>
                          <ul tabIndex={0} className="dropdown-content menu menu-xs z-20 mt-1 w-28 rounded-box border border-base-300 bg-base-100 p-1 shadow">
                            {WIDGET_WINDOWS.map((opt) => (
                              <li key={opt.label}>
                                <button
                                  type="button"
                                  className={w.windowSec === opt.value ? "menu-active" : ""}
                                  onClick={() => update(w.id, { windowSec: opt.value })}
                                >
                                  {opt.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="dropdown dropdown-end">
                        <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square" aria-label={`Opções de ${w.title}`}>
                          <EllipsisVertical size={14} />
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu menu-sm z-20 mt-1 w-48 rounded-box border border-base-300 bg-base-100 p-1 shadow">
                          <li>
                            <button type="button" onClick={() => openEditor(w)}>
                              <Pencil size={13} /> Editar
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => duplicate(w.id)}>
                              <Copy size={13} /> Duplicar
                            </button>
                          </li>
                          <li className="menu-title px-3 pt-2 pb-1 text-[11px]">Largura</li>
                          <li>
                            <div className="join gap-0 p-1">
                              {WIDGET_SIZES.map((s) => (
                                <button
                                  key={s.key}
                                  type="button"
                                  className={`btn join-item btn-xs ${w.size === s.key ? "btn-neutral" : "btn-ghost border-base-300"}`}
                                  onClick={() => update(w.id, { size: s.key })}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </li>
                          <li>
                            <button type="button" className="text-error" onClick={() => remove(w.id)}>
                              <Trash2 size={13} /> Remover
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </header>
                <div className={`min-w-0 flex-1 ${arranging ? "pointer-events-none select-none" : ""}`}>
                  <AnatixWidgetView widget={w} ctx={ctx} height={w.size === "sm" ? 200 : 256} />
                </div>
              </article>
            );
          })}
          {!full && !arranging && (
            <button
              type="button"
              onClick={() => openEditor(null)}
              className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-base-300 text-sm text-base-content/50 transition hover:border-primary/50 hover:text-primary"
            >
              <Plus size={20} />
              Adicionar bloco
            </button>
          )}
        </div>
      )}

      {editing && (
        <AnatixWidgetEditor
          key={editing.key}
          dialogRef={editorRef}
          initial={editing.widget}
          ctx={ctx}
          onSave={save}
        />
      )}
    </div>
  );
}

function EmptyDashboard({ onAdd, onPreset }: { onAdd: () => void; onPreset: (key: string) => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 sm:p-8">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <LayoutDashboard size={22} />
        </span>
        <h3 className="mt-3 text-lg font-black tracking-tight">Monte o painel do seu jeito</h3>
        <p className="mt-1 text-sm text-base-content/60">
          Combine gráficos de linha, área, barras, dispersão, histograma, medidores, radar e tabelas de estatísticas,
          amostras e correlação. Comece do zero ou a partir de um modelo.
        </p>
        <button type="button" className="btn btn-primary btn-sm mt-4" onClick={onAdd}>
          <Plus size={15} /> Adicionar primeiro bloco
        </button>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {DASHBOARD_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onPreset(p.key)}
            className="flex flex-col items-start gap-1 rounded-xl border border-base-300 p-3 text-left transition hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles size={13} className="text-primary" /> {p.label}
            </span>
            <span className="text-xs leading-snug text-base-content/55">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
