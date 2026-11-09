"use client";

// ---------------------------------------------------------------------------
// "Meu painel" do teste: grade de blocos que o usuário monta, edita,
// redimensiona e reordena. O estado vive na página (salvo no navegador).
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ChartColumn,
  ChartLine,
  ChartNoAxesColumn,
  ChartScatter,
  Check,
  CircleCheck,
  Copy,
  EllipsisVertical,
  Goal,
  Grid3x3,
  LayoutDashboard,
  LayoutGrid,
  Pencil,
  Plus,
  Sigma,
  Table2,
  Trash2,
  TrendingUp,
  Trophy,
  ListChecks,
  X,
} from "lucide-react";
import {
  VIEW_CHART_LABEL,
  VIEW_STAT_LABEL,
  VIEW_WIDGET_SPEC,
  VIEW_WIDGET_SPECS,
  createViewWidget,
  newViewWidgetId,
  resolveWidgetMetrics,
  type ViewChartType,
  type ViewStat,
  type ViewWidget,
  type ViewWidgetSize,
  type ViewWidgetType,
} from "@/utils/labtest/view-dashboard";
import { ViewWidgetBody, type ViewContext } from "./ViewWidgets";

const MAX = 24;

export const VIEW_WIDGET_ICON: Record<ViewWidgetType, typeof ChartLine> = {
  evolution: ChartLine,
  trend: TrendingUp,
  kpi: Activity,
  "stat-bars": ChartColumn,
  histogram: ChartNoAxesColumn,
  scatter: ChartScatter,
  success: CircleCheck,
  targets: Goal,
  "table-entries": Table2,
  "table-stats": Sigma,
  "table-correlation": Grid3x3,
  "fll-missions": Trophy,
  "table-missions": ListChecks,
  "table-mission-grid": Grid3x3,
};

const SPAN: Record<ViewWidgetSize, string> = {
  sm: "",
  md: "md:col-span-2",
  lg: "md:col-span-2 xl:col-span-3",
  full: "md:col-span-2 xl:col-span-4",
};
const SIZES: { key: ViewWidgetSize; label: string }[] = [
  { key: "sm", label: "1/4" },
  { key: "md", label: "1/2" },
  { key: "lg", label: "3/4" },
  { key: "full", label: "Inteiro" },
];

export function ViewDashboard({
  widgets,
  onChange,
  ctx,
  onOpenPresets,
}: {
  widgets: ViewWidget[];
  onChange: (w: ViewWidget[]) => void;
  ctx: ViewContext;
  onOpenPresets: () => void;
}) {
  const editorRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<{ key: number; widget: ViewWidget | null } | null>(null);
  const [arranging, setArranging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const full = widgets.length >= MAX;

  useEffect(() => {
    if (editing) editorRef.current?.showModal();
  }, [editing]);

  const update = (id: string, patch: Partial<ViewWidget>) =>
    onChange(widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const move = (id: string, d: number) => {
    const i = widgets.findIndex((w) => w.id === id);
    const j = i + d;
    if (j < 0 || j >= widgets.length) return;
    const next = [...widgets];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const drop = (target: string) => {
    if (!dragId || dragId === target) return;
    const next = [...widgets];
    const [item] = next.splice(next.findIndex((w) => w.id === dragId), 1);
    next.splice(next.findIndex((w) => w.id === target), 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-base-content/60">
          <LayoutDashboard size={15} className="text-primary" />
          {widgets.length} {widgets.length === 1 ? "bloco" : "blocos"} · salvo neste navegador
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="btn btn-primary btn-sm rounded-full" disabled={full} onClick={() => setEditing({ key: Date.now(), widget: null })}>
            <Plus size={15} /> Adicionar bloco
          </button>
          {widgets.length > 0 && (
            <button type="button" className={`btn btn-sm rounded-full ${arranging ? "btn-neutral" : "btn-ghost border-base-300 bg-base-100"}`} onClick={() => setArranging((a) => !a)}>
              {arranging ? <Check size={14} /> : <LayoutGrid size={14} />}
              {arranging ? "Concluir" : "Organizar"}
            </button>
          )}
        </div>
      </div>

      {widgets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
          <LayoutDashboard size={28} className="text-primary" />
          <p className="font-bold">Painel vazio</p>
          <p className="max-w-md text-sm text-base-content/60">Adicione gráficos e tabelas do seu jeito ou comece por um modo pronto.</p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary btn-sm rounded-full" onClick={() => setEditing({ key: Date.now(), widget: null })}>
              <Plus size={15} /> Adicionar bloco
            </button>
            <button type="button" className="btn btn-ghost btn-sm rounded-full border-base-300" onClick={onOpenPresets}>
              Escolher um modo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {widgets.map((w, i) => {
            const spec = VIEW_WIDGET_SPEC[w.type];
            const Icon = VIEW_WIDGET_ICON[w.type];
            const used = resolveWidgetMetrics(w, ctx.metrics);
            return (
              <article
                key={w.id}
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
                  drop(w.id);
                  setDragId(null);
                  setOverId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={`flex min-w-0 flex-col rounded-2xl border bg-base-100 p-4 shadow-sm sm:p-5 ${SPAN[w.size]} ${
                  overId === w.id && dragId !== w.id ? "border-primary ring-2 ring-primary/30" : "border-base-300/70"
                } ${dragId === w.id ? "opacity-50" : ""} ${arranging ? "cursor-grab" : ""}`}
              >
                <header className={`mb-3 flex items-start justify-between gap-2 ${arranging ? "flex-wrap" : ""}`}>
                  <div className="flex min-w-0 items-start gap-2">
                    <Icon size={15} className="mt-0.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold tracking-tight" title={w.title}>{w.title}</h3>
                      <p className="truncate text-xs text-base-content/50">
                        {spec.label}
                        {w.metrics.length === 0 && used.length > 0 && " · automático"}
                      </p>
                    </div>
                  </div>
                  {arranging ? (
                    <div className="flex items-center gap-1">
                      <div className="join">
                        {SIZES.map((s) => (
                          <button key={s.key} type="button" className={`btn join-item btn-xs ${w.size === s.key ? "btn-neutral" : "btn-ghost border-base-300"}`} onClick={() => update(w.id, { size: s.key })}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={i === 0} onClick={() => move(w.id, -1)} aria-label="Mover para antes"><ArrowLeft size={13} /></button>
                      <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={i === widgets.length - 1} onClick={() => move(w.id, 1)} aria-label="Mover para depois"><ArrowRight size={13} /></button>
                    </div>
                  ) : (
                    <div className="dropdown dropdown-end">
                      <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square" aria-label={`Opções de ${w.title}`}>
                        <EllipsisVertical size={14} />
                      </button>
                      <ul tabIndex={0} className="dropdown-content menu menu-sm z-20 mt-1 w-48 rounded-box border border-base-300 bg-base-100 p-1 shadow">
                        <li><button type="button" onClick={() => setEditing({ key: Date.now(), widget: w })}><Pencil size={13} /> Editar</button></li>
                        <li>
                          <button type="button" disabled={full} onClick={() => onChange([...widgets.slice(0, i + 1), { ...w, id: newViewWidgetId(), title: `${w.title} (cópia)` }, ...widgets.slice(i + 1)])}>
                            <Copy size={13} /> Duplicar
                          </button>
                        </li>
                        <li className="menu-title px-3 pt-2 pb-1 text-[11px]">Largura</li>
                        <li>
                          <div className="join gap-0 p-1">
                            {SIZES.map((s) => (
                              <button key={s.key} type="button" className={`btn join-item btn-xs ${w.size === s.key ? "btn-neutral" : "btn-ghost border-base-300"}`} onClick={() => update(w.id, { size: s.key })}>
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </li>
                        <li><button type="button" className="text-error" onClick={() => onChange(widgets.filter((x) => x.id !== w.id))}><Trash2 size={13} /> Remover</button></li>
                      </ul>
                    </div>
                  )}
                </header>
                <div className={`min-w-0 flex-1 ${arranging ? "pointer-events-none select-none" : ""}`}>
                  <ViewWidgetBody widget={w} ctx={ctx} height={w.size === "sm" ? 190 : 250} />
                </div>
              </article>
            );
          })}
          {!full && !arranging && (
            <button
              type="button"
              onClick={() => setEditing({ key: Date.now(), widget: null })}
              className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-base-300 text-sm text-base-content/50 transition hover:border-primary/50 hover:text-primary"
            >
              <Plus size={20} /> Adicionar bloco
            </button>
          )}
        </div>
      )}

      {editing && (
        <ViewWidgetEditor
          key={editing.key}
          dialogRef={editorRef}
          initial={editing.widget}
          ctx={ctx}
          onSave={(w) => onChange(widgets.some((x) => x.id === w.id) ? widgets.map((x) => (x.id === w.id ? w : x)) : [...widgets, w])}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

function ViewWidgetEditor({
  dialogRef,
  initial,
  ctx,
  onSave,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  initial: ViewWidget | null;
  ctx: ViewContext;
  onSave: (w: ViewWidget) => void;
}) {
  const [draft, setDraft] = useState<ViewWidget | null>(initial);
  const close = () => dialogRef.current?.close();
  const spec = draft ? VIEW_WIDGET_SPEC[draft.type] : null;
  const pool = spec ? ctx.metrics.filter((m) => (spec.metrics.booleanOnly ? m.kind === "boolean" : true)) : [];
  const patch = (p: Partial<ViewWidget>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const patchOpt = (p: ViewWidget["options"]) => setDraft((d) => (d ? { ...d, options: { ...d.options, ...p } } : d));

  function choose(type: ViewWidgetType) {
    const base = createViewWidget(type);
    setDraft(draft ? { ...base, id: draft.id, size: draft.size, metrics: draft.metrics.slice(0, VIEW_WIDGET_SPEC[type].metrics.max) } : base);
  }
  function toggle(key: string) {
    if (!draft || !spec) return;
    if (draft.metrics.includes(key)) return patch({ metrics: draft.metrics.filter((k) => k !== key) });
    if (spec.metrics.max === 1) return patch({ metrics: [key] });
    if (draft.metrics.length < spec.metrics.max) patch({ metrics: [...draft.metrics, key] });
  }
  const valid = !spec || draft!.metrics.length === 0 || draft!.metrics.length >= spec.metrics.min;

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box flex max-h-[92vh] w-11/12 max-w-5xl flex-col p-0">
        <header className="flex items-center justify-between gap-3 border-b border-base-200 px-5 py-4">
          <div className="flex items-center gap-2">
            {draft && !initial && (
              <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => setDraft(null)} aria-label="Voltar"><ArrowLeft size={15} /></button>
            )}
            <h3 className="text-lg font-black tracking-tight">{!draft ? "Adicionar bloco" : initial ? "Editar bloco" : `Novo bloco · ${spec!.label}`}</h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={close} aria-label="Fechar"><X size={16} /></button>
        </header>

        {!draft ? (
          <div className="overflow-y-auto p-5">
            {(["chart", "table"] as const).map((g) => (
              <section key={g} className="mb-5 last:mb-0">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{g === "chart" ? "Gráficos" : "Tabelas"}</h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {VIEW_WIDGET_SPECS.filter((s) => s.group === g && (!s.fllOnly || ctx.fll)).map((s) => {
                    const Icon = VIEW_WIDGET_ICON[s.type];
                    const unavailable = s.metrics.booleanOnly && !ctx.metrics.some((m) => m.kind === "boolean");
                    return (
                      <button
                        key={s.type}
                        type="button"
                        disabled={unavailable}
                        onClick={() => choose(s.type)}
                        className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3 text-left transition enabled:hover:border-primary/50 enabled:hover:bg-primary/5 disabled:opacity-40"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={17} /></span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">{s.label}</span>
                          <span className="text-xs leading-snug text-base-content/55">{unavailable ? "Este teste não tem campos sim/não." : s.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div className="flex flex-col gap-4 border-base-200 p-5 lg:border-r">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-base-content/70">Título</span>
                <input className="input input-bordered input-sm w-full" value={draft.title} maxLength={80} onChange={(e) => patch({ title: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-base-content/70">Tipo</span>
                <select className="select select-bordered select-sm w-full" value={draft.type} onChange={(e) => choose(e.target.value as ViewWidgetType)}>
                  {VIEW_WIDGET_SPECS.filter((s) => !s.fllOnly || ctx.fll || s.type === draft.type).map((s) => (
                    <option key={s.type} value={s.type}>{s.group === "table" ? "Tabela · " : ""}{s.label}</option>
                  ))}
                </select>
              </label>

              {spec!.metrics.max > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between text-xs font-semibold text-base-content/70">
                  {spec!.metrics.labels ? "Eixos" : "Métricas"}
                  <span className="font-normal text-base-content/45">
                    {spec!.metrics.min === spec!.metrics.max ? spec!.metrics.min : `até ${spec!.metrics.max}`} · nenhuma = automático
                  </span>
                </span>
                {spec!.metrics.labels ? (
                  spec!.metrics.labels.map((label, i) => (
                    <select
                      key={label}
                      className="select select-bordered select-sm w-full"
                      value={draft.metrics[i] ?? ""}
                      onChange={(e) => {
                        const next = [...draft.metrics];
                        next[i] = e.target.value;
                        patch({ metrics: next.filter(Boolean) });
                      }}
                    >
                      <option value="">{label}: automático</option>
                      {pool.map((m) => (
                        <option key={m.key} value={m.key}>{label}: {m.label}</option>
                      ))}
                    </select>
                  ))
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {pool.map((m) => {
                      const on = draft.metrics.includes(m.key);
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => toggle(m.key)}
                          disabled={!on && spec!.metrics.max > 1 && draft.metrics.length >= spec!.metrics.max}
                          className={`btn btn-xs rounded-full ${on ? "btn-neutral" : "btn-ghost border-base-300"}`}
                        >
                          {m.label}
                          {m.group === "missao" && <span className="opacity-50">· missão</span>}
                          {m.kind === "boolean" && <span className="opacity-50">· sim/não</span>}
                          {m.target != null && <span className="opacity-50">· meta</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {!valid && <p className="text-xs text-warning">Escolha pelo menos {spec!.metrics.min} métricas.</p>}
              </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-base-content/70">Largura</span>
                <div className="join">
                  {SIZES.map((s) => (
                    <button key={s.key} type="button" className={`btn join-item btn-xs flex-1 ${draft.size === s.key ? "btn-primary" : "btn-ghost border-base-300"}`} onClick={() => patch({ size: s.key })}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {draft.type === "evolution" && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-base-content/70">Gráfico inicial</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(VIEW_CHART_LABEL) as ViewChartType[]).map((c) => (
                      <button key={c} type="button" className={`btn btn-xs rounded-full ${(draft.options.chart ?? "line") === c ? "btn-neutral" : "btn-ghost border-base-300"}`} onClick={() => patchOpt({ chart: c })}>
                        {VIEW_CHART_LABEL[c]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {draft.type === "stat-bars" && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-base-content/70">Estatísticas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(VIEW_STAT_LABEL) as ViewStat[]).map((k) => {
                      const cur = draft.options.stats ?? ["avg", "best"];
                      const on = cur.includes(k);
                      return (
                        <button key={k} type="button" className={`btn btn-xs rounded-full ${on ? "btn-neutral" : "btn-ghost border-base-300"}`} onClick={() => {
                          const next = on ? cur.filter((s) => s !== k) : [...cur, k];
                          if (next.length) patchOpt({ stats: next });
                        }}>
                          {VIEW_STAT_LABEL[k]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {draft.type === "trend" && (
                <label className="flex items-center gap-2 text-xs text-base-content/60">
                  Média móvel de
                  <input type="range" min={2} max={10} value={draft.options.movingN ?? 3} className="range range-primary range-xs flex-1" onChange={(e) => patchOpt({ movingN: Number(e.target.value) })} />
                  <span className="w-20 text-right font-mono">{draft.options.movingN ?? 3} execuções</span>
                </label>
              )}
              {draft.type === "histogram" && (
                <label className="flex items-center gap-2 text-xs text-base-content/60">
                  Faixas
                  <input type="range" min={3} max={20} value={draft.options.bins ?? 8} className="range range-primary range-xs flex-1" onChange={(e) => patchOpt({ bins: Number(e.target.value) })} />
                  <span className="w-8 text-right font-mono">{draft.options.bins ?? 8}</span>
                </label>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-2 bg-base-200/40 p-5">
              <span className="text-xs font-semibold text-base-content/60">Pré-visualização com as execuções filtradas</span>
              <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                <h4 className="mb-3 text-sm font-bold tracking-tight">{draft.title || spec!.label}</h4>
                <ViewWidgetBody widget={draft} ctx={ctx} height={240} />
              </div>
            </div>
          </div>
        )}

        {draft && (
          <footer className="flex justify-end gap-2 border-t border-base-200 px-5 py-3">
            <button type="button" className="btn btn-ghost btn-sm" onClick={close}>Cancelar</button>
            <button type="button" className="btn btn-primary btn-sm" disabled={!valid} onClick={() => { onSave({ ...draft, title: draft.title.trim() || spec!.label }); close(); }}>
              {initial ? "Salvar bloco" : "Adicionar ao painel"}
            </button>
          </footer>
        )}
      </div>
      <form method="dialog" className="modal-backdrop"><button aria-label="Fechar">fechar</button></form>
    </dialog>
  );
}
