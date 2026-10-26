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

/** Competições com checklist própria. Cada uma tem seu JSON e seu estado salvo. */
export type ConfereAICompetition = "fll" | "obr";

export const CONFERE_AI_COMPETITIONS: Record<
  ConfereAICompetition,
  { label: string; configUrl: string; description: string; nextStepLabel: string }
> = {
  fll: {
    label: "FLL",
    configUrl: "/data/confere-ai.json",
    description:
      "Organize sua equipe para os treinos e campeonatos da FLL. Adicione itens personalizados às suas checklists, e acompanhe o progresso de forma simples e eficiente. ",
    nextStepLabel: "Próxima missão: estar pronto.",
  },
  obr: {
    label: "OBR",
    configUrl: "/data/obr/confere-ai.json",
    description:
      "Organize sua equipe para os treinos e etapas da OBR. Confira robô, sensores, calibração e materiais antes de cada round, e acompanhe o progresso de forma simples. ",
    nextStepLabel: "Próximo round: robô calibrado e pronto.",
  },
};

export function isConfereAICompetition(value: string): value is ConfereAICompetition {
  return value in CONFERE_AI_COMPETITIONS;
}

export function createDefaultConfereAIState(activeMode: ConfereAIModeId = "daily"): ConfereAIState {
  return {
    version: CONFERE_AI_STATE_VERSION,
    activeMode,
    customItems: {},
    completedItems: {},
    customChecklists: [],
  };
}
