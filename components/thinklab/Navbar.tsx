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
    <header className="h-16 px-4 border-b border-base-300 bg-base-100 flex items-center justify-between gap-4 z-30 select-none shadow-xs">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-lg shadow-sm">
            <span style={{ fontFamily: 'Patrick Hand, cursive' }}>E~</span>
          </div>
          <div>
            <h1
              className="text-lg font-bold tracking-tight text-base-content leading-none"
              style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.4rem' }}
            >
              ExcaliFlow
            </h1>
            <span className="text-[11px] text-base-content/60 font-sans">
              Diagramas & Fluxogramas
            </span>
          </div>
        </div>
      </div>

      {/* Middle Zone: Canvas actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo / Redo */}
        <div className="join">
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

        <div className="divider divider-horizontal mx-0 my-2" />

        {/* Zoom Controls */}
        <div className="join items-center">
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

        <div className="divider divider-horizontal mx-0 my-2" />

        {/* Grid Style Toggle */}
        <button
          onClick={onToggleGrid}
          className={`btn btn-sm ${gridType !== 'none' ? 'btn-neutral' : 'btn-ghost'} tooltip tooltip-bottom`}
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
            className={`btn btn-sm ${smartSnapping ? 'btn-neutral text-primary' : 'btn-ghost'} tooltip tooltip-bottom`}
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
          className="btn btn-sm btn-ghost tooltip tooltip-bottom"
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
            className={`btn btn-sm ${isLibraryOpen ? 'btn-primary' : 'btn-ghost'} tooltip tooltip-bottom`}
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
            className="btn btn-sm btn-ghost tooltip tooltip-bottom"
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
          className="btn btn-sm btn-ghost text-error/80 hover:text-error tooltip tooltip-bottom"
          data-tip="Limpar Todo o Canvas"
          aria-label="Limpar Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right Zone: Theme + Shortcuts + Export primary action */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Shortcuts Guide */}
        <button
          onClick={onOpenShortcuts}
          className="btn btn-sm btn-ghost btn-circle tooltip tooltip-bottom"
          data-tip="Atalhos do Teclado"
          aria-label="Atalhos"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-ghost gap-1.5 tooltip tooltip-bottom" data-tip="Tema visual DaisyUI">
            <Palette className="w-4 h-4" />
            <span className="capitalize hidden lg:inline text-xs">{currentTheme}</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-44 z-50 text-xs border border-base-300"
          >
            <li className="menu-title text-[10px] uppercase font-semibold text-base-content/50">
              Temas DaisyUI
            </li>
            {THEMES.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onThemeChange(t.id)}
                  className={currentTheme === t.id ? 'active font-semibold' : ''}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Database JSONB Integration Button */}
        {onOpenDatabase && (
          <button
            onClick={onOpenDatabase}
            className="btn btn-sm btn-outline btn-neutral gap-1.5 shadow-2xs text-xs tooltip tooltip-bottom"
            data-tip="Salvar ou Sincronizar em Banco de Dados (JSONB)"
            aria-label="Banco de Dados JSONB"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">JSONB</span>
          </button>
        )}

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
