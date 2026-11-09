"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimationSegment, Coordinate, Mission, RobotConfig, RobotState } from "@/types/SharksSimulator.types";
import {
  DEFAULT_MISSIONS,
  completedMissionIds,
  computeMissionCompletionTimes,
  createMission,
  isValidMissionList,
  touchingMissionIds,
} from "./missions.service";

const STORAGE_KEY = "robostage:sharks-simulator:missions:v1";

/** Lista de missões editável, salva no navegador (localStorage). */
export const useMissions = () => {
  // O simulador só é montado no cliente (a página espera o matchMedia), então
  // é seguro ler o localStorage no inicializador.
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidMissionList(parsed)) return parsed;
      }
    } catch {
      // storage indisponível: segue com as missões padrão
    }
    return DEFAULT_MISSIONS;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    } catch {
      // ignora
    }
  }, [missions]);

  const addMission = useCallback(
    (center?: Coordinate): Mission => {
      const created = createMission(missions, center);
      setMissions((prev) => [...prev, created]);
      return created;
    },
    [missions],
  );

  const updateMission = useCallback((id: string, patch: Partial<Omit<Mission, "id">>) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const removeMission = useCallback((id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const resetMissions = useCallback(() => setMissions(DEFAULT_MISSIONS), []);

  const replaceMissions = useCallback((next: Mission[]) => setMissions(next), []);

  return { missions, addMission, updateMission, removeMission, resetMissions, replaceMissions };
};

/**
 * Estado das missões ao longo da simulação: quais já foram concluídas até o
 * tempo atual e quais o robô está tocando agora.
 */
export const useMissionProgress = (
  missions: Mission[],
  segments: AnimationSegment[],
  start: Coordinate,
  robotState: RobotState,
  robotConfig: RobotConfig,
  timeSeconds: number,
) => {
  const completionTimes = useMemo(
    () => computeMissionCompletionTimes(missions, segments, start),
    // start é um objeto novo a cada render; dependemos dos valores
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [missions, segments, start.x, start.y],
  );

  const completed = useMemo(
    () => completedMissionIds(completionTimes, timeSeconds * 1000),
    [completionTimes, timeSeconds],
  );

  const touching = useMemo(
    () => new Set(touchingMissionIds(robotState, robotConfig.widthCm, robotConfig.lengthCm, missions)),
    [robotState, robotConfig.widthCm, robotConfig.lengthCm, missions],
  );

  /** Missões que a trajetória planejada conclui (independente do tempo atual). */
  const reachable = useMemo(
    () => new Set(Object.entries(completionTimes).filter(([, t]) => t !== null).map(([id]) => id)),
    [completionTimes],
  );

  return { completionTimes, completed, touching, reachable };
};
