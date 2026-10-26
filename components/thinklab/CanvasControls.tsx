'use client';

import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { CanvasElement, ViewportState } from '@/types/thinklab.types';
import { cn } from './editor-ui';

const GRID_LABELS = { dots: 'Pontos', lines: 'Linhas', none: 'Sem grade' } as const;

interface CanvasControlsProps {
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
  smartSnapping: boolean;
  onToggleSmartSnapping: () => void;
  elementCount: number;
}

/** Barra flutuante na base do canvas (histórico, zoom, grade e snap). */
export function CanvasControls({
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
  smartSnapping,
  onToggleSmartSnapping,
  elementCount,
}: CanvasControlsProps) {
  const btn = 'btn btn-sm btn-ghost btn-square border-0 font-normal';
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-box border border-base-300 bg-base-100 p-1 shadow-sm select-none">
      <button onClick={onUndo} disabled={!canUndo} className={btn} title="Desfazer (Ctrl+Z)" aria-label="Desfazer">
        <Undo2 className="size-4" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={btn} title="Refazer (Ctrl+Y)" aria-label="Refazer">
        <Redo2 className="size-4" />
      </button>

      <span className="h-5 w-px bg-base-300 mx-0.5" aria-hidden />

      <button onClick={onZoomOut} className={btn} title="Diminuir zoom (-)" aria-label="Diminuir zoom">
        <ZoomOut className="size-4" />
      </button>
      <button
        onClick={onResetZoom}
        className="btn btn-sm btn-ghost border-0 font-normal tabular-nums w-14 px-0 text-xs"
        title="Voltar para 100%"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button onClick={onZoomIn} className={btn} title="Aumentar zoom (+)" aria-label="Aumentar zoom">
        <ZoomIn className="size-4" />
      </button>

      <span className="h-5 w-px bg-base-300 mx-0.5" aria-hidden />

      <button
        onClick={onToggleGrid}
        className={cn(btn, gridType !== 'none' && 'bg-primary/10 text-primary hover:bg-primary/15')}
        title={`Grade: ${GRID_LABELS[gridType]}`}
        aria-label={`Alternar grade (atual: ${GRID_LABELS[gridType]})`}
      >
        <Grid3X3 className="size-4" />
      </button>
      <button
        onClick={onToggleSmartSnapping}
        className={cn(btn, smartSnapping && 'bg-primary/10 text-primary hover:bg-primary/15')}
        title={`Guias inteligentes: ${smartSnapping ? 'ativas (Alt ignora)' : 'desligadas'}`}
        aria-label="Alternar guias inteligentes"
        aria-pressed={smartSnapping}
      >
        <Magnet className="size-4" />
      </button>

      <span className="hidden sm:inline px-2 text-xs text-base-content/50 tabular-nums">
        {elementCount} {elementCount === 1 ? 'objeto' : 'objetos'}
      </span>
    </div>
  );
}

/** Caixa delimitadora (em coordenadas do canvas) de um conjunto de elementos. */
export function getElementsBounds(elements: CanvasElement[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements) {
    const xs = [el.x, el.x + el.width];
    const ys = [el.y, el.y + el.height];
    el.points?.forEach((p) => {
      xs.push(el.x + p.x);
      ys.push(el.y + p.y);
    });
    minX = Math.min(minX, ...xs);
    maxX = Math.max(maxX, ...xs);
    minY = Math.min(minY, ...ys);
    maxY = Math.max(maxY, ...ys);
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

interface SelectionActionsProps {
  selectedElements: CanvasElement[];
  viewport: ViewportState;
  containerSize: { width: number; height: number };
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpenInspector: () => void;
}

const RAIL_WIDTH = 32;
const RAIL_HEIGHT = 5 * 32 + 4 * 6;

/**
 * Trilho vertical de ações ancorado à esquerda da seleção — o equivalente aos
 * botões ↑ ↓ ⚙ 🗑 ao lado do bloco selecionado na referência.
 */
export function SelectionActions({
  selectedElements,
  viewport,
  containerSize,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  onDelete,
  onOpenInspector,
}: SelectionActionsProps) {
  const bounds = getElementsBounds(selectedElements);
  if (!bounds || containerSize.width === 0) return null;

  const screenLeft = bounds.minX * viewport.zoom + viewport.panX;
  const screenTop = bounds.minY * viewport.zoom + viewport.panY;
  const screenRight = bounds.maxX * viewport.zoom + viewport.panX;

  // Prefere a esquerda da seleção; se não couber, vai para a direita.
  let left = screenLeft - RAIL_WIDTH - 16;
  if (left < 8) left = screenRight + 16;
  left = Math.min(Math.max(8, left), containerSize.width - RAIL_WIDTH - 8);
  const top = Math.min(Math.max(8, screenTop), containerSize.height - RAIL_HEIGHT - 72);

  const item =
    'btn btn-xs btn-square size-8 border border-base-300 bg-base-100 shadow-xs hover:bg-base-200 font-normal';

  return (
    <div
      className="absolute z-20 flex flex-col gap-1.5 select-none pointer-events-auto"
      style={{ left, top }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button onClick={onBringToFront} className={item} title="Trazer para frente" aria-label="Trazer para frente">
        <ChevronUp className="size-4" />
      </button>
      <button onClick={onSendToBack} className={item} title="Enviar para trás" aria-label="Enviar para trás">
        <ChevronDown className="size-4" />
      </button>
      <button onClick={onDuplicate} className={item} title="Duplicar (Ctrl+D)" aria-label="Duplicar">
        <Copy className="size-3.5" />
      </button>
      <button onClick={onOpenInspector} className={cn(item, 'lg:hidden')} title="Propriedades" aria-label="Abrir propriedades">
        <SlidersHorizontal className="size-3.5" />
      </button>
      <button
        onClick={onDelete}
        className={cn(item, 'text-error bg-error/10 border-error/20 hover:bg-error/20')}
        title="Excluir (Del)"
        aria-label="Excluir seleção"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
