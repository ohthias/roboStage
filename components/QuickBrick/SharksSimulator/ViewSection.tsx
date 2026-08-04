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
} from "lucide-react";
import Mat from "./Mat";
import CodeEditor from "./CodeEditor";
import VisualEditor from "./VisualEditor";
import {
  calculateTrajectory,
  parseCode,
  generateSegments,
  interpolateState,
  commandsToCode,
} from "./engine.service";
import { DEFAULT_CODE, START_ANGLE, START_X, START_Y } from "./constants";
import {
  RobotState,
  AnimationSegment,
  RobotConfig,
  Command,
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
  const [zoom, setZoom] = useState(4.0);
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

  return (
    <div className="flex flex-col w-full overflow-hidden font-sans">
      <header className="h-14 shrink-0 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <div className="join">
            <button
              onClick={togglePlay}
              className={`join-item btn btn-sm ${isPlaying ? "btn-warning" : "btn-primary"} gap-1.5`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? "Pausar" : "Iniciar"}
            </button>
            <button
              onClick={handleReset}
              className="join-item btn btn-sm btn-ghost"
              title="Reiniciar"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <span className="font-mono text-sm text-base-content/70">
            <span className="text-primary font-semibold">{time.toFixed(2)}s</span>
            <span className="text-base-content/40"> / {totalDuration.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-2 w-48">
          <span className="text-[10px] font-medium text-base-content/50 whitespace-nowrap">
            Velocidade
          </span>
          <input
            type="range"
            min={0.1}
            max={5.0}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="range range-xs range-primary"
          />
          <span className="text-xs font-mono w-8 text-right">{speed.toFixed(1)}x</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full relative">
        <aside className="w-full lg:w-[300px] bg-base-200 flex flex-col h-full shrink-0 rounded-lg border border-base-content/10 overflow-hidden">
          <div className="p-1.5 border-b border-base-content/10 flex items-center justify-between bg-base-300">
            <div className="flex gap-0.5 bg-base-300 rounded-md p-0.5">
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

          <div className="flex-1 overflow-hidden">
            {editorMode === "code" ? (
              <CodeEditor code={code} onChange={updateCode} />
            ) : (
              <VisualEditor code={code} onChange={updateCode} />
            )}
          </div>
        </aside>

        <section className="flex-grow relative flex items-center justify-center overflow-hidden p-3.5">
          <div className="relative z-10 max-w-full max-h-full">
            <Mat
              trajectory={trajectory}
              robotState={robotState}
              robotConfig={robotConfig}
              scale={zoom}
              onMapClick={handleMapClick}
              isInteractive={editorMode === "visual" || isSettingStart}
              isSettingStart={isSettingStart}
              isMoving={isPlaying}
              time={time}
            />
          </div>

          <div className="absolute bottom-4 right-4 z-20 card card-compact bg-base-100/90 backdrop-blur shadow-sm border border-base-300">
            <div className="card-body p-1.5">
              <div className="join">
                <button
                  onClick={() => setZoom(Math.max(2, zoom - 0.5))}
                  className="btn btn-xs join-item btn-square mx-1"
                  disabled={zoom <= 2}
                  aria-label="Diminuir zoom"
                >
                  <Minus size={11} />
                </button>
                <div className="join-item border-none font-mono rounded-none flex items-center justify-center mx-1">
                  {(zoom / 4).toFixed(1)}x
                </div>
                <button
                  onClick={() => setZoom(Math.min(8, zoom + 0.5))}
                  className="btn btn-xs join-item btn-square"
                  disabled={zoom >= 8}
                  aria-label="Aumentar zoom"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-[300px] bg-base-200 border border-base-content/10 flex flex-col h-full overflow-y-auto shrink-0 p-3.5 gap-3.5 rounded-lg">
          <Panel title="Posição de partida">
            <button
              onClick={() => setIsSettingStart(!isSettingStart)}
              className={`btn btn-sm w-full text-xs gap-1.5 ${isSettingStart ? "btn-warning" : "btn-outline"}`}
            >
              <Target size={13} />
              {isSettingStart ? "Definindo no mapa…" : "Definir no mapa"}
            </button>
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
                onChange={(e) => setRobotConfig({ ...robotConfig, shape: e.target.value as any })}
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
        </aside>
      </main>
    </div>
  );
};

export default ViewSection;