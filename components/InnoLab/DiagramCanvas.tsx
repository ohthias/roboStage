import React, { forwardRef, useEffect, useLayoutEffect } from 'react';
import type { Node, Connection, Point, DiagramType } from '@/types/InnoLabType';
import { drawNode, drawConnection, wrapText } from '@/lib/canvaUtils';

interface DiagramCanvasProps {
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
  zoom: number;
  font: string;
  fontSize: number;
  fontColor: string;
  diagramType: DiagramType;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  onDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  editingNode: string | null;
  editText: string;
  setEditText: (text: string) => void;
  setEditingNode: (id: string | null) => void;
  editPos: Point;
}

const DiagramCanvas = forwardRef<HTMLCanvasElement, DiagramCanvasProps>(({
  nodes, connections, selectedNodeId, zoom, font, fontSize, fontColor, diagramType,
  onMouseDown, onMouseMove, onMouseUp, onWheel, onDoubleClick,
  editingNode, editText, setEditText, setEditingNode, editPos
}, ref) => {
  
  useLayoutEffect(() => {
    const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Resize canvas to fit parent
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    
    // Update node dimensions before drawing
    const PADDING = 12;
    const MIN_NODE_WIDTH = 120;
    const MAX_NODE_WIDTH = 220;

    nodes.forEach(n => {
        ctx.font = `${n.isHeader ? 'bold' : ''} ${fontSize}px ${font}`;
        const initialInnerWidth = MAX_NODE_WIDTH - PADDING * 2;
        let lines = wrapText(ctx, n.text, initialInnerWidth, fontSize);
        const textWidths = lines.map(l => ctx.measureText(l).width);
        const textWidth = (textWidths.length ? Math.max(...textWidths) : 0) + PADDING * 2;
        
        n.width = Math.min(MAX_NODE_WIDTH, Math.max(MIN_NODE_WIDTH, textWidth));
        
        const innerWidth = n.width - PADDING * 2;
        lines = wrapText(ctx, n.text, innerWidth, fontSize);
        
        const textHeight = lines.length * (fontSize * 1.2) + PADDING * 2;
        n.height = Math.max(diagramType === '5W2H' ? 40 : 50, textHeight);
    });
    
    // Special drawing for Ishikawa spine
    if (diagramType === 'Ishikawa') {
        const effectNode = nodes.find(n => n.id === '1');
        if (effectNode) {
            const spineY = effectNode.y + effectNode.height / 2;
            const spineStartX = 100;
            const spineEndX = effectNode.x;
            const color = '#455A64';

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(spineStartX, spineY);
            ctx.lineTo(spineEndX, spineY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Arrowhead for spine
            const headLength = 12;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(spineEndX, spineY);
            ctx.lineTo(spineEndX - headLength, spineY - headLength * 0.5);
            ctx.lineTo(spineEndX - headLength, spineY + headLength * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    // Draw connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        drawConnection(ctx, fromNode, toNode, diagramType, nodes);
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      drawNode(ctx, n, selectedNodeId === n.id, font, fontSize, fontColor, diagramType);
    });

    ctx.restore();
  }, [nodes, connections, selectedNodeId, zoom, font, fontSize, fontColor, diagramType, ref]);

  const editingNodeData = nodes.find(n => n.id === editingNode);

  return (
    <>
      <canvas
        ref={ref}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
      />
      {editingNode && editingNodeData && (
        <textarea
          autoFocus
          value={editText}
          onChange={(e) => {
            const newText = e.target.value;
            setEditText(newText);
            // Live update the node text
            const node = nodes.find(n => n.id === editingNode);
            if(node) node.text = newText;
          }}
          onBlur={() => setEditingNode(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                setEditingNode(null);
            }
          }}
          style={{
            position: 'absolute',
            left: editPos.x * zoom,
            top: editPos.y * zoom,
            width: (editingNodeData.width * zoom) + 2,
            height: (editingNodeData.height * zoom) + 2,
            fontFamily: font,
            fontSize: `${fontSize * zoom}px`,
            lineHeight: 1.2,
            border: '2px solid #2563EB',
            borderRadius: 'inherit',
            padding: `${12 * zoom}px`,
            resize: 'none',
            overflow: 'hidden',
            background: editingNodeData.fillColor || '#ffffff',
            color: editingNodeData.textColor || fontColor,
            boxSizing: 'border-box',
            zIndex: 10,
            outline: 'none',
          }}
        />
      )}
    </>
  );
});

export default DiagramCanvas;