import React from 'react';
import {
  Download,
  Palette,
  SlidersHorizontal,
  Columns,
  Eye,
  Edit3,
} from 'lucide-react';
import { DiagramSettings } from '@/app/(public)/[competicao]/thinklab/ishikawa/ishikawa.types';
import { THEMES } from '@/utils/thinklab/themes';

interface HeaderProps {
  settings: DiagramSettings;
  onUpdateSettings: (newSettings: Partial<DiagramSettings>) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  viewMode: 'split' | 'editor-only' | 'diagram-only';
  setViewMode: (mode: 'split' | 'editor-only' | 'diagram-only') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenExport,
  onOpenSettings,
  viewMode,
  setViewMode,
}) => {
  return (
    <header className="navbar bg-base-100 border-2 border-base-content/20 rounded-2xl shadow-lg px-3 md:px-5 py-2 min-h-[64px] flex items-center justify-between gap-3 select-none transition-all">
      <div className="hidden md:flex items-center join bg-base-200 p-1 rounded-xl border border-base-content/10">
        <button
          onClick={() => setViewMode('split')}
          className={`btn btn-xs sm:btn-sm join-item font-bold gap-1.5 ${
            viewMode === 'split' ? 'btn-active btn-primary shadow-sm' : 'btn-ghost'
          }`}
          title="Modo Dividido (Editor e Diagrama)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Dividido</span>
        </button>
        <button
          onClick={() => setViewMode('editor-only')}
          className={`btn btn-xs sm:btn-sm join-item font-bold gap-1.5 ${
            viewMode === 'editor-only' ? 'btn-active btn-primary shadow-sm' : 'btn-ghost'
          }`}
          title="Apenas Editor Markdown"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setViewMode('diagram-only')}
          className={`btn btn-xs sm:btn-sm join-item font-bold gap-1.5 ${
            viewMode === 'diagram-only' ? 'btn-active btn-primary shadow-sm' : 'btn-ghost'
          }`}
          title="Apenas Diagrama"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Diagrama</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Diagram Palette Quick Switch Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            id="header-btn-theme"
            className="btn btn-sm btn-square btn-ghost border border-base-content/20"
            title="Paleta do Diagrama"
          >
            <Palette className="w-4 h-4 opacity-80" />
          </div>

          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-60 p-2 shadow-2xl border-2 border-base-content/20 mt-2"
          >
            <li className="menu-title text-xs font-bold uppercase opacity-60">Cores do Diagrama</li>
            {Object.values(THEMES).map((thm) => (
              <li key={thm.id}>
                <button
                  onClick={() => onUpdateSettings({ theme: thm.id })}
                  className={`flex justify-between items-center py-2 px-2.5 text-xs font-bold rounded-xl my-0.5 ${
                    settings.theme === thm.id ? 'active bg-primary text-primary-content' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-base-content/30 shadow-xs"
                      style={{ backgroundColor: thm.headBg }}
                    />
                    {thm.name}
                  </span>
                  {settings.theme === thm.id && <span className="font-extrabold">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Settings Button */}
        <button
          id="header-btn-settings"
          onClick={onOpenSettings}
          className="btn btn-sm btn-square btn-ghost border border-base-content/20"
          title="Configurações do Diagrama"
        >
          <SlidersHorizontal className="w-4 h-4 opacity-80" />
        </button>

        {/* Export Button */}
        <button
          id="header-btn-export"
          onClick={onOpenExport}
          className="btn btn-sm btn-primary gap-1.5 font-bold shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
