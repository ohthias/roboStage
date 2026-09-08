// lib/confere-ai/types.ts
// Tipos usados pela ferramenta pública "ConfereAí".
// Mantidos sem `any` para garantir segurança de tipos em todo o fluxo.

export interface ConfereAIItem {
  id: string;
  text: string;
  important?: boolean;
}

export interface ConfereAIChecklist {
  id: string;
  title: string;
  description?: string;
  items: ConfereAIItem[];
}

export type ConfereAIModeId = "daily" | "pre-championship" | "championship" | string;

export interface ConfereAIMode {
  id: ConfereAIModeId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  checklists: ConfereAIChecklist[];
}

export interface ConfereAIConfig {
  version: string;
  modes: ConfereAIMode[];
}

/** Item personalizado adicionado pelo usuário a uma checklist (padrão ou personalizada). */
export interface ConfereAICustomItem {
  id: string;
  checklistId: string;
  text: string;
  important?: boolean;
  createdAt: string;
}

/** Checklist inteira criada pelo usuário, vinculada a um modo. */
export interface ConfereAICustomChecklist {
  id: string;
  modeId: ConfereAIModeId;
  title: string;
  description?: string;
  items: ConfereAIItem[];
  createdAt: string;
}

/** Estado persistido localmente (cookie e/ou localStorage) do dispositivo do usuário. */
export interface ConfereAIState {
  version: number;
  activeMode: ConfereAIModeId;
  /** Itens personalizados agrupados por checklistId. */
  customItems: Record<string, ConfereAICustomItem[]>;
  /** Progresso: chave = itemId (padrão ou personalizado), valor = concluído. */
  completedItems: Record<string, boolean>;
  customChecklists: ConfereAICustomChecklist[];
}

export const CONFERE_AI_STATE_VERSION = 1;

export function createDefaultConfereAIState(activeMode: ConfereAIModeId = "daily"): ConfereAIState {
  return {
    version: CONFERE_AI_STATE_VERSION,
    activeMode,
    customItems: {},
    completedItems: {},
    customChecklists: [],
  };
}
