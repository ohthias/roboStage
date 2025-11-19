import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '@/types/TimersType';
import { Mic, Plus, Minus } from 'lucide-react';
import { playSound } from '@/lib/audio';
import { CompletionModal } from '@/components/Timers/CompletionModal';
import { ConfirmModal } from '@/components/Timers/ConfirmModal';
import { ControlBar } from '@/components/Timers/ControlBar';
import { TimerCircle } from '@/components/Timers/TimerCircle';

interface Props {
  setMode: (mode: AppMode) => void;
}

export const CustomTimer: React.FC<Props> = ({ setMode }) => {
  const [initialTime, setInitialTime] = useState(300); // Default 5 min
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             setIsRunning(false);
             setIsFinished(true);
             playSound('end');
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
       if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const newTime = Math.max(60, Math.min(3600, initialTime + delta));
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const handleReset = () => {
    setIsFinished(false);
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const handleBack = () => {
    if (isRunning) {
      setShowExitModal(true);
    } else {
      setMode(AppMode.MENU);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full animate-in zoom-in-95 duration-300 bg-transparent p-4">
      <ConfirmModal 
        isOpen={showExitModal} 
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => setMode(AppMode.MENU)}
      />

      <CompletionModal
        isOpen={isFinished}
        title="Tempo Esgotado!"
        subTitle="Apresentação finalizada."
        onReset={handleReset}
        onMenu={() => setMode(AppMode.MENU)}
      />

      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase text-white flex items-center justify-center gap-2 drop-shadow-md">
          <Mic className="text-purple-400 w-6 h-6 sm:w-8 sm:h-8" /> Apresentação
        </h2>
      </div>

      <TimerCircle totalTime={initialTime} currentTime={timeLeft} colorClass="text-purple-500">
         <div className="text-6xl sm:text-8xl font-mono font-bold text-white tabular-nums drop-shadow-2xl">
            {formatTime(timeLeft)}
         </div>
         
         {/* Adjustment Controls (Only visible when paused) */}
         {!isRunning && timeLeft === initialTime && (
           <div className="flex gap-3 sm:gap-4 mt-4">
              <button onClick={() => adjustTime(-60)} className="p-2 rounded-full bg-base-300 hover:bg-red-500 hover:text-white text-base-content transition-colors border border-base-200">
                <Minus size={20} />
              </button>
              <span className="text-xs sm:text-sm text-base-content flex items-center font-mono font-bold">AJUSTAR</span>
              <button onClick={() => adjustTime(60)} className="p-2 rounded-full bg-base-300 hover:bg-green-500 hover:text-white text-base-content transition-colors border border-base-200">
                <Plus size={20} />
              </button>
           </div>
         )}
      </TimerCircle>

      <ControlBar 
        isRunning={isRunning} 
        onToggle={() => setIsRunning(!isRunning)} 
        onReset={handleReset} 
        onBack={handleBack} 
      />
    </div>
  );
};