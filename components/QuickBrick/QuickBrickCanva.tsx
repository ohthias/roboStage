"use client";
import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import {
  ArrowTurnUpLeftIcon,
  Square3Stack3DIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

interface Point {
  x: number;
  y: number;
}
interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}
interface FreePath {
  points: Point[];
  color: string;
}
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  lines: Line[];
  freePaths: FreePath[];
}

export default function FLLPaintPro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Ferramentas disponíveis
  type Tool = "line" | "free";
  const [tool, setTool] = useState<Tool>("line");

  const [layers, setLayers] = useState<Layer[]>([
    { id: uuidv4(), name: "Camada 1", visible: true, lines: [], freePaths: [] },
  ]);
  const [activeLayerId, setActiveLayerId] = useState(layers[0].id);
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [showLabels, setShowLabels] = useState(true);

  const backgroundImage = "/images/quickbrick_unearthed.png";

  // Escala para cálculo em cm
  const getScale = () => {
    const canvas = canvasRef.current!;
    return {
      escalaX: 200 / canvas.width,
      escalaY: 115 / canvas.height,
    };
  };

  // Renderização
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }

    const { escalaX, escalaY } = getScale();

    layers.forEach((layer) => {
      if (!layer.visible) return;

      // Desenhar linhas
      layer.lines.forEach((line) => {
        drawLine(ctx, line, escalaX, escalaY, showLabels);
      });

      // Desenhar paths livres
      layer.freePaths.forEach((path) => {
        drawPath(ctx, path, escalaX, escalaY);
      });
    });

    // Linha atual
    if (tool === "line" && currentLine) {
      drawLine(ctx, currentLine, escalaX, escalaY, showLabels);
    }

    // Path atual
    if (tool === "free" && currentPath.length > 0) {
      drawPath(
        ctx,
        { points: currentPath, color: currentColor },
        escalaX,
        escalaY
      );
    }
  }, [layers, currentLine, currentPath, tool, showLabels]);

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    line: Line,
    escalaX: number,
    escalaY: number,
    showLabel: boolean
  ) => {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Desenha a seta na ponta da linha
    const arrowLength = 18;
    const arrowWidth = 8;
    const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(line.x2, line.y2);
    ctx.lineTo(
      line.x2 - arrowLength * Math.cos(angle - Math.PI / 8),
      line.y2 - arrowLength * Math.sin(angle - Math.PI / 8)
    );
    ctx.lineTo(
      line.x2 - arrowLength * Math.cos(angle + Math.PI / 8),
      line.y2 - arrowLength * Math.sin(angle + Math.PI / 8)
    );
    ctx.lineTo(line.x2, line.y2);
    ctx.closePath();
    ctx.fillStyle = line.color;
    ctx.fill();
    ctx.restore();

    if (!showLabel) return;

    const dx = (line.x2 - line.x1) * escalaX;
    const dy = (line.y2 - line.y1) * escalaY;
    const distanciaCm = Math.sqrt(dx * dx + dy * dy).toFixed(1);

    // Desenha o texto da distância com fundo branco arredondado
    const text = `${distanciaCm} cm`;
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textX = (line.x1 + line.x2) / 2;
    const textY = (line.y1 + line.y2) / 2 - 10;
    const paddingX = 8;
    const paddingY = 4;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = 18;

    ctx.save();
    ctx.beginPath();
    const radius = 8;
    ctx.moveTo(
      textX - textWidth / 2 - paddingX + radius,
      textY - textHeight / 2 - paddingY
    );
    ctx.lineTo(
      textX + textWidth / 2 + paddingX - radius,
      textY - textHeight / 2 - paddingY
    );
    ctx.quadraticCurveTo(
      textX + textWidth / 2 + paddingX,
      textY - textHeight / 2 - paddingY,
      textX + textWidth / 2 + paddingX,
      textY - textHeight / 2 - paddingY + radius
    );
    ctx.lineTo(
      textX + textWidth / 2 + paddingX,
      textY + textHeight / 2 + paddingY - radius
    );
    ctx.quadraticCurveTo(
      textX + textWidth / 2 + paddingX,
      textY + textHeight / 2 + paddingY,
      textX + textWidth / 2 + paddingX - radius,
      textY + textHeight / 2 + paddingY
    );
    ctx.lineTo(
      textX - textWidth / 2 - paddingX + radius,
      textY + textHeight / 2 + paddingY
    );
    ctx.quadraticCurveTo(
      textX - textWidth / 2 - paddingX,
      textY + textHeight / 2 + paddingY,
      textX - textWidth / 2 - paddingX,
      textY + textHeight / 2 + paddingY - radius
    );
    ctx.lineTo(
      textX - textWidth / 2 - paddingX,
      textY - textHeight / 2 - paddingY + radius
    );
    ctx.quadraticCurveTo(
      textX - textWidth / 2 - paddingX,
      textY - textHeight / 2 - paddingY,
      textX - textWidth / 2 - paddingX + radius,
      textY - textHeight / 2 - paddingY
    );
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.fillStyle = "black";
    ctx.fillText(text, textX, textY);
  };

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    path: FreePath,
    _escalaX: number,
    _escalaY: number
  ) => {
    if (path.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    path.points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = path.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (tool === "line") {
      setCurrentLine({
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color: currentColor,
      });
    } else {
      setCurrentPath([{ x: pos.x, y: pos.y }]);
    }
    setIsDrawing(true);
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);

    if (tool === "line" && currentLine) {
      setCurrentLine({ ...currentLine, x2: pos.x, y2: pos.y });
    } else if (tool === "free") {
      setCurrentPath((prev) => [...prev, { x: pos.x, y: pos.y }]);
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== activeLayerId) return layer;
        if (tool === "line" && currentLine) {
          return { ...layer, lines: [...layer.lines, currentLine] };
        } else if (tool === "free" && currentPath.length > 0) {
          return {
            ...layer,
            freePaths: [
              ...layer.freePaths,
              { points: currentPath, color: currentColor },
            ],
          };
        }
        return layer;
      })
    );

    setCurrentLine(null);
    setCurrentPath([]);
    setIsDrawing(false);
  };

  // Carregar imagem da mesa
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  // Gerenciar camadas
  const addLayer = () => {
    const newLayer = {
      id: uuidv4(),
      name: `Camada ${layers.length + 1}`,
      visible: true,
      lines: [],
      freePaths: [],
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  // Funções de ferramentas
  const clearLayer = () => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === activeLayerId
          ? { ...layer, lines: [], freePaths: [] }
          : layer
      )
    );
  };

  const clearAll = () => {
    setLayers([
      {
        id: uuidv4(),
        name: "Camada 1",
        visible: true,
        lines: [],
        freePaths: [],
      },
    ]);
    setActiveLayerId(layers[0].id);
  };

  const undoLast = () => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== activeLayerId) return layer;
        if (tool === "line" && layer.lines.length > 0) {
          return { ...layer, lines: layer.lines.slice(0, -1) };
        }
        if (tool === "free" && layer.freePaths.length > 0) {
          return { ...layer, freePaths: layer.freePaths.slice(0, -1) };
        }
        return layer;
      })
    );
  };

  const exportPNG = () => {
    const dataURL = canvasRef.current!.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "fll-quickbrick.png";
    a.click();
  };

  const exportPDF = () => {
    const dataURL = canvasRef.current!.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    pdf.addImage(dataURL, "PNG", 0, 0, 297, 210);
    pdf.save("fll-quickbrick.pdf");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* Painel lateral */}
      <div className="w-full md:w-64 flex flex-col gap-2 bg-base-200 border border-base-300 shadow-md p-4 rounded-lg justify-between">
        <div className="flex gap-2 items-center justify-center">
          <div
            className="tooltip tooltip-bottom animate-fade-in"
            data-tip="Linha com régua"
          >
            <button
              onClick={() => setTool("line")}
              className={`btn btn-soft border border-neutral ${
                tool === "line" ? "btn-primary border-primary" : ""
              } cursor-pointer`}
              title="Linha com régua"
              style={{ lineHeight: 0 }}
            >
              <i className="fi fi-bs-pencil-ruler"></i>
            </button>
          </div>
          <div
            className="tooltip tooltip-bottom animate-fade-in"
            data-tip="Desenho livre"
          >
            <button
              onClick={() => setTool("free")}
              className={`btn btn-soft border border-neutral ${
                tool === "free" ? "btn-primary border-primary" : ""
              } cursor-pointer`}
              title="Desenho livre"
              style={{ lineHeight: 0 }}
            >
              <i className="fi fi-bs-pencil"></i>
            </button>
          </div>
        </div>
        <div className="flex flex-row">
          <label className="font-semibold flex items-center label-text text-sm border-r border-base-300 pr-2">
            Cor:
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="ml-2 cursor-pointer w-6 h-6"
            />
          </label>
          <label className="font-semibold flex items-center label-text text-sm flex items-center gap-2 pl-2">
            <input
              type="checkbox"
              className="toggle toggle-primary bg-base-200 checked:bg-primary/50 toggle-sm"
              checked={showLabels}
              onChange={() => setShowLabels(!showLabels)}
            />
            <span className="label-text font-bold">Exibir legendas</span>
          </label>
        </div>

        <hr className="border border-gray-300 my-2 w-1/2 mx-auto" />
        <button
          onClick={addLayer}
          className="btn btn-default btn-secondary"
          style={{ lineHeight: 0 }}
        >
          <i className="fi fi-bs-layer-plus"></i> Nova Camada
        </button>
        <div className="overflow-y-auto h-24">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`my-1 btn w-full btn-accent cursor-pointer ${
                activeLayerId === layer.id ? "btn-info" : "btn-outline"
              }`}
              onClick={() => setActiveLayerId(layer.id)}
            >
              <div className="flex justify-between items-center w-full">
                <span>{layer.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    style={{ lineHeight: 0 }}
                  >
                    {layer.visible ? (
                      <i className="fi fi-bs-eye"></i>
                    ) : (
                      <i className="fi fi-bs-eye-crossed"></i>
                    )}
                  </button>
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Tem certeza que deseja deletar esta camada?"
                          )
                        ) {
                          setLayers((prev) =>
                            prev.filter((l) => l.id !== layer.id)
                          );
                          if (activeLayerId === layer.id && layers.length > 1) {
                            const idx = layers.findIndex(
                              (l) => l.id === layer.id
                            );
                            const nextLayer = layers[idx === 0 ? 1 : 0];
                            setActiveLayerId(nextLayer.id);
                          }
                        }
                      }}
                      style={{ lineHeight: 0 }}
                      title="Deletar camada"
                    >
                      <i className="fi fi-bs-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <hr className="border border-gray-300 my-2 w-1/2 mx-auto" />
        <h6 className="text-base-content font-bold text-sm">Zona de Risco</h6>
        <button onClick={undoLast} className="btn btn-soft btn-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          Desfazer
        </button>
        <button
          onClick={() => {
            if (window.confirm("Tem certeza que deseja limpar esta camada?")) {
              clearLayer();
            }
          }}
          className="btn btn-soft btn-error"
        >
          <Square3Stack3DIcon className="size-4" />Limpar Camada
        </button>
        <button
          onClick={() => {
            if (
              window.confirm("Tem certeza que deseja limpar todas as camadas?")
            ) {
              clearAll();
            }
          }}
          className="btn btn-soft btn-error"
        >
          <TrashIcon className="size-4" />Limpar Tudo
        </button>

        <hr className="border border-gray-300 my-2 w-1/2 mx-auto" />
        <h6 className="text-base-content font-bold text-sm">Exportação</h6>
        <div className="flex flex-row gap-4">
          <button
            onClick={exportPNG}
            className="btn btn-soft btn-accent flex-1"
          >
            <i className="fi fi-bs-picture"></i> PNG
          </button>
          <button
            onClick={exportPDF}
            className="btn btn-soft btn-accent flex-1"
          >
            <i className="fi fi-bs-file-pdf"></i> PDF
          </button>
        </div>
      </div>

      {/* Área de desenho */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={(1000 * 115) / 200}
        style={{
          border: "2px solid black",
          maxWidth: "100%",
          maxHeight: "100%",
          height: "auto",
          width: "auto",
          cursor: isDrawing ? "crosshair" : "default",
          borderRadius: "8px",
          borderColor: "#d6d6d6",
        }}
        onMouseDown={startDrawing}
        onMouseMove={drawMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={drawMove}
        onTouchEnd={endDrawing}
      />
    </div>
  );
}
