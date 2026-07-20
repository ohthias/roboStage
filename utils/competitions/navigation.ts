import {
  BookOpen,
  Clock,
  Cuboid,
  Fish,
  Gamepad2,
  Leaf,
  MessageSquare,
  Palette,
  Pickaxe,
  School,
  ToyBrick,
} from "lucide-react";

export const NAVIGATION = {
  fll: {
    label: "FLL",
    icon: ToyBrick,
    scorePath: "score",
    options: [
      { nome: "QuickBrick Studio", path: "quickbrick", icon: Cuboid},
      { nome: "Future Edition", path: "future-edition", icon: Gamepad2}
    ],
    menu: [
      { nome: "Flash Q&A", path: "flash-qa", icon: MessageSquare, description: "Plataforma de perguntas e respostas" },
      { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para competições" },
      { nome: "Guias", path: "docs", icon: BookOpen, description: "Documentação das temporadas da liga" },
      { nome: "Iniciantes", path: "begins", icon: School, description: "FLL para equipes iniciantes" },
    ],
    seasons: [
      { key: "bioglow", name: "BIOGLOW", period: "2026/2027", icon: Leaf },
      { key: "unearthed", name: "UNEARTHED", period: "2025/2026", icon: Pickaxe },
      { key: "submerged", name: "SUBMERGED", period: "2024/2025", icon: Fish },
      { key: "masterpiece", name: "MASTERPIECE", period: "2023/2024", icon: Palette },
    ]
  },
};