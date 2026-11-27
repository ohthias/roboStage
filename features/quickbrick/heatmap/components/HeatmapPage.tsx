"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HeatmapConfig, HeatmapMode, HeatPoint } from "@/features/quickbrick/heatmap/types";
import type { HeatmapInitial } from "@/features/quickbrick/heatmap/hooks/useHeatmap";
import { useChangeNotifier } from "@/lib/hooks/useChangeNotifier";
import { useHeatmap } from "@/features/quickbrick/heatmap/hooks/useHeatmap";
import HeatmapCanvas, { HeatmapCanvasRef } from "./HeatmapCanvas";
import HeatmapControls from "./HeatmapControls";
import { exportCanvasPNG } from "@/features/quickbrick/heatmap/lib/exportCanvas";
import { useToast } from "@/components/providers/ToastContext";
import HeaderTool from "@/features/quickbrick/shared/components/HeaderTool";
import { Flame, Keyboard } from "lucide-react";
import { ToolScope, useToolConfirm } from "@/components/stage";
import { loadMatMissions, missionHeat } from "@/features/quickbrick/heatmap/lib/missions";
import { DEFAULT_MISSIONS } from "@/features/quickbrick/sharks-simulator/components/missions.service";
import type { Mission } from "@/features/quickbrick/sharks-simulator/types";

type HeatmapPageProps = {
  /** Pontos/configuração salvos (caderno do QuickBrick Studio). */
  initialData?: HeatmapInitial;
  /** Avisado a cada mudança — usado para salvar no banco. */
  onDataChange?: (data: { points: HeatPoint[]; config: HeatmapConfig }) => void;
  /** Esconde o cabeçalho da ferramenta (uso dentro do caderno). */
  embedded?: boolean;
};

export default function HeatmapPage({ initialData, onDataChange, embedded = false }: HeatmapPageProps = {}) {
  const {
    points,
    config,
    mode,
    season,
    addPoint,
    removeNearest,
    clear,
    undo,
    setMode,
    setConfig,
    imagePath,
  } = useHeatmap(initialData);

  const snapshot = useMemo(() => ({ points, config }), [points, config]);
  useChangeNotifier(snapshot, onDataChange);

  const { addToast } = useToast();
  const canvasRef = useRef<HeatmapCanvasRef>(null);

  // Missões do tapete (Sharks Simulator). Lidas no cliente depois de montar,
  // para não divergir do HTML do servidor.
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);
  useEffect(() => setMissions(loadMatMissions()), []);
  const [showMissions, setShowMissions] = useState(true);
  const [showMissionLabels, setShowMissionLabels] = useState(true);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const ranking = useMemo(() => missionHeat(points, missions), [points, missions]);

  async function handleExport() {
    if (!canvasRef.current?.tableCanvas || !canvasRef.current?.heatmapCanvas) {
      addToast("Erro ao gerar PNG.");
      return;
    }

    await exportCanvasPNG(
      canvasRef.current.tableCanvas,
      canvasRef.current.heatmapCanvas,
      season,
      imagePath,
      canvasRef.current.missionsCanvas,
    );

    addToast("PNG exportado com sucesso!");
  }

  const { confirm, dialog } = useToolConfirm();

  async function handleClear() {
    if (await confirm({ title: "Limpar o mapa de calor?", message: "Todos os pontos marcados serão apagados.", confirmLabel: "Limpar" })) {
      clear();
      addToast("Heatmap limpo!");
    }
  }

  function handleUndo() {
    undo();
    addToast("Ponto removido");
  }

  return (
    <div className={embedded ? "" : "mx-auto w-full max-w-7xl px-4 pb-16 md:px-8"}>
      {!embedded && (
        <HeaderTool
          NameTool="Mapa de Calor"
          DescriptionTool="Visualize e analise a distribuição de pontos na arena do FIRST LEGO League Challenge. Adicione pontos de interesse, ajuste a intensidade e exporte seu heatmap para compartilhar insights valiosos com sua equipe."
          IconTool={Flame}
        />
      )}

      <ToolScope className={`flex h-[680px] w-full overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300 ${embedded ? "" : "mt-6"}`}>
        <HeatmapControls
          mode={mode}
          onModeChange={setMode}
          config={config}
          onConfigChange={setConfig}
          pointCount={points.length}
          onUndo={handleUndo}
          onClear={handleClear}
          onExport={handleExport}
          missionCount={missions.length}
          showMissions={showMissions}
          onShowMissions={setShowMissions}
          showMissionLabels={showMissionLabels}
          onShowMissionLabels={(v) => {
            if (v) setShowMissions(true);
            setShowMissionLabels(v);
          }}
          ranking={ranking}
          highlightId={highlightId}
          onHighlight={setHighlightId}
        />

        <section className="flex min-w-0 flex-1 flex-col bg-base-200">
          <HeatmapCanvas
            ref={canvasRef}
            points={points}
            config={config}
            mode={mode}
            season={season}
            onAddPoint={addPoint}
            onRemoveNearest={removeNearest}
            imagePath={imagePath}
            missions={missions}
            showMissions={showMissions}
            showMissionLabels={showMissionLabels}
            highlightMissionId={highlightId}
          />
          <footer className="flex items-center gap-4 border-t border-base-300 bg-base-100 px-3 py-1.5 font-mono text-[11px] text-base-content/60">
            <span className="capitalize">{season}</span>
            <span>{points.length} pontos</span>
            <span>{ranking.length} missões com calor</span>
            <span className="ml-auto flex items-center gap-1 text-base-content/40">
              <Keyboard className="size-3" /> Clique e arraste para marcar
            </span>
          </footer>
        </section>
      </ToolScope>
      {dialog}
    </div>
  );
}
