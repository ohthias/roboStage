/**
 * Catálogo de recursos por liga/competição.
 *
 * As ligas em si vivem no banco (tabela `leagues`) e novas ligas são só novas
 * linhas. O que cada liga libera dentro do Stagebook é definido aqui, em um
 * único lugar, a partir de um "perfil" reconhecido pelo código/nome da liga.
 * Ligas sem perfil conhecido caem no perfil `generic` (recursos gerais +
 * "em breve" para os recursos específicos de competição).
 *
 * Para liberar um recurso novo para uma liga: edite PROFILES abaixo.
 */

export type AccessLevel = "full" | "simple" | "paused" | "soon";

export type FeatureId = "runs" | "calibrabot" | "custom";

export const FEATURES: {
  id: FeatureId;
  label: string;
  tool: string;
  description: string;
}[] = [
  {
    id: "runs",
    label: "Testes de Runs",
    tool: "LabTest",
    description: "Testes vinculados à competição e à temporada da liga.",
  },
  {
    id: "calibrabot",
    label: "CalibraBot",
    tool: "LabTest",
    description: "Calibração de motores, giroscópio e PID do robô.",
  },
  {
    id: "custom",
    label: "Testes personalizados",
    tool: "LabTest",
    description: "Testes com parâmetros e indicadores definidos por você.",
  },
];

/** Recursos disponíveis em qualquer liga (não dependem da competição). */
export const GENERAL_FEATURES = [
  "StageBook",
  "ThinkLab",
  "Kanban",
  "Calendário",
  "Tags e milestones",
];

export const ACCESS_META: Record<
  AccessLevel,
  { label: string; badge: string }
> = {
  full: { label: "Completo", badge: "badge-primary" },
  simple: { label: "Simplificado", badge: "badge-info" },
  paused: { label: "Pausado", badge: "badge-warning" },
  soon: { label: "Em breve", badge: "badge-ghost" },
};

/** Texto curto explicando o nível de acesso de cada recurso. */
const RUNS_DETAIL: Record<AccessLevel, string> = {
  full: "Missões, valores e pontuação da temporada",
  simple: "Vínculo com a competição e a temporada",
  paused: "Criação temporariamente desabilitada",
  soon: "Ainda sem implementação para esta liga",
};

export type ProfileKey = "fll" | "fll-future" | "frc" | "ftc" | "generic";

type Profile = {
  key: ProfileKey;
  access: Record<FeatureId, AccessLevel>;
  note?: string;
};

const PROFILES: Record<ProfileKey, Profile> = {
  fll: {
    key: "fll",
    access: { runs: "full", calibrabot: "full", custom: "full" },
    note: "Founders Edition com configuração completa de missões.",
  },
  "fll-future": {
    key: "fll-future",
    access: { runs: "paused", calibrabot: "full", custom: "full" },
    note: "Funciona de forma semelhante à FRC e à FTC, sem missões.",
  },
  frc: {
    key: "frc",
    access: { runs: "simple", calibrabot: "full", custom: "full" },
  },
  ftc: {
    key: "ftc",
    access: { runs: "simple", calibrabot: "full", custom: "full" },
  },
  generic: {
    key: "generic",
    access: { runs: "soon", calibrabot: "full", custom: "full" },
  },
};

/** Descobre o perfil de uma liga pelo código e pelo nome cadastrados. */
export function resolveProfileKey(league: {
  code: string;
  name: string;
}): ProfileKey {
  const haystack = `${league.code} ${league.name}`.toLowerCase();
  if (/\b(fll|lego league)\b/.test(haystack) || haystack.includes("fll")) {
    return haystack.includes("future") ? "fll-future" : "fll";
  }
  if (/\bfrc\b/.test(haystack) || haystack.includes("first robotics")) return "frc";
  if (/\bftc\b/.test(haystack) || haystack.includes("tech challenge")) return "ftc";
  return "generic";
}

export type LeagueAccess = {
  profile: ProfileKey;
  note?: string;
  features: {
    id: FeatureId;
    label: string;
    tool: string;
    level: AccessLevel;
    detail: string;
  }[];
};

export function getLeagueAccess(league: {
  code: string;
  name: string;
}): LeagueAccess {
  const profile = PROFILES[resolveProfileKey(league)];
  return {
    profile: profile.key,
    note: profile.note,
    features: FEATURES.map((feature) => {
      const level = profile.access[feature.id];
      return {
        id: feature.id,
        label: feature.label,
        tool: feature.tool,
        level,
        detail: feature.id === "runs" ? RUNS_DETAIL[level] : feature.description,
      };
    }),
  };
}
