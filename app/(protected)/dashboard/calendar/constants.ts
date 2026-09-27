// Constante compartilhada entre o server (actions.ts) e o client
// (calendar-view.tsx, event-modal.tsx). Fica em arquivo separado porque o
// módulo de server actions só pode exportar funções assíncronas — exportar
// um array de objetos de lá quebra a regra do Next.js sobre esse tipo de
// arquivo.
export const EVENT_TYPES = [
  { value: "treino", label: "Treino" },
  { value: "reuniao", label: "Reunião" },
  { value: "competicao", label: "Competição" },
  { value: "deadline", label: "Prazo" },
  { value: "projeto", label: "Projeto" },
  { value: "evento", label: "Evento" },
  { value: "outro", label: "Outro" },
] as const;
