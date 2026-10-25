"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { fmtMs, fmtNum, metricsToCsv } from "@/utils/labtest/anatix/analysis";
import type { AnatixStore } from "@/utils/labtest/anatix/store";
import { AnatixEmpty, AnatixPanel } from "./AnatixPanel";

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AnatixTables({
  store,
  version,
  fileName,
}: {
  store: AnatixStore;
  version: number;
  fileName: string;
}) {
  const metrics = useMemo(
    () => [...store.metrics].sort(([a], [b]) => a.localeCompare(b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );
  const sections = useMemo(
    () => [...store.sections.values()].sort((a, b) => b.maxUs - a.maxUs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );
  const events = useMemo(
    () => store.events.slice(-100).reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );
  const consoleLines = useMemo(
    () => store.console.slice(-150),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );
  const states = [...store.states];
  const firstT = store.firstT ?? 0;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <AnatixPanel
        className="xl:col-span-2"
        title="Métricas"
        hint="Resumo de cada ANX_VALUE recebido"
        actions={
          metrics.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-xs border-base-300"
              onClick={() => downloadText(`${fileName}.csv`, metricsToCsv(store.metrics))}
            >
              <Download size={13} /> CSV
            </button>
          )
        }
      >
        {metrics.length === 0 ? (
          <AnatixEmpty>Nenhuma métrica recebida ainda.</AnatixEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th className="text-right">Último</th>
                  <th className="text-right">Mínimo</th>
                  <th className="text-right">Máximo</th>
                  <th className="text-right">Média</th>
                  <th className="text-right">Amostras</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(([name, s]) => (
                  <tr key={name}>
                    <td className="font-semibold">{name}</td>
                    <td className="text-right font-mono">{fmtNum(s.stats.last)}</td>
                    <td className="text-right font-mono">{fmtNum(s.stats.min)}</td>
                    <td className="text-right font-mono">{fmtNum(s.stats.max)}</td>
                    <td className="text-right font-mono">{fmtNum(s.stats.avg)}</td>
                    <td className="text-right font-mono">{s.stats.count.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnatixPanel>

      <AnatixPanel title="Seções cronometradas" hint="Último relatório de cada ANX_SCOPE / ANX_SECTION">
        {sections.length === 0 ? (
          <AnatixEmpty>Nenhuma seção ainda.</AnatixEmpty>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Seção</th>
                <th className="text-right">Execuções</th>
                <th className="text-right">Média (µs)</th>
                <th className="text-right">Máx (µs)</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.section}>
                  <td className="font-semibold">{s.section}</td>
                  <td className="text-right font-mono">{fmtNum(s.runs)}</td>
                  <td className="text-right font-mono">{fmtNum(s.avgUs)}</td>
                  <td className="text-right font-mono">{fmtNum(s.maxUs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AnatixPanel>

      <AnatixPanel title="Estados atuais" hint="Último estado de cada máquina">
        {states.length === 0 ? (
          <AnatixEmpty>Nenhum estado ainda.</AnatixEmpty>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Estado</th>
                <th className="text-right">Desde</th>
              </tr>
            </thead>
            <tbody>
              {states.map(([machine, s]) => (
                <tr key={machine}>
                  <td className="font-semibold">{machine}</td>
                  <td><span className="badge badge-sm badge-primary badge-soft">{s.state}</span></td>
                  <td className="text-right font-mono">{fmtMs(s.since - firstT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AnatixPanel>

      <AnatixPanel title="Últimos eventos" hint="Até 100 eventos, do mais recente">
        {events.length === 0 ? (
          <AnatixEmpty>Nenhum evento ainda.</AnatixEmpty>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <table className="table table-pin-rows table-sm">
              <thead>
                <tr>
                  <th>Tempo</th>
                  <th>Evento</th>
                  <th className="text-right">Dado</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={`${e.t}-${i}`}>
                    <td className="font-mono">{fmtMs(e.t - firstT)}</td>
                    <td className="font-semibold">{e.name}</td>
                    <td className="text-right font-mono">{e.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnatixPanel>

      <AnatixPanel title="Console" hint="ANX_LOG e saídas comuns do Serial.print">
        {consoleLines.length === 0 ? (
          <AnatixEmpty>Console vazio.</AnatixEmpty>
        ) : (
          <pre className="max-h-72 overflow-y-auto rounded-xl bg-neutral p-3 text-[11px] leading-relaxed text-neutral-content">
            {consoleLines.map((l, i) => (
              <div key={i} className={l.source === "system" ? "text-warning" : l.source === "serial" ? "opacity-60" : ""}>
                <span className="opacity-50">
                  {l.t !== null ? fmtMs(l.t - firstT) : new Date(l.at).toLocaleTimeString("pt-BR")}{" "}
                </span>
                {l.text}
              </div>
            ))}
          </pre>
        )}
      </AnatixPanel>
    </div>
  );
}
