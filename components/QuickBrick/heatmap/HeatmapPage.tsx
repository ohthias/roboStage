"use client";

import { forwardRef, useRef } from "react";
import { useHeatmap } from "@/hooks/useHeatmap";
import HeatmapCanvas, { HeatmapCanvasRef } from "./HeatmapCanvas";
import HeatmapControls from "./HeatmapControls";
import { exportCanvasPNG } from "@/utils/heatmap/exportCanvas";
import Breadcrumbs from "../../UI/Breadcrumbs";
import { useToast } from "@/app/context/ToastContext";

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
      <Breadcrumbs />

      <section className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
          Mapa de Calor da Arena
        </h1>
        <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
          Visualize e analise a distribuição de pontos na arena do FIRST LEGO
          League Challenge. Adicione pontos de interesse, ajuste a intensidade e
          exporte seu heatmap para compartilhar insights valiosos com sua
          equipe.
        </p>
      </section>

      <div className="flex justify-center mt-8 mb-16 h-[500px] max-w-6xl mx-auto">
        <aside className="w-[220px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
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

      <div className="mb-8 rounded-xl border border-base-200 bg-warning/10 p-4 md:p-6">
        <h2 className="text-xl font-bold text-warning mb-3">
          Dicas de como usar e validar
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-base-content/80 leading-relaxed">
          <li>
            Adicione pontos nos locais mais relevantes para identificar padrões
            de concentração.
          </li>
          <li>
            Use a intensidade para destacar áreas com maior importância ou
            frequência.
          </li>
        </ul>
      </div>
    </div>
  );
}
