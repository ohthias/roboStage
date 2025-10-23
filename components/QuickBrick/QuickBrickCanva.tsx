"use client";
import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import { Square3Stack3DIcon, TrashIcon } from "@heroicons/react/24/solid";
import CanvaImage from "@/public/images/quickbrick_unearthed.png";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { HandRaisedIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/app/context/ToastContext";

export default function FLLPaintPro() {
  const {addToast} = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Ferramentas disponíveis
  type Tool = "hand" | "line" | "free" | "zone";
  const [tool, setTool] = useState<Tool>("hand");

  const [layers, setLayers] = useState<Layer[]>([
    { id: uuidv4(), name: "Camada 1", visible: true, lines: [], freePaths: [] },
  ]);
  const [activeLayerId, setActiveLayerId] = useState(layers[0].id);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [editingZone, setEditingZone] = useState<{
    id: string;
    x: number;
    y: number;
    name: string;
  } | null>(null);
  const [draggingZone, setDraggingZone] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [exportZones, setExportZones] = useState(false);
  const [exportLayersSeparadas, setExportLayersSeparadas] = useState(false);

  const backgroundImage = CanvaImage.src;

  // Escala para cálculo em cm
  const getScale = () => {
    const canvas = canvasRef.current!;
    return {
      escalaX: 200 / canvas.width,
      escalaY: 115 / canvas.height,
    };
  };

  // Dentro do useEffect, na parte de desenhar zonas:
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o fundo
    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }

    const { escalaX, escalaY } = getScale();

    // Desenha linhas e paths
    layers.forEach((layer) => {
      if (!layer.visible) return;
      layer.lines.forEach((line) =>
        drawLine(ctx, line, escalaX, escalaY, showLabels)
      );
      layer.freePaths.forEach((path) => drawPath(ctx, path, escalaX, escalaY));
    });

    // Linha atual
    if (currentLine) drawLine(ctx, currentLine, escalaX, escalaY, showLabels);
    if (currentPath.length > 0)
      drawPath(
        ctx,
        { points: currentPath, color: currentColor },
        escalaX,
        escalaY
      );

    // Zonas visíveis
    if (showZones) {
      zones.forEach((zone) => {
        ctx.fillStyle = zone.color + "55";
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(
          zone.name,
          zone.x + zone.width / 2,
          zone.y + zone.height / 2
        );
      });

      // Zona atual sendo desenhada
      if (currentZone) {
        ctx.fillStyle = currentZone.color + "55";
        ctx.fillRect(
          currentZone.x,
          currentZone.y,
          currentZone.width,
          currentZone.height
        );
        ctx.strokeStyle = currentZone.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentZone.x,
          currentZone.y,
          currentZone.width,
          currentZone.height
        );

        ctx.fillStyle = "black";
        ctx.fillText(
          currentZone.name,
          currentZone.x + currentZone.width / 2,
          currentZone.y + currentZone.height / 2
        );
      }
    }
  }, [
    layers,
    currentLine,
    currentPath,
    showLabels,
    zones,
    currentZone,
    showZones,
  ]);

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

    // Se estiver desenhando uma zona, ignora qualquer outro tipo de desenho
    if (tool === "zone") {
      const newZone: Zone = {
        id: uuidv4(),
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: currentColor,
        name: `Zona ${zones.length + 1}`,
      };
      setCurrentZone(newZone);
      setIsDrawingZone(true);
      setIsDrawing(true);
      return; // <- impede a criação de linha/path
    }

    // Lógica normal para linha ou desenho livre
    if (tool === "line") {
      setCurrentLine({
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color: currentColor,
      });
    } else if (tool === "free") {
      setCurrentPath([{ x: pos.x, y: pos.y }]);
    }

    setIsDrawing(true);
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);

    // Atualiza zona se for o modo zona
    if (tool === "zone" && currentZone) {
      setCurrentZone({
        ...currentZone,
        width: pos.x - currentZone.x,
        height: pos.y - currentZone.y,
      });
      return; // <- impede atualização de linha/path
    }

    // Atualiza linha ou path
    if (tool === "line" && currentLine)
      setCurrentLine({ ...currentLine, x2: pos.x, y2: pos.y });

    if (tool === "free" && currentPath.length > 0)
      setCurrentPath((prev) => [...prev, { x: pos.x, y: pos.y }]);
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    if (tool === "zone" && currentZone) {
      setZones((prev) => [...prev, currentZone]);
      setCurrentZone(null);
      setIsDrawing(false);
      setIsDrawingZone(false);
      return; // <- impede salvar linha/path
    }

    // Salva linha ou path na camada ativa
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== activeLayerId) return layer;
        if (tool === "line" && currentLine)
          return { ...layer, lines: [...layer.lines, currentLine] };
        if (tool === "free" && currentPath.length > 0)
          return {
            ...layer,
            freePaths: [
              ...layer.freePaths,
              { points: currentPath, color: currentColor },
            ],
          };
        return layer;
      })
    );

    // Reset
    setCurrentLine(null);
    setCurrentPath([]);
    setIsDrawing(false);
  };

  // Detectar clique em zona existente
  const handleZoneClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "hand") return; // Só renomeia se estiver no modo "hand"

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedZone = zones.find(
      (z) => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
    );

    if (clickedZone) {
      setEditingZone({
        id: clickedZone.id,
        x: clickedZone.x + rect.left,
        y: clickedZone.y + rect.top,
        name: clickedZone.name,
      });
    } else {
      setEditingZone(null);
    }
  };

  // Atualiza nome da zona ao editar
  const handleZoneRename = (id: string, newName: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, name: newName } : z))
    );
    setEditingZone(null);
  };

  const handleZoneMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "hand") return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedZone = zones.find(
      (z) => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
    );

    if (clickedZone) {
      // Preparar para mover
      setDraggingZone({
        id: clickedZone.id,
        offsetX: x - clickedZone.x,
        offsetY: y - clickedZone.y,
      });
      setEditingZone(null); // Desativa input ao arrastar
    } else {
      setEditingZone(null);
    }
  };

  const handleZoneMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingZone) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - draggingZone.offsetX;
    const y = e.clientY - rect.top - draggingZone.offsetY;
    setZones((prev) =>
      prev.map((z) => (z.id === draggingZone.id ? { ...z, x, y } : z))
    );
  };

  const handleZoneMouseUp = () => {
    setDraggingZone(null);
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
    const newLayer = {
      id: uuidv4(),
      name: "Camada 1",
      visible: true,
      lines: [],
      freePaths: [],
    };
    setLayers([newLayer]);
    setActiveLayerId(newLayer.id);
    setZones([]);
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

    if (tool === "zone" && zones.length > 0) {
      setZones((prev) => prev.slice(0, -1));
    }
  };

  const exportPNG = async () => {
    addToast("Exportando imagem...", "info");
    const canvas = canvasRef.current!;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d")!;
    const { escalaX, escalaY } = getScale();

    // Exportar camadas separadas
    if (exportLayersSeparadas) {
      const zip = new JSZip();

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;

      for (const layer of layers) {
        if (!layer.visible) continue;

        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Fundo
        if (imgRef.current)
          tempCtx.drawImage(
            imgRef.current,
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );

        // Apenas a camada atual
        layer.lines.forEach((line) =>
          drawLine(tempCtx, line, escalaX, escalaY, showLabels)
        );
        layer.freePaths.forEach((path) =>
          drawPath(tempCtx, path, escalaX, escalaY)
        );

        // Zonas
        if (exportZones) {
          zones.forEach((zone) => {
            tempCtx.fillStyle = zone.color + "55";
            tempCtx.fillRect(zone.x, zone.y, zone.width, zone.height);
            tempCtx.strokeStyle = zone.color;
            tempCtx.lineWidth = 2;
            tempCtx.strokeRect(zone.x, zone.y, zone.width, zone.height);

            tempCtx.font = "14px Arial";
            tempCtx.textAlign = "center";
            tempCtx.textBaseline = "middle";
            tempCtx.fillStyle = "black";
            tempCtx.fillText(
              zone.name,
              zone.x + zone.width / 2,
              zone.y + zone.height / 2
            );
          });
        }

        const dataURL = tempCanvas.toDataURL("image/png");
        const base64 = dataURL.split(",")[1];
        zip.file(`${layer.name}.png`, base64, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "camadas.zip");
      addToast("Imagem exportada com sucesso!", "success");
      return;
    }

    // Exportação normal (todas camadas visíveis e/ou zonas)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imgRef.current)
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      if (!layer.visible) return;
      layer.lines.forEach((line) =>
        drawLine(ctx, line, escalaX, escalaY, showLabels)
      );
      layer.freePaths.forEach((path) => drawPath(ctx, path, escalaX, escalaY));
    });

    if (exportZones) {
      zones.forEach((zone) => {
        ctx.fillStyle = zone.color + "55";
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(
          zone.name,
          zone.x + zone.width / 2,
          zone.y + zone.height / 2
        );
      });
    }
    addToast("Imagem exportada com sucesso!", "success");
    const dataURL = tempCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "fll-quickbrick.png";
    a.click();
  };

  const exportPDF = async () => {
    addToast("Exportando PDF...", "info");
    const canvas = canvasRef.current!;
    const { escalaX, escalaY } = getScale();

    // Exportar camadas separadas
    if (exportLayersSeparadas) {
      const zip = new JSZip();

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;

      for (const layer of layers) {
        if (!layer.visible) continue;

        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Fundo
        if (imgRef.current)
          tempCtx.drawImage(
            imgRef.current,
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );

        // Apenas a camada atual
        layer.lines.forEach((line) =>
          drawLine(tempCtx, line, escalaX, escalaY, showLabels)
        );
        layer.freePaths.forEach((path) =>
          drawPath(tempCtx, path, escalaX, escalaY)
        );

        // Zonas, se quiser
        if (exportZones) {
          zones.forEach((zone) => {
            tempCtx.fillStyle = zone.color + "55";
            tempCtx.fillRect(zone.x, zone.y, zone.width, zone.height);
            tempCtx.strokeStyle = zone.color;
            tempCtx.lineWidth = 2;
            tempCtx.strokeRect(zone.x, zone.y, zone.width, zone.height);

            tempCtx.font = "14px Arial";
            tempCtx.textAlign = "center";
            tempCtx.textBaseline = "middle";
            tempCtx.fillStyle = "black";
            tempCtx.fillText(
              zone.name,
              zone.x + zone.width / 2,
              zone.y + zone.height / 2
            );
          });
        }

        const dataURL = tempCanvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        pdf.addImage(dataURL, "PNG", 0, 0, 297, 210);

        const pdfBlob = pdf.output("blob");
        zip.file(`${layer.name}.pdf`, pdfBlob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "camadas-pdf.zip");
      addToast("PDF exportado com sucesso!", "success");
      return;
    }

    // Exportação normal (todas camadas visíveis e/ou zonas)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d")!;

    // Fundo
    if (imgRef.current)
      tempCtx.drawImage(
        imgRef.current,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

    layers.forEach((layer) => {
      if (!layer.visible) return;
      layer.lines.forEach((line) =>
        drawLine(tempCtx, line, escalaX, escalaY, showLabels)
      );
      layer.freePaths.forEach((path) =>
        drawPath(tempCtx, path, escalaX, escalaY)
      );
    });

    if (exportZones) {
      zones.forEach((zone) => {
        tempCtx.fillStyle = zone.color + "55";
        tempCtx.fillRect(zone.x, zone.y, zone.width, zone.height);
        tempCtx.strokeStyle = zone.color;
        tempCtx.lineWidth = 2;
        tempCtx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        tempCtx.font = "14px Arial";
        tempCtx.textAlign = "center";
        tempCtx.textBaseline = "middle";
        tempCtx.fillStyle = "black";
        tempCtx.fillText(
          zone.name,
          zone.x + zone.width / 2,
          zone.y + zone.height / 2
        );
      });
    }
    addToast("PDF exportado com sucesso!", "success");
    const dataURL = tempCanvas.toDataURL("image/png");
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
            data-tip="Mão livre (interação)"
          >
            <button
              onClick={() => setTool("hand")}
              className={`btn btn-soft border border-neutral ${
                tool === "hand" ? "btn-primary border-primary" : ""
              } cursor-pointer`}
              title="Mão livre"
              style={{ lineHeight: 0 }}
            >
              <HandRaisedIcon className="size-6" />
            </button>
          </div>
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
          <div
            className="tooltip tooltip-bottom animate-fade-in"
            data-tip="Zona"
          >
            <button
              onClick={() => setTool("zone")}
              className={`btn btn-soft border border-neutral ${
                tool === "zone" ? "btn-primary border-primary" : ""
              } cursor-pointer`}
              title="Zona"
              style={{ lineHeight: 0 }}
            >
              <i className="fi fi-bs-square"></i>
            </button>
          </div>
        </div>
        <div className="flex flex-row">
          <label className="font-semibold flex items-center label-text text-sm">
            Cor:
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="ml-2 cursor-pointer w-6 h-6"
            />
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
                {editingLayerId === layer.id ? (
                  <input
                    type="text"
                    value={layer.name}
                    autoFocus
                    onChange={(e) => {
                      setLayers((prev) =>
                        prev.map((l) =>
                          l.id === layer.id ? { ...l, name: e.target.value } : l
                        )
                      );
                    }}
                    onBlur={() => setEditingLayerId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingLayerId(null);
                      else if (e.key === "Escape") setEditingLayerId(null);
                    }}
                    className="input input-bordered w-full input-info input-sm"
                  />
                ) : (
                  <span onDoubleClick={() => setEditingLayerId(layer.id)}>
                    {layer.name}
                  </span>
                )}
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
          <Square3Stack3DIcon className="size-4" />
          Limpar Camada
        </button>
        <button
          onClick={() => {
            if (zones.length > 0 && window.confirm("Limpar todas as zonas?")) {
              setZones([]);
            }
          }}
          className="btn btn-soft btn-error"
        >
          <i className="fi fi-bs-square-x"></i> Limpar Zonas
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
          <TrashIcon className="size-4" />
          Limpar Tudo
        </button>

        <hr className="border border-gray-300 my-2 w-1/2 mx-auto" />
        <div className="flex flex-row justify-between items-center">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-soft btn-accent ml-auto">
              Exportar <i className="fi fi-bs-download ml-2"></i>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44"
            >
              <li>
                <button
                  onClick={exportPNG}
                  className="btn btn-ghost justify-start w-full"
                >
                  <i className="fi fi-bs-picture mr-2"></i> PNG
                </button>
              </li>
              <li>
                <button
                  onClick={exportPDF}
                  className="btn btn-ghost justify-start w-full"
                >
                  <i className="fi fi-bs-file-pdf mr-2"></i> PDF
                </button>
              </li>
            </ul>
          </div>
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-soft btn-accent ml-2">
              Opções <i className="fi fi-bs-sliders ml-2"></i>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56"
            >
              <li className="p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary bg-base-200 checked:bg-primary/50 toggle-sm"
                    checked={showLabels}
                    onChange={() => setShowLabels(!showLabels)}
                  />
                  <span className="text-sm">Exibir legendas</span>
                </label>
              </li>
              <li className="p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary bg-base-200 checked:bg-primary/50 toggle-sm"
                    checked={showZones}
                    onChange={() => setShowZones(!showZones)}
                  />
                  <span className="text-sm">Exibir zonas</span>
                </label>
              </li>
              <div className="divider">Exportação</div>
              <li className="p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary bg-base-200 checked:bg-primary/50 toggle-sm"
                    checked={exportZones}
                    onChange={() => setExportZones(!exportZones)}
                  />
                  <span className="text-sm">Exportar Zonas</span>
                </label>
              </li>
              <li className="p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary bg-base-200 checked:bg-primary/50 toggle-sm"
                    checked={exportLayersSeparadas}
                    onChange={() =>
                      setExportLayersSeparadas(!exportLayersSeparadas)
                    }
                  />
                  <span className="text-sm">Exportar Camadas Separadas</span>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Canvas principal */}
      <div className="relative">
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
          onMouseDown={(e) => {
            startDrawing(e);
            handleZoneMouseDown(e);
          }}
          onMouseMove={(e) => {
            drawMove(e);
            handleZoneMouseMove(e);
          }}
          onMouseUp={(e) => {
            endDrawing();
            handleZoneMouseUp();
          }}
          onMouseLeave={(e) => {
            endDrawing();
            handleZoneMouseUp();
          }}
          onTouchStart={startDrawing}
          onTouchMove={drawMove}
          onTouchEnd={endDrawing}
          onClick={handleZoneClick}
        />

        {/* Campo de edição flutuante centralizado */}
        {editingZone && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 z-50">
            <input
              type="text"
              value={editingZone.name}
              autoFocus
              onChange={(e) =>
                setEditingZone({ ...editingZone, name: e.target.value })
              }
              onBlur={() => handleZoneRename(editingZone.id, editingZone.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  handleZoneRename(editingZone.id, editingZone.name);
                else if (e.key === "Escape") setEditingZone(null);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "16px",
                width: "220px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                backdropFilter: "blur(8px)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
