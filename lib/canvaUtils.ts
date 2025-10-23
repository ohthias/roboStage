import type { Node, DiagramType } from '@/types/InnoLabType';

const PADDING = 12;
const LINE_HEIGHT_MULTIPLIER = 1.2;

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
    const paragraphs = text.split('\n');
    const lines: string[] = [];
    paragraphs.forEach(p => {
        if (!p) {
            lines.push('');
            return;
        }
        const words = p.split(' ');
        let currentLine = words[0] || '';
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
    });
    return lines;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
}


export function drawNode(ctx: CanvasRenderingContext2D, node: Node, isSelected: boolean, font: string, fontSize: number, defaultFontColor: string, diagramType: DiagramType) {
  ctx.save();
  
  // Node Shape & Style
  const nodeStyle = getNodeStyle(node, diagramType);
  ctx.fillStyle = node.fillColor || nodeStyle.fillColor;
  ctx.strokeStyle = isSelected ? '#2563EB' : nodeStyle.borderColor;
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  const shape = node.shape || 'rectangle';
  if (shape === 'ellipse') {
    drawEllipse(ctx, node.x, node.y, node.width, node.height);
  } else {
    drawRoundedRect(ctx, node.x, node.y, node.width, node.height, nodeStyle.borderRadius);
  }
  
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Text Style
  ctx.fillStyle = node.textColor || defaultFontColor;
  ctx.font = `${node.isHeader ? 'bold' : ''} ${fontSize}px ${font}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const lines = wrapText(ctx, node.text, node.width - PADDING * 2, fontSize);
  lines.forEach((line, i) => {
    const textMetrics = ctx.measureText(line);
    let xPos = node.x + PADDING;
    if (diagramType === 'Mapa Mental' && node.shape === 'ellipse') { // Center text for ellipses
      xPos = node.x + (node.width - textMetrics.width) / 2;
    }
    ctx.fillText(line, xPos, node.y + PADDING + i * (fontSize * LINE_HEIGHT_MULTIPLIER));
  });
}

function getNodeStyle(node: Node, diagramType: DiagramType) {
  switch (diagramType) {
    case 'Mapa Mental':
      if (node.level === 0) return { fillColor: '#AECBFA', borderColor: '#4285F4', borderRadius: 25 };
      if (node.level === 1) return { fillColor: '#C5E1A5', borderColor: '#7CB342', borderRadius: 20 };
      return { fillColor: '#FFF9C4', borderColor: '#FBC02D', borderRadius: 15 };
    case 'Ishikawa':
      if (node.id === '1') return { fillColor: '#FFCDD2', borderColor: '#E53935', borderRadius: 4 }; // Effect
      return { fillColor: '#E1F5FE', borderColor: '#0288D1', borderRadius: 4 };
    case '5W2H':
      if (node.isHeader) return { fillColor: '#E0E0E0', borderColor: '#616161', borderRadius: 0 };
      return { fillColor: '#FFFFFF', borderColor: '#BDBDBD', borderRadius: 0 };
    default:
      return { fillColor: '#FFFFFF', borderColor: '#333333', borderRadius: 8 };
  }
}

export function drawConnection(ctx: CanvasRenderingContext2D, from: Node, to: Node, diagramType: DiagramType, allNodes: Node[]) {
  if (diagramType === '5W2H') return; 

  if (diagramType === 'Ishikawa') {
    const effectNode = allNodes.find(n => n.id === '1');
    if (!effectNode) return;
    const spineY = effectNode.y + effectNode.height / 2;
    
    const color = '#455A64';
    const lineWidth = 2;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    // Main bone (Category -> Effect)
    if (to.id === '1') {
        const startX = from.x + from.width / 2;
        const startY = spineY;
        const endX = from.x + from.width / 2;
        const endY = from.y + (from.y < spineY ? from.height : 0);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    } 
    // Sub-cause bone (Sub-cause -> Category)
    else {
        const startX = from.x + (from.x > to.x ? 0 : from.width);
        const startY = from.y + from.height / 2;
        
        const endX = to.x + to.width / 2;
        const endY = startY;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    ctx.restore();
    return;
  }
  
  const fromX = from.x + from.width / 2;
  const fromY = from.y + from.height / 2;
  let toX = to.x + to.width / 2;
  let toY = to.y + to.height / 2;
  
  const color = '#90A4AE';
  const lineWidth = 1.5;
  
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  
  const toRadiusX = to.shape === 'ellipse' ? to.width / 2 : (to.width / 2) * Math.abs(Math.cos(angle));
  const toRadiusY = to.shape === 'ellipse' ? to.height / 2 : (to.height / 2) * Math.abs(Math.sin(angle));
  
  const intersectX = toRadiusX * Math.cos(angle);
  const intersectY = toRadiusY * Math.sin(angle);

  toX = toX - intersectX;
  toY = toY - intersectY;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);

  if (diagramType === 'Mapa Mental') {
    const c1x = fromX + dx * 0.5;
    const c1y = fromY;
    const c2x = fromX + dx * 0.5;
    const c2y = toY;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, toX, toY);
  } else {
     ctx.lineTo(toX, toY);
  }
  ctx.stroke();
  
  // Arrowhead
  const headLength = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function exportCanvasAsPNG(canvas: HTMLCanvasElement, diagramType: string) {
    const link = document.createElement('a');
    link.download = `${diagramType.toLowerCase()}-diagram.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}