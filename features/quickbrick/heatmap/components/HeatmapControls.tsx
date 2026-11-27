"use client";

import { Download, Eraser, Eye, Flag, SprayCan, Trash2, Undo2 } from "lucide-react";
import type { HeatmapConfig, HeatmapMode } from "@/features/quickbrick/heatmap/types";
import { type MissionHeat, missionShortLabel } from "@/features/quickbrick/heatmap/lib/missions";
import { ToolBadge, cn } from "@/components/stage";
import { ActionButton, IconToggle, Section, SliderRow, ToggleRow } from "@/components/stage/tool/panel-kit";

type Props = {
  mode: HeatmapMode;
  onModeChange: (m: HeatmapMode) => void;
  config: HeatmapConfig;
  onConfigChange: (patch: Partial<HeatmapConfig>) => void;
  pointCount: number;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  missionCount: number;
  showMissions: boolean;
  onShowMissions: (v: boolean) => void;
  showMissionLabels: boolean;
  onShowMissionLabels: (v: boolean) => void;
  ranking: MissionHeat[];
  highlightId: string | null;
  onHighlight: (id: string | null) => void;
};

const MODES: { key: HeatmapMode; icon: typeof SprayCan; label: string }[] = [
  { key: "add", icon: SprayCan, label: "Marcar" },
  { key: "remove", icon: Eraser, label: "Apagar" },
  { key: "view", icon: Eye, label: "Ver" },
];

/** Barra lateral do mapa de calor — mesmo desenho da barra da Estratégia. */
export default function HeatmapControls({
  mode,
  onModeChange,
  config,
  onConfigChange,
  pointCount,
  onUndo,
  onClear,
  onExport,
  missionCount,
  showMissions,
  onShowMissions,
  showMissionLabels,
  onShowMissionLabels,
  ranking,
  highlightId,
  onHighlight,
}: Props) {
  const top = ranking.slice(0, 5);
  const maxHeat = top[0]?.heat ?? 1;

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-base-300 bg-base-100">
      <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-3">
        <Section title="Modo" action={<ToolBadge className="font-mono">{pointCount} pontos</ToolBadge>}>
          <div className="grid grid-cols-3 gap-1">
            {MODES.map((m) => (
              <IconToggle
                key={m.key}
                active={mode === m.key}
                onClick={() => onModeChange(m.key)}
                Icon={m.icon}
                label={m.label}
                showLabel
              />
            ))}
          </div>
        </Section>

        <Section title="Pincel">
          <SliderRow label="Raio" value={config.brushRadius} min={10} max={80} display={`${config.brushRadius}px`} onChange={(v) => onConfigChange({ brushRadius: v })} />
          <SliderRow
            label="Opacidade"
            value={Math.round(config.opacity * 100)}
            min={20}
            max={100}
            display={`${Math.round(config.opacity * 100)}%`}
            onChange={(v) => onConfigChange({ opacity: v / 100 })}
          />
          <SliderRow label="Intensidade" value={config.clickIntensity} min={1} max={10} onChange={(v) => onConfigChange({ clickIntensity: v })} />
        </Section>

        <Section title="Missões do tapete" action={<ToolBadge className="font-mono">{missionCount}</ToolBadge>}>
          <div className="space-y-0.5">
            <ToggleRow label="Mostrar zonas" checked={showMissions} onChange={onShowMissions} />
            <ToggleRow label="Mostrar nomes" checked={showMissionLabels && showMissions} onChange={onShowMissionLabels} />
          </div>

          <div className="mt-2 rounded-lg border border-base-300 bg-base-100 p-1">
            <p className="px-1.5 pb-1 pt-0.5 text-[11px] font-semibold text-base-content/55">Mais críticas</p>
            {top.length === 0 ? (
              <p className="px-1.5 pb-1.5 text-[11px] leading-relaxed text-base-content/45">
                Marque falhas na mesa para ver quais missões concentram mais calor.
              </p>
            ) : (
              <ul>
                {top.map((r) => (
                  <li key={r.mission.id}>
                    <button
                      type="button"
                      onMouseEnter={() => onHighlight(r.mission.id)}
                      onMouseLeave={() => onHighlight(null)}
                      onFocus={() => onHighlight(r.mission.id)}
                      onBlur={() => onHighlight(null)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors",
                        highlightId === r.mission.id ? "bg-info/10" : "hover:bg-base-content/[0.04]",
                      )}
                      title={r.mission.name}
                    >
                      <span className="w-9 shrink-0 font-mono text-[11px] font-bold">{missionShortLabel(r.mission.name)}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${Math.max(8, (r.heat / maxHeat) * 100)}%`,
                            background: "linear-gradient(to right, #ffd166, #ff4d6a)",
                          }}
                        />
                      </span>
                      <span className="w-6 text-right font-mono text-[11px] tabular-nums text-base-content/60">{r.points}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-base-content/50">
            <Flag className="mt-0.5 size-3 shrink-0" />
            Zonas iguais às do Sharks Simulator. Editou lá? Aparece aqui.
          </p>
        </Section>

        <Section title="Ações">
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={onUndo} disabled={pointCount === 0} Icon={Undo2} label="Desfazer" />
            <ActionButton onClick={onClear} disabled={pointCount === 0} Icon={Trash2} label="Limpar" variant="error" outline />
            <ActionButton onClick={onExport} Icon={Download} label="Exportar PNG" variant="primary" className="col-span-2" />
          </div>
        </Section>

        <Section title="Legenda">
          <div className="h-2 w-full rounded-full" style={{ background: "linear-gradient(to right, #06d6a0, #ffd166, #ff4d6a)" }} />
          <div className="flex justify-between font-mono text-[11px] text-base-content/55">
            <span>Estável</span>
            <span>Atenção</span>
            <span>Crítico</span>
          </div>
        </Section>
      </div>
    </div>
  );
}
