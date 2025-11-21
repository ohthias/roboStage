import React from 'react';
import { APP_THEMES, Theme } from '@/types/TimersType';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelectTheme }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50">
      <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-bold uppercase tracking-wider">
        <Palette size={16} />
        <span>Tema do App</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {APP_THEMES.map((theme) => {
          const isActive = currentTheme.id === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                ${isActive ? 'bg-white/10 ring-2 ring-white/20' : 'hover:bg-white/5'}
              `}
            >
              <div className={`w-10 h-10 rounded-full shadow-lg ${theme.bgClass} border-2 ${isActive ? 'border-white' : 'border-transparent'}`}></div>
              <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {theme.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};