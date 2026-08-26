import type { SeasonKey } from "@/types/heatmap";
import { SEASONS } from "./seasons";

/**
 * Carrega uma imagem via URL ou retorna a própria imagem, se já estiver pronta.
 */
function loadBackgroundImage(
  source: string | HTMLImageElement,
): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    if (source.complete) return Promise.resolve(source);

    return new Promise((resolve, reject) => {
      source.onload = () => resolve(source);
      source.onerror = reject;
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = source;
  });
}

/**
 * Monta a composição final: background + table + heatmap + watermark.
 */
async function buildMergedCanvas(
  tableCanvas: HTMLCanvasElement,
  heatmapCanvas: HTMLCanvasElement,
  season: SeasonKey,
  backgroundImage?: string | HTMLImageElement | null,
): Promise<HTMLCanvasElement> {
  const seasonData = SEASONS[season];
  const w = tableCanvas.width;
  const h = tableCanvas.height;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;

  const ctx = out.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível obter contexto 2D para exportação.");
  }

  // Background opcional
  if (backgroundImage) {
    try {
      const bg = await loadBackgroundImage(backgroundImage);
      ctx.drawImage(bg, 0, 0, w, h);
    } catch (error) {
      console.warn("Falha ao carregar imagem de background na exportação.", error);
    }
  }

  // Camadas principais
  ctx.drawImage(tableCanvas, 0, 0);
  ctx.drawImage(heatmapCanvas, 0, 0);

  return out;
}

/**
 * Merges the table canvas and heatmap overlay into a single PNG and triggers download.
 */
export async function exportCanvasPNG(
  tableCanvas: HTMLCanvasElement,
  heatmapCanvas: HTMLCanvasElement,
  season: SeasonKey,
  backgroundImage?: string | HTMLImageElement | null,
): Promise<void> {
  const out = await buildMergedCanvas(
    tableCanvas,
    heatmapCanvas,
    season,
    backgroundImage,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    out.toBlob((result) => resolve(result), "image/png");
  });

  if (!blob) {
    throw new Error("Falha ao gerar o PNG.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `heatmap-${season}-${Date.now()}.png`;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Returns a data URL of the merged canvas (for sharing / uploading to cloud).
 */
export async function getCanvasDataURL(
  tableCanvas: HTMLCanvasElement,
  heatmapCanvas: HTMLCanvasElement,
  season: SeasonKey,
  backgroundImage?: string | HTMLImageElement | null,
): Promise<string> {
  const out = await buildMergedCanvas(
    tableCanvas,
    heatmapCanvas,
    season,
    backgroundImage,
  );
  return out.toDataURL("image/png");
}