export interface SwotItem {
  id: string;
  text: string;
}

export interface SwotState {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export enum SwotCategory {
  Strengths = "strengths",
  Weaknesses = "weaknesses",
  Opportunities = "opportunities",
  Threats = "threats",
}

export interface SwotQuadrantConfig {
  id: SwotCategory;
  title: string;
  description: string;
  iconName: "Shield" | "AlertTriangle" | "Lightbulb" | "Swords";
  colorTheme: "emerald" | "rose" | "sky" | "amber";
}

export const QUADRANT_CONFIGS: SwotQuadrantConfig[] = [
  {
    id: SwotCategory.Strengths,
    title: "Pontos Fortes",
    description: "O que nosso robô faz bem?",
    iconName: "Shield",
    colorTheme: "emerald",
  },
  {
    id: SwotCategory.Weaknesses,
    title: "Pontos de Melhoria",
    description: "Onde o robô falha?",
    iconName: "AlertTriangle",
    colorTheme: "rose",
  },
  {
    id: SwotCategory.Opportunities,
    title: "Oportunidades",
    description: "Estratégias para ganhar pontos.",
    iconName: "Lightbulb",
    colorTheme: "sky",
  },
  {
    id: SwotCategory.Threats,
    title: "Riscos e Desafios",
    description: "Prazos, problemas na mesa e desafios externos.",
    iconName: "Swords",
    colorTheme: "amber",
  },
];
