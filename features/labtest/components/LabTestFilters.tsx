"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, Check, ChevronDown, CircleDot, Layers, Search, Sparkle, Trophy, X } from "lucide-react";
import { MODE_META, STATUS_META, type ModeKey } from "@/features/labtest/lib/catalog";
import {
  LIST_SORT_LABEL,
  activeListFilterCount,
  listHref,
  type ListFilters,
  type ListParams,
  type ListSort,
  type ListStatus,
} from "@/features/labtest/lib/list-filters";
import { closeDropdown, filterMenu, filterMenuTitle, filterOption, filterPill } from "./filter-styles";

const STATUS_DOT: Record<string, string> = {
  "badge-warning": "bg-warning",
  "badge-success": "bg-success",
  "badge-error": "bg-error",
  "badge-ghost": "bg-base-content/35",
};

/**
 * Barra de filtros da lista do LabTest. Cada escolha vira parâmetro na URL
 * (a página filtra no servidor); a busca espera o usuário parar de digitar.
 */
export function LabTestFilters({
  filters,
  params,
  seasons,
  shown,
  total,
}: {
  filters: ListFilters;
  /** Parâmetros atuais da URL (para preservar visualização etc.). */
  params: ListParams;
  seasons: string[];
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(filters.q);
  const count = activeListFilterCount(filters);

  const go = (patch: ListParams) => {
    // Qualquer filtro novo volta para a primeira página.
    start(() => router.replace(listHref(params, { ...patch, pagina: undefined }), { scroll: false }));
  };

  // Busca com espera curta; ignora quando o valor já é o da URL.
  const search = useEffectEvent((value: string) => go({ q: value.trim() || undefined }));
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => search(q), 300);
    return () => clearTimeout(t);
  }, [q, filters.q]);

  const pick = (patch: ListParams) => {
    go(patch);
    closeDropdown();
  };

  const ModeIcon = filters.mode ? MODE_META[filters.mode].icon : Layers;

  return (
    <div
      role="toolbar"
      aria-label="Filtrar testes"
      aria-busy={pending}
      className={`flex flex-wrap items-center gap-2 border-y border-base-300/70 py-2.5 transition-opacity ${pending ? "opacity-70" : ""}`}
    >
      <label className={`${filterPill(Boolean(filters.q))} w-full cursor-text px-2.5 focus-within:border-primary/50 sm:w-60`}>
        <Search size={13} className="shrink-0 opacity-60" />
        <input
          type="search"
          className="min-w-0 grow bg-transparent text-xs text-base-content outline-none placeholder:text-base-content/45"
          placeholder="Buscar por nome, descrição ou temporada"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {/* Modo */}
      <div className="dropdown">
        <button type="button" tabIndex={0} className={filterPill(Boolean(filters.mode))}>
          <ModeIcon size={13} className="opacity-70" />
          {filters.mode ? MODE_META[filters.mode].label : "Modo"}
          <ChevronDown size={12} className="opacity-50" />
        </button>
        <ul tabIndex={0} className={`${filterMenu} w-60`}>
          <li className={filterMenuTitle}>Modo</li>
          <li>
            <button type="button" className={filterOption(!filters.mode)} onClick={() => pick({ modo: undefined })}>
              Todos os modos {!filters.mode && <Check size={14} />}
            </button>
          </li>
          {(Object.entries(MODE_META) as [ModeKey, (typeof MODE_META)[ModeKey]][]).map(([key, meta]) => {
            const Icon = meta.icon;
            const active = filters.mode === key;
            return (
              <li key={key}>
                <button type="button" className={filterOption(active)} onClick={() => pick({ modo: key })}>
                  <span className="inline-flex items-center gap-2">
                    <Icon size={14} className="opacity-70" /> {meta.label}
                  </span>
                  {active && <Check size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Status */}
      <div className="dropdown">
        <button type="button" tabIndex={0} className={filterPill(Boolean(filters.status))}>
          <CircleDot size={13} className="opacity-70" />
          {filters.status ? STATUS_META[filters.status].label : "Status"}
          <ChevronDown size={12} className="opacity-50" />
        </button>
        <ul tabIndex={0} className={`${filterMenu} w-56`}>
          <li className={filterMenuTitle}>Status</li>
          <li>
            <button type="button" className={filterOption(!filters.status)} onClick={() => pick({ status: undefined })}>
              Todos {!filters.status && <Check size={14} />}
            </button>
          </li>
          {(Object.entries(STATUS_META) as [ListStatus, (typeof STATUS_META)[ListStatus]][]).map(([key, meta]) => {
            const active = filters.status === key;
            return (
              <li key={key}>
                <button type="button" className={filterOption(active)} onClick={() => pick({ status: key })}>
                  <span className="inline-flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${STATUS_DOT[meta.badgeClass] ?? "bg-base-content/35"}`} />
                    {meta.label}
                  </span>
                  {active && <Check size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Temporada (só aparece se algum teste tiver) */}
      {seasons.length > 0 && (
        <div className="dropdown">
          <button type="button" tabIndex={0} className={filterPill(Boolean(filters.season))}>
            <Trophy size={13} className="opacity-70" />
            <span className={filters.season ? "font-mono uppercase" : ""}>{filters.season ?? "Temporada"}</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
          <ul tabIndex={0} className={`${filterMenu} max-h-72 w-56 overflow-y-auto`}>
            <li className={filterMenuTitle}>Temporada</li>
            <li>
              <button type="button" className={filterOption(!filters.season)} onClick={() => pick({ temporada: undefined })}>
                Todas {!filters.season && <Check size={14} />}
              </button>
            </li>
            {seasons.map((s) => (
              <li key={s}>
                <button type="button" className={filterOption(filters.season === s)} onClick={() => pick({ temporada: s })}>
                  <span className="font-mono text-xs uppercase tracking-wide">{s}</span>
                  {filters.season === s && <Check size={14} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nunca executados */}
      <button
        type="button"
        aria-pressed={filters.neverRun}
        onClick={() => go({ novos: filters.neverRun ? undefined : "1" })}
        className={filterPill(filters.neverRun)}
      >
        <Sparkle size={13} className="opacity-70" />
        Nunca executados
        {filters.neverRun && <Check size={12} />}
      </button>

      {count > 0 && (
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 px-1.5 text-xs text-base-content/55 transition hover:text-error"
          onClick={() => {
            setQ("");
            go({ q: undefined, modo: undefined, status: undefined, temporada: undefined, novos: undefined });
          }}
        >
          <X size={12} /> Limpar ({count})
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-base-content/50" aria-live="polite">
          <b className="font-mono font-semibold text-base-content">{shown}</b>
          <span className="font-mono">/{total}</span> testes
        </span>

        {/* Ordem */}
        <div className="dropdown dropdown-end">
          <button type="button" tabIndex={0} className={filterPill(filters.sort !== "recente")}>
            <ArrowDownUp size={13} className="opacity-70" />
            {LIST_SORT_LABEL[filters.sort]}
            <ChevronDown size={12} className="opacity-50" />
          </button>
          <ul tabIndex={0} className={`${filterMenu} w-60`}>
            <li className={filterMenuTitle}>Ordenar por</li>
            {(Object.keys(LIST_SORT_LABEL) as ListSort[]).map((key) => (
              <li key={key}>
                <button type="button" className={filterOption(filters.sort === key)} onClick={() => pick({ ordem: key })}>
                  {LIST_SORT_LABEL[key]}
                  {filters.sort === key && <Check size={14} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
