'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Group,
  Ungroup,
  Layers,
} from 'lucide-react';
import { CanvasElement, FillStyle, FontFamily, FontSize, StrokeStyle, TextAlign } from '@/types/thinklab.types';

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null;
  selectedElements: CanvasElement[];
  defaultStyles: {
    strokeColor: string;
    backgroundColor: string;
    fillStyle: FillStyle;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    roughness: number;
    opacity: number;
    roundness: boolean;
    fontSize: FontSize;
    fontFamily: FontFamily;
    textAlign: TextAlign;
  };
  onChangeStyle: (key: string, value: unknown) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
}

const STROKE_COLORS = [
  '#1e293b', // Slate
  '#dc2626', // Red
  '#d97706', // Amber
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#475569', // Gray
];

const FILL_COLORS = [
  'transparent',
  '#ffffff',
  '#fee2e2', // Light Red
  '#fef3c7', // Light Amber
  '#d1fae5', // Light Emerald
  '#dbeafe', // Light Blue
  '#ede9fe', // Light Purple
  '#fce7f3', // Light Pink
];

export function PropertiesPanel({
  selectedElement,
  selectedElements,
  defaultStyles,
  onChangeStyle,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onGroup,
  onUngroup,
}: PropertiesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasMultiple = selectedElements.length > 1;
  const targetElement = selectedElement || (selectedElements.length > 0 ? selectedElements[0] : null);

  const hasGroup = selectedElements.some((e) => !!e.groupId);
  const canGroup = selectedElements.length >= 2;

  // Active values (either from selected element or defaults)
  const strokeColor = targetElement ? targetElement.strokeColor : defaultStyles.strokeColor;
  const backgroundColor = targetElement ? targetElement.backgroundColor : defaultStyles.backgroundColor;
  const fillStyle = targetElement ? targetElement.fillStyle : defaultStyles.fillStyle;
  const strokeWidth = targetElement ? targetElement.strokeWidth : defaultStyles.strokeWidth;
  const strokeStyle = targetElement ? targetElement.strokeStyle : defaultStyles.strokeStyle;
  const roughness = targetElement ? targetElement.roughness : defaultStyles.roughness;
  const opacity = targetElement ? targetElement.opacity : defaultStyles.opacity;
  const roundness = targetElement ? !!targetElement.roundness : defaultStyles.roundness;
  const fontSize = targetElement?.fontSize || defaultStyles.fontSize;
  const fontFamily = targetElement?.fontFamily || defaultStyles.fontFamily;
  const textAlign = targetElement?.textAlign || defaultStyles.textAlign;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-20 left-3 sm:left-4 z-20 btn btn-sm btn-circle btn-neutral shadow-lg tooltip tooltip-right"
        data-tip="Abrir Painel de Estilo"
        aria-label="Expandir painel de estilo"
      >
        <Sliders className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside
      aria-label="Painel de propriedades do elemento"
      className="fixed top-20 left-2 sm:left-4 z-20 w-[calc(100vw-1rem)] max-w-64 max-h-[calc(100vh-6.5rem)] overflow-y-auto bg-base-100/95 backdrop-blur-md border border-base-300 rounded-2xl shadow-xl p-3 sm:p-3.5 space-y-3 sm:space-y-3.5 select-none text-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-200 pb-2">
        <div className="flex items-center gap-1.5">
          {hasGroup ? (
            <Layers className="w-3.5 h-3.5 text-primary" />
          ) : hasMultiple ? (
            <Group className="w-3.5 h-3.5 text-primary" />
          ) : null}
          <span className="font-semibold text-base-content/80 text-[11px] uppercase tracking-wider">
            {hasMultiple
              ? hasGroup
                ? `Grupo (${selectedElements.length} itens)`
                : `${selectedElements.length} selecionados`
              : targetElement
              ? `Editar: ${targetElement.type}`
              : 'Estilo Padrão'}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="btn btn-ghost btn-xs btn-circle text-base-content/60"
          title="Recolher painel"
          aria-label="Recolher painel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Group / Ungroup Actions */}
      {(canGroup || hasGroup) && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-primary">
            {hasGroup ? 'Elementos Agrupados' : 'Agrupar Seleção'}
          </span>
          <div className="flex items-center gap-1">
            {canGroup && onGroup && (
              <button
                onClick={onGroup}
                className="btn btn-xs btn-primary gap-1"
                title="Agrupar elementos (Ctrl+G)"
              >
                <Group className="w-3 h-3" />
                <span>Agrupar</span>
              </button>
            )}
            {hasGroup && onUngroup && (
              <button
                onClick={onUngroup}
                className="btn btn-xs btn-outline btn-neutral gap-1"
                title="Desagrupar elementos (Ctrl+Shift+G)"
              >
                <Ungroup className="w-3 h-3" />
                <span>Desagrupar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cor do Contorno (Stroke) */}
      <div>
        <label className="text-[11px] font-medium text-base-content/70 block mb-1.5">
          Cor do Traço
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChangeStyle('strokeColor', c)}
              className={`h-6 rounded-md border transition-all flex items-center justify-center ${
                strokeColor === c ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'border-base-300'
              }`}
              style={{ backgroundColor: c }}
              title={c}
              aria-label={`Cor do traço ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Cor de Fundo (Background) */}
      <div>
        <label className="text-[11px] font-medium text-base-content/70 block mb-1.5">
          Preenchimento
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {FILL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChangeStyle('backgroundColor', c)}
              className={`h-6 rounded-md border transition-all flex items-center justify-center relative ${
                backgroundColor === c ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'border-base-300'
              }`}
              style={{
                backgroundColor: c === 'transparent' ? '#ffffff' : c,
              }}
              title={c === 'transparent' ? 'Transparente' : c}
              aria-label={c === 'transparent' ? 'Preenchimento transparente' : `Cor de preenchimento ${c}`}
            >
              {c === 'transparent' && (
                <span className="text-[9px] text-error font-bold">✕</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Estilo de Preenchimento (Fill Style) */}
      <div>
        <label className="text-[11px] font-medium text-base-content/70 block mb-1.5">
          Padrão de Hachura
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(['hachure', 'cross-hatch', 'solid', 'dots', 'zigzag', 'none'] as FillStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => onChangeStyle('fillStyle', style)}
              className={`btn btn-xs capitalize ${
                fillStyle === style ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              {style === 'hachure'
                ? 'Hachura'
                : style === 'cross-hatch'
                ? 'Cruzada'
                : style === 'solid'
                ? 'Sólido'
                : style === 'dots'
                ? 'Pontos'
                : style === 'zigzag'
                ? 'Zigue-zague'
                : 'Nenhum'}
            </button>
          ))}
        </div>
      </div>

      {/* Espessura do Traço */}
      <div>
        <label className="text-[11px] font-medium text-base-content/70 block mb-1.5">
          Espessura do Traço
        </label>
        <div className="join w-full">
          {[1, 2, 4].map((width) => (
            <button
              key={width}
              onClick={() => onChangeStyle('strokeWidth', width)}
              className={`btn btn-xs join-item flex-1 ${
                strokeWidth === width ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              {width === 1 ? 'Fino' : width === 2 ? 'Médio' : 'Grosso'}
            </button>
          ))}
        </div>
      </div>

      {/* Estilo da Linha (Solid, Dashed, Dotted) */}
      <div>
        <label className="text-[11px] font-medium text-base-content/70 block mb-1.5">
          Tipo de Linha
        </label>
        <div className="join w-full">
          {(['solid', 'dashed', 'dotted'] as StrokeStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => onChangeStyle('strokeStyle', style)}
              className={`btn btn-xs join-item flex-1 ${
                strokeStyle === style ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              {style === 'solid' ? 'Contínua' : style === 'dashed' ? 'Tracejada' : 'Pontilhada'}
            </button>
          ))}
        </div>
      </div>

      {/* Sloppiness / Roughness */}
      <div>
        <label className="text-[11px] font-medium text-base-content/70 block mb-1.5">
          Estilo do Desenho (Sloppiness)
        </label>
        <div className="join w-full">
          {[
            { val: 0.5, label: 'Arquiteto' },
            { val: 1.4, label: 'Artista' },
            { val: 2.4, label: 'Cartum' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => onChangeStyle('roughness', item.val)}
              className={`btn btn-xs join-item flex-1 ${
                Math.abs(roughness - item.val) < 0.3 ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cantos Arredondados */}
      {(targetElement?.type === 'rectangle' || !targetElement) && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-base-content/70">
            Cantos Arredondados
          </span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={roundness}
            onChange={(e) => onChangeStyle('roundness', e.target.checked)}
          />
        </div>
      )}

      {/* Opacidade */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-base-content/70">
            Opacidade
          </label>
          <span className="text-[10px] font-mono text-base-content/60">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="100"
          value={Math.round(opacity * 100)}
          onChange={(e) => onChangeStyle('opacity', Number(e.target.value) / 100)}
          className="range range-primary range-xs w-full"
        />
      </div>

      {/* Propriedades de Texto (quando texto existe) */}
      {(targetElement?.text !== undefined || targetElement?.type === 'text') && (
        <div className="border-t border-base-200 pt-2 space-y-2">
          <label className="text-[11px] font-semibold text-base-content/80 block">
            Tipografia do Texto
          </label>

          {/* Fonte */}
          <div className="grid grid-cols-3 gap-1">
            {(['Patrick Hand', 'Plus Jakarta Sans', 'Fira Code'] as FontFamily[]).map((f) => (
              <button
                key={f}
                onClick={() => onChangeStyle('fontFamily', f)}
                className={`btn btn-xs ${
                  fontFamily === f ? 'btn-primary' : 'btn-ghost border border-base-300'
                }`}
                style={{ fontFamily: f }}
              >
                {f === 'Patrick Hand' ? 'Manuscrita' : f === 'Plus Jakarta Sans' ? 'Sans' : 'Código'}
              </button>
            ))}
          </div>

          {/* Tamanho da Fonte */}
          <div className="join w-full">
            {([14, 18, 24, 32] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => onChangeStyle('fontSize', size)}
                className={`btn btn-xs join-item flex-1 ${
                  fontSize === size ? 'btn-primary' : 'btn-ghost border border-base-300'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>

          {/* Alinhamento */}
          <div className="join w-full">
            {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
              <button
                key={align}
                onClick={() => onChangeStyle('textAlign', align)}
                className={`btn btn-xs join-item flex-1 ${
                  textAlign === align ? 'btn-primary' : 'btn-ghost border border-base-300'
                }`}
                title={`Alinhar ${align}`}
                aria-label={`Alinhar ${align}`}
              >
                {align === 'left' ? (
                  <AlignLeft className="w-3.5 h-3.5 mx-auto" />
                ) : align === 'center' ? (
                  <AlignCenter className="w-3.5 h-3.5 mx-auto" />
                ) : (
                  <AlignRight className="w-3.5 h-3.5 mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ações para elementos selecionados */}
      {(targetElement || selectedElements.length > 0) && (
        <div className="border-t border-base-200 pt-2 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onBringToFront}
              className="btn btn-xs btn-ghost border border-base-300 gap-1"
              title="Trazer para Frente"
            >
              <BringToFront className="w-3.5 h-3.5" />
              <span>Para Frente</span>
            </button>
            <button
              onClick={onSendToBack}
              className="btn btn-xs btn-ghost border border-base-300 gap-1"
              title="Enviar para Trás"
            >
              <SendToBack className="w-3.5 h-3.5" />
              <span>Para Trás</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onDuplicate}
              className="btn btn-xs btn-ghost border border-base-300 gap-1"
              title="Duplicar (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicar</span>
            </button>
            <button
              onClick={onDelete}
              className="btn btn-xs btn-error btn-outline gap-1"
              title="Excluir (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
