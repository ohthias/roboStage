import React from "react";
import type {
  RobotState,
  MousePosition,
  CreatorSpeeds,
  CreatorAnalytics,
} from "@/types/RobotTrackType";

interface InfoCardProps {
  title: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => (
  <div className="bg-base-100 p-3 rounded-lg">
    <p className="text-xs text-base-content/75 font-mono">{title}</p>
    <p className="text-lg text-secondary/75 font-mono font-bold">{value}</p>
  </div>
);

interface SliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
  disabled,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-base-content mb-1"
    >
      {label} {unit && `(${value}${unit})`}
    </label>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-secondary disabled:accent-secondary/50 disabled:cursor-not-allowed"
      disabled={disabled}
    />
  </div>
);

interface IconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  title: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  disabled,
  children,
  className,
  title,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className} ${
      disabled
        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
        : "hover:opacity-90"
    }`}
  >
    {children}
  </button>
);

interface ControlPanelProps {
  robotState: RobotState;
  mousePos: MousePosition;
  zoom: number;
  onZoomChange: (value: number) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  isCreating: boolean;
  onStartCreating: () => void;
  onFinishCreating: () => void;
  onCancelCreating: () => void;
  creatorSpeeds: CreatorSpeeds;
  onCreatorSpeedChange: React.Dispatch<React.SetStateAction<CreatorSpeeds>>;
  creatorAnalytics: CreatorAnalytics;
  onSavePath: () => void;
  onLoadPath: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  robotState,
  mousePos,
  zoom,
  onZoomChange,
  speed,
  onSpeedChange,
  onPlay,
  onPause,
  onReset,
  isCreating,
  onStartCreating,
  onFinishCreating,
  onCancelCreating,
  creatorSpeeds,
  onCreatorSpeedChange,
  creatorAnalytics,
  onSavePath,
  onLoadPath,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <aside className="w-full md:w-80 flex-shrink-0 bg-base-300 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto">
      <nav
        role="tablist"
        className="mb-2 tabs tabs-border tabs-sm"
      >
        <button role="tab" className="tab tab-active">
          Geral
        </button>
        {/* Placeholder tab, not yet implemented */}
        <button role="tab" className="tab" disabled>
          CODE:on
        </button>
      </nav>
      <header className="hidden md:block text-center">
        <h1 className="text-xl font-bold text-secondary">Controles</h1>
      </header>

      <div className="space-y-3">
        <InfoCard
          title="Posição (cm)"
          value={`(${robotState.x_cm.toFixed(1)}, ${robotState.y_cm.toFixed(
            1
          )})`}
        />
        <InfoCard title="Ângulo (°)" value={robotState.angle.toFixed(1)} />
        <InfoCard
          title="Mouse (px / cm)"
          value={
            mousePos.pixel && mousePos.cm
              ? `${mousePos.pixel.x_px}, ${
                  mousePos.pixel.y_px
                } / ${mousePos.cm.x_cm.toFixed(1)}, ${mousePos.cm.y_cm.toFixed(
                  1
                )}`
              : "—"
          }
        />
      </div>

      <div className="bg-base-200 p-3 rounded-lg space-y-4 mt-2">
        <Slider
          id="speed"
          label="Velocidade de Animação"
          min={0.2}
          max={3.0}
          step={0.1}
          value={speed}
          onChange={onSpeedChange}
          disabled={isCreating}
        />
        <Slider
          id="zoom"
          label="Zoom"
          min={0.4}
          max={1.8}
          step={0.05}
          value={zoom}
          onChange={onZoomChange}
        />
      </div>

      <div className="mt-auto space-y-4">
        {isCreating ? (
          <div className="bg-base-200 p-3 rounded-lg space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-secondary text-center">
              Modo Criador de Trajetória
            </h2>

            <div className="space-y-4 border-t border-b border-base-300 py-4">
              <Slider
                id="straightSpeed"
                label="Velocidade Reta"
                min={10}
                max={100}
                step={5}
                value={creatorSpeeds.straight}
                onChange={(val) =>
                  onCreatorSpeedChange((s) => ({ ...s, straight: val }))
                }
                unit="cm/s"
              />
              <Slider
                id="turnSpeed"
                label="Velocidade de Giro"
                min={30}
                max={270}
                step={15}
                value={creatorSpeeds.turn}
                onChange={(val) =>
                  onCreatorSpeedChange((s) => ({ ...s, turn: val }))
                }
                unit="deg/s"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-secondary text-center">
                Análise de Trajetória
              </h3>
              <InfoCard
                title="Distância Total"
                value={`${creatorAnalytics.totalDistance.toFixed(1)} cm`}
              />
              <InfoCard
                title="Rotação Total"
                value={`${creatorAnalytics.totalRotation.toFixed(1)}°`}
              />
              <InfoCard
                title="Tempo Estimado"
                value={`${creatorAnalytics.estimatedTime.toFixed(1)} s`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="btn"
                title="Desfazer (Ctrl+Z)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 010 10H9"
                  />
                </svg>
                Desfazer
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="btn"
                title="Refazer (Ctrl+Y)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 010-10h1"
                  />
                </svg>
                Refazer
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onCancelCreating}
                className="btn btn-error"
                title="Cancelar criação"
              >
                Cancelar
              </button>
              <button
                onClick={onFinishCreating}
                className="btn btn-secondary"
                title="Finalizar e usar este caminho"
              >
                Finalizar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-base-100 p-3 rounded-lg space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <IconButton
                onClick={onPlay}
                disabled={robotState.isRunning}
                className="btn btn-success"
                title="Iniciar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </IconButton>
              <IconButton
                onClick={onPause}
                disabled={!robotState.isRunning}
                className="btn btn-warning"
                title="Pausar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </IconButton>
              <IconButton
                onClick={onReset}
                className="btn btn-soft btn-error"
                title="Resetar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </IconButton>
            </div>
            <button
              onClick={onStartCreating}
              className="btn btn-primary btn-wide"
              title="Criar um novo caminho"
            >
              Criar Novo Caminho
            </button>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-base-300">
              <button
                onClick={onSavePath}
                className="btn btn-neutral btn-sm p-2"
                title="Salvar caminho atual no armazenamento local"
              >
                Salvar Caminho
              </button>
              <button
                onClick={onLoadPath}
                className="btn btn-neutral btn-sm p-2"
                title="Carregar caminho do armazenamento local"
              >
                Carregar Caminho
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
