import type { HeatPoint, MissionZone, SeasonKey } from "@/features/quickbrick/heatmap/types";
import type { Mission } from "@/features/quickbrick/sharks-simulator/types";
import {
  DEFAULT_MISSIONS,
  MISSIONS_STORAGE_KEY,
  isValidMissionList,
  pointInPolygon,
  polygonCenter,
} from "@/features/quickbrick/sharks-simulator/components/missions.service";
import { TAPETE_HEIGHT_CM, TAPETE_WIDTH_CM } from "@/features/quickbrick/sharks-simulator/components/constants";

/** Proporção do tapete (200 × 114 cm) — a mesa do mapa de calor segue a mesma. */
export const MAT_RATIO = TAPETE_WIDTH_CM / TAPETE_HEIGHT_CM;

// Zonas antigas do fundo procedural (só usadas quando não há imagem do tapete).
const SEASON_MISSIONS: Partial<Record<SeasonKey, MissionZone[]>> = {};

export function getMissions(season: SeasonKey): MissionZone[] {
  return SEASON_MISSIONS[season] ?? [];
}

/**
 * Missões do tapete, as mesmas do Sharks Simulator. Se a equipe editou as
 * missões no simulador, usa a versão salva no navegador.
 */
export function loadMatMissions(): Mission[] {
  if (typeof window === "undefined") return DEFAULT_MISSIONS;
  try {
    const raw = window.localStorage.getItem(MISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidMissionList(parsed)) return parsed;
    }
  } catch {
    // storage indisponível
  }
  return DEFAULT_MISSIONS;
}

/** Rótulo curto: "Missão 7" → "M07". Nomes livres ficam como estão. */
export function missionShortLabel(name: string): string {
  const m = name.match(/(\d+)\s*$/);
  return m ? `M${m[1].padStart(2, "0")}` : name;
}

/** Ponto normalizado (0–1, origem no topo) → cm (origem embaixo à esquerda). */
const toCm = (p: { x: number; y: number }) => ({
  x: p.x * TAPETE_WIDTH_CM,
  y: (1 - p.y) * TAPETE_HEIGHT_CM,
});

/** Distância de tolerância (cm) ao redor da zona — falha "perto" da missão conta. */
const NEAR_CM = 8;

export type MissionHeat = { mission: Mission; heat: number; points: number };

/**
 * Soma a intensidade dos pontos que caem dentro (ou a até 8 cm do centro)
 * de cada missão. Ordena da mais crítica para a menos.
 */
export function missionHeat(points: HeatPoint[], missions: Mission[]): MissionHeat[] {
  const rows = missions
    .filter((m) => m.vertices.length >= 3)
    .map((mission) => {
      const c = polygonCenter(mission.vertices);
      let heat = 0;
      let count = 0;
      for (const p of points) {
        const cm = toCm(p);
        if (pointInPolygon(cm, mission.vertices) || Math.hypot(cm.x - c.x, cm.y - c.y) <= NEAR_CM) {
          heat += p.intensity;
          count++;
        }
      }
      return { mission, heat, points: count };
    });
  return rows.filter((r) => r.points > 0).sort((a, b) => b.heat - a.heat);
}
