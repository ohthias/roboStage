'use client';

import React, { useState } from 'react';
import { MessageCircleQuestion, PackageOpen, LayoutTemplate } from 'lucide-react';
import { CanvasElement, GraphicAsset, PredefinedComponent } from '@/types/thinklab.types';
import { ComponentLibrary } from './ComponentLibrary';
import { LayersPanel } from './LayersPanel';
import { MissionsPanel } from './MissionsPanel';
import { cn } from './editor-ui';

interface EditorSidebarProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onInsertComponent: (template: PredefinedComponent['template']) => void;
  onInsertAsset: (elements: GraphicAsset['elements'], assetName: string) => void;
  onOpenGraphicAssets: () => void;
  onOpenTemplates: () => void;
  onOpenHelp: () => void;
  focusSearchSignal?: number;
  className?: string;
}

type Tab = 'design' | 'missions' | 'layers';

/** Coluna esquerda do editor: abas Design / Camadas + rodapé de ajuda. */
export function EditorSidebar({
  elements,
  selectedIds,
  onSelectIds,
  onInsertComponent,
  onInsertAsset,
  onOpenGraphicAssets,
  onOpenTemplates,
  onOpenHelp,
  focusSearchSignal,
  className,
}: EditorSidebarProps) {
  const [tab, setTab] = useState<Tab>('design');

  // O atalho "/" sempre volta para a aba de componentes
  const [lastSignal, setLastSignal] = useState(focusSearchSignal);
  if (focusSearchSignal !== lastSignal) {
    setLastSignal(focusSearchSignal);
    if (tab !== 'design') setTab('design');
  }

  return (
    <aside
      aria-label="Componentes e camadas"
      className={cn('flex flex-col min-h-0 bg-base-100 border-r border-base-300 select-none', className)}
    >
      <div role="tablist" className="tabs px-3 gap-2 border-b border-base-300 shrink-0">
        {(
          [
            ['design', 'Design'],
            ['missions', 'Missões'],
            ['layers', 'Camadas'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'tab h-11 px-1 text-sm border-b-2 -mb-px rounded-none',
              tab === id
                ? 'tab-active border-primary font-medium text-base-content'
                : 'border-transparent text-base-content/55 hover:text-base-content',
            )}
          >
            {label}
            {id === 'layers' && elements.length > 0 && (
              <span className="ml-1.5 text-xs text-base-content/40 tabular-nums">{elements.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'design' && (
        <ComponentLibrary
          onInsertComponent={onInsertComponent}
          onInsertAsset={onInsertAsset}
          focusSearchSignal={focusSearchSignal}
        />
      )}
      {/* Mantém a aba montada para não recarregar as missões a cada troca */}
      <div className={cn('flex-col min-h-0 flex-1', tab === 'missions' ? 'flex' : 'hidden')}>
        <MissionsPanel onInsertAsset={onInsertAsset} />
      </div>
      {tab === 'layers' && <LayersPanel elements={elements} selectedIds={selectedIds} onSelectIds={onSelectIds} />}

      <div className="shrink-0 border-t border-base-300 px-2 py-2 flex flex-col">
        <button onClick={onOpenTemplates} className="btn btn-ghost btn-sm justify-start font-normal gap-2.5">
          <LayoutTemplate className="size-4" /> Modelos prontos
        </button>
        <button onClick={onOpenGraphicAssets} className="btn btn-ghost btn-sm justify-start font-normal gap-2.5">
          <PackageOpen className="size-4" /> Galeria de gráficos
        </button>
        <button onClick={onOpenHelp} className="btn btn-ghost btn-sm justify-start font-normal gap-2.5">
          <MessageCircleQuestion className="size-4" /> Precisa de ajuda?
        </button>
      </div>
    </aside>
  );
}
