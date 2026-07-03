import {
  BookOpen,
  Clock,
  MessageSquare,
  ToyBrick,
} from "lucide-react";

export const NAVIGATION = {
  fll: {
    label: "FLL",
    scorePath: "score",
    icon: ToyBrick,
    menu: [
      { nome: "Flash Q&A", path: "flash-qa", icon: MessageSquare, description: "Plataforma de perguntas e respostas" },
      { nome: "Guias", path: "docs", icon: BookOpen, description: "Documentação e tutoriais" },
      { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para competições" },
    ],
  },
};