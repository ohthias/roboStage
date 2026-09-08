// lib/confere-ai/utils.ts

import {
  ConfereAIChecklist,
  ConfereAICustomChecklist,
  ConfereAICustomItem,
  ConfereAIItem,
  ConfereAIMode,
} from "./types";

/** Gera um id razoavelmente único, sem depender de bibliotecas externas. */
export function generateId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

/** Um "item efetivo": item padrão do JSON ou item personalizado do usuário. */
export interface EffectiveItem extends ConfereAIItem {
  custom: boolean;
}

/** Combina os itens padrão de uma checklist com os itens personalizados do usuário. */
export function mergeChecklistItems(
  checklist: Pick<ConfereAIChecklist, "id" | "items">,
  customItemsByChecklist: Record<string, ConfereAICustomItem[]>
): EffectiveItem[] {
  const base: EffectiveItem[] = checklist.items.map((item) => ({
    ...item,
    custom: false,
  }));
  const extra: EffectiveItem[] = (customItemsByChecklist[checklist.id] ?? []).map(
    (item) => ({
      id: item.id,
      text: item.text,
      important: item.important,
      custom: true,
    })
  );
  return [...base, ...extra];
}

/** Calcula progresso (concluídos/total) para uma lista de itens efetivos. */
export function calculateProgress(
  items: EffectiveItem[],
  completedItems: Record<string, boolean>
): { done: number; total: number; percent: number } {
  const total = items.length;
  const done = items.filter((item) => completedItems[item.id]).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/** Encontra o primeiro item ainda não concluído (usado no modo Campeonato). */
export function findNextPendingItem(
  items: EffectiveItem[],
  completedItems: Record<string, boolean>
): EffectiveItem | null {
  return items.find((item) => !completedItems[item.id]) ?? null;
}

/** Retorna todas as checklists (padrão + personalizadas) de um modo, na ordem correta. */
export function getChecklistsForMode(
  mode: ConfereAIMode,
  customChecklists: ConfereAICustomChecklist[]
): Array<{ checklist: ConfereAIChecklist; custom: boolean }> {
  const defaultOnes = mode.checklists.map((checklist) => ({
    checklist,
    custom: false,
  }));
  const customOnes = customChecklists
    .filter((c) => c.modeId === mode.id)
    .map((c) => ({
      checklist: {
        id: c.id,
        title: c.title,
        description: c.description,
        items: c.items,
      } as ConfereAIChecklist,
      custom: true,
    }));
  return [...defaultOnes, ...customOnes];
}

/** Reúne todos os ids de itens (padrão + personalizados) de um modo — usado para o resumo geral. */
export function collectAllItemIdsForMode(
  mode: ConfereAIMode,
  customChecklists: ConfereAICustomChecklist[],
  customItemsByChecklist: Record<string, ConfereAICustomItem[]>
): string[] {
  const entries = getChecklistsForMode(mode, customChecklists);
  const ids: string[] = [];
  for (const { checklist } of entries) {
    const merged = mergeChecklistItems(checklist, customItemsByChecklist);
    for (const item of merged) ids.push(item.id);
  }
  return ids;
}
