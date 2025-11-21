import React from 'react';
import { RotateCcw, Menu, Trophy } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  title: string;
  subTitle?: string;
  onReset: () => void;
  onMenu: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ 
  isOpen, 
  title, 
  subTitle = "Timer Finalizado", 
  onReset, 
  onMenu 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-base-200/90 border border-base-300 rounded-3xl p-8 max-w-lg w-full shadow-2xl transform scale-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center text-center text-base-content">
        <div className="mb-6 p-4 bg-gradient-to-br from-accent to-accent-focus rounded-full shadow-lg shadow-accent/20 animate-bounce">
        <Trophy size={48} className="text-accent-content" />
        </div>

        <h2 className="text-4xl font-black text-base-content uppercase italic tracking-wider mb-2 drop-shadow-md">
        {title}
        </h2>
        
        <p className="text-base-content/70 text-lg mb-10 font-medium">
        {subTitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-base-300 hover:bg-base-200 border border-base-300 hover:border-base-200 text-base-content font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <RotateCcw size={20} />
          Reiniciar
        </button>

        <button
          onClick={onMenu}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary hover:bg-primary-focus text-primary-content font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Menu size={20} />
          Voltar ao Menu
        </button>
        </div>
      </div>
      </div>
    </div>
  );
};