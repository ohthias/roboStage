'use client';

import React from 'react';
import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  Database,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Eraser,
  Spline,
} from 'lucide-react';
import { ToolType } from '@/types/thinklab.types';
import { cn } from './editor-ui';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

export interface ToolItem {
  id: ToolType;
  label: string;
  short: string;
  icon: React.ReactNode;
  shortcut: string;
}

const CapsuleIcon = () => <span className="block w-4 h-2.5 border-2 border-current rounded-full" />;
const ParallelogramIcon = () => <span className="block w-4 h-3 border-2 border-current -skew-x-12" />;
const PathIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 18 21 6 21 2 8.5" />
  </svg>
);

/** Ferramentas agrupadas: cada grupo vira um bloco do controle segmentado. */
export const TOOL_GROUPS: ToolItem[][] = [
  [
    { id: 'select', label: 'Selecionar / Mover', short: 'Selecionar', icon: <MousePointer2 className="size-4" />, shortcut: 'V' },
    { id: 'hand', label: 'Mão (arrastar canvas)', short: 'Mão', icon: <Hand className="size-4" />, shortcut: 'Espaço' },
  ],
  [
    { id: 'rectangle', label: 'Retângulo / Processo', short: 'Retângulo', icon: <Square className="size-4" />, shortcut: 'R' },
    { id: 'diamond', label: 'Losango / Decisão', short: 'Decisão', icon: <Diamond className="size-4" />, shortcut: 'D' },
    { id: 'capsule', label: 'Início / Fim', short: 'Terminal', icon: <CapsuleIcon />, shortcut: 'C' },
    { id: 'cylinder', label: 'Banco de dados', short: 'Banco', icon: <Database className="size-4" />, shortcut: '5' },
    { id: 'parallelogram', label: 'Entrada / Saída', short: 'E/S', icon: <ParallelogramIcon />, shortcut: '6' },
    { id: 'ellipse', label: 'Círculo / Elipse', short: 'Elipse', icon: <Circle className="size-4" />, shortcut: '7' },
  ],
  [
    { id: 'arrow', label: 'Seta de fluxo', short: 'Seta', icon: <ArrowRight className="size-4" />, shortcut: 'A' },
    { id: 'line', label: 'Linha', short: 'Linha', icon: <Minus className="size-4" />, shortcut: 'L' },
    { id: 'bezier', label: 'Curva Bézier', short: 'Curva', icon: <Spline className="size-4" />, shortcut: 'B' },
    { id: 'path', label: 'Polígono editável', short: 'Polígono', icon: <PathIcon />, shortcut: 'M' },
  ],
  [
    { id: 'freedraw', label: 'Desenho livre', short: 'Caneta', icon: <Pencil className="size-4" />, shortcut: 'P' },
    { id: 'text', label: 'Texto', short: 'Texto', icon: <Type className="size-4" />, shortcut: 'T' },
    { id: 'eraser', label: 'Borracha', short: 'Borracha', icon: <Eraser className="size-4" />, shortcut: 'E' },
  ],
];

/**
 * Ferramentas de desenho no formato do seletor "Desktop | Mobile" da referência:
 * a ferramenta ativa ganha fundo suave na cor primária e exibe seu nome.
 */
export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  return (
    <nav aria-label="Ferramentas do diagrama" className="flex items-center gap-1 select-none">
      {TOOL_GROUPS.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <span className="h-5 w-px bg-base-300 mx-1 shrink-0" aria-hidden />}
          {group.map((tool) => {
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                aria-label={tool.label}
                aria-pressed={active}
                title={`${tool.label} (${tool.shortcut})`}
                className={cn(
                  'btn btn-sm btn-ghost shrink-0 border-0 font-normal gap-1.5 px-2',
                  active
                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                    : 'text-base-content/55 hover:text-base-content hover:bg-base-200'
                )}
              >
                {tool.icon}
                {active && <span className="hidden xl:inline text-[13px]">{tool.short}</span>}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </nav>
  );
}
