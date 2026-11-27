// Estilos das barras de filtro do LabTest (lista de testes e página do teste):
// pílulas finas com os cantos assimétricos do RoboStage.

/** Pílula base; `active` pinta de primário. */
export const filterPill = (active = false) =>
  `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md border px-3 text-xs font-medium transition ${
    active
      ? "border-primary/50 bg-primary/5 text-primary"
      : "border-base-300/80 bg-base-100 text-base-content/70 hover:border-base-content/30 hover:text-base-content"
  }`;

/** Caixa dos menus suspensos (usar junto com `dropdown-content`). */
export const filterMenu =
  "dropdown-content z-30 mt-1.5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-base-300 bg-base-100 p-2 shadow-lg";

/** Título em mono no topo de um menu. */
export const filterMenuTitle =
  "px-2 pb-1.5 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/45";

/** Linha de opção dentro de um menu. */
export const filterOption = (active: boolean) =>
  `flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
    active ? "bg-primary/5 font-medium text-primary" : "hover:bg-base-200"
  }`;

/** Fecha o dropdown do daisyUI (que abre por foco). */
export const closeDropdown = () => (document.activeElement as HTMLElement | null)?.blur();
