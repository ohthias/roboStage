"use client";

import { forwardRef, useRef } from "react";
import { useHeatmap } from "@/hooks/useHeatmap";
import HeatmapCanvas, { HeatmapCanvasRef } from "./HeatmapCanvas";
import HeatmapControls from "./HeatmapControls";
import { exportCanvasPNG } from "@/utils/heatmap/exportCanvas";
import Breadcrumbs from "../../UI/Breadcrumbs";
import { useToast } from "@/app/context/ToastContext";
import HeaderTool from "../HeaderTool";
import { Flame } from "lucide-react";

export default function HeatmapPage() {
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
  } = useHeatmap();

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
    clear();
    addToast("Heatmap limpo!");
  }

  function handleUndo() {
    undo();
    addToast("Ponto removido");
  }

  return (
    <div className="px-4 md:px-8">
      <HeaderTool
        NameTool="Mapa de Calor"
        DescriptionTool="Visualize e analise a distribuição de pontos na arena do FIRST LEGO League Challenge. Adicione pontos de interesse, ajuste a intensidade e exporte seu heatmap para compartilhar insights valiosos com sua equipe."
        IconTool={Flame}
      />

      <div className="flex justify-center mt-8 mb-16">
        <aside className="w-[220px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto max-h-[500px]">
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
