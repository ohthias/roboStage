// Constante compartilhada entre o server (actions.ts) e o client
// (calendar-view.tsx, event-modal.tsx). Fica em arquivo separado porque o
// módulo de server actions só pode exportar funções assíncronas — exportar
// um array de objetos de lá quebra a regra do Next.js sobre esse tipo de
// arquivo.
export const EVENT_TYPES = [
  { value: "treino", label: "Treino", color: "#2563eb" },
  { value: "reuniao", label: "Reunião", color: "#7c3aed" },
  { value: "competicao", label: "Competição", color: "#dc2626" },
  { value: "deadline", label: "Prazo", color: "#ea580c" },
  { value: "projeto", label: "Projeto", color: "#0891b2" },
  { value: "evento", label: "Evento", color: "#16a34a" },
  { value: "outro", label: "Outro", color: "#475569" },
] as const;

/** Cor de cada tipo — usada no calendário e no modal de evento. */
export const EVENT_TYPE_COLOR: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.color]),
);
