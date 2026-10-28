"use client";

// ---------------------------------------------------------------------------
// Análise das rodadas da OBR Resgate: evolução do placar, taxa de sucesso por
// perigo, mapa de falhas no percurso e painel da sala de resgate.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  DoorOpen,
  Flame,
  Layers,
  ShieldCheck,
  Timer,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";

import type { TestEntry } from "@/types/labtest.types";
import {
  HAZARD_SHORT,
  depositContributions,
  failureHeat,
  formatSec,
  hazardRates,
  rescueTimes,
  type ObrRoundResult,
} from "@/utils/labtest/obr";
import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";
import {
  average,
  buildExecutionRows,
  formatNumber,
  type ChartSeries,
} from "@/utils/labtest/chart-data";
import { EmptyState, SectionHeader, StatCard } from "../shared";
import { SeriesChartPanel } from "../charts/SeriesChart";
import {
  CategoryChartPanel,
  type CategoryDatum,
} from "../charts/CategoryChart";
import ArenaMap from "./ArenaMap";

type Entry = TestEntry & { obrRound: ObrRoundResult };

const round1 = (n: number) => Math.round(n * 10) / 10;

export default function ObrRoundAnalysis({
  entries,
  arena,
}: {
  entries: TestEntry[];
  arena: Project | null;
}) {
  const rounds = useMemo(
    () => entries.filter((e): e is Entry => Boolean(e.obrRound)),
    [entries],
  );
  const results = useMemo(() => rounds.map((e) => e.obrRound), [rounds]);

  /* ------------------------------ placar ------------------------------ */
  const scoreSeries = useMemo<ChartSeries[]>(
    () => [
      { key: "total", label: "Pontuação final", unit: "pts" },
      { key: "base", label: "Subtotal (sem multiplicador)", unit: "pts" },
    ],
    [],
  );
  const scoreRows = useMemo(
    () =>
      buildExecutionRows(
        rounds,
        scoreSeries,
        (e, s) =>
          s.key === "total" ? e.obrRound.scores.total : e.obrRound.scores.base,
        (e) => [
          {
            label: "Multiplicador",
            text: `×${formatNumber(e.obrRound.scores.multiplier)}`,
          },
          {
            label: "Tempo de desempate",
            text: formatSec(e.obrRound.scores.tempo),
          },
          { label: "Falhas", text: String(e.obrRound.round.falhas) },
        ],
      ),
    [rounds, scoreSeries],
  );

  const partSeries = useMemo<ChartSeries[]>(
    () => [
      { key: "hazards", label: "Perigos", unit: "pts" },
      { key: "start", label: "Ladrilho de início", unit: "pts" },
      { key: "checkpoints", label: "Checkpoints", unit: "pts" },
      { key: "chegada", label: "Chegada", unit: "pts" },
    ],
    [],
  );
  const partRows = useMemo(
    () =>
      buildExecutionRows(
        rounds,
        partSeries,
        (e, s) =>
          e.obrRound.scores[
            s.key as "hazards" | "start" | "checkpoints" | "chegada"
          ],
        (e) => [
          {
            label: "Final (com multiplicador)",
            text: `${e.obrRound.scores.total} pts`,
          },
        ],
      ),
    [rounds, partSeries],
  );

  /* ------------------------------ perigos ----------------------------- */
  const rates = useMemo(() => hazardRates(results), [results]);
  const rateData = useMemo<CategoryDatum[]>(
    () =>
      rates
        .filter((r) => r.attempts > 0)
        .map((r) => ({
          name: r.label,
          value: r.rate ?? 0,
          extras: [
            { label: "Superados", text: `${r.success} de ${r.attempts}` },
            { label: "Falhou", text: String(r.attempts - r.success) },
          ],
        })),
    [rates],
  );
  const worst = [...rates]
    .filter((r) => r.attempts > 0 && r.rate !== null)
    .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0))[0];

  /* ------------------------------ falhas ------------------------------ */
  const heat = useMemo(() => failureHeat(results), [results]);
  const failureSeries = useMemo<ChartSeries[]>(
    () => [
      { key: "falha", label: "Falhas de progresso" },
      { key: "desistencia", label: "Desistências" },
    ],
    [],
  );
  const failureRows = useMemo(
    () =>
      buildExecutionRows(
        rounds,
        failureSeries,
        (e, s) => e.obrRound.failures.filter((f) => f.kind === s.key).length,
      ),
    [rounds, failureSeries],
  );
  const checkpointData = useMemo<CategoryDatum[]>(
    () =>
      [...heat.checkpoints.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([cp, n]) => ({ name: `Antes do CP ${cp}`, value: n })),
    [heat],
  );
  const hotTiles = [...heat.tiles.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ------------------------------ resgate ----------------------------- */
  const rescue = useMemo(() => {
    const times = results.map(rescueTimes);
    const entries = times
      .map((t) => t.entry)
      .filter((v): v is number => v !== null);
    const perVictim = times.flatMap((t) => t.perVictim);
    const deposits = results.flatMap((r) => r.rescue.deposits);
    const captures = results.reduce((s, r) => s + r.rescue.captureAttempts, 0);
    const contrib = results.flatMap(depositContributions);
    const group = (keep: (c: (typeof contrib)[number]) => boolean) => {
      const list = contrib.filter(keep);
      return {
        count: list.length,
        gain: average(list.map((c) => c.gain)),
        seconds: average(
          list.map((c) => c.seconds).filter((v): v is number => v !== null),
        ),
      };
    };
    return {
      entryAvg: average(entries),
      entered: entries.length,
      perVictimAvg: average(perVictim),
      vivas: deposits.filter((d) => d.kind === "viva" && d.area === "correta")
        .length,
      mortas: deposits.filter((d) => d.kind === "morta" && d.area === "correta")
        .length,
      invertidas: deposits.filter((d) => d.area === "invertida").length,
      surpresa: results.filter((r) => r.round.surpresa).length,
      captures,
      deposited: deposits.length,
      viva: group((c) => c.kind === "viva" && c.area === "correta"),
      morta: group((c) => c.kind === "morta" && c.area === "correta"),
      invertida: group((c) => c.area === "invertida"),
    };
  }, [results]);

  const rescueSeries = useMemo<ChartSeries[]>(
    () => [
      { key: "captures", label: "Capturas tentadas" },
      { key: "deposits", label: "Depósitos bem-sucedidos" },
    ],
    [],
  );
  const rescueRows = useMemo(
    () =>
      buildExecutionRows(
        rounds,
        rescueSeries,
        (e, s) =>
          s.key === "captures"
            ? e.obrRound.rescue.captureAttempts
            : e.obrRound.rescue.deposits.length,
        (e) => {
          const t = rescueTimes(e.obrRound);
          return [
            { label: "Entrada na sala", text: formatSec(t.entry) },
            {
              label: "Ganho do multiplicador",
              text: `+${e.obrRound.scores.total - e.obrRound.scores.base} pts`,
            },
          ];
        },
      ),
    [rounds, rescueSeries],
  );

  if (rounds.length === 0) {
    return (
      <EmptyState>
        <Timer className="mx-auto mb-3 size-8 text-base-content/30" />
        Nenhuma rodada registrada ainda. Use <strong>Nova rodada</strong> para
        jogar a primeira e ver a análise aqui.
      </EmptyState>
    );
  }

  const totals = results.map((r) => r.scores.total);
  const best = Math.max(...totals);
  const bestRound = rounds.find((e) => e.obrRound.scores.total === best)!;
  const last = totals[totals.length - 1];
  const prev = totals.length > 1 ? totals[totals.length - 2] : null;
  const multAvg = average(results.map((r) => r.scores.multiplier)) ?? 1;

  const decision = (() => {
    const { viva, morta } = rescue;
    if (
      !viva.count ||
      !morta.count ||
      viva.gain === null ||
      morta.gain === null
    )
      return null;
    const perSec = (g: number | null, s: number | null) =>
      g !== null && s ? g / s : null;
    const v = perSec(viva.gain, viva.seconds);
    const m = perSec(morta.gain, morta.seconds);
    if (v === null || m === null) return null;
    return m >= v
      ? `A vítima morta rendeu ${formatNumber(round1(m))} pts por segundo de busca, contra ${formatNumber(round1(v))} das vivas: vale buscá-la.`
      : `As vivas renderam ${formatNumber(round1(v))} pts por segundo de busca, contra ${formatNumber(round1(m))} da morta: garanta as vivas primeiro.`;
  })();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Melhor rodada"
          value={`${best} pts`}
          sub={`Rodada #${bestRound.executionNumber}`}
          icon={Award}
          accent="primary"
        />
        <StatCard
          label="Média"
          value={`${formatNumber(round1(average(totals) ?? 0))} pts`}
          sub={`${rounds.length} ${rounds.length === 1 ? "rodada" : "rodadas"}`}
          icon={BarChart3}
          accent="secondary"
        />
        <StatCard
          label="Última rodada"
          value={`${last} pts`}
          sub={
            prev === null
              ? "primeira rodada"
              : `${last - prev >= 0 ? "+" : ""}${last - prev} vs. anterior`
          }
          icon={TrendingUp}
          accent="info"
        />
        <StatCard
          label="Multiplicador médio"
          value={`×${formatNumber(Math.round(multAvg * 100) / 100)}`}
          sub="peso do resgate no placar"
          icon={Users}
          accent="accent"
        />
      </div>

      <SeriesChartPanel
        icon={TrendingUp}
        title="Pontuação por rodada"
        subtitle="Final e subtotal: a distância entre as duas é o que o resgate multiplicou"
        series={scoreSeries}
        rows={scoreRows}
        defaultType="line"
        types={["line", "bar", "area", "step", "scatter"]}
        height={260}
      />

      <SeriesChartPanel
        icon={Layers}
        title="De onde vêm os pontos"
        subtitle="Subtotal de cada rodada, antes do multiplicador"
        series={partSeries}
        rows={partRows}
        defaultType="stacked"
        types={["stacked", "bar", "line", "area", "radar"]}
        height={280}
      />

      {/* Perigos */}
      <div>
        <SectionHeader label="Taxa de sucesso por perigo" />
        {rateData.length === 0 ? (
          <EmptyState>Nenhuma tentativa de perigo registrada.</EmptyState>
        ) : (
          <CategoryChartPanel
            icon={ShieldCheck}
            title="Em quais desafios o robô mais falha"
            subtitle={
              worst
                ? `Mais difícil até agora: ${worst.label.toLowerCase()} (${worst.success} de ${worst.attempts})`
                : "Superados ÷ tentativas, somando todas as rodadas"
            }
            measure={{ key: "value", label: "Sucesso", unit: "%" }}
            data={rateData}
            defaultType="hbar"
            types={["hbar", "bar", "radar", "line"]}
          />
        )}
      </div>

      {/* Falhas */}
      <div>
        <SectionHeader label="Falhas no percurso" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="card border border-base-300/70 bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-4">
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-error" />
                <h3 className="text-sm font-semibold">Mapa de calor</h3>
              </div>
              {arena ? (
                heat.tiles.size > 0 ? (
                  <>
                    <ArenaMap
                      arena={arena}
                      heat={heat.tiles}
                      label="Mapa de calor das falhas"
                    />
                    <ul className="text-sm">
                      {hotTiles.map(([key, n]) => {
                        const [board, cell] = key.split(":").map(Number);
                        return (
                          <li
                            key={key}
                            className="flex justify-between border-b border-base-200 py-1 last:border-0"
                          >
                            <span className="text-base-content/70">
                              Tablado {board} · ladrilho {cell + 1}
                            </span>
                            <span className="font-mono">{n} falha(s)</span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-base-content/55">
                    Nenhuma falha marcada no mapa ainda. Na rodada, toque no
                    ladrilho de cada falha.
                  </p>
                )
              ) : (
                <p className="text-sm text-base-content/55">
                  Este teste não tem arena ligada. Crie um teste com a arena do
                  Criador de Arenas para ver o mapa de calor.
                </p>
              )}
              <p className="text-xs text-base-content/50">
                Use os trechos críticos na{" "}
                <Link
                  href="/obr/quickbrick/matriz-de-risco"
                  className="link link-primary"
                >
                  Matriz de Risco
                </Link>{" "}
                para decidir onde arriscar e onde recomeçar do checkpoint.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <SeriesChartPanel
              icon={TriangleAlert}
              title="Falhas por rodada"
              series={failureSeries}
              rows={failureRows}
              defaultType="stacked"
              types={["stacked", "bar", "line"]}
              height={200}
            />
            {checkpointData.length > 0 && (
              <CategoryChartPanel
                icon={TriangleAlert}
                title="Falhas por trecho"
                subtitle="Checkpoint em que o robô estava ao falhar"
                measure={{ key: "value", label: "Falhas" }}
                data={checkpointData}
                defaultType="bar"
                types={["bar", "hbar", "pie"]}
              />
            )}
          </div>
        </div>
      </div>

      {/* Resgate */}
      <div>
        <SectionHeader label="Sala de resgate" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Entrada na sala"
            value={formatSec(rescue.entryAvg)}
            sub={`média · entrou em ${rescue.entered} de ${rounds.length}`}
            icon={DoorOpen}
            accent="info"
          />
          <StatCard
            label="Tempo por vítima"
            value={formatSec(rescue.perVictimAvg)}
            sub="média entre depósitos"
            icon={Timer}
            accent="secondary"
          />
          <StatCard
            label="Vítimas resgatadas"
            value={`${rescue.vivas} ${rescue.vivas === 1 ? "viva" : "vivas"} · ${rescue.mortas} ${rescue.mortas === 1 ? "morta" : "mortas"}`}
            sub={`${rescue.invertidas} invertida(s) · ${rescue.surpresa} desafio(s) surpresa`}
            icon={Users}
            accent="primary"
          />
          <StatCard
            label="Capturas → depósitos"
            value={`${rescue.deposited}/${rescue.captures}`}
            sub={
              rescue.captures > 0
                ? `${formatNumber(round1((rescue.deposited / rescue.captures) * 100))}% de aproveitamento`
                : "sem capturas registradas"
            }
            icon={ShieldCheck}
            accent="accent"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SeriesChartPanel
            icon={Users}
            title="Capturas tentadas × depósitos"
            series={rescueSeries}
            rows={rescueRows}
            defaultType="bar"
            types={["bar", "line", "area"]}
            height={220}
          />
          <div className="card border border-base-300/70 bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-4">
              <h3 className="text-sm font-semibold">
                Vale a pena buscar cada vítima?
              </h3>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Depósito</th>
                    <th className="text-right">Vezes</th>
                    <th className="text-right">Pontos somados</th>
                    <th className="text-right">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Viva na área verde", rescue.viva],
                      ["Morta na área vermelha", rescue.morta],
                      ["Na área invertida", rescue.invertida],
                    ] as const
                  ).map(([label, row]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className="text-right font-mono">{row.count}</td>
                      <td className="text-right font-mono">
                        {row.gain === null
                          ? "—"
                          : `+${formatNumber(round1(row.gain))}`}
                      </td>
                      <td className="text-right font-mono">
                        {formatSec(row.seconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-base-content/55">
                Pontos somados = placar com o depósito menos o placar sem ele
                (média). O tempo é desde a entrada na sala ou o depósito
                anterior.
              </p>
              {decision && <p className="text-sm font-medium">{decision}</p>}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-base-content/45">
        Perigos considerados:{" "}
        {Object.values(HAZARD_SHORT).join(", ").toLowerCase()}.
      </p>
    </div>
  );
}
