
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export interface TourStep {
  targetId: string | null; // null means center of screen
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Reset step when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Calculate position of current target
  const calculatePosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step.targetId) {
      setCoords(null);
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      
      // Scroll into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Fallback if element not found
      setCoords(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      // Small delay to allow UI to settle (e.g., if a sidebar expanded)
      const timer = setTimeout(calculatePosition, 300);
      return () => {
        window.removeEventListener('resize', calculatePosition);
        clearTimeout(timer);
      };
    }
  }, [isOpen, currentStep, calculatePosition]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Tooltip positioning logic
  const getTooltipStyle = () => {
    if (!coords) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const gap = 12;
    const position = step.position || 'bottom';
    
    // Default values
    let top = 0;
    let left = 0;
    let transform = '';

    switch (position) {
      case 'bottom':
        top = coords.top + coords.height + gap;
        left = coords.left + coords.width / 2;
        transform = 'translateX(-50%)';
        break;
      case 'top':
        top = coords.top - gap;
        left = coords.left + coords.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'right':
        top = coords.top + coords.height / 2;
        left = coords.left + coords.width + gap;
        transform = 'translateY(-50%)';
        break;
      case 'left':
        top = coords.top + coords.height / 2;
        left = coords.left - gap;
        transform = 'translate(-100%, -50%)';
        break;
      default: // Center fallback
         return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    return { top, left, transform };
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-base-300/80 backdrop-blur-sm" />

      {/* Highlight Cutout (Visual only) */}
      {coords && (
        <div 
            className="absolute transition-all duration-300 ease-in-out border-2 border-primary rounded-lg"
            style={{
                top: coords.top - 4,
                left: coords.left - 4,
                width: coords.width + 8,
                height: coords.height + 8,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)'
            }}
        />
      )}

      {/* Card */}
      <div 
        className="card w-[320px] bg-base-100 shadow-xl border border-base-content/10 absolute transition-all duration-300"
        style={getTooltipStyle()}
      >
        <div className="card-body p-5">
            <button 
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
                <X size={16} />
            </button>

            <h2 className="card-title text-sm flex items-center gap-2">
                <span className="badge badge-primary">{currentStep + 1}/{steps.length}</span>
                {step.title}
            </h2>
            <p className="text-xs text-base-content/70 py-2">
                {step.content}
            </p>

            <div className="card-actions justify-between items-center mt-2">
                <div className="join">
                    <button 
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="join-item btn btn-xs btn-ghost"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button className="join-item btn btn-xs btn-ghost no-animation cursor-default">
                        <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full ${idx === currentStep ? 'bg-primary' : 'bg-base-300'}`}
                            />
                        ))}
                        </div>
                    </button>
                    <button 
                        onClick={handleNext}
                        className={`join-item btn btn-xs ${isLast ? 'btn-success' : 'btn-ghost'}`}
                    >
                        {isLast ? <Check size={14} /> : <ChevronRight size={16} />}
                    </button>
                </div>
                {isLast && <button onClick={handleNext} className="btn btn-xs btn-success">Concluir</button>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
