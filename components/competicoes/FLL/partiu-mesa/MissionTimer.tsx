"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Trash2 } from "lucide-react";

import type { Mission, MissionAttempt, MissionTimerConfig, MissionTimerSession, Season } from "@/utils/competitions/fll/partiu-mesa/types";
import { normalizeMissionsData, MissionsDataError } from "@/utils/competitions/fll/partiu-mesa/normalize";
import { buildMissionTimerResult, formatDurationMs } from "@/utils/competitions/fll/partiu-mesa/calculations";
import { clearSession, loadSession, saveSession } from "@/utils/competitions/fll/partiu-mesa/storage";
import { useClockTick } from "@/utils/competitions/fll/partiu-mesa/useClockTick";

import SeasonSelector from "./SeasonSelector";
import MissionSelector from "./MissionSelector";
import MissionSequence from "./MissionSequence";
import TimerDisplay from "./TimerDisplay";
import RunMission from "./RunMission";
import RunProgress from "./RunProgress";
import ResultsSummary from "./ResultsSummary";
import MissionResults from "./MissionResults";
import LaunchHistory from "./LaunchHistory";
import ExportResults from "./ExportResults";

type LoadStatus = "loading" | "error" | "ready";

const DURATION_PRESETS: { label: string; ms: number | "custom" }[] = [
  { label: "1:00", ms: 60_000 },
  { label: "1:30", ms: 90_000 },
  { label: "2:00", ms: 120_000 },
  { label: "2:30", ms: 150_000 },
  { label: "Personalizado", ms: "custom" },
];

const DEFAULT_DURATION_MS = 150_000; // 2:30

function newAttemptId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptySession(seasonId: string, seasonName: string, sequence: string[], config: MissionTimerConfig): MissionTimerSession {
  return {
    seasonId,
    seasonName,
    sequence,
    config,
    status: "setup",
    totalPausedMs: 0,
    currentIndex: 0,
    attempts: [],
  };
}

export default function MissionTimer() {
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [durationChoice, setDurationChoice] = useState<string>("2:30");
  const [customMinutes, setCustomMinutes] = useState<number>(2);
  const [customSeconds, setCustomSeconds] = useState<number>(30);

  const [session, setSession] = useState<MissionTimerSession | null>(null);
  const [finishReason, setFinishReason] = useState<"completed" | "timeout" | null>(null);
  const restoredRef = useRef(false);

  async function fetchMissions() {
    setLoadStatus("loading");
    setLoadError(null);
    try {
      const response = await fetch("/data/missions.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      const normalized = normalizeMissionsData(data);
      setSeasons(normalized);
      setLoadStatus("ready");
    } catch (err) {
      const message =
        err instanceof MissionsDataError
          ? "Os dados de missões estão em um formato inesperado."
          : "Não foi possível carregar as missões.";
      setLoadError(message);
      setLoadStatus("error");
    }
  }

  useEffect(() => {
    fetchMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restaura sessão salva localmente assim que as temporadas estiverem prontas.
  useEffect(() => {
    if (loadStatus !== "ready" || restoredRef.current) return;
    restoredRef.current = true;

    const saved = loadSession();
    if (!saved) return;

    const seasonExists = seasons.some((s) => s.id === saved.seasonId);
    if (!seasonExists) return;

    setSelectedSeasonId(saved.seasonId);
    setSequence(saved.sequence);

    if (saved.status === "setup") {
      setSession(saved);
    } else if (saved.status === "running" || saved.status === "paused") {
      setSession(saved);
    } else if (saved.status === "finished" || saved.status === "result") {
      setSession(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStatus, seasons]);

  const selectedSeason = useMemo(
    () => seasons.find((s) => s.id === selectedSeasonId) ?? null,
    [seasons, selectedSeasonId]
  );

  const missionsById = useMemo(() => {
    const map = new Map<string, Mission>();
    for (const season of seasons) {
      for (const mission of season.missions) map.set(mission.id, mission);
    }
    return map;
  }, [seasons]);

  const now = useClockTick(session?.status === "running");

  // Persiste a sessão localmente sempre que ela mudar de forma relevante.
  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  // Verifica, a cada tick, se o tempo esgotou durante a execução.
  useEffect(() => {
    if (!session || session.status !== "running" || !session.startedAt) return;
    const elapsed = now - session.startedAt - session.totalPausedMs;
    const remaining = session.config.durationMs - elapsed;
    if (remaining <= 0) {
      finishSession("timeout");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, session]);

  function toggleMission(missionId: string) {
    setSequence((prev) =>
      prev.includes(missionId) ? prev.filter((id) => id !== missionId) : [...prev, missionId]
    );
  }

  function moveSequence(index: number, direction: -1 | 1) {
    setSequence((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeFromSequence(index: number) {
    setSequence((prev) => prev.filter((_, i) => i !== index));
  }

  function resolveDurationMs(): number {
    if (durationChoice === "Personalizado") {
      return Math.max(1000, (customMinutes * 60 + customSeconds) * 1000);
    }
    const preset = DURATION_PRESETS.find((p) => p.label === durationChoice);
    return typeof preset?.ms === "number" ? preset.ms : DEFAULT_DURATION_MS;
  }

  function startTest() {
    if (!selectedSeason || sequence.length === 0) return;
    const config: MissionTimerConfig = {
      durationMs: resolveDurationMs(),
      label: durationChoice,
    };
    const newSession: MissionTimerSession = {
      ...createEmptySession(selectedSeason.id, selectedSeason.name, sequence, config),
      status: "running",
      startedAt: Date.now(),
    };
    setFinishReason(null);
    setSession(newSession);
  }

  function registerResult(result: "success" | "failure") {
    setSession((prev) => {
      if (!prev || prev.status !== "running" || !prev.startedAt) return prev;
      const missionId = prev.sequence[prev.currentIndex];
      if (!missionId) return prev;

      const timestamp = Date.now();
      const priorAttempt = prev.attempts[prev.attempts.length - 1];
      const startedAt = priorAttempt?.completedAt ?? prev.startedAt;

      const attempt: MissionAttempt = {
        id: newAttemptId(),
        missionId,
        sequence: prev.currentIndex + 1,
        startedAt,
        completedAt: timestamp,
        durationMs: timestamp - startedAt,
        result,
      };

      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= prev.sequence.length;

      const updated: MissionTimerSession = {
        ...prev,
        currentIndex: nextIndex,
        attempts: [...prev.attempts, attempt],
      };

      if (isComplete) {
        setFinishReason("completed");
        return { ...updated, status: "finished", finishedAt: Date.now() };
      }

      return updated;
    });
  }

  function finishSession(reason: "completed" | "timeout") {
    setSession((prev) => {
      if (!prev || (prev.status !== "running" && prev.status !== "paused")) return prev;

      const skippedAttempts: MissionAttempt[] = prev.sequence
        .slice(prev.currentIndex)
        .map((missionId, offset) => ({
          id: newAttemptId(),
          missionId,
          sequence: prev.currentIndex + offset + 1,
          startedAt: Date.now(),
          result: "skipped" as const,
        }));

      setFinishReason(reason);

      return {
        ...prev,
        status: "finished",
        finishedAt: Date.now(),
        attempts: [...prev.attempts, ...skippedAttempts],
      };
    });
  }

  function pauseSession() {
    setSession((prev) => {
      if (!prev || prev.status !== "running") return prev;
      return { ...prev, status: "paused", pausedAt: Date.now() };
    });
  }

  function resumeSession() {
    setSession((prev) => {
      if (!prev || prev.status !== "paused" || !prev.pausedAt) return prev;
      const pausedFor = Date.now() - prev.pausedAt;
      return {
        ...prev,
        status: "running",
        pausedAt: undefined,
        totalPausedMs: prev.totalPausedMs + pausedFor,
      };
    });
  }

  function endTestFromPause() {
    finishSession("timeout");
  }

  function goToResult() {
    setSession((prev) => (prev ? { ...prev, status: "result" } : prev));
  }

  function resetToSetup() {
    setSession(null);
    setFinishReason(null);
  }

  function clearAll() {
    clearSession();
    setSession(null);
    setFinishReason(null);
    setSequence([]);
    setSelectedSeasonId(null);
  }

  // ---------- Renderização por estado ----------

  if (loadStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60">Carregando missões...</p>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="alert alert-error max-w-lg mx-auto">
        <div>
          <p className="font-medium">{loadError}</p>
          <p className="text-sm">Verifique sua conexão e tente novamente.</p>
        </div>
        <button className="btn btn-sm" onClick={fetchMissions}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // ---- RESULT ----
  if (session && session.status === "result") {
    const result = buildMissionTimerResult(session, Array.from(missionsById.values()));
    return (
      <div className="max-w-6xl mx-auto space-y-10">
        <ResultsSummary result={result} />
        <MissionResults result={result} missionsById={missionsById} />
        <LaunchHistory attempts={result.attempts} />
        <ExportResults result={result} missionsById={missionsById} />

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-300">
          <button className="btn btn-outline gap-2" onClick={resetToSetup}>
            <RotateCcw className="w-4 h-4" />
            Nova sessão
          </button>
          <button className="btn btn-ghost gap-2 text-error" onClick={clearAll}>
            <Trash2 className="w-4 h-4" />
            Limpar sessão
          </button>
        </div>
      </div>
    );
  }

  // ---- FINISHED (transição antes do resultado) ----
  if (session && session.status === "finished") {
    const executedCount = session.attempts.filter((a) => a.result !== "skipped").length;
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold">
          {finishReason === "timeout" ? "Tempo esgotado" : "Sequência concluída"}
        </h2>
        <p className="text-base-content/60">
          {finishReason === "timeout"
            ? "O teste terminou antes da sequência."
            : "Todas as missões selecionadas foram executadas."}
        </p>
        {finishReason === "timeout" && (
          <p className="font-mono text-sm">
            Executadas: {executedCount} / {session.sequence.length}
          </p>
        )}
        <button className="btn btn-primary btn-lg mt-4" onClick={goToResult}>
          {finishReason === "timeout" ? "Ver resultado" : "Finalizar teste"}
        </button>
      </div>
    );
  }

  // ---- RUNNING / PAUSED ----
  if (session && (session.status === "running" || session.status === "paused") && session.startedAt) {
    const elapsed = now - session.startedAt - session.totalPausedMs;
    const remainingMs = Math.max(0, session.config.durationMs - elapsed);
    const currentMissionId = session.sequence[session.currentIndex];
    const currentMission = currentMissionId ? missionsById.get(currentMissionId) : undefined;

    if (session.status === "paused") {
      return (
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <h2 className="text-xl font-semibold text-base-content/70">Teste pausado</h2>
          <TimerDisplay remainingMs={remainingMs} />
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button className="btn btn-primary gap-2" onClick={resumeSession}>
              <Play className="w-4 h-4" />
              Continuar
            </button>
            <button className="btn btn-outline btn-error" onClick={endTestFromPause}>
              Encerrar teste
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto flex flex-col items-center gap-8 py-8">
        <TimerDisplay remainingMs={remainingMs} urgent={remainingMs <= 30_000} />
        <RunMission
          mission={currentMission}
          missionId={currentMissionId}
          onSuccess={() => registerResult("success")}
          onFailure={() => registerResult("failure")}
        />
        <RunProgress sequence={session.sequence} currentIndex={session.currentIndex} attempts={session.attempts} />
        <button className="btn btn-ghost gap-2" onClick={pauseSession} aria-label="Pausar teste">
          <Pause className="w-4 h-4" />
          Pausar
        </button>
      </div>
    );
  }

  // ---- SETUP ----
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <SeasonSelector
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSelect={(id) => {
          setSelectedSeasonId(id);
          setSequence([]);
        }}
      />

      {selectedSeason && (
        <>
          <MissionSelector missions={selectedSeason.missions} selectedIds={sequence} onToggle={toggleMission} />

          <MissionSequence
            sequence={sequence}
            missionsById={missionsById}
            onMoveUp={(index) => moveSequence(index, -1)}
            onMoveDown={(index) => moveSequence(index, 1)}
            onRemove={removeFromSequence}
          />

          {sequence.length > 0 && (
            <div className="card bg-base-200">
              <div className="card-body">
                <p className="font-medium">
                  {sequence.length} missõe{sequence.length !== 1 ? "s" : ""} selecionada
                  {sequence.length !== 1 ? "s" : ""}
                </p>

                <div className="form-control w-full max-w-xs mt-2">
                  <label className="label" htmlFor="mission-timer-duration">
                    <span className="label-text font-medium">Tempo de teste</span>
                  </label>
                  <select
                    id="mission-timer-duration"
                    className="select select-bordered"
                    value={durationChoice}
                    onChange={(e) => setDurationChoice(e.target.value)}
                  >
                    {DURATION_PRESETS.map((preset) => (
                      <option key={preset.label} value={preset.label}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                {durationChoice === "Personalizado" && (
                  <div className="flex items-end gap-3 mt-2">
                    <div className="form-control">
                      <label className="label" htmlFor="mission-timer-minutes">
                        <span className="label-text">Minutos</span>
                      </label>
                      <input
                        id="mission-timer-minutes"
                        type="number"
                        min={0}
                        max={30}
                        className="input input-bordered w-24"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label" htmlFor="mission-timer-seconds">
                        <span className="label-text">Segundos</span>
                      </label>
                      <input
                        id="mission-timer-seconds"
                        type="number"
                        min={0}
                        max={59}
                        className="input input-bordered w-24"
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                <p className="text-sm text-base-content/60 mt-2">
                  Duração selecionada: {formatDurationMs(resolveDurationMs())}
                </p>

                <button className="btn btn-primary btn-lg mt-4" onClick={startTest}>
                  Começar teste
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="pt-6 border-t border-base-300">
        <button className="btn btn-ghost btn-sm gap-2 text-error" onClick={clearAll}>
          <Trash2 className="w-4 h-4" />
          Limpar sessão
        </button>
      </div>
    </div>
  );
}
