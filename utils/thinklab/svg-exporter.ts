import rough from 'roughjs';
import { jsPDF } from 'jspdf';
import { CanvasElement } from '@/types/thinklab.types';
import {
  getRoughOptions,
  getBezierControlPoints,
  getBezierPath,
  getDocumentPath,
  getCloudPath,
} from './rough-renderer';

export interface SvgExportOptions {
  padding?: number;
  backgroundColor?: string;
  transparentBackground?: boolean;
}

// Calculate the bounding box of a list of elements
export function getElementsBoundingBox(elements: CanvasElement[], padding = 40) {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const elMinX = Math.min(el.x, el.x + el.width);
    const elMaxX = Math.max(el.x, el.x + el.width);
    const elMinY = Math.min(el.y, el.y + el.height);
    const elMaxY = Math.max(el.y, el.y + el.height);

    if (el.points && el.points.length > 0) {
      el.points.forEach((p) => {
        minX = Math.min(minX, el.x + p.x);
        maxX = Math.max(maxX, el.x + p.x);
        minY = Math.min(minY, el.y + p.y);
        maxY = Math.max(maxY, el.y + p.y);
      });
    } else if (el.type === 'bezier') {
      const { p0, cp1, cp2, p3 } = getBezierControlPoints(el);
      [p0, cp1, cp2, p3].forEach((pt) => {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      });
    } else {
      minX = Math.min(minX, elMinX);
      maxX = Math.max(maxX, elMaxX);
      minY = Math.min(minY, elMinY);
      maxY = Math.max(maxY, elMaxY);
    }
  });

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(100, maxX - minX),
    height: Math.max(100, maxY - minY),
  };
}

// Convert all elements to a standalone SVG string
export function exportToSvgString(
  elements: CanvasElement[],
  options: SvgExportOptions = {}
): string {
  if (typeof document === 'undefined') return '';

  const {
    padding = 40,
    backgroundColor = '#ffffff',
    transparentBackground = false,
  } = options;

  const bounds = getElementsBoundingBox(elements, padding);
  const width = Math.ceil(bounds.width);
  const height = Math.ceil(bounds.height);

  // Create temporary SVG element to let roughjs create nodes
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('viewBox', `${bounds.minX} ${bounds.minY} ${width} ${height}`);
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);

  // Add Font definitions
  const defs = document.createElementNS(svgNS, 'defs');
  const style = document.createElementNS(svgNS, 'style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Patrick+Hand&family=Plus+Jakarta+Sans:wght@400;600&family=Fira+Code:wght@400;500&display=swap');
    text {
      user-select: none;
    }
  `;
  defs.appendChild(style);
  svg.appendChild(defs);

  // Background rect if not transparent
  if (!transparentBackground) {
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('x', `${bounds.minX}`);
    bgRect.setAttribute('y', `${bounds.minY}`);
    bgRect.setAttribute('width', `${width}`);
    bgRect.setAttribute('height', `${height}`);
    bgRect.setAttribute('fill', backgroundColor);
    svg.appendChild(bgRect);
  }

  const rc = rough.svg(svg);

  // Sort elements by zIndex
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  sorted.forEach((el) => {
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('opacity', `${el.opacity}`);

    const roughOptions = getRoughOptions(el);
    const x = el.x;
    const y = el.y;
    const w = el.width;
    const h = el.height;

    let node: SVGElement | null = null;

    switch (el.type) {
      case 'rectangle': {
        if (el.roundness) {
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
          node = rc.path(path, roughOptions);
        } else {
          node = rc.rectangle(x, y, w, h, roughOptions);
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
        node = rc.path(path, roughOptions);
        break;
      }

      case 'diamond': {
        const pts: [number, number][] = [
          [x + w / 2, y],
          [x + w, y + h / 2],
          [x + w / 2, y + h],
          [x, y + h / 2],
        ];
        node = rc.polygon(pts, roughOptions);
        break;
      }

      case 'ellipse': {
        node = rc.ellipse(x + w / 2, y + h / 2, Math.abs(w), Math.abs(h), roughOptions);
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
        
        const bodyNode = rc.path(bodyPath, roughOptions);
        const topNode = rc.ellipse(minX + rx, minY + ry, widthVal, ry * 2, roughOptions);
        group.appendChild(bodyNode);
        group.appendChild(topNode);
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
        node = rc.polygon(pts, roughOptions);
        break;
      }

      case 'document': {
        node = rc.path(getDocumentPath(el), roughOptions);
        break;
      }

      case 'cloud': {
        node = rc.path(getCloudPath(el), roughOptions);
        break;
      }

      case 'line': {
        node = rc.line(x, y, x + w, y + h, roughOptions);
        break;
      }

      case 'arrow': {
        const lineNode = rc.line(x, y, x + w, y + h, roughOptions);
        group.appendChild(lineNode);

        const angle = Math.atan2(h, w);
        const headLen = Math.max(14, el.strokeWidth * 4);
        const toX = x + w;
        const toY = y + h;
        const x1 = toX - headLen * Math.cos(angle - Math.PI / 6);
        const y1 = toY - headLen * Math.sin(angle - Math.PI / 6);
        const x2 = toX - headLen * Math.cos(angle + Math.PI / 6);
        const y2 = toY - headLen * Math.sin(angle + Math.PI / 6);

        const headPoly = document.createElementNS(svgNS, 'polygon');
        headPoly.setAttribute('points', `${toX},${toY} ${x1},${y1} ${x2},${y2}`);
        headPoly.setAttribute('fill', el.strokeColor);
        headPoly.setAttribute('stroke', el.strokeColor);
        headPoly.setAttribute('stroke-width', `${el.strokeWidth}`);
        group.appendChild(headPoly);
        break;
      }

      case 'bezier': {
        const { cp2, p3 } = getBezierControlPoints(el);
        const pathNode = rc.path(getBezierPath(el), roughOptions);
        group.appendChild(pathNode);

        if (el.hasArrowhead !== false) {
          const angle = Math.atan2(p3.y - cp2.y, p3.x - cp2.x);
          const headLen = Math.max(14, el.strokeWidth * 4);
          const x1 = p3.x - headLen * Math.cos(angle - Math.PI / 6);
          const y1 = p3.y - headLen * Math.sin(angle - Math.PI / 6);
          const x2 = p3.x - headLen * Math.cos(angle + Math.PI / 6);
          const y2 = p3.y - headLen * Math.sin(angle + Math.PI / 6);

          const headPoly = document.createElementNS(svgNS, 'polygon');
          headPoly.setAttribute('points', `${p3.x},${p3.y} ${x1},${y1} ${x2},${y2}`);
          headPoly.setAttribute('fill', el.strokeColor);
          headPoly.setAttribute('stroke', el.strokeColor);
          headPoly.setAttribute('stroke-width', `${el.strokeWidth}`);
          group.appendChild(headPoly);
        }
        break;
      }

      case 'path': {
        if (el.points && el.points.length > 1) {
          const pts: [number, number][] = el.points.map((p) => [x + p.x, y + p.y]);
          if (el.isClosed) {
            node = rc.polygon(pts, roughOptions);
          } else {
            node = rc.linearPath(pts, roughOptions);
          }
        }
        break;
      }

      case 'freedraw': {
        if (el.points && el.points.length > 1) {
          const pts: [number, number][] = el.points.map((p) => [x + p.x, y + p.y]);
          node = rc.curve(pts, roughOptions);
        }
        break;
      }

      default:
        break;
    }

    if (node) {
      group.appendChild(node);
    }

    // Add SVG text element if text exists
    if (el.text && el.text.trim().length > 0) {
      const fontSize = el.fontSize || 18;
      const fontFamily = el.fontFamily || 'Patrick Hand';
      const align = el.textAlign || 'center';
      const lines = el.text.split('\n');
      const lineHeight = fontSize * 1.35;
      const totalTextHeight = lines.length * lineHeight;

      let textX = el.x + el.width / 2;
      let textY = el.y + el.height / 2 - totalTextHeight / 2 + fontSize * 0.8;

      let textAnchor = 'middle';
      if (el.type === 'text') {
        textX = el.x;
        textY = el.y + fontSize * 0.8;
        textAnchor = 'start';
      } else if (align === 'left') {
        textX = el.x + 16;
        textAnchor = 'start';
      } else if (align === 'right') {
        textX = el.x + el.width - 16;
        textAnchor = 'end';
      }

      const textEl = document.createElementNS(svgNS, 'text');
      textEl.setAttribute('x', `${textX}`);
      textEl.setAttribute('y', `${textY}`);
      textEl.setAttribute('fill', el.strokeColor);
      textEl.setAttribute('font-family', `"${fontFamily}", cursive, sans-serif`);
      textEl.setAttribute('font-size', `${fontSize}px`);
      textEl.setAttribute('text-anchor', textAnchor);

      lines.forEach((line, i) => {
        const tspan = document.createElementNS(svgNS, 'tspan');
        tspan.setAttribute('x', `${textX}`);
        tspan.setAttribute('dy', i === 0 ? '0' : `${lineHeight}px`);
        tspan.textContent = line;
        textEl.appendChild(tspan);
      });

      group.appendChild(textEl);
    }

    svg.appendChild(group);
  });

  return new XMLSerializer().serializeToString(svg);
}

// Download SVG file directly in browser
export function downloadSvg(svgString: string, filename = 'diagrama-excaliflow.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convert SVG to PNG Data URL on an offscreen canvas
export async function generatePngDataUrl(
  svgString: string,
  width: number,
  height: number,
  scale = 2
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(scale, scale);

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      resolve(null);
    };
    img.onerror = reject;
    img.src = url;
  });

  URL.revokeObjectURL(url);
  return canvas.toDataURL('image/png');
}

// Download PNG file directly in browser with configurable scale
export async function downloadPng(
  svgString: string,
  width: number,
  height: number,
  filename = 'diagrama-excaliflow.png',
  scale = 2
) {
  const dataUrl = await generatePngDataUrl(svgString, width, height, scale);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Copy PNG Image to clipboard directly
export async function copyPngToClipboard(
  svgString: string,
  width: number,
  height: number,
  scale = 2
) {
  const dataUrl = await generatePngDataUrl(svgString, width, height, scale);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Área de transferência não suportada neste navegador.');
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
}

export interface PdfExportOptions {
  orientation?: 'auto' | 'portrait' | 'landscape';
  format?: 'a4' | 'a3' | 'letter';
  margin?: number;
  title?: string;
  includeHeader?: boolean;
}

// Generate jsPDF document object
export async function createPdfDocument(
  svgString: string,
  width: number,
  height: number,
  options: PdfExportOptions = {}
): Promise<jsPDF> {
  const {
    orientation: reqOrientation = 'auto',
    format = 'a4',
    margin = 36,
    title = 'Diagrama ExcaliFlow',
    includeHeader = false,
  } = options;

  // Generate high-resolution PNG image representation
  const pngDataUrl = await generatePngDataUrl(svgString, width, height, 2.5);

  let orientation: 'portrait' | 'landscape' = 'portrait';
  if (reqOrientation === 'auto') {
    orientation = width >= height ? 'landscape' : 'portrait';
  } else {
    orientation = reqOrientation;
  }

  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const headerHeight = includeHeader ? 46 : 0;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2 - headerHeight;

  // Fit image proportionally into page
  const scale = Math.min(usableWidth / width, usableHeight / height);
  const imgWidth = width * scale;
  const imgHeight = height * scale;

  // Center on page
  const x = margin + (usableWidth - imgWidth) / 2;
  const y = margin + headerHeight + (usableHeight - imgHeight) / 2;

  // Optional nice header
  if (includeHeader) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text(title, margin, margin + 14);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    pdf.text(`Exportado via ExcaliFlow · ${dateStr}`, margin, margin + 28);

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.75);
    pdf.line(margin, margin + 34, pageWidth - margin, margin + 34);
  }

  // Add metadata
  pdf.setProperties({
    title,
    subject: 'Diagrama e Fluxograma Hand-Drawn',
    author: 'ExcaliFlow',
    creator: 'ExcaliFlow Diagram Editor',
  });

  // Insert image
  pdf.addImage(pngDataUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
  return pdf;
}

// Download PDF document in client using jsPDF
export async function downloadPdf(
  svgString: string,
  width: number,
  height: number,
  filename = 'diagrama-excaliflow.pdf',
  options: PdfExportOptions = {}
) {
  const pdf = await createPdfDocument(svgString, width, height, options);
  pdf.save(filename);
}

// Open PDF preview in a new browser tab
export async function openPdfPreview(
  svgString: string,
  width: number,
  height: number,
  options: PdfExportOptions = {}
) {
  const pdf = await createPdfDocument(svgString, width, height, options);
  const blobUrl = pdf.output('bloburl');
  window.open(blobUrl, '_blank');
}

