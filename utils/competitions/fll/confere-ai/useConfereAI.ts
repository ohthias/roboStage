// lib/confere-ai/useConfereAI.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConfereAIConfig,
  ConfereAICustomChecklist,
  ConfereAIModeId,
  ConfereAIState,
  createDefaultConfereAIState,
} from "./types";
import { getConfereAIState, resetConfereAIState, setConfereAIState } from "./storage";
import { collectAllItemIdsForMode, generateId } from "./utils";

const CONFIG_URL = "/data/confere-ai.json";

type LoadStatus = "loading" | "error" | "ready";

export interface UseConfereAIResult {
  status: LoadStatus;
  config: ConfereAIConfig | null;
  state: ConfereAIState;
  reloadConfig: () => void;
  setActiveMode: (modeId: ConfereAIModeId) => void;
  toggleItem: (itemId: string) => void;
  markAllInMode: (modeId: ConfereAIModeId, completed: boolean) => void;
  addCustomItem: (checklistId: string, text: string, important?: boolean) => void;
  removeCustomItem: (checklistId: string, itemId: string) => void;
  addCustomChecklist: (modeId: ConfereAIModeId, title: string, description?: string) => string;
  updateCustomChecklist: (
    checklistId: string,
    updates: Partial<Pick<ConfereAICustomChecklist, "title" | "description">>
  ) => void;
  removeCustomChecklist: (checklistId: string) => void;
  resetProgress: () => void;
  restoreDefaults: () => void;
}

export function useConfereAI(): UseConfereAIResult {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [config, setConfig] = useState<ConfereAIConfig | null>(null);
  const [state, setState] = useState<ConfereAIState>(() => createDefaultConfereAIState());
  const hydrated = useRef(false);

  // Hidrata o estado salvo (cookie/localStorage) apenas no cliente, após o
  // primeiro render, para evitar qualquer divergência de hidratação com o
  // Server Component.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setState(getConfereAIState());
  }, []);

  const loadConfig = useCallback(() => {
    setStatus("loading");
    fetch(CONFIG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Falha ao carregar ${CONFIG_URL}: ${res.status}`);
        return res.json();
      })
      .then((data: ConfereAIConfig) => {
        setConfig(data);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const persist = useCallback((next: ConfereAIState) => {
    setState(next);
    setConfereAIState(next);
  }, []);

  const setActiveMode = useCallback(
    (modeId: ConfereAIModeId) => {
      persist({ ...state, activeMode: modeId });
    },
    [state, persist]
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      persist({
        ...state,
        completedItems: {
          ...state.completedItems,
          [itemId]: !state.completedItems[itemId],
        },
      });
    },
    [state, persist]
  );

  const markAllInMode = useCallback(
    (modeId: ConfereAIModeId, completed: boolean) => {
      if (!config) return;
      const mode = config.modes.find((m) => m.id === modeId);
      if (!mode) return;
      const ids = collectAllItemIdsForMode(mode, state.customChecklists, state.customItems);
      const nextCompleted = { ...state.completedItems };
      for (const id of ids) nextCompleted[id] = completed;
      persist({ ...state, completedItems: nextCompleted });
    },
    [config, state, persist]
  );

  const addCustomItem = useCallback(
    (checklistId: string, text: string, important?: boolean) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const newItem = {
        id: generateId("item"),
        checklistId,
        text: trimmed,
        important,
        createdAt: new Date().toISOString(),
      };
      const existing = state.customItems[checklistId] ?? [];
      persist({
        ...state,
        customItems: {
          ...state.customItems,
          [checklistId]: [...existing, newItem],
        },
      });
    },
    [state, persist]
  );

  const removeCustomItem = useCallback(
    (checklistId: string, itemId: string) => {
      const existing = state.customItems[checklistId] ?? [];
      const nextCompleted = { ...state.completedItems };
      delete nextCompleted[itemId];
      persist({
        ...state,
        customItems: {
          ...state.customItems,
          [checklistId]: existing.filter((i) => i.id !== itemId),
        },
        completedItems: nextCompleted,
      });
    },
    [state, persist]
  );

  const addCustomChecklist = useCallback(
    (modeId: ConfereAIModeId, title: string, description?: string): string => {
      const trimmedTitle = title.trim();
      const id = generateId("checklist");
      const newChecklist: ConfereAICustomChecklist = {
        id,
        modeId,
        title: trimmedTitle || "Nova checklist",
        description: description?.trim() || undefined,
        items: [],
        createdAt: new Date().toISOString(),
      };
      persist({
        ...state,
        customChecklists: [...state.customChecklists, newChecklist],
      });
      return id;
    },
    [state, persist]
  );

  const updateCustomChecklist = useCallback(
    (
      checklistId: string,
      updates: Partial<Pick<ConfereAICustomChecklist, "title" | "description">>
    ) => {
      persist({
        ...state,
        customChecklists: state.customChecklists.map((c) =>
          c.id === checklistId ? { ...c, ...updates } : c
        ),
      });
    },
    [state, persist]
  );

  const removeCustomChecklist = useCallback(
    (checklistId: string) => {
      const nextCustomItems = { ...state.customItems };
      delete nextCustomItems[checklistId];
      persist({
        ...state,
        customChecklists: state.customChecklists.filter((c) => c.id !== checklistId),
        customItems: nextCustomItems,
      });
    },
    [state, persist]
  );

  /** Limpa apenas o progresso marcado — mantém itens e checklists personalizadas. */
  const resetProgress = useCallback(() => {
    persist({ ...state, completedItems: {} });
  }, [state, persist]);

  /** Restaura tudo para o padrão de fábrica, removendo também personalizações. */
  const restoreDefaults = useCallback(() => {
    const next = resetConfereAIState(state.activeMode);
    setState(next);
  }, [state.activeMode]);

  return {
    status,
    config,
    state,
    reloadConfig: loadConfig,
    setActiveMode,
    toggleItem,
    markAllInMode,
    addCustomItem,
    removeCustomItem,
    addCustomChecklist,
    updateCustomChecklist,
    removeCustomChecklist,
    resetProgress,
    restoreDefaults,
  };
}
