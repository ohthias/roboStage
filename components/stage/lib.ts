import { twMerge } from "tailwind-merge";

/** Junta classes e resolve conflitos do Tailwind (a última vence). */
export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}

/** Tons da marca. `ink` = cor do texto (quase preto), `neutral` = areia, `paper` = base-100. */
export type Tone =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "neutral"
  | "ink"
  | "paper";

/** Texturas disponíveis (ver stage.css). */
export type Texture = "none" | "noise" | "paper" | "both";
export const textureClass: Record<Texture, string> = {
  none: "",
  noise: "stage-noise",
  paper: "stage-paper",
  both: "stage-texture",
};

/** Fundo + texto legível para cada tom (classes literais, para o Tailwind achar). */
export const toneFill: Record<Tone, string> = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  accent: "bg-accent text-accent-content",
  info: "bg-info text-info-content",
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content",
  neutral: "bg-neutral text-neutral-content",
  ink: "bg-base-content text-base-100",
  paper: "bg-base-100 text-base-content",
};

/** Ícone em caixa suave que enche no hover (padrão `toneClasses` da home). */
export const toneSoft: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content",
  secondary: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-content",
  accent:
    "bg-accent/20 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))] group-hover:bg-accent group-hover:text-accent-content",
  info: "bg-info/10 text-info group-hover:bg-info group-hover:text-info-content",
  success: "bg-success/10 text-success group-hover:bg-success group-hover:text-success-content",
  warning: "bg-warning/15 text-[color-mix(in_oklab,var(--color-warning)_60%,var(--color-base-content))] group-hover:bg-warning group-hover:text-warning-content",
  neutral: "bg-neutral/40 text-neutral-content group-hover:bg-neutral",
  ink: "bg-base-content/10 text-base-content group-hover:bg-base-content group-hover:text-base-100",
  paper: "bg-base-200 text-base-content group-hover:bg-base-300",
};

/** Só a cor do texto, para ícones e números. */
export const toneText: Record<Tone, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]",
  info: "text-info",
  success: "text-success",
  warning: "text-[color-mix(in_oklab,var(--color-warning)_60%,var(--color-base-content))]",
  neutral: "text-neutral-content",
  ink: "text-base-content",
  paper: "text-base-content",
};

/** Valor CSS da cor, para SVGs (stickers, divisores). */
export const toneVar: Record<Tone, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
  info: "var(--color-info)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  neutral: "var(--color-neutral)",
  ink: "var(--color-base-content)",
  paper: "var(--color-base-100)",
};
