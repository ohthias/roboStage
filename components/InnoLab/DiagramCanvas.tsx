import React, { useState, useEffect } from "react";
import { Node, Connection, DiagramType, PathLayer } from "@/types/InnoLabType";
import { DIAGRAM_COLORS } from "@/app/(private)/dashboard/innolab/constants";
import { ResizeHandle } from "@/hooks/useDiagram";

interface Props {
  nodes: Node[];
  connections: Connection[];
  paths?: PathLayer[];
  selectedNodeId: string | null;
  selectedNodeIds?: Set<string>;
  selectedConnectionId?: string | null;
  zoom: number;
  pan: { x: number; y: number };
  selectionBox?: { x: number; y: number; width: number; height: number } | null;
  selectionPath?: { x: number; y: number }[] | null;
  font: string;
  fontSize: number;
  fontColor: string;
  diagramType: DiagramType;
  onMouseDown: (
    e: React.MouseEvent,
    nodeId?: string,
    connectionId?: string
  ) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (droppedOnNodeId?: string) => void;
  onWheel: (e: React.WheelEvent) => void;
  onDoubleClick: (nodeId: string, x: number, y: number, text: string) => void;
  editingNode: string | null;
  editText: string;
  setEditText: (s: string) => void;
  setEditingNode: (id: string | null) => void;
  editPos: { x: number; y: number } | null;
  onFinishEditing: () => void;
  onResizeStart: (
    e: React.MouseEvent,
    nodeId: string,
    handle: ResizeHandle
  ) => void;
  isSpacePressed?: boolean;
  setIsSpacePressed?: (pressed: boolean) => void;
  connectingStartNodeId?: string | null;
  connectionDragPos?: { x: number; y: number } | null;
  draftPath?: { x: number; y: number }[] | null;
  highlighterColor?: string;
  highlighterThickness?: number;
}

const DiagramCanvas: React.FC<Props> = ({
  nodes,
  connections,
  paths = [],
  selectedNodeId,
  selectedNodeIds,
  selectedConnectionId,
  zoom,
  pan,
  selectionBox,
  selectionPath,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onDoubleClick,
  editingNode,
  editText,
  setEditText,
  onFinishEditing,
  onResizeStart,
  diagramType,
  isSpacePressed,
  setIsSpacePressed,
  connectingStartNodeId,
  connectionDragPos,
  draftPath,
  highlighterColor = "#fde047",
  highlighterThickness = 20,
}) => {
  const [cursor, setCursor] = useState("default");

  // Handle Spacebar for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && setIsSpacePressed) {
        e.preventDefault(); // Prevent scrolling
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && setIsSpacePressed) {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setIsSpacePressed]);

  // Dynamic Cursor Update
  useEffect(() => {
    if (isSpacePressed) {
      setCursor("grab");
    } else if (connectingStartNodeId) {
      setCursor("crosshair");
    } else if (draftPath) {
      setCursor("crosshair");
    } else {
      setCursor("default");
    }
  }, [isSpacePressed, connectingStartNodeId, draftPath]);

  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    // Middle click or Spacebar pan handling
    if (e.button === 1 || isSpacePressed) {
      e.preventDefault();
      setCursor("grabbing");
    } else if (!nodeId) {
      // Regular canvas click
    }
    onMouseDown(e, nodeId);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setCursor(isSpacePressed ? "grab" : "default");
    onMouseUp();
  };

  const handleNodeMouseUp = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onMouseUp(nodeId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === "Enter" && !e.ctrlKey) return;

    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      onFinishEditing();
    } else {
      handleKeyDown(e);
    }
  };

  const isNodeSelected = (id: string) => {
    if (selectedNodeIds && selectedNodeIds.has(id)) return true;
    return selectedNodeId === id;
  };

  // --- Geometry Helpers ---
  const getNodeDimensions = (node: Node) => {
    if (node.width && node.height) return { w: node.width, h: node.height };

    const isSticker = node.type === "sticker";
    const isLabel = node.type === "label";
    const isText = node.type === "text";
    const isZone = node.type === "zone";

    if (isSticker) return { w: 80, h: 80 };
    if (isLabel || isText) return { w: 200, h: 60 };
    if (isZone) return { w: 400, h: 300 };
    if (node.shape === "circle") return { w: 100, h: 100 };
    if (node.shape === "diamond") return { w: 140, h: 100 };
    if (node.shape === "pill") return { w: 160, h: 70 };
    if (node.shape === "triangle" || node.shape === "star")
      return { w: 100, h: 100 };
    if (node.shape === "cloud") return { w: 180, h: 100 };
    return { w: 180, h: 90 }; // Rect default
  };

  // Calculate usable area for text inside specific shapes
  const getSafeTextDimensions = (node: Node, w: number, h: number) => {
    const isSticker = node.type === "sticker";
    const isZone = node.type === "zone";
    const isLabel = node.type === "label" || node.type === "text";

    if (isSticker) {
      return { x: -w / 2, y: -h / 2, w: w, h: h };
    }

    if (isZone) {
      return { x: -w / 2 + 10, y: -h / 2 + 10, w: w - 20, h: 40 };
    }

    if (isLabel) {
      return { x: -w / 2, y: -h / 2, w: w, h: h };
    }

    // Shape specific padding
    const shape = node.shape || "rect";

    switch (shape) {
      case "diamond":
        const dw = w * 0.65;
        const dh = h * 0.65;
        return { x: -dw / 2, y: -dh / 2, w: dw, h: dh };
      case "circle":
        const cw = w * 0.75;
        const ch = h * 0.75;
        return { x: -cw / 2, y: -ch / 2, w: cw, h: ch };
      case "triangle":
        return { x: -(w * 0.6) / 2, y: -h / 4, w: w * 0.6, h: h * 0.6 };
      case "star":
        return {
          x: -(w * 0.45) / 2,
          y: -(h * 0.4) / 2 + h * 0.05,
          w: w * 0.45,
          h: h * 0.4,
        };
      case "cloud":
        return { x: -(w * 0.7) / 2, y: -(h * 0.6) / 2, w: w * 0.7, h: h * 0.6 };
      case "cylinder":
        return { x: -(w * 0.8) / 2, y: -(h * 0.7) / 2, w: w * 0.8, h: h * 0.7 };
      case "parallelogram":
        return { x: -(w * 0.7) / 2, y: -h / 2, w: w * 0.7, h: h };
      default:
        return { x: -w / 2, y: -h / 2, w: w, h: h };
    }
  };

  const getIntersection = (node: Node, target: { x: number; y: number }) => {
    const { w, h } = getNodeDimensions(node);
    const dx = target.x - node.x;
    const dy = target.y - node.y;

    if (dx === 0 && dy === 0) return { x: node.x, y: node.y };

    if (node.shape === "circle" || node.shape === "pill") {
      const angle = Math.atan2(dy, dx);
      return {
        x: node.x + (w / 2) * Math.cos(angle),
        y: node.y + (h / 2) * Math.sin(angle),
      };
    }

    if (node.shape === "diamond") {
      const halfW = w / 2;
      const halfH = h / 2;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const t = 1 / (absDx / halfW + absDy / halfH);
      return {
        x: node.x + dx * t,
        y: node.y + dy * t,
      };
    }

    const halfW = w / 2;
    const halfH = h / 2;

    const tx = dx !== 0 ? (dx > 0 ? halfW : -halfW) / dx : Infinity;
    const ty = dy !== 0 ? (dy > 0 ? halfH : -halfH) / dy : Infinity;

    const t = Math.min(Math.abs(tx), Math.abs(ty));

    return {
      x: node.x + dx * t,
      y: node.y + dy * t,
    };
  };

  const getConnectionPath = (
    conn: Connection,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const shape = conn.shape || "straight";

    if (shape === "straight") {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (shape === "curved") {
      const dx = Math.abs(end.x - start.x);
      const dy = Math.abs(end.y - start.y);
      const isHorizontal = dx > dy;

      if (isHorizontal) {
        const offset = dx * 0.5;
        return `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${
          end.x - offset
        } ${end.y}, ${end.x} ${end.y}`;
      } else {
        const offset = dy * 0.5;
        return `M ${start.x} ${start.y} C ${start.x} ${start.y + offset}, ${
          end.x
        } ${end.y - offset}, ${end.x} ${end.y}`;
      }
    } else if (shape === "step") {
      const midX = (start.x + end.x) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  const getPointsPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    return (
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ")
    );
  };

  // --- Shape Rendering Logic ---
  const renderNodeShape = (node: Node, isSelected: boolean) => {
    const isLabel = node.type === "label";
    const isText = node.type === "text";
    const isSticker = node.type === "sticker";
    const isZone = node.type === "zone";

    // Border Styling Logic
    const defaultBorderColor = node.groupId ? "#94a3b8" : "#cbd5e1";
    const customBorderColor = node.borderColor || defaultBorderColor;
    const customBorderWidth = node.borderWidth || (isZone ? 2 : 1);
    const customBorderStyle = node.borderStyle || "solid";

    // Selection Overrides
    const strokeColor = isSelected
      ? DIAGRAM_COLORS.selected
      : customBorderColor;
    const strokeWidth = isSelected
      ? Math.max(3, customBorderWidth + 1)
      : customBorderWidth;

    let strokeDasharray = "0";
    if (isZone) {
      strokeDasharray = "8 4";
    } else if (customBorderStyle === "dashed") {
      strokeDasharray = "8 4";
    } else if (customBorderStyle === "dotted") {
      strokeDasharray = "2 2";
    } else if (customBorderStyle === "none") {
      // If none, we still show stroke if selected, otherwise opacity 0
      strokeDasharray = "0";
    }

    const strokeOpacity = !isSelected && customBorderStyle === "none" ? 0 : 1;

    const fill = node.color || "white";

    const { w, h } = getNodeDimensions(node);

    // Force specific styles based on diagram type if shape isn't explicitly set
    let shape = node.shape || "rect";
    if (diagramType === "Mapa Mental" && node.type === "root") shape = "pill";
    if (
      diagramType === "Ishikawa" &&
      node.type !== "label" &&
      node.type !== "text" &&
      !isSticker &&
      !isZone
    )
      shape = "rect";
    if (
      diagramType === "5W2H" &&
      node.type !== "label" &&
      node.type !== "text" &&
      !isSticker &&
      !isZone
    )
      shape = "rect";

    const halfW = w / 2;
    const halfH = h / 2;

    // Render resize handles if selected
    const renderHandles = () => {
      if (!isSelected || node.locked) return null;
      const handleSize = 8;
      const offset = handleSize / 2;
      return (
        <g className="resize-handles">
          <rect
            x={-halfW - offset}
            y={-halfH - offset}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={1}
            className="cursor-nw-resize hover:fill-blue-100"
            onMouseDown={(e) => onResizeStart(e, node.id, "nw")}
          />
          <rect
            x={halfW - offset}
            y={-halfH - offset}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={1}
            className="cursor-ne-resize hover:fill-blue-100"
            onMouseDown={(e) => onResizeStart(e, node.id, "ne")}
          />
          <rect
            x={halfW - offset}
            y={halfH - offset}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={1}
            className="cursor-se-resize hover:fill-blue-100"
            onMouseDown={(e) => onResizeStart(e, node.id, "se")}
          />
          <rect
            x={-halfW - offset}
            y={halfH - offset}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={1}
            className="cursor-sw-resize hover:fill-blue-100"
            onMouseDown={(e) => onResizeStart(e, node.id, "sw")}
          />
        </g>
      );
    };

    if (isZone) {
      return (
        <g>
          <rect
            x={-halfW}
            y={-halfH}
            width={w}
            height={h}
            fill={fill === "transparent" ? "transparent" : fill}
            fillOpacity={0.2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeOpacity={strokeOpacity}
            rx={16}
            className="cursor-move"
          />
          {renderHandles()}
        </g>
      );
    }

    if (isSticker) {
      if (node.backgroundImage) {
        return (
          <g>
            <image
              href={node.backgroundImage}
              x={-halfW}
              y={-halfH}
              width={w}
              height={h}
              preserveAspectRatio="none"
              className="cursor-move"
            />
            {/* Border for selection feedback */}
            <rect
              x={-halfW}
              y={-halfH}
              width={w}
              height={h}
              fill="transparent"
              stroke={isSelected ? DIAGRAM_COLORS.selected : "none"}
              strokeWidth={2}
              pointerEvents="none"
            />
            {renderHandles()}
          </g>
        );
      }

      return (
        <g>
          <rect
            x={-halfW}
            y={-halfH}
            width={w}
            height={h}
            fill="transparent"
            stroke={isSelected ? DIAGRAM_COLORS.selected : "none"}
            strokeWidth={2}
            className="cursor-move"
          />
          {renderHandles()}
        </g>
      );
    }

    if (isLabel || isText) {
      // Determine visual fill and stroke for text nodes
      const hasFill = node.color && node.color !== "transparent";
      const visualFill = hasFill
        ? node.color
        : isSelected
        ? "rgba(255,255,255,0.5)"
        : "transparent";

      // For Text nodes, we respect custom border settings if set, otherwise transparent unless selected
      let textStrokeColor = strokeColor;
      let textStrokeWidth = strokeWidth;

      if (!isSelected) {
        if (
          customBorderStyle !== "none" &&
          (node.borderColor || node.borderWidth)
        ) {
          // User specifically set border props
        } else if (!hasFill) {
          // Default text node: no border
          textStrokeColor = "transparent";
        } else {
          textStrokeColor = "#e2e8f0";
        }
      }

      return (
        <g>
          <rect
            x={-halfW}
            y={-halfH}
            width={w}
            height={h}
            fill={visualFill}
            stroke={textStrokeColor}
            strokeWidth={textStrokeWidth}
            strokeDasharray={strokeDasharray}
            strokeOpacity={strokeOpacity}
            rx={4}
            className="cursor-text"
          />
          {renderHandles()}
        </g>
      );
    }

    let shapeEl;
    const commonProps = {
      fill: fill,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeDasharray: strokeDasharray,
      strokeOpacity: strokeOpacity,
      className: "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
    };

    switch (shape) {
      case "diamond":
        shapeEl = (
          <polygon
            points={`0,${-halfH} ${halfW},0 0,${halfH} ${-halfW},0`}
            {...commonProps}
          />
        );
        break;
      case "circle":
        shapeEl = <ellipse rx={halfW} ry={halfH} {...commonProps} />;
        break;
      case "pill":
        shapeEl = (
          <rect
            x={-halfW}
            y={-halfH}
            width={w}
            height={h}
            rx={Math.min(w, h) / 2}
            {...commonProps}
          />
        );
        break;
      case "triangle":
        shapeEl = (
          <polygon
            points={`0,${-halfH} ${halfW},${halfH} ${-halfW},${halfH}`}
            {...commonProps}
          />
        );
        break;
      case "hexagon":
        shapeEl = (
          <polygon
            points={`${-halfW},0 ${-halfW * 0.5},${-halfH} ${
              halfW * 0.5
            },${-halfH} ${halfW},0 ${halfW * 0.5},${halfH} ${
              -halfW * 0.5
            },${halfH}`}
            {...commonProps}
          />
        );
        break;
      case "parallelogram":
        const skew = w * 0.2;
        shapeEl = (
          <polygon
            points={`${-halfW + skew},${-halfH} ${halfW},${-halfH} ${
              halfW - skew
            },${halfH} ${-halfW},${halfH}`}
            {...commonProps}
          />
        );
        break;
      case "star":
        const sX = halfW;
        const sY = halfH;
        const starPath = `M 0 ${-sY} L ${sX * 0.22} ${-sY * 0.31} L ${
          sX * 0.95
        } ${-sY * 0.31} L ${sX * 0.36} ${sY * 0.12} L ${sX * 0.59} ${
          sY * 0.81
        } L 0 ${sY * 0.38} L ${-sX * 0.59} ${sY * 0.81} L ${-sX * 0.36} ${
          sY * 0.12
        } L ${-sX * 0.95} ${-sY * 0.31} L ${-sX * 0.22} ${-sY * 0.31} Z`;

        shapeEl = <path d={starPath} {...commonProps} />;
        break;
      case "cylinder":
        shapeEl = (
          <g className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <path
              d={`M ${-halfW},${-halfH + 10} L ${-halfW},${halfH - 10} Q ${0},${
                halfH + 10
              } ${halfW},${halfH - 10} L ${halfW},${-halfH + 10} Q ${0},${
                -halfH + 30
              } ${-halfW},${-halfH + 10}`}
              {...commonProps}
            />
            <ellipse
              cx={0}
              cy={-halfH + 10}
              rx={halfW}
              ry={10}
              {...commonProps}
              fillOpacity={commonProps.fill === "transparent" ? 0 : 0.5} // slightly darken top
              strokeWidth={Math.min(strokeWidth, 1)}
            />
          </g>
        );
        break;
      case "cloud":
        const cW = halfW;
        const cH = halfH;
        const cloudPath = `
            M ${-cW * 0.5} ${cH * 0.6} 
            Q ${-cW} ${cH * 0.6} ${-cW} ${0} 
            Q ${-cW} ${-cH} ${-cW * 0.2} ${-cH * 0.8} 
            Q ${0} ${-cH * 1.4} ${cW * 0.4} ${-cH * 0.8} 
            Q ${cW} ${-cH} ${cW} ${0} 
            Q ${cW} ${cH * 0.6} ${cW * 0.5} ${cH * 0.6} 
            Z
         `;
        shapeEl = <path d={cloudPath} {...commonProps} />;
        break;
      case "document":
        const waveHeight = 10;
        shapeEl = (
          <path
            d={`M ${-halfW},${-halfH} L ${halfW},${-halfH} L ${halfW},${
              halfH - waveHeight
            } Q ${halfW * 0.5},${halfH + waveHeight} ${0},${
              halfH - waveHeight
            } Q ${-halfW * 0.5},${halfH - waveHeight * 3} ${-halfW},${
              halfH - waveHeight
            } Z`}
            {...commonProps}
          />
        );
        break;
      case "rect":
      default:
        shapeEl = (
          <rect
            x={-halfW}
            y={-halfH}
            width={w}
            height={h}
            rx={diagramType === "Ishikawa" ? 0 : 6}
            {...commonProps}
          />
        );
    }

    return (
      <g>
        {shapeEl}
        {renderHandles()}
      </g>
    );
  };

  // --- Background Templates (Lines only) ---
  const renderBackgroundTemplate = () => {
    const lineStyle = {
      stroke: "#e2e8f0",
      strokeWidth: 4,
      strokeDasharray: "8 8",
    };
    const solidLineStyle = { stroke: "#cbd5e1", strokeWidth: 3 };

    if (diagramType === "SWOT") {
      return (
        <g>
          <line x1={0} y1={-400} x2={0} y2={400} {...lineStyle} />
          <line x1={-600} y1={0} x2={600} y2={0} {...lineStyle} />
        </g>
      );
    }

    if (diagramType === "Business Model Canvas") {
      const borderColor = "#e2e8f0";
      return (
        <g transform="translate(-500, -300)">
          {/* Outline */}
          <rect
            x={0}
            y={0}
            width={1000}
            height={600}
            fill="none"
            stroke={borderColor}
            strokeWidth={4}
            rx={10}
          />
          {/* Vertical Lines */}
          <line
            x1={200}
            y1={0}
            x2={200}
            y2={400}
            stroke={borderColor}
            strokeWidth={2}
          />
          <line
            x1={400}
            y1={0}
            x2={400}
            y2={600}
            stroke={borderColor}
            strokeWidth={2}
          />
          <line
            x1={600}
            y1={0}
            x2={600}
            y2={400}
            stroke={borderColor}
            strokeWidth={2}
          />
          <line
            x1={800}
            y1={0}
            x2={800}
            y2={600}
            stroke={borderColor}
            strokeWidth={2}
          />
          {/* Horizontal Lines */}
          <line
            x1={0}
            y1={400}
            x2={1000}
            y2={400}
            stroke={borderColor}
            strokeWidth={2}
          />
          <line
            x1={200}
            y1={200}
            x2={400}
            y2={200}
            stroke={borderColor}
            strokeWidth={2}
          />
          <line
            x1={600}
            y1={200}
            x2={800}
            y2={200}
            stroke={borderColor}
            strokeWidth={2}
          />
        </g>
      );
    }

    if (diagramType === "Ishikawa") {
      return (
        <g>
          <line
            x1={-600}
            y1={0}
            x2={600}
            y2={0}
            stroke="#94a3b8"
            strokeWidth={6}
            markerEnd="url(#spineArrow)"
          />
          <defs>
            <marker
              id="spineArrow"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M2,2 L10,6 L2,10 L2,2" fill="#94a3b8" />
            </marker>
          </defs>
        </g>
      );
    }

    if (diagramType === "5W2H") {
      const colWidth = 220;
      const startX = -((7 * colWidth) / 2);
      const headerY = -150;

      return (
        <g>
          <line
            x1={startX}
            y1={headerY + 50}
            x2={startX + 7 * colWidth}
            y2={headerY + 50}
            {...solidLineStyle}
          />
          {Array.from({ length: 7 }).map((_, i) => {
            const x = startX + i * colWidth;
            return i > 0 ? (
              <line
                key={i}
                x1={x}
                y1={headerY}
                x2={x}
                y2={400}
                stroke="#e2e8f0"
                strokeWidth={2}
              />
            ) : null;
          })}
        </g>
      );
    }

    return null;
  };

  return (
    <div
      className="w-full h-full overflow-hidden bg-slate-50 relative"
      style={{ cursor: cursor }}
      onMouseMove={onMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={onWheel}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <style>{`
        @keyframes flowAnimation {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .conn-flow {
          animation: flowAnimation 1s linear infinite;
        }
      `}</style>
      <svg id="diagram-svg" className="w-full h-full block pointer-events-none">
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          className="pointer-events-auto"
        >
          {renderBackgroundTemplate()}

          {/* Saved Highlighter Paths */}
          {paths.map((path) => (
            <path
              key={path.id}
              d={getPointsPath(path.points)}
              fill="none"
              stroke={path.color}
              strokeWidth={path.thickness}
              strokeOpacity={path.opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          ))}

          {/* Active Drawing Path */}
          {draftPath && (
            <path
              d={getPointsPath(draftPath)}
              fill="none"
              stroke={highlighterColor}
              strokeWidth={highlighterThickness}
              strokeOpacity={0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}

          {connections.map((conn) => {
            const from = nodes.find((n) => n.id === conn.from);
            const to = nodes.find((n) => n.id === conn.to);
            if (!from || !to || from.hidden || to.hidden) return null;

            const isSelected = selectedConnectionId === conn.id;
            const strokeColor = isSelected
              ? DIAGRAM_COLORS.selected
              : conn.color || DIAGRAM_COLORS.connection;
            const strokeWidth = conn.thickness || 2;

            // Calculate effective markers and path points
            const effectiveEndMarker =
              conn.endMarker ||
              (diagramType === "Flowchart" ? "arrow" : "none");
            const effectiveStartMarker = conn.startMarker || "none";

            // Calculate edge points
            const startPt = getIntersection(from, to);
            const endPt = getIntersection(to, from);
            const pathData = getConnectionPath(conn, startPt, endPt);

            // If animated, force dash, otherwise use style
            const dashArray = conn.animated
              ? "8 4"
              : conn.style === "dashed"
              ? "8 8"
              : conn.style === "dotted"
              ? "2 2"
              : "0";

            // Markers IDs
            const startMarkerId = `marker-start-${conn.id}`;
            const endMarkerId = `marker-end-${conn.id}`;

            return (
              <g key={conn.id}>
                <defs>
                  {effectiveEndMarker === "arrow" && (
                    <marker
                      id={endMarkerId}
                      markerWidth="10"
                      markerHeight="7"
                      refX={9}
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
                    </marker>
                  )}
                  {effectiveEndMarker === "circle" && (
                    <marker
                      id={endMarkerId}
                      markerWidth="8"
                      markerHeight="8"
                      refX={4}
                      refY="4"
                      orient="auto"
                    >
                      <circle cx="4" cy="4" r="3" fill={strokeColor} />
                    </marker>
                  )}
                  {effectiveStartMarker === "arrow" && (
                    <marker
                      id={startMarkerId}
                      markerWidth="10"
                      markerHeight="7"
                      refX={1}
                      refY="3.5"
                      orient="auto-start-reverse"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
                    </marker>
                  )}
                  {effectiveStartMarker === "circle" && (
                    <marker
                      id={startMarkerId}
                      markerWidth="8"
                      markerHeight="8"
                      refX={4}
                      refY="4"
                      orient="auto"
                    >
                      <circle cx="4" cy="4" r="3" fill={strokeColor} />
                    </marker>
                  )}
                </defs>

                {/* Visible Path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  opacity={isSelected ? 1 : 0.8}
                  pointerEvents="none"
                  className={conn.animated ? "conn-flow" : ""}
                  markerStart={
                    effectiveStartMarker !== "none"
                      ? `url(#${startMarkerId})`
                      : undefined
                  }
                  markerEnd={
                    effectiveEndMarker !== "none"
                      ? `url(#${endMarkerId})`
                      : undefined
                  }
                />
                {/* Hit Area */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={Math.max(15, strokeWidth + 10)}
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown(e, undefined, conn.id);
                  }}
                />
              </g>
            );
          })}

          {/* Draft Connection Line */}
          {connectingStartNodeId &&
            connectionDragPos &&
            (() => {
              const startNode = nodes.find(
                (n) => n.id === connectingStartNodeId
              );
              if (startNode) {
                const startPt = getIntersection(startNode, connectionDragPos);
                return (
                  <line
                    x1={startPt.x}
                    y1={startPt.y}
                    x2={connectionDragPos.x}
                    y2={connectionDragPos.y}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    pointerEvents="none"
                  />
                );
              }
              return null;
            })()}

          {nodes.map((node) => {
            if (node.hidden) return null;

            const isSelected = isNodeSelected(node.id);
            const isEditing = editingNode === node.id;
            const isSticker = node.type === "sticker";
            const isZone = node.type === "zone";

            const fontSizeValue = node.fontSize
              ? `${node.fontSize}px`
              : node.type === "label" || node.type === "text"
              ? "20px"
              : "12px";
            const fontWeightValue =
              node.fontWeight ||
              (node.type === "label" || node.type === "text" || isZone
                ? "bold"
                : "normal");
            const fontFamilyValue = node.fontFamily || "Inter, sans-serif";
            const textAlignValue =
              node.textAlign || (isZone ? "left" : "center");
            const fontStyleValue = node.fontStyle || "normal";
            const textDecorationValue = node.textDecoration || "none";

            const { w, h } = getNodeDimensions(node);
            const {
              x: tx,
              y: ty,
              w: tw,
              h: th,
            } = getSafeTextDimensions(node, w, h);

            const stickerFontSize = isSticker
              ? `${Math.min(w, h) * 0.7}px`
              : fontSizeValue;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="transition-transform duration-75 ease-out"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, node.id);
                }}
                onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onDoubleClick(node.id, node.x, node.y, node.text);
                }}
                style={{
                  cursor: node.locked
                    ? "default"
                    : connectingStartNodeId
                    ? "crosshair"
                    : "pointer",
                }}
              >
                {node.groupId &&
                  node.type !== "label" &&
                  node.type !== "text" &&
                  !isSticker &&
                  !isZone && (
                    <rect
                      x={-w / 2 - 5}
                      y={-h / 2 - 5}
                      width={w + 10}
                      height={h + 10}
                      rx={8}
                      fill="none"
                      stroke={isSelected ? "transparent" : "#e2e8f0"}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  )}

                {renderNodeShape(node, isSelected)}

                {(!isSticker || (isSticker && !node.backgroundImage)) &&
                  (isEditing ? (
                    <foreignObject
                      x={tx}
                      y={ty}
                      width={tw}
                      height={th}
                      className="pointer-events-none"
                    >
                      <div
                        className={`w-full h-full flex ${
                          isZone ? "items-start" : "items-center justify-center"
                        } pointer-events-auto ${
                          node.type === "label" || node.type === "text"
                            ? ""
                            : "p-2"
                        }`}
                      >
                        <textarea
                          autoFocus
                          onFocus={(e) => e.currentTarget.select()}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={onFinishEditing}
                          onKeyDown={handleKeyDown}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full bg-transparent border-none outline-none resize-none overflow-hidden leading-snug p-1 h-full"
                          style={{
                            textAlign: textAlignValue,
                            fontSize: stickerFontSize,
                            fontWeight: fontWeightValue,
                            fontFamily: isSticker
                              ? '"Segoe UI Emoji", "Apple Color Emoji", sans-serif'
                              : fontFamilyValue,
                            color: node.textColor || "#334155",
                            fontStyle: fontStyleValue,
                            textDecoration: textDecorationValue,
                          }}
                        />
                      </div>
                    </foreignObject>
                  ) : (
                    <foreignObject
                      x={tx}
                      y={ty}
                      width={tw}
                      height={th}
                      style={{ pointerEvents: "none" }}
                    >
                      <div
                        className={`w-full h-full flex ${
                          isZone ? "items-start" : "items-center"
                        } ${
                          node.type === "label" || node.type === "text"
                            ? ""
                            : "p-2"
                        }`}
                        style={{
                          display: "flex",
                          justifyContent: isZone ? "flex-start" : "center",
                          alignItems: isZone ? "flex-start" : "center",
                          textAlign: textAlignValue,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <span
                          style={{
                            width: "100%",
                            display: "block",
                            fontSize: stickerFontSize,
                            fontWeight: fontWeightValue,
                            fontFamily: isSticker
                              ? '"Segoe UI Emoji", "Apple Color Emoji", sans-serif'
                              : fontFamilyValue,
                            color: node.textColor || "#334155",
                            userSelect: "none",
                            opacity: node.locked ? 0.8 : 1,
                            fontStyle: fontStyleValue,
                            textDecoration: textDecorationValue,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            textTransform: isZone ? "uppercase" : "none",
                            letterSpacing: isZone ? "0.05em" : "normal",
                          }}
                        >
                          {node.text}
                        </span>
                      </div>
                    </foreignObject>
                  ))}
              </g>
            );
          })}

          {selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}

          {selectionPath && selectionPath.length > 1 && (
            <polygon
              points={selectionPath.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}
        </g>
      </svg>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur p-2 rounded-lg shadow border text-xs text-slate-500 pointer-events-none select-none">
        {Math.round(zoom * 100)}% Zoom
        <span className="mx-2">|</span>
        Double-click para editar texto
      </div>
    </div>
  );
};

export default DiagramCanvas;
