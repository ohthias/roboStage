import type { MissionZone, SeasonKey } from '@/types/heatmap';

// Normalized positions (rx, ry, rw, rh) relative to canvas size
const BASE_MISSIONS: MissionZone[] = [
  { id: 1,  rx: 0.06, ry: 0.08, rw: 0.09, rh: 0.24 },
  { id: 2,  rx: 0.17, ry: 0.06, rw: 0.09, rh: 0.18 },
  { id: 3,  rx: 0.29, ry: 0.08, rw: 0.08, rh: 0.22 },
  { id: 4,  rx: 0.40, ry: 0.05, rw: 0.09, rh: 0.20 },
  { id: 5,  rx: 0.52, ry: 0.08, rw: 0.09, rh: 0.20 },
  { id: 6,  rx: 0.63, ry: 0.05, rw: 0.09, rh: 0.25 },
  { id: 7,  rx: 0.78, ry: 0.08, rw: 0.09, rh: 0.18 },
  { id: 8,  rx: 0.10, ry: 0.40, rw: 0.09, rh: 0.22 },
  { id: 9,  rx: 0.24, ry: 0.38, rw: 0.10, rh: 0.22 },
  { id: 10, rx: 0.38, ry: 0.40, rw: 0.10, rh: 0.20 },
  { id: 11, rx: 0.52, ry: 0.38, rw: 0.10, rh: 0.22 },
  { id: 12, rx: 0.67, ry: 0.40, rw: 0.09, rh: 0.20 },
  { id: 13, rx: 0.80, ry: 0.38, rw: 0.09, rh: 0.22 },
  { id: 14, rx: 0.22, ry: 0.68, rw: 0.09, rh: 0.18 },
  { id: 15, rx: 0.47, ry: 0.68, rw: 0.10, rh: 0.18 },
];

// Extend per-season if layouts differ
const SEASON_MISSIONS: Partial<Record<SeasonKey, MissionZone[]>> = {};

export function getMissions(season: SeasonKey): MissionZone[] {
  return SEASON_MISSIONS[season] ?? BASE_MISSIONS;
}
