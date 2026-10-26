"use client";

import { useMemo, useRef } from "react";
import type { HeatmapConfig, HeatPoint } from "@/types/heatmap";
import type { HeatmapInitial } from "@/hooks/useHeatmap";
import { useChangeNotifier } from "@/hooks/useChangeNotifier";
import { useHeatmap } from "@/hooks/useHeatmap";
import HeatmapCanvas, { HeatmapCanvasRef } from "./HeatmapCanvas";
import HeatmapControls from "./HeatmapControls";
import { exportCanvasPNG } from "@/utils/heatmap/exportCanvas";
import { useToast } from "@/app/context/ToastContext";
import HeaderTool from "../HeaderTool";
import { Flame } from "lucide-react";

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

  async function handleExport() {
    if (!canvasRef.current?.tableCanvas || !canvasRef.current?.heatmapCanvas) {
      addToast("Erro ao gerar PNG.");
      return;
    }

    await exportCanvasPNG(
      canvasRef.current.tableCanvas,
      canvasRef.current.heatmapCanvas,
      season,
      imagePath
    );

    addToast("PNG exportado com sucesso!");
  }

  function handleClear() {
    if (confirm("Tem certeza que deseja limpar o heatmap?")) {
      clear();
      addToast("Heatmap limpo!");
    }
  }

  function handleUndo() {
    undo();
    addToast("Ponto removido");
  }

  return (
    <div className={embedded ? "" : "px-4 md:px-8"}>
      {!embedded && <HeaderTool
        NameTool="Mapa de Calor"
        DescriptionTool="Visualize e analise a distribuição de pontos na arena do FIRST LEGO League Challenge. Adicione pontos de interesse, ajuste a intensidade e exporte seu heatmap para compartilhar insights valiosos com sua equipe."
        IconTool={Flame}
      />}

      <div className={`flex justify-center h-[560px] ${embedded ? "" : "mt-8 mb-16"}`}>
        <aside className="w-64 flex flex-col bg-base-200 border-r border-base-300 p-4 rounded-md gap-4 overflow-y-auto">
          <HeatmapControls
            config={config}
            mode={mode}
            canUndo={points.length > 0}
            onConfigChange={setConfig}
            onModeChange={setMode}
            onUndo={handleUndo}
            onClear={handleClear}
            onExport={handleExport}
          />
        </aside>

        <HeatmapCanvas
          ref={canvasRef}
          points={points}
          config={config}
          mode={mode}
          season={season}
          onAddPoint={addPoint}
          onRemoveNearest={removeNearest}
          imagePath={imagePath}
        />
      </div>
    </div>
  );
}
