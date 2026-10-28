import {
  Flag,
  Gauge,
  Hourglass,
  Layers,
  ListChecks,
  ListOrdered,
  SlidersHorizontal,
  Timer,
  type LucideIcon,
} from "lucide-react";
import missionsCatalog from "@/public/data/missions.json";
import { FE_EDITION, formatClock, getMatchDuration } from "./future-edition";
import { getKitPreset } from "./kit-ia";
import { getObrPreset } from "./obr-presets";
import { OBR_EDITION } from "./obr";

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
export type StatusKey = keyof typeof STATUS_META;

/**
 * Aceita a chave ("em_andamento") ou o rótulo ("Em andamento"). Testes antigos
 * gravaram o rótulo no banco quando o primeiro lançamento era registrado.
 */
export function normalizeStatus(status: string | null | undefined): StatusKey | null {
  if (!status) return null;
  if (status in STATUS_META) return status as StatusKey;
  const entry = Object.entries(STATUS_META).find(
    ([, meta]) => meta.label.toLowerCase() === status.toLowerCase(),
  );
  return (entry?.[0] as StatusKey | undefined) ?? null;
}
export type TestImage = string | string[];

export function getModeMeta(mode: string) {
  return MODE_META[mode as ModeKey] ?? {
    label: mode,
    icon: Layers,
    badgeClass: "badge-neutral",
  };
}

/* -------------------------------------------------------------------------
 * Modos de run por competição (Round 2:30, Run completa, partida FE).
 * Cada competição define ícone e rótulo dos seus modos especiais, usados
 * como selo no card da listagem.
 * ------------------------------------------------------------------------- */

const FLL_SEASON_LOGOS: Record<string, string> = {
  masterpiece: "/images/logos/fll/seasons/Masterpiece.png",
  submerged: "/images/logos/fll/seasons/Submerged.webp",
  unearthed: "/images/logos/fll/seasons/Unearthed.webp",
  bioglow: "/images/logos/fll/seasons/bioglow_logo_founders_edition.webp",
};

type RunVariantDef = { label: string; icon: LucideIcon };

const RUN_VARIANTS: Record<
  string,
  {
    name: string;
    logo?: (season: string | null) => string | undefined;
    modes: Record<string, RunVariantDef>;
  }
> = {
  fll: {
    name: "FLL Challenge",
    logo: (season) => (season ? FLL_SEASON_LOGOS[season] : undefined),
    modes: {
      round: { label: "Round 2:30", icon: Timer },
      "run-completa": { label: "Run completa", icon: ListOrdered },
    },
  },
};

const FLL_CODES = new Set(["FLL", "FLLC", "FLLCHALLENGE", "CHALLENGE"]);

function resolveRunCompetition(season: string | null, config: Record<string, unknown>) {
  const code =
    typeof config.competitionCode === "string"
      ? config.competitionCode.replace(/[^a-z0-9]/gi, "").toUpperCase()
      : "";
  if (FLL_CODES.has(code)) return "fll";
  const name =
    typeof config.competitionName === "string" ? config.competitionName.toLowerCase() : "";
  if (name.includes("future")) return null;
  if (name.includes("fll") || name.includes("first lego")) return "fll";
  // Testes antigos sem código: temporada da FLL indica a competição.
  if (season && season in FLL_SEASON_LOGOS) return "fll";
  return null;
}

export type RunVariant = {
  competition: string;
  label: string;
  icon: LucideIcon;
  logo?: string;
};

/** Modo especial de uma run (Round 2:30 da FLL, partida da FE...) ou null. */
export function getRunVariant(test: {
  mode: string;
  season: string | null;
  config: unknown;
}): RunVariant | null {
  if (test.mode !== "runs" || !test.config || typeof test.config !== "object") return null;
  const config = test.config as Record<string, unknown>;

  // OBR Resgate: rodada pontuada como no Pontuador.
  if (config.edition === OBR_EDITION) {
    return { competition: "OBR Resgate", label: "Rodada OBR", icon: Flag };
  }

  // Future Edition: partida cronometrada (usa as imagens das missões FE).
  if (config.edition === FE_EDITION) {
    return {
      competition: "FLL Future Edition",
      label: `Partida ${formatClock(getMatchDuration(config))}`,
      icon: Hourglass,
    };
  }

  if (typeof config.runMode !== "string") return null;
  const key = resolveRunCompetition(test.season, config);
  const competition = key ? RUN_VARIANTS[key] : undefined;
  const def = competition?.modes[config.runMode];
  if (!competition || !def) return null;

  return {
    competition: competition.name,
    label: def.label,
    icon: def.icon,
    logo: competition.logo?.(test.season),
  };
}

export function summarizeConfig(mode: string, config: unknown): string {
  if (!config || typeof config !== "object") return "Sem configuração";

  const values = config as Record<string, unknown>;

  if (mode === "runs" && values.edition === FE_EDITION) {
    return `Future Edition · partida de ${formatClock(getMatchDuration(values))}`;
  }

  if (mode === "runs" && values.edition === OBR_EDITION) {
    const arena =
      values.arena && typeof values.arena === "object"
        ? (values.arena as { name?: unknown }).name
        : null;
    return `OBR Resgate · rodada${typeof arena === "string" ? ` · arena “${arena}”` : ""}`;
  }

  if (mode === "calibrabot" && values.tipo === "obr") {
    const preset = getObrPreset(typeof values.preset === "string" ? values.preset : null);
    const count = Array.isArray(values.parametros) ? values.parametros.length : 0;
    return `OBR · ${preset?.label ?? "teste"} · ${count} medição(ões)`;
  }

  if (mode === "calibrabot" && values.tipo === "kit-ia") {
    const preset = getKitPreset(typeof values.preset === "string" ? values.preset : null);
    const count = Array.isArray(values.parametros) ? values.parametros.length : 0;
    return `Kit Ciência e IA · ${preset?.label ?? "teste"} · ${count} parâmetro(s)`;
  }

  if (mode === "runs") {
    const list = Array.isArray(values.missions) ? values.missions : [];
    if (values.runMode === "round") {
      const missions = list.filter((id) => id !== "EL").length;
      return `Round 2:30 · ${missions} ${missions === 1 ? "missão" : "missões"} + inspeção`;
    }
    const missions = list.length;
    const prefix = values.runMode === "run-completa" ? "Run completa · " : "";
    return `${prefix}${missions} ${missions === 1 ? "missão" : "missões"}`;
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
  if (test.mode === "runs" && test.config && typeof test.config === "object") {
    const values = test.config as Record<string, unknown>;

    if (values.edition === FE_EDITION) {
      return "/images/labTest/run_FE.png";
    }

    if (values.edition === OBR_EDITION) {
      return "/images/labTest/run_OBR.png";
    }

    if (values.runMode === "round") return "/images/labTest/run_round.png";
    if (values.runMode === "run-completa") return "/images/labTest/run_completa.png";

    return getRunImages(test.season, test.config);
  }

  if ((test.mode === "calibrabot" || test.mode === "individual") && test.config && typeof test.config === "object") {
    const values = test.config as Record<string, unknown>;

    if (values.tipo === "obr") return "/images/labTest/calibrabot_obr.png";
    if (values.tipo === "motores") {
      return values.modo === "duplas"
        ? "/images/labTest/calibrabot_motores_duplas.png"
        : "/images/labTest/calibrabot_motores_individual.png";
    }

    if (values.tipo === "kit-ia") return "/images/labTest/calibrabot_kitIA.png";
    if (values.tipo === "giroscopio") return "/images/labTest/calibrabot_gyro.png";
    if (values.tipo === "pid") return "/images/labTest/calibrabot_PID.png";
  }

  return "/images/labTest/calibrabot_PID.png";
}
