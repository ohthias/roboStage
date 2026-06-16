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
  Box,
  Target,
  Code2,
  MousePointerClick,
  Undo2,
  Redo2,
  HelpCircle,
  Download,
  Upload,
  Plus,
  Minus,
} from "lucide-react";
import Mat from "./Mat";
import CodeEditor from "./CodeEditor";
import VisualEditor from "./VisualEditor";
import OnboardingTour, { TourStep } from "./OnboardingTour";
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

// --- Tour Configuration ---
const TOUR_STEPS: TourStep[] = [
  {
    targetId: null,
    title: "Bem-vindo ao FLL Simulator",
    content:
      "Este é um simulador de estratégia moderno e minimalista. Vamos explorar as principais funcionalidades.",
    position: "center",
  },
  {
    targetId: "tour-controls",
    title: "Dashboard",
    content:
      "Aqui você controla o fluxo do tempo. Visualize a duração exata e controle a execução da estratégia.",
    position: "bottom",
  },
  {
    targetId: "tour-settings",
    title: "Parâmetros",
    content:
      "Ajuste o ambiente, defina a posição inicial com precisão e personalize seu robô.",
    position: "right",
  },
  {
    targetId: "tour-editor-tabs",
    title: "Modos de Criação",
    content:
      "Alterne fluidamente entre programação textual (.fll) e edição visual baseada em blocos.",
    position: "top",
  },
  {
    targetId: "tour-canvas",
    title: "Arena Virtual",
    content:
      "O tapete interativo. Clique para definir posições ou criar movimentos organicamente.",
    position: "left",
  },
];

const ViewSection: React.FC = () => {
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
    shape: "tank",
    color: "#06b6d4",
    customPath: "M 50 0 L 100 100 L 50 80 L 0 100 Z",
  });

  const [isTourOpen, setIsTourOpen] = useState(false);
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

  useEffect(() => {
    if (!localStorage.getItem("fll-sim-tour-completed"))
      setTimeout(() => setIsTourOpen(true), 1000);
  }, []);

  const handleTourComplete = () => {
    setIsTourOpen(false);
    localStorage.setItem("fll-sim-tour-completed", "true");
  };

  // 1. Calculate Trajectory on Input Change
  useEffect(() => {
    const commands = parseCode(code);
    const newTrajectory = calculateTrajectory(
      commands,
      startConfig.x,
      startConfig.y,
      startConfig.angle,
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
        startConfig.angle,
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
          segmentsRef.current[segmentsRef.current.length - 1].endState,
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
        startConfig.angle,
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
    isShiftKey: boolean,
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
      startConfig.angle,
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

  // --- Strategy Persistence ---
  const [strategyName, setStrategyName] = useState<string>("Estratégia FLL");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleExport = () => {
    const data = {
      $schema: "fll-simulation-strategy",
      version: 1,
      name: strategyName,
      code,
      startConfig,
      robotConfig,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedName =
      strategyName.replace(/[^a-z0-9_áéíóúãõçâêôàèìòù]/gi, "_").trim() ||
      "estrategia";
    link.href = url;
    link.download = `${sanitizedName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (typeof data !== "object" || data === null) {
          throw new Error("Formato inválido");
        }

        if (typeof data.code === "string") {
          updateCode(data.code);
        }

        if (data.startConfig && typeof data.startConfig === "object") {
          const x =
            typeof data.startConfig.x === "number"
              ? data.startConfig.x
              : START_X;
          const y =
            typeof data.startConfig.y === "number"
              ? data.startConfig.y
              : START_Y;
          const angle =
            typeof data.startConfig.angle === "number"
              ? data.startConfig.angle
              : START_ANGLE;
          setStartConfig({ x, y, angle });
        }

        if (data.robotConfig && typeof data.robotConfig === "object") {
          setRobotConfig((prev) => ({
            widthCm:
              typeof data.robotConfig.widthCm === "number"
                ? data.robotConfig.widthCm
                : prev.widthCm,
            lengthCm:
              typeof data.robotConfig.lengthCm === "number"
                ? data.robotConfig.lengthCm
                : prev.lengthCm,
            shape: ["tank", "4x4", "fwd", "rwd", "custom"].includes(
              data.robotConfig.shape,
            )
              ? data.robotConfig.shape
              : prev.shape,
            color:
              typeof data.robotConfig.color === "string"
                ? data.robotConfig.color
                : prev.color,
            customPath:
              typeof data.robotConfig.customPath === "string"
                ? data.robotConfig.customPath
                : prev.customPath,
          }));
        }

        if (typeof data.name === "string") {
          setStrategyName(data.name);
        } else {
          setStrategyName("Estratégia Importada");
        }

        setAlert({
          type: "success",
          message: "Estratégia carregada com sucesso!",
        });
        setTimeout(() => setAlert(null), 4000);
      } catch (err) {
        setAlert({
          type: "error",
          message: "Erro: Arquivo JSON de estratégia inválido.",
        });
        setTimeout(() => setAlert(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImportFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportFile(file);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-base-300 overflow-hidden font-sans">
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={handleTourComplete}
        steps={TOUR_STEPS}
      />

      {/* Modern Top Header / Navbar using daisyUI */}
      <header className="navbar bg-base-100 border-b border-base-content/10 px-4 h-14 shrink-0 shadow-sm z-40 flex items-center justify-between">
        {/* Brand/Logo Area */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <Box size={16} className="text-primary-content" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-base-content">
              FLL Strat Simulator
            </h1>
            <p className="text-[10px] opacity-50 font-mono">
              Simulador Virtual
            </p>
          </div>
        </div>

        {/* Dashboard Control Box (tour-controls) */}
        <div id="tour-controls" className="flex items-center gap-3">
          <div className="join border border-base-content/10 shadow-sm bg-base-200 p-0.5 rounded-lg">
            <button
              onClick={togglePlay}
              className={`join-item btn btn-xs h-7 min-h-0 ${isPlaying ? "btn-warning" : "btn-primary"} px-3 gap-1`}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pausar" : "Iniciar"}
            </button>
            <button
              onClick={handleReset}
              className="join-item btn btn-xs h-7 min-h-0 btn-ghost text-base-content/70 hover:text-base-content px-2"
              title="Reiniciar simulação"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Time & Duration Stats */}
          <div className="stats bg-base-200 border border-base-content/5 py-0.5 px-3 rounded-lg flex items-center shadow-sm">
            <div className="stat p-0 flex flex-col justify-center min-w-[100px]">
              <div className="stat-title text-[9px] font-bold uppercase tracking-wider opacity-60">
                Tempo
              </div>
              <div className="stat-value text-xs font-mono text-primary flex items-baseline gap-1">
                {time.toFixed(2)}s
                <span className="text-[10px] text-base-content/40 font-normal">
                  / {totalDuration.toFixed(2)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Strategy Name for transparency */}
          <span className="text-[11px] font-medium opacity-65 hidden xl:inline border border-base-content/10 bg-base-200 px-2 py-0.5 rounded">
            📄 {strategyName}
          </span>

          <button
            onClick={() => setIsTourOpen(true)}
            className="btn btn-circle btn-ghost btn-xs text-base-content/70 hover:text-base-content"
            title="Ver Instruções"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace below navbar */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full relative">
        {/* Left Workspace Panel: Full Height Editor */}
        <aside className="w-full lg:w-[300px] bg-base-200 flex flex-col z-20 h-full shrink-0 relative border-r border-base-content/10">
          {/* Tabs Selector at the top of Left Workspace panel */}
          <div
            id="tour-editor-tabs"
            className="bg-base-100 p-1.5 border-b border-base-content/10 flex items-center justify-between shrink-0"
          >
            <div className="tabs tabs-boxed tabs-xs bg-base-300 p-0.5 rounded-md flex gap-0.5">
              <button
                className={`btn btn-xs h-6 min-h-0 text-[11px] ${editorMode === "code" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setEditorMode("code")}
              >
                <Code2 size={11} className="mr-1" /> Código .fll
              </button>
              <button
                className={`btn btn-xs h-6 min-h-0 text-[11px] ${editorMode === "visual" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setEditorMode("visual")}
              >
                <MousePointerClick size={11} className="mr-1" /> Visual
              </button>
            </div>

            {/* Undo / Redo buttons */}
            <div className="join border border-base-content/10 rounded-md">
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

          {/* Active full height Editor panel */}
          <div
            id="tour-editor-area"
            className="flex-1 bg-base-300 p-0 overflow-hidden relative"
          >
            {editorMode === "code" ? (
              <CodeEditor code={code} onChange={updateCode} />
            ) : (
              <VisualEditor code={code} onChange={updateCode} />
            )}
          </div>
        </aside>

        {/* Center Section: Arena and live Virtual Mat simulation */}
        <section
          id="tour-canvas"
          className="flex-grow relative bg-base-300 flex items-center justify-center p-4 overflow-hidden shadow-inner"
        >
          {/* Top Floating Status Info bar over the Mat */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 items-center bg-base-100/90 backdrop-blur border border-base-content/15 py-1.5 px-3 rounded-full shadow-md text-xs">
            {isSettingStart ? (
              <span className="text-warning font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                Clique no mapa para definir a origem
              </span>
            ) : (
              <span className="text-base-content/75 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                {editorMode === "visual"
                  ? "Modo Planejador Visual ativo"
                  : "Pronto para Simular"}
              </span>
            )}

            <button
              onClick={() => setIsSettingStart(!isSettingStart)}
              className={`btn btn-xs h-6 min-h-0 rounded-full ${isSettingStart ? "btn-warning animate-pulse" : "btn-outline btn-ghost"}`}
            >
              <Target size={11} className="mr-0.5" />
              {isSettingStart ? "Concluir" : "Mudar Origem"}
            </button>
          </div>

          {/* Virtual Mat Container */}
          <div className="relative z-10 shadow-2xl rounded-xl max-w-full max-h-full border border-base-content/5 overflow-hidden">
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

          {/* Bottom Floating Control Panel: Zoom widget */}
          <div className="absolute bottom-4 right-4 z-20 bg-base-100/95 backdrop-blur border border-base-content/15 p-2 rounded-xl shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold opacity-60 tracking-wider">
                MAPA ZOOM:
              </span>
              <div className="join border border-base-content/10">
                <button
                  onClick={() => setZoom(Math.max(2, zoom - 0.5))}
                  className="btn btn-xs join-item"
                  disabled={zoom <= 2}
                >
                  <Minus size={11} />
                </button>
                <span className="join-item bg-base-200 px-2.5 flex items-center justify-center text-[10px] font-mono w-12 text-center font-bold">
                  {(zoom / 4).toFixed(1)}x
                </span>
                <button
                  onClick={() => setZoom(Math.min(8, zoom + 0.5))}
                  className="btn btn-xs join-item"
                  disabled={zoom >= 8}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            <div className="text-[9px] opacity-40 font-semibold border-l border-base-content/10 pl-3 leading-snug hidden md:block">
              Espaço + Arrastar para pan
              <br />
              Shift + Clique p/ virar robô
            </div>
          </div>
        </section>

        {/* Right Workspace Panel: Sim Settings and strategy parameters */}
        <aside
          id="tour-settings"
          className="w-full lg:w-[325px] bg-base-200 border-l border-base-content/10 flex flex-col h-full overflow-y-auto shrink-0 relative custom-scrollbar p-4 gap-4 z-30"
        >
          {/* Card 1: strategy saving & loading panel */}
          <div className="card card-compact bg-base-100 border border-base-content/10 shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-base-content/5 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-primary">
                Estratégia Atual
              </h2>
              <span className="badge badge-accent badge-xs font-mono text-[9px] uppercase tracking-wider font-semibold">
                JSON
              </span>
            </div>

            <div className="form-control w-full gap-2">
              <div>
                <span className="text-[10px] uppercase font-extrabold opacity-55 tracking-widest block mb-1">
                  Título do Projeto
                </span>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  className="input input-bordered input-sm w-full font-sans text-xs focus:ring-1 focus:ring-primary"
                  placeholder="Minha Estratégia FLL"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={handleExport}
                  className="btn btn-xs btn-primary gap-1.5 h-8 font-semibold text-xs py-1"
                >
                  <Download size={11} /> Exportar
                </button>
                <label className="btn btn-xs btn-outline btn-primary gap-1.5 h-8 font-semibold text-xs py-1 cursor-pointer">
                  <Upload size={11} /> Importar
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Tactical drag-and-drop landing target */}
              <div className="form-control w-full mt-1.5">
                <div
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 ${
                    isDragging
                      ? "border-primary bg-primary/10 text-primary animate-pulse"
                      : "border-base-content/15 hover:border-base-content/30 hover:bg-base-content/5 text-base-content/65"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload
                    size={14}
                    className={isDragging ? "text-primary" : "opacity-60"}
                  />
                  <span className="text-[10px] font-bold">
                    Solte arquivos aqui
                  </span>
                  <span className="text-[9px] opacity-60">
                    Arraste um JSON para importar
                  </span>
                </div>
              </div>

              {alert && (
                <div
                  className={`alert ${alert.type === "success" ? "alert-success" : "alert-error"} text-[10px] p-2 rounded mt-2 flex items-center gap-1.5 shadow-sm`}
                >
                  <span className="font-semibold">{alert.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Initial position attributes */}
          <div className="card card-compact bg-base-100 border border-base-content/10 shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-base-content/5 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-secondary">
                Posição de Partida
              </h2>
              <span className="badge badge-secondary badge-xs font-mono text-[9px]">
                ORIGEM
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsSettingStart(!isSettingStart)}
                className={`btn btn-xs w-full h-8 text-xs font-semibold ${isSettingStart ? "btn-warning animate-pulse" : "btn-outline btn-secondary"}`}
              >
                <Target size={12} className="mr-1" />
                {isSettingStart ? "Definindo no Mapa..." : "Definir no Canvas"}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <div className="form-control">
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                    X (cm)
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-xs font-mono text-center text-xs w-full"
                    value={startConfig.x}
                    onChange={(e) =>
                      setStartConfig((p) => ({
                        ...p,
                        x: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="form-control">
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                    Y (cm)
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-xs font-mono text-center text-xs w-full"
                    value={startConfig.y}
                    onChange={(e) =>
                      setStartConfig((p) => ({
                        ...p,
                        y: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="form-control">
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                    Ângulo (°)
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-xs font-mono text-center text-xs w-full"
                    value={startConfig.angle}
                    onChange={(e) =>
                      setStartConfig((p) => ({
                        ...p,
                        angle: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Robot physical traits and configuration */}
          <div className="card card-compact bg-base-100 border border-base-content/10 shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-base-content/5 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-accent">
                Dimensões do Robô
              </h2>
              <span className="badge badge-accent badge-xs font-mono text-[9px]">
                HARDWARE
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                    Largura (cm)
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-xs font-mono text-center text-xs"
                    value={robotConfig.widthCm}
                    onChange={(e) =>
                      setRobotConfig((p) => ({
                        ...p,
                        widthCm: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="form-control">
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                    Compr. (cm)
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-xs font-mono text-center text-xs"
                    value={robotConfig.lengthCm}
                    onChange={(e) =>
                      setRobotConfig((p) => ({
                        ...p,
                        lengthCm: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                  Chassis & Tração
                </span>
                <select
                  className="select select-bordered select-xs w-full text-xs"
                  value={robotConfig.shape}
                  onChange={(e) =>
                    setRobotConfig({
                      ...robotConfig,
                      shape: e.target.value as any,
                    })
                  }
                >
                  <option value="tank">Esteiras (Tank Drive)</option>
                  <option value="4x4">4x4 Tração integral</option>
                  <option value="fwd">Tração Dianteira (FWD)</option>
                  <option value="rwd">Tração Traseira (RWD)</option>
                  <option value="custom">SVG Desenho Customizado</option>
                </select>
              </div>

              <div className="form-control">
                <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                  Farol LED central
                </span>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="bg-transparent border border-base-content/25 rounded cursor-pointer w-7 h-7 p-0 shrink-0"
                    value={robotConfig.color}
                    onChange={(e) =>
                      setRobotConfig({ ...robotConfig, color: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="input input-bordered input-xs flex-1 font-mono uppercase text-xs"
                    value={robotConfig.color}
                    onChange={(e) =>
                      setRobotConfig({ ...robotConfig, color: e.target.value })
                    }
                  />
                </div>
              </div>

              {robotConfig.shape === "custom" && (
                <div className="form-control">
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider mb-1">
                    String de Path SVG
                  </span>
                  <textarea
                    value={robotConfig.customPath}
                    onChange={(e) =>
                      setRobotConfig({
                        ...robotConfig,
                        customPath: e.target.value,
                      })
                    }
                    className="textarea textarea-bordered textarea-xs w-full font-mono text-[9px] leading-snug"
                    placeholder="M 50 0 L..."
                    rows={2.5}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Simulation environment factors */}
          <div className="card card-compact bg-base-100 border border-base-content/10 shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-base-content/5 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-content/85">
                Ambiente da Arena
              </h2>
              <span className="badge bg-neutral-content/10 text-neutral-content border-none badge-xs font-mono text-[9px]">
                SPEED
              </span>
            </div>

            <div className="space-y-2">
              <div className="form-control">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-wide">
                    Multiplicador de Velocidade
                  </span>
                  <span className="badge badge-primary badge-xs font-mono text-[10px]">
                    {speed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="range range-xs range-primary"
                />
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ViewSection;
