import React, { useState, useEffect, useRef } from 'react';
import { AppMode, DEFAULT_JUDGING_FLOW } from '@/types/TimersType';
import { playSound } from '@/lib/audio';
import { CompletionModal } from '@/components/Timers/CompletionModal';
import { ConfirmModal } from '@/components/Timers/ConfirmModal';
import { ControlBar } from '@/components/Timers/ControlBar';
import { ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';

interface Props {
  setMode: (mode: AppMode) => void;
}

export const JudgingRoom: React.FC<Props> = ({ setMode }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_JUDGING_FLOW[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const currentStep = DEFAULT_JUDGING_FLOW[currentStepIndex];

  useEffect(() => {
    // Reset time when step changes
    setTimeLeft(DEFAULT_JUDGING_FLOW[currentStepIndex].duration);
  }, [currentStepIndex]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             playSound('end');
             
             // Auto-advance logic
             if (currentStepIndex < DEFAULT_JUDGING_FLOW.length - 1) {
                 const nextStep = DEFAULT_JUDGING_FLOW[currentStepIndex + 1];
                 setCurrentStepIndex(idx => idx + 1);
                 return nextStep.duration;
             } else {
                 // End of entire flow
                 setIsRunning(false);
                 setIsFinished(true);
                 return 0;
             }
          }
          
          if (prev <= 5) playSound('tick');
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentStepIndex]);

  const handleNextStep = () => {
    if (currentStepIndex < DEFAULT_JUDGING_FLOW.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleBack = () => {
    if (isRunning) {
      setShowExitModal(true);
    } else {
      setMode(AppMode.MENU);
    }
  };

  const handleReset = () => {
    setIsFinished(false);
    setIsRunning(false);
    setCurrentStepIndex(0);
    setTimeLeft(DEFAULT_JUDGING_FLOW[0].duration);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = DEFAULT_JUDGING_FLOW.reduce((acc, step) => acc + step.duration, 0);
  const elapsedTimePreviousSteps = DEFAULT_JUDGING_FLOW.slice(0, currentStepIndex).reduce((acc, step) => acc + step.duration, 0);
  const totalElapsed = elapsedTimePreviousSteps + (currentStep.duration - timeLeft);
  const totalProgress = Math.min(100, (totalElapsed / totalDuration) * 100);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-transparent overflow-hidden">
      <ConfirmModal 
        isOpen={showExitModal} 
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => setMode(AppMode.MENU)}
      />

      <CompletionModal 
        isOpen={isFinished} 
        title="Avaliação Concluída!"
        subTitle="O fluxo de sala foi finalizado."
        onReset={handleReset}
        onMenu={() => setMode(AppMode.MENU)}
      />

      {/* Header / Progress */}
      <div className="w-full bg-secondary/75 backdrop-blur-md p-3 sm:p-4 border-b border-white/5 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-2">
           <h2 className="text-secondary-content font-bold flex items-center gap-2 text-sm sm:text-base">
         <BookOpen className="text-secondary-content w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Fluxo de</span> Avaliação
           </h2>
           <span className="text-secondary-content text-xs sm:text-sm font-mono">{currentStepIndex + 1} / {DEFAULT_JUDGING_FLOW.length}</span>
        </div>
        <div className="w-full bg-secondary h-1.5 sm:h-2 rounded-full overflow-hidden max-w-5xl mx-auto">
          <div 
        className="h-full bg-gradient-to-r from-warning to-primary transition-all duration-500"
        style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-center justify-center overflow-y-auto">
        
        {/* Left: Steps List (Hidden on mobile, visible on tablet+) */}
        <div className="hidden md:flex flex-col gap-2 w-64 lg:w-80 h-full justify-center overflow-y-auto pr-2">
           {DEFAULT_JUDGING_FLOW.map((step, idx) => {
         const isActive = idx === currentStepIndex;
         const isPast = idx < currentStepIndex;
         return (
           <div 
             key={step.id}
             className={`
           p-3 lg:p-4 rounded-xl border transition-all duration-300 scale-95
           ${isActive ? 'bg-secondary border-secondary scale-100 shadow-lg backdrop-blur-sm' : 'bg-secondary/75 border-transparent opacity-50'}
           ${isPast ? 'opacity-30' : ''}
             `}
           >
             <div className="flex justify-between items-center">
           <span className={`font-bold text-sm lg:text-base ${isActive ? 'text-secondary-content' : 'text-secondary-content/50'}`}>{step.label}</span>
           {isPast && <CheckCircle2 size={16} className="text-green-500" />}
             </div>
             <div className="text-xs text-secondary-content/50 mt-1 font-mono">{Math.floor(step.duration/60)} min</div>
           </div>
         )
           })}
        </div>

        {/* Center: Timer */}
        <div className="flex-1 flex flex-col items-center justify-center w-full py-4">
          <div className={`text-xl sm:text-2xl font-bold uppercase tracking-widest mb-1 sm:mb-2 text-center px-2 ${currentStep.color} drop-shadow-sm`}>
        {currentStep.label}
          </div>
          <div className="text-base-100 text-center mb-6 sm:mb-8 max-w-md opacity-80 font-medium text-sm sm:text-base px-4">
        {currentStep.description}
          </div>

          <div className="relative">
         {/* Fluid typography for timer */}
         <div className={`text-[5rem] sm:text-8xl md:text-9xl lg:text-[10rem] leading-none font-mono font-bold tracking-tighter tabular-nums drop-shadow-2xl ${timeLeft < 10 ? 'text-secondary animate-pulse' : 'text-white'} transition-all duration-300`}>
            {formatTime(timeLeft)}
         </div>
          </div>

          <div className="flex flex-col items-center w-full mt-8 sm:mt-12">
         
         <ControlBar 
            isRunning={isRunning} 
            onToggle={() => {
           if (!isRunning && timeLeft === currentStep.duration) playSound('start');
           setIsRunning(!isRunning);
            }} 
            onReset={() => {
          setIsRunning(false);
          setTimeLeft(currentStep.duration);
            }}
            onBack={handleBack}
          />

          {/* Navigation buttons below control bar for mobile ergonomics */}
         <div className="flex items-center gap-4 mt-6 sm:mt-8">
           <button 
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 rounded-lg text-base-content/50 hover:text-base-content disabled:opacity-20 hover:bg-white/5 transition-all text-sm sm:text-base"
           >
          Anterior
           </button>

           <button 
          onClick={handleNextStep}
          disabled={currentStepIndex === DEFAULT_JUDGING_FLOW.length - 1}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-primary text-sm sm:text-base"
           >
          Próximo <ChevronRight size={16} />
           </button>
         </div>
          </div>
        </div>
      </div>
    </div>
  );
};