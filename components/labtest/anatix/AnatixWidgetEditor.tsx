"use client";

// ---------------------------------------------------------------------------
// Editor de um bloco do painel: tipo, métricas, janela, tamanho e opções,
// com pré-visualização ao vivo dos dados que estão chegando.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartNoAxesColumn,
  ChartPie,
  ChartScatter,
  Gauge,
  Grid3x3,
  ListTree,
  Plus,
  Radar,
  Rows3,
  Sigma,
  TableProperties,
  Timer,
  X,
} from "lucide-react";
import type { AnatixStatKey, AnatixWidget, AnatixWidgetOptions, AnatixWidgetType } from "@/types/anatix.types";
import {
  BUCKET_OPTIONS,
  STAT_LABEL,
  TRANSFORM_LABEL,
  WIDGET_SIZES,
  WIDGET_SPEC,
  WIDGET_SPECS,
  WIDGET_WINDOWS,
  createWidget,
} from "@/utils/labtest/anatix/dashboard";
import { AnatixWidgetView, type WidgetContext } from "./AnatixWidgetView";

export const WIDGET_ICON: Record<AnatixWidgetType, typeof ChartLine> = {
  line: ChartLine,
  area: ChartArea,
  bars: ChartColumn,
  scatter: ChartScatter,
  histogram: ChartNoAxesColumn,
  gauge: Gauge,
  kpi: Activity,
  radar: Radar,
  "state-pie": ChartPie,
  "event-rate": Timer,
  "table-stats": Sigma,
  "table-samples": Rows3,
  "table-correlation": Grid3x3,
  "table-transitions": ListTree,
  "table-events": TableProperties,
};

export function AnatixWidgetEditor({
  dialogRef,
  initial,
  ctx,
  onSave,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  /** null = criar um bloco novo (começa escolhendo o tipo). Remonte com `key` para trocar. */
  initial: AnatixWidget | null;
  ctx: WidgetContext;
  onSave: (widget: AnatixWidget) => void;
}) {
  const [draft, setDraft] = useState<AnatixWidget | null>(initial);
  const [customMetric, setCustomMetric] = useState("");

  const names = [...ctx.store.metrics.keys()].sort();
  const machines = [...new Set(ctx.store.transitions.map((t) => t.machine))].sort();

  function close() {
    dialogRef.current?.close();
  }

  function chooseType(type: AnatixWidgetType) {
    const spec = WIDGET_SPEC[type];
    // Mantém as métricas já escolhidas ao trocar de tipo.
    const keep = draft?.metrics ?? [];
    const base = createWidget(type, keep.length ? keep : names.slice(0, Math.min(spec.metrics.max, Math.max(spec.metrics.min, spec.group === "table" ? 0 : 2))));
    setDraft(draft ? { ...base, id: draft.id, size: draft.size, title: draft.title === WIDGET_SPEC[draft.type].label ? base.title : draft.title } : base);
  }

  function patch(p: Partial<AnatixWidget>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }
  function patchOptions(p: AnatixWidgetOptions) {
    setDraft((d) => (d ? { ...d, options: { ...d.options, ...p } } : d));
  }

  const spec = draft ? WIDGET_SPEC[draft.type] : null;

  function toggleMetric(name: string) {
    if (!draft || !spec) return;
    const has = draft.metrics.includes(name);
    if (has) return patch({ metrics: draft.metrics.filter((m) => m !== name) });
    if (spec.metrics.max === 1) return patch({ metrics: [name] });
    if (draft.metrics.length >= spec.metrics.max) return;
    patch({ metrics: [...draft.metrics, name] });
  }

  function addCustomMetric() {
    const name = customMetric.trim();
    if (!name || !draft || !spec) return;
    setCustomMetric("");
    if (draft.metrics.includes(name)) return;
    patch({ metrics: spec.metrics.max === 1 ? [name] : [...draft.metrics, name].slice(0, spec.metrics.max) });
  }

  const allNames = [...new Set([...names, ...(draft?.metrics ?? [])])];
  const metricsOk = !spec || spec.metrics.max === 0 || draft!.metrics.length === 0 || draft!.metrics.length >= spec.metrics.min;

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box flex max-h-[92vh] w-11/12 max-w-5xl flex-col p-0">
        <header className="flex items-center justify-between gap-3 border-b border-base-200 px-5 py-4">
          <div className="flex items-center gap-2">
            {draft && !initial && (
              <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => setDraft(null)} aria-label="Voltar aos tipos">
                <ArrowLeft size={15} />
              </button>
            )}
            <h3 className="text-lg font-black tracking-tight">
              {!draft ? "Adicionar bloco" : initial ? "Editar bloco" : `Novo bloco · ${spec!.label}`}
            </h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={close} aria-label="Fechar">
            <X size={16} />
          </button>
        </header>

        {!draft ? (
          <div className="overflow-y-auto p-5">
            {(["chart", "table"] as const).map((group) => (
              <section key={group} className="mb-5 last:mb-0">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">
                  {group === "chart" ? "Gráficos" : "Tabelas"}
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {WIDGET_SPECS.filter((s) => s.group === group).map((s) => {
                    const Icon = WIDGET_ICON[s.type];
                    return (
                      <button
                        key={s.type}
                        type="button"
                        onClick={() => chooseType(s.type)}
                        className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3 text-left transition hover:border-primary/50 hover:bg-primary/5"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon size={17} />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">{s.label}</span>
                          <span className="text-xs leading-snug text-base-content/55">{s.description}</span>
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
            {/* Formulário */}
            <div className="flex flex-col gap-4 border-base-200 p-5 lg:border-r">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-base-content/70">Título</span>
                <input
                  className="input input-bordered input-sm w-full"
                  value={draft.title}
                  maxLength={80}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-base-content/70">Tipo</span>
                <select
                  className="select select-bordered select-sm w-full"
                  value={draft.type}
                  onChange={(e) => chooseType(e.target.value as AnatixWidgetType)}
                >
                  <optgroup label="Gráficos">
                    {WIDGET_SPECS.filter((s) => s.group === "chart").map((s) => (
                      <option key={s.type} value={s.type}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Tabelas">
                    {WIDGET_SPECS.filter((s) => s.group === "table").map((s) => (
                      <option key={s.type} value={s.type}>{s.label}</option>
                    ))}
                  </optgroup>
                </select>
              </label>

              {spec!.metrics.max > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-baseline justify-between text-xs font-semibold text-base-content/70">
                    {spec!.metrics.labels ? "Eixos" : "Métricas"}
                    <span className="font-normal text-base-content/45">
                      {spec!.metrics.min === spec!.metrics.max
                        ? `${spec!.metrics.min}`
                        : `${spec!.metrics.min || 0}–${spec!.metrics.max}`}{" "}
                      · vazio = automático
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
                        {allNames.map((n) => (
                          <option key={n} value={n}>{label}: {n}</option>
                        ))}
                      </select>
                    ))
                  ) : allNames.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {allNames.map((n) => {
                        const idx = draft.metrics.indexOf(n);
                        const on = idx >= 0;
                        const missing = !ctx.store.metrics.has(n);
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => toggleMetric(n)}
                            disabled={!on && spec!.metrics.max > 1 && draft.metrics.length >= spec!.metrics.max}
                            className={`btn btn-xs rounded-full ${on ? "btn-neutral" : "btn-ghost border-base-300"} ${missing ? "italic" : ""}`}
                            title={missing ? "Ainda não recebida nesta sessão" : undefined}
                          >
                            {on && (
                              <span className="size-2 rounded-full" style={{ background: ctx.theme.series[idx % ctx.theme.series.length] }} />
                            )}
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-base-content/50">Nenhuma métrica recebida ainda — digite o nome abaixo.</p>
                  )}
                  <div className="join w-full">
                    <input
                      className="input input-bordered input-xs join-item w-full"
                      placeholder="Outra métrica pelo nome (ex.: erro)"
                      value={customMetric}
                      maxLength={80}
                      onChange={(e) => setCustomMetric(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomMetric();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-xs join-item" onClick={addCustomMetric} aria-label="Adicionar métrica">
                      <Plus size={12} />
                    </button>
                  </div>
                  {!metricsOk && (
                    <p className="text-xs text-warning">Escolha pelo menos {spec!.metrics.min} métricas.</p>
                  )}
                </div>
              )}

              {spec!.windowed && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-base-content/70">Janela de tempo</span>
                  <div className="join flex-wrap">
                    {WIDGET_WINDOWS.map((w) => (
                      <button
                        key={w.label}
                        type="button"
                        className={`btn join-item btn-xs ${draft.windowSec === w.value ? "btn-primary" : "btn-ghost border-base-300"}`}
                        onClick={() => patch({ windowSec: w.value })}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-base-content/70">Largura</span>
                <div className="join">
                  {WIDGET_SIZES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`btn join-item btn-xs flex-1 ${draft.size === s.key ? "btn-primary" : "btn-ghost border-base-300"}`}
                      onClick={() => patch({ size: s.key })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <WidgetOptionsForm key={`${draft.id}-${draft.type}`} draft={draft} machines={machines} onChange={patchOptions} />
            </div>

            {/* Pré-visualização */}
            <div className="flex min-w-0 flex-col gap-2 bg-base-200/40 p-5">
              <span className="text-xs font-semibold text-base-content/60">Pré-visualização com os dados atuais</span>
              <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                <h4 className="mb-3 text-sm font-bold tracking-tight">{draft.title || spec!.label}</h4>
                <AnatixWidgetView widget={draft} ctx={ctx} height={240} />
              </div>
            </div>
          </div>
        )}

        {draft && (
          <footer className="flex justify-end gap-2 border-t border-base-200 px-5 py-3">
            <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!metricsOk}
              onClick={() => {
                onSave({ ...draft, title: draft.title.trim() || spec!.label });
                close();
              }}
            >
              {initial ? "Salvar bloco" : "Adicionar ao painel"}
            </button>
          </footer>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Fechar">fechar</button>
      </form>
    </dialog>
  );
}

function numOrNull(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function WidgetOptionsForm({
  draft,
  machines,
  onChange,
}: {
  draft: AnatixWidget;
  machines: string[];
  onChange: (p: AnatixWidgetOptions) => void;
}) {
  const spec = WIDGET_SPEC[draft.type];
  const o = draft.options;
  if (!spec.options.length) return null;
  const has = (k: (typeof spec.options)[number]) => spec.options.includes(k);

  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-base-300 p-3">
      <legend className="px-1 text-xs font-semibold text-base-content/70">Opções</legend>

      {has("transform") && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-base-content/60">Mostrar</span>
          <select
            className="select select-bordered select-xs w-full"
            value={o.transform ?? "raw"}
            onChange={(e) => onChange({ transform: e.target.value as AnatixWidgetOptions["transform"] })}
          >
            {Object.entries(TRANSFORM_LABEL).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          {o.transform === "smooth" && (
            <label className="flex items-center gap-2 text-xs text-base-content/60">
              Suavizar
              <input
                type="range"
                min={2}
                max={50}
                value={o.smoothN ?? 5}
                className="range range-primary range-xs flex-1"
                onChange={(e) => onChange({ smoothN: Number(e.target.value) })}
              />
              <span className="w-16 text-right font-mono">{o.smoothN ?? 5} amostras</span>
            </label>
          )}
        </div>
      )}

      {has("stats") && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-base-content/60">Estatísticas</span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STAT_LABEL) as AnatixStatKey[]).map((k) => {
              const current = o.stats ?? ["avg", "max"];
              const on = current.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  className={`btn btn-xs rounded-full ${on ? "btn-neutral" : "btn-ghost border-base-300"}`}
                  onClick={() => {
                    const next = on ? current.filter((s) => s !== k) : [...current, k];
                    if (next.length) onChange({ stats: next });
                  }}
                >
                  {STAT_LABEL[k]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(has("step") || has("stacked") || has("horizontal")) && (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {has("step") && (
            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" className="toggle toggle-xs toggle-primary" checked={!!o.step} onChange={(e) => onChange({ step: e.target.checked })} />
              Degraus
            </label>
          )}
          {has("stacked") && (
            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" className="toggle toggle-xs toggle-primary" checked={!!o.stacked} onChange={(e) => onChange({ stacked: e.target.checked })} />
              Empilhar
            </label>
          )}
          {has("horizontal") && (
            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" className="toggle toggle-xs toggle-primary" checked={!!o.horizontal} onChange={(e) => onChange({ horizontal: e.target.checked })} />
              Barras deitadas
            </label>
          )}
        </div>
      )}

      {has("bins") && (
        <label className="flex items-center gap-2 text-xs text-base-content/60">
          {draft.type === "event-rate" ? "Blocos de tempo" : "Faixas"}
          <input
            type="range"
            min={4}
            max={80}
            value={o.bins ?? 20}
            className="range range-primary range-xs flex-1"
            onChange={(e) => onChange({ bins: Number(e.target.value) })}
          />
          <span className="w-8 text-right font-mono">{o.bins ?? 20}</span>
        </label>
      )}

      {has("bucketMs") && (
        <label className="flex flex-col gap-1.5 text-xs text-base-content/60">
          Agrupar amostras a cada
          <select
            className="select select-bordered select-xs w-full"
            value={o.bucketMs ?? 250}
            onChange={(e) => onChange({ bucketMs: Number(e.target.value) })}
          >
            {BUCKET_OPTIONS.map((ms) => (
              <option key={ms} value={ms}>{ms >= 1000 ? `${ms / 1000} s` : `${ms} ms`}</option>
            ))}
          </select>
        </label>
      )}

      {has("limits") && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-base-content/60">
            Mínimo
            <input className="input input-bordered input-xs" inputMode="decimal" placeholder="observado" defaultValue={o.min ?? ""} onChange={(e) => onChange({ min: numOrNull(e.target.value) })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-base-content/60">
            Máximo
            <input className="input input-bordered input-xs" inputMode="decimal" placeholder="observado" defaultValue={o.max ?? ""} onChange={(e) => onChange({ max: numOrNull(e.target.value) })} />
          </label>
        </div>
      )}

      {(has("target") || has("unit")) && (
        <div className="grid grid-cols-2 gap-2">
          {has("target") && (
            <label className="flex flex-col gap-1 text-xs text-base-content/60">
              Meta / referência
              <input className="input input-bordered input-xs" inputMode="decimal" placeholder="nenhuma" defaultValue={o.target ?? ""} onChange={(e) => onChange({ target: numOrNull(e.target.value) })} />
            </label>
          )}
          {has("unit") && (
            <label className="flex flex-col gap-1 text-xs text-base-content/60">
              Unidade
              <input className="input input-bordered input-xs" placeholder="ex.: cm" maxLength={12} defaultValue={o.unit ?? ""} onChange={(e) => onChange({ unit: e.target.value.trim() || undefined })} />
            </label>
          )}
        </div>
      )}

      {has("machine") && (
        <label className="flex flex-col gap-1.5 text-xs text-base-content/60">
          Máquina de estados
          <select
            className="select select-bordered select-xs w-full"
            value={o.machine ?? ""}
            onChange={(e) => onChange({ machine: e.target.value || null })}
          >
            <option value="">{draft.type === "table-transitions" ? "Todas" : "Automática (primeira)"}</option>
            {[...new Set([...machines, ...(o.machine ? [o.machine] : [])])].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}
