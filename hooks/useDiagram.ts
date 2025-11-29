import React, { useState, useRef, useCallback } from "react";
import { Node, Connection, DiagramType, PathLayer } from "@/types/InnoLabType";
import { TEMPLATE_NODES } from "@/app/(private)/dashboard/innolab/constants";
import { v4 as uuidv4 } from "uuid";

interface HistoryState {
  nodes: Node[];
  connections: Connection[];
  paths: PathLayer[];
}

export type InteractionMode =
  | "pan"
  | "select"
  | "lasso"
  | "connect"
  | "highlighter";
export type ResizeHandle = "nw" | "ne" | "sw" | "se";

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Point in Polygon Algorithm (Ray Casting)
function isPointInPolygon(
  point: { x: number; y: number },
  vs: { x: number; y: number }[]
) {
  let x = point.x,
    y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x,
      yi = vs[i].y;
    let xj = vs[j].x,
      yj = vs[j].y;
    let intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export const useDiagram = (initialType: DiagramType) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [paths, setPaths] = useState<PathLayer[]>([]);

  // History State
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: [], connections: [], paths: [] },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selection State
  const [selectedNode, setSelectedNode] = useState<string | null>(null); // Primary selection
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    new Set()
  ); // Multi-selection set
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);

  // Viewport State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("pan");
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectionPath, setSelectionPath] = useState<
    { x: number; y: number }[] | null
  >(null);

  // Manual Connection State
  const [connectingStartNodeId, setConnectingStartNodeId] = useState<
    string | null
  >(null);
  const [connectionDragPos, setConnectionDragPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Drawing/Highlighter State
  const [draftPath, setDraftPath] = useState<{ x: number; y: number }[] | null>(
    null
  );
  const [highlighterColor, setHighlighterColor] = useState("#fde047"); // Default Yellow
  const [highlighterThickness, setHighlighterThickness] = useState(20); // Default Thick

  // Interaction Overrides
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Style State
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState("#000000");

  // Editing states
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPos, setEditPos] = useState<{ x: number; y: number } | null>(null);

  // Dragging logic refs
  const isDraggingNode = useRef(false);
  const isPanning = useRef(false);
  const isSelecting = useRef(false);
  const isResizing = useRef(false);
  const isDrawing = useRef(false);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const selectionStart = useRef<{ x: number; y: number } | null>(null); // World coordinates start
  const lassoPathRef = useRef<{ x: number; y: number }[]>([]); // Ref to track lasso path without re-renders for logic
  const draftPathRef = useRef<{ x: number; y: number }[]>([]); // Ref for highlighter path

  const draggedNodeId = useRef<string | null>(null);
  const hasMovedRef = useRef(false);

  const activeResizeHandle = useRef<ResizeHandle | null>(null);
  const resizeStart = useRef<{
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    originalW: number;
    originalH: number;
  } | null>(null);

  // --- History Management ---

  const saveState = useCallback(
    (newNodes: Node[], newConnections: Connection[], newPaths: PathLayer[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({
          nodes: newNodes,
          connections: newConnections,
          paths: newPaths,
        });
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setPaths(prevState.paths);
      setHistoryIndex(newIndex);
      // Clear selection on undo to avoid ghost selections
      setSelectedNode(null);
      setSelectedNodeIds(new Set());
      setSelectedConnectionId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setPaths(nextState.paths);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Helper to initialize diagram (e.g. from AI) and reset history
  const setInitialDiagram = useCallback(
    (
      newNodes: Node[],
      newConnections: Connection[],
      newPaths: PathLayer[] = []
    ) => {
      setNodes(newNodes);
      setConnections(newConnections);
      setPaths(newPaths);
      setHistory([
        { nodes: newNodes, connections: newConnections, paths: newPaths },
      ]);
      setHistoryIndex(0);
    },
    []
  );

  // --- Actions ---

  const loadTemplateNodes = useCallback(
    (type: DiagramType) => {
      const newTemplateNodes = TEMPLATE_NODES[type] || [];

      // We need to filter out old template nodes from current nodes
      const nonTemplateNodes = nodes.filter((n) => !n.isTemplate);
      const finalNodes = [...nonTemplateNodes, ...newTemplateNodes];

      setNodes(finalNodes);
      saveState(finalNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  const addNode = useCallback(
    (overrides?: Partial<Node>) => {
      const centerX = (window.innerWidth / 2 - pan.x) / zoom;
      const centerY = (window.innerHeight / 2 - pan.y) / zoom;

      const newNode: Node = {
        id: uuidv4(),
        x: centerX + (Math.random() * 50 - 25),
        y: centerY + (Math.random() * 50 - 25),
        text:
          overrides?.type === "label" || overrides?.type === "text"
            ? "Text"
            : "Nova Ideia",
        type: "leaf",
        color: "#ffffff",
        textColor: "#1e293b",
        width: overrides?.width, // Pass through or undefined (handled by renderer default)
        height: overrides?.height,
        ...overrides,
      };

      const newNodes = [...nodes, newNode];
      let newConnections = [...connections];

      // Only auto-connect if it's NOT a label/text/sticker/zone and we have a single selection
      if (
        newNode.type !== "label" &&
        newNode.type !== "text" &&
        newNode.type !== "sticker" &&
        newNode.type !== "zone" &&
        selectedNode &&
        selectedNodeIds.size <= 1
      ) {
        const parent = nodes.find((n) => n.id === selectedNode);
        // Don't connect to labels, text or zones
        if (
          parent &&
          parent.type !== "label" &&
          parent.type !== "text" &&
          parent.type !== "zone"
        ) {
          newConnections.push({
            id: uuidv4(),
            from: selectedNode,
            to: newNode.id,
            style: "solid",
            thickness: 2,
          });
        }
      }

      setNodes(newNodes);
      setConnections(newConnections);
      saveState(newNodes, newConnections, paths);

      setSelectedNode(newNode.id);
      setSelectedNodeIds(new Set([newNode.id]));
      setSelectedConnectionId(null);
    },
    [
      selectedNode,
      selectedNodeIds,
      pan,
      zoom,
      nodes,
      connections,
      paths,
      saveState,
    ]
  );

  const addZone = useCallback(() => {
    const centerX = (window.innerWidth / 2 - pan.x) / zoom;
    const centerY = (window.innerHeight / 2 - pan.y) / zoom;

    const newZone: Node = {
      id: uuidv4(),
      x: centerX,
      y: centerY,
      text: "Nova Zona",
      type: "zone",
      color: "transparent",
      textColor: "#64748b",
      width: 400,
      height: 300,
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "left",
    };

    // Add to beginning of array so it renders behind everything else
    const newNodes = [newZone, ...nodes];
    setNodes(newNodes);
    saveState(newNodes, connections, paths);

    setSelectedNode(newZone.id);
    setSelectedNodeIds(new Set([newZone.id]));
    setSelectedConnectionId(null);
  }, [nodes, connections, paths, pan, zoom, saveState]);

  const removeNode = useCallback(() => {
    if (selectedConnectionId) {
      const newConnections = connections.filter(
        (c) => c.id !== selectedConnectionId
      );
      setConnections(newConnections);
      saveState(nodes, newConnections, paths);
      setSelectedConnectionId(null);
      return;
    }

    if (selectedNodeIds.size === 0) return;

    const newNodes = nodes.filter((n) => !selectedNodeIds.has(n.id));
    const newConnections = connections.filter(
      (c) => !selectedNodeIds.has(c.from) && !selectedNodeIds.has(c.to)
    );

    setNodes(newNodes);
    setConnections(newConnections);
    saveState(newNodes, newConnections, paths);

    setSelectedNode(null);
    setSelectedNodeIds(new Set());
  }, [
    selectedNodeIds,
    selectedConnectionId,
    nodes,
    connections,
    paths,
    saveState,
  ]);

  const duplicateNode = useCallback(() => {
    if (selectedNodeIds.size === 0) return;

    const nodesToDup: Node[] = [];

    nodes.forEach((node) => {
      if (selectedNodeIds.has(node.id)) {
        const newId = uuidv4();
        nodesToDup.push({
          ...node,
          id: newId,
          x: node.x + 30,
          y: node.y + 30,
          groupId: undefined,
          locked: false,
        });
      }
    });

    const newNodes = [...nodes, ...nodesToDup];
    setNodes(newNodes);
    saveState(newNodes, connections, paths);

    const newIds = nodesToDup.map((n) => n.id);
    if (newIds.length > 0) {
      setSelectedNode(newIds[0]);
      setSelectedNodeIds(new Set(newIds));
    }
  }, [selectedNodeIds, nodes, connections, paths, saveState]);

  const groupNodes = useCallback(() => {
    if (selectedNodeIds.size < 2) return;
    const newGroupId = uuidv4();

    const newNodes = nodes.map((node) => {
      if (selectedNodeIds.has(node.id)) {
        return { ...node, groupId: newGroupId };
      }
      return node;
    });

    setNodes(newNodes);
    saveState(newNodes, connections, paths);
  }, [selectedNodeIds, nodes, connections, paths, saveState]);

  const ungroupNodes = useCallback(() => {
    if (selectedNodeIds.size === 0) return;

    const newNodes = nodes.map((node) => {
      if (selectedNodeIds.has(node.id)) {
        return { ...node, groupId: undefined };
      }
      return node;
    });

    setNodes(newNodes);
    saveState(newNodes, connections, paths);
  }, [selectedNodeIds, nodes, connections, paths, saveState]);

  // --- Layers & Z-Index Management ---

  const bringToFront = useCallback(
    (id: string) => {
      const nodeIndex = nodes.findIndex((n) => n.id === id);
      if (nodeIndex === -1 || nodeIndex === nodes.length - 1) return;

      const newNodes = [...nodes];
      const [node] = newNodes.splice(nodeIndex, 1);
      newNodes.push(node);

      setNodes(newNodes);
      saveState(newNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  const sendToBack = useCallback(
    (id: string) => {
      const nodeIndex = nodes.findIndex((n) => n.id === id);
      if (nodeIndex === -1 || nodeIndex === 0) return;

      const newNodes = [...nodes];
      const [node] = newNodes.splice(nodeIndex, 1);
      newNodes.unshift(node);

      setNodes(newNodes);
      saveState(newNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  const moveLayerUp = useCallback(
    (id: string) => {
      const index = nodes.findIndex((n) => n.id === id);
      if (index === -1 || index === nodes.length - 1) return;

      const newNodes = [...nodes];
      [newNodes[index], newNodes[index + 1]] = [
        newNodes[index + 1],
        newNodes[index],
      ];

      setNodes(newNodes);
      saveState(newNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  const moveLayerDown = useCallback(
    (id: string) => {
      const index = nodes.findIndex((n) => n.id === id);
      if (index === -1 || index === 0) return;

      const newNodes = [...nodes];
      [newNodes[index], newNodes[index - 1]] = [
        newNodes[index - 1],
        newNodes[index],
      ];

      setNodes(newNodes);
      saveState(newNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  const toggleLock = useCallback(
    (id: string) => {
      const newNodes = nodes.map((n) =>
        n.id === id ? { ...n, locked: !n.locked } : n
      );
      setNodes(newNodes);
      saveState(newNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      const newNodes = nodes.map((n) =>
        n.id === id ? { ...n, hidden: !n.hidden } : n
      );
      setNodes(newNodes);
      saveState(newNodes, connections, paths);
    },
    [nodes, connections, paths, saveState]
  );

  // --- Resize Handler ---
  const handleResizeStart = (
    e: React.MouseEvent,
    nodeId: string,
    handle: ResizeHandle
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Determine current dimensions (fallback to defaults matches DiagramCanvas logic)
    // INCREASED DEFAULTS FOR BETTER SPACING
    let currentW = node.width;
    let currentH = node.height;

    if (!currentW || !currentH) {
      if (node.type === "label" || node.type === "text") {
        currentW = 200;
        currentH = 60;
      } else if (node.type === "zone") {
        currentW = 400;
        currentH = 300;
      } else if (node.shape === "circle") {
        currentW = 100;
        currentH = 100;
      } else if (node.shape === "diamond") {
        currentW = 140;
        currentH = 100;
      } else if (node.shape === "pill") {
        currentW = 160;
        currentH = 70;
      } else if (node.shape === "cloud") {
        currentW = 180;
        currentH = 100;
      } else {
        currentW = 180;
        currentH = 90;
      } // Rect default (increased from 150x70)
    }

    isResizing.current = true;
    activeResizeHandle.current = handle;
    draggedNodeId.current = nodeId;

    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      originalX: node.x,
      originalY: node.y,
      originalW: currentW!,
      originalH: currentH!,
    };
  };

  // Canvas Handlers
  const handleCanvasMouseDown = (
    e: React.MouseEvent,
    nodeId?: string,
    connectionId?: string
  ) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;

    // Middle Mouse Button (1) or Spacebar Overrides Panning
    const isMiddleClick = e.button === 1;
    const isPanOverride = isSpacePressed || isMiddleClick;

    if (isPanOverride) {
      isPanning.current = true;
      if (isMiddleClick) e.preventDefault();
      return;
    }

    // Highlighter Mode - Start Drawing
    if (interactionMode === "highlighter" && !isPanOverride) {
      isDrawing.current = true;
      setSelectedNode(null);
      setSelectedNodeIds(new Set());

      const worldX = (e.clientX - pan.x) / zoom;
      const worldY = (e.clientY - pan.y) / zoom;
      draftPathRef.current = [{ x: worldX, y: worldY }];
      setDraftPath([{ x: worldX, y: worldY }]);
      return;
    }

    if (nodeId && !isPanOverride) {
      // --- Connect Mode Logic ---
      if (interactionMode === "connect") {
        setConnectingStartNodeId(nodeId);
        // Set initial drag position to node center or click position
        const worldX = (e.clientX - pan.x) / zoom;
        const worldY = (e.clientY - pan.y) / zoom;
        setConnectionDragPos({ x: worldX, y: worldY });
        e.stopPropagation();
        return;
      }

      const targetNode = nodes.find((n) => n.id === nodeId);

      draggedNodeId.current = nodeId;
      isDraggingNode.current = true;
      isPanning.current = false;
      isSelecting.current = false;
      setSelectedConnectionId(null);

      // Multi-selection Logic
      if (e.shiftKey) {
        const newSet = new Set(selectedNodeIds);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
          if (selectedNode === nodeId) {
            setSelectedNode(Array.from(newSet).pop() || null);
          }
        } else {
          newSet.add(nodeId);
          setSelectedNode(nodeId);
        }
        setSelectedNodeIds(newSet);
      } else {
        // If dragging an already selected node, keep selection. Otherwise select new.
        if (!selectedNodeIds.has(nodeId)) {
          setSelectedNode(nodeId);
          setSelectedNodeIds(new Set([nodeId]));
        } else {
          setSelectedNode(nodeId);
        }
      }
    } else if (connectionId && !isPanOverride) {
      setSelectedConnectionId(connectionId);
      setSelectedNode(null);
      setSelectedNodeIds(new Set());
      isDraggingNode.current = false;
      isPanning.current = false;
      isSelecting.current = false;
      e.stopPropagation();
    } else {
      // Canvas Click or Pan Override
      if (interactionMode === "pan") {
        if (!isMiddleClick) {
          setSelectedNode(null);
          setSelectedNodeIds(new Set());
          setSelectedConnectionId(null);
        }
        isDraggingNode.current = false;
        isPanning.current = true;
        isSelecting.current = false;
      } else if (interactionMode === "select") {
        setSelectedNode(null);
        setSelectedNodeIds(new Set());
        setSelectedConnectionId(null);
        isDraggingNode.current = false;
        isPanning.current = false;
        isSelecting.current = true;

        // Calculate start position in World Space
        const worldX = (e.clientX - pan.x) / zoom;
        const worldY = (e.clientY - pan.y) / zoom;
        selectionStart.current = { x: worldX, y: worldY };
        setSelectionBox({ x: worldX, y: worldY, width: 0, height: 0 });
      } else if (interactionMode === "lasso") {
        setSelectedNode(null);
        setSelectedNodeIds(new Set());
        setSelectedConnectionId(null);
        isDraggingNode.current = false;
        isPanning.current = false;
        isSelecting.current = true;

        const worldX = (e.clientX - pan.x) / zoom;
        const worldY = (e.clientY - pan.y) / zoom;
        lassoPathRef.current = [{ x: worldX, y: worldY }];
        setSelectionPath([{ x: worldX, y: worldY }]);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Highlighter Drawing Logic
    if (isDrawing.current && interactionMode === "highlighter") {
      const worldX = (e.clientX - pan.x) / zoom;
      const worldY = (e.clientY - pan.y) / zoom;
      draftPathRef.current.push({ x: worldX, y: worldY });
      setDraftPath([...draftPathRef.current]); // Trigger re-render
      return;
    }

    // Resize Logic (Priority)
    if (isResizing.current && resizeStart.current && draggedNodeId.current) {
      const dx = (e.clientX - resizeStart.current.x) / zoom;
      const dy = (e.clientY - resizeStart.current.y) / zoom;
      const { originalX, originalY, originalW, originalH } =
        resizeStart.current;
      const handle = activeResizeHandle.current;

      const minSize = 40;

      // Calculate original bounds
      const startLeft = originalX - originalW / 2;
      const startRight = originalX + originalW / 2;
      const startTop = originalY - originalH / 2;
      const startBottom = originalY + originalH / 2;

      let newLeft = startLeft;
      let newRight = startRight;
      let newTop = startTop;
      let newBottom = startBottom;

      // Update bounds based on handle
      if (handle?.includes("e"))
        newRight = Math.max(startLeft + minSize, startRight + dx);
      if (handle?.includes("s"))
        newBottom = Math.max(startTop + minSize, startBottom + dy);
      if (handle?.includes("w"))
        newLeft = Math.min(startRight - minSize, startLeft + dx);
      if (handle?.includes("n"))
        newTop = Math.min(startBottom - minSize, startTop + dy);

      const newW = newRight - newLeft;
      const newH = newBottom - newTop;
      const newX = newLeft + newW / 2;
      const newY = newTop + newH / 2;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId.current
            ? {
                ...n,
                x: newX,
                y: newY,
                width: newW,
                height: newH,
              }
            : n
        )
      );
      return;
    }

    // --- Manual Connection Dragging ---
    if (connectingStartNodeId) {
      const worldX = (e.clientX - pan.x) / zoom;
      const worldY = (e.clientY - pan.y) / zoom;
      setConnectionDragPos({ x: worldX, y: worldY });
      return;
    }

    if (!dragStart.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasMovedRef.current = true;
    }

    if (isDraggingNode.current && draggedNodeId.current) {
      const targetNode = nodes.find((n) => n.id === draggedNodeId.current);
      if (targetNode?.locked) return;

      const zoomAdjustedDx = dx / zoom;
      const zoomAdjustedDy = dy / zoom;

      setNodes((prev) => {
        // If dragging a ZONE, we need to find contained nodes
        let containedNodeIds = new Set<string>();

        if (targetNode?.type === "zone") {
          const zW = targetNode.width || 400;
          const zH = targetNode.height || 300;
          const zLeft = targetNode.x - zW / 2;
          const zRight = targetNode.x + zW / 2;
          const zTop = targetNode.y - zH / 2;
          const zBottom = targetNode.y + zH / 2;

          prev.forEach((child) => {
            if (child.id === targetNode.id) return;
            // Use approximate containment
            if (
              child.x > zLeft &&
              child.x < zRight &&
              child.y > zTop &&
              child.y < zBottom
            ) {
              containedNodeIds.add(child.id);
            }
          });
        }

        return prev.map((n) => {
          if (n.locked) return n;

          let shouldMove = false;
          const draggingGroupId = targetNode?.groupId;

          if (n.id === draggedNodeId.current) {
            shouldMove = true;
          } else if (draggingGroupId && n.groupId === draggingGroupId) {
            shouldMove = true;
          } else if (
            selectedNodeIds.has(draggedNodeId.current!) &&
            selectedNodeIds.has(n.id)
          ) {
            shouldMove = true;
          } else if (containedNodeIds.has(n.id)) {
            // Move children of zone
            shouldMove = true;
          }

          if (shouldMove) {
            return { ...n, x: n.x + zoomAdjustedDx, y: n.y + zoomAdjustedDy };
          }
          return n;
        });
      });
    } else if (isPanning.current) {
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (isSelecting.current) {
      const currentWorldX = (e.clientX - pan.x) / zoom;
      const currentWorldY = (e.clientY - pan.y) / zoom;

      if (interactionMode === "select" && selectionStart.current) {
        const x = Math.min(selectionStart.current.x, currentWorldX);
        const y = Math.min(selectionStart.current.y, currentWorldY);
        const width = Math.abs(currentWorldX - selectionStart.current.x);
        const height = Math.abs(currentWorldY - selectionStart.current.y);

        setSelectionBox({ x, y, width, height });

        const newSelectedIds = new Set<string>();
        nodes.forEach((node) => {
          if (node.locked || node.isTemplate || node.hidden) return;
          const w = node.width || 140;
          const h = node.height || 60;
          const nodeLeft = node.x - w / 2;
          const nodeRight = node.x + w / 2;
          const nodeTop = node.y - h / 2;
          const nodeBottom = node.y + h / 2;

          if (
            x < nodeRight &&
            x + width > nodeLeft &&
            y < nodeBottom &&
            y + height > nodeTop
          ) {
            newSelectedIds.add(node.id);
          }
        });

        setSelectedNodeIds(newSelectedIds);
        if (newSelectedIds.size > 0) {
          setSelectedNode(newSelectedIds.values().next().value || null);
        } else {
          setSelectedNode(null);
        }
      } else if (interactionMode === "lasso") {
        const newPoint = { x: currentWorldX, y: currentWorldY };
        lassoPathRef.current.push(newPoint);
        setSelectionPath([{ x: currentWorldX, y: currentWorldY }]); // Just trigger render, path logic uses ref

        const newSelectedIds = new Set<string>();
        nodes.forEach((node) => {
          if (node.locked || node.isTemplate || node.hidden) return;
          if (
            isPointInPolygon({ x: node.x, y: node.y }, lassoPathRef.current)
          ) {
            newSelectedIds.add(node.id);
          }
        });

        setSelectedNodeIds(newSelectedIds);
        if (newSelectedIds.size > 0) {
          setSelectedNode(newSelectedIds.values().next().value || null);
        } else {
          setSelectedNode(null);
        }
      }
    }

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleCanvasMouseUp = (droppedOnNodeId?: string) => {
    if (isDrawing.current) {
      if (draftPathRef.current.length > 1) {
        const newPath: PathLayer = {
          id: uuidv4(),
          points: draftPathRef.current,
          color: highlighterColor,
          thickness: highlighterThickness,
          opacity: 0.5,
        };
        const newPaths = [...paths, newPath];
        setPaths(newPaths);
        saveState(nodes, connections, newPaths);
      }
      isDrawing.current = false;
      setDraftPath(null);
      draftPathRef.current = [];
      return;
    }

    if (connectingStartNodeId) {
      // Connect logic
      if (droppedOnNodeId && droppedOnNodeId !== connectingStartNodeId) {
        // Check if connection already exists
        const exists = connections.some(
          (c) =>
            (c.from === connectingStartNodeId && c.to === droppedOnNodeId) ||
            (c.from === droppedOnNodeId && c.to === connectingStartNodeId)
        );

        if (!exists) {
          const newConn: Connection = {
            id: uuidv4(),
            from: connectingStartNodeId,
            to: droppedOnNodeId,
            style: "solid",
            thickness: 2,
          };
          const newConnections = [...connections, newConn];
          setConnections(newConnections);
          saveState(nodes, newConnections, paths);
        }
      }
      setConnectingStartNodeId(null);
      setConnectionDragPos(null);
      return;
    }

    if (isResizing.current) {
      saveState(nodes, connections, paths);
      isResizing.current = false;
      activeResizeHandle.current = null;
      resizeStart.current = null;
      draggedNodeId.current = null;
    } else if (isDraggingNode.current && hasMovedRef.current) {
      saveState(nodes, connections, paths);
    }

    isDraggingNode.current = false;
    isPanning.current = false;
    isSelecting.current = false;
    setSelectionBox(null);
    setSelectionPath(null);
    lassoPathRef.current = [];
    selectionStart.current = null;

    draggedNodeId.current = null;
    dragStart.current = null;
    hasMovedRef.current = false;
  };

  const handleCanvasWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY * 0.001;
    setZoom((z) => Math.min(Math.max(0.1, z + delta), 3));
  };

  const handleCanvasDoubleClick = (
    nodeId: string,
    x: number,
    y: number,
    text: string
  ) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && !node.locked) {
      setEditingNode(nodeId);
      setEditText(text);
      setEditPos({ x, y });
    }
  };

  const finishEditing = useCallback(() => {
    if (editingNode) {
      const newNodes = nodes.map((n) =>
        n.id === editingNode ? { ...n, text: editText } : n
      );
      setNodes(newNodes);
      saveState(newNodes, connections, paths);
      setEditingNode(null);
    }
  }, [editingNode, editText, nodes, connections, paths, saveState]);

  const updateSelectedNodeColor = (color: string) => {
    if (selectedNodeIds.size === 0) return;
    const newNodes = nodes.map((n) =>
      selectedNodeIds.has(n.id) ? { ...n, color } : n
    );
    setNodes(newNodes);
    saveState(newNodes, connections, paths);
  };

  const updateSelectedNodeTextColor = (color: string) => {
    if (selectedNodeIds.size === 0) return;
    const newNodes = nodes.map((n) =>
      selectedNodeIds.has(n.id) ? { ...n, textColor: color } : n
    );
    setNodes(newNodes);
    saveState(newNodes, connections, paths);
  };

  const updateSelectedNodeShape = (
    shape: "rect" | "circle" | "diamond" | "pill"
  ) => {
    if (selectedNodeIds.size === 0) return;
    const newNodes = nodes.map((n) =>
      selectedNodeIds.has(n.id) ? { ...n, shape } : n
    );
    setNodes(newNodes);
    saveState(newNodes, connections, paths);
  };

  const updateSelectedNodeStyle = (updates: Partial<Node>) => {
    if (selectedNodeIds.size === 0) return;
    const newNodes = nodes.map((n) =>
      selectedNodeIds.has(n.id) ? { ...n, ...updates } : n
    );
    setNodes(newNodes);
    saveState(newNodes, connections, paths);
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    const newConnections = connections.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setConnections(newConnections);
    saveState(nodes, newConnections, paths);
  };

  return {
    nodes,
    setNodes,
    connections,
    setConnections,
    paths,
    setPaths,
    setInitialDiagram,
    selectedNode,
    setSelectedNode,
    selectedNodeIds,
    setSelectedNodeIds,
    selectedConnectionId,
    zoom,
    setZoom,
    pan,
    setPan,
    interactionMode,
    setInteractionMode,
    selectionBox,
    selectionPath,
    isSpacePressed,
    setIsSpacePressed,
    connectingStartNodeId,
    connectionDragPos,
    draftPath,
    highlighterColor,
    setHighlighterColor,
    highlighterThickness,
    setHighlighterThickness,
    font,
    setFont,
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    editingNode,
    setEditingNode,
    editText,
    setEditText,
    editPos,
    setEditPos,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel,
    handleCanvasDoubleClick,
    handleResizeStart,
    finishEditing,
    addNode,
    addZone,
    removeNode,
    duplicateNode,
    groupNodes,
    ungroupNodes,
    updateSelectedNodeColor,
    updateSelectedNodeTextColor,
    updateSelectedNodeShape,
    updateSelectedNodeStyle,
    updateConnection,
    loadTemplateNodes,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    // Layer Helpers
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
    toggleLock,
    toggleVisibility,
  };
};
