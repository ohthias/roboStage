"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Target,
  Code2,
  MousePointerClick,
  Undo2,
  Redo2,
  Minus,
  Plus,
  Maximize2,
  Flag,
  Bot,
  Crosshair,
  MousePointer2,
  Keyboard,
} from "lucide-react";
import Mat from "./Mat";
import CodeEditor from "./CodeEditor";
import VisualEditor from "./VisualEditor";
import MissionsPanel, { MissionEditMode } from "./MissionsPanel";
import { useMissionProgress, useMissions } from "./useMissions";
import {
  calculateTrajectory,
  parseCode,
  generateSegments,
  interpolateState,
  commandsToCode,
} from "./engine.service";
import {
  DEFAULT_CODE,
  START_ANGLE,
  START_X,
  START_Y,
  TAPETE_HEIGHT_CM,
  TAPETE_WIDTH_CM,
} from "./constants";
import {
  RobotState,
  AnimationSegment,
  RobotConfig,
  Command,
  Coordinate,
} from "@/types/SharksSimulator.types";

const Panel: React.FC<{
  title: string;
  className?: string;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  children: React.ReactNode;
}> = ({ title, className = "", onDragOver, onDragLeave, onDrop, children }) => (
  <section
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={`rounded-lg bg-base-100 border border-base-content/10 p-3.5 space-y-3 transition-shadow ${className}`}
  >
    <h2 className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">
      {title}
    </h2>
    {children}
  </section>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => (
  <label className="form-control w-full">
    <span className="text-[10px] font-medium text-base-content/50 mb-1">
      {label}
    </span>
    <input
      type="number"
      className="input input-bordered input-sm font-mono text-xs w-full"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  </label>
);


const ViewSection: React.FC = () => {
  const [history, setHistory] = useState<string[]>([DEFAULT_CODE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const code = history[historyIndex];

  const updateCode = useCallback(
    (newCode: string) => {
      setHistory((prev) => {
        if (newCode === prev[historyIndex]) return prev;
        const trimmed = prev.slice(0, historyIndex + 1);
        const next = [...trimmed, newCode].slice(-50);
        setHistoryIndex(next.length - 1);
        return next;
      });
    },
    [historyIndex],
  );

  const undo = () => historyIndex > 0 && setHistoryIndex((i) => i - 1);
  const redo = () =>
    historyIndex < history.length - 1 && setHistoryIndex((i) => i + 1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [rightTab, setRightTab] = useState<"missions" | "robot" | "start">("missions");
  const [pointerCm, setPointerCm] = useState<{ x: number; y: number } | null>(null);

  // --- Tapete se ajusta ao espaço disponível --------------------------------
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(4);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const compute = () => {
      // descontos: réguas (esquerda/topo) e respiro
      const w = el.clientWidth - 64;
      const h = el.clientHeight - 56;
      if (w <= 0 || h <= 0) return;
      setFitScale(Math.max(1.5, Math.min(w / TAPETE_WIDTH_CM, h / TAPETE_HEIGHT_CM)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = fitScale * zoomFactor;
  const [editorMode, setEditorMode] = useState<"code" | "visual">("code");

  const [startConfig, setStartConfig] = useState({
    x: START_X,
    y: START_Y,
    angle: START_ANGLE,
  });
  const [isSettingStart, setIsSettingStart] = useState(false);

  const [robotConfig, setRobotConfig] = useState<RobotConfig>({
    widthCm: 18,
    lengthCm: 22,
    shape: "tank",
    color: "#06b6d4",
    customPath: "M 50 0 L 100 100 L 50 80 L 0 100 Z",
  });

  const [robotState, setRobotState] = useState<RobotState>({
    x: START_X,
    y: START_Y,
    angle: START_ANGLE,
  });

  const segmentsRef = useRef<AnimationSegment[]>([]);
  const animationReqRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedWhenPausedRef = useRef<number>(0);

  const commands = useMemo(() => parseCode(code), [code]);

  const trajectory = useMemo(
    () =>
      calculateTrajectory(
        commands,
        startConfig.x,
        startConfig.y,
        startConfig.angle,
      ),
    [commands, startConfig],
  );

  const segments = useMemo(
    () => generateSegments(trajectory, speed),
    [trajectory, speed],
  );

  const totalDuration =
    segments.length > 0 ? segments[segments.length - 1].endTime / 1000 : 0;

  // --- Missões ---------------------------------------------------------------
  const { missions, addMission, updateMission, removeMission, resetMissions, replaceMissions } = useMissions();
  const [showMissions, setShowMissions] = useState(true);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [missionEdit, setMissionEdit] = useState<MissionEditMode>(null);
  const [missionDraft, setMissionDraft] = useState<Coordinate[]>([]);

  const missionProgress = useMissionProgress(
    missions,
    segments,
    startConfig,
    robotState,
    robotConfig,
    time,
  );

  const startMissionEdit = (missionId: string, kind: "zone" | "activation") => {
    setIsSettingStart(false);
    setRightTab("missions");
    setShowMissions(true);
    setSelectedMissionId(missionId);
    setMissionDraft([]);
    setMissionEdit({ missionId, kind });
  };

  const cancelMissionEdit = () => {
    setMissionEdit(null);
    setMissionDraft([]);
  };

  const finishMissionZone = () => {
    if (missionEdit?.kind === "zone" && missionDraft.length >= 3) {
      updateMission(missionEdit.missionId, { vertices: missionDraft });
    }
    cancelMissionEdit();
  };

  const handleAddMission = () => {
    const created = addMission();
    setShowMissions(true);
    setSelectedMissionId(created.id);
  };

  const handleRemoveMission = (id: string) => {
    if (missionEdit?.missionId === id) cancelMissionEdit();
    if (selectedMissionId === id) setSelectedMissionId(null);
    removeMission(id);
  };

  const missionEditHint =
    missionEdit?.kind === "zone"
      ? `ZONA: clique para marcar os cantos (${missionDraft.length})`
      : missionEdit?.kind === "activation"
        ? "ALVO: clique para posicionar"
        : null;
  useEffect(() => {
    setIsPlaying(false);
    if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    setRobotState({ x: startConfig.x, y: startConfig.y, angle: startConfig.angle });
    elapsedWhenPausedRef.current = 0;
    setTime(0);
  }, [code, startConfig]);

  useEffect(() => {
    if (isPlaying) {
      const oldDuration =
        segmentsRef.current.length > 0
          ? segmentsRef.current[segmentsRef.current.length - 1].endTime
          : 1;
      const progress = (performance.now() - startTimeRef.current) / oldDuration;
      const newDuration =
        segments.length > 0 ? segments[segments.length - 1].endTime : 0;
      startTimeRef.current = performance.now() - progress * newDuration;
    }
    segmentsRef.current = segments;
  }, [speed]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const animate = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const duration =
      segmentsRef.current.length > 0
        ? segmentsRef.current[segmentsRef.current.length - 1].endTime
        : 0;

    if (elapsed > duration) {
      setIsPlaying(false);
      setTime(duration / 1000);
      elapsedWhenPausedRef.current = duration;
      if (segmentsRef.current.length > 0) {
        setRobotState(segmentsRef.current[segmentsRef.current.length - 1].endState);
      }
      return;
    }

    const newState = interpolateState(segmentsRef.current, elapsed);
    if (newState) {
      setRobotState(newState);
      setTime(elapsed / 1000);
      animationReqRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      elapsedWhenPausedRef.current = performance.now() - startTimeRef.current;
      if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
      return;
    }

    segmentsRef.current = segments;
    const duration = segments.length > 0 ? segments[segments.length - 1].endTime : 0;

    if (elapsedWhenPausedRef.current >= duration || elapsedWhenPausedRef.current === 0) {
      startTimeRef.current = performance.now();
      elapsedWhenPausedRef.current = 0;
    } else {
      startTimeRef.current = performance.now() - elapsedWhenPausedRef.current;
    }

    setIsPlaying(true);
    animationReqRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    elapsedWhenPausedRef.current = 0;
    setTime(0);
    setRobotState({ x: startConfig.x, y: startConfig.y, angle: startConfig.angle });
  };

  /** Pula para um instante da simulação (linha do tempo). */
  const seekTo = (seconds: number) => {
    if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    setIsPlaying(false);
    const ms = Math.max(0, Math.min(seconds * 1000, totalDuration * 1000));
    elapsedWhenPausedRef.current = ms;
    setTime(ms / 1000);
    if (ms === 0) {
      setRobotState({ x: startConfig.x, y: startConfig.y, angle: startConfig.angle });
      return;
    }
    const state = interpolateState(segments, ms);
    if (state) setRobotState(state);
  };

  const toggleSettingStart = () => {
    if (!isSettingStart) {
      cancelMissionEdit();
      setRightTab("start");
    }
    setIsSettingStart((v) => !v);
  };

  // Atalhos: Esc cancela modos de edição; Enter conclui a zona sendo desenhada
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "Escape") {
        setIsSettingStart(false);
        setMissionEdit(null);
        setMissionDraft([]);
      } else if (e.key === "Enter" && missionEdit?.kind === "zone" && missionDraft.length >= 3) {
        updateMission(missionEdit.missionId, { vertices: missionDraft });
        setMissionEdit(null);
        setMissionDraft([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [missionEdit, missionDraft, updateMission]);

  const handleMapClick = (targetX: number, targetY: number, isShiftKey: boolean) => {
    if (isSettingStart) {
      if (isShiftKey) {
        const angleRad = Math.atan2(targetX - startConfig.x, targetY - startConfig.y);
        setStartConfig((prev) => ({
          ...prev,
          angle: parseFloat(((angleRad * 180) / Math.PI).toFixed(1)),
        }));
      } else {
        setStartConfig((prev) => ({
          ...prev,
          x: parseFloat(targetX.toFixed(1)),
          y: parseFloat(targetY.toFixed(1)),
        }));
      }
      return;
    }

    if (missionEdit) {
      const point = { x: parseFloat(targetX.toFixed(1)), y: parseFloat(targetY.toFixed(1)) };
      if (missionEdit.kind === "activation") {
        updateMission(missionEdit.missionId, { activation: point });
        cancelMissionEdit();
      } else {
        setMissionDraft((prev) => [...prev, point]);
      }
      return;
    }

    if (editorMode !== "visual") return;

    const lastPoint = trajectory[trajectory.length - 1];
    const dx = targetX - lastPoint.x;
    const dy = targetY - lastPoint.y;
    const dist = Math.hypot(dx, dy);
    const targetAngleDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
    let angleDiff = targetAngleDeg - (lastPoint.angle % 360);
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    const newCommands: Command[] = [];
    if (Math.abs(angleDiff) > 1.0)
      newCommands.push({ type: "giro", val: parseFloat(angleDiff.toFixed(1)), speed: 60 });
    if (dist > 0.5)
      newCommands.push({ type: "reto", val: parseFloat(dist.toFixed(1)), speed: 50 });
    if (newCommands.length > 0)
      updateCode(commandsToCode([...commands, ...newCommands]));
  };

  const totalDistance = commands
    .filter((c) => c.type === "reto")
    .reduce((sum, c) => sum + Math.abs(c.val), 0);
  const missionsDone = missions.filter((m) => missionProgress.completed.has(m.id)).length;
  const touchingNames = missions
    .filter((m) => missionProgress.touching.has(m.id))
    .map((m) => m.name);
  const SPEEDS = [0.5, 1, 2, 5];

  return (
    <div className="flex flex-col w-full gap-3 font-sans">
      {/* ===================== Barra de controle ===================== */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-base-content/10 bg-base-100 px-3 py-2">
        <div className="join">
          <button
            onClick={togglePlay}
            disabled={segments.length === 0}
            className={`join-item btn btn-sm ${isPlaying ? "btn-warning" : "btn-primary"} gap-1.5 w-28`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? "Pausar" : time > 0 && time < totalDuration ? "Continuar" : "Iniciar"}
          </button>
          <button onClick={handleReset} className="join-item btn btn-sm btn-ghost" title="Reiniciar">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Linha do tempo */}
        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <span className="w-14 text-right font-mono text-xs font-semibold text-primary">{time.toFixed(2)}s</span>
          <input
            type="range"
            min={0}
            max={Math.max(totalDuration, 0.01)}
            step={0.01}
            value={Math.min(time, totalDuration)}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="range range-xs range-primary flex-1"
            aria-label="Linha do tempo"
            disabled={segments.length === 0}
          />
          <span className="w-14 font-mono text-xs text-base-content/50">{totalDuration.toFixed(2)}s</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-base-content/50">Velocidade</span>
          <div className="join">
            {SPEEDS.map((v) => (
              <button
                key={v}
                onClick={() => setSpeed(v)}
                className={`join-item btn btn-xs font-mono ${speed === v ? "btn-neutral" : "btn-ghost border-base-content/10"}`}
              >
                {v}x
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setRightTab("missions")}
          className="btn btn-sm btn-ghost gap-1.5"
          title="Missões concluídas"
        >
          <Flag size={14} className={missionsDone > 0 ? "text-success" : ""} />
          <span className="font-mono text-xs">
            <span className="font-semibold text-success">{missionsDone}</span>
            <span className="text-base-content/40">/{missions.length}</span>
          </span>
        </button>
      </header>

      {/* ===================== Área de trabalho ===================== */}
      <main className="grid h-[calc(100dvh-9rem)] min-h-[560px] w-full grid-cols-[260px_minmax(0,1fr)_320px] gap-3 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        {/* --- Editor de rota --- */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-base-content/10 bg-base-200">
          <div className="flex items-center justify-between border-b border-base-content/10 bg-base-300 p-1.5">
            <div className="flex gap-0.5 rounded-md p-0.5">
              <button
                className={`btn btn-xs h-6 min-h-0 text-[11px] ${editorMode === "code" ? "btn-default" : "btn-ghost"}`}
                onClick={() => setEditorMode("code")}
              >
                <Code2 size={11} className="mr-1" /> Código
              </button>
              <button
                className={`btn btn-xs h-6 min-h-0 text-[11px] ${editorMode === "visual" ? "btn-default" : "btn-ghost"}`}
                onClick={() => setEditorMode("visual")}
              >
                <MousePointerClick size={11} className="mr-1" /> Visual
              </button>
            </div>
            <div className="join">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="btn btn-xs h-6 min-h-0 btn-ghost join-item"
                title="Desfazer"
              >
                <Undo2 size={11} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="btn btn-xs h-6 min-h-0 btn-ghost join-item"
                title="Refazer"
              >
                <Redo2 size={11} />
              </button>
            </div>
          </div>

          {editorMode === "visual" && (
            <p className="border-b border-base-content/10 bg-info/10 px-3 py-1.5 text-[10px] text-base-content/70">
              Clique no tapete para adicionar um ponto à rota.
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            {editorMode === "code" ? (
              <CodeEditor code={code} onChange={updateCode} />
            ) : (
              <VisualEditor code={code} onChange={updateCode} />
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-base-content/10 bg-base-300 px-3 py-1.5 font-mono text-[10px] text-base-content/60">
            <span>{commands.length} comandos</span>
            <span>{totalDistance.toFixed(0)} cm percorridos</span>
          </footer>
        </aside>

        {/* --- Tapete --- */}
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-base-content/10 bg-base-200">
          <div ref={stageRef} className="relative min-h-0 flex-1 overflow-auto">
            <div className="flex min-h-full min-w-max items-center justify-center pb-4 pl-12 pr-4 pt-9">
              <Mat
                trajectory={trajectory}
                robotState={robotState}
                robotConfig={robotConfig}
                scale={scale}
                onMapClick={handleMapClick}
                isInteractive={editorMode === "visual" || isSettingStart || missionEdit !== null}
                isSettingStart={isSettingStart}
                isMoving={isPlaying}
                time={time}
                missions={missions}
                completedMissions={missionProgress.completed}
                touchingMissions={missionProgress.touching}
                selectedMissionId={selectedMissionId}
                missionDraftVertices={missionEdit?.kind === "zone" ? missionDraft : null}
                showMissions={showMissions}
                editHint={
                  isSettingStart
                    ? "PARTIDA: clique para posicionar · Shift+clique define o ângulo"
                    : missionEditHint
                }
                showInfoPanel={false}
                onPointerCm={setPointerCm}
              />
            </div>
          </div>

          {/* Barra de status */}
          <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-base-content/10 bg-base-100 px-3 py-1.5 font-mono text-[10px] text-base-content/70">
            <span className="flex items-center gap-1" title="Posição do robô (cm)">
              <Bot size={11} className="text-info" />
              {robotState.x.toFixed(1)}, {robotState.y.toFixed(1)}
            </span>
            <span className="flex items-center gap-1" title="Ângulo do robô">
              <Crosshair size={11} className="text-success" />
              {(((robotState.angle % 360) + 360) % 360).toFixed(1)}°
            </span>
            <span className="flex items-center gap-1" title="Cursor (cm)">
              <MousePointer2 size={11} />
              {pointerCm ? `${pointerCm.x.toFixed(1)}, ${pointerCm.y.toFixed(1)}` : "—"}
            </span>
            {touchingNames.length > 0 && (
              <span className="badge badge-warning badge-xs font-sans">contato: {touchingNames.join(", ")}</span>
            )}

            <span className="ml-auto hidden items-center gap-1 text-base-content/40 xl:flex">
              <Keyboard size={11} /> Espaço+arrastar move · Esc cancela
            </span>

            <div className="join ml-auto xl:ml-0">
              <button
                onClick={() => setZoomFactor((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                className="btn btn-xs join-item btn-ghost"
                aria-label="Diminuir zoom"
              >
                <Minus size={11} />
              </button>
              <span className="join-item flex w-11 items-center justify-center">{Math.round(zoomFactor * 100)}%</span>
              <button
                onClick={() => setZoomFactor((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className="btn btn-xs join-item btn-ghost"
                aria-label="Aumentar zoom"
              >
                <Plus size={11} />
              </button>
              <button
                onClick={() => setZoomFactor(1)}
                className="btn btn-xs join-item btn-ghost"
                title="Ajustar à tela"
              >
                <Maximize2 size={11} />
              </button>
            </div>
          </footer>
        </section>

        {/* --- Painel lateral em abas --- */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-base-content/10 bg-base-200">
          <div role="tablist" className="grid grid-cols-3 gap-0.5 border-b border-base-content/10 bg-base-300 p-1">
            {(
              [
                ["missions", "Missões", Flag],
                ["robot", "Robô", Bot],
                ["start", "Partida", Target],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={rightTab === id}
                onClick={() => setRightTab(id)}
                className={`btn btn-xs h-7 min-h-0 gap-1 text-[11px] ${rightTab === id ? "btn-default" : "btn-ghost"}`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {rightTab === "missions" && (
              <MissionsPanel
                missions={missions}
                completed={missionProgress.completed}
                touching={missionProgress.touching}
                completionTimes={missionProgress.completionTimes}
                selectedId={selectedMissionId}
                onSelect={(id) => {
                  if (missionEdit && missionEdit.missionId !== id) cancelMissionEdit();
                  setSelectedMissionId(id);
                }}
                editMode={missionEdit}
                draftCount={missionDraft.length}
                onStartEdit={startMissionEdit}
                onFinishZone={finishMissionZone}
                onCancelEdit={cancelMissionEdit}
                onUpdate={updateMission}
                onRemove={handleRemoveMission}
                onAdd={handleAddMission}
                onReset={() => {
                  cancelMissionEdit();
                  setSelectedMissionId(null);
                  resetMissions();
                }}
                onImport={(list) => {
                  cancelMissionEdit();
                  setSelectedMissionId(null);
                  replaceMissions(list);
                }}
                showMissions={showMissions}
                onToggleShow={() => setShowMissions((v) => !v)}
              />
            )}

            {rightTab === "start" && (
              <Panel title="Posição de partida">
                <button
                  onClick={toggleSettingStart}
                  className={`btn btn-sm w-full text-xs gap-1.5 ${isSettingStart ? "btn-warning" : "btn-outline"}`}
                >
                  <Target size={13} />
                  {isSettingStart ? "Definindo no mapa… (Esc)" : "Definir no mapa"}
                </button>
                <p className="text-[10px] text-base-content/50">
                  Clique para posicionar. Shift+clique aponta o robô na direção do cursor.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <NumberField
                    label="X (cm)"
                    value={startConfig.x}
                    onChange={(v) => setStartConfig((p) => ({ ...p, x: v }))}
                  />
                  <NumberField
                    label="Y (cm)"
                    value={startConfig.y}
                    onChange={(v) => setStartConfig((p) => ({ ...p, y: v }))}
                  />
                  <NumberField
                    label="Ângulo (°)"
                    value={startConfig.angle}
                    onChange={(v) => setStartConfig((p) => ({ ...p, angle: v }))}
                  />
                </div>
              </Panel>
            )}

            {rightTab === "robot" && (
              <Panel title="Robô">
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Largura (cm)"
                    value={robotConfig.widthCm}
                    onChange={(v) => setRobotConfig((p) => ({ ...p, widthCm: v }))}
                  />
                  <NumberField
                    label="Comprimento (cm)"
                    value={robotConfig.lengthCm}
                    onChange={(v) => setRobotConfig((p) => ({ ...p, lengthCm: v }))}
                  />
                </div>

                <label className="form-control w-full">
                  <span className="text-[10px] font-medium text-base-content/50 mb-1">Chassi</span>
                  <select
                    className="select select-bordered select-sm w-full text-xs"
                    value={robotConfig.shape}
                    onChange={(e) =>
                      setRobotConfig({ ...robotConfig, shape: e.target.value as RobotConfig["shape"] })
                    }
                  >
                    <option value="tank">Esteiras (Tank Drive)</option>
                    <option value="4x4">4x4 Tração integral</option>
                    <option value="fwd">Tração dianteira (FWD)</option>
                    <option value="rwd">Tração traseira (RWD)</option>
                    <option value="custom">Desenho SVG customizado</option>
                  </select>
                </label>

                <label className="form-control w-full">
                  <span className="text-[10px] font-medium text-base-content/50 mb-1">Cor</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-9 h-9 rounded border border-base-content/20 bg-transparent cursor-pointer shrink-0"
                      value={robotConfig.color}
                      onChange={(e) => setRobotConfig({ ...robotConfig, color: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm flex-1 font-mono uppercase text-xs"
                      value={robotConfig.color}
                      onChange={(e) => setRobotConfig({ ...robotConfig, color: e.target.value })}
                    />
                  </div>
                </label>

                {robotConfig.shape === "custom" && (
                  <label className="form-control w-full">
                    <span className="text-[10px] font-medium text-base-content/50 mb-1">Path SVG</span>
                    <textarea
                      value={robotConfig.customPath}
                      onChange={(e) => setRobotConfig({ ...robotConfig, customPath: e.target.value })}
                      className="textarea textarea-bordered textarea-xs w-full font-mono text-[10px]"
                      placeholder="M 50 0 L..."
                      rows={2}
                    />
                  </label>
                )}
              </Panel>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ViewSection;