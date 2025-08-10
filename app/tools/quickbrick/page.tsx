"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import Hero from "@/components/hero";

export default function Page() {
  type Layer = {
    id: string;
    name: string;
    visible: boolean;
    ref: React.RefObject<HTMLCanvasElement | null>;
  };

  type HistoryState = {
    layerId: string;
    imageData: ImageData;
  };

  type ColorGuide = {
    color: string;
    label: string;
  };

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [tool, setTool] = useState<string>("pencil");
  const [colorGuide, setColorGuide] = useState<ColorGuide[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [newLayerName, setNewLayerName] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const CANVAS_WIDTH_PX = 900;
  const CANVAS_WIDTH_CM = 200;
  const CANVAS_HEIGHT_PX = 500;
  const CANVAS_HEIGHT_CM = 142;

  const pxPerCmX = CANVAS_WIDTH_PX / CANVAS_WIDTH_CM; // 4.5 px/cm
  const pxPerCmY = CANVAS_HEIGHT_PX / CANVAS_HEIGHT_CM; // ~3.521 px/cm
  useEffect(() => {
    const baseLayer: Layer = {
      id: "base",
      name: "Base",
      visible: true,
      ref: React.createRef<HTMLCanvasElement>(),
    };
    const drawingLayer: Layer = {
      id: "layer1",
      name: "Camada 1",
      visible: true,
      ref: React.createRef<HTMLCanvasElement>(),
    };
    setLayers([baseLayer, drawingLayer]);
    setActiveLayerId("layer1");
  }, []);

  useEffect(() => {
    restoreBaseLayerImage();
  }, [layers]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const getActiveContext = () => {
    const activeCanvas = layers.find((l) => l.id === activeLayerId)?.ref
      .current;
    return activeCanvas?.getContext("2d") ?? null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = layers.find((l) => l.id === activeLayerId)?.ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setStartPos(pos);
    setDrawing(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "pencil") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    if (tool === "eraser") eraseAt(pos);

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [
      ...prev,
      { layerId: activeLayerId!, imageData: snapshot },
    ]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const canvas = layers.find((l) => l.id === activeLayerId)?.ref.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (tool === "pencil") {
      const ctx = getActiveContext();
      if (!ctx) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    // Preview de formas
    if (
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "line" ||
      tool === "arrow"
    ) {
      const previewCtx = previewRef.current?.getContext("2d");
      if (!previewCtx || !startPos) return;

      previewCtx.clearRect(0, 0, 900, 500);
      previewCtx.strokeStyle = strokeColor;
      previewCtx.lineWidth = 1;
      previewCtx.setLineDash([5, 5]);

      if (tool === "rectangle") {
        previewCtx.strokeRect(
          startPos.x,
          startPos.y,
          pos.x - startPos.x,
          pos.y - startPos.y
        );
      }

      if (tool === "circle") {
        const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
        previewCtx.beginPath();
        previewCtx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
        previewCtx.stroke();
      }

      if (tool === "line" || tool === "arrow") {
        previewCtx.beginPath();
        previewCtx.moveTo(startPos.x, startPos.y);
        previewCtx.lineTo(pos.x, pos.y);
        previewCtx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !startPos) return;
    const ctx = getActiveContext();
    if (!ctx) return;

    const canvas = layers.find((l) => l.id === activeLayerId)?.ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    if (tool === "rectangle") {
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    }

    if (tool === "circle") {
      const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    if (tool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
      const headLength = 15;
      const arrowX1 = pos.x - headLength * Math.cos(angle - Math.PI / 6);
      const arrowY1 = pos.y - headLength * Math.sin(angle - Math.PI / 6);
      const arrowX2 = pos.x - headLength * Math.cos(angle + Math.PI / 6);
      const arrowY2 = pos.y - headLength * Math.sin(angle + Math.PI / 6);

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(arrowX1, arrowY1);
      ctx.lineTo(arrowX2, arrowY2);
      ctx.lineTo(pos.x, pos.y);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    }

    const previewCtx = previewRef.current?.getContext("2d");
    previewCtx?.clearRect(0, 0, 900, 500);

    setDrawing(false);
    setStartPos(null);
  };

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX: number;
    let clientY: number;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("changedTouches" in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }
    return { x: clientX, y: clientY };
  };

  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = layers.find((l) => l.id === activeLayerId)?.ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const posRaw = getEventPos(e);
    if (!posRaw) return;
    const pos = { x: posRaw.x - rect.left, y: posRaw.y - rect.top };
    setStartPos(pos);
    setDrawing(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "pencil") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    if (tool === "eraser") eraseAt(pos);

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [
      ...prev,
      { layerId: activeLayerId!, imageData: snapshot },
    ]);
  };

  const handlePointerMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = layers.find((l) => l.id === activeLayerId)?.ref.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const posRaw = getEventPos(e);
    if (!posRaw) return;
    const pos = { x: posRaw.x - rect.left, y: posRaw.y - rect.top };

    if (tool === "pencil") {
      const ctx = getActiveContext();
      if (!ctx) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    // Preview de formas (rectangle, circle, line, arrow)
    if (
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "line" ||
      tool === "arrow"
    ) {
      const previewCtx = previewRef.current?.getContext("2d");
      if (!previewCtx || !startPos) return;

      previewCtx.clearRect(0, 0, 900, 500);
      previewCtx.strokeStyle = strokeColor;
      previewCtx.lineWidth = 1;
      previewCtx.setLineDash([5, 5]);

      if (tool === "rectangle") {
        previewCtx.strokeRect(
          startPos.x,
          startPos.y,
          pos.x - startPos.x,
          pos.y - startPos.y
        );
      }

      if (tool === "circle") {
        const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
        previewCtx.beginPath();
        previewCtx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
        previewCtx.stroke();
      }

      if (tool === "line" || tool === "arrow") {
        previewCtx.beginPath();
        previewCtx.moveTo(startPos.x, startPos.y);
        previewCtx.lineTo(pos.x, pos.y);
        previewCtx.stroke();
      }
    }
  };

  const handlePointerUp = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!drawing || !startPos) return;
    const ctx = getActiveContext();
    if (!ctx) return;

    const canvas = layers.find((l) => l.id === activeLayerId)?.ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const posRaw = getEventPos(e);
    if (!posRaw) return;
    const pos = { x: posRaw.x - rect.left, y: posRaw.y - rect.top };

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    if (tool === "rectangle") {
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    }

    if (tool === "circle") {
      const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    if (tool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
      const headLength = 15;
      const arrowX1 = pos.x - headLength * Math.cos(angle - Math.PI / 6);
      const arrowY1 = pos.y - headLength * Math.sin(angle - Math.PI / 6);
      const arrowX2 = pos.x - headLength * Math.cos(angle + Math.PI / 6);
      const arrowY2 = pos.y - headLength * Math.sin(angle + Math.PI / 6);

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(arrowX1, arrowY1);
      ctx.lineTo(arrowX2, arrowY2);
      ctx.lineTo(pos.x, pos.y);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    }

    const previewCtx = previewRef.current?.getContext("2d");
    previewCtx?.clearRect(0, 0, 900, 500);

    setDrawing(false);
    setStartPos(null);
  };

  const eraseAt = (pos: { x: number; y: number }) => {
    const ctx = getActiveContext();
    if (!ctx) return;
    ctx.clearRect(pos.x - 5, pos.y - 5, 10, 10);
  };

  const undoLast = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const last = newHistory.pop();
      if (last) {
        const ctx = layers
          .find((l) => l.id === last.layerId)
          ?.ref.current?.getContext("2d");
        ctx?.putImageData(last.imageData, 0, 0);
      }
      return newHistory;
    });
  };

  const createNewLayer = () => {
    const newId = Date.now().toString();
    const newLayer: Layer = {
      id: newId,
      name: `Camada ${layers.length}`,
      visible: true,
      ref: React.createRef<HTMLCanvasElement>(),
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newId);
  };

  const exportMerged = () => {
    const exportCanvas = document.createElement("canvas");
    const canvasWidth = 900;
    const canvasHeight = 500 + colorGuide.length * 30 + 30; // espaço p/ legenda
    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;

    const exportCtx = exportCanvas.getContext("2d");

    // Desenha as camadas
    layers.forEach((layer) => {
      if (layer.visible && layer.ref.current) {
        exportCtx?.drawImage(layer.ref.current, 0, 0);
      }
    });

    // Desenha a legenda
    if (colorGuide.length && exportCtx) {
      exportCtx.fillStyle = "#fff";
      exportCtx.fillRect(0, 500, canvasWidth, canvasHeight - 500);

      exportCtx.font = "16px sans-serif";
      exportCtx.fillStyle = "#000";
      exportCtx.fillText("Guia de Cores:", 10, 520);

      colorGuide.forEach((guide, i) => {
        const y = 550 + i * 30;
        exportCtx.fillStyle = guide.color;
        exportCtx.fillRect(10, y - 15, 20, 20);

        exportCtx.fillStyle = "#000";
        exportCtx.fillText(guide.label, 40, y);
      });
    }

    const link = document.createElement("a");
    link.download = "quickbrick-legenda.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const resetAll = () => {
    layers.forEach((layer) => {
      const ctx = layer.ref.current?.getContext("2d");
      ctx?.clearRect(0, 0, layer.ref.current?.width || 0, 500);
    });

    restoreBaseLayerImage();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const restoreBaseLayerImage = () => {
    const baseCanvas = layers.find((l) => l.id === "base")?.ref.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/quickbrick_uneartherd.png";
    img.onload = () => {
      baseCanvas.width = 900;
      baseCanvas.height = 500;
      ctx.drawImage(img, 0, 0, 900, 500);
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Hero />
      <div className="max-w-screen-xl mx-auto w-full">
        <header className="p-4 max-w-screen-lg mx-auto w-full">
          <h1 className="text-2xl font-bold">
            Quick<span className="text-red-500">Brick</span> Studio
          </h1>
          <p className="text-sm text-red-600">
            Pense, desenhe e crie estratégias!
          </p>
          <p className="text-gray-600">
            O QuickBrick Studio é uma ferramenta que ajuda sua equipe a criar
            estratégias eficientes para o robô durante sua jornada no FIRST LEGO
            League Challenge. Basta selecionar uma das ferramentas disponíveis e
            desenhar diretamente sobre a imagem do tapete, planejando cada
            movimento com precisão e facilidade.
          </p>
        </header>

        <main
          ref={mainRef}
          className={`flex flex-1 gap-4 p-4 ${
            isFullscreen
              ? "flex-col bg-gray-200"
              : "flex-col md:flex-row md:flex-row overflow-x-hidden"
          }`}
        >
          {/* Barra de Ferramentas */}
          <aside
            className={`rounded p-2 flex items-center ${
              isFullscreen
                ? "flex-row justify-center bg-transparent gap-2 overflow-x-auto"
                : "bg-white border border-gray-300 space-y-2 flex-shrink-0 sm:flex-col sm:w-full md:flex-col md:w-14 sm:gap-2 md:gap-0"
            }`}
          >
            <button
              onClick={undoLast}
              title="Desfazer"
              className="w-8 h-8 bg-yellow-100 rounded cursor-pointer text-yellow-600"
              style={{ lineHeight: 0 }}
            >
              <i className="fi fi-rr-turn-left"></i>
            </button>

            {[
              {
                type: "pencil",
                icon: "fi fi-rr-attribution-pencil",
                label: "Lápis",
              },
              { type: "eraser", icon: "fi fi-rr-eraser", label: "Borracha" },
              {
                type: "rectangle",
                icon: "fi fi-rr-square",
                label: "Retângulo",
              },
              { type: "circle", icon: "fi fi-rr-circle", label: "Círculo" },
              { type: "line", icon: "fi fi-rr-slash", label: "Linha" },
              { type: "arrow", icon: "fi fi-rr-arrow-up-right", label: "Seta" },
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setTool(type)}
                className={`${
                  tool === type ? "bg-gray-300" : "bg-white"
                } w-8 h-8 flex items-center justify-center rounded hover:bg-gray-300 transition-colors cursor-pointer`}
                title={label}
                style={{ lineHeight: 0 }}
              >
                <i className={icon}></i>
              </button>
            ))}
          </aside>

          {/* Área de Desenho */}
          <div className={`relative w-full h-auto aspect-[9/5] max-w-full`}>
            {layers.map((layer) => (
              <canvas
                key={layer.id}
                ref={layer.ref}
                width={900}
                height={500}
                className="absolute left-0 top-0 w-full h-full border border-gray-300 rounded"
                style={{
                  zIndex: layers.findIndex((l) => l.id === layer.id),
                  pointerEvents: activeLayerId === layer.id ? "auto" : "none",
                  display: layer.visible ? "block" : "none",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            ))}
          </div>

          {/* Configurações */}
          <aside
            className={`${isFullscreen ? "w-full flex-row gap-8" : "w-60 flex-col"} bg-white border border-gray-300 rounded p-2 flex justify-between`}
          >
            <div
              className={`flex justify-between ${isFullscreen ? "items-start gap-2" : "flex-col"}`}
            >
              <div>
                <h2 className="text-red-700 font-bold mb-2">Guia de cores</h2>
                <div className="space-y-2">
                  {colorGuide.map((guide, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: guide.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {guide.label}
                      </span>
                      <button
                        className="text-sm text-gray-400 hover:text-red-500"
                        onClick={() =>
                          setColorGuide((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <i className="fi fi-rr-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-10 h-10 border rounded cursor-pointer border-gray-200"
                  />
                  <span className="text-xs text-gray-600 border-l border-gray-300 pl-2">
                    {strokeColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-600">Espessura</label>
                  <span className="text-xs text-gray-500">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="accent-red-600 cursor-pointer"
                />
              </div>
            </div>
            <hr className="border-gray-300 my-4" />
            <div
              className={`flex flex-1 ${isFullscreen ? "flex-row gap-2 items-start" : "flex-col"}`}
            >
              <div className="w-full">
                <h2 className="text-red-700 font-bold mb-2">Camadas</h2>
                <button
                  onClick={createNewLayer}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Nova camada
                </button>
              </div>
              <div
                className="space-y-2 max-h-36 overflow-y-auto mt-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#e5e7eb #fff",
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 6px;
                    background: #fff;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #fff;
                  }
                `}</style>
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex justify-between items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layer.visible}
                        onChange={() =>
                          setLayers((prev) =>
                            prev.map((l) =>
                              l.id === layer.id
                                ? { ...l, visible: !l.visible }
                                : l
                            )
                          )
                        }
                        className="accent-red-600"
                      />

                      {editingLayerId === layer.id ? (
                        <input
                          value={newLayerName}
                          onChange={(e) => setNewLayerName(e.target.value)}
                          onBlur={() => {
                            setLayers((prev) =>
                              prev.map((l) =>
                                l.id === layer.id
                                  ? { ...l, name: newLayerName }
                                  : l
                              )
                            );
                            setEditingLayerId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setLayers((prev) =>
                                prev.map((l) =>
                                  l.id === layer.id
                                    ? { ...l, name: newLayerName }
                                    : l
                                )
                              );
                              setEditingLayerId(null);
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-1 w-24"
                          autoFocus
                        />
                      ) : (
                        <button
                          className={`text-sm ${activeLayerId === layer.id ? "font-bold" : ""} cursor-pointer hover:text-gray-400 transition-colors`}
                          onClick={() => setActiveLayerId(layer.id)}
                        >
                          {layer.name}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1 items-center">
                      {layer.id !== "base" && (
                        <>
                          <button
                            onClick={() => {
                              setEditingLayerId(layer.id);
                              setNewLayerName(layer.name);
                            }}
                            className="text-gray-500 text-sm hover:text-gray-700 cursor-pointer"
                            title="Renomear camada"
                          >
                            <i className="fi fi-rr-edit"></i>
                          </button>
                          <button
                            onClick={() =>
                              setLayers((prev) =>
                                prev.filter((l) => l.id !== layer.id)
                              )
                            }
                            className="text-red-500 text-sm hover:text-red-700 cursor-pointer"
                            title="Remover camada"
                          >
                            <i className="fi fi-rr-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <hr className="border-gray-300 my-4" />
            <div
              className={`flex gap-2 flex-col ${isFullscreen ? "h-20 flex-wrap items-center" : ""}`}
            >
              <button
                onClick={exportMerged}
                className="bg-gray-100 text-gray-800 rounded px-2 py-1 cursor-pointer hover:bg-gray-200 transition cursor-pointer"
              >
                Exportar PNG
              </button>
              <button
                onClick={resetAll}
                className="bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-400 transition-colors cursor-pointer"
              >
                Resetar tudo
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-gray-100 text-gray-800 rounded px-2 py-1 cursor-pointer hover:bg-gray-200 transition cursor-pointer"
              >
                Tela cheia
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
