'use client';

import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Group,
  Ungroup,
  Plus,
} from 'lucide-react';
import { CanvasElement, FillStyle, FontFamily, FontSize, StrokeStyle, TextAlign } from '@/types/thinklab.types';
import { FieldLabel, PanelSection, Segmented, SuffixInput, cn } from './editor-ui';
import { ELEMENT_TYPE_LABELS, elementDisplayName } from './LayersPanel';

export interface DefaultStyles {
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
}

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null;
  selectedElements: CanvasElement[];
  defaultStyles: DefaultStyles;
  onChangeStyle: (key: string, value: unknown) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  className?: string;
}

const STROKE_COLORS = ['#1e293b', '#dc2626', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777'];
const FILL_COLORS = ['transparent', '#ffffff', '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe', '#ede9fe'];

const FILL_STYLE_LABELS: Record<FillStyle, string> = {
  hachure: 'Hachura',
  'cross-hatch': 'Hachura cruzada',
  solid: 'Sólido',
  dots: 'Pontos',
  zigzag: 'Zigue-zague',
  none: 'Sem preenchimento',
};

const TEXT_TYPES = new Set(['text']);
const MEDIA_TYPES = new Set(['emoji', 'icon', 'image']);
const POINT_BASED = new Set(['freedraw', 'path']);

function Swatches({
  colors,
  value,
  onChange,
  label,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
  label: string;
}) {
  const isCustom = !colors.includes(value);
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'aspect-square rounded-full border border-base-300 grid place-items-center transition-shadow',
            value === c && 'ring-2 ring-primary ring-offset-2 ring-offset-base-100',
          )}
          style={{ backgroundColor: c === 'transparent' ? 'transparent' : c }}
          title={c === 'transparent' ? 'Transparente' : c}
          aria-label={`${label} ${c === 'transparent' ? 'transparente' : c}`}
          aria-pressed={value === c}
        >
          {c === 'transparent' && <span className="block w-full h-px bg-error rotate-45" />}
        </button>
      ))}
      <label
        className={cn(
          'relative aspect-square rounded-full border border-dashed border-base-content/30 grid place-items-center cursor-pointer text-base-content/50 hover:text-base-content',
          isCustom && 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 border-solid',
        )}
        style={isCustom && value !== 'transparent' ? { backgroundColor: value } : undefined}
        title="Cor personalizada"
      >
        {!isCustom && <Plus className="size-3" />}
        <input
          type="color"
          className="absolute inset-0 opacity-0 cursor-pointer"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} personalizada`}
        />
      </label>
    </div>
  );
}

/** Edita o texto localmente e só registra no histórico ao sair do campo. */
function TextField({ element, onCommit }: { element: CanvasElement; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(element.text ?? '');
  return (
    <textarea
      className="textarea textarea-sm w-full bg-base-200 border-transparent shadow-none focus:border-primary/60 focus:outline-none resize-y min-h-16"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== (element.text ?? '') && onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) (e.target as HTMLTextAreaElement).blur();
      }}
      placeholder="Digite o texto do elemento"
      aria-label="Texto do elemento"
    />
  );
}

/**
 * Inspetor (coluna direita): título + contador, seções separadas por divisórias,
 * campos com sufixo e alternadores — seguindo o painel "Promo Banner" da referência.
 */
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
  className,
}: PropertiesPanelProps) {
  const count = selectedElements.length;
  const hasSelection = count > 0;
  const target = selectedElement || (hasSelection ? selectedElements[0] : null);
  const hasGroup = selectedElements.some((e) => !!e.groupId);
  const canGroup = count >= 2;

  const strokeColor = target?.strokeColor ?? defaultStyles.strokeColor;
  const backgroundColor = target?.backgroundColor ?? defaultStyles.backgroundColor;
  const fillStyle = target?.fillStyle ?? defaultStyles.fillStyle;
  const strokeWidth = target?.strokeWidth ?? defaultStyles.strokeWidth;
  const strokeStyle = target?.strokeStyle ?? defaultStyles.strokeStyle;
  const roughness = target?.roughness ?? defaultStyles.roughness;
  const opacity = target?.opacity ?? defaultStyles.opacity;
  const roundness = target ? !!target.roundness : defaultStyles.roundness;
  const fontSize = target?.fontSize || defaultStyles.fontSize;
  const fontFamily = target?.fontFamily || defaultStyles.fontFamily;
  const textAlign = target?.textAlign || defaultStyles.textAlign;

  const title = !hasSelection
    ? 'Estilo padrão'
    : count > 1
      ? hasGroup
        ? 'Grupo'
        : 'Seleção múltipla'
      : elementDisplayName(target!);

  const badge = !hasSelection
    ? 'Novo'
    : count > 1
      ? String(count)
      : (ELEMENT_TYPE_LABELS[target!.type] ?? target!.type);

  const showText = !!selectedElement && (selectedElement.text !== undefined || TEXT_TYPES.has(selectedElement.type));
  const showTypography =
    !hasSelection || (target && !MEDIA_TYPES.has(target.type) && (target.text !== undefined || target.type === 'text'));
  const showRoundness = !target || target.type === 'rectangle' || target.type === 'image';
  const roughnessPreset = roughness < 0.9 ? 0.5 : roughness < 1.9 ? 1.4 : 2.4;

  // Mídia: emoji e imagem só têm opacidade/posição; ícone usa a cor e a espessura do traço.
  const allMedia = hasSelection && selectedElements.every((e) => MEDIA_TYPES.has(e.type));
  const allIcons = hasSelection && selectedElements.every((e) => e.type === 'icon');
  const isImage = target?.type === 'image' && count === 1;

  return (
    <aside
      aria-label="Propriedades do elemento"
      className={cn('flex flex-col min-h-0 bg-base-100 border-l border-base-300 select-none', className)}
    >
      {/* Cabeçalho */}
      <div className="h-14 shrink-0 px-4 flex items-center justify-between gap-2 border-b border-base-300">
        <h2 className="text-[15px] font-medium truncate" title={title}>
          {title}
        </h2>
        <span className="badge badge-sm bg-base-200 border-transparent text-base-content/70 shrink-0">{badge}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {!hasSelection && (
          <p className="px-4 pt-4 text-xs text-base-content/55">
            Nada selecionado. Estes estilos serão usados nos próximos elementos que você desenhar.
          </p>
        )}

        {/* Imagem (como o bloco "Picture" da referência) */}
        {isImage && target?.imageSrc && (
          <PanelSection title="Imagem">
            <div className="rounded-box border border-base-300 overflow-hidden">
              <div className="h-32 bg-base-200 grid place-items-center p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={target.imageSrc} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <p className="px-3 py-2 text-xs text-base-content/70 truncate border-t border-base-300">
                {target.missionRef
                  ? `${target.missionRef.league} · ${target.missionRef.season} · ${target.missionRef.code}`
                  : target.imageSrc.split('/').pop()}
              </p>
            </div>
          </PanelSection>
        )}

        {/* Texto */}
        {showText && selectedElement && (
          <PanelSection title="Conteúdo">
            <TextField key={selectedElement.id} element={selectedElement} onCommit={(v) => onChangeStyle('text', v)} />
          </PanelSection>
        )}

        {/* Camada */}
        <PanelSection
          title="Camada"
          action={
            hasSelection && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={onBringToFront}
                  className="btn btn-ghost btn-xs btn-square"
                  title="Trazer para frente"
                  aria-label="Trazer para frente"
                >
                  <BringToFront className="size-3.5" />
                </button>
                <button
                  onClick={onSendToBack}
                  className="btn btn-ghost btn-xs btn-square"
                  title="Enviar para trás"
                  aria-label="Enviar para trás"
                >
                  <SendToBack className="size-3.5" />
                </button>
              </div>
            )
          }
        >
          <div className={cn('grid gap-2', allMedia ? 'grid-cols-[5.5rem]' : 'grid-cols-[5.5rem_1fr]')}>
            <SuffixInput
              value={Math.round(opacity * 100)}
              suffix="%"
              min={10}
              max={100}
              ariaLabel="Opacidade"
              onChange={(v) => onChangeStyle('opacity', v / 100)}
            />
            {!allMedia && (
              <select
                className="select select-sm w-full bg-base-200 border-transparent shadow-none"
                value={fillStyle}
                onChange={(e) => onChangeStyle('fillStyle', e.target.value as FillStyle)}
                aria-label="Padrão de preenchimento"
              >
                {(Object.keys(FILL_STYLE_LABELS) as FillStyle[]).map((s) => (
                  <option key={s} value={s}>
                    {FILL_STYLE_LABELS[s]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </PanelSection>

        {/* Cores */}
        {(!allMedia || allIcons) && (
          <PanelSection title={allIcons ? 'Cor do ícone' : 'Cores'}>
            <div>
              {!allIcons && <FieldLabel>Traço</FieldLabel>}
              <Swatches
                colors={STROKE_COLORS}
                value={strokeColor}
                label="Cor do traço"
                onChange={(c) => onChangeStyle('strokeColor', c)}
              />
            </div>
            {!allIcons && (
              <div>
                <FieldLabel>Preenchimento</FieldLabel>
                <Swatches
                  colors={FILL_COLORS}
                  value={backgroundColor}
                  label="Cor de preenchimento"
                  onChange={(c) => onChangeStyle('backgroundColor', c)}
                />
              </div>
            )}
          </PanelSection>
        )}

        {/* Traço */}
        {(!allMedia || allIcons) && (
          <PanelSection title="Traço">
            <div>
              <FieldLabel>Espessura</FieldLabel>
              <Segmented
                ariaLabel="Espessura do traço"
                value={strokeWidth}
                onChange={(v) => onChangeStyle('strokeWidth', v)}
                options={[
                  { value: 1, label: 'Fino' },
                  { value: 2, label: 'Médio' },
                  { value: 4, label: 'Grosso' },
                ]}
              />
            </div>
            {!allIcons && (
              <>
                <div>
                  <FieldLabel>Tipo de linha</FieldLabel>
                  <Segmented
                    ariaLabel="Tipo de linha"
                    value={strokeStyle}
                    onChange={(v) => onChangeStyle('strokeStyle', v)}
                    options={[
                      { value: 'solid', label: 'Contínua' },
                      { value: 'dashed', label: 'Tracejada' },
                      { value: 'dotted', label: 'Pontilhada' },
                    ]}
                  />
                </div>
                <div>
                  <FieldLabel>Estilo do desenho</FieldLabel>
                  <Segmented
                    ariaLabel="Estilo do desenho"
                    value={roughnessPreset}
                    onChange={(v) => onChangeStyle('roughness', v)}
                    options={[
                      { value: 0.5, label: 'Arquiteto' },
                      { value: 1.4, label: 'Artista' },
                      { value: 2.4, label: 'Cartum' },
                    ]}
                  />
                </div>
              </>
            )}
          </PanelSection>
        )}

        {/* Cantos arredondados */}
        {showRoundness && (
          <PanelSection
            title="Cantos arredondados"
            action={
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-primary"
                checked={roundness}
                onChange={(e) => onChangeStyle('roundness', e.target.checked)}
                aria-label="Cantos arredondados"
              />
            }
          />
        )}

        {/* Posição e tamanho — só para um único elemento */}
        {selectedElement && (
          <PanelSection title="Posição e tamanho">
            <div className="grid grid-cols-2 gap-2">
              <SuffixInput
                value={selectedElement.x}
                suffix="X"
                ariaLabel="Posição X"
                onChange={(v) => onChangeStyle('x', v)}
              />
              <SuffixInput
                value={selectedElement.y}
                suffix="Y"
                ariaLabel="Posição Y"
                onChange={(v) => onChangeStyle('y', v)}
              />
              <SuffixInput
                value={selectedElement.width}
                suffix="L"
                ariaLabel="Largura"
                disabled={POINT_BASED.has(selectedElement.type)}
                onChange={(v) => onChangeStyle('width', v)}
              />
              <SuffixInput
                value={selectedElement.height}
                suffix="A"
                ariaLabel="Altura"
                disabled={POINT_BASED.has(selectedElement.type)}
                onChange={(v) => onChangeStyle('height', v)}
              />
            </div>
          </PanelSection>
        )}

        {/* Tipografia */}
        {showTypography && (
          <PanelSection title="Tipografia">
            <Segmented
              ariaLabel="Fonte"
              value={fontFamily}
              onChange={(v) => onChangeStyle('fontFamily', v)}
              options={(['Patrick Hand', 'Plus Jakarta Sans', 'Fira Code'] as FontFamily[]).map((f) => ({
                value: f,
                title: f,
                label: (
                  <span style={{ fontFamily: f }}>
                    {f === 'Patrick Hand' ? 'Manuscrita' : f === 'Plus Jakarta Sans' ? 'Sans' : 'Código'}
                  </span>
                ),
              }))}
            />
            <div className="grid grid-cols-[5.5rem_1fr] gap-2">
              <SuffixInput
                value={fontSize}
                suffix="px"
                min={8}
                max={96}
                ariaLabel="Tamanho da fonte"
                onChange={(v) => onChangeStyle('fontSize', v)}
              />
              <Segmented
                ariaLabel="Alinhamento do texto"
                value={textAlign}
                onChange={(v) => onChangeStyle('textAlign', v)}
                options={[
                  { value: 'left', label: <AlignLeft className="size-3.5" />, title: 'Alinhar à esquerda' },
                  { value: 'center', label: <AlignCenter className="size-3.5" />, title: 'Centralizar' },
                  { value: 'right', label: <AlignRight className="size-3.5" />, title: 'Alinhar à direita' },
                ]}
              />
            </div>
          </PanelSection>
        )}
      </div>

      {/* Ações da seleção */}
      {hasSelection && (
        <div className="shrink-0 border-t border-base-300 p-3 flex items-center gap-2">
          {canGroup && onGroup && !hasGroup && (
            <button onClick={onGroup} className="btn btn-sm btn-ghost font-normal gap-1.5" title="Agrupar (Ctrl+G)">
              <Group className="size-4" /> Agrupar
            </button>
          )}
          {hasGroup && onUngroup && (
            <button
              onClick={onUngroup}
              className="btn btn-sm btn-ghost font-normal gap-1.5"
              title="Desagrupar (Ctrl+Shift+G)"
            >
              <Ungroup className="size-4" /> Desagrupar
            </button>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onDuplicate}
              className="btn btn-sm btn-square btn-ghost"
              title="Duplicar (Ctrl+D)"
              aria-label="Duplicar"
            >
              <Copy className="size-4" />
            </button>
            <button
              onClick={onDelete}
              className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10"
              title="Excluir (Del)"
              aria-label="Excluir"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
