'use client';

import React, { useMemo } from 'react';
import {
  Square,
  Diamond,
  Circle,
  Database,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Spline,
  Cloud,
  FileText,
  Hexagon,
  Layers,
  Group,
  Image as ImageIcon,
} from 'lucide-react';
import { getIconEntry } from '@/utils/thinklab/icon-library';
import { CanvasElement, ToolType } from '@/types/thinklab.types';
import { IconBubble, cn } from './editor-ui';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
}

export const ELEMENT_TYPE_LABELS: Partial<Record<ToolType, string>> = {
  rectangle: 'Retângulo',
  diamond: 'Decisão',
  ellipse: 'Elipse',
  cylinder: 'Banco de dados',
  parallelogram: 'Entrada / Saída',
  capsule: 'Terminal',
  document: 'Documento',
  cloud: 'Nuvem',
  arrow: 'Seta',
  line: 'Linha',
  bezier: 'Curva',
  path: 'Polígono',
  freedraw: 'Desenho livre',
  text: 'Texto',
  emoji: 'Emoji',
  icon: 'Ícone',
  image: 'Imagem',
};

const TYPE_ICONS: Partial<Record<ToolType, React.ComponentType<{ className?: string }>>> = {
  rectangle: Square,
  diamond: Diamond,
  ellipse: Circle,
  cylinder: Database,
  document: FileText,
  cloud: Cloud,
  arrow: ArrowRight,
  line: Minus,
  bezier: Spline,
  path: Hexagon,
  freedraw: Pencil,
  text: Type,
  image: ImageIcon,
};

export function ElementTypeIcon({
  type,
  className = 'size-4',
  element,
}: {
  type: ToolType;
  className?: string;
  element?: CanvasElement;
}) {
  if (type === 'emoji' && element?.emoji) return <span className="text-base leading-none">{element.emoji}</span>;
  if (type === 'icon') {
    const entry = getIconEntry(element?.iconName);
    if (entry) return <entry.Icon className={className} />;
  }
  if (type === 'capsule') return <span className="block w-4 h-2.5 border-2 border-current rounded-full" />;
  if (type === 'parallelogram') return <span className="block w-4 h-3 border-2 border-current -skew-x-12" />;
  const Icon = TYPE_ICONS[type] ?? Square;
  return <Icon className={className} />;
}

export function elementDisplayName(el: CanvasElement) {
  const firstLine = el.text?.split('\n')[0]?.trim();
  if (firstLine) return firstLine;
  if (el.type === 'icon') return getIconEntry(el.iconName)?.label ?? 'Ícone';
  if (el.type === 'image' && el.missionRef) return `Missão ${el.missionRef.code}`;
  return ELEMENT_TYPE_LABELS[el.type] || el.type;
}

/** Aba "Camadas": lista dos elementos do topo para o fundo. */
export function LayersPanel({ elements, selectedIds, onSelectIds }: LayersPanelProps) {
  const ordered = useMemo(() => [...elements].sort((a, b) => b.zIndex - a.zIndex), [elements]);

  if (ordered.length === 0) {
    return (
      <div className="flex-1 grid place-items-center px-6 text-center">
        <div>
          <IconBubble className="mx-auto mb-3">
            <Layers className="size-4" />
          </IconBubble>
          <p className="text-sm font-medium">Nenhuma camada</p>
          <p className="text-xs text-base-content/55 mt-1">Desenhe ou insira componentes pela aba Design.</p>
        </div>
      </div>
    );
  }

  const handleClick = (el: CanvasElement, additive: boolean) => {
    const ids = el.groupId ? elements.filter((e) => e.groupId === el.groupId).map((e) => e.id) : [el.id];
    if (additive) {
      const allSelected = ids.every((id) => selectedIds.includes(id));
      onSelectIds(
        allSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids]))
      );
    } else {
      onSelectIds(ids);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2">
      <p className="px-2 pt-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-base-content/40">
        {ordered.length} {ordered.length === 1 ? 'camada' : 'camadas'} · topo → fundo
      </p>
      <ul className="space-y-0.5">
        {ordered.map((el) => {
          const selected = selectedIds.includes(el.id);
          return (
            <li key={el.id}>
              <button
                type="button"
                onClick={(e) => handleClick(el, e.shiftKey || e.metaKey || e.ctrlKey)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-field px-2 py-1.5 text-left',
                  selected ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'
                )}
                aria-pressed={selected}
              >
                <IconBubble
                  className={cn('size-8', selected && 'bg-primary/15 text-primary')}
                  style={{ color: selected ? undefined : el.strokeColor }}
                >
                  <ElementTypeIcon type={el.type} element={el} className="size-3.5" />
                </IconBubble>
                <span className="flex-1 min-w-0 truncate text-sm">{elementDisplayName(el)}</span>
                {el.groupId && <Group className="size-3.5 opacity-50 shrink-0" aria-label="Agrupado" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
