import React from "react";
import { ArrowLeft, Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/components/stage";

interface ControlBarProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onBack: () => void;
  onFullscreen: () => void;
  isFullscreen?: boolean;
  disabled?: boolean;
}

const small =
  "grid size-12 place-items-center rounded-full text-base-content/70 transition-colors hover:bg-base-content/10 hover:text-base-content focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40";

// Controles no estilo do TimerControls da Stage UI: play/pause grande com canto recortado.
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
    <div className="mt-8 flex w-full max-w-md items-center justify-center gap-5 px-4 sm:mt-12">
      <button onClick={onBack} className={small} aria-label="Voltar ao menu" title="Voltar ao menu" disabled={disabled}>
        <ArrowLeft size={20} />
      </button>

      <button onClick={onReset} className={small} aria-label="Resetar timer" title="Resetar timer" disabled={disabled}>
        <RotateCcw size={20} />
      </button>

      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={isRunning ? "Pausar timer" : "Iniciar timer"}
        title={isRunning ? "Pausar timer" : "Iniciar timer"}
        className={cn(
          "stage-shadow stage-press grid size-20 place-items-center rounded-tl-3xl rounded-br-3xl disabled:opacity-40",
          isRunning ? "bg-accent text-accent-content" : "bg-primary text-primary-content",
        )}
      >
        {isRunning ? (
          <Pause size={32} strokeWidth={2.5} fill="currentColor" />
        ) : (
          <Play size={32} strokeWidth={2.5} fill="currentColor" className="translate-x-0.5" />
        )}
      </button>

      {isFullscreen ? (
        <button onClick={onFullscreen} className={small} aria-label="Alternar tela cheia" title="Alternar tela cheia" disabled={disabled}>
          <Maximize2 size={20} />
        </button>
      ) : (
        <span className="size-12" aria-hidden="true" />
      )}
    </div>
  );
};
