"use client";

// ---------------------------------------------------------------------------
// Partida cronometrada da FLL Future Edition.
//
// Fluxo: Iniciar → o tempo corre e cada toque nos objetivos é contabilizado
// (com o instante em que aconteceu) → ao fim do tempo (ou "Encerrar") a
// pontuação é somada, o resumo e o ritmo da partida aparecem e a partida pode
// ser salva. A análise completa fica na página do teste.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Timer as TimerIcon,
  Trophy,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useFutureEditionData } from "@/hooks/useFutureEditionData";
import {
  FE_PENALTY_EVENT_ID,
  buildFEResult,
  buildTimeline,
  clampObjectiveValue,
  formatClock,
  maxMissionScore,
  replayEvents,
  scoreFutureEdition,
  type FEData,
  type FEEvent,
  type FEMission,
  type FEObjective,
  type FEObjectiveValue,
} from "@/utils/labtest/future-edition";
import type { SeriesDatum } from "@/utils/labtest/chart-data";
import { SeriesChartPanel } from "../charts/SeriesChart";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/actions";
import { updateLabTestStatus } from "@/app/(protected)/dashboard/labtest/new/actions";

import { unwrapAction } from "@/utils/stagebook/action-result";
type Status = "idle" | "running" | "paused" | "finished";

function beep(frequency: number, ms: number) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
    setTimeout(() => ctx.close(), ms + 150);
  } catch {
    /* sem áudio disponível — tudo bem */
  }
}

// ---------------------------------------------------------------------------
// Objetivos
// ---------------------------------------------------------------------------

function ObjectiveRow({
  objective,
  value,
  score,
  disabled,
  onChange,
}: {
  objective: FEObjective;
  value: FEObjectiveValue | undefined;
  score: number;
  disabled: boolean;
  onChange: (value: FEObjectiveValue) => void;
}) {
  const count = typeof value === "number" ? value : (objective.min ?? 0);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-base-200 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{objective.label}</p>
        <p className="mt-0.5 text-xs text-base-content/50">
          {objective.type === "counter"
            ? `${objective.pointsPerUnit ?? 0} pts cada${objective.max !== undefined ? ` · máx. ${objective.max}` : ""}`
            : objective.type === "toggle"
              ? `${objective.points ?? 0} pts`
              : "escolha uma opção"}
        </p>
      </div>

      {objective.type === "counter" && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || count <= (objective.min ?? 0)}
            onClick={() => onChange(count - 1)}
            className="btn btn-circle btn-outline btn-sm"
            aria-label={`Diminuir ${objective.label}`}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-9 text-center text-lg font-black tabular-nums">{count}</span>
          <button
            type="button"
            disabled={disabled || count >= (objective.max ?? Number.POSITIVE_INFINITY)}
            onClick={() => onChange(count + 1)}
            className="btn btn-circle btn-primary btn-sm"
            aria-label={`Aumentar ${objective.label}`}
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}

      {objective.type === "toggle" && (
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={value === true}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={objective.label}
        />
      )}

      {objective.type === "select" && (
        <select
          className="select select-bordered select-sm"
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">—</option>
          {objective.options?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} · {option.points} pts
            </option>
          ))}
        </select>
      )}

      <span
        className={`w-12 shrink-0 text-right text-lg font-black tabular-nums ${score > 0 ? "text-primary" : "text-base-content/25"}`}
      >
        {score}
      </span>
    </div>
  );
}

function MissionPanel({
  mission,
  values,
  objectiveScores,
  missionScore,
  disabled,
  onChange,
}: {
  mission: FEMission;
  values: Record<string, FEObjectiveValue>;
  objectiveScores: Record<string, number>;
  missionScore: number;
  disabled: boolean;
  onChange: (objective: FEObjective, value: FEObjectiveValue) => void;
}) {
  const max = maxMissionScore(mission);

  return (
    <section
      className={`card border bg-base-100 shadow-sm transition ${missionScore > 0 ? "border-primary/30" : "border-base-300/70"}`}
    >
      <div className="card-body gap-2 p-5">
        <header className="flex items-start gap-3">
          {mission.image && (
            <img
              src={mission.image}
              alt=""
              className="size-14 shrink-0 rounded-xl bg-base-200 object-contain p-1"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="badge badge-primary badge-soft badge-sm font-mono">{mission.code}</span>
            <h3 className="mt-1 text-base font-bold leading-tight">{mission.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black tabular-nums text-primary">{missionScore}</p>
            {max !== null && <p className="text-[10px] text-base-content/40">de {max}</p>}
          </div>
        </header>

        <div>
          {mission.objectives.map((objective) => (
            <ObjectiveRow
              key={objective.id}
              objective={objective}
              value={values[objective.id]}
              score={objectiveScores[objective.id] ?? 0}
              disabled={disabled}
              onChange={(value) => onChange(objective, value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function FutureEditionMatch({
  testId,
  testName,
  nextExecutionNumber,
  durationSec,
}: {
  testId: string;
  testName: string;
  nextExecutionNumber: number;
  durationSec: number;
}) {
  const { data, error, loading } = useFutureEditionData();

  const [status, setStatus] = useState<Status>("idle");
  const [finishedBy, setFinishedBy] = useState<"time" | "manual">("time");
  const [elapsed, setElapsed] = useState(0);
  const [events, setEvents] = useState<FEEvent[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedNumber, setSavedNumber] = useState<number | null>(null);
  const [matchNumber, setMatchNumber] = useState(nextExecutionNumber);

  const elapsedRef = useRef(0);
  const baseRef = useRef(0);
  const lastTickRef = useRef<number>(-1);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const play = useCallback((frequency: number, ms: number) => {
    if (!mutedRef.current) beep(frequency, ms);
  }, []);

  // -- cronômetro (baseado em performance.now para não acumular atraso) -----
  useEffect(() => {
    if (status !== "running") return;

    const startedAt = performance.now();
    const base = baseRef.current;

    const id = window.setInterval(() => {
      const value = base + (performance.now() - startedAt) / 1000;

      if (value >= durationSec) {
        window.clearInterval(id);
        elapsedRef.current = durationSec;
        baseRef.current = durationSec;
        setElapsed(durationSec);
        setFinishedBy("time");
        setStatus("finished");
        play(440, 900);
        return;
      }

      elapsedRef.current = value;
      setElapsed(value);

      const remaining = Math.ceil(durationSec - value);
      if (remaining <= 3 && remaining !== lastTickRef.current) {
        lastTickRef.current = remaining;
        play(660, 90);
      }
    }, 100);

    return () => window.clearInterval(id);
  }, [status, durationSec, play]);

  // Avisa antes de sair com uma partida não salva.
  useEffect(() => {
    const dirty = status !== "idle" && savedNumber === null;
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status, savedNumber]);

  const start = () => {
    lastTickRef.current = -1;
    setStatus("running");
    if (elapsedRef.current === 0) play(880, 220);
  };

  const pause = () => {
    baseRef.current = elapsedRef.current;
    setStatus("paused");
  };

  const finishManually = () => {
    baseRef.current = elapsedRef.current;
    setFinishedBy("manual");
    setStatus("finished");
    play(440, 500);
  };

  const resetAll = () => {
    elapsedRef.current = 0;
    baseRef.current = 0;
    lastTickRef.current = -1;
    setElapsed(0);
    setEvents([]);
    setStatus("idle");
    setFinishedBy("time");
    setReviewing(false);
    setNotes("");
    setSaveError(null);
  };

  const canScore = status === "running" || status === "paused" || (status === "finished" && reviewing);

  const record = (id: string, value: FEObjectiveValue) => {
    if (!canScore) return;
    const review = status === "finished";
    const t = review ? Math.min(elapsedRef.current, durationSec) : elapsedRef.current;
    setEvents((prev) => [...prev, { t, id, value, ...(review ? { review: true } : {}) }]);
  };

  const undo = () => {
    if (!canScore) return;
    setEvents((prev) => prev.slice(0, -1));
  };

  // -- placar ----------------------------------------------------------------
  const live = useMemo(() => {
    if (!data) return null;
    const { values, penaltyCount } = replayEvents(data, events);
    return { values, penaltyCount, scored: scoreFutureEdition(data, values, penaltyCount) };
  }, [data, events]);

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    data?.missions.forEach((mission) =>
      mission.objectives.forEach((objective) =>
        map.set(objective.id, `${mission.code} · ${objective.label}`),
      ),
    );
    map.set(FE_PENALTY_EVENT_ID, "Penalidades");
    return map;
  }, [data]);

  const timelineRows = useMemo<SeriesDatum[]>(() => {
    if (!data || status !== "finished") return [];
    return buildTimeline(data, events, durationSec, 10).map((point) => ({
      __name: formatClock(point.t),
      __title: `Aos ${formatClock(point.t)}`,
      __x: point.t,
      total: point.total,
    }));
  }, [data, events, durationSec, status]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = buildFEResult(
        data,
        events,
        durationSec,
        finishedBy === "time" ? durationSec : elapsedRef.current,
        finishedBy,
      );
      unwrapAction(await createTestExecution({
        testId,
        notes: notes.trim() || undefined,
        results: { futureEdition: result },
      }));
      if (matchNumber === 1) {
        unwrapAction(await updateLabTestStatus({ testId, status: "em_andamento" }));
      }
      setSavedNumber(matchNumber);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar a partida.");
    } finally {
      setSaving(false);
    }
  };

  const newMatch = () => {
    setMatchNumber((n) => n + 1);
    setSavedNumber(null);
    resetAll();
  };

  // -- render ----------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-base-300 bg-base-100 p-10">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !data || !live) {
    return (
      <div role="alert" className="alert alert-error alert-soft">
        {error ?? "Não foi possível carregar os dados da Future Edition."}
      </div>
    );
  }

  const remaining = Math.max(0, durationSec - elapsed);
  const progress = Math.min(100, (elapsed / durationSec) * 100);
  const timeTone =
    status === "finished"
      ? "text-base-content"
      : remaining <= 10
        ? "text-error"
        : remaining <= 30
          ? "text-warning"
          : "text-base-content";
  const { scored } = live;
  const recentEvents = [...events].reverse().slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      {/* Cronômetro + placar (fixo no topo) */}
      <section className="card sticky top-2 z-20 border border-base-300/70 bg-base-100 shadow-md">
        <div className="card-body gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-base-content/50">
                {testName}
              </p>
              <p className="text-sm font-bold">Partida #{matchNumber}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`badge badge-soft ${
                  status === "running"
                    ? "badge-success"
                    : status === "paused"
                      ? "badge-warning"
                      : status === "finished"
                        ? "badge-primary"
                        : "badge-ghost"
                }`}
              >
                {status === "idle"
                  ? "Pronta"
                  : status === "running"
                    ? "Em andamento"
                    : status === "paused"
                      ? "Pausada"
                      : "Encerrada"}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? "Ativar som" : "Silenciar"}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
            </div>
          </div>

          <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
            <div className="flex items-center gap-3">
              <TimerIcon className="size-6 text-base-content/30" />
              <p className={`font-mono text-5xl font-black tabular-nums sm:text-6xl ${timeTone}`}>
                {formatClock(status === "finished" ? durationSec - Math.min(elapsed, durationSec) : remaining)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {status === "idle" && (
                <button type="button" className="btn btn-primary btn-lg gap-2 rounded-full" onClick={start}>
                  <Play className="size-5" />
                  Iniciar partida
                </button>
              )}
              {status === "running" && (
                <button type="button" className="btn btn-warning gap-2 rounded-full" onClick={pause}>
                  <Pause className="size-4" />
                  Pausar
                </button>
              )}
              {status === "paused" && (
                <button type="button" className="btn btn-success gap-2 rounded-full" onClick={start}>
                  <Play className="size-4" />
                  Continuar
                </button>
              )}
              {(status === "running" || status === "paused") && (
                <button type="button" className="btn btn-outline gap-2 rounded-full" onClick={finishManually}>
                  <Flag className="size-4" />
                  Encerrar
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost gap-2 rounded-full"
                onClick={undo}
                disabled={!canScore || events.length === 0}
              >
                <Undo2 className="size-4" />
                Desfazer
              </button>
              {status !== "idle" && savedNumber === null && (
                <button
                  type="button"
                  className="btn btn-ghost gap-2 rounded-full text-error"
                  onClick={() => {
                    if (confirm("Descartar esta partida e começar de novo?")) resetAll();
                  }}
                >
                  <RotateCcw className="size-4" />
                  Reiniciar
                </button>
              )}
            </div>

            <div className="rounded-tl-2xl rounded-br-2xl bg-primary px-6 py-3 text-center text-primary-content sm:min-w-36">
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Pontuação</p>
              <p className="text-4xl font-black tabular-nums">{scored.total}</p>
              {scored.zeroed && <p className="text-[10px] font-bold">ZERADA</p>}
            </div>
          </div>

          <progress
            className={`progress h-2 w-full ${remaining <= 10 && status !== "idle" ? "progress-error" : remaining <= 30 && status !== "idle" ? "progress-warning" : "progress-primary"}`}
            value={progress}
            max={100}
            aria-label="Tempo decorrido"
          />
        </div>
      </section>

      {status === "idle" && (
        <div role="status" className="alert alert-info alert-soft">
          <TimerIcon className="size-5" />
          <span className="text-sm">
            Toque em <strong>Iniciar partida</strong> para liberar a pontuação. Cada alteração é registrada
            com o instante em que aconteceu, e a soma final é feita quando o tempo acabar.
          </span>
        </div>
      )}

      {/* Resultado da partida */}
      {status === "finished" && (
        <section className="card border border-primary/30 bg-base-100 shadow-sm">
          <div className="card-body gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-black">
                    {finishedBy === "time" ? "Tempo esgotado!" : "Partida encerrada"}
                  </h2>
                  <p className="text-sm text-base-content/55">
                    Resultado da Partida #{matchNumber} · {formatClock(finishedBy === "time" ? durationSec : elapsed)} jogados
                  </p>
                </div>
              </div>
              <p className="text-5xl font-black tabular-nums text-primary">
                {scored.total}
                <span className="ml-1 text-lg font-bold text-base-content/40">pts</span>
              </p>
            </div>

            {scored.zeroed && (
              <div role="alert" className="alert alert-error alert-soft">
                <AlertTriangle className="size-5" />
                <span className="text-sm">
                  {scored.penaltyCount} penalidades: a pontuação total da partida é zerada.
                </span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Missão</th>
                      <th className="text-right">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scored.missions.map((mission) => (
                      <tr key={mission.id}>
                        <td>
                          <span className="badge badge-ghost badge-sm mr-2 font-mono">{mission.code}</span>
                          {mission.title}
                        </td>
                        <td className="text-right font-bold tabular-nums">{mission.score}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="text-base-content/60">Subtotal das missões</td>
                      <td className="text-right font-bold tabular-nums">{scored.missionsTotal}</td>
                    </tr>
                    <tr className="text-error">
                      <td>Penalidades ({scored.penaltyCount})</td>
                      <td className="text-right font-bold tabular-nums">
                        {scored.zeroed ? "zera o total" : scored.penaltyPoints}
                      </td>
                    </tr>
                    <tr className="bg-base-200/60 text-base">
                      <td className="font-black">Total</td>
                      <td className="text-right text-lg font-black tabular-nums">{scored.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SeriesChartPanel
                compact
                title="Ritmo da partida"
                series={[{ key: "total", label: "Pontuação acumulada", unit: "pts" }]}
                rows={timelineRows}
                defaultType="area"
                types={["area", "line", "step", "bar"]}
                height={240}
              />
            </div>

            {savedNumber === null ? (
              <div className="flex flex-col gap-3">
                <label className="form-control">
                  <span className="label-text mb-1 text-xs font-semibold uppercase tracking-wide">
                    Observações da partida
                  </span>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={2}
                    placeholder="O que funcionou, o que falhou, mudanças no robô…"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>

                {saveError && (
                  <div role="alert" className="alert alert-error alert-soft text-sm">
                    {saveError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary gap-2 rounded-full"
                    onClick={save}
                    disabled={saving}
                  >
                    {saving ? <span className="loading loading-spinner loading-sm" /> : <Save className="size-4" />}
                    Salvar partida
                  </button>
                  <button
                    type="button"
                    className={`btn gap-2 rounded-full ${reviewing ? "btn-warning" : "btn-outline"}`}
                    onClick={() => setReviewing((value) => !value)}
                  >
                    {reviewing ? "Concluir correção" : "Corrigir pontuação"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost gap-2 rounded-full text-error"
                    onClick={() => {
                      if (confirm("Descartar esta partida sem salvar?")) resetAll();
                    }}
                  >
                    Descartar
                  </button>
                </div>
                {reviewing && (
                  <p className="text-xs text-warning">
                    Modo de correção: os ajustes valem para o placar final e não alteram o ritmo ao longo do tempo.
                  </p>
                )}
              </div>
            ) : (
              <div role="status" className="alert alert-success alert-soft items-start">
                <CheckCircle2 className="size-5" />
                <div className="flex-1">
                  <p className="font-semibold">Partida #{savedNumber} salva!</p>
                  <p className="text-sm opacity-80">
                    A análise com gráficos de todas as partidas está na página do teste.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/dashboard/labtest/${testId}`} className="btn btn-sm btn-success rounded-full">
                      Ver análise
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline rounded-full" onClick={newMatch}>
                      Nova partida
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pontuador */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {data.missions.map((mission) => (
            <MissionPanel
              key={mission.id}
              mission={mission}
              values={live.values}
              objectiveScores={scored.byObjective}
              missionScore={scored.byMission[mission.id] ?? 0}
              disabled={!canScore}
              onChange={(objective, value) =>
                record(objective.id, clampObjectiveValue(objective, value))
              }
            />
          ))}
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-52">
          <section className="card border border-error/30 bg-error/5 shadow-sm">
            <div className="card-body gap-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-error/70">{data.penalties.code}</span>
                  <h3 className="text-base font-bold text-error">{data.penalties.title}</h3>
                </div>
                <span className="text-2xl font-black text-error">
                  {scored.zeroed ? "ZERA" : scored.penaltyPoints}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-circle btn-outline btn-sm"
                  disabled={!canScore || live.penaltyCount === 0}
                  onClick={() => record(FE_PENALTY_EVENT_ID, Math.max(0, live.penaltyCount - 1))}
                  aria-label="Diminuir penalidades"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-xl font-black tabular-nums">{live.penaltyCount}</span>
                <button
                  type="button"
                  className="btn btn-circle btn-error btn-sm"
                  disabled={!canScore}
                  onClick={() => record(FE_PENALTY_EVENT_ID, live.penaltyCount + 1)}
                  aria-label="Aumentar penalidades"
                >
                  <Plus className="size-4" />
                </button>
                <span className="text-xs text-base-content/60">recebidas</span>
              </div>

              <ul className="text-xs text-base-content/60">
                {data.penalties.table.map((tier) => (
                  <li
                    key={tier.count}
                    className={live.penaltyCount === tier.count || (tier.count === Math.max(...data.penalties.table.map((t) => t.count)) && live.penaltyCount > tier.count) ? "font-bold text-error" : ""}
                  >
                    {tier.count}
                    {tier.zeroesTotal ? "+" : ""} penalidade(s): {tier.zeroesTotal ? "zera a pontuação total" : `${tier.points} pts`}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card border border-base-300/70 bg-base-100 shadow-sm">
            <div className="card-body gap-2 p-5">
              <h3 className="text-sm font-bold">Últimos registros</h3>
              {recentEvents.length === 0 ? (
                <p className="text-xs text-base-content/45">Nada registrado ainda.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {recentEvents.map((event, index) => (
                    <li
                      key={`${event.t}-${event.id}-${index}`}
                      className="flex items-center gap-2 rounded-lg bg-base-200/60 px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-mono font-bold text-primary">{formatClock(event.t)}</span>
                      <span className="min-w-0 flex-1 truncate">{labelById.get(event.id) ?? event.id}</span>
                      <span className="font-bold tabular-nums">
                        {typeof event.value === "boolean" ? (event.value ? "sim" : "não") : String(event.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export type { FEData };
