import rough from 'roughjs';
import { CanvasElement, Point } from '@/types/thinklab.types';
import { getCachedImage } from './media-cache';
import { getIconDataUrl } from './icon-library';
import { EMOJI_FONT_STACK } from './emoji-library';

// Helper to get roughjs options from an element
export function getRoughOptions(element: CanvasElement) {
  const isNone = element.fillStyle === 'none' || !element.backgroundColor || element.backgroundColor === 'transparent';
  
  const options: Record<string, unknown> = {
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    roughness: element.roughness,
    bowing: 1.2,
    seed: 12345, // reproducible sketch shape
  };

  if (!isNone) {
    options.fill = element.backgroundColor;
    options.fillStyle = element.fillStyle;
    options.fillWeight = Math.max(1, element.strokeWidth / 1.5);
    options.hachureGap = 5;
  }

  if (element.strokeStyle === 'dashed') {
    options.strokeLineDash = [8, 6];
  } else if (element.strokeStyle === 'dotted') {
    options.strokeLineDash = [3, 4];
  }

  return options;
}

// Draw an arrowhead on canvas
export function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const headLen = Math.max(14, width * 4);

  const x1 = to.x - headLen * Math.cos(angle - Math.PI / 6);
  const y1 = to.y - headLen * Math.sin(angle - Math.PI / 6);
  const x2 = to.x - headLen * Math.cos(angle + Math.PI / 6);
  const y2 = to.y - headLen * Math.sin(angle + Math.PI / 6);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Compute Bézier 4 control points for an element
export function getBezierControlPoints(element: CanvasElement): {
  p0: Point;
  cp1: Point;
  cp2: Point;
  p3: Point;
} {
  const p0: Point = { x: element.x, y: element.y };
  const p3: Point = { x: element.x + element.width, y: element.y + element.height };

  const cp1: Point = {
    x: element.x + (element.controlPoint1 ? element.controlPoint1.x : element.width * 0.3),
    y: element.y + (element.controlPoint1 ? element.controlPoint1.y : -element.height * 0.4 - 30),
  };

  const cp2: Point = {
    x: element.x + (element.controlPoint2 ? element.controlPoint2.x : element.width * 0.7),
    y: element.y + (element.controlPoint2 ? element.controlPoint2.y : element.height * 1.4 + 30),
  };

  return { p0, cp1, cp2, p3 };
}

// Generate Bézier SVG path string
export function getBezierPath(element: CanvasElement): string {
  const { p0, cp1, cp2, p3 } = getBezierControlPoints(element);
  return `M ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p3.x} ${p3.y}`;
}

// Generate Flowchart Document SVG path string
export function getDocumentPath(element: CanvasElement): string {
  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);
  const w = maxX - minX;
  const waveHeight = Math.min(20, Math.abs(element.height) * 0.2);

  return `M ${minX} ${minY} 
    L ${maxX} ${minY} 
    L ${maxX} ${maxY - waveHeight} 
    Q ${minX + w * 0.75} ${maxY - waveHeight * 2} ${minX + w * 0.5} ${maxY - waveHeight} 
    Q ${minX + w * 0.25} ${maxY} ${minX} ${maxY - waveHeight} Z`;
}

// Generate Flowchart Cloud SVG path string
export function getCloudPath(element: CanvasElement): string {
  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);
  const w = maxX - minX;
  const h = maxY - minY;

  // 6 curved cloud lobes
  return `M ${minX + w * 0.2} ${minY + h * 0.4}
    C ${minX + w * 0.1} ${minY + h * 0.15}, ${minX + w * 0.35} ${minY}, ${minX + w * 0.5} ${minY + h * 0.1}
    C ${minX + w * 0.65} ${minY}, ${minX + w * 0.9} ${minY + h * 0.15}, ${minX + w * 0.85} ${minY + h * 0.4}
    C ${minX + w} ${minY + h * 0.5}, ${minX + w} ${minY + h * 0.8}, ${minX + w * 0.8} ${minY + h * 0.9}
    C ${minX + w * 0.7} ${minY + h}, ${minX + w * 0.3} ${minY + h}, ${minX + w * 0.2} ${minY + h * 0.9}
    C ${minX} ${minY + h * 0.8}, ${minX} ${minY + h * 0.5}, ${minX + w * 0.2} ${minY + h * 0.4} Z`;
}

// Render element onto Canvas context using RoughJS
export function renderElementToCanvas(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  element: CanvasElement
) {
  ctx.save();
  ctx.globalAlpha = element.opacity;

  const options = getRoughOptions(element);

  const x = element.x;
  const y = element.y;
  const w = element.width;
  const h = element.height;

  switch (element.type) {
    case 'rectangle': {
      if (element.roundness) {
        const r = Math.min(20, Math.abs(w) / 4, Math.abs(h) / 4);
        const minX = Math.min(x, x + w);
        const maxX = Math.max(x, x + w);
        const minY = Math.min(y, y + h);
        const maxY = Math.max(y, y + h);
        
        const path = `M ${minX + r} ${minY} 
          L ${maxX - r} ${minY} 
          Q ${maxX} ${minY} ${maxX} ${minY + r} 
          L ${maxX} ${maxY - r} 
          Q ${maxX} ${maxY} ${maxX - r} ${maxY} 
          L ${minX + r} ${maxY} 
          Q ${minX} ${maxY} ${minX} ${maxY - r} 
          L ${minX} ${minY + r} 
          Q ${minX} ${minY} ${minX + r} ${minY} Z`;
        rc.path(path, options);
      } else {
        rc.rectangle(x, y, w, h, options);
      }
      break;
    }

    case 'capsule': {
      const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
      const minX = Math.min(x, x + w);
      const maxX = Math.max(x, x + w);
      const minY = Math.min(y, y + h);
      const maxY = Math.max(y, y + h);
      
      const path = `M ${minX + r} ${minY} 
        L ${maxX - r} ${minY} 
        A ${r} ${r} 0 0 1 ${maxX - r} ${maxY} 
        L ${minX + r} ${maxY} 
        A ${r} ${r} 0 0 1 ${minX + r} ${minY} Z`;
      rc.path(path, options);
      break;
    }

    case 'diamond': {
      const pts: [number, number][] = [
        [x + w / 2, y],
        [x + w, y + h / 2],
        [x + w / 2, y + h],
        [x, y + h / 2],
      ];
      rc.polygon(pts, options);
      break;
    }

    case 'ellipse': {
      rc.ellipse(x + w / 2, y + h / 2, Math.abs(w), Math.abs(h), options);
      break;
    }

    case 'cylinder': {
      const minX = Math.min(x, x + w);
      const maxX = Math.max(x, x + w);
      const minY = Math.min(y, y + h);
      const maxY = Math.max(y, y + h);
      const widthVal = maxX - minX;
      const heightVal = maxY - minY;
      const rx = widthVal / 2;
      const ry = Math.min(24, heightVal / 5);

      const bodyPath = `M ${minX} ${minY + ry} 
        L ${minX} ${maxY - ry} 
        A ${rx} ${ry} 0 0 0 ${maxX} ${maxY - ry} 
        L ${maxX} ${minY + ry} Z`;
      
      rc.path(bodyPath, options);
      rc.ellipse(minX + rx, minY + ry, widthVal, ry * 2, options);
      rc.path(`M ${minX} ${maxY - ry} A ${rx} ${ry} 0 0 0 ${maxX} ${maxY - ry}`, options);
      break;
    }

    case 'parallelogram': {
      const offset = Math.min(30, Math.abs(w) * 0.25);
      const pts: [number, number][] = [
        [x + offset, y],
        [x + w, y],
        [x + w - offset, y + h],
        [x, y + h],
      ];
      rc.polygon(pts, options);
      break;
    }

    case 'document': {
      rc.path(getDocumentPath(element), options);
      break;
    }

    case 'cloud': {
      rc.path(getCloudPath(element), options);
      break;
    }

    case 'line': {
      rc.line(x, y, x + w, y + h, options);
      break;
    }

    case 'arrow': {
      const from = { x, y };
      const to = { x: x + w, y: y + h };
      rc.line(from.x, from.y, to.x, to.y, options);
      drawArrowhead(ctx, from, to, element.strokeColor, element.strokeWidth);
      break;
    }

    case 'bezier': {
      const { cp2, p3 } = getBezierControlPoints(element);
      const pathStr = getBezierPath(element);
      rc.path(pathStr, options);

      if (element.hasArrowhead !== false) {
        drawArrowhead(ctx, cp2, p3, element.strokeColor, element.strokeWidth);
      }
      break;
    }

    case 'path': {
      if (element.points && element.points.length > 1) {
        const pts: [number, number][] = element.points.map((p) => [x + p.x, y + p.y]);
        if (element.isClosed) {
          rc.polygon(pts, options);
        } else {
          rc.linearPath(pts, options);
        }
      }
      break;
    }

    case 'freedraw': {
      if (element.points && element.points.length > 1) {
        const pts: [number, number][] = element.points.map((p) => [x + p.x, y + p.y]);
        rc.curve(pts, options);
      }
      break;
    }

    case 'text': {
      break;
    }

    case 'emoji':
    case 'icon':
    case 'image': {
      renderMediaElement(ctx, element);
      break;
    }

    default:
      break;
  }

  // Render centered text for shapes or standalone text
  if (element.text && element.text.trim().length > 0) {
    renderText(ctx, element);
  }

  ctx.restore();
}

// Render formatted text inside or on element
export function renderText(ctx: CanvasRenderingContext2D, element: CanvasElement) {
  if (!element.text) return;

  const fontSize = element.fontSize || 18;
  const fontFamily = element.fontFamily || 'Patrick Hand';
  const align = element.textAlign || 'center';

  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = element.strokeColor;
  ctx.textBaseline = 'middle';

  const lines = element.text.split('\n');
  const lineHeight = fontSize * 1.35;
  const totalTextHeight = lines.length * lineHeight;

  let textX = element.x + element.width / 2;
  let textY = element.y + element.height / 2 - totalTextHeight / 2 + lineHeight / 2;

  if (element.type === 'text') {
    textX = element.x;
    textY = element.y + lineHeight / 2;
    ctx.textAlign = 'left';
  } else {
    ctx.textAlign = align;
    if (align === 'left') {
      textX = element.x + 16;
    } else if (align === 'right') {
      textX = element.x + element.width - 16;
    }
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, textX, textY + index * lineHeight);
  });
}

// Calculate connection anchor ports for flowchart shapes
export function getShapePorts(element: CanvasElement): Record<'top' | 'bottom' | 'left' | 'right', Point> {
  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  return {
    top: { x: midX, y: minY },
    bottom: { x: midX, y: maxY },
    left: { x: minX, y: midY },
    right: { x: maxX, y: midY },
  };
}

// Find closest connection port to a point
export function findClosestPort(
  point: Point,
  elements: CanvasElement[],
  excludeId?: string,
  threshold = 28
): { elementId: string; port: 'top' | 'bottom' | 'left' | 'right'; point: Point } | null {
  for (const el of elements) {
    if (el.id === excludeId) continue;
    if (el.type === 'line' || el.type === 'arrow' || el.type === 'freedraw' || el.type === 'bezier') continue;

    const ports = getShapePorts(el);
    for (const [portName, portPt] of Object.entries(ports)) {
      const dist = Math.hypot(portPt.x - point.x, portPt.y - point.y);
      if (dist <= threshold) {
        return {
          elementId: el.id,
          port: portName as 'top' | 'bottom' | 'left' | 'right',
          point: portPt,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Elementos de mídia: emoji, ícone e imagem
// ---------------------------------------------------------------------------

function normalizedBox(element: CanvasElement) {
  const x = Math.min(element.x, element.x + element.width);
  const y = Math.min(element.y, element.y + element.height);
  return { x, y, w: Math.abs(element.width), h: Math.abs(element.height) };
}

/** Retângulo "contain" de uma imagem com proporção `ratio` dentro da caixa. */
export function containRect(box: { x: number; y: number; w: number; h: number }, ratio: number) {
  if (!Number.isFinite(ratio) || ratio <= 0) return box;
  let w = box.w;
  let h = w / ratio;
  if (h > box.h) {
    h = box.h;
    w = h * ratio;
  }
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

/** Fonte do emoji: ocupa ~85% do menor lado da caixa. */
export function emojiFontSize(element: CanvasElement) {
  const { w, h } = normalizedBox(element);
  return Math.max(8, Math.min(w, h) * 0.85);
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }) {
  ctx.save();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.restore();
}

export function renderMediaElement(ctx: CanvasRenderingContext2D, element: CanvasElement) {
  const box = normalizedBox(element);

  if (element.type === 'emoji') {
    if (!element.emoji) return;
    ctx.save();
    ctx.font = `${emojiFontSize(element)}px ${EMOJI_FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    // ~6% para baixo compensa a linha de base dos emojis coloridos
    ctx.fillText(element.emoji, box.x + box.w / 2, box.y + box.h / 2 + box.h * 0.06);
    ctx.restore();
    return;
  }

  const src =
    element.type === 'icon'
      ? element.iconName
        ? getIconDataUrl(element.iconName, element.strokeColor, Math.max(1, element.strokeWidth))
        : null
      : element.imageSrc ?? null;
  if (!src) {
    drawPlaceholder(ctx, box);
    return;
  }

  const img = getCachedImage(src);
  if (!img) {
    if (element.type === 'image') drawPlaceholder(ctx, box);
    return;
  }

  const rect = element.type === 'icon' ? containRect(box, 1) : containRect(box, img.naturalWidth / img.naturalHeight);
  ctx.save();
  if (element.type === 'image' && element.roundness) {
    const r = Math.min(12, rect.w / 4, rect.h / 4);
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, r);
    ctx.clip();
  }
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
