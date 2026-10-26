'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import { subscribeMediaLoaded } from '@/utils/thinklab/media-cache';

// Elementos de mídia não recebem texto pelo duplo clique
const MEDIA_TYPES = new Set(['emoji', 'icon', 'image']);
import {
  CanvasElement,
  Point,
  ResizeHandle,
  ToolType,
  ViewportState,
  SelectionBox,
} from '@/types/thinklab.types';
import {
  renderElementToCanvas,
  findClosestPort,
  getShapePorts,
  getBezierControlPoints,
} from '@/utils/thinklab/rough-renderer';
import { computeSmartSnapping, SnapGuide } from '@/utils/thinklab/smart-snapping';

interface CanvasProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[], recordHistory?: boolean) => void;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  activeTool: ToolType;
  onToolUsed: () => void;
  defaultStyles: Record<string, unknown>;
  viewport: ViewportState;
  onViewportChange: (viewport: ViewportState) => void;
  gridType: 'dots' | 'lines' | 'none';
  onDropComponent?: (template: Record<string, unknown>, dropPoint: Point) => void;
  smartSnappingEnabled?: boolean;
  /** Notificado quando a área do canvas muda de tamanho (painéis abrindo/fechando, janela). */
  onResize?: (size: { width: number; height: number }) => void;
}

export function Canvas({
  elements,
  onElementsChange,
  selectedIds,
  onSelectIds,
  activeTool,
  onToolUsed,
  defaultStyles,
  viewport,
  onViewportChange,
  gridType,
  onDropComponent,
  smartSnappingEnabled = true,
  onResize,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Redesenha quando o container muda de tamanho (o canvas ocupa a coluna central do editor)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Redesenha quando imagens/ícones terminam de carregar
  const [mediaTick, setMediaTick] = useState(0);
  useEffect(() => subscribeMediaLoaded(() => setMediaTick((n) => n + 1)), []);
  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const size = {
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      };
      setContainerSize(size);
      onResizeRef.current?.(size);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Interaction states
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Creation & manipulation states
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingElement, setDrawingElement] = useState<CanvasElement | null>(null);
  
  // Multi-element dragging state
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [dragInitialPositions, setDragInitialPositions] = useState<Record<string, Point>>({});

  // Resize state (for single element)
  const [activeResizeHandle, setActiveResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeInitialElement, setResizeInitialElement] = useState<CanvasElement | null>(null);
  const [resizeStartPoint, setResizeStartPoint] = useState<Point>({ x: 0, y: 0 });

  // Advanced control handle dragging (for Bézier & Path vertices)
  const [activeControlTarget, setActiveControlTarget] = useState<
    | { type: 'bezier-cp1' }
    | { type: 'bezier-cp2' }
    | { type: 'path-vertex'; index: number }
    | null
  >(null);

  // Multi-step path drawing
  const [inProgressPathPoints, setInProgressPathPoints] = useState<Point[] | null>(null);

  // Inline text editing state
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Selection box state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Snap port highlight
  const [hoveredPort, setHoveredPort] = useState<{ x: number; y: number } | null>(null);

  // Smart snapping guides
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

  // Multi-touch gestures tracking for mobile pinch-to-zoom and pan
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const initialPinchDistanceRef = useRef<number>(1);
  const initialPinchZoomRef = useRef<number>(1);
  const initialPinchCenterRef = useRef<Point>({ x: 0, y: 0 });
  const initialPinchPanRef = useRef<Point>({ x: 0, y: 0 });
  const isTouchPinchingRef = useRef<boolean>(false);

  // Convert screen to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: screenX, y: screenY };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (screenX - rect.left - viewport.panX) / viewport.zoom,
        y: (screenY - rect.top - viewport.panY) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Hit test for element
  const getElementAtPosition = useCallback(
    (pt: Point): CanvasElement | null => {
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        const minX = Math.min(el.x, el.x + el.width);
        const maxX = Math.max(el.x, el.x + el.width);
        const minY = Math.min(el.y, el.y + el.height);
        const maxY = Math.max(el.y, el.y + el.height);

        if (el.type === 'line' || el.type === 'arrow') {
          const x1 = el.x;
          const y1 = el.y;
          const x2 = el.x + el.width;
          const y2 = el.y + el.height;
          const lineLen = Math.hypot(x2 - x1, y2 - y1);
          if (lineLen === 0) continue;
          const dist =
            Math.abs((y2 - y1) * pt.x - (x2 - x1) * pt.y + x2 * y1 - y2 * x1) / lineLen;
          const withinBounds =
            pt.x >= minX - 10 && pt.x <= maxX + 10 && pt.y >= minY - 10 && pt.y <= maxY + 10;
          if (dist <= 12 && withinBounds) return el;
        } else if (el.type === 'bezier') {
          const { cp1, cp2 } = getBezierControlPoints(el);
          const bMinX = Math.min(minX, cp1.x, cp2.x) - 15;
          const bMaxX = Math.max(maxX, cp1.x, cp2.x) + 15;
          const bMinY = Math.min(minY, cp1.y, cp2.y) - 15;
          const bMaxY = Math.max(maxY, cp1.y, cp2.y) + 15;
          if (pt.x >= bMinX && pt.x <= bMaxX && pt.y >= bMinY && pt.y <= bMaxY) {
            return el;
          }
        } else if (el.type === 'path' || el.type === 'freedraw') {
          if (el.points && el.points.length > 0) {
            let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
            el.points.forEach((p) => {
              pMinX = Math.min(pMinX, el.x + p.x);
              pMaxX = Math.max(pMaxX, el.x + p.x);
              pMinY = Math.min(pMinY, el.y + p.y);
              pMaxY = Math.max(pMaxY, el.y + p.y);
            });
            if (pt.x >= pMinX - 12 && pt.x <= pMaxX + 12 && pt.y >= pMinY - 12 && pt.y <= pMaxY + 12) {
              return el;
            }
          }
        } else {
          if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) {
            return el;
          }
        }
      }
      return null;
    },
    [elements]
  );

  // Resize handles positions for a single element
  const getResizeHandles = (el: CanvasElement): Record<ResizeHandle, Point> => {
    const minX = Math.min(el.x, el.x + el.width);
    const maxX = Math.max(el.x, el.x + el.width);
    const minY = Math.min(el.y, el.y + el.height);
    const maxY = Math.max(el.y, el.y + el.height);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    return {
      nw: { x: minX, y: minY },
      n: { x: midX, y: minY },
      ne: { x: maxX, y: minY },
      e: { x: maxX, y: midY },
      se: { x: maxX, y: maxY },
      s: { x: midX, y: maxY },
      sw: { x: minX, y: maxY },
      w: { x: minX, y: midY },
    };
  };

  const getResizeHandleAtPosition = (pt: Point, el: CanvasElement, isTouch = false): ResizeHandle | null => {
    const handles = getResizeHandles(el);
    const threshold = (isTouch ? 22 : 10) / viewport.zoom;

    for (const [handle, handlePt] of Object.entries(handles)) {
      if (Math.hypot(pt.x - handlePt.x, pt.y - handlePt.y) <= threshold) {
        return handle as ResizeHandle;
      }
    }
    return null;
  };

  // Helper to expand an array of IDs to include any elements sharing the same group
  const expandGroupMembers = useCallback(
    (ids: string[]): string[] => {
      const result = new Set<string>(ids);
      ids.forEach((id) => {
        const el = elements.find((e) => e.id === id);
        if (el && el.groupId) {
          elements
            .filter((peer) => peer.groupId === el.groupId)
            .forEach((peer) => result.add(peer.id));
        }
      });
      return Array.from(result);
    },
    [elements]
  );

  const finishPathDrawing = useCallback(() => {
    if (!inProgressPathPoints || inProgressPathPoints.length < 3) {
      setInProgressPathPoints(null);
      return;
    }

    const firstPt = inProgressPathPoints[0];
    const relPoints = inProgressPathPoints.map((p) => ({
      x: p.x - firstPt.x,
      y: p.y - firstPt.y,
    }));

    let maxW = 0, maxH = 0;
    relPoints.forEach((p) => {
      maxW = Math.max(maxW, Math.abs(p.x));
      maxH = Math.max(maxH, Math.abs(p.y));
    });

    const newPathEl: CanvasElement = {
      id: `path-${Date.now()}`,
      type: 'path',
      x: firstPt.x,
      y: firstPt.y,
      width: Math.max(40, maxW),
      height: Math.max(40, maxH),
      points: relPoints,
      isClosed: true,
      strokeColor: (defaultStyles.strokeColor as string) || '#7c3aed',
      backgroundColor: (defaultStyles.backgroundColor as string) || '#ede9fe',
      fillStyle: (defaultStyles.fillStyle as any) || 'hachure',
      strokeWidth: (defaultStyles.strokeWidth as number) || 2,
      strokeStyle: (defaultStyles.strokeStyle as any) || 'solid',
      roughness: (defaultStyles.roughness as number) || 1.3,
      opacity: 1,
      text: '',
      fontSize: 16,
      fontFamily: 'Patrick Hand',
      textAlign: 'center',
      zIndex: elements.length + 1,
    };

    onElementsChange([...elements, newPathEl], true);
    onSelectIds([newPathEl.id]);
    setInProgressPathPoints(null);
    onToolUsed();
  }, [inProgressPathPoints, defaultStyles, elements, onElementsChange, onSelectIds, onToolUsed]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingElementId) return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }

      if (e.key === 'Enter' && inProgressPathPoints && inProgressPathPoints.length >= 3) {
        finishPathDrawing();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingElementId, inProgressPathPoints, finishPathDrawing]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Draw grid if active
    if (gridType !== 'none') {
      const gridSize = 24;
      const startX = Math.floor(-viewport.panX / viewport.zoom / gridSize) * gridSize - gridSize;
      const endX = startX + (width / viewport.zoom) + gridSize * 2;
      const startY = Math.floor(-viewport.panY / viewport.zoom / gridSize) * gridSize - gridSize;
      const endY = startY + (height / viewport.zoom) + gridSize * 2;

      ctx.save();
      if (gridType === 'dots') {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
        for (let x = startX; x <= endX; x += gridSize) {
          for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 1 / viewport.zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (gridType === 'lines') {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
        ctx.lineWidth = 1 / viewport.zoom;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
          ctx.moveTo(x, startY);
          ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += gridSize) {
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    const rc = rough.canvas(canvas);

    // Render all elements sorted by zIndex
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((el) => {
      renderElementToCanvas(ctx, rc, el);
    });

    // Render currently drawing element in progress
    if (drawingElement) {
      renderElementToCanvas(ctx, rc, drawingElement);
    }

    // Render in-progress path points
    if (inProgressPathPoints && inProgressPathPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2 / viewport.zoom;
      ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
      ctx.beginPath();
      inProgressPathPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      inProgressPathPoints.forEach((p) => {
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 / viewport.zoom, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Render selection bounding box & handles
    const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
    if (selectedElements.length > 0 && activeTool === 'select' && !editingElementId) {
      // Calculate collective bounds
      let bMinX = Infinity, bMaxX = -Infinity, bMinY = Infinity, bMaxY = -Infinity;
      selectedElements.forEach((el) => {
        const elMinX = Math.min(el.x, el.x + el.width);
        const elMaxX = Math.max(el.x, el.x + el.width);
        const elMinY = Math.min(el.y, el.y + el.height);
        const elMaxY = Math.max(el.y, el.y + el.height);
        bMinX = Math.min(bMinX, elMinX);
        bMaxX = Math.max(bMaxX, elMaxX);
        bMinY = Math.min(bMinY, elMinY);
        bMaxY = Math.max(bMaxY, elMaxY);
      });

      const pad = 6;
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5 / viewport.zoom;
      ctx.setLineDash([4 / viewport.zoom, 4 / viewport.zoom]);
      ctx.strokeRect(bMinX - pad, bMinY - pad, bMaxX - bMinX + pad * 2, bMaxY - bMinY + pad * 2);
      ctx.setLineDash([]);

      // Group badge or multi-selection badge
      if (selectedElements.length > 1) {
        const isUnifiedGroup = selectedElements.every((e) => e.groupId && e.groupId === selectedElements[0].groupId);
        ctx.fillStyle = isUnifiedGroup ? '#2563eb' : '#3b82f6';
        const badgeWidth = (isUnifiedGroup ? 70 : 96) / viewport.zoom;
        const badgeHeight = 18 / viewport.zoom;
        ctx.fillRect(bMinX - pad, bMinY - pad - badgeHeight, badgeWidth, badgeHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, 11 / viewport.zoom)}px sans-serif`;
        ctx.fillText(
          isUnifiedGroup ? '❖ Grupo' : `${selectedElements.length} itens`,
          bMinX - pad + 6 / viewport.zoom,
          bMinY - pad - 5 / viewport.zoom
        );
      } else {
        // Single element handles
        const single = selectedElements[0];
        if (single.type !== 'bezier' && single.type !== 'path') {
          const handleSize = 7 / viewport.zoom;
          const handles = getResizeHandles(single);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5 / viewport.zoom;

          Object.values(handles).forEach((h) => {
            ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          });
        }

        if (single.type === 'bezier') {
          const { p0, cp1, cp2, p3 } = getBezierControlPoints(single);
          ctx.strokeStyle = '#9333ea';
          ctx.lineWidth = 1 / viewport.zoom;
          ctx.setLineDash([3 / viewport.zoom, 3 / viewport.zoom]);
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(cp1.x, cp1.y);
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(cp2.x, cp2.y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#c084fc';
          ctx.strokeStyle = '#7e22ce';
          ctx.lineWidth = 2 / viewport.zoom;
          ctx.beginPath();
          ctx.arc(cp1.x, cp1.y, 6 / viewport.zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fcd34d';
          ctx.strokeStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(cp2.x, cp2.y, 6 / viewport.zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        if (single.type === 'path' && single.points) {
          ctx.fillStyle = '#6366f1';
          ctx.strokeStyle = '#312e81';
          ctx.lineWidth = 1.5 / viewport.zoom;
          single.points.forEach((p) => {
            const vx = single.x + p.x;
            const vy = single.y + p.y;
            ctx.beginPath();
            ctx.arc(vx, vy, 5 / viewport.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        }
      }

      ctx.restore();
    }

    // Render Smart Snapping alignment guide lines
    if (snapGuides.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#e11d48'; // Vivid magenta/rose alignment guide line
      ctx.lineWidth = 1.4 / viewport.zoom;
      ctx.setLineDash([4 / viewport.zoom, 4 / viewport.zoom]);

      snapGuides.forEach((guide) => {
        ctx.beginPath();
        if (guide.type === 'x') {
          ctx.moveTo(guide.coordinate, guide.start);
          ctx.lineTo(guide.coordinate, guide.end);
        } else {
          ctx.moveTo(guide.start, guide.coordinate);
          ctx.lineTo(guide.end, guide.coordinate);
        }
        ctx.stroke();

        // Draw small diamond/crosshair markers at guide endpoints
        ctx.save();
        ctx.fillStyle = '#e11d48';
        ctx.setLineDash([]);
        const markerSize = 3.5 / viewport.zoom;
        if (guide.type === 'x') {
          ctx.fillRect(guide.coordinate - markerSize, guide.start - markerSize, markerSize * 2, markerSize * 2);
          ctx.fillRect(guide.coordinate - markerSize, guide.end - markerSize, markerSize * 2, markerSize * 2);
        } else {
          ctx.fillRect(guide.start - markerSize, guide.coordinate - markerSize, markerSize * 2, markerSize * 2);
          ctx.fillRect(guide.end - markerSize, guide.coordinate - markerSize, markerSize * 2, markerSize * 2);
        }
        ctx.restore();
      });
      ctx.restore();
    }

    // Render hover snap indicator when drawing arrows
    if (hoveredPort) {
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.lineWidth = 2 / viewport.zoom;
      ctx.beginPath();
      ctx.arc(hoveredPort.x, hoveredPort.y, 8 / viewport.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Render selection rectangle box
    if (selectionBox) {
      ctx.save();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 1 / viewport.zoom;
      const boxX = Math.min(selectionBox.startX, selectionBox.endX);
      const boxY = Math.min(selectionBox.startY, selectionBox.endY);
      const boxW = Math.abs(selectionBox.endX - selectionBox.startX);
      const boxH = Math.abs(selectionBox.endY - selectionBox.startY);
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.restore();
    }

    ctx.restore();
  }, [
    elements,
    drawingElement,
    inProgressPathPoints,
    selectedIds,
    viewport,
    gridType,
    activeTool,
    editingElementId,
    hoveredPort,
    selectionBox,
    snapGuides,
    containerSize,
    mediaTick,
  ]);

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    // Multi-touch gestures tracking for mobile pinch-to-zoom and two-finger pan
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    if (activePointersRef.current.size === 2) {
      setIsDrawing(false);
      setDrawingElement(null);
      setIsDraggingElements(false);
      setSelectionBox(null);
      setActiveResizeHandle(null);
      setActiveControlTarget(null);
      setSnapGuides([]);

      isTouchPinchingRef.current = true;
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      initialPinchDistanceRef.current = dist > 0 ? dist : 1;
      initialPinchZoomRef.current = viewport.zoom;
      initialPinchPanRef.current = { x: viewport.panX, y: viewport.panY };
      initialPinchCenterRef.current = {
        x: (pts[0].clientX + pts[1].clientX) / 2,
        y: (pts[0].clientY + pts[1].clientY) / 2,
      };
      return;
    }

    if (activePointersRef.current.size > 2) {
      return;
    }

    // Hand tool (Pan) or Middle Mouse Button or Space + Left Click
    if (activeTool === 'hand' || e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
      return;
    }

    if (e.button !== 0) return;

    const pt = screenToCanvas(e.clientX, e.clientY);
    const isTouch = e.pointerType === 'touch';

    // Eraser Tool
    if (activeTool === 'eraser') {
      const hit = getElementAtPosition(pt);
      if (hit) {
        // If hit belongs to group, erase entire group!
        const idsToRemove = hit.groupId
          ? elements.filter((el) => el.groupId === hit.groupId).map((el) => el.id)
          : [hit.id];
        onElementsChange(
          elements.filter((el) => !idsToRemove.includes(el.id)),
          true
        );
        onSelectIds(selectedIds.filter((id) => !idsToRemove.includes(id)));
      }
      return;
    }

    // Path creation mode (multi-click polygon)
    if (activeTool === 'path') {
      if (!inProgressPathPoints) {
        setInProgressPathPoints([pt]);
      } else {
        const first = inProgressPathPoints[0];
        if (inProgressPathPoints.length >= 2 && Math.hypot(pt.x - first.x, pt.y - first.y) < 16 / viewport.zoom) {
          finishPathDrawing();
        } else {
          setInProgressPathPoints([...inProgressPathPoints, pt]);
        }
      }
      return;
    }

    // Select Tool
    if (activeTool === 'select') {
      // If single item selected, check its specific control/resize handles first
      if (selectedIds.length === 1) {
        const single = elements.find((el) => el.id === selectedIds[0]);
        if (single) {
          if (single.type === 'bezier') {
            const { cp1, cp2 } = getBezierControlPoints(single);
            const threshold = 12 / viewport.zoom;
            if (Math.hypot(pt.x - cp1.x, pt.y - cp1.y) <= threshold) {
              setActiveControlTarget({ type: 'bezier-cp1' });
              return;
            }
            if (Math.hypot(pt.x - cp2.x, pt.y - cp2.y) <= threshold) {
              setActiveControlTarget({ type: 'bezier-cp2' });
              return;
            }
          }

          if (single.type === 'path' && single.points) {
            const threshold = 10 / viewport.zoom;
            for (let i = 0; i < single.points.length; i++) {
              const vx = single.x + single.points[i].x;
              const vy = single.y + single.points[i].y;
              if (Math.hypot(pt.x - vx, pt.y - vy) <= threshold) {
                setActiveControlTarget({ type: 'path-vertex', index: i });
                return;
              }
            }
          }

          if (single.type !== 'bezier' && single.type !== 'path') {
            const handle = getResizeHandleAtPosition(pt, single, isTouch);
            if (handle) {
              setActiveResizeHandle(handle);
              setResizeInitialElement({ ...single });
              setResizeStartPoint(pt);
              return;
            }
          }
        }
      }

      // Check hit on elements
      const hit = getElementAtPosition(pt);
      if (hit) {
        let newSelection: string[] = [];

        if (e.shiftKey) {
          // Toggle selection with shift key
          const hitIds = hit.groupId
            ? elements.filter((e) => e.groupId === hit.groupId).map((e) => e.id)
            : [hit.id];
          const isAlreadySelected = hitIds.some((id) => selectedIds.includes(id));

          if (isAlreadySelected) {
            newSelection = selectedIds.filter((id) => !hitIds.includes(id));
          } else {
            newSelection = [...selectedIds, ...hitIds];
          }
        } else {
          // Direct click: if already in current multi-selection, preserve it for multi-drag!
          if (selectedIds.includes(hit.id)) {
            newSelection = selectedIds;
          } else {
            // Select this element and all its group peers
            newSelection = expandGroupMembers([hit.id]);
          }
        }

        onSelectIds(newSelection);

        // Prepare multi-drag
        setIsDraggingElements(true);
        setDragStartPoint(pt);
        const initPos: Record<string, Point> = {};
        newSelection.forEach((id) => {
          const el = elements.find((e) => e.id === id);
          if (el) initPos[id] = { x: el.x, y: el.y };
        });
        setDragInitialPositions(initPos);
      } else {
        // Clicked on empty space
        if (!e.shiftKey) {
          onSelectIds([]);
        }
        setSelectionBox({
          startX: pt.x,
          startY: pt.y,
          endX: pt.x,
          endY: pt.y,
        });
      }
      return;
    }

    // Text Tool
    if (activeTool === 'text') {
      const newTextEl: CanvasElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: pt.x,
        y: pt.y,
        width: 160,
        height: 40,
        strokeColor: (defaultStyles.strokeColor as string) || '#1e293b',
        backgroundColor: 'transparent',
        fillStyle: 'none',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 1,
        text: 'Texto',
        fontSize: 24,
        fontFamily: (defaultStyles.fontFamily as any) || 'Patrick Hand',
        textAlign: 'left',
        zIndex: elements.length + 1,
      };

      onElementsChange([...elements, newTextEl], true);
      onSelectIds([newTextEl.id]);
      setEditingElementId(newTextEl.id);
      setEditingText('Texto');
      onToolUsed();
      return;
    }

    // Shape Creation (Rectangle, Diamond, Capsule, Cylinder, Parallelogram, Ellipse, Arrow, Line, Bézier, Freedraw)
    setIsDrawing(true);
    let startX = pt.x;
    let startY = pt.y;
    let startBindingId: string | undefined = undefined;
    let startPort: 'top' | 'bottom' | 'left' | 'right' | undefined = undefined;

    if (activeTool === 'arrow' || activeTool === 'line' || activeTool === 'bezier') {
      const portHit = findClosestPort(pt, elements);
      if (portHit) {
        startX = portHit.point.x;
        startY = portHit.point.y;
        startBindingId = portHit.elementId;
        startPort = portHit.port;
      }
    }

    const newEl: CanvasElement = {
      id: `elem-${Date.now()}`,
      type: activeTool,
      x: startX,
      y: startY,
      width: 0,
      height: 0,
      points: activeTool === 'freedraw' ? [{ x: 0, y: 0 }] : undefined,
      controlPoint1: activeTool === 'bezier' ? { x: 30, y: -40 } : undefined,
      controlPoint2: activeTool === 'bezier' ? { x: 90, y: 60 } : undefined,
      hasArrowhead: activeTool === 'bezier' ? true : undefined,
      strokeColor: (defaultStyles.strokeColor as string) || '#1e293b',
      backgroundColor: (defaultStyles.backgroundColor as string) || 'transparent',
      fillStyle: (defaultStyles.fillStyle as any) || 'none',
      strokeWidth: (defaultStyles.strokeWidth as number) || 2,
      strokeStyle: (defaultStyles.strokeStyle as any) || 'solid',
      roughness: (defaultStyles.roughness as number) || 1.2,
      opacity: (defaultStyles.opacity as number) || 1,
      roundness: (defaultStyles.roundness as boolean) ?? true,
      fontSize: 16,
      fontFamily: 'Patrick Hand',
      textAlign: 'center',
      startBindingId,
      startPort,
      zIndex: elements.length + 1,
    };

    setDrawingElement(newEl);
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Update active pointer position
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    }

    // Handle 2-finger pinch-to-zoom and two-finger pan
    if (activePointersRef.current.size === 2 && isTouchPinchingRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      const currentCenter = {
        x: (pts[0].clientX + pts[1].clientX) / 2,
        y: (pts[0].clientY + pts[1].clientY) / 2,
      };

      if (initialPinchDistanceRef.current > 0) {
        const scale = currentDist / initialPinchDistanceRef.current;
        const newZoom = Math.min(3.0, Math.max(0.2, initialPinchZoomRef.current * scale));

        const initCenter = initialPinchCenterRef.current;
        const initPan = initialPinchPanRef.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          // Offsets on screen canvas
          const initialScreenX = initCenter.x - rect.left;
          const initialScreenY = initCenter.y - rect.top;
          const currentScreenX = currentCenter.x - rect.left;
          const currentScreenY = currentCenter.y - rect.top;

          // Virtual world coordinates at start of pinch gesture
          const worldX = (initialScreenX - initPan.x) / initialPinchZoomRef.current;
          const worldY = (initialScreenY - initPan.y) / initialPinchZoomRef.current;

          // Compute new pan such that the world point remains locked under fingers
          const newPanX = currentScreenX - worldX * newZoom;
          const newPanY = currentScreenY - worldY * newZoom;

          onViewportChange({
            panX: newPanX,
            panY: newPanY,
            zoom: newZoom,
          });
        }
      }
      return;
    }

    if (isPanning) {
      onViewportChange({
        ...viewport,
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y,
      });
      return;
    }

    const pt = screenToCanvas(e.clientX, e.clientY);

    // Dragging control points (Bézier or Path vertices)
    if (activeControlTarget && selectedIds.length === 1) {
      const singleId = selectedIds[0];
      const updated = elements.map((el) => {
        if (el.id !== singleId) return el;

        if (activeControlTarget.type === 'bezier-cp1') {
          return {
            ...el,
            controlPoint1: { x: pt.x - el.x, y: pt.y - el.y },
          };
        } else if (activeControlTarget.type === 'bezier-cp2') {
          return {
            ...el,
            controlPoint2: { x: pt.x - el.x, y: pt.y - el.y },
          };
        } else if (activeControlTarget.type === 'path-vertex') {
          const newPoints = [...(el.points || [])];
          newPoints[activeControlTarget.index] = {
            x: pt.x - el.x,
            y: pt.y - el.y,
          };
          return {
            ...el,
            points: newPoints,
          };
        }
        return el;
      });

      onElementsChange(updated, false);
      return;
    }

    // Rubberband selection
    if (selectionBox) {
      setSelectionBox({
        ...selectionBox,
        endX: pt.x,
        endY: pt.y,
      });
      return;
    }

    // Moving multiple or single selected element(s) with Smart Snapping
    if (isDraggingElements && selectedIds.length > 0) {
      const rawDx = pt.x - dragStartPoint.x;
      const rawDy = pt.y - dragStartPoint.y;

      let finalDx = rawDx;
      let finalDy = rawDy;

      if (smartSnappingEnabled && !e.altKey) {
        const draggedElements = elements.filter((el) => selectedIds.includes(el.id));
        const candidateElements = elements.filter((el) => !selectedIds.includes(el.id));

        const snapResult = computeSmartSnapping(
          draggedElements,
          dragInitialPositions,
          rawDx,
          rawDy,
          candidateElements,
          8 / viewport.zoom
        );

        finalDx = snapResult.dx;
        finalDy = snapResult.dy;
        setSnapGuides(snapResult.guides);
      } else {
        setSnapGuides([]);
      }

      const updated = elements.map((el) => {
        if (dragInitialPositions[el.id]) {
          return {
            ...el,
            x: dragInitialPositions[el.id].x + finalDx,
            y: dragInitialPositions[el.id].y + finalDy,
          };
        }
        return el;
      });
      onElementsChange(updated, false);
      return;
    }

    // Resizing single element
    if (activeResizeHandle && resizeInitialElement && selectedIds.length === 1) {
      const init = resizeInitialElement;
      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      const dx = pt.x - resizeStartPoint.x;
      const dy = pt.y - resizeStartPoint.y;

      switch (activeResizeHandle) {
        case 'se':
          newW = init.width + dx;
          newH = init.height + dy;
          break;
        case 'e':
          newW = init.width + dx;
          break;
        case 's':
          newH = init.height + dy;
          break;
        case 'ne':
          newW = init.width + dx;
          newY = init.y + dy;
          newH = init.height - dy;
          break;
        case 'n':
          newY = init.y + dy;
          newH = init.height - dy;
          break;
        case 'nw':
          newX = init.x + dx;
          newY = init.y + dy;
          newW = init.width - dx;
          newH = init.height - dy;
          break;
        case 'w':
          newX = init.x + dx;
          newW = init.width - dx;
          break;
        case 'sw':
          newX = init.x + dx;
          newW = init.width - dx;
          newH = init.height + dy;
          break;
      }

      const updated = elements.map((el) => {
        if (el.id === selectedIds[0]) {
          return {
            ...el,
            x: newX,
            y: newY,
            width: newW,
            height: newH,
          };
        }
        return el;
      });
      onElementsChange(updated, false);
      return;
    }

    // Drawing in progress
    if (isDrawing && drawingElement) {
      if (drawingElement.type === 'freedraw') {
        const relPoint = {
          x: pt.x - drawingElement.x,
          y: pt.y - drawingElement.y,
        };
        setDrawingElement({
          ...drawingElement,
          points: [...(drawingElement.points || []), relPoint],
        });
      } else if (drawingElement.type === 'arrow' || drawingElement.type === 'line' || drawingElement.type === 'bezier') {
        const portHit = findClosestPort(pt, elements, drawingElement.id);
        let endX = pt.x;
        let endY = pt.y;

        if (portHit) {
          endX = portHit.point.x;
          endY = portHit.point.y;
          setHoveredPort(portHit.point);
        } else {
          setHoveredPort(null);
        }

        const newW = endX - drawingElement.x;
        const newH = endY - drawingElement.y;

        setDrawingElement({
          ...drawingElement,
          width: newW,
          height: newH,
          controlPoint1: drawingElement.type === 'bezier' ? { x: newW * 0.25, y: -newH * 0.3 - 20 } : undefined,
          controlPoint2: drawingElement.type === 'bezier' ? { x: newW * 0.75, y: newH * 1.3 + 20 } : undefined,
          endBindingId: portHit?.elementId,
          endPort: portHit?.port,
        });
      } else {
        setDrawingElement({
          ...drawingElement,
          width: pt.x - drawingElement.x,
          height: pt.y - drawingElement.y,
        });
      }
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    // Remove pointer from active pointers
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      isTouchPinchingRef.current = false;
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (activeControlTarget) {
      setActiveControlTarget(null);
      onElementsChange(elements, true);
      return;
    }

    if (isDraggingElements) {
      setIsDraggingElements(false);
      setDragInitialPositions({});
      setSnapGuides([]);
      onElementsChange(elements, true);
      return;
    }

    if (activeResizeHandle) {
      setActiveResizeHandle(null);
      setResizeInitialElement(null);
      onElementsChange(elements, true);
      return;
    }

    // Finalize rubberband selection
    if (selectionBox) {
      const minBoxX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxBoxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minBoxY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxBoxY = Math.max(selectionBox.startY, selectionBox.endY);

      if (maxBoxX - minBoxX > 4 && maxBoxY - minBoxY > 4) {
        const containedIds: string[] = [];
        elements.forEach((el) => {
          const elMinX = Math.min(el.x, el.x + el.width);
          const elMaxX = Math.max(el.x, el.x + el.width);
          const elMinY = Math.min(el.y, el.y + el.height);
          const elMaxY = Math.max(el.y, el.y + el.height);

          // Check intersection with selection box
          if (elMaxX >= minBoxX && elMinX <= maxBoxX && elMaxY >= minBoxY && elMinY <= maxBoxY) {
            containedIds.push(el.id);
          }
        });

        // Expand any group members in selection
        const expandedIds = expandGroupMembers(containedIds);
        onSelectIds(expandedIds);
      }
      setSelectionBox(null);
      return;
    }

    if (isDrawing && drawingElement) {
      setIsDrawing(false);
      setHoveredPort(null);

      const isTiny =
        drawingElement.type !== 'freedraw' &&
        Math.abs(drawingElement.width) < 6 &&
        Math.abs(drawingElement.height) < 6;

      if (!isTiny) {
        onElementsChange([...elements, drawingElement], true);
        onSelectIds([drawingElement.id]);
        onToolUsed();
      }
      setDrawingElement(null);
    }
  };

  // Wheel zoom and pan
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(3.0, Math.max(0.2, viewport.zoom * zoomFactor));

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - viewport.panX) * (newZoom / viewport.zoom);
      const newPanY = mouseY - (mouseY - viewport.panY) * (newZoom / viewport.zoom);

      onViewportChange({
        panX: newPanX,
        panY: newPanY,
        zoom: newZoom,
      });
    } else {
      onViewportChange({
        ...viewport,
        panX: viewport.panX - e.deltaX,
        panY: viewport.panY - e.deltaY,
      });
    }
  };

  // Double Click to Edit Text directly on shapes!
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (inProgressPathPoints && inProgressPathPoints.length >= 3) {
      finishPathDrawing();
      return;
    }

    const pt = screenToCanvas(e.clientX, e.clientY);
    const hit = getElementAtPosition(pt);
    if (hit && MEDIA_TYPES.has(hit.type)) {
      onSelectIds([hit.id]);
      return;
    }
    if (hit) {
      setEditingElementId(hit.id);
      setEditingText(hit.text || '');
      onSelectIds([hit.id]);
    }
  };

  // Commit text editing
  const handleCommitText = () => {
    if (editingElementId) {
      const updated = elements.map((el) => {
        if (el.id === editingElementId) {
          return {
            ...el,
            text: editingText,
          };
        }
        return el;
      });
      onElementsChange(updated, true);
      setEditingElementId(null);
    }
  };

  // Drag and Drop from ComponentLibrary
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const template = JSON.parse(rawData);
      const dropPt = screenToCanvas(e.clientX, e.clientY);

      if (onDropComponent) {
        onDropComponent(template, dropPt);
      }
    } catch (err) {
      console.error('Error handling component drop:', err);
    }
  };

  // Calculate position for floating text editor textarea
  const getEditingTextareaStyle = (): React.CSSProperties | null => {
    if (!editingElementId) return null;
    const el = elements.find((e) => e.id === editingElementId);
    if (!el) return null;

    const minX = Math.min(el.x, el.x + el.width);
    const minY = Math.min(el.y, el.y + el.height);
    const posX = minX * viewport.zoom + viewport.panX;
    const posY = minY * viewport.zoom + viewport.panY;
    const w = Math.max(140, Math.abs(el.width) * viewport.zoom);
    const h = Math.max(50, Math.abs(el.height) * viewport.zoom);

    return {
      position: 'absolute',
      left: `${posX}px`,
      top: `${posY}px`,
      width: `${w}px`,
      height: `${h}px`,
      fontFamily: el.fontFamily || 'Patrick Hand',
      fontSize: `${(el.fontSize || 18) * viewport.zoom}px`,
      color: el.strokeColor,
      textAlign: el.textAlign || 'center',
    };
  };

  const editingTextareaStyle = getEditingTextareaStyle();

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full h-full overflow-hidden select-none ${
        isSpacePressed || isPanning || activeTool === 'hand'
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'select'
          ? 'cursor-default'
          : activeTool === 'eraser'
          ? 'cursor-crosshair'
          : 'cursor-crosshair'
      }`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={(e) => {
          try {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
          } catch {
            // ignore
          }
          activePointersRef.current.delete(e.pointerId);
          if (activePointersRef.current.size < 2) isTouchPinchingRef.current = false;
          setSnapGuides([]);
        }}
        onPointerLeave={(e) => {
          try {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
          } catch {
            // ignore
          }
          activePointersRef.current.delete(e.pointerId);
          if (activePointersRef.current.size < 2) isTouchPinchingRef.current = false;
          setSnapGuides([]);
        }}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        className="block touch-none"
      />

      {/* Floating path creation hint */}
      {inProgressPathPoints && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-primary text-primary-content text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none animate-pulse">
          <span>Clique para adicionar vértices ({inProgressPathPoints.length}). Pressione Enter ou dê duplo clique para fechar.</span>
        </div>
      )}

      {/* Inline Text Editor Textarea Overlay */}
      {editingElementId && editingTextareaStyle && (
        <textarea
          ref={textareaRef}
          autoFocus
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={handleCommitText}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditingElementId(null);
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleCommitText();
            }
          }}
          style={editingTextareaStyle}
          placeholder="Digite o texto..."
          className="z-30 bg-base-100/90 border-2 border-primary rounded-lg p-2 outline-none resize-none shadow-xl"
        />
      )}
    </div>
  );
}
