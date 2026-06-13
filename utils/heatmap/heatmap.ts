import type { HeatPoint, HeatmapStats } from "@/types/heatmap";

/**
 * Converte HSL para RGB.
 * Hue: 120 = verde, 60 = amarelo, 0 = vermelho.
 */
function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = l - c / 2;

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Mapeia intensidade normalizada para a paleta:
 * verde -> amarelo -> vermelho
 */
function intensityToColor(intensity: number): [number, number, number] {
  const t = clamp01(intensity);

  // 120 = verde, 60 = amarelo, 0 = vermelho
  const hue = 120 * (1 - t);

  // Leve ajuste de luminosidade para dar mais presença nas áreas quentes
  const lightness = 46 + (1 - t) * 6;

  return hslToRgb(hue, 100, lightness);
}

/**
 * Renders the heatmap overlay onto a canvas.
 * Returns early (clears) if no points exist.
 */
export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  points: HeatPoint[],
  brushRadius: number,
  opacity: number,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (points.length === 0) return;

  const offscreen = document.createElement("canvas");
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;

  const ox = offscreen.getContext("2d");
  if (!ox) return;

  ox.clearRect(0, 0, canvasWidth, canvasHeight);

  const maxIntensity = Math.max(...points.map((p) => p.intensity), 1);
  const scaledRadius = brushRadius * (canvasWidth / 600);

  /**
   * Primeiro desenhamos blobs em branco com alpha proporcional à intensidade.
   * Depois fazemos a colorização com base no alpha do pixel.
   */
  points.forEach((p) => {
    const px = p.x * canvasWidth;
    const py = p.y * canvasHeight;
    const norm = clamp01(p.intensity / maxIntensity);
    const blobRadius = scaledRadius * 1.5;

    const gradient = ox.createRadialGradient(px, py, 0, px, py, blobRadius);

    // Núcleo forte
    gradient.addColorStop(0, `rgba(255,255,255,${0.95 * norm})`);
    // Meio
    gradient.addColorStop(0.45, `rgba(255,255,255,${0.55 * norm})`);
    // Borda suave
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ox.fillStyle = gradient;
    ox.beginPath();
    ox.arc(px, py, blobRadius, 0, Math.PI * 2);
    ox.fill();
  });

  const imageData = ox.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  let maxAlpha = 0;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > maxAlpha) maxAlpha = data[i];
  }

  if (maxAlpha === 0) return;

  const finalOpacity = clamp01(opacity);

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;

    const intensity = clamp01(alpha / maxAlpha);
    const [r, g, b] = intensityToColor(intensity);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.round(255 * finalOpacity * intensity);
  }

  ox.putImageData(imageData, 0, 0);
  ctx.drawImage(offscreen, 0, 0);
}

/**
 * Draws the table background, grid, mission zones, and labels onto a canvas.
 */
export function renderTable(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  seasonAccentColor: string,
  seasonTableColor: string,
  seasonName: string,
  missions: Array<{ id: number; rx: number; ry: number; rw: number; rh: number }>,
  tableImage?: HTMLImageElement | null,
): void {
  const w = canvasWidth;
  const h = canvasHeight;

  ctx.clearRect(0, 0, w, h);

  // Background: use image if available, else procedural
  if (tableImage) {
    ctx.drawImage(tableImage, 0, 0, w, h);
    return;
  }

  // Procedural table background
  ctx.fillStyle = seasonTableColor;
  ctx.beginPath();
  roundRect(ctx, 0, 0, w, h, 8);
  ctx.fill();

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  const cols = 8;
  const rows = 4;

  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo((w * i) / cols, 0);
    ctx.lineTo((w * i) / cols, h);
    ctx.stroke();
  }

  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (h * i) / rows);
    ctx.lineTo(w, (h * i) / rows);
    ctx.stroke();
  }

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, 2, 2, w - 4, h - 4, 6);
  ctx.stroke();

  // Mission zones
  const fontSize = Math.max(8, w * 0.012);

  missions.forEach((m) => {
    const mx = w * m.rx;
    const my = h * m.ry;
    const mw = w * m.rw;
    const mh = h * m.rh;

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    roundRect(ctx, mx, my, mw, mh, 4);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    roundRect(ctx, mx, my, mw, mh, 4);
    ctx.stroke();

    ctx.fillStyle = seasonAccentColor;
    ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`M${m.id}`, mx + mw / 2, my + mh / 2);
  });

  // Labels
  const labelSize = Math.max(10, w * 0.018);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = `${labelSize}px 'Syne', sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("HOME", w * 0.02, h * 0.03);

  ctx.textAlign = "right";
  ctx.fillText(seasonName, w * 0.98, h * 0.03);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.font = `${Math.max(8, w * 0.014)}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BASE AREA", w * 0.5, h * 0.9);
}

/**
 * Computes statistics from the current set of heat points.
 */
export function computeStats(points: HeatPoint[]): HeatmapStats {
  if (points.length === 0) {
    return { totalPoints: 0, maxIntensity: 0, hotspot: null, zoneCount: 0 };
  }

  const maxPt = points.reduce((a, b) => (a.intensity > b.intensity ? a : b));
  const zoneCount = clusterCount(points, 0.12);

  return {
    totalPoints: points.length,
    maxIntensity: Math.round(maxPt.intensity),
    hotspot: { x: Math.round(maxPt.x * 100), y: Math.round(maxPt.y * 100) },
    zoneCount,
  };
}

/**
 * Returns local intensity at a given position by summing nearby points.
 */
export function getLocalIntensity(
  points: HeatPoint[],
  x: number,
  y: number,
  brushRadius: number,
  canvasWidth: number,
): number {
  const thresh = (brushRadius / canvasWidth) * 1.2;

  return points
    .filter((p) => Math.hypot(p.x - x, p.y - y) < thresh)
    .reduce((sum, p) => sum + p.intensity, 0);
}

/**
 * Finds the nearest point to a given position, within maxDist (normalized).
 */
export function findNearestPoint(
  points: HeatPoint[],
  x: number,
  y: number,
  maxDist = 0.1,
): { index: number; point: HeatPoint } | null {
  let minDist = Infinity;
  let result: { index: number; point: HeatPoint } | null = null;

  points.forEach((p, i) => {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < minDist && d < maxDist) {
      minDist = d;
      result = { index: i, point: p };
    }
  });

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function clusterCount(pts: HeatPoint[], thresh: number): number {
  if (!pts.length) return 0;

  const visited = new Set<number>();
  let clusters = 0;

  pts.forEach((_, i) => {
    if (visited.has(i)) return;

    clusters++;
    const queue = [i];

    while (queue.length) {
      const ci = queue.shift()!;
      if (visited.has(ci)) continue;

      visited.add(ci);

      pts.forEach((q, j) => {
        if (
          !visited.has(j) &&
          Math.hypot(pts[ci].x - q.x, pts[ci].y - q.y) < thresh
        ) {
          queue.push(j);
        }
      });
    }
  });

  return clusters;
}