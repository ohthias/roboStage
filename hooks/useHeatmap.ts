'use client';

import { useCallback, useReducer, useRef } from 'react';
import { nanoid } from 'nanoid';
import type {
  HeatPoint, HeatmapConfig, HeatmapMode, HeatmapStats, SeasonKey,
} from '@/types/heatmap';
import { computeStats, findNearestPoint } from '@/utils/heatmap/heatmap';

// ── State ────────────────────────────────────────────────────────────────────

type State = {
  points: HeatPoint[];
  mode: HeatmapMode;
  season: SeasonKey;
  config: HeatmapConfig;
  stats: HeatmapStats;
};

type Action =
  | { type: 'ADD_POINT';    x: number; y: number }
  | { type: 'REMOVE_NEAREST'; x: number; y: number }
  | { type: 'DELETE_BY_ID'; id: string }
  | { type: 'CLEAR' }
  | { type: 'UNDO' }
  | { type: 'SET_MODE';   mode: HeatmapMode }
  | { type: 'SET_SEASON'; season: SeasonKey }
  | { type: 'SET_CONFIG'; patch: Partial<HeatmapConfig> };

const INITIAL_STATS: HeatmapStats = {
  totalPoints: 0, maxIntensity: 0, hotspot: null, zoneCount: 0,
};

const INITIAL_STATE: State = {
  points:  [],
  mode:    'add',
  season:  'unearthed',
  config: { brushRadius: 30, opacity: 0.7, clickIntensity: 3 },
  stats:   INITIAL_STATS,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_POINT': {
      const { x, y } = action;
      const mergeRadius = state.config.brushRadius / 600 * 0.5;
      const existing = state.points.find(
        (p) => Math.hypot(p.x - x, p.y - y) < mergeRadius
      );
      let nextPoints: HeatPoint[];
      if (existing) {
        nextPoints = state.points.map((p) =>
          p.id === existing.id
            ? { ...p, intensity: Math.min(p.intensity + state.config.clickIntensity, 20) }
            : p
        );
      } else {
        nextPoints = [
          ...state.points,
          { id: nanoid(6), x, y, intensity: state.config.clickIntensity, timestamp: Date.now() },
        ];
      }
      return { ...state, points: nextPoints, stats: computeStats(nextPoints) };
    }

    case 'REMOVE_NEAREST': {
      const nearest = findNearestPoint(state.points, action.x, action.y);
      if (!nearest) return state;
      const nextPoints = state.points.filter((_, i) => i !== nearest.index);
      return { ...state, points: nextPoints, stats: computeStats(nextPoints) };
    }

    case 'DELETE_BY_ID': {
      const nextPoints = state.points.filter((p) => p.id !== action.id);
      return { ...state, points: nextPoints, stats: computeStats(nextPoints) };
    }

    case 'CLEAR':
      return { ...state, points: [], stats: INITIAL_STATS };

    case 'UNDO': {
      if (!state.points.length) return state;
      const nextPoints = state.points.slice(0, -1);
      return { ...state, points: nextPoints, stats: computeStats(nextPoints) };
    }

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SEASON':
      return { ...state, season: action.season };

    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.patch } };

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useHeatmap() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const historyRef = useRef<HeatPoint[][]>([]);

  const addPoint = useCallback((x: number, y: number) => {
    historyRef.current.push([...state.points]);
    dispatch({ type: 'ADD_POINT', x, y });
  }, [state.points]);

  const removeNearest = useCallback((x: number, y: number) => {
    dispatch({ type: 'REMOVE_NEAREST', x, y });
  }, []);

  const deleteById = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BY_ID', id });
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    dispatch({ type: 'CLEAR' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const setMode = useCallback((mode: HeatmapMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const setSeason = useCallback((season: SeasonKey) => {
    dispatch({ type: 'SET_SEASON', season });
  }, []);

  const setConfig = useCallback((patch: Partial<HeatmapConfig>) => {
    dispatch({ type: 'SET_CONFIG', patch });
  }, []);

  const imagePath = state.season === 'unearthed'
    ? '/images/QuickBrick/Estrategia_fundo.png'
    : state.season === 'bioglow'
      ? '/assets/bioglow-table.png'
      : null;

  return {
    ...state,
    addPoint,
    removeNearest,
    deleteById,
    clear,
    undo,
    setMode,
    setSeason,
    setConfig,
    imagePath,
  };
}
