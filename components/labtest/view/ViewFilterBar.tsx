"use client";

// Barra de filtros e modos da página do teste: período, busca, observações,
// métricas visíveis e modos predefinidos. Vale para todas as abas.

import { Eye, Filter, MessageSquareText, Search, Sparkles, X } from "lucide-react";
import {
  DEFAULT_FILTERS,
  RANGE_LABEL,
  presetsFor,
  activeFilterCount,
  type ViewFilters,
  type ViewMetric,
  type ViewRange,
} from "@/utils/labtest/view-dashboard";

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

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-base-300/70 bg-base-100 p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
          <Filter size={13} /> Execuções
        </span>
        <div className="join flex-wrap">
          {(Object.keys(RANGE_LABEL) as ViewRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set({ range: r })}
              className={`btn join-item btn-xs sm:btn-sm ${filters.range === r ? "btn-neutral" : "btn-ghost border-base-300"}`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>

        {filters.range === "execs" && (
          <div className="flex items-center gap-1.5 text-xs">
            de #
            <input type="number" min={1} className="input input-bordered input-xs w-16" value={filters.fromExec ?? ""} onChange={(e) => set({ fromExec: e.target.value ? Number(e.target.value) : null })} aria-label="Da execução" />
            até #
            <input type="number" min={1} className="input input-bordered input-xs w-16" value={filters.toExec ?? ""} onChange={(e) => set({ toExec: e.target.value ? Number(e.target.value) : null })} aria-label="Até a execução" />
          </div>
        )}
        {filters.range === "dates" && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            de
            <input type="date" className="input input-bordered input-xs w-36" value={filters.fromDate ?? ""} onChange={(e) => set({ fromDate: e.target.value || null })} aria-label="Data inicial" />
            até
            <input type="date" className="input input-bordered input-xs w-36" value={filters.toDate ?? ""} onChange={(e) => set({ toDate: e.target.value || null })} aria-label="Data final" />
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <div className="dropdown dropdown-end">
            <button ref={presetsOpenRef} type="button" tabIndex={0} className="btn btn-sm rounded-full btn-primary btn-soft">
              <Sparkles size={14} /> Modos
            </button>
            <ul tabIndex={0} className="dropdown-content menu z-30 mt-1 w-80 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
              <li className="menu-title text-[11px]">Monta o painel e ajusta os filtros</li>
              {presetsFor(isFll).map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    className="flex flex-col items-start gap-0.5"
                    onClick={() => {
                      onPreset(p.key);
                      (document.activeElement as HTMLElement | null)?.blur();
                    }}
                  >
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="text-xs text-base-content/55">{p.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="input input-bordered input-sm flex w-full items-center gap-2 sm:w-64">
          <Search size={14} className="opacity-50" />
          <input
            type="search"
            className="grow"
            placeholder="Buscar nº ou observação"
            value={filters.search ?? ""}
            onChange={(e) => set({ search: e.target.value })}
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-base-300 px-3 py-1.5 text-xs">
          <input type="checkbox" className="toggle toggle-xs toggle-primary" checked={!!filters.withNotes} onChange={(e) => set({ withNotes: e.target.checked })} />
          <MessageSquareText size={13} className="opacity-60" /> Só com observações
        </label>

        {metrics.length > 0 && (
          <div className="dropdown">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-sm rounded-full border-base-300">
              <Eye size={14} /> Métricas
              <span className="badge badge-sm">{metrics.length - hidden.size}/{metrics.length}</span>
            </button>
            <div tabIndex={0} className="dropdown-content z-30 mt-1 w-72 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">O que mostrar no painel e na tabela</span>
                <button type="button" className="link link-hover text-base-content/60" onClick={() => set({ hiddenMetrics: [] })}>todas</button>
              </div>
              <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                {metrics.map((m) => (
                  <li key={m.key}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-base-200">
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

        <span className="ml-auto text-xs text-base-content/55">
          Mostrando <b className="text-base-content">{shown}</b> de {total} execuções
        </span>
        {count > 0 && (
          <button type="button" className="btn btn-ghost btn-xs rounded-full" onClick={() => onChange(DEFAULT_FILTERS)}>
            <X size={12} /> Limpar filtros ({count})
          </button>
        )}
      </div>
    </div>
  );
}
