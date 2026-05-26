import type { SeasonKey } from '@/types/heatmap';
import { SEASONS } from './seasons';

/**
 * Merges the table canvas and heatmap overlay into a single PNG and triggers download.
 */
export function exportCanvasPNG(
  tableCanvas: HTMLCanvasElement,
  heatmapCanvas: HTMLCanvasElement,
  season: SeasonKey
): void {
  const season_data = SEASONS[season];
  const w = tableCanvas.width;
  const h = tableCanvas.height;

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;

  // Composite layers
  ctx.drawImage(tableCanvas, 0, 0);
  ctx.drawImage(heatmapCanvas, 0, 0);

  // Watermark bar
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, w, 30);

  ctx.fillStyle = season_data.accentColor;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('QUICKBRICK – HEATMAP DA MESA', 12, 15);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'right';
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  ctx.fillText(`${season_data.name} | ${dateStr}`, w - 12, 15);

  // Trigger download
  const link = document.createElement('a');
  link.download = `heatmap-mesa-${season}-${Date.now()}.png`;
  link.href = out.toDataURL('image/png', 1.0);
  link.click();
}

/**
 * Returns a data URL of the merged canvas (for sharing / uploading to cloud).
 */
export function getCanvasDataURL(
  tableCanvas: HTMLCanvasElement,
  heatmapCanvas: HTMLCanvasElement
): string {
  const out = document.createElement('canvas');
  out.width = tableCanvas.width;
  out.height = tableCanvas.height;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(tableCanvas, 0, 0);
  ctx.drawImage(heatmapCanvas, 0, 0);
  return out.toDataURL('image/png', 1.0);
}
