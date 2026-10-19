'use client';

import React from 'react';
import {
  MousePointer,
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

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  category?: 'mode' | 'flow' | 'shape' | 'draw';
}

export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  const tools: ToolItem[] = [
    {
      id: 'select',
      label: 'Selecionar / Mover',
      icon: <MousePointer className="w-4 h-4" />,
      shortcut: '1',
      category: 'mode',
    },
    {
      id: 'hand',
      label: 'Mão (Arrastar Canvas / Pan)',
      icon: <Hand className="w-4 h-4" />,
      shortcut: 'H',
      category: 'mode',
    },
    {
      id: 'rectangle',
      label: 'Retângulo / Processo',
      icon: <Square className="w-4 h-4" />,
      shortcut: '2',
      category: 'shape',
    },
    {
      id: 'diamond',
      label: 'Losango / Decisão',
      icon: <Diamond className="w-4 h-4" />,
      shortcut: '3',
      category: 'flow',
    },
    {
      id: 'capsule',
      label: 'Início / Fim (Terminator)',
      icon: (
        <div className="w-4 h-2.5 border-2 border-current rounded-full" />
      ),
      shortcut: '4',
      category: 'flow',
    },
    {
      id: 'cylinder',
      label: 'Banco de Dados (Cilindro)',
      icon: <Database className="w-4 h-4" />,
      shortcut: '5',
      category: 'flow',
    },
    {
      id: 'parallelogram',
      label: 'Entrada / Saída (I/O)',
      icon: (
        <div className="w-4 h-3 border-2 border-current -skew-x-12" />
      ),
      shortcut: '6',
      category: 'flow',
    },
    {
      id: 'ellipse',
      label: 'Círculo / Elipse',
      icon: <Circle className="w-4 h-4" />,
      shortcut: '7',
      category: 'shape',
    },
    {
      id: 'arrow',
      label: 'Seta de Fluxo',
      icon: <ArrowRight className="w-4 h-4" />,
      shortcut: '8',
      category: 'flow',
    },
    {
      id: 'line',
      label: 'Linha',
      icon: <Minus className="w-4 h-4" />,
      shortcut: '9',
      category: 'shape',
    },
    {
      id: 'bezier',
      label: 'Curva Bézier',
      icon: <Spline className="w-4 h-4" />,
      shortcut: 'B',
      category: 'draw',
    },
    {
      id: 'path',
      label: 'Polígono / Caminho Editável',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 18 21 6 21 2 8.5" />
        </svg>
      ),
      shortcut: 'M',
      category: 'draw',
    },
    {
      id: 'freedraw',
      label: 'Desenho Livre (Caneta)',
      icon: <Pencil className="w-4 h-4" />,
      shortcut: 'P',
      category: 'draw',
    },
    {
      id: 'text',
      label: 'Texto',
      icon: <Type className="w-4 h-4" />,
      shortcut: 'T',
      category: 'draw',
    },
    {
      id: 'eraser',
      label: 'Borracha',
      icon: <Eraser className="w-4 h-4" />,
      shortcut: 'E',
      category: 'draw',
    },
  ];

  return (
    <nav 
      aria-label="Ferramentas do diagrama"
      className="fixed bottom-3 sm:bottom-auto sm:top-20 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar scrollbar-none bg-base-100/95 backdrop-blur-md border border-base-300 rounded-2xl shadow-xl px-2 py-1.5 flex items-center gap-1 select-none"
    >
      {tools.map((tool, idx) => {
        const isActive = activeTool === tool.id;
        const isSeparator = idx === 2 || idx === 8 || idx === 10;

        return (
          <React.Fragment key={tool.id}>
            {isSeparator && (
              <div className="h-5 w-px bg-base-300 mx-0.5 shrink-0" />
            )}
            <button
              onClick={() => onSelectTool(tool.id)}
              className={`relative btn btn-sm btn-ghost shrink-0 w-9 h-9 sm:w-9 sm:h-9 p-0 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-content shadow-sm scale-105'
                  : 'hover:bg-base-200 text-base-content/80 hover:text-base-content'
              } tooltip tooltip-top sm:tooltip-bottom`}
              data-tip={`${tool.label} (${tool.shortcut})`}
              aria-label={tool.label}
              aria-pressed={isActive}
            >
              {tool.icon}
              <span className="absolute bottom-0.5 right-1 text-[9px] font-mono opacity-50 hidden md:inline">
                {tool.shortcut}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
