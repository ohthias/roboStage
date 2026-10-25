import type { LucideIcon } from "lucide-react";
import { BookOpen, Clock, Flag, Trophy } from "lucide-react";

export type TimerMode = "robot-game" | "judging" | "custom" | "round";

export type TimerOption = {
  slug: TimerMode;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

const CUSTOM: TimerOption = {
  slug: "custom",
  title: "Timer Ajustável",
  description:
    "Timer personalizável para treinos, apresentações ou qualquer outra necessidade.",
  icon: Clock,
  color: "success",
};

/** Timers disponíveis por competição. */
export const TIMERS_BY_COMPETITION: Record<string, TimerOption[]> = {
  fll: [
    {
      slug: "robot-game",
      title: "Round do Robô",
      description:
        "Timer de rodada oficial para competições FLL, com contagem regressiva, alertas sonoros e visuais.",
      icon: Trophy,
      color: "primary",
    },
    {
      slug: "judging",
      title: "Sala de Avaliação",
      description:
        "Controle completo do tempo de Entrada, Apresentação, Perguntas e Feedback.",
      icon: BookOpen,
      color: "secondary",
    },
    CUSTOM,
  ],
  obr: [
    {
      slug: "round",
      title: "Round de Competição",
      description:
        "2min de calibração seguidos de 5min de round. Marque desistências de checkpoint e retire 1min a cada uma.",
      icon: Flag,
      color: "primary",
    },
    CUSTOM,
  ],
};

export function getTimers(competicao: string): TimerOption[] {
  return TIMERS_BY_COMPETITION[competicao] ?? [];
}
