"use client";

import { Plus, Eye, Undo2, Trash2, Download, Eraser, SprayCan } from "lucide-react";

import type { HeatmapConfig, HeatmapMode } from "@/types/heatmap";
import {
  Section,
  PanelCard,
  IconToggle,
  ActionButton,
  SliderRow,
} from "@/components/UI/panel-kit";

// ── Modes ─────────────────────────────────────────────────────────────────────

const MODES: { key: HeatmapMode; icon: typeof Plus; label: string }[] = [
  { key: "add", icon: SprayCan, label: "Adicionar" },
  { key: "remove", icon: Eraser, label: "Remover" },
  { key: "view", icon: Eye, label: "Visualizar" },
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
  config,
  mode,
  canUndo,
  onConfigChange,
  onModeChange,
  onUndo,
  onClear,
  onExport,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Configurações do brush */}
      <Section title="Configurações">
        <PanelCard>
          <SliderRow
            label="Raio do brush"
            value={config.brushRadius}
            min={10}
            max={80}
            onChange={(v) => onConfigChange({ brushRadius: v })}
          />
          <SliderRow
            label="Opacidade"
            value={Math.round(config.opacity * 100)}
            min={20}
            max={100}
            display={`${Math.round(config.opacity * 100)}%`}
            onChange={(v) => onConfigChange({ opacity: v / 100 })}
          />
          <SliderRow
            label="Intensidade"
            value={config.clickIntensity}
            min={1}
            max={10}
            onChange={(v) => onConfigChange({ clickIntensity: v })}
          />
        </PanelCard>
      </Section>

      {/* Modo de interação */}
      <Section title="Modo">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <IconToggle
              key={m.key}
              active={m.key === mode}
              onClick={() => onModeChange(m.key)}
              Icon={m.icon}
              label={m.label}
            />
          ))}
        </div>
      </Section>

      {/* Ações */}
      <Section title="Ações">
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            onClick={onUndo}
            disabled={!canUndo}
            Icon={Undo2}
            label="Desfazer"
            className="col-span-2"
          />
          <ActionButton
            onClick={onClear}
            Icon={Trash2}
            label="Limpar Tudo"
            variant="error"
            outline
            className="col-span-2"
          />
          <ActionButton
            onClick={onExport}
            Icon={Download}
            label="Exportar PNG"
            className="col-span-2"
          />
        </div>
      </Section>

      {/* Legenda */}
      <Section title="Legenda">
        <PanelCard>
          <div
            className="w-full h-2 rounded-full mb-2"
            style={{
              background: "linear-gradient(to right, #06d6a0, #ffd166, #ff4d6a)",
            }}
          />
          <div className="flex justify-between text-xs font-mono text-base-content/50">
            <span>Estável</span>
            <span>Atenção</span>
            <span>Crítico</span>
          </div>
        </PanelCard>
      </Section>
    </div>
  );
}