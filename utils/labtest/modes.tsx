// ---------------------------------------------------------------------------
// Fonte única de verdade sobre os 4 modos do LabTest.
// Qualquer tela nova que precisar de ícone/cor/rótulo de um modo usa este
// arquivo — inclusive o modo "Personalizado", sem precisar tocar em telas
// existentes (Dashboard, View, Form).
// ---------------------------------------------------------------------------

import { FlaskConical, Gauge, Target, Sparkles, type LucideIcon } from "lucide-react";
import type { ModeId } from "@/types/labtest.types";

export type AccentColor = "primary" | "secondary" | "accent" | "info";

export interface ModeDefinition {
  id: ModeId;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: AccentColor;
}

export const LAB_TEST_MODES: Record<ModeId, ModeDefinition> = {
  runs: {
    id: "runs",
    label: "Runs",
    description: "Pontuação de missões por round de competição",
    icon: Target,
    accent: "primary",
  },
  calibrabot: {
    id: "calibrabot",
    label: "CalibraBot",
    description: "Calibragem de variáveis técnicas do robô",
    icon: Gauge,
    accent: "info",
  },
  individual: {
    id: "individual",
    label: "Individual",
    description: "Missões isoladas, treino de precisão",
    icon: FlaskConical,
    accent: "secondary",
  },
  custom: {
    id: "custom",
    label: "Personalizado",
    description: "Parâmetros definidos livremente pela equipe",
    icon: Sparkles,
    accent: "accent",
  },
};

export const LAB_TEST_MODE_LIST: ModeDefinition[] = Object.values(LAB_TEST_MODES);

export function getModeDefinition(mode: ModeId): ModeDefinition {
  return LAB_TEST_MODES[mode] ?? LAB_TEST_MODES.custom;
}

// Classes utilitárias por cor de destaque — usadas por StatCard, badges, etc.
export const ACCENT_STYLES: Record<
  AccentColor,
  {
    bgSoft: string;
    bgSoft3: string;
    text: string;
    borderSoft: string;
    badgeBorder: string;
  }
> = {
  primary: {
    bgSoft: "bg-primary/10",
    bgSoft3: "bg-primary/5",
    text: "text-primary",
    borderSoft: "border-primary/20",
    badgeBorder: "badge-primary",
  },
  secondary: {
    bgSoft: "bg-secondary/10",
    bgSoft3: "bg-secondary/5",
    text: "text-secondary",
    borderSoft: "border-secondary/20",
    badgeBorder: "badge-secondary",
  },
  accent: {
    bgSoft: "bg-accent/10",
    bgSoft3: "bg-accent/5",
    text: "text-accent",
    borderSoft: "border-accent/20",
    badgeBorder: "badge-accent",
  },
  info: {
    bgSoft: "bg-info/10",
    bgSoft3: "bg-info/5",
    text: "text-info",
    borderSoft: "border-info/20",
    badgeBorder: "badge-info",
  },
};
