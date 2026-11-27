"use client";
import { IconButton, Kbd, PropertyRow, ToolBadge, ToolInput, ToolScope, ToolSelect, cn } from "@/components/stage";
import { ActionButton, IconToggle, PanelCard, Section, ToggleRow } from "@/components/stage/tool/panel-kit";
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
} from "@/features/quickbrick/sharks-simulator/types";

/** Campo numérico compacto do kit (dentro de PropertyRow). */
const NumberField: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <ToolInput
    type="number"
    className="w-full font-mono text-xs"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
  />
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

  const statusPlay = isPlaying ? "Pausar" : time > 0 && time < totalDuration ? "Continuar" : "Iniciar";
  const missionsShown = showMissions ? missions.length : 0;

  return (
    <ToolScope className="flex h-[calc(100dvh-9rem)] min-h-[600px] w-full overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300">
      {/* ===================== Barra lateral (igual à Estratégia) ===================== */}
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-base-300 bg-base-100 xl:w-80">
        <div className="space-y-5 border-b border-base-300 p-3">
          {/* SIMULAÇÃO */}
          <Section
            title="Simulação"
            action={
              <ToolBadge tone={missionsDone > 0 ? "success" : "ink"} className="font-mono">
                <Flag className="size-3" /> {missionsDone}/{missions.length}
              </ToolBadge>
            }
          >
            <div className="flex gap-2">
              <ActionButton
                onClick={togglePlay}
                disabled={segments.length === 0}
                Icon={isPlaying ? Pause : Play}
                label={statusPlay}
                variant="primary"
                className="flex-1"
              />
              <ActionButton onClick={handleReset} Icon={RotateCcw} label="Reiniciar" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-12 font-mono text-[11px] font-semibold tabular-nums text-primary">{time.toFixed(2)}s</span>
              <input
                type="range"
                min={0}
                max={Math.max(totalDuration, 0.01)}
                step={0.01}
                value={Math.min(time, totalDuration)}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-base-100"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${totalDuration ? (Math.min(time, totalDuration) / totalDuration) * 100 : 0}%, var(--color-base-300) 0)`,
                }}
                aria-label="Linha do tempo"
                disabled={segments.length === 0}
              />
              <span className="w-12 text-right font-mono text-[11px] tabular-nums text-base-content/50">{totalDuration.toFixed(2)}s</span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {SPEEDS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSpeed(v)}
                  aria-pressed={speed === v}
                  title={`Velocidade ${v}x`}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                    speed === v
                      ? "border-base-content bg-base-content text-base-100"
                      : "border-base-300 bg-base-100 text-base-content/75 hover:border-base-content/30 hover:text-base-content",
                  )}
                >
                  {v}x
                </button>
              ))}
            </div>
          </Section>

          {/* VISUALIZAÇÃO */}
          <Section title="Visualização">
            <ToggleRow label="Mostrar missões" checked={showMissions} onChange={setShowMissions} />
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <span className="text-base-content/80">Zoom</span>
              <div className="flex items-center gap-0.5">
                <IconButton label="Diminuir zoom" size="xs" icon={<Minus />} onClick={() => setZoomFactor((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} />
                <span className="w-11 text-center font-mono text-[11px] tabular-nums">{Math.round(zoomFactor * 100)}%</span>
                <IconButton label="Aumentar zoom" size="xs" icon={<Plus />} onClick={() => setZoomFactor((z) => Math.min(3, +(z + 0.1).toFixed(2)))} />
                <IconButton label="Ajustar à tela" size="xs" icon={<Maximize2 />} onClick={() => setZoomFactor(1)} />
              </div>
            </div>
          </Section>
        </div>

        {/* ROTA — ocupa o resto da barra */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <Section
            title="Rota"
            action={
              <div className="flex items-center gap-0.5">
                <IconButton label="Desfazer" size="xs" icon={<Undo2 />} onClick={undo} disabled={historyIndex === 0} />
                <IconButton label="Refazer" size="xs" icon={<Redo2 />} onClick={redo} disabled={historyIndex === history.length - 1} />
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-1">
              <IconToggle active={editorMode === "code"} onClick={() => setEditorMode("code")} Icon={Code2} label="Código" showLabel />
              <IconToggle active={editorMode === "visual"} onClick={() => setEditorMode("visual")} Icon={MousePointerClick} label="Visual" showLabel />
            </div>
          </Section>

          {editorMode === "visual" && (
            <p className="rounded-md bg-info/10 px-2.5 py-1.5 text-[11px] text-base-content/70">
              Clique no tapete para adicionar um ponto à rota.
            </p>
          )}

          <div className="min-h-[180px] flex-1 overflow-hidden rounded-lg border border-base-300 bg-base-200">
            {editorMode === "code" ? (
              <CodeEditor code={code} onChange={updateCode} />
            ) : (
              <VisualEditor code={code} onChange={updateCode} />
            )}
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] text-base-content/55">
            <span>{commands.length} comandos</span>
            <span>{totalDistance.toFixed(0)} cm</span>
          </div>
        </div>
      </aside>

      {/* ===================== Tapete ===================== */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-base-200">
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
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-base-300 bg-base-100 px-3 py-1.5 font-mono text-[11px] text-base-content/65">
          <span className="flex items-center gap-1" title="Posição do robô (cm)">
            <Bot size={12} className="text-info" />
            {robotState.x.toFixed(1)}, {robotState.y.toFixed(1)}
          </span>
          <span className="flex items-center gap-1" title="Ângulo do robô">
            <Crosshair size={12} className="text-success" />
            {(((robotState.angle % 360) + 360) % 360).toFixed(1)}°
          </span>
          <span className="flex items-center gap-1" title="Cursor (cm)">
            <MousePointer2 size={12} />
            {pointerCm ? `${pointerCm.x.toFixed(1)}, ${pointerCm.y.toFixed(1)}` : "—"}
          </span>
          <span title="Missões no tapete">{missionsShown} missões</span>
          {touchingNames.length > 0 && <ToolBadge tone="warning">contato: {touchingNames.join(", ")}</ToolBadge>}
          <span className="ml-auto hidden items-center gap-1 text-base-content/40 xl:flex">
            <Keyboard size={12} /> Espaço+arrastar move · Esc cancela
          </span>
        </footer>
      </section>

      {/* ===================== Painel de propriedades ===================== */}
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-base-300 bg-base-100">
        <div className="border-b border-base-300 p-2">
          <div role="tablist" className="grid grid-cols-3 gap-1">
            {(
              [
                ["missions", "Missões", Flag],
                ["robot", "Robô", Bot],
                ["start", "Partida", Target],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={rightTab === id}
                onClick={() => setRightTab(id)}
                className={cn(
                  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                  rightTab === id
                    ? "border-base-content bg-base-content text-base-100"
                    : "border-base-300 bg-base-100 text-base-content/75 hover:border-base-content/30 hover:text-base-content",
                )}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
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
            <Section title="Posição de partida">
              <ActionButton
                onClick={toggleSettingStart}
                Icon={Target}
                label={isSettingStart ? "Definindo no mapa… (Esc)" : "Definir no mapa"}
                variant={isSettingStart ? "primary" : "neutral"}
                className="w-full"
              />
              <p className="text-[11px] leading-relaxed text-base-content/55">
                Clique para posicionar. <Kbd>Shift</Kbd>+clique aponta o robô na direção do cursor.
              </p>
              <PanelCard className="p-2">
                <PropertyRow label="X (cm)">
                  <NumberField value={startConfig.x} onChange={(v) => setStartConfig((p) => ({ ...p, x: v }))} />
                </PropertyRow>
                <PropertyRow label="Y (cm)">
                  <NumberField value={startConfig.y} onChange={(v) => setStartConfig((p) => ({ ...p, y: v }))} />
                </PropertyRow>
                <PropertyRow label="Ângulo (°)">
                  <NumberField value={startConfig.angle} onChange={(v) => setStartConfig((p) => ({ ...p, angle: v }))} />
                </PropertyRow>
              </PanelCard>
            </Section>
          )}

          {rightTab === "robot" && (
            <>
              <Section title="Dimensões">
                <PanelCard className="p-2">
                  <PropertyRow label="Largura (cm)">
                    <NumberField value={robotConfig.widthCm} onChange={(v) => setRobotConfig((p) => ({ ...p, widthCm: v }))} />
                  </PropertyRow>
                  <PropertyRow label="Comprim. (cm)" hint="Comprimento (cm)">
                    <NumberField value={robotConfig.lengthCm} onChange={(v) => setRobotConfig((p) => ({ ...p, lengthCm: v }))} />
                  </PropertyRow>
                </PanelCard>
              </Section>

              <Section title="Aparência">
                <PanelCard className="space-y-1 p-2">
                  <PropertyRow label="Chassi">
                    <ToolSelect
                      className="w-full"
                      value={robotConfig.shape}
                      onChange={(e) => setRobotConfig({ ...robotConfig, shape: e.target.value as RobotConfig["shape"] })}
                    >
                      <option value="tank">Esteiras (Tank)</option>
                      <option value="4x4">4x4 Tração integral</option>
                      <option value="fwd">Tração dianteira</option>
                      <option value="rwd">Tração traseira</option>
                      <option value="custom">SVG customizado</option>
                    </ToolSelect>
                  </PropertyRow>
                  <PropertyRow label="Cor">
                    <div className="flex items-center gap-2">
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-md ring-1 ring-base-content/15">
                        <span className="pointer-events-none absolute inset-0" style={{ background: robotConfig.color }} />
                        <input
                          aria-label="Cor do robô"
                          type="color"
                          value={robotConfig.color}
                          onChange={(e) => setRobotConfig({ ...robotConfig, color: e.target.value })}
                          className="absolute inset-0 size-full cursor-pointer opacity-0"
                        />
                      </span>
                      <ToolInput
                        className="w-full font-mono uppercase"
                        value={robotConfig.color}
                        onChange={(e) => setRobotConfig({ ...robotConfig, color: e.target.value })}
                      />
                    </div>
                  </PropertyRow>
                </PanelCard>

                {robotConfig.shape === "custom" && (
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Path SVG</span>
                    <textarea
                      value={robotConfig.customPath}
                      onChange={(e) => setRobotConfig({ ...robotConfig, customPath: e.target.value })}
                      className="w-full rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 font-mono text-[11px] transition-colors hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="M 50 0 L..."
                      rows={3}
                    />
                  </label>
                )}
              </Section>
            </>
          )}
        </div>
      </aside>
    </ToolScope>
  );
};

export default ViewSection;
