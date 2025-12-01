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
} from "lucide-react";
import Mat from "@/components/QuickBrick/RobotTrack/Mat";
import CodeEditor from "@/components/QuickBrick/RobotTrack//CodeEditor";
import VisualEditor from "@/components/QuickBrick/RobotTrack//VisualEditor";
import {
  calculateTrajectory,
  parseCode,
  generateSegments,
  interpolateState,
  commandsToCode,
} from "@/utils/engineRobotTrack";
import { DEFAULT_CODE, START_ANGLE, START_X, START_Y } from "./constants";
import {
  RobotState,
  AnimationSegment,
  RobotConfig,
  Command,
} from "@/types/RobotTrackType";
import { Navbar } from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Footer } from "@/components/ui/Footer";

const RobotTrack: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Navbar />
        <h1 className="text-2xl font-bold my-4 text-primary">
          Ops! Ferramenta não está disponível no celular
        </h1>
        <p className="text-sm mb-2 text-base-content px-5">
          O QuickBrick Studio é um conjunto de ferramentas que ajuda sua equipe
          a criar estratégias eficientes para o robô durante sua jornada no
          FIRST LEGO League Challenge. Basta selecionar uma das ferramentas
          disponíveis e aproveitá-las.
        </p>
      </div>
    );
  }

  // --- State ---
  const [history, setHistory] = useState<string[]>([DEFAULT_CODE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const code = history[historyIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [zoom, setZoom] = useState(4.0);
  const [editorMode, setEditorMode] = useState<"code" | "visual">("code");

  const [startConfig, setStartConfig] = useState<{
    x: number;
    y: number;
    angle: number;
  }>({
    x: START_X,
    y: START_Y,
    angle: START_ANGLE,
  });
  const [isSettingStart, setIsSettingStart] = useState(false);

  const [robotConfig, setRobotConfig] = useState<RobotConfig>({
    widthCm: 18,
    lengthCm: 22,
    shape: "4x4",
    color: "#e7000b",
    customPath: "M 50 0 L 100 100 L 50 80 L 0 100 Z",
  });

  const [robotState, setRobotState] = useState<RobotState>({
    x: START_X,
    y: START_Y,
    angle: START_ANGLE,
  });
  const [trajectory, setTrajectory] = useState<any[]>([]);

  const segmentsRef = useRef<AnimationSegment[]>([]);
  const animationReqRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedWhenPausedRef = useRef<number>(0);

  // --- Logic ---
  const updateCode = (newCode: string) => {
    if (newCode === code) return;
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length >= 50) newHistory.shift();
    newHistory.push(newCode);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => historyIndex > 0 && setHistoryIndex(historyIndex - 1);
  const redo = () =>
    historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1);

  // 1. Calculate Trajectory on Input Change
  useEffect(() => {
    const commands = parseCode(code);
    const newTrajectory = calculateTrajectory(
      commands,
      startConfig.x,
      startConfig.y,
      startConfig.angle
    );
    setTrajectory(newTrajectory);
  }, [code, startConfig]);

  // 2. Reset Robot logic
  useEffect(() => {
    setIsPlaying(false);
    if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    setRobotState({
      x: startConfig.x,
      y: startConfig.y,
      angle: startConfig.angle,
    });
    elapsedWhenPausedRef.current = 0;
    setTime(0);
  }, [code, startConfig]);

  // 3. Handle Speed Change
  useEffect(() => {
    if (isPlaying) {
      const commands = parseCode(code);
      const traj = calculateTrajectory(
        commands,
        startConfig.x,
        startConfig.y,
        startConfig.angle
      );
      const totalDurationOld =
        segmentsRef.current.length > 0
          ? segmentsRef.current[segmentsRef.current.length - 1].endTime
          : 1;
      const currentElapsed = performance.now() - startTimeRef.current;
      const progress = currentElapsed / totalDurationOld;
      const newSegments = generateSegments(traj, speed);
      segmentsRef.current = newSegments;
      const totalDurationNew =
        newSegments.length > 0
          ? newSegments[newSegments.length - 1].endTime
          : 0;
      const newElapsed = progress * totalDurationNew;
      startTimeRef.current = performance.now() - newElapsed;
    }
  }, [speed]);

  const totalDuration = useMemo(() => {
    const segments = generateSegments(trajectory, speed);
    if (segments.length === 0) return 0;
    return segments[segments.length - 1].endTime / 1000;
  }, [trajectory, speed]);

  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const currentTotalDuration =
      segmentsRef.current.length > 0
        ? segmentsRef.current[segmentsRef.current.length - 1].endTime
        : 0;

    if (elapsed > currentTotalDuration) {
      setIsPlaying(false);
      setTime(currentTotalDuration / 1000);
      elapsedWhenPausedRef.current = currentTotalDuration;
      if (segmentsRef.current.length > 0) {
        setRobotState(
          segmentsRef.current[segmentsRef.current.length - 1].endState
        );
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
      const now = performance.now();
      elapsedWhenPausedRef.current = now - startTimeRef.current;
      if (animationReqRef.current)
        cancelAnimationFrame(animationReqRef.current);
    } else {
      const commands = parseCode(code);
      const traj = calculateTrajectory(
        commands,
        startConfig.x,
        startConfig.y,
        startConfig.angle
      );
      segmentsRef.current = generateSegments(traj, speed);

      const currentTotalDuration =
        segmentsRef.current.length > 0
          ? segmentsRef.current[segmentsRef.current.length - 1].endTime
          : 0;

      if (
        elapsedWhenPausedRef.current >= currentTotalDuration ||
        elapsedWhenPausedRef.current === 0
      ) {
        startTimeRef.current = performance.now();
        elapsedWhenPausedRef.current = 0;
      } else {
        startTimeRef.current = performance.now() - elapsedWhenPausedRef.current;
      }

      setIsPlaying(true);
      animationReqRef.current = requestAnimationFrame(animate);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    elapsedWhenPausedRef.current = 0;
    setTime(0);
    setRobotState({
      x: startConfig.x,
      y: startConfig.y,
      angle: startConfig.angle,
    });
  };

  const handleMapClick = (
    targetX: number,
    targetY: number,
    isShiftKey: boolean
  ) => {
    if (isSettingStart) {
      if (isShiftKey) {
        const dx = targetX - startConfig.x;
        const dy = targetY - startConfig.y;
        const angleRad = Math.atan2(dx, dy);
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
    const commands = parseCode(code);
    const traj = calculateTrajectory(
      commands,
      startConfig.x,
      startConfig.y,
      startConfig.angle
    );
    const lastPoint = traj[traj.length - 1];
    const dx = targetX - lastPoint.x;
    const dy = targetY - lastPoint.y;
    const dist = Math.hypot(dx, dy);
    const targetAngleRad = Math.atan2(dx, dy);
    const targetAngleDeg = (targetAngleRad * 180) / Math.PI;
    let angleDiff = targetAngleDeg - (lastPoint.angle % 360);
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    const newCommands: Command[] = [];
    if (Math.abs(angleDiff) > 1.0)
      newCommands.push({
        type: "giro",
        val: parseFloat(angleDiff.toFixed(1)),
        speed: 60,
      });
    if (dist > 0.5)
      newCommands.push({
        type: "reto",
        val: parseFloat(dist.toFixed(1)),
        speed: 50,
      });
    if (newCommands.length > 0)
      updateCode(commandsToCode([...commands, ...newCommands]));
  };

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />
      </div>

      <div className="flex flex-col h-screen w-7xl overflow-hidden mx-auto my-4 p-4">
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-[340px] flex flex-col bg-base-200 z-30 h-full max-h-full shrink-0 relative border border-base-content/10 rounded-lg">
            {/* Header & Main Controls */}
            <div
              id="tour-controls"
              className="p-4 border-b border-base-content/10"
            >
              {/* Logo Area */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-shark-icon lucide-shark text-primary-content"
                    >
                      <path d="M3.6 15a9.07 9.07 0 0 0 11.7 5.3S19 22 22 22c0 0-1-3-3-4.5 1.1-1.5 1.9-3.3 2-5.3l-8 4.6a1.94 1.94 0 1 1-2-3.4l6-3.5s5-2.8 5-6.8c0-.6-.4-1-1-1h-9c-1.8 0-3.4.5-4.8 1.5C5.7 2.5 3.9 2 2 2c0 0 1.4 2.1 2.3 4.5A10.63 10.63 0 0 0 3.1 13" />
                      <path d="M13.8 7 13 6" />
                      <path d="M21.12 6h-3.5c-1.1 0-2.8.5-3.82 1L9 9.8C3 11 2 15 2 15h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-md font-black tracking-tight text-base-content">
                      UNEARTHED Sharks Simulator
                    </h1>
                    <div className="badge badge-xs badge-ghost font-mono uppercase tracking-widest">
                      V2.0
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="stats shadow w-full bg-base-100 mb-4">
                <div className="stat p-2 px-4">
                  <div className="stat-title text-xs font-bold uppercase opacity-60">
                    Tempo
                  </div>
                  <div className="stat-value text-xl font-mono">
                    {time.toFixed(2)}
                    <span className="text-xs text-base-content/40">s</span>
                  </div>
                  <div className="stat-desc text-xs font-mono opacity-50">
                    / {totalDuration.toFixed(2)}s
                  </div>
                </div>
                <div className="stat p-2 flex items-center justify-center gap-2">
                  <button
                    onClick={togglePlay}
                    className={`btn btn-sm ${
                      isPlaying ? "btn-warning" : "btn-primary"
                    } shadow-lg`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pausar" : "Iniciar"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn btn-sm btn-square btn-ghost"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Settings */}
            <div
              id="tour-settings"
              className="flex-1 overflow-y-auto custom-scrollbar min-h-0"
            >
              {/* Start Position Section */}
              <div className="collapse collapse-arrow border-b border-base-content/5">
                <input type="checkbox" />
                <div className="collapse-title text-xs font-bold uppercase tracking-widest text-base-content/70">
                  Posição Inicial
                </div>
                <div className="collapse-content space-y-4">
                  <button
                    onClick={() => setIsSettingStart(!isSettingStart)}
                    className={`btn btn-sm w-full ${
                      isSettingStart
                        ? "btn-warning animate-pulse"
                        : "btn-outline"
                    }`}
                  >
                    <Target size={14} />
                    {isSettingStart
                      ? "Clique no Mapa para definir"
                      : "Definir no Mapa"}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="form-control w-full">
                      <div className="label pt-0 pb-1">
                        <span className="label-text-alt font-bold">X</span>
                      </div>
                      <div className="join w-full">
                        <input
                          className="input input-bordered input-xs join-item w-full font-mono text-right"
                          value={startConfig.x}
                          onChange={(e) =>
                            setStartConfig((p) => ({
                              ...p,
                              x: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="join-item btn btn-xs btn-static text-[10px] px-1">
                          cm
                        </span>
                      </div>
                    </label>
                    <label className="form-control w-full">
                      <div className="label pt-0 pb-1">
                        <span className="label-text-alt font-bold">Y</span>
                      </div>
                      <div className="join w-full">
                        <input
                          className="input input-bordered input-xs join-item w-full font-mono text-right"
                          value={startConfig.y}
                          onChange={(e) =>
                            setStartConfig((p) => ({
                              ...p,
                              y: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="join-item btn btn-xs btn-static text-[10px] px-1">
                          cm
                        </span>
                      </div>
                    </label>
                    <label className="form-control w-full">
                      <div className="label pt-0 pb-1">
                        <span className="label-text-alt font-bold">Ang</span>
                      </div>
                      <div className="join w-full">
                        <input
                          className="input input-bordered input-xs join-item w-full font-mono text-right"
                          value={startConfig.angle}
                          onChange={(e) =>
                            setStartConfig((p) => ({
                              ...p,
                              angle: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="join-item btn btn-xs btn-static text-[10px] px-1">
                          °
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Robot Config Section */}
              <div className="collapse collapse-arrow border-b border-base-content/5">
                <input type="checkbox" />
                <div className="collapse-title text-xs font-bold uppercase tracking-widest text-base-content/70">
                  Configuração do Robô
                </div>
                <div className="collapse-content space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="form-control w-full">
                      <div className="label pt-0 pb-1">
                        <span className="label-text-alt font-bold">
                          Largura
                        </span>
                      </div>
                      <div className="join w-full">
                        <input
                          className="input input-bordered input-xs join-item w-full font-mono text-right"
                          value={robotConfig.widthCm}
                          onChange={(e) =>
                            setRobotConfig((p) => ({
                              ...p,
                              widthCm: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="join-item btn btn-xs btn-static text-[10px] px-1">
                          cm
                        </span>
                      </div>
                    </label>
                    <label className="form-control w-full">
                      <div className="label pt-0 pb-1">
                        <span className="label-text-alt font-bold">Comp.</span>
                      </div>
                      <div className="join w-full">
                        <input
                          className="input input-bordered input-xs join-item w-full font-mono text-right"
                          value={robotConfig.lengthCm}
                          onChange={(e) =>
                            setRobotConfig((p) => ({
                              ...p,
                              lengthCm: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="join-item btn btn-xs btn-static text-[10px] px-1">
                          cm
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="form-control w-full">
                    <div className="label pt-0 pb-1">
                      <span className="label-text-alt font-bold">Modelo</span>
                    </div>
                    <select
                      className="select select-bordered select-xs w-full"
                      value={robotConfig.shape}
                      onChange={(e) =>
                        setRobotConfig({
                          ...robotConfig,
                          shape: e.target.value as any,
                        })
                      }
                    >
                      <option value="tank">Esteira (Tank)</option>
                      <option value="4x4">4x4 Offroad</option>
                      <option value="fwd">Tração Dianteira</option>
                      <option value="rwd">Tração Traseira</option>
                    </select>
                  </div>

                  <div className="form-control w-full">
                    <div className="label pt-0 pb-1">
                      <span className="label-text-alt font-bold">
                        Cor do Caminho
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="bg-transparent rounded cursor-pointer w-8 h-6"
                        value={robotConfig.color}
                        onChange={(e) =>
                          setRobotConfig({
                            ...robotConfig,
                            color: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        className="input input-bordered input-xs flex-1 font-mono uppercase"
                        value={robotConfig.color}
                        onChange={(e) =>
                          setRobotConfig({
                            ...robotConfig,
                            color: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {robotConfig.shape === "custom" && (
                    <textarea
                      value={robotConfig.customPath}
                      onChange={(e) =>
                        setRobotConfig({
                          ...robotConfig,
                          customPath: e.target.value,
                        })
                      }
                      className="textarea textarea-bordered textarea-xs w-full font-mono"
                      placeholder="SVG Path..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Editor Area */}
            <div className="h-[40%] bg-base-100 flex flex-col border-t border-base-content/10 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
              <div
                id="tour-editor-tabs"
                className="flex items-center justify-between px-2 py-2 bg-base-300/10 shrink-0"
              >
                <div role="tablist" className="tabs tabs-box tabs-xs space-x-1">
                  <button
                    role="tab"
                    className={`tab ${
                      editorMode === "code" ? "tab-active font-bold" : ""
                    }`}
                    onClick={() => setEditorMode("code")}
                  >
                    <Code2 size={12} className="mr-1" /> Code
                  </button>
                  <button
                    role="tab"
                    className={`tab ${
                      editorMode === "visual" ? "tab-active font-bold" : ""
                    }`}
                    onClick={() => setEditorMode("visual")}
                  >
                    <MousePointerClick size={12} className="mr-1" /> Visual
                  </button>
                </div>

                <div className="join">
                  <button
                    onClick={undo}
                    disabled={historyIndex === 0}
                    className="join-item btn btn-xs btn-ghost"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex === history.length - 1}
                    className="join-item btn btn-xs btn-ghost"
                  >
                    <Redo2 size={14} />
                  </button>
                </div>
              </div>
              <div
                id="tour-editor-area"
                className="flex-1 p-0 overflow-hidden relative"
              >
                {editorMode === "code" ? (
                  <CodeEditor code={code} onChange={updateCode} />
                ) : (
                  <VisualEditor code={code} onChange={updateCode} />
                )}
              </div>
            </div>
          </aside>

          {/* Right Canvas */}
          <section
            id="tour-canvas"
            className="flex-1 relative bg-base-100 flex items-center justify-center p-8 lg:p-12 overflow-hidden"
          >
            <div className="relative z-10 shadow-2xl rounded-lg max-w-full max-h-full border border-base-content/5">
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
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default RobotTrack;
