'use client';

import { motion } from 'framer-motion';
import type { HeatmapConfig, HeatmapMode } from '@/types/heatmap';

// ── Sub-components ───────────────────────────────────────────────────────────

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display?: string;
  onChange: (v: number) => void;
};

function Slider({ label, value, min, max, step = 1, display, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-2 mb-3 last:mb-0">
      <div className="flex justify-between text-[11px] font-mono text-base-content/60">
        <span>{label}</span>
        <span className="text-accent">{display ?? value}</span>
      </div>
      <div className="w-full">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range range-sm range-primary w-full"
        />
      </div>
    </div>
  );
}

// ── Modes ─────────────────────────────────────────────────────────────────────

const MODES: { key: HeatmapMode; icon: string; label: string }[] = [
  { key: 'add',    icon: '＋', label: 'Adicionar' },
  { key: 'remove', icon: '−', label: 'Remover'   },
  { key: 'view',   icon: '◉', label: 'Visualizar' },
];

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  config: HeatmapConfig;
  mode: HeatmapMode;
  canUndo: boolean;
  onConfigChange: (patch: Partial<HeatmapConfig>) => void;
  onModeChange: (mode: HeatmapMode) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
};

export default function HeatmapControls({
  config, mode, canUndo,
  onConfigChange, onModeChange,
  onUndo, onClear, onExport,
}: Props) {
  return (
    <>
      {/* Brush settings */}
      <div className="card bg-base-200 p-3 rounded-md">
        <p className="font-semibold text-sm mb-2">Configurações</p>
        <Slider
          label="Raio do brush"
          value={config.brushRadius}
          min={10} max={80}
          onChange={(v) => onConfigChange({ brushRadius: v })}
        />
        <Slider
          label="Opacidade"
          value={Math.round(config.opacity * 100)}
          min={20} max={100}
          display={`${Math.round(config.opacity * 100)}%`}
          onChange={(v) => onConfigChange({ opacity: v / 100 })}
        />
        <Slider
          label="Intensidade"
          value={config.clickIntensity}
          min={1} max={10}
          onChange={(v) => onConfigChange({ clickIntensity: v })}
        />
      </div>

      {/* Interaction mode */}
      <div className="card bg-base-200 p-3 rounded-md">
        <p className="font-semibold text-sm mb-2">Modo</p>
        <div className="flex flex-col gap-2">
          {MODES.map((m) => {
            const active = m.key === mode;
            return (
              <motion.button
                key={m.key}
                onClick={() => onModeChange(m.key)}
                whileTap={{ scale: 0.97 }}
                className={`btn justify-start normal-case ${active ? 'btn-primary' : 'btn-ghost'}`}
              >
                <span className="mode-icon">{m.icon}</span>
                {m.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="card bg-base-200 p-3 rounded-md">
        <p className="font-semibold text-sm mb-2">Ações</p>
        <div className="flex flex-col">
          <motion.button
            onClick={onUndo}
            disabled={!canUndo}
            whileTap={{ scale: 0.97 }}
            className="btn mb-2 disabled:opacity-50"
          >
            <span className="mr-2">↩</span> Desfazer
          </motion.button>
          <motion.button
            onClick={onClear}
            whileTap={{ scale: 0.97 }}
            className="btn btn-error"
          >
            <span className="mr-2">✕</span> Limpar Tudo
          </motion.button>
        </div>
      </div>

      {/* Legend */}
      <div className="card bg-base-200 p-3 rounded-md">
        <p className="font-semibold text-sm mb-2">Legenda</p>
        <div className="w-full h-2 rounded-full mb-2" style={{ background: 'linear-gradient(to right, #06d6a0, #ffd166, #ff4d6a)' }} />
        <div className="flex justify-between text-xs font-mono text-base-content/50">
          <span>Estável</span>
          <span>Atenção</span>
          <span>Crítico</span>
        </div>
      </div>
    </>
  );
}
