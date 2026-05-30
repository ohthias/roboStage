import {
  BookOpen,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Table2,
  UsersRound,
} from "lucide-react";

export const NAVIGATION = {
  fll: {
    label: "FLL",
    scorePath: "score",
    menu: [
      { nome: "Flash Q&A", path: "flash-qa", icon: MessageSquare, description: "Plataforma de perguntas e respostas" },
      { nome: "Guias", path: "docs", icon: BookOpen, description: "Documentação e tutoriais" },
      { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para competições" },
    ],
  },

  obr: {
    label: "OBR",
    scorePath: "score",
    menu: [
      { nome: "Construtor de Arenas", path: "arena", icon: LayoutDashboard, description: "Ferramenta para criação de arenas de competição" },
      { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para competições" },
      { nome: "Guias", path: "docs", icon: BookOpen, description: "Documentação e tutoriais" },
      { nome: "Comunidade", path: "community", icon: UsersRound, description: "Comunidade de usuários" },
    ],
  },
};