export type HeatPoint = {
  id: string;
  x: number; // normalized 0–1
  y: number; // normalized 0–1
  intensity: number;
  timestamp: number;
};

export type HeatmapMode = 'add' | 'remove' | 'view';

export type SeasonKey = 'unearthed';

export type Season = {
  key: SeasonKey;
  name: string;
  year: string;
  accentColor: string;
  tableColor: string;
  imagePath: string | null;
};

export type HeatmapStats = {
  totalPoints: number;
  maxIntensity: number;
  hotspot: { x: number; y: number } | null;
  zoneCount: number;
};

export type HeatmapConfig = {
  brushRadius: number;
  opacity: number;
  clickIntensity: number;
};

export type MissionZone = {
  id: number;
  rx: number;
  ry: number;
  rw: number;
  rh: number;
};
