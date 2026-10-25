"use client";

import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { obrSeries } from "@/utils/institutional/roboticar";

const fmt = (n: number) => n.toLocaleString("pt-BR");

// Escala do eixo: 0 a 220 mil, com grade a cada 50 mil.
const MAX = 220000;
const TICKS = [0, 50000, 100000, 150000, 200000];

export default function ObrChart() {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [active, setActive] = useState<number | null>(null);
  const shown = active ?? obrSeries.length - 1;
  const point = obrSeries[shown];

  return (
    <figure className="overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-base-300 px-5 py-4 sm:px-6">
        <figcaption>
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-secondary">
            OBR · INSCRIÇÕES TOTAIS POR EDIÇÃO
          </p>
          <p className="mt-1 text-sm text-base-content/60">
            2007 a 2023, provas práticas e teóricas
          </p>
        </figcaption>
        <div className="join" role="group" aria-label="Formato de exibição">
          <button
            type="button"
            onClick={() => setView("chart")}
            aria-pressed={view === "chart"}
            className={`btn join-item btn-xs ${view === "chart" ? "btn-active" : "btn-ghost"}`}
          >
            <BarChart3 size={14} /> Gráfico
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
            className={`btn join-item btn-xs ${view === "table" ? "btn-active" : "btn-ghost"}`}
          >
            <Table2 size={14} /> Tabela
          </button>
        </div>
      </div>

      {view === "chart" ? (
        <div className="px-5 pb-5 pt-5 sm:px-6">
          {/* Leitura do ponto ativo */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
            <span className="font-mono text-3xl font-bold tabular-nums sm:text-4xl">
              {point.approx ? "≈" : ""}
              {fmt(point.total)}
            </span>
            <span className="text-sm text-base-content/60">
              inscrições em <strong className="text-base-content">{point.year}</strong>
              {" · "}
              {point.virtual ? "etapa nacional virtual" : `nacional em ${point.host}`}
            </span>
          </div>

          <div className="relative mt-6 h-64 sm:h-72">
            {/* grade e eixo */}
            <div className="absolute inset-0 left-9 sm:left-11" aria-hidden="true">
              {TICKS.map((t) => (
                <div
                  key={t}
                  className="absolute inset-x-0 border-t border-base-content/[0.07]"
                  style={{ bottom: `${(t / MAX) * 100}%` }}
                >
                  <span className="absolute -left-9 -translate-y-1/2 font-mono text-[10px] text-base-content/45 sm:-left-11">
                    {t === 0 ? "0" : `${t / 1000}k`}
                  </span>
                </div>
              ))}
            </div>

            {/* barras */}
            <div
              className="absolute inset-0 left-9 flex items-end gap-[2px] sm:left-11 sm:gap-1"
              onMouseLeave={() => setActive(null)}
            >
              {obrSeries.map((d, i) => {
                const isActive = i === shown;
                return (
                  <button
                    key={d.year}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${d.year}: ${d.approx ? "cerca de " : ""}${fmt(d.total)} inscrições${d.virtual ? ", edição virtual" : ""}`}
                    className="group relative flex h-full flex-1 items-end focus-visible:outline-none"
                  >
                    <span
                      className={`block w-full rounded-t-[4px] transition-colors duration-200 ${
                        isActive
                          ? "bg-primary"
                          : d.virtual
                            ? "bg-secondary/35 group-hover:bg-secondary/60"
                            : "bg-secondary/80 group-hover:bg-secondary"
                      } group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-base-100`}
                      style={{
                        height: `${(d.total / MAX) * 100}%`,
                        backgroundImage: d.virtual
                          ? "repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklab, var(--color-base-100) 45%, transparent) 4px 6px)"
                          : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* rótulos do eixo x */}
          <div className="ml-9 mt-2 flex gap-[2px] sm:ml-11 sm:gap-1" aria-hidden="true">
            {obrSeries.map((d, i) => (
              <span
                key={d.year}
                className={`flex-1 text-center font-mono text-[9px] sm:text-[10px] ${
                  i === shown ? "font-bold text-base-content" : "text-base-content/45"
                } ${i % 2 === 1 && i !== shown ? "max-sm:invisible" : ""}`}
              >
                {String(d.year).slice(2)}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-base-content/60">
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-secondary/80" /> Etapa nacional presencial
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="size-3 rounded-sm bg-secondary/35"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent 0 3px, color-mix(in oklab, var(--color-base-100) 45%, transparent) 3px 4px)",
                }}
              />
              Edições virtuais (2020–2021)
            </span>
            <span className="text-base-content/45">
              Passe o mouse ou use Tab para ver cada ano.
            </span>
          </div>
        </div>
      ) : (
        <div className="max-h-[26rem] overflow-auto">
          <table className="table table-sm table-pin-rows">
            <thead>
              <tr>
                <th>Ano</th>
                <th className="text-right">Inscrições</th>
                <th>Etapa nacional</th>
              </tr>
            </thead>
            <tbody>
              {[...obrSeries].reverse().map((d) => (
                <tr key={d.year} className="hover:bg-base-200/60">
                  <td className="font-mono">{d.year}</td>
                  <td className="text-right font-mono tabular-nums">
                    {d.approx ? "≈ " : ""}
                    {fmt(d.total)}
                  </td>
                  <td className="text-base-content/70">{d.host}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
