import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Layer,
  Line,
  Point,
  ToolType,
  Zone,
  FreePath,
  CanvasHandle,
  Robot,
} from "@/types/CanvasType";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import saveAs from "file-saver";
import { useToast } from "@/app/context/ToastContext";
import { Bot, SquareDashedIcon, Trash, X } from "lucide-react";

interface CanvasBoardProps {
  tool: ToolType;
  // NOVO: necessário para que o componente possa devolver o controle para a
  // ferramenta "hand" assim que uma Zona/Robô é criado. O componente pai deve
  // passar o mesmo setter usado para controlar `tool` (ex: setTool do useState).
  setTool: React.Dispatch<React.SetStateAction<ToolType>>;
  color: string;
  layers: Layer[];
  activeLayerId: string;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  registerAction: () => void;
  showLabels: boolean;
  showZones: boolean;
  backgroundImage: string | null;
}

// Standard FLL Table internal dimensions
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 513;
const TABLE_WIDTH_CM = 200; // ~200cm
const CM_PER_PIXEL = TABLE_WIDTH_CM / CANVAS_WIDTH;

// --- Resize handle constants/helpers -----------------------------------
// Extraídos como funções puras (fora do componente) para que a lógica de
// hit-testing e a lógica de cálculo do novo retângulo fiquem testáveis de
// forma isolada e não dependam de closures/estado do componente.

type ResizeHandle = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se" | null;

const ZONE_HANDLE_SIZE = 8; // tamanho visual do quadrado do handle
const ZONE_HANDLE_HIT = 10; // raio de tolerância de clique/toque no handle
const ZONE_MIN_SIZE = 15; // tamanho mínimo (px) permitido ao redimensionar

const RESIZE_CURSORS: Record<Exclude<ResizeHandle, null>, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

const getZoneHandlePoints = (zone: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => [
  { handle: "nw" as ResizeHandle, x: zone.x, y: zone.y },
  { handle: "ne" as ResizeHandle, x: zone.x + zone.width, y: zone.y },
  {
    handle: "se" as ResizeHandle,
    x: zone.x + zone.width,
    y: zone.y + zone.height,
  },
  { handle: "sw" as ResizeHandle, x: zone.x, y: zone.y + zone.height },
  { handle: "n" as ResizeHandle, x: zone.x + zone.width / 2, y: zone.y },
  {
    handle: "s" as ResizeHandle,
    x: zone.x + zone.width / 2,
    y: zone.y + zone.height,
  },
  { handle: "w" as ResizeHandle, x: zone.x, y: zone.y + zone.height / 2 },
  {
    handle: "e" as ResizeHandle,
    x: zone.x + zone.width,
    y: zone.y + zone.height / 2,
  },
];

const getZoneHandleAt = (
  x: number,
  y: number,
  zone: { x: number; y: number; width: number; height: number },
): ResizeHandle => {
  for (const p of getZoneHandlePoints(zone)) {
    if (
      Math.abs(x - p.x) <= ZONE_HANDLE_HIT &&
      Math.abs(y - p.y) <= ZONE_HANDLE_HIT
    ) {
      return p.handle;
    }
  }
  return null;
};

const computeResizedZoneRect = (
  start: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  pointerX: number,
  pointerY: number,
  cWidth: number,
  cHeight: number,
) => {
  let x1 = start.x;
  let y1 = start.y;
  let x2 = start.x + start.width;
  let y2 = start.y + start.height;

  if (handle?.includes("e")) x2 = pointerX;
  if (handle?.includes("w")) x1 = pointerX;
  if (handle?.includes("s")) y2 = pointerY;
  if (handle?.includes("n")) y1 = pointerY;

  // Mantém o retângulo dentro dos limites do canvas
  x1 = Math.max(0, Math.min(x1, cWidth));
  x2 = Math.max(0, Math.min(x2, cWidth));
  y1 = Math.max(0, Math.min(y1, cHeight));
  y2 = Math.max(0, Math.min(y2, cHeight));

  // Garante um tamanho mínimo, preservando a borda oposta à que está sendo arrastada
  if (x2 - x1 < ZONE_MIN_SIZE) {
    if (handle?.includes("w")) x1 = x2 - ZONE_MIN_SIZE;
    else x2 = x1 + ZONE_MIN_SIZE;
  }
  if (y2 - y1 < ZONE_MIN_SIZE) {
    if (handle?.includes("n")) y1 = y2 - ZONE_MIN_SIZE;
    else y2 = y1 + ZONE_MIN_SIZE;
  }

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};
// -------------------------------------------------------------------------

export const CanvasBoard = forwardRef<CanvasHandle, CanvasBoardProps>(
  (
    {
      tool,
      setTool,
      color,
      layers,
      activeLayerId,
      setLayers,
      registerAction,
      showLabels,
      showZones,
      backgroundImage,
    },
    ref,
  ) => {
    const { addToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentLine, setCurrentLine] = useState<Line | null>(null);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [currentZone, setCurrentZone] = useState<Zone | null>(null);

    // Interaction State
    // Selection can be a Zone or a Robot
    const [activeSelection, setActiveSelection] = useState<{
      id: string;
      layerId: string;
      type: "zone" | "robot";
    } | null>(null);
    const [dragOffset, setDragOffset] = useState<{
      x: number;
      y: number;
      startX: number;
      startY: number;
    } | null>(null);
    const [hasMoved, setHasMoved] = useState(false);

    // Resize state (apenas Zonas suportam resize via handles)
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
    const [resizeStart, setResizeStart] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);
    const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle>(null);

    const [editModalPos, setEditModalPos] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

    // Load Image
    useEffect(() => {
      if (!backgroundImage) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = backgroundImage;
      img.onload = () => {
        imgRef.current = img;
        renderCanvas();
      };
    }, [backgroundImage]);

    // Reset interaction state when tool changes
    useEffect(() => {
      setDragOffset(null);
      setHasMoved(false);
      setIsDrawing(false);
      setResizeHandle(null);
      setResizeStart(null);
      setHoveredHandle(null);
    }, [tool]);

    // --- Export Logic ---

    useImperativeHandle(ref, () => ({
      exportGeneral: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = CANVAS_WIDTH;
        tempCanvas.height = CANVAS_HEIGHT;
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          if (imgRef.current)
            ctx.drawImage(imgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          else {
            ctx.fillStyle = "#e3e4e7";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }

          // isMainRender = false => seleção nunca é desenhada, então não há
          // necessidade de tocar em activeSelection para "limpar" a exportação.
          layers.forEach((layer) => {
            if (layer.visible)
              drawLayerContent(ctx, layer, CM_PER_PIXEL, false);
            if (showZones && layer.zonesVisible) {
              layer.zones.forEach((zone) => drawZone(ctx, zone, false));
            }
            if (showLabels) {
              layer.lines.forEach((line) =>
                drawLine(ctx, line, CM_PER_PIXEL, true),
              );
            }
          });

          tempCanvas.toBlob((blob) => {
            if (blob) saveAs(blob, `quickbrick-estrategia-completa.png`);
          });
        }
        addToast("Exportação concluída! Baixando arquivo PNG.", "success");
      },
      exportLayers: async () => {
        const zip = new JSZip();

        // 1. Export Background
        const bgCanvas = document.createElement("canvas");
        bgCanvas.width = CANVAS_WIDTH;
        bgCanvas.height = CANVAS_HEIGHT;
        const bgCtx = bgCanvas.getContext("2d");
        if (bgCtx) {
          if (imgRef.current) {
            bgCtx.drawImage(imgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          } else {
            bgCtx.fillStyle = "#1e293b";
            bgCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }
          const bgData = bgCanvas.toDataURL("image/png").split(",")[1];
          zip.file("00_background.png", bgData, { base64: true });
        }

        // 2. Export Each Layer with Background
        layers.forEach((layer, index) => {
          if (
            !layer.visible &&
            layer.lines.length === 0 &&
            layer.freePaths.length === 0 &&
            layer.zones.length === 0 &&
            layer.robots.length === 0
          )
            return;

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = CANVAS_WIDTH;
          tempCanvas.height = CANVAS_HEIGHT;
          const ctx = tempCanvas.getContext("2d");

          if (ctx) {
            // Draw Background first
            if (imgRef.current) {
              ctx.drawImage(imgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            } else {
              ctx.fillStyle = "#e9e9e9";
              ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            // Draw Layer content on top
            drawLayerContent(ctx, layer, CM_PER_PIXEL, false);

            const data = tempCanvas.toDataURL("image/png").split(",")[1];
            zip.file(
              `layer_${index + 1}_${layer.name.replace(/\s+/g, "_")}.png`,
              data,
              { base64: true },
            );
          }
        });

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "estrategia-camadas.zip");
        addToast("Exportação concluída! Baixando arquivo ZIP.", "success");
      },
    }));

    // --- Drawing Helpers ---

    // Refactored to be reusable for both main render and export
    const drawLayerContent = (
      ctx: CanvasRenderingContext2D,
      layer: Layer,
      scale: number,
      isMainRender: boolean,
    ) => {
      // Zones
      if ((showZones || !isMainRender) && layer.zonesVisible) {
        layer.zones.forEach((zone) => {
          const isSelected =
            isMainRender &&
            activeSelection?.id === zone.id &&
            activeSelection.type === "zone";
          drawZone(ctx, zone, isSelected);
        });
      }

      // Robots
      if (layer.visible) {
        layer.robots.forEach((robot) => {
          const isSelected =
            isMainRender &&
            activeSelection?.id === robot.id &&
            activeSelection.type === "robot";
          drawRobot(ctx, robot, isSelected);
        });
      }

      // Lines
      layer.lines.forEach((line) =>
        drawLine(ctx, line, scale, showLabels && isMainRender),
      );

      // Paths
      layer.freePaths.forEach((path) => drawPath(ctx, path));
    };

    // Main Render Loop
    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Reset Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Background
      if (imgRef.current) {
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback grid
        ctx.fillStyle = "#d7d8d8"; // slate-800
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 50) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += 50) {
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
      }

      const scale = CM_PER_PIXEL;

      // Draw Layers
      layers.forEach((layer) => {
        if (!layer.visible) return;
        drawLayerContent(ctx, layer, scale, true);
      });

      // Draw Current Actions
      if (currentLine) drawLine(ctx, currentLine, scale, showLabels);
      if (currentPath.length > 0)
        drawPath(ctx, { id: "temp", points: currentPath, color });

      // Draw Current Zone being created
      if (currentZone && showZones) {
        drawZone(ctx, currentZone, true);

        // Show Dimensions while drawing
        const widthCm = Math.abs(currentZone.width) * scale;
        const heightCm = Math.abs(currentZone.height) * scale;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.font = "12px monospace";
        ctx.fillStyle = "white";
        const label = `${widthCm.toFixed(0)} x ${heightCm.toFixed(0)} cm`;
        const metrics = ctx.measureText(label);

        const labelX = currentZone.x + currentZone.width + 10;
        const labelY = currentZone.y + currentZone.height + 10;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(labelX - 4, labelY - 14, metrics.width + 8, 20);
        ctx.fillStyle = "white";
        ctx.fillText(label, labelX, labelY);
        ctx.restore();
      }
    };

    const drawLine = (
      ctx: CanvasRenderingContext2D,
      line: Line,
      scale: number,
      showLabel: boolean,
    ) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.setLineDash([]);
      ctx.stroke();

      const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(line.x2, line.y2);
      ctx.lineTo(
        line.x2 - headLen * Math.cos(angle - Math.PI / 6),
        line.y2 - headLen * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        line.x2 - headLen * Math.cos(angle + Math.PI / 6),
        line.y2 - headLen * Math.sin(angle + Math.PI / 6),
      );
      ctx.fillStyle = line.color;
      ctx.fill();

      if (showLabel) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const dist = Math.sqrt(dx * dx + dy * dy) * scale;
        const midX = (line.x1 + line.x2) / 2;
        const midY = (line.y1 + line.y2) / 2;

        ctx.save();
        ctx.translate(midX, midY);
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath();
        ctx.roundRect(-20, -10, 40, 20, 5);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${dist.toFixed(0)}cm`, 0, 0);
        ctx.restore();
      }
    };

    const drawPath = (
      ctx: CanvasRenderingContext2D,
      path: FreePath | { points: Point[]; color: string },
    ) => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.strokeStyle = path.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([]);
      ctx.stroke();
    };

    const drawZone = (
      ctx: CanvasRenderingContext2D,
      zone: Zone,
      isActive: boolean,
    ) => {
      ctx.save();

      // Fill
      ctx.fillStyle = isActive ? zone.color + "60" : zone.color + "40";
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

      if (isActive) {
        // High Contrast Active Border Style
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 10;

        ctx.strokeStyle = "#00000000";
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

        ctx.strokeStyle = "#8d150e";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

        // Resize Handles (4 cantos + 4 pontos médios das arestas)
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        getZoneHandlePoints(zone).forEach((point) => {
          ctx.beginPath();
          ctx.rect(
            point.x - ZONE_HANDLE_SIZE / 2,
            point.y - ZONE_HANDLE_SIZE / 2,
            ZONE_HANDLE_SIZE,
            ZONE_HANDLE_SIZE,
          );
          ctx.fill();
          ctx.stroke();
        });
      } else {
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      }

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = isActive ? "bold 16px sans-serif" : "bold 14px sans-serif";

      const textMetrics = ctx.measureText(zone.name);
      const bgPad = 4;
      const textX = zone.x + zone.width / 2;
      const textY = zone.y + zone.height / 2;

      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.roundRect(
        textX - textMetrics.width / 2 - bgPad,
        textY - 8 - bgPad,
        textMetrics.width + bgPad * 2,
        16 + bgPad * 2,
        4,
      );
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(zone.name, textX, textY);

      ctx.restore();
    };

    const drawRobot = (
      ctx: CanvasRenderingContext2D,
      robot: Robot,
      isActive: boolean,
    ) => {
      ctx.save();
      // Translate to robot center
      ctx.translate(robot.x, robot.y);
      ctx.rotate((robot.rotation * Math.PI) / 180);

      const w = robot.width;
      const h = robot.height;

      // Base Glow if selected
      if (isActive) {
        ctx.shadowColor = "#fbbe2474";
        ctx.shadowBlur = 15;
      }

      // Draw Chassis
      ctx.fillStyle = robot.color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Remove Shadow for details
      ctx.shadowBlur = 0;

      // Draw Details based on Type
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      if (robot.type === "base") {
        // Simple Wheels indication
        ctx.fillRect(-w / 2 - 4, -h / 4, 4, h / 2); // Left Wheel
        ctx.fillRect(w / 2, -h / 4, 4, h / 2); // Right Wheel
      } else if (robot.type === "forklift") {
        // Forks at front (assuming Right is front)
        ctx.fillRect(w / 2, -h / 4, 15, 5);
        ctx.fillRect(w / 2, h / 4 - 5, 15, 5);
      } else if (robot.type === "dozer") {
        // Blade at front
        ctx.beginPath();
        ctx.moveTo(w / 2 + 5, -h / 2);
        ctx.quadraticCurveTo(w / 2 + 15, 0, w / 2 + 5, h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw Heading Arrow (Triangle)
      ctx.beginPath();
      ctx.moveTo(w / 4, -h / 4);
      ctx.lineTo(w / 2 - 5, 0);
      ctx.lineTo(w / 4, h / 4);
      ctx.fillStyle = "white";
      ctx.fill();

      // Selection Ring
      if (isActive) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        const diag = Math.sqrt(w * w + h * h);
        ctx.beginPath();
        ctx.arc(0, 0, diag / 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    useEffect(() => {
      renderCanvas();
    }, [
      layers,
      currentLine,
      currentPath,
      currentZone,
      showLabels,
      showZones,
      activeSelection,
      dragOffset,
      resizeHandle,
    ]);

    // --- Interaction Logic ---

    // Recebe a "borda de referência" (aresta direita para Zonas, centro para
    // Robôs) e o centro vertical do item, e posiciona o modal ancorado a ela.
    // Antes, a função recebia (x, y, width, height) e fazia `x + width` para
    // ambos os tipos — o que estava correto para Zonas (x = canto superior
    // esquerdo) mas incorreto para Robôs (x = centro), deslocando o modal.
    const updateEditModalPosition = (
      anchorRightX: number,
      anchorCenterY: number,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;

      const screenX = rect.left + anchorRightX * scaleX + 40;
      const screenY = rect.top + anchorCenterY * scaleY;

      const left = Math.max(10, Math.min(screenX, window.innerWidth - 340));
      const top = Math.max(10, Math.min(screenY, window.innerHeight - 300));

      setEditModalPos({ left, top });
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const getHoveredItem = (
      x: number,
      y: number,
    ): {
      item: Zone | Robot;
      layerId: string;
      type: "zone" | "robot";
    } | null => {
      for (let i = layers.length - 1; i >= 0; i--) {
        if (!layers[i].visible) continue;

        // Check Robots First (Draw order usually puts robots on top of zones if they share layer z-index concept, or just preference)
        const robots = layers[i].robots || [];
        for (let r = robots.length - 1; r >= 0; r--) {
          const robot = robots[r];
          // Simple circular hit detection for rotated robots for UX smoothness
          const dx = x - robot.x;
          const dy = y - robot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = Math.max(robot.width, robot.height) / 1.5;
          if (dist < radius) {
            return { item: robot, layerId: layers[i].id, type: "robot" };
          }
        }

        // Check Zones (respeita tanto a visibilidade da camada quanto o toggle global)
        if (!showZones || !layers[i].zonesVisible) continue;
        const zone = layers[i].zones
          .slice()
          .reverse()
          .find(
            (z) =>
              x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height,
          );
        if (zone) return { item: zone, layerId: layers[i].id, type: "zone" };
      }
      return null;
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const { x, y } = getPos(e);

      // Robot Placement Tool
      if (tool === "robot") {
        const newRobot: Robot = {
          id: uuidv4(),
          x,
          y,
          width: 50, // ~10cm
          height: 50,
          rotation: 0,
          color: color,
          type: "base",
        };

        // Basic boundary check for new robot
        if (newRobot.x < newRobot.width / 2) newRobot.x = newRobot.width / 2;
        if (newRobot.x > CANVAS_WIDTH - newRobot.width / 2)
          newRobot.x = CANVAS_WIDTH - newRobot.width / 2;
        if (newRobot.y < newRobot.height / 2) newRobot.y = newRobot.height / 2;
        if (newRobot.y > CANVAS_HEIGHT - newRobot.height / 2)
          newRobot.y = CANVAS_HEIGHT - newRobot.height / 2;

        setLayers((prev) =>
          prev.map((l) =>
            l.id === activeLayerId
              ? { ...l, robots: [...l.robots, newRobot] }
              : l,
          ),
        );

        // Auto-select the new robot
        setActiveSelection({
          id: newRobot.id,
          layerId: activeLayerId,
          type: "robot",
        });
        updateEditModalPosition(newRobot.x + newRobot.width / 2, newRobot.y);
        registerAction();

        // Volta para a ferramenta de seleção assim que o robô é criado
        setTool("hand");
        return;
      }

      if (tool === "hand") {
        // Se já existe uma Zona selecionada, primeiro verifica se o clique
        // começou em cima de um handle de redimensionamento dela.
        if (activeSelection?.type === "zone") {
          const layer = layers.find((l) => l.id === activeSelection.layerId);
          const zone = layer?.zones.find((z) => z.id === activeSelection.id);
          if (zone) {
            const handle = getZoneHandleAt(x, y, zone);
            if (handle) {
              setResizeHandle(handle);
              setResizeStart({
                x: zone.x,
                y: zone.y,
                width: zone.width,
                height: zone.height,
              });
              setHasMoved(false);
              return;
            }
          }
        }

        const result = getHoveredItem(x, y);

        if (result) {
          // Select it AND prepare for dragging
          setActiveSelection({
            id: result.item.id,
            layerId: result.layerId,
            type: result.type,
          });

          // For zones, x/y is top-left. For robots, x/y is center.
          const startX =
            result.type === "zone"
              ? (result.item as Zone).x
              : (result.item as Robot).x;
          const startY =
            result.type === "zone"
              ? (result.item as Zone).y
              : (result.item as Robot).y;

          setDragOffset({ x: x - startX, y: y - startY, startX: x, startY: y });
          setHasMoved(false);

          // Initial modal position
          if (result.type === "zone") {
            const z = result.item as Zone;
            updateEditModalPosition(z.x + z.width, z.y + z.height / 2);
          } else {
            const r = result.item as Robot;
            updateEditModalPosition(r.x + r.width / 2, r.y);
          }
        } else {
          // Deselect only if clicking background
          setActiveSelection(null);
          setEditModalPos(null);
          setDragOffset(null);
          setHasMoved(false);
        }
        return;
      }

      setIsDrawing(true);
      setActiveSelection(null);
      setEditModalPos(null);
      setDragOffset(null);
      setHasMoved(false);

      if (tool === "line") {
        setCurrentLine({ id: "temp", x1: x, y1: y, x2: x, y2: y, color });
      } else if (tool === "free") {
        setCurrentPath([{ x, y }]);
      } else if (tool === "zone") {
        setCurrentZone({
          id: uuidv4(),
          x,
          y,
          width: 0,
          height: 0,
          color,
          name: `Nova Zona`,
        });
      }
    };

    const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
      const { x, y } = getPos(e);

      // Resize de Zona em andamento
      if (
        tool === "hand" &&
        activeSelection?.type === "zone" &&
        resizeHandle &&
        resizeStart
      ) {
        setHasMoved(true);

        const canvas = canvasRef.current;
        const cWidth = canvas ? canvas.width : CANVAS_WIDTH;
        const cHeight = canvas ? canvas.height : CANVAS_HEIGHT;

        const newRect = computeResizedZoneRect(
          resizeStart,
          resizeHandle,
          x,
          y,
          cWidth,
          cHeight,
        );

        setLayers((prev) =>
          prev.map((layer) => {
            if (layer.id !== activeSelection.layerId) return layer;
            return {
              ...layer,
              zones: layer.zones.map((z) =>
                z.id === activeSelection.id ? { ...z, ...newRect } : z,
              ),
            };
          }),
        );

        updateEditModalPosition(
          newRect.x + newRect.width,
          newRect.y + newRect.height / 2,
        );
        return;
      }

      // Cursor interaction logic (Hover effect)
      if (tool === "hand" && !dragOffset && !resizeHandle) {
        // Prioriza a detecção de handles sobre a Zona atualmente selecionada
        let handle: ResizeHandle = null;
        if (activeSelection?.type === "zone") {
          const layer = layers.find((l) => l.id === activeSelection.layerId);
          const zone = layer?.zones.find((z) => z.id === activeSelection.id);
          if (zone) handle = getZoneHandleAt(x, y, zone);
        }

        if (handle !== hoveredHandle) setHoveredHandle(handle);

        if (handle) {
          if (hoveredItemId !== null) setHoveredItemId(null);
          return;
        }

        const hovered = getHoveredItem(x, y);
        if (hovered?.item.id !== hoveredItemId) {
          setHoveredItemId(hovered?.item.id || null);
        }
      }

      // Drag Logic - Only if dragOffset exists (meaning mouse is down on zone/robot)
      if (tool === "hand" && activeSelection && dragOffset) {
        // Drag Threshold Check (5px)
        if (!hasMoved) {
          const dist = Math.sqrt(
            Math.pow(x - dragOffset.startX, 2) +
              Math.pow(y - dragOffset.startY, 2),
          );
          if (dist < 5) return;
          setHasMoved(true);
        }

        let newX = x - dragOffset.x;
        let newY = y - dragOffset.y;
        let width = 0;
        let height = 0;

        // Apply Constraints based on type
        const canvas = canvasRef.current;
        const cWidth = canvas ? canvas.width : CANVAS_WIDTH;
        const cHeight = canvas ? canvas.height : CANVAS_HEIGHT;

        if (activeSelection.type === "zone") {
          const layer = layers.find((l) => l.id === activeSelection.layerId);
          const zone = layer?.zones.find((z) => z.id === activeSelection.id);
          if (zone) {
            width = zone.width;
            height = zone.height;
            // Zone Constraints (Top-Left)
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + width > cWidth) newX = cWidth - width;
            if (newY + height > cHeight) newY = cHeight - height;
          }
        } else {
          const layer = layers.find((l) => l.id === activeSelection.layerId);
          const robot = layer?.robots.find((r) => r.id === activeSelection.id);
          if (robot) {
            width = robot.width;
            height = robot.height;
            // Robot Constraints (Center)
            const halfW = width / 2;
            const halfH = height / 2;

            if (newX < halfW) newX = halfW;
            if (newX > cWidth - halfW) newX = cWidth - halfW;

            if (newY < halfH) newY = halfH;
            if (newY > cHeight - halfH) newY = cHeight - halfH;
          }
        }

        setLayers((prev) =>
          prev.map((layer) => {
            if (layer.id !== activeSelection.layerId) return layer;

            if (activeSelection.type === "zone") {
              return {
                ...layer,
                zones: layer.zones.map((z) =>
                  z.id === activeSelection.id ? { ...z, x: newX, y: newY } : z,
                ),
              };
            } else {
              return {
                ...layer,
                robots: layer.robots.map((r) =>
                  r.id === activeSelection.id ? { ...r, x: newX, y: newY } : r,
                ),
              };
            }
          }),
        );

        if (activeSelection.type === "zone") {
          updateEditModalPosition(newX + width, newY + height / 2);
        } else {
          updateEditModalPosition(newX + width / 2, newY);
        }
        return;
      }

      if (!isDrawing) return;

      if (tool === "line" && currentLine) {
        setCurrentLine({ ...currentLine, x2: x, y2: y });
      } else if (tool === "free") {
        setCurrentPath((prev) => [...prev, { x, y }]);
      } else if (tool === "zone" && currentZone) {
        setCurrentZone({
          ...currentZone,
          width: x - currentZone.x,
          height: y - currentZone.y,
        });
      }
    };

    const endDrawing = () => {
      if (tool === "hand") {
        // Finaliza um resize de Zona
        if (resizeHandle) {
          if (hasMoved) registerAction();
          setResizeHandle(null);
          setResizeStart(null);
          setHasMoved(false);
          return;
        }
        // Stop dragging
        if (hasMoved) {
          registerAction(); // Save history only if we actually moved the item
        }
        setDragOffset(null);
        setHasMoved(false);
        return;
      }

      if (!isDrawing) return;
      setIsDrawing(false);

      let changed = false;

      if (tool === "line" && currentLine) {
        const newLine = { ...currentLine, id: uuidv4() };
        setLayers((prev) =>
          prev.map((l) =>
            l.id === activeLayerId ? { ...l, lines: [...l.lines, newLine] } : l,
          ),
        );
        setCurrentLine(null);
        changed = true;
      } else if (tool === "free" && currentPath.length > 1) {
        const newPath = { id: uuidv4(), points: currentPath, color };
        setLayers((prev) =>
          prev.map((l) =>
            l.id === activeLayerId
              ? { ...l, freePaths: [...l.freePaths, newPath] }
              : l,
          ),
        );
        setCurrentPath([]);
        changed = true;
      } else if (tool === "zone" && currentZone) {
        const normalizedZone = {
          ...currentZone,
          x:
            currentZone.width < 0
              ? currentZone.x + currentZone.width
              : currentZone.x,
          y:
            currentZone.height < 0
              ? currentZone.y + currentZone.height
              : currentZone.y,
          width: Math.abs(currentZone.width),
          height: Math.abs(currentZone.height),
          color: color,
        };

        if (normalizedZone.width > 5 && normalizedZone.height > 5) {
          setLayers((prev) =>
            prev.map((l) =>
              l.id === activeLayerId
                ? { ...l, zones: [...l.zones, normalizedZone] }
                : l,
            ),
          );

          setActiveSelection({
            id: normalizedZone.id,
            layerId: activeLayerId,
            type: "zone",
          });
          setDragOffset(null);

          updateEditModalPosition(
            normalizedZone.x + normalizedZone.width,
            normalizedZone.y + normalizedZone.height / 2,
          );
          changed = true;

          // Volta para a ferramenta de seleção assim que a zona é criada
          setTool("hand");
        }
        setCurrentZone(null);
      }

      if (changed) {
        setTimeout(registerAction, 0);
      }
    };

    const handleUpdateItem = (updates: any) => {
      if (!activeSelection) return;
      const canvas = canvasRef.current;
      const cWidth = canvas ? canvas.width : CANVAS_WIDTH;
      const cHeight = canvas ? canvas.height : CANVAS_HEIGHT;

      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== activeSelection.layerId) return l;

          if (activeSelection.type === "zone") {
            return {
              ...l,
              zones: l.zones.map((z) => {
                if (z.id !== activeSelection.id) return z;

                let updated = { ...z, ...updates };

                // Impede que largura/altura fiquem zero ou negativas via input manual
                if (updated.width !== undefined)
                  updated.width = Math.max(1, updated.width);
                if (updated.height !== undefined)
                  updated.height = Math.max(1, updated.height);

                // Zone Constraints (Top-Left based)
                if (updated.x < 0) updated.x = 0;
                if (updated.y < 0) updated.y = 0;
                if (updated.x + updated.width > cWidth)
                  updated.x = cWidth - updated.width;
                if (updated.y + updated.height > cHeight)
                  updated.y = cHeight - updated.height;

                // Prevent size from exceeding canvas
                if (updated.width > cWidth) updated.width = cWidth;
                if (updated.height > cHeight) updated.height = cHeight;
                return updated;
              }),
            };
          } else {
            return {
              ...l,
              robots: l.robots.map((r) => {
                if (r.id !== activeSelection.id) return r;
                let updated = { ...r, ...updates };

                // Robot Constraints (Center based)
                const halfW = updated.width / 2;
                const halfH = updated.height / 2;

                // 1. Constrain Size
                if (updated.width > cWidth) updated.width = cWidth;
                if (updated.height > cHeight) updated.height = cHeight;

                // 2. Constrain Position
                if (updated.x < halfW) updated.x = halfW;
                if (updated.x > cWidth - halfW) updated.x = cWidth - halfW;

                if (updated.y < halfH) updated.y = halfH;
                if (updated.y > cHeight - halfH) updated.y = cHeight - halfH;

                return updated;
              }),
            };
          }
        }),
      );
    };

    const getSelectedItem = () => {
      if (!activeSelection) return null;
      const layer = layers.find((l) => l.id === activeSelection.layerId);
      if (activeSelection.type === "zone") {
        return layer?.zones.find((z) => z.id === activeSelection.id) || null;
      } else {
        return layer?.robots.find((r) => r.id === activeSelection.id) || null;
      }
    };
    const selectedItem = getSelectedItem();

    // Determine Cursor Style
    let cursorStyle = "default";
    if (tool === "zone") cursorStyle = "crosshair";
    if (tool === "robot") cursorStyle = "cell";
    if (tool === "line" || tool === "free") cursorStyle = "crosshair";
    if (tool === "hand") {
      if (resizeHandle) cursorStyle = RESIZE_CURSORS[resizeHandle];
      else if (dragOffset) cursorStyle = "grabbing";
      else if (hoveredHandle) cursorStyle = RESIZE_CURSORS[hoveredHandle];
      else if (hoveredItemId) cursorStyle = "move";
      else cursorStyle = "default";
    }

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center bg-base-100 p-4 overflow-auto relative"
      >
        <div className="relative rounded-sm overflow-hidden shrink-0">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={startDrawing}
            onMouseMove={drawMove}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={drawMove}
            onTouchEnd={endDrawing}
            style={{ cursor: cursorStyle }}
            className={`bg-base-200 touch-none`}
          />
        </div>

        {/* Contextual Editor */}
        {selectedItem && editModalPos && (
          <div
            className="card fixed bg-base-300 shadow-lg w-xs z-40 animate-fade-in-up transition-all duration-75"
            style={{
              top: editModalPos.top,
              left: editModalPos.left,
              transform: "translateY(-50%)",
            }}
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                  {activeSelection?.type === "robot" ? (
                    <Bot />
                  ) : (
                    <SquareDashedIcon />
                  )}
                  {activeSelection?.type === "robot" ? "Robô -" : "Zona -"}{" "}
                  Propriedades
                </h4>
                <button
                  onClick={() => setActiveSelection(null)}
                  className="btn btn-xs btn-circle btn-ghost"
                >
                  <X size={16} />
                </button>
              </div>

              {activeSelection?.type === "robot" ? (
                // --- ROBOT PROPERTIES ---
                <div className="space-y-4">
                  {/* Dimensões agrupadas em um único "join" horizontal */}
                  <div className="join w-full">
                    <div className="join-item flex-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide opacity-50 px-1">
                        Largura
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input input-sm input-bordered w-full join-item"
                        value={Math.round(
                          (selectedItem as Robot).width * CM_PER_PIXEL,
                        )}
                        onChange={(e) =>
                          handleUpdateItem({
                            width:
                              Math.max(1, Number(e.target.value)) /
                              CM_PER_PIXEL,
                          })
                        }
                        onBlur={registerAction}
                        onKeyDown={(e) => e.key === "Enter" && registerAction()}
                      />
                    </div>
                    <div className="join-item flex-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide opacity-50 px-1">
                        Altura
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input input-sm input-bordered w-full join-item"
                        value={Math.round(
                          (selectedItem as Robot).height * CM_PER_PIXEL,
                        )}
                        onChange={(e) =>
                          handleUpdateItem({
                            height:
                              Math.max(1, Number(e.target.value)) /
                              CM_PER_PIXEL,
                          })
                        }
                        onBlur={registerAction}
                        onKeyDown={(e) => e.key === "Enter" && registerAction()}
                      />
                    </div>
                  </div>

                  {/* Rotação — label com valor embutido, sem "chrome" extra */}
                  <div>
                    <div className="flex justify-between items-center px-1 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-50">
                        Rotação
                      </span>
                      <span className="text-xs font-mono opacity-70">
                        {Math.round((selectedItem as Robot).rotation)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={(selectedItem as Robot).rotation}
                      onChange={(e) =>
                        handleUpdateItem({ rotation: parseInt(e.target.value) })
                      }
                      onMouseUp={registerAction}
                      onTouchEnd={registerAction}
                      className="range range-xs range-primary"
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wide opacity-50 px-1">
                      Tipo
                    </label>
                    <select
                      className="select select-sm select-bordered w-full mt-1"
                      value={(selectedItem as Robot).type}
                      onChange={(e) => {
                        handleUpdateItem({ type: e.target.value });
                        setTimeout(registerAction, 0);
                      }}
                    >
                      <option value="base">Robô Base</option>
                      <option value="forklift">Empilhadeira</option>
                      <option value="dozer">Trator</option>
                    </select>
                  </div>

                  {/* Cor — swatch compacto, sem card extra */}
                  <div className="flex items-center justify-between px-1 pt-1 border-t border-base-300">
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-50">
                      Chassi
                    </span>
                    <input
                      type="color"
                      className="h-6 w-6 rounded-md cursor-pointer border border-base-300 p-0 bg-transparent"
                      value={(selectedItem as Robot).color}
                      onChange={(e) =>
                        handleUpdateItem({ color: e.target.value })
                      }
                      onBlur={registerAction}
                    />
                  </div>
                </div>
              ) : (
                // --- ZONE PROPERTIES ---
                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label
                      className="text-[10px] font-semibold uppercase tracking-wide opacity-50 px-1"
                      htmlFor="zone-name"
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      id="zone-name"
                      className="input input-sm input-bordered w-full mt-1"
                      value={(selectedItem as Zone).name}
                      onChange={(e) =>
                        handleUpdateItem({ name: e.target.value })
                      }
                      onBlur={registerAction}
                      onKeyDown={(e) => e.key === "Enter" && registerAction()}
                    />
                  </div>

                  {/* Dimensões + cor na mesma linha */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide opacity-50 px-1">
                        Largura
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input input-sm input-bordered w-full mt-1"
                        value={Math.round(selectedItem.width * CM_PER_PIXEL)}
                        onChange={(e) =>
                          handleUpdateItem({
                            width:
                              Math.max(1, Number(e.target.value)) /
                              CM_PER_PIXEL,
                          })
                        }
                        onBlur={registerAction}
                        onKeyDown={(e) => e.key === "Enter" && registerAction()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide opacity-50 px-1">
                        Altura
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input input-sm input-bordered w-full mt-1"
                        value={Math.round(selectedItem.height * CM_PER_PIXEL)}
                        onChange={(e) =>
                          handleUpdateItem({
                            height:
                              Math.max(1, Number(e.target.value)) /
                              CM_PER_PIXEL,
                          })
                        }
                        onBlur={registerAction}
                        onKeyDown={(e) => e.key === "Enter" && registerAction()}
                      />
                    </div>
                    <input
                      type="color"
                      className="h-9 w-9 rounded-md cursor-pointer border border-base-300 p-0 bg-transparent shrink-0"
                      value={selectedItem.color}
                      onChange={(e) =>
                        handleUpdateItem({ color: e.target.value })
                      }
                      onBlur={registerAction}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  className="btn btn-error btn-outline btn-sm w-full"
                  onClick={() => {
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === activeSelection!.layerId
                          ? {
                              ...l,
                              zones:
                                activeSelection!.type === "zone"
                                  ? l.zones.filter(
                                      (z) => z.id !== selectedItem!.id,
                                    )
                                  : l.zones,
                              robots:
                                activeSelection!.type === "robot"
                                  ? l.robots.filter(
                                      (r) => r.id !== selectedItem!.id,
                                    )
                                  : l.robots,
                            }
                          : l,
                      ),
                    );
                    setActiveSelection(null);
                    setTimeout(registerAction, 0);
                  }}
                >
                  <Trash className="inline mr-2" size={16} /> Excluir{" "}
                  {activeSelection?.type === "robot" ? "Robô" : "Zona"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
