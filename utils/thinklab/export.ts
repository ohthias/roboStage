import jsPDF from 'jspdf';

/**
 * Downloads a file directly in the browser
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Clean clone of SVG element ensuring all styles and attributes are self-contained
 */
function createCleanSvgClone(svgElement: SVGSVGElement, bgColor: string = '#ffffff'): SVGSVGElement {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Set explicit dimensions
  const viewBox = svgElement.viewBox.baseVal;
  const width = viewBox.width || svgElement.clientWidth || 1400;
  const height = viewBox.height || svgElement.clientHeight || 800;

  clone.setAttribute('width', `${width}px`);
  clone.setAttribute('height', `${height}px`);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Inject font styles into the SVG
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    text {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }
  `;
  clone.insertBefore(styleEl, clone.firstChild);

  // Insert background rect if needed
  if (bgColor && bgColor !== 'transparent') {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', bgColor);
    // insert after style
    clone.insertBefore(bgRect, styleEl.nextSibling);
  }

  return clone;
}

/**
 * Exports SVG to standalone .svg file
 */
export function exportToSvg(svgElement: SVGSVGElement, filename = 'diagrama-ishikawa.svg', bgColor = '#ffffff') {
  const clone = createCleanSvgClone(svgElement, bgColor);
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // Add XML declaration
  if (!svgString.startsWith('<?xml')) {
    svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.svg') ? filename : `${filename}.svg`);
}

/**
 * Renders SVG to Canvas
 */
function svgToCanvas(
  svgElement: SVGSVGElement,
  scale = 3,
  bgColor = '#ffffff'
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const clone = createCleanSvgClone(svgElement, bgColor);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);

    const viewBox = svgElement.viewBox.baseVal;
    const width = viewBox.width || 1400;
    const height = viewBox.height || 800;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Exports diagram as High-Res PNG
 */
export async function exportToPng(
  svgElement: SVGSVGElement,
  filename = 'diagrama-ishikawa.png',
  scale = 3,
  bgColor = '#ffffff'
) {
  const canvas = await svgToCanvas(svgElement, scale, bgColor);
  canvas.toBlob((blob) => {
    if (blob) {
      triggerDownload(blob, filename.endsWith('.png') ? filename : `${filename}.png`);
    }
  }, 'image/png');
}

/**
 * Exports diagram as high quality PDF (A4 landscape or fitted)
 */
export async function exportToPdf(
  svgElement: SVGSVGElement,
  title = 'Diagrama de Ishikawa',
  filename = 'diagrama-ishikawa.pdf',
  bgColor = '#ffffff'
) {
  const canvas = await svgToCanvas(svgElement, 2.5, bgColor);
  const imgData = canvas.toDataURL('image/png');

  // A4 Landscape in mm: 297 x 210
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header banner
  pdf.setFillColor(30, 58, 138); // Navy
  pdf.rect(0, 0, pageWidth, 16, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DIAGRAMA DE ISHIKAWA (CAUSA E EFEITO)', 12, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(220, 230, 255);
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  pdf.text(`Gerado em: ${dateStr}`, pageWidth - 12, 11, { align: 'right' });

  // Main diagram image layout
  const marginX = 10;
  const marginY = 22;
  const availableWidth = pageWidth - marginX * 2;
  const availableHeight = pageHeight - marginY - 14;

  const imgRatio = canvas.width / canvas.height;
  let renderWidth = availableWidth;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > availableHeight) {
    renderHeight = availableHeight;
    renderWidth = renderHeight * imgRatio;
  }

  const posX = marginX + (availableWidth - renderWidth) / 2;
  const posY = marginY + (availableHeight - renderHeight) / 2;

  // Add diagram image
  pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

  // Footer notes
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Efeito Principal: ${title.slice(0, 90)}`, 12, pageHeight - 6);
  pdf.text('Ferramenta de Análise de Qualidade e Causa Raiz', pageWidth - 12, pageHeight - 6, { align: 'right' });

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Copies PNG image directly to clipboard
 */
export async function copyImageToClipboard(svgElement: SVGSVGElement, bgColor = '#ffffff'): Promise<boolean> {
  try {
    const canvas = await svgToCanvas(svgElement, 2, bgColor);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Falha ao copiar para clipboard:', err);
    return false;
  }
}

/**
 * Downloads text as a .md file
 */
export function downloadMarkdownFile(content: string, filename = 'ishikawa.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.md') ? filename : `${filename}.md`);
}
