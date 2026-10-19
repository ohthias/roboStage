'use client';

import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  LayoutTemplate,
  Trash2,
  Grid3X3,
  HelpCircle,
  Palette,
  FileCode2,
  Layers,
  Magnet,
  PackageOpen,
  Database,
} from 'lucide-react';

interface NavbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  gridType: 'dots' | 'lines' | 'none';
  onToggleGrid: () => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenDatabase?: () => void;
  onOpenShortcuts: () => void;
  onClearCanvas: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  elementCount: number;
  onToggleLibrary?: () => void;
  isLibraryOpen?: boolean;
  smartSnapping?: boolean;
  onToggleSmartSnapping?: () => void;
  onOpenGraphicAssets?: () => void;
}

const THEMES = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'retro', label: 'Retrô' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'forest', label: 'Floresta' },
  { id: 'synthwave', label: 'Synthwave' },
  { id: 'nord', label: 'Nord' },
];

export function Navbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  gridType,
  onToggleGrid,
  onOpenTemplates,
  onOpenExport,
  onOpenShortcuts,
  onClearCanvas,
  currentTheme,
  onThemeChange,
  elementCount,
  onToggleLibrary,
  isLibraryOpen,
  smartSnapping = true,
  onToggleSmartSnapping,
  onOpenGraphicAssets,
  onOpenDatabase,
}: NavbarProps) {
  return (
    <header className="min-h-16 h-auto px-2 sm:px-4 py-2 border-b border-base-300 bg-base-100 flex flex-wrap items-center justify-between gap-2 sm:gap-4 z-30 select-none shadow-xs">
      <button onClick={() => window.history.back()} className="btn btn-sm btn-ghost gap-1.5 shrink-0">
        Voltar
      </button>
      {/* Middle Zone: Canvas actions */}
      <div className="order-3 sm:order-none basis-full sm:basis-auto flex-1 min-w-0 flex items-center justify-start gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap pb-0.5">
        {/* Undo / Redo */}
        <div className="join shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="btn btn-sm btn-ghost join-item tooltip tooltip-bottom"
            data-tip="Desfazer (Ctrl+Z)"
            aria-label="Desfazer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="btn btn-sm btn-ghost join-item tooltip tooltip-bottom"
            data-tip="Refazer (Ctrl+Y)"
            aria-label="Refazer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="divider divider-horizontal mx-0 my-2 shrink-0" />

        {/* Zoom Controls */}
        <div className="join items-center shrink-0">
          <button
            onClick={onZoomOut}
            className="btn btn-sm btn-ghost join-item tooltip tooltip-bottom"
            data-tip="Diminuir Zoom (-)"
            aria-label="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onResetZoom}
            className="btn btn-sm btn-ghost join-item text-xs font-mono tabular-nums px-2"
            title="Resetar Zoom para 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="btn btn-sm btn-ghost join-item tooltip tooltip-bottom"
            data-tip="Aumentar Zoom (+)"
            aria-label="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="divider divider-horizontal mx-0 my-2 shrink-0" />

        {/* Grid Style Toggle */}
        <button
          onClick={onToggleGrid}
          className={`btn btn-sm shrink-0 ${gridType !== 'none' ? 'btn-neutral' : 'btn-ghost'} tooltip tooltip-bottom`}
          data-tip={`Grade: ${gridType === 'dots' ? 'Pontos' : gridType === 'lines' ? 'Linhas' : 'Sem Grade'}`}
          aria-label="Alternar grade do canvas"
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="hidden md:inline capitalize text-xs">
            {gridType === 'dots' ? 'Pontos' : gridType === 'lines' ? 'Linhas' : 'Sem grade'}
          </span>
        </button>

        {/* Smart Snapping Toggle */}
        {onToggleSmartSnapping && (
          <button
            onClick={onToggleSmartSnapping}
            className={`btn btn-sm shrink-0 ${smartSnapping ? 'btn-neutral text-primary' : 'btn-ghost'} tooltip tooltip-bottom`}
            data-tip={`Guias Inteligentes (Snap): ${smartSnapping ? 'Ativado (Alinhamento Automático)' : 'Desativado (Segure Alt)'}`}
            aria-label="Alternar guias inteligentes de alinhamento"
          >
            <Magnet className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">Snap</span>
          </button>
        )}

        {/* Templates Picker */}
        <button
          onClick={onOpenTemplates}
          className="btn btn-sm btn-ghost shrink-0 tooltip tooltip-bottom"
          data-tip="Modelos Prontos de Fluxogramas"
          aria-label="Modelos prontos"
        >
          <LayoutTemplate className="w-4 h-4" />
          <span className="hidden md:inline text-xs">Modelos</span>
        </button>

        {/* Component Library Toggle */}
        {onToggleLibrary && (
          <button
            onClick={onToggleLibrary}
            className={`btn btn-sm shrink-0 ${isLibraryOpen ? 'btn-primary' : 'btn-ghost'} tooltip tooltip-bottom`}
            data-tip="Biblioteca de Formas & Componentes"
            aria-label="Biblioteca de componentes"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline text-xs">Formas</span>
          </button>
        )}

        {/* Graphic Assets Library Button */}
        {onOpenGraphicAssets && (
          <button
            onClick={onOpenGraphicAssets}
            className="btn btn-sm btn-ghost shrink-0 tooltip tooltip-bottom"
            data-tip="Biblioteca de Elementos Gráficos Prontos (Uso Livre)"
            aria-label="Elementos Gráficos Prontos"
          >
            <PackageOpen className="w-4 h-4 text-primary" />
            <span className="hidden md:inline text-xs font-semibold">Gráficos</span>
          </button>
        )}

        {/* Limpar Canvas */}
        <button
          onClick={onClearCanvas}
          disabled={elementCount === 0}
          className="btn btn-sm btn-ghost shrink-0 text-error/80 hover:text-error tooltip tooltip-bottom"
          data-tip="Limpar Todo o Canvas"
          aria-label="Limpar Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right Zone: Theme + Shortcuts + Export primary action */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
        {/* Shortcuts Guide */}
        <button
          onClick={onOpenShortcuts}
          className="btn btn-sm btn-ghost btn-circle tooltip tooltip-bottom"
          data-tip="Atalhos do Teclado"
          aria-label="Atalhos"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Export Modal Primary Button */}
        <button
          onClick={onOpenExport}
          className="btn btn-sm btn-primary gap-1.5 shadow-sm text-xs"
          data-tip="Exportar em SVG, PNG, PDF ou JSON"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
}
