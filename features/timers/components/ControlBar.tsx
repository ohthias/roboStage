import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowUpRightFromCircleIcon,
} from "lucide-react";

interface ControlBarProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onBack: () => void;
  onFullscreen: () => void;
  isFullscreen?: boolean;
  disabled?: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isRunning,
  onToggle,
  onReset,
  onBack,
  onFullscreen,
  isFullscreen = false,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 w-full max-w-md px-4">
      <button
        onClick={onBack}
        className="btn btn-ghost btn-circle"
        aria-label="Voltar ao menu"
        title="Voltar ao menu"
        disabled={disabled}
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={onToggle}
        className="btn btn-primary btn-circle btn-lg"
        aria-label={isRunning ? "Pausar timer" : "Iniciar timer"}
        title={isRunning ? "Pausar timer" : "Iniciar timer"}
        disabled={disabled}
      >
        {isRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <button
        onClick={onReset}
        className="btn btn-ghost btn-circle"
        aria-label="Resetar timer"
        title="Resetar timer"
        disabled={disabled}
      >
        <RotateCcw size={20} />
      </button>
      {isFullscreen && (
        <button
          onClick={onFullscreen}
          className="btn btn-ghost btn-circle"
          aria-label="Alternar tela cheia"
          title="Alternar tela cheia"
          disabled={disabled}
        >
          <ArrowUpRightFromCircleIcon size={20} />
        </button>
      )}
    </div>
  );
};
