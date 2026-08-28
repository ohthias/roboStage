import React from 'react';
import {
  X,
  SlidersHorizontal,
  Palette,
  Compass,
  Type,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { DiagramSettings } from '@/app/(public)/[competicao]/thinklab/ishikawa/ishikawa.types';
import { THEMES } from '@/utils/thinklab/themes';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DiagramSettings;
  onUpdateSettings: (newSettings: Partial<DiagramSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-base-100 border-l-2 border-base-content/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-base-content/10 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content border-2 border-base-content/20 flex items-center justify-center shadow-md">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-base-content">
                Personalização do Diagrama
              </h2>
              <p className="text-xs font-medium opacity-60">
                Ajuste temas, geometria e visibilidade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-square border border-base-content/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
          {/* Color Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-base-content text-sm">
              <Palette className="w-4 h-4 text-primary" />
              <span>Paleta de Cores do Diagrama</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(THEMES).map((thm) => (
                <button
                  key={thm.id}
                  onClick={() => onUpdateSettings({ theme: thm.id })}
                  className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                    settings.theme === thm.id
                      ? 'border-primary bg-primary/10 shadow-md font-bold text-primary'
                      : 'border-base-content/20 bg-base-200/50 hover:bg-base-200 text-base-content'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-base-content/30"
                      style={{ backgroundColor: thm.headBg }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-base-content/30"
                      style={{ backgroundColor: thm.spineColor }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-base-content/30"
                      style={{ backgroundColor: thm.categoryColors[0]?.stroke }}
                    />
                  </div>
                  <div className="font-extrabold text-xs">{thm.name}</div>
                  {settings.theme === thm.id && (
                    <span className="absolute top-2.5 right-2.5 text-primary font-extrabold text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fish Direction & Shape */}
          <div className="space-y-3 pt-4 border-t border-base-content/10">
            <div className="flex items-center gap-2 font-extrabold text-base-content text-sm">
              <Compass className="w-4 h-4 text-primary" />
              <span>Orientação & Formato</span>
            </div>

            <div className="space-y-2">
              <label className="text-base-content font-bold">
                Direção do Fluxo (Cabeça do Efeito):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ fishDirection: 'right' })}
                  className={`btn btn-sm font-bold ${
                    settings.fishDirection === 'right' ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  À Direita →
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ fishDirection: 'left' })}
                  className={`btn btn-sm font-bold ${
                    settings.fishDirection === 'left' ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  ← À Esquerda
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-base-content font-bold">
                Formato da Cabeça do Efeito:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rounded-box', label: 'Cartão Box' },
                  { id: 'fish-head', label: 'Orgânica' },
                  { id: 'hexagon', label: 'Hexágono' },
                ].map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => onUpdateSettings({ headShape: sh.id as any })}
                    className={`btn btn-xs font-bold ${
                      settings.headShape === sh.id ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Geometry Adjustments with daisyUI Range sliders */}
          <div className="space-y-4 pt-4 border-t border-base-content/10">
            <div className="flex items-center gap-2 font-extrabold text-base-content text-sm">
              <Type className="w-4 h-4 text-primary" />
              <span>Geometria & Proporções</span>
            </div>

            {/* Bone Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-base-content">
                <span>Ângulo das Espinhas Principais:</span>
                <span className="font-mono font-bold text-primary">{settings.boneAngle}°</span>
              </div>
              <input
                type="range"
                min="45"
                max="65"
                step="1"
                value={settings.boneAngle}
                onChange={(e) => onUpdateSettings({ boneAngle: Number(e.target.value) })}
                className="range range-primary range-xs"
              />
            </div>

            {/* Spine Line Thickness */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-base-content">
                <span>Espessura da Linha Central:</span>
                <span className="font-mono font-bold text-primary">{settings.spineThickness}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={settings.spineThickness}
                onChange={(e) => onUpdateSettings({ spineThickness: Number(e.target.value) })}
                className="range range-primary range-xs"
              />
            </div>

            {/* Font scale */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-base-content">
                <span>Escala da Tipografia:</span>
                <span className="font-mono font-bold text-primary">{Math.round(settings.fontSizeScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.25"
                step="0.05"
                value={settings.fontSizeScale}
                onChange={(e) => onUpdateSettings({ fontSizeScale: Number(e.target.value) })}
                className="range range-primary range-xs"
              />
            </div>
          </div>

          {/* Visibility Toggles with daisyUI Toggles */}
          <div className="space-y-3 pt-4 border-t border-base-content/10">
            <div className="flex items-center gap-2 font-extrabold text-base-content text-sm">
              <Layers className="w-4 h-4 text-primary" />
              <span>Elementos Visíveis</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-base-200/60 border border-base-content/10 cursor-pointer">
                <span className="font-bold text-base-content">
                  Exibir Sub-causas (5 Porquês)
                </span>
                <input
                  type="checkbox"
                  checked={settings.showSubCauses}
                  onChange={(e) => onUpdateSettings({ showSubCauses: e.target.checked })}
                  className="toggle toggle-primary toggle-sm"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-base-200/60 border border-base-content/10 cursor-pointer">
                <span className="font-bold text-base-content">
                  Destacar Causas Raiz [CR]
                </span>
                <input
                  type="checkbox"
                  checked={settings.showRootCauseHighlights}
                  onChange={(e) => onUpdateSettings({ showRootCauseHighlights: e.target.checked })}
                  className="toggle toggle-primary toggle-sm"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-base-200/60 border border-base-content/10 cursor-pointer">
                <span className="font-bold text-base-content">
                  Grade de Fundo (Grid Dots)
                </span>
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => onUpdateSettings({ showGrid: e.target.checked })}
                  className="toggle toggle-primary toggle-sm"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-base-content/10 bg-base-200/50 flex items-center justify-between">
          <button
            onClick={onResetSettings}
            className="btn btn-sm btn-ghost gap-1.5 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrões</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-sm btn-primary font-bold px-6"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
