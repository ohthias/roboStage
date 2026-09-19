import { Gauge, Layers, ListChecks, SlidersHorizontal } from "lucide-react";
import missionsCatalog from "@/public/data/missions.json";

export type MissionCatalogEntry = {
  id: string;
  image?: string;
};

export const MODE_META = {
  runs: {
    label: "Runs",
    icon: ListChecks,
    badgeClass: "badge-primary",
  },
  calibrabot: {
    label: "Calibrabot",
    icon: Gauge,
    badgeClass: "badge-info",
  },
  individual: {
    label: "Calibrabot · Motores",
    icon: Gauge,
    badgeClass: "badge-info",
  },
  custom: {
    label: "Customizado",
    icon: SlidersHorizontal,
    badgeClass: "badge-secondary",
  },
} as const;

export const STATUS_META = {
  planejamento: {
    label: "Planejamento",
    badgeClass: "badge-ghost",
  },
  em_andamento: {
    label: "Em andamento",
    badgeClass: "badge-warning",
  },
  concluido: {
    label: "Concluído",
    badgeClass: "badge-success",
  },
  cancelado: {
    label: "Cancelado",
    badgeClass: "badge-error",
  },
} as const;

export type ModeKey = keyof typeof MODE_META;
export type TestImage = string | string[];

export function getModeMeta(mode: string) {
  return MODE_META[mode as ModeKey] ?? {
    label: mode,
    icon: Layers,
    badgeClass: "badge-neutral",
  };
}

export function summarizeConfig(mode: string, config: unknown): string {
  if (!config || typeof config !== "object") return "Sem configuração";

  const values = config as Record<string, unknown>;

  if (mode === "runs") {
    const missions = Array.isArray(values.missions) ? values.missions.length : 0;
    return `${missions} ${missions === 1 ? "missão" : "missões"}`;
  }

  if (mode === "individual" || (mode === "calibrabot" && values.tipo === "motores")) {
    const motors = Array.isArray(values.motores) ? values.motores.length : 0;
    const motorMode = typeof values.modo === "string" ? values.modo : "individual";
    return `${motors} ${motors === 1 ? "motor" : "motores"} · ${motorMode}`;
  }

  if (mode === "calibrabot" && values.tipo === "giroscopio") {
    const indicators = Array.isArray(values.indicadores) ? values.indicadores.length : 0;
    return `Alvo ${values.anguloAlvo ?? "?"}° · ${indicators} indicador(es)`;
  }

  if (mode === "calibrabot" && values.tipo === "pid") {
    const parameters = Array.isArray(values.parametros) ? values.parametros.length : 0;
    return `Distância ${values.distanciaAlvo ?? "?"}cm · ${parameters} parâmetro(s)`;
  }

  if (mode === "custom") {
    const parameters = Array.isArray(values.parametros) ? values.parametros.length : 0;
    return `${parameters} ${parameters === 1 ? "parâmetro" : "parâmetros"}`;
  }

  return "Configuração personalizada";
}

function getRunImages(season: string | null, config: unknown): string[] {
  if (!season || !config || typeof config !== "object") return [];

  const selectedMissionIds = (config as Record<string, unknown>).missions;
  if (!Array.isArray(selectedMissionIds)) return [];

  const missions = (missionsCatalog as Record<string, MissionCatalogEntry[]>)[season] ?? [];
  const missionsById = new Map(missions.map((mission) => [mission.id, mission]));

  return selectedMissionIds
    .filter((missionId): missionId is string => typeof missionId === "string")
    .map((missionId) => missionsById.get(missionId))
    .filter((mission): mission is MissionCatalogEntry => Boolean(mission?.image))
    .slice(0, 4)
    .map((mission) => mission.image as string);
}

export function getTestImage(test: {
  mode: string;
  season: string | null;
  config: unknown;
}): TestImage {
  if (test.mode === "runs") return getRunImages(test.season, test.config);
  if (test.mode === "custom") return "/images/labTest/labtest_custom.png";

  if ((test.mode === "calibrabot" || test.mode === "individual") && test.config && typeof test.config === "object") {
    const values = test.config as Record<string, unknown>;

    if (values.tipo === "motores") {
      return values.modo === "duplas"
        ? "/images/labTest/calibrabot_motor_duplas.png"
        : "/images/labTest/calibrabot_motores_individual.png";
    }

    if (values.tipo === "giroscopio") return "/images/labTest/calibrabot_gyro.png";
    if (values.tipo === "pid") return "/images/labTest/calibrabot_PID.png";
  }

  return "/images/labTest/calibrabot_PID.png";
}
