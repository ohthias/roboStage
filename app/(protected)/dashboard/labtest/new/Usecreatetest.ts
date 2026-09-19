import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type LegacyType =
  | ["switch", string | null, string | null]
  | ["range", number, number];

export interface LegacySubMission {
  id?: string;
  submission: string;
  points: number | number[];
  type: LegacyType;
  note?: string;
}

export interface LegacyMission {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments?: boolean;
  type: LegacyType;
  image?: string;
  "sub-mission"?: LegacySubMission[];
}

export interface FEObjective {
  id: string;
  label: string;
  type: "counter" | "toggle";
  min?: number;
  max?: number;
  pointsPerUnit?: number;
  points?: number;
}

export interface FEMission {
  id: string;
  code: string;
  title: string;
  description: string;
  image?: string;
  objectives: FEObjective[];
}

export type AnyMission = LegacyMission | FEMission;

export function isFEMission(m: AnyMission): m is FEMission {
  return Array.isArray((m as FEMission).objectives);
}

/** Resposta do usuário para uma missão selecionada dentro de uma "run" */
export interface MissionAnswer {
  missionId: string;
  order: number;
  value: number; // legado "switch": índice da opção escolhida | legado "range": valor numérico
  subAnswers: Record<string, number>; // sub-missão -> valor
  objectiveAnswers: Record<string, number>; // future-edition: objetivo -> valor
}

export interface Competition {
  id: string;
  name: string;
  code?: string;
  teamName?: string | null;
  season?: string | null;
}

export interface CustomParam {
  id: string;
  name: string;
  type: string;
  min?: number;
  max?: number;
}

export type CalibraMode = "motores" | "giroscópio" | "pid";
export type CreateTestMode = "runs" | "calibrabot" | "custom";

/* ------------------------------------------------------------------ */
/* Opções estáticas                                                    */
/* ------------------------------------------------------------------ */

/**
 * Registro central de competições suportadas no modo `runs`. Cada nova
 * competição entra aqui com o seu endpoint e regras de filtragem específicas.
 * O objetivo é manter o restante do fluxo inalterado, sem espalhar ifs por
 * toda a UI.
 */
type CompetitionRunConfig = {
  label: string;
  missionEndpoint?: string;
  missionIdPrefix?: string;
};

const COMPETITION_RUN_CONFIG: Record<string, CompetitionRunConfig> = {
  FLL: { label: "FLL Challenge", missionEndpoint: "/api/data/missions", missionIdPrefix: "M" },
  FLLC: { label: "FLL Challenge", missionEndpoint: "/api/data/missions", missionIdPrefix: "M" },
  FLLCHALLENGE: { label: "FLL Challenge", missionEndpoint: "/api/data/missions", missionIdPrefix: "M" },
  CHALLENGE: { label: "FLL Challenge", missionEndpoint: "/api/data/missions", missionIdPrefix: "M" },
  FUTUREEDITION: { label: "Future Edition", missionEndpoint: "/api/data/missions/future-edition", missionIdPrefix: "M" },
  "FUTURE-EDITION": { label: "Future Edition", missionEndpoint: "/api/data/missions/future-edition", missionIdPrefix: "M" },
  EXPLORE: { label: "FLL Explore" },
  FLLEXPLORE: { label: "FLL Explore" },
  DISCOVER: { label: "FLL Discover" },
  FLLDISCOVER: { label: "FLL Discover" },
};

function normalizeCompetitionCode(code?: string | null) {
  if (!code) return "";
  return code.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function resolveCompetitionRunConfig(code?: string | null) {
  if (!code) return undefined;
  return COMPETITION_RUN_CONFIG[normalizeCompetitionCode(code)];
}

/**
 * A partir do payload cru do endpoint, descobre se a competição tem várias
 * temporadas de jogo ou uma só:
 *
 * - `{ missions: [...] }`            -> uma única temporada, sem seletor.
 * - `{ masterpiece: [...], ... }`    -> várias temporadas: cada chave cujo
 *   valor é um array vira uma opção do select "Temporada".
 */
function deriveSeasons(data: unknown): { value: string; label: string }[] {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray((data as { missions?: unknown }).missions)) return [];

  return Object.entries(data as Record<string, unknown>)
    .filter(([, value]) => Array.isArray(value))
    .map(([key]) => ({ value: key, label: formatSeasonLabel(key) }));
}

function formatSeasonLabel(key: string) {
  return key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const CALIBRA_OPTIONS = [
  { value: "motores", label: "Motores" },
  { value: "giroscópio", label: "Giroscópio" },
  { value: "pid", label: "PID" },
] as const;

export const GIRO_ANALYSIS_OPTIONS = [
  { value: "erro", label: "Erro do giroscópio" },
  { value: "guinada", label: "Guinada" },
  { value: "tempo", label: "Tempo" },
  { value: "velocidade", label: "Velocidade" },
];

export const PID_PARAM_OPTIONS = [
  "valor_p",
  "valor_i",
  "valor_d",
  "k_p",
  "k_i",
  "k_d",
  "tempo",
  "velocidade",
];

export const CUSTOM_PARAM_TYPES = [
  { value: "number", label: "Numérico" },
  { value: "boolean", label: "Sim / Não" },
  { value: "text", label: "Texto" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

export function useCreateTest() {
  const [mode, setMode] = useState<CreateTestMode>("runs");

  /* ---------------- modo runs ---------------- */
  const [competitions, setCompetitions] = useState<Competition[]>([
    { id: "competition1", name: "Competição 1" },
    { id: "competition2", name: "Competição 2" },
  ]);
  const [competition, setCompetition] = useState("");
  const [season, setSeason] = useState("");
  const [missions, setMissions] = useState<AnyMission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [missionsError, setMissionsError] = useState<string | null>(null);
  const [selectedMissionIds, setSelectedMissionIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, MissionAnswer>>({});

  /* ---------------- modo calibrabot ---------------- */
  const [calibraMode, setCalibraMode] = useState<CalibraMode>("motores");
  const [motorInput, setMotorInput] = useState("");
  const [motors, setMotors] = useState<string[]>([]);
  const [motorTestType, setMotorTestType] = useState<"individual" | "duplas">("individual");
  const [giroAngle, setGiroAngle] = useState(90);
  const [giroAnalysis, setGiroAnalysis] = useState<string[]>([]);
  const [pidDistance, setPidDistance] = useState(50);
  const [pidParams, setPidParams] = useState<string[]>([]);

  /* ---------------- modo custom ---------------- */
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);

  const [generated, setGenerated] = useState<Record<string, unknown> | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON");

  /* -------------------------------------------------------------- */
  /* Busca as competições do usuário (com fallback silencioso)       */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    fetch("/api/competitions")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length) setCompetitions(data);
      })
      .catch(() => {
        /* mantém o fallback já definido no estado inicial */
      });
  }, []);

  /* -------------------------------------------------------------- */
  /* Competição selecionada -> endpoint de missões correspondente     */
  /* -------------------------------------------------------------- */
  const selectedCompetition = competitions.find((c) => c.id === competition);
  const selectedCompetitionConfig = resolveCompetitionRunConfig(selectedCompetition?.code);
  const missionEndpoint = selectedCompetitionConfig?.missionEndpoint;

  const [missionsData, setMissionsData] = useState<Record<string, unknown> | null>(null);
  const [seasonOptions, setSeasonOptions] = useState<{ value: string; label: string }[]>([]);
  const needsSeasonPick = seasonOptions.length > 0;

  const resetRunMissionState = () => {
    setSeason("");
    setMissions([]);
    setMissionsData(null);
    setSeasonOptions([]);
    setSelectedMissionIds([]);
    setAnswers({});
  };

  const handleModeChange = (nextMode: CreateTestMode) => {
    setMode(nextMode);
    if (nextMode === "runs") {
      resetRunMissionState();
    }
  };

  const handleCompetitionChange = (nextCompetition: string) => {
    setCompetition(nextCompetition);
    resetRunMissionState();
  };

  const handleSeasonChange = (nextSeason: string) => {
    setSeason(nextSeason);
    setSelectedMissionIds([]);
    setAnswers({});
    if (!nextSeason || !missionsData) {
      setMissions([]);
      return;
    }
    const selected = missionsData[nextSeason];
    setMissions(Array.isArray(selected) ? (selected as AnyMission[]) : []);
  };

  useEffect(() => {
    if (mode !== "runs" || !missionEndpoint) return;

    setLoadingMissions(true);
    setMissionsError(null);

    fetch(missionEndpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar as missões");
        return res.json();
      })
      .then((data) => {
        setMissionsData(data);
        const seasons = deriveSeasons(data);
        setSeasonOptions(seasons);
        if (seasons.length === 0) {
          setMissions(Array.isArray(data.missions) ? data.missions : []);
        }
      })
      .catch((err) => setMissionsError(err.message ?? "Erro ao buscar as missões"))
      .finally(() => setLoadingMissions(false));
  }, [mode, missionEndpoint]);

  const readyToFetchMissions = Boolean(missionEndpoint) && (!needsSeasonPick || Boolean(season));

  /* -------------------------------------------------------------- */
  /* Helpers - runs / missões                                        */
  /* -------------------------------------------------------------- */

  function toggleMission(id: string) {
    setSelectedMissionIds((prev) => {
      if (prev.includes(id)) {
        setAnswers((a) => {
          const rest = { ...a };
          delete rest[id];
          return rest;
        });
        return prev.filter((m) => m !== id);
      }
      setAnswers((a) => ({
        ...a,
        [id]: { missionId: id, order: prev.length, value: 0, subAnswers: {}, objectiveAnswers: {} },
      }));
      return [...prev, id];
    });
  }

  function moveMission(id: string, direction: -1 | 1) {
    setSelectedMissionIds((prev) => {
      const idx = prev.indexOf(id);
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }

  function updateAnswerValue(missionId: string, value: number) {
    setAnswers((a) => ({ ...a, [missionId]: { ...a[missionId], value } }));
  }

  function updateSubAnswer(missionId: string, subId: string, value: number) {
    setAnswers((a) => ({
      ...a,
      [missionId]: {
        ...a[missionId],
        subAnswers: { ...(a[missionId]?.subAnswers ?? {}), [subId]: value },
      },
    }));
  }

  function updateObjectiveAnswer(missionId: string, objId: string, value: number) {
    setAnswers((a) => ({
      ...a,
      [missionId]: {
        ...a[missionId],
        objectiveAnswers: { ...(a[missionId]?.objectiveAnswers ?? {}), [objId]: value },
      },
    }));
  }

  const availableMissions = missions.filter((m) => {
    const id = String(m.id).toUpperCase();
    const prefix = selectedCompetitionConfig?.missionIdPrefix?.toUpperCase();

    if (prefix && !id.startsWith(prefix)) return false;
    return !selectedMissionIds.includes(m.id);
  });
  const orderedSelected = selectedMissionIds
    .map((id) => missions.find((m) => m.id === id))
    .filter(Boolean) as AnyMission[];

  /* -------------------------------------------------------------- */
  /* Helpers - calibrabot                                            */
  /* -------------------------------------------------------------- */

  function addMotor() {
    const name = motorInput.trim();
    if (!name || motors.includes(name)) return;
    setMotors((m) => [...m, name]);
    setMotorInput("");
  }
  function removeMotor(name: string) {
    setMotors((m) => m.filter((x) => x !== name));
  }
  function toggleGiroAnalysis(v: string) {
    setGiroAnalysis((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));
  }
  function togglePidParam(v: string) {
    setPidParams((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));
  }
  function motorPairs(): [string, string][] {
    const pairs: [string, string][] = [];
    for (let i = 0; i < motors.length; i++) {
      for (let j = i + 1; j < motors.length; j++) pairs.push([motors[i], motors[j]]);
    }
    return pairs;
  }

  /* -------------------------------------------------------------- */
  /* Helpers - custom                                                */
  /* -------------------------------------------------------------- */

  function addCustomParam() {
    setCustomParams((p) => [...p, { id: uid(), name: "", type: "number", min: 0, max: 100 }]);
  }
  function updateCustomParam(id: string, patch: Partial<CustomParam>) {
    setCustomParams((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function removeCustomParam(id: string) {
    setCustomParams((p) => p.filter((c) => c.id !== id));
  }

  /* -------------------------------------------------------------- */
  /* Gerar teste                                                     */
  /* -------------------------------------------------------------- */

  function handleGenerate() {
    let payload: Record<string, unknown> = { mode };

    if (mode === "runs") {
      payload = {
        ...payload,
        competition,
        season,
        missions: orderedSelected.map((m, idx) => ({
          ...answers[m.id],
          missionId: m.id,
          name: isFEMission(m) ? m.title : m.name,
          order: idx,
        })),
      };
    } else if (mode === "calibrabot") {
      payload = {
        ...payload,
        calibraMode,
        ...(calibraMode === "motores" && {
          motors,
          motorTestType,
          pairs: motorTestType === "duplas" ? motorPairs() : undefined,
        }),
        ...(calibraMode === "giroscópio" && { targetAngle: giroAngle, analyze: giroAnalysis }),
        ...(calibraMode === "pid" && { targetDistance: pidDistance, params: pidParams }),
      };
    } else {
      payload = { ...payload, parameters: customParams };
    }

    setGenerated(payload);
    setCopyLabel("Copiar JSON");
  }

  function copyGenerated() {
    if (!generated) return;
    navigator.clipboard.writeText(JSON.stringify(generated, null, 2)).then(() => {
      setCopyLabel("Copiado!");
      setTimeout(() => setCopyLabel("Copiar JSON"), 1500);
    });
  }

  return {
    // modo
    mode,
    setMode: handleModeChange,

    // runs
    competitions,
    competition,
    setCompetition: handleCompetitionChange,
    season,
    setSeason: handleSeasonChange,
    seasonOptions,
    needsSeasonPick,
    selectedCompetition,
    selectedCompetitionConfig,
    missionEndpoint,
    missions,
    loadingMissions,
    missionsError,
    readyToFetchMissions,
    availableMissions,
    orderedSelected,
    answers,
    toggleMission,
    moveMission,
    updateAnswerValue,
    updateSubAnswer,
    updateObjectiveAnswer,

    // calibrabot
    calibraMode,
    setCalibraMode,
    motorInput,
    setMotorInput,
    motors,
    addMotor,
    removeMotor,
    motorTestType,
    setMotorTestType,
    motorPairs,
    giroAngle,
    setGiroAngle,
    giroAnalysis,
    toggleGiroAnalysis,
    pidDistance,
    setPidDistance,
    pidParams,
    togglePidParam,

    // custom
    customParams,
    addCustomParam,
    updateCustomParam,
    removeCustomParam,

    // gerar / preview
    generated,
    copyLabel,
    handleGenerate,
    copyGenerated,
  };
}