import { useState, useCallback } from 'react';
import type { Node, Connection, Point, DiagramType } from '@/types/InnoLabType';

export const useDiagram = (diagramType: DiagramType) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPos, setEditPos] = useState<Point>({ x: 0, y: 0 });

  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#333333');

  const getNodeAtPosition = (x: number, y: number): Node | undefined => {
    // Iterate backwards to select top-most node
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (x >= n.x && x <= n.x + n.width && y >= n.y && y <= n.y + n.height) {
        return n;
      }
    }
    return undefined;
  };
  
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const node = getNodeAtPosition(x, y);

    if (node) {
      setDraggingNode(node.id);
      setSelectedNode(node.id);
      setOffset({ x: x - node.x, y: y - node.y });
      setIsPanning(false);
    } else {
      setSelectedNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [zoom, nodes]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggingNode) {
      const x = mouseX / zoom;
      const y = mouseY / zoom;
      setNodes(prev => prev.map(n =>
        n.id === draggingNode ? { ...n, x: x - offset.x, y: y - offset.y } : n
      ));
    } else if (isPanning) {
      const dx = (e.clientX - panStart.x);
      const dy = (e.clientY - panStart.y);
      setNodes(prev => prev.map(n => ({ ...n, x: n.x + dx / zoom, y: n.y + dy / zoom })));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, isPanning, panStart, offset, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  const handleCanvasWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const newZoom = Math.min(Math.max(zoom - e.deltaY * 0.001, 0.2), 3);
    setZoom(newZoom);
  }, [zoom]);

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const node = getNodeAtPosition(x,y);

    if (node) {
      setEditingNode(node.id);
      setEditText(node.text);
      setEditPos({ x: node.x, y: node.y });
    }
  }, [zoom, nodes]);

  const addNode = useCallback(() => {
    if (diagramType === 'Ishikawa') {
        if (!selectedNode || selectedNode === '1') {
            alert("Please select a category (e.g., 'Method', 'Machine') to add a sub-cause to.");
            return;
        }

        const parentNode = nodes.find(n => n.id === selectedNode);
        if (!parentNode) return;

        // Find existing sub-causes for this category to stack the new one
        const childNodes = connections
            .filter(c => c.to === parentNode.id)
            .map(c => nodes.find(n => n.id === c.from))
            .filter((n): n is Node => !!n);

        const newSubCause: Node = {
            id: Date.now().toString(),
            x: parentNode.x - 180, // Position to the left of the category
            y: parentNode.y + (childNodes.length * 55), // Stack them vertically with a gap
            text: "New Sub-cause",
            width: 150,
            height: 40,
            shape: 'rectangle',
        };

        setNodes(prev => [...prev, newSubCause]);
        setConnections(prev => [...prev, { from: newSubCause.id, to: parentNode.id }]);
        setSelectedNode(newSubCause.id);

    } else { // Existing logic for MindMap and other types
        const newNode: Node = {
            id: Date.now().toString(),
            x: 200,
            y: 150,
            text: "New Idea",
            width: 150,
            height: 50,
            shape: diagramType === 'Mapa Mental' ? 'ellipse' : 'rectangle',
            level: 1,
        };

        const parentNode = selectedNode ? nodes.find(n => n.id === selectedNode) : nodes.find(n => n.id === "1");

        if (parentNode) {
            newNode.x = parentNode.x + parentNode.width + 50;
            newNode.y = parentNode.y;
            newNode.level = (parentNode.level || 0) + 1;
            setConnections(prev => [...prev, { from: parentNode.id, to: newNode.id }]);
        }

        setNodes(prev => [...prev, newNode]);
        setSelectedNode(newNode.id);
    }
  }, [selectedNode, nodes, connections, diagramType]);

  const removeNode = useCallback(() => {
    if (!selectedNode || selectedNode === '1') return; // Cannot delete root node for simplicity
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setConnections(prev => prev.filter(c => c.from !== selectedNode && c.to !== selectedNode));
    setSelectedNode(null);
  }, [selectedNode]);

  const updateSelectedNodeColor = useCallback((color: string) => {
    if (!selectedNode) return;
    setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, fillColor: color } : n));
  }, [selectedNode]);
  
  const updateSelectedNodeTextColor = useCallback((color: string) => {
    if (!selectedNode) return;
    setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, textColor: color } : n));
  }, [selectedNode]);

  return {
    nodes, setNodes,
    connections, setConnections,
    selectedNode, setSelectedNode,
    zoom, setZoom,
    font, setFont,
    fontSize, setFontSize,
    fontColor, setFontColor,
    editingNode, setEditingNode,
    editText, setEditText,
    editPos, setEditPos,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel,
    handleCanvasDoubleClick,
    addNode,
    removeNode,
    updateSelectedNodeColor,
    updateSelectedNodeTextColor
  };
};