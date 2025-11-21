import React from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';

interface ControlBarProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onBack: () => void;
  disabled?: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  isRunning, 
  onToggle, 
  onReset, 
  onBack,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 w-full max-w-md px-4">
      <button
        onClick={onBack}
        className="p-3 sm:p-4 rounded-full bg-base-300/50 hover:bg-base-300/100 text-base-content transition-all hover:scale-105 flex-shrink-0"
        title="Voltar ao Menu"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          p-6 sm:p-8 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex-shrink-0
          ${isRunning 
            ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
            : 'bg-red-400 text-white hover:bg-red-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isRunning ? (
          <Pause className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" />
        ) : (
          <Play className="w-8 h-8 sm:w-12 sm:h-12 ml-1" fill="currentColor" />
        )}
      </button>

      <button
        onClick={onReset}
        className="p-3 sm:p-4 rounded-full bg-base-300/75 hover:opacity-100 text-base-content transition-all hover:scale-105 flex-shrink-0 opacity-75"
        title="Reiniciar Timer"
      >
        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};