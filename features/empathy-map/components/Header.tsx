import { Download, FolderOpen, HelpCircle, LayoutGrid, LineChart, ChevronDown } from 'lucide-react';
import { IconButton, Segmented, ToolButton, Toolbar, ToolbarGroup, ToolbarSpacer } from '@/components/stage';
import { ViewMode } from '@/features/empathy-map/types';

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
    <Toolbar label="Mapa de Empatia" className="gap-2 px-3">
      <ToolbarGroup className="min-w-0 flex-1 md:flex-none">
        <button
          onClick={onOpenMapManager}
          type="button"
          className="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-base-content/[0.05] focus-visible:outline-2 focus-visible:outline-primary"
          title="Alternar mapas e personas"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Mapa ativo</span>
            <span className="block max-w-[55vw] truncate text-[13px] font-bold sm:max-w-[220px]">{mapTitle}</span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-base-content/45 group-hover:text-base-content" />
        </button>
      </ToolbarGroup>

      <Segmented
        label="Visualização"
        value={currentView}
        onChange={onViewChange}
        options={[
          { value: 'board', label: 'Mural', icon: <LayoutGrid /> },
          { value: 'analysis', label: 'Análise', icon: <LineChart /> },
        ]}
        className="order-last w-full md:order-none md:w-auto [&>button]:flex-1"
      />

      <ToolbarSpacer />

      <ToolbarGroup className="gap-1">
        <IconButton label="Como funciona" icon={<HelpCircle />} onClick={onOpenHelp} className="sm:hidden" />
        <ToolButton variant="ghost" icon={<HelpCircle />} onClick={onOpenHelp} className="hidden sm:inline-flex">
          Ajuda
        </ToolButton>
        <IconButton label="Modelos de persona" icon={<FolderOpen />} onClick={onOpenMapManager} className="sm:hidden" />
        <ToolButton variant="ghost" icon={<FolderOpen />} onClick={onOpenMapManager} className="hidden sm:inline-flex">
          Modelos
        </ToolButton>
        <IconButton label="Exportar" icon={<Download />} variant="primary" onClick={onOpenExport} className="sm:hidden" />
        <ToolButton variant="primary" icon={<Download />} onClick={onOpenExport} className="hidden sm:inline-flex">
          Exportar
        </ToolButton>
      </ToolbarGroup>
    </Toolbar>
  );
};
