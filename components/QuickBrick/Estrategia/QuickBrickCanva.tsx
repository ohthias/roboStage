import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ExportSummary, Layer, ToolType, CanvasHandle } from "@/types/CanvasType";
import { CanvasBoard } from "./CanvasBoard";
import { Toolbar } from "./Toolbar";
import { ExportPreviewModal } from "./ExportPreviewModal";
import { useToast } from "@/app/context/ToastContext";

export default function QuickBrickCanvas() {
  const [tool, setTool] = useState<ToolType>("hand");
  const [color, setColor] = useState("#ef4444"); // Default red
  const [eraserSize, setEraserSize] = useState(24);
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: uuidv4(),
      name: "Camada 1",
      visible: true,
      zonesVisible: true,
      lines: [],
      freePaths: [],
      zones: [],
      robots: [],
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>(layers[0].id);
  const backgroundImage = "/images/QuickBrick/Estrategia_fundo.png";

  // UI Toggles
  const [showLabels, setShowLabels] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // --- Refs ---
  const canvasRef = useRef<CanvasHandle>(null);

  // --- History Management ---
  const [history, setHistory] = useState<Layer[][]>([layers]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // --- Export Preview Modal ---
  const [exportPreview, setExportPreview] = useState<{
    type: "general" | "layers";
    summary: ExportSummary;
  } | null>(null);
  const { addToast } = useToast();

  const openExportPreview = (type: "general" | "layers") => {
    const summary = canvasRef.current?.getExportSummary(type);
    if (!summary) return;
    if (summary.isEmpty && summary.layers.every((l) => !l.included)) {
      addToast(
        type === "general"
          ? "Nenhuma camada visível para exportar."
          : "Nenhuma camada com conteúdo para exportar.",
        "error",
      );
      return;
    }
    setExportPreview({ type, summary });
  };

  const confirmExport = () => {
    if (!exportPreview) return;
    if (exportPreview.type === "general") {
      canvasRef.current?.exportGeneral();
    } else {
      canvasRef.current?.exportLayers();
    }
    setExportPreview(null);
  };

  // Helper to commit current state to history
  const registerAction = () => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(layers);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  };

  // --- Actions ---
  const clearLayer = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os desenhos e zonas nesta camada?")) {
      setLayers((prev) => {
        const newState = prev.map((l) =>
          l.id === activeLayerId
            ? { ...l, lines: [], freePaths: [], zones: [], robots: [] }
            : l
        );
        setHistory((h) => [...h.slice(0, historyIndex + 1), newState]);
        setHistoryIndex((i) => i + 1);
        return newState;
      });
      useToast().addToast("Camada limpa com sucesso!", "success");
    }
  };

  // --- Layer Management ---
  const addLayer = () => {
    const newLayer: Layer = {
      id: uuidv4(),
      name: `Camada ${layers.length + 1}`,
      visible: true,
      zonesVisible: true,
      lines: [],
      freePaths: [],
      zones: [],
      robots: [],
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setActiveLayerId(newLayer.id);

    setHistory((h) => [...h.slice(0, historyIndex + 1), newLayers]);
    setHistoryIndex((i) => i + 1);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter((l) => l.id !== id);
    setLayers(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[0].id);

    setHistory((h) => [...h.slice(0, historyIndex + 1), newLayers]);
    setHistoryIndex((i) => i + 1);
  };

  const renameLayer = (id: string, name: string) => {
    const newLayers = layers.map((l) => (l.id === id ? { ...l, name } : l));
    setLayers(newLayers);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex-none z-20 h-full bg-base-200 shadow-xl rounded-lg">
        <Toolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          undo={undo}
          redo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          clearLayer={clearLayer}
          exportGeneral={() => openExportPreview("general")}
          exportLayers={() => openExportPreview("layers")}
          // View Props
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          showZones={showZones}
          setShowZones={setShowZones}
          // Layer Props
          layers={layers}
          activeLayerId={activeLayerId}
          setActiveLayerId={setActiveLayerId}
          addLayer={addLayer}
          deleteLayer={deleteLayer}
          renameLayer={renameLayer}
          toggleVisibility={(id) =>
            setLayers(
              layers.map((l) =>
                l.id === id ? { ...l, visible: !l.visible } : l
              )
            )
          }
          toggleZoneVisibility={(id) =>
            setLayers(
              layers.map((l) =>
                l.id === id ? { ...l, zonesVisible: !l.zonesVisible } : l
              )
            )
          }
        />
      </div>

      <CanvasBoard
        ref={canvasRef}
        tool={tool}
        setTool={setTool}
        color={color}
        layers={layers}
        setLayers={setLayers}
        registerAction={registerAction}
        activeLayerId={activeLayerId}
        showLabels={showLabels}
        showZones={showZones}
        backgroundImage={backgroundImage}
        eraserSize={eraserSize}
      />

      {exportPreview && (
        <ExportPreviewModal
          summary={exportPreview.summary}
          onCancel={() => setExportPreview(null)}
          onConfirm={confirmExport}
        />
      )}
    </div>
  );
}