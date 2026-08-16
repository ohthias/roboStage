import type { LucideIcon } from "lucide-react";
import { BookOpen, Clock, Cuboid, Fish, Gamepad2, Leaf, MessageSquare, Palette, Pickaxe, School, ToyBrick, Telescope, File, NotepadText, ToolCase } from "lucide-react";

export type NavMenuItem = {
  nome: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  new?: boolean;
};

export type NavMenuGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: NavMenuItem[];
};

export const NAVIGATION = {
  fll: {
    label: "FLL",
    icon: ToyBrick,
    scorePath: "score",
    options: [
      { nome: "QuickBrick Studio", path: "quickbrick", icon: Cuboid },
      { nome: "Future Edition", path: "future-edition", icon: Gamepad2 },
      { nome: "Rúbrica de Avaliação", path: "rubric", icon: NotepadText, new: true },
    ],
    menus: [
      {
        key: "tools",
        label: "Ferramentas",
        icon: ToolCase,
        items: [
          { nome: "Flash Q&A", path: "flash-qa", icon: MessageSquare, description: "Plataforma de perguntas e respostas" },
          { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para competições" },
          { nome: "ThinkLab", path: "thinklab", icon: File, description: "Criação rápida de diagramas" },
        ],
      },
      {
        key: "resources",
        label: "Recursos",
        icon: BookOpen,
        items: [
          { nome: "Documentações", path: "docs", icon: BookOpen, description: "Documentação das temporadas da liga" },
          { nome: "Iniciantes da Challenge", path: "begins", icon: School, description: "FLL para equipes iniciantes" },
          { nome: "Iniciantes da Explore", path: "explore", icon: Telescope },
        ],
      },
    ] satisfies NavMenuGroup[],
    seasons: [
      { key: "bioglow", name: "BIOGLOW", period: "2026/2027", icon: Leaf },
      { key: "unearthed", name: "UNEARTHED", period: "2025/2026", icon: Pickaxe },
      { key: "submerged", name: "SUBMERGED", period: "2024/2025", icon: Fish },
      { key: "masterpiece", name: "MASTERPIECE", period: "2023/2024", icon: Palette },
    ],
  },
};