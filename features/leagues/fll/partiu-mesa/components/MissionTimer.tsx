"use client";

import { loadMissionCatalog } from "@/lib/data/missions-client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarRange,
  Flag,
  ListOrdered,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Target,
  Timer,
  TimerOff,
  Trash2,
} from "lucide-react";
import {
  Button,
  InlineAlert,
  Panel,
  Segmented,
  Starburst,
  TimerDial,
  ToolBadge,
  ToolButton,
  ToolEmpty,
  ToolInput,
  ToolScope,
  Toolbar,
  ToolbarGroup,
  ToolbarSpacer,
} from "@/components/stage";

import type { Mission, MissionAttempt, MissionTimerConfig, MissionTimerSession, Season } from "@/features/leagues/fll/partiu-mesa/lib/types";
import { normalizeMissionsData, MissionsDataError } from "@/features/leagues/fll/partiu-mesa/lib/normalize";
import { buildMissionTimerResult, formatDurationMs } from "@/features/leagues/fll/partiu-mesa/lib/calculations";
import { clearSession, loadSession, saveSession } from "@/features/leagues/fll/partiu-mesa/lib/storage";
import { useClockTick } from "@/features/leagues/fll/partiu-mesa/hooks/useClockTick";

import SeasonSelector from "./SeasonSelector";
import MissionSelector from "./MissionSelector";
import MissionSequence from "./MissionSequence";
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
      const data: unknown = await loadMissionCatalog();
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

  // Os IDs (M01, M02…) se repetem entre temporadas: a temporada da sessão
  // (ou a escolhida) vem por último para vencer as outras no mapa.
  const activeSeasonId = session?.seasonId ?? selectedSeasonId;
  const missionsById = useMemo(() => {
    const map = new Map<string, Mission>();
    const ordered = [...seasons].sort((a, b) => Number(a.id === activeSeasonId) - Number(b.id === activeSeasonId));
    for (const season of ordered) {
      for (const mission of season.missions) map.set(mission.id, mission);
    }
    return map;
  }, [seasons, activeSeasonId]);

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
      <div className="flex flex-col items-center justify-center gap-4 py-24" role="status">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60">Carregando missões...</p>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <InlineAlert
        type="error"
        title={loadError}
        className="mx-auto max-w-lg"
        action={
          <ToolButton size="sm" onClick={fetchMissions} icon={<RefreshCw />}>
            Tentar novamente
          </ToolButton>
        }
      >
        Verifique sua conexão e tente novamente.
      </InlineAlert>
    );
  }

  // ---- RESULT ----
  if (session && session.status === "result") {
    const result = buildMissionTimerResult(session, Array.from(missionsById.values()));
    return (
      <ToolScope className="mx-auto max-w-6xl space-y-4 rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300 p-4 sm:p-6">
        <ResultsSummary result={result} />
        <MissionResults result={result} missionsById={missionsById} />
        <LaunchHistory attempts={result.attempts} />
        <ExportResults result={result} missionsById={missionsById} />

        <div className="flex flex-wrap justify-end gap-2 border-t border-base-300 pt-4">
          <ToolButton variant="danger" size="md" icon={<Trash2 />} onClick={clearAll}>
            Limpar sessão
          </ToolButton>
          <ToolButton variant="primary" size="md" icon={<RotateCcw />} onClick={resetToSetup}>
            Nova sessão
          </ToolButton>
        </div>
      </ToolScope>
    );
  }

  // ---- FINISHED (transição antes do resultado) ----
  if (session && session.status === "finished") {
    const executedCount = session.attempts.filter((a) => a.result !== "skipped").length;
    const timeout = finishReason === "timeout";
    return (
      <div className="stage-paper relative mx-auto max-w-md space-y-4 overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 px-6 py-12 text-center shadow-[8px_8px_0_0_var(--stage-shadow)]">
        <Starburst
          size={56}
          tone={timeout ? "warning" : "accent"}
          motion="spin"
          className="absolute right-4 top-4"
        >
          {timeout ? <TimerOff size={18} strokeWidth={3} /> : <Flag size={18} strokeWidth={3} />}
        </Starburst>
        <p className="stage-kicker text-base-content/45">/ FIM DO TESTE</p>
        <h2 className="stage-display text-3xl">{timeout ? "Tempo esgotado" : "Sequência concluída"}</h2>
        <p className="text-base-content/60">
          {timeout ? "O teste terminou antes da sequência." : "Todas as missões selecionadas foram executadas."}
        </p>
        {timeout && (
          <p className="font-mono text-sm">
            Executadas: {executedCount} / {session.sequence.length}
          </p>
        )}
        <Button tone="primary" size="lg" className="mt-4" onClick={goToResult} iconRight={<ArrowRight size={18} />}>
          {timeout ? "Ver resultado" : "Finalizar teste"}
        </Button>
      </div>
    );
  }

  // ---- RUNNING / PAUSED ----
  if (session && (session.status === "running" || session.status === "paused") && session.startedAt) {
    const elapsed = now - session.startedAt - session.totalPausedMs;
    const remainingMs = Math.max(0, session.config.durationMs - elapsed);
    const currentMissionId = session.sequence[session.currentIndex];
    const currentMission = currentMissionId ? missionsById.get(currentMissionId) : undefined;
    const done = session.attempts.length;
    const total = session.sequence.length;

    if (session.status === "paused") {
      return (
        <div className="stage-paper mx-auto max-w-md space-y-6 rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 px-6 py-12 text-center">
          <div className="flex justify-center">
            <TimerDial totalTime={session.config.durationMs / 1000} currentTime={remainingMs / 1000} label="PAUSADO" size={240} />
          </div>
          <div className="mx-auto flex max-w-xs flex-col gap-3">
            <Button tone="primary" onClick={resumeSession} iconLeft={<Play size={18} />}>
              Continuar
            </Button>
            <ToolButton variant="danger" size="md" onClick={endTestFromPause}>
              Encerrar teste
            </ToolButton>
          </div>
        </div>
      );
    }

    return (
      <div className="stage-paper mx-auto flex max-w-xl flex-col items-center gap-8 rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 px-6 py-10">
        <div className="flex w-full items-center justify-between">
          <p className="stage-kicker text-base-content/45">
            / MISSÃO {Math.min(done + 1, total)} DE {total}
          </p>
          <ToolButton variant="ghost" icon={<Pause />} onClick={pauseSession} aria-label="Pausar teste">
            Pausar
          </ToolButton>
        </div>
        <TimerDial totalTime={session.config.durationMs / 1000} currentTime={remainingMs / 1000} label="PARTIU MESA" size={260}>
          <span className="stage-label mt-2 text-base-content/50">
            {done}/{total} missões
          </span>
        </TimerDial>
        <RunMission
          mission={currentMission}
          missionId={currentMissionId}
          onSuccess={() => registerResult("success")}
          onFailure={() => registerResult("failure")}
        />
        <RunProgress sequence={session.sequence} currentIndex={session.currentIndex} attempts={session.attempts} />
      </div>
    );
  }

  // ---- SETUP ----
  return (
    <ToolScope className="mx-auto max-w-6xl overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300">
      <Toolbar label="Sessão do Partiu Mesa!" className="px-3">
        <ToolbarGroup className="min-w-0 flex-1 basis-60">
          <SeasonSelector
            seasons={seasons}
            selectedSeasonId={selectedSeasonId}
            onSelect={(id) => {
              setSelectedSeasonId(id);
              setSequence([]);
            }}
          />
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolButton variant="danger" icon={<Trash2 />} onClick={clearAll}>
          Limpar sessão
        </ToolButton>
      </Toolbar>

      {!selectedSeason ? (
        <div className="p-4 sm:p-6">
          <ToolEmpty
            icon={<CalendarRange />}
            title="Escolha uma temporada"
            description="As missões da temporada aparecem aqui para você montar a sequência do teste."
          />
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
          <Panel
            title="Missões disponíveis"
            icon={<Target />}
            actions={<ToolBadge>{selectedSeason.missions.length}</ToolBadge>}
          >
            <MissionSelector missions={selectedSeason.missions} selectedIds={sequence} onToggle={toggleMission} />
          </Panel>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Panel
              title="Sua sequência"
              icon={<ListOrdered />}
              actions={sequence.length > 0 ? <ToolBadge tone="primary">{sequence.length}</ToolBadge> : undefined}
            >
              <MissionSequence
                sequence={sequence}
                missionsById={missionsById}
                onMoveUp={(index) => moveSequence(index, -1)}
                onMoveDown={(index) => moveSequence(index, 1)}
                onRemove={removeFromSequence}
              />
            </Panel>

            {sequence.length > 0 && (
              <Panel title="Tempo de teste" icon={<Timer />}>
                <Segmented
                  label="Tempo de teste"
                  value={durationChoice}
                  onChange={setDurationChoice}
                  options={DURATION_PRESETS.map((p) => ({
                    value: p.label,
                    label: p.ms === "custom" ? "Outro" : p.label,
                    title: p.label,
                  }))}
                  className="flex w-full [&>button]:flex-1"
                />

                {durationChoice === "Personalizado" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
                        Minutos
                      </span>
                      <ToolInput
                        id="mission-timer-minutes"
                        type="number"
                        min={0}
                        max={30}
                        suffix="min"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
                        Segundos
                      </span>
                      <ToolInput
                        id="mission-timer-seconds"
                        type="number"
                        min={0}
                        max={59}
                        suffix="s"
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(Number(e.target.value))}
                      />
                    </label>
                  </div>
                )}

                <p className="mt-3 text-xs text-base-content/60">
                  {sequence.length} {sequence.length !== 1 ? "missões selecionadas" : "missão selecionada"} ·{" "}
                  <span className="font-mono font-semibold text-base-content">
                    {formatDurationMs(resolveDurationMs())}
                  </span>
                </p>

                <Button tone="primary" size="lg" className="mt-4 w-full" onClick={startTest} iconLeft={<Play size={18} />}>
                  Começar teste
                </Button>
              </Panel>
            )}
          </div>
        </div>
      )}
    </ToolScope>
  );
}
