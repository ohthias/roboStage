"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Redo2,
  Minus,
  Plus,
  Bot,
  MapPin,
  Target,
  Gauge,
} from "lucide-react";
import MatMobile from "./MatMobile";
import MobileWaypointsSheet from "./MobileWaypointsSheet";
import MobileRobotSheet from "./MobileRobotSheet";
import BottomSheetMobile from "./BottomSheetMobile";
import {
  calculateTrajectory,
  parseCode,
  generateSegments,
  interpolateState,
  commandsToCode,
  pointToCommands,
  commandsToWaypoints,
  removeWaypoint,
  updateWaypoint,
  Waypoint,
} from "./engine.service";
import { DEFAULT_CODE, START_ANGLE, START_X, START_Y, TAPETE_WIDTH_CM } from "./constants";
import { RobotState, RobotConfig } from "@/types/SharksSimulator.types";

const ViewSectionMobile: React.FC = () => {
  // --- Code / history (kept 100% compatible with the desktop engine) ------
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
  const redo = () => historyIndex < history.length - 1 && setHistoryIndex((i) => i + 1);

  // --- Playback -------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  // --- Start position ---------------------------------------------------
  const [startConfig, setStartConfig] = useState({ x: START_X, y: START_Y, angle: START_ANGLE });
  const [isSettingStart, setIsSettingStart] = useState(false);

  // --- Robot config -------------------------------------------------------
  const [robotConfig, setRobotConfig] = useState<RobotConfig>({
    widthCm: 18,
    lengthCm: 22,
    shape: "tank",
    color: "#06b6d4",
    customPath: "M 50 0 L 100 100 L 50 80 L 0 100 Z",
  });

  const [robotState, setRobotState] = useState<RobotState>({ x: START_X, y: START_Y, angle: START_ANGLE });

  // --- Sheets / overlays --------------------------------------------------
  const [sheet, setSheet] = useState<"none" | "waypoints" | "robot" | "speed">("none");

  // --- Fit-to-screen zoom ---------------------------------------------------
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(2.2);
  const [zoomFactor, setZoomFactor] = useState(1);
  const scale = fitScale * zoomFactor;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const compute = () => {
      const availableWidth = el.clientWidth - 16; // small breathing room
      setFitScale(Math.max(0.8, availableWidth / TAPETE_WIDTH_CM));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const segmentsRef = useRef<ReturnType<typeof generateSegments>>([]);
  const animationReqRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedWhenPausedRef = useRef<number>(0);

  const commands = useMemo(() => parseCode(code), [code]);
  const trajectory = useMemo(
    () => calculateTrajectory(commands, startConfig.x, startConfig.y, startConfig.angle),
    [commands, startConfig],
  );
  const waypoints: Waypoint[] = useMemo(() => commandsToWaypoints(commands, trajectory), [commands, trajectory]);
  const segments = useMemo(() => generateSegments(trajectory, speed), [trajectory, speed]);
  const totalDuration = segments.length > 0 ? segments[segments.length - 1].endTime / 1000 : 0;

  useEffect(() => {
    setIsPlaying(false);
    if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    setRobotState({ x: startConfig.x, y: startConfig.y, angle: startConfig.angle });
    elapsedWhenPausedRef.current = 0;
    setTime(0);
  }, [code, startConfig]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const animate = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const duration =
      segmentsRef.current.length > 0 ? segmentsRef.current[segmentsRef.current.length - 1].endTime : 0;

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

  // --- The core mobile interaction: tap the mat to drive ------------------
  const handleTap = (xCm: number, yCm: number) => {
    if (isSettingStart) {
      setStartConfig((prev) => ({ ...prev, x: parseFloat(xCm.toFixed(1)), y: parseFloat(yCm.toFixed(1)) }));
      return;
    }
    const lastPoint = trajectory[trajectory.length - 1];
    const newCommands = pointToCommands(lastPoint, xCm, yCm);
    if (newCommands.length > 0) {
      updateCode(commandsToCode([...commands, ...newCommands]));
    }
  };

  const handleSelectWaypoint = (_trajectoryIndex: number) => {
    setSheet("waypoints");
  };

  const handleRemoveWaypoint = (wp: Waypoint) => {
    updateCode(commandsToCode(removeWaypoint(commands, wp)));
  };

  const handleUpdateWaypointSpeed = (wp: Waypoint, moveSpeed: number) => {
    updateCode(commandsToCode(updateWaypoint(commands, wp, { moveSpeed })));
  };

  const handleClearAll = () => {
    updateCode("# Toque no tapete para adicionar pontos\n");
    setSheet("none");
  };

  const rotateStart = (deltaDeg: number) => {
    setStartConfig((prev) => ({ ...prev, angle: (prev.angle + deltaDeg + 360) % 360 }));
  };

  return (
    <div className="flex flex-col w-full h-[100dvh] overflow-hidden bg-base-100">
      {/* Compact top bar */}
      <header className="h-12 shrink-0 px-3 flex items-center justify-between border-b border-base-content/10">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={16} className="text-primary shrink-0" />
          <span className="font-mono text-xs text-base-content/70 truncate">
            <span className="text-primary font-semibold">{time.toFixed(1)}s</span>
            <span className="text-base-content/40"> / {totalDuration.toFixed(1)}s</span>
          </span>
        </div>
        <div className="join">
          <button onClick={undo} disabled={historyIndex === 0} className="join-item btn btn-xs btn-ghost">
            <Undo2 size={13} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="join-item btn btn-xs btn-ghost"
          >
            <Redo2 size={13} />
          </button>
        </div>
      </header>

      {/* Mat area */}
      <div ref={wrapperRef} className="flex-1 relative overflow-auto flex items-start justify-center p-2">
        <MatMobile
          trajectory={trajectory}
          robotState={robotState}
          robotConfig={robotConfig}
          scale={scale}
          isMoving={isPlaying}
          time={time}
          onTap={handleTap}
          onSelectWaypoint={handleSelectWaypoint}
          selectedTrajectoryIndex={null}
          isSettingStart={isSettingStart}
        />

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 z-20 card card-compact bg-base-100/90 backdrop-blur shadow-sm border border-base-300">
          <div className="card-body p-1">
            <div className="join">
              <button
                onClick={() => setZoomFactor((z) => Math.max(0.6, z - 0.15))}
                className="join-item btn btn-xs btn-square"
                aria-label="Diminuir zoom"
              >
                <Minus size={12} />
              </button>
              <div className="join-item flex items-center justify-center px-1.5 font-mono text-[10px]">
                {(zoomFactor * 100).toFixed(0)}%
              </div>
              <button
                onClick={() => setZoomFactor((z) => Math.min(2.5, z + 0.15))}
                className="join-item btn btn-xs btn-square"
                aria-label="Aumentar zoom"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Set-start helper overlay */}
        {isSettingStart && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-base-100/95 backdrop-blur border border-base-300 rounded-xl shadow-lg px-3 py-2 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-base-content/60">📍 Toque para posicionar</span>
            <div className="join">
              <button onClick={() => rotateStart(-15)} className="join-item btn btn-xs btn-square">
                ↺
              </button>
              <div className="join-item flex items-center justify-center px-2 font-mono text-[10px] min-w-[38px]">
                {startConfig.angle.toFixed(0)}°
              </div>
              <button onClick={() => rotateStart(15)} className="join-item btn btn-xs btn-square">
                ↻
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick access row */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 border-t border-base-content/10 shrink-0">
        <button
          onClick={() => setIsSettingStart((v) => !v)}
          className={`btn btn-sm gap-1.5 ${isSettingStart ? "btn-warning" : "btn-outline"}`}
        >
          <Target size={14} /> Início
        </button>
        <button onClick={() => setSheet("waypoints")} className="btn btn-sm btn-outline gap-1.5">
          <MapPin size={14} /> Pontos ({waypoints.length})
        </button>
        <button onClick={() => setSheet("robot")} className="btn btn-sm btn-outline gap-1.5">
          <Bot size={14} /> Robô
        </button>
      </div>

      {/* Playback bar */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1 shrink-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}>
        <button onClick={handleReset} className="btn btn-square btn-ghost" title="Reiniciar">
          <RotateCcw size={16} />
        </button>
        <button
          onClick={togglePlay}
          className={`btn flex-1 gap-2 ${isPlaying ? "btn-warning" : "btn-primary"}`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? "Pausar" : "Iniciar"}
        </button>
        <button onClick={() => setSheet("speed")} className="btn btn-square btn-ghost" title="Velocidade">
          <Gauge size={16} />
        </button>
      </div>

      {/* Sheets */}
      <MobileWaypointsSheet
        open={sheet === "waypoints"}
        onClose={() => setSheet("none")}
        waypoints={waypoints}
        onRemove={handleRemoveWaypoint}
        onUpdateSpeed={handleUpdateWaypointSpeed}
        onClearAll={handleClearAll}
      />

      <MobileRobotSheet
        open={sheet === "robot"}
        onClose={() => setSheet("none")}
        robotConfig={robotConfig}
        onChange={setRobotConfig}
      />

      <BottomSheetMobile open={sheet === "speed"} onClose={() => setSheet("none")} title="Velocidade da simulação">
        <div className="pb-4">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.1}
              max={5.0}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="range range-primary flex-1"
            />
            <span className="text-sm font-mono w-12 text-right">{speed.toFixed(1)}x</span>
          </div>
          <p className="text-[10px] text-base-content/50 mt-2">
            Ajusta a rapidez da animação de reprodução — não altera a velocidade real definida em cada ponto.
          </p>
        </div>
      </BottomSheetMobile>
    </div>
  );
};

export default ViewSectionMobile;
