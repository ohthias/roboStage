"use client";

// Barra de filtros e modos da página do teste: período, busca, observações,
// métricas visíveis e modos predefinidos. Vale para todas as abas.
// Visual enxuto: uma linha de pílulas finas com os cantos assimétricos do
// RoboStage; os detalhes (intervalo, métricas, modos) ficam nos menus.

import { Check, ChevronDown, Eye, History, MessageSquareText, Search, Sparkles, X } from "lucide-react";
import {
  DEFAULT_FILTERS,
  RANGE_LABEL,
  presetsFor,
  activeFilterCount,
  type ViewFilters,
  type ViewMetric,
  type ViewRange,
} from "@/features/labtest/lib/view-dashboard";
import {
  closeDropdown as blur,
  filterMenu as menu,
  filterMenuTitle,
  filterOption,
  filterPill as pill,
} from "../filter-styles";

const shortDate = (v: string) => {
  const [, m, d] = v.split("-");
  return d && m ? `${d}/${m}` : v;
};

function rangeSummary(f: ViewFilters) {
  if (f.range === "execs" && (f.fromExec || f.toExec)) return `#${f.fromExec ?? 1} – #${f.toExec ?? "…"}`;
  if (f.range === "dates" && (f.fromDate || f.toDate))
    return `${f.fromDate ? shortDate(f.fromDate) : "…"} – ${f.toDate ? shortDate(f.toDate) : "hoje"}`;
  return f.range === "all" ? "Todas as execuções" : RANGE_LABEL[f.range];
}


export function ViewFilterBar({
  filters,
  onChange,
  metrics,
  total,
  shown,
  onPreset,
  presetsOpenRef,
  isFll = false,
}: {
  isFll?: boolean;
  filters: ViewFilters;
  onChange: (f: ViewFilters) => void;
  metrics: ViewMetric[];
  total: number;
  shown: number;
  onPreset: (key: string) => void;
  presetsOpenRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const set = (p: Partial<ViewFilters>) => onChange({ ...filters, ...p });
  const hidden = new Set(filters.hiddenMetrics ?? []);
  const count = activeFilterCount(filters);
  const searching = Boolean(filters.search?.trim());

  return (
    <div
      role="toolbar"
      aria-label="Filtros das execuções"
      className="flex flex-wrap items-center gap-2 border-y border-base-300/70 py-2.5"
    >
      {/* Busca */}
      <label
        className={`${pill(searching)} w-full cursor-text px-2.5 focus-within:border-primary/50 sm:w-56`}
      >
        <Search size={13} className="shrink-0 opacity-60" />
        <input
          type="search"
          className="min-w-0 grow bg-transparent text-xs text-base-content outline-none placeholder:text-base-content/45"
          placeholder="Buscar nº ou observação"
          value={filters.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
        />
      </label>

      {/* Período */}
      <div className="dropdown">
        <button type="button" tabIndex={0} className={pill(filters.range !== "all")}>
          <History size={13} className="opacity-70" />
          {rangeSummary(filters)}
          <ChevronDown size={12} className="opacity-50" />
        </button>
        <div tabIndex={0} className={`${menu} w-64`}>
          <p className={filterMenuTitle}>Período</p>
          <ul className="flex flex-col gap-0.5">
            {(Object.keys(RANGE_LABEL) as ViewRange[]).map((r) => {
              const active = filters.range === r;
              const opensInputs = r === "execs" || r === "dates";
              return (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => {
                      set({ range: r });
                      if (!opensInputs) blur();
                    }}
                    className={filterOption(active)}
                  >
                    {RANGE_LABEL[r]}
                    {active && <Check size={14} />}
                  </button>
                </li>
              );
            })}
          </ul>

          {filters.range === "execs" && (
            <div className="mt-2 flex items-center gap-1.5 border-t border-base-300 px-1 pt-2.5 text-xs text-base-content/60">
              <span>de #</span>
              <input type="number" min={1} className="input input-bordered input-xs w-16" value={filters.fromExec ?? ""} onChange={(e) => set({ fromExec: e.target.value ? Number(e.target.value) : null })} aria-label="Da execução" />
              <span>até #</span>
              <input type="number" min={1} className="input input-bordered input-xs w-16" value={filters.toExec ?? ""} onChange={(e) => set({ toExec: e.target.value ? Number(e.target.value) : null })} aria-label="Até a execução" />
            </div>
          )}
          {filters.range === "dates" && (
            <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-base-300 px-1 pt-2.5 text-[11px] text-base-content/60">
              <label className="flex flex-col gap-1">
                De
                <input type="date" className="input input-bordered input-xs w-full" value={filters.fromDate ?? ""} onChange={(e) => set({ fromDate: e.target.value || null })} />
              </label>
              <label className="flex flex-col gap-1">
                Até
                <input type="date" className="input input-bordered input-xs w-full" value={filters.toDate ?? ""} onChange={(e) => set({ toDate: e.target.value || null })} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Só com observações */}
      <button
        type="button"
        aria-pressed={!!filters.withNotes}
        onClick={() => set({ withNotes: !filters.withNotes })}
        className={pill(!!filters.withNotes)}
      >
        <MessageSquareText size={13} className="opacity-70" />
        Com observações
        {filters.withNotes && <Check size={12} />}
      </button>

      {/* Métricas */}
      {metrics.length > 0 && (
        <div className="dropdown">
          <button type="button" tabIndex={0} className={pill(hidden.size > 0)}>
            <Eye size={13} className="opacity-70" />
            Métricas
            <span className="font-mono text-[10px] opacity-60">
              {metrics.length - hidden.size}/{metrics.length}
            </span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
          <div tabIndex={0} className={`${menu} w-72`}>
            <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/45">
                No painel e na tabela
              </span>
              {hidden.size > 0 && (
                <button type="button" className="text-xs text-primary hover:underline" onClick={() => set({ hiddenMetrics: [] })}>
                  Mostrar todas
                </button>
              )}
            </div>
            <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {metrics.map((m) => (
                <li key={m.key}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-base-200">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={!hidden.has(m.key)}
                      disabled={!hidden.has(m.key) && hidden.size >= metrics.length - 1}
                      onChange={(e) => {
                        const next = new Set(hidden);
                        if (e.target.checked) next.delete(m.key);
                        else next.add(m.key);
                        set({ hiddenMetrics: [...next] });
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate">{m.label}</span>
                    <span className="text-[10px] text-base-content/40">
                      {m.group === "resultado" ? "resultado" : m.group === "missao" ? "missão" : m.kind === "boolean" ? "sim/não" : (m.unit ?? "")}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {count > 0 && (
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 px-1.5 text-xs text-base-content/55 transition hover:text-error"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <X size={12} /> Limpar ({count})
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-base-content/50" aria-live="polite">
          <b className="font-mono font-semibold text-base-content">{shown}</b>
          <span className="font-mono">/{total}</span> execuções
        </span>

        {/* Modos predefinidos */}
        <div className="dropdown dropdown-end">
          <button
            ref={presetsOpenRef}
            type="button"
            tabIndex={0}
            className="inline-flex h-8 items-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-primary px-3 text-xs font-semibold text-primary-content shadow-sm transition hover:bg-primary/90"
          >
            <Sparkles size={13} /> Modos
          </button>
          <ul tabIndex={0} className={`${menu} w-80`}>
            <li className="px-2 pb-1.5 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/45">
              Monta o painel e ajusta os filtros
            </li>
            {presetsFor(isFll).map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-0.5 rounded-lg px-2 py-2 text-left transition hover:bg-base-200"
                  onClick={() => {
                    onPreset(p.key);
                    blur();
                  }}
                >
                  <span className="text-sm font-semibold">{p.label}</span>
                  <span className="text-xs leading-snug text-base-content/55">{p.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
