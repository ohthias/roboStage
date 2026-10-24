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
  const tabs: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'board', label: 'Mural', icon: LayoutGrid },
    { id: 'analysis', label: 'Análise', icon: LineChart },
  ];

  return (
    // No celular o header não fica fixo: a barra de quadrantes do mural ocupa o topo.
    <header className="bg-base-200 border-b border-base-300/60 px-2 sm:px-4 py-2 shadow-xs sm:sticky sm:top-2 z-40 backdrop-blur-sm rounded-lg flex flex-wrap items-center gap-2 md:flex-nowrap md:justify-between">
      {/* Esquerda: mapa ativo */}
      <button
        onClick={onOpenMapManager}
        type="button"
        className="btn btn-ghost btn-sm h-auto min-h-10 text-left px-2 py-1.5 min-w-0 flex-1 md:flex-none justify-start"
        title="Alternar mapas e personas"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold leading-tight">Mapa de Empatia</span>
          <span className="text-[11px] text-base-content/60 truncate max-w-[55vw] sm:max-w-[180px]">
            {mapTitle}
          </span>
        </div>
      </button>

      {/* Direita: ações (só ícone no celular) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 md:order-3">
        <button
          onClick={onOpenHelp}
          type="button"
          className="btn btn-ghost btn-sm btn-square sm:w-auto sm:px-3 text-xs font-medium gap-1.5"
          title="Como funciona a ferramenta"
          aria-label="Ajuda"
        >
          <HelpCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-base-content/60" />
          <span className="hidden sm:inline">Ajuda</span>
        </button>

        <button
          onClick={onOpenMapManager}
          type="button"
          className="btn btn-ghost btn-sm btn-square sm:w-auto sm:px-3 text-xs font-medium gap-1.5"
          title="Modelos de persona"
          aria-label="Modelos"
        >
          <FolderOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-base-content/60" />
          <span className="hidden sm:inline">Modelos</span>
        </button>

        <button
          onClick={onOpenExport}
          type="button"
          className="btn btn-outline btn-sm btn-square sm:w-auto sm:px-3 text-xs font-semibold gap-1.5"
          title="Exportar imagem do quadro"
          aria-label="Baixar imagem"
        >
          <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Baixar Imagem</span>
        </button>
      </div>

      {/* Centro: abas (linha inteira no celular) */}
      <div
        role="tablist"
        className="tabs tabs-box bg-base-200/80 p-0.5 rounded-xl w-full md:w-auto md:order-2 grid grid-cols-2 md:flex"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={currentView === id}
            onClick={() => onViewChange(id)}
            className={`tab tab-sm h-9 md:h-auto font-semibold gap-1.5 transition-all ${
              currentView === id
                ? 'tab-active bg-base-100 text-base-content shadow-xs rounded-lg'
                : 'text-base-content/70'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
