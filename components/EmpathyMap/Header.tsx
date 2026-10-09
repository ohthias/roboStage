import { Download, LayoutGrid, LineChart, FolderOpen, HelpCircle } from 'lucide-react';
import { ViewMode } from '@/types/EmpathyMap.types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenExport: () => void;
  onOpenMapManager: () => void;
  onOpenHelp: () => void;
  mapTitle: string;
}

export const HeaderEM: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenExport,
  onOpenMapManager,
  onOpenHelp,
  mapTitle,
}) => {
  return (
    <header className="navbar bg-base-200 border-b border-base-300/60 px-4 py-2 shadow-xs sticky top-2 z-40 backdrop-blur-sm rounded-lg">
      <div className="navbar-start gap-2">
        <button
          onClick={onOpenMapManager}
          type="button"
          className="btn btn-ghost btn-sm text-left px-2 py-1.5"
          title="Alternar mapas e personas"
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">
              Mapa de Empatia
            </span>
            <span className="text-[11px] text-base-content/60 truncate max-w-[180px]">
              {mapTitle}
            </span>
          </div>
        </button>
      </div>

      {/* Center: Tabs Switcher (DaisyUI Tabs) */}
      <div className="navbar-center">
        <div role="tablist" className="tabs tabs-box bg-base-200/80 p-0.5 rounded-xl">
          <button
            role="tab"
            onClick={() => onViewChange('board')}
            className={`tab tab-sm font-semibold gap-1.5 transition-all ${
              currentView === 'board' ? 'tab-active bg-base-100 text-base-content shadow-xs rounded-lg' : 'text-base-content/70'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Mural</span>
          </button>

          <button
            role="tab"
            onClick={() => onViewChange('analysis')}
            className={`tab tab-sm font-semibold gap-1.5 transition-all ${
              currentView === 'analysis' ? 'tab-active bg-base-100 text-base-content shadow-xs rounded-lg' : 'text-base-content/70'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Análise</span>
          </button>
        </div>
      </div>

      {/* Right: Actions (Ajuda, Modelos, Baixar Imagem) */}
      <div className="navbar-end gap-1.5">
        <button
          onClick={onOpenHelp}
          type="button"
          className="btn btn-ghost btn-sm text-xs font-medium gap-1.5"
          title="Como funciona a ferramenta"
        >
          <HelpCircle className="w-3.5 h-3.5 text-base-content/60" />
          <span>Ajuda</span>
        </button>

        <button
          onClick={onOpenMapManager}
          type="button"
          className="btn btn-ghost btn-sm text-xs font-medium gap-1.5"
          title="Modelos de persona"
        >
          <FolderOpen className="w-3.5 h-3.5 text-base-content/60" />
          <span className="hidden sm:inline">Modelos</span>
        </button>

        <button
          onClick={onOpenExport}
          type="button"
          className="btn btn-outline btn-sm text-xs font-semibold gap-1.5"
          title="Exportar imagem do quadro"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar Imagem</span>
        </button>
      </div>
    </header>
  );
};
