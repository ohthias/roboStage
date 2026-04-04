import {
  BookOpen,
  Clock,
  MessageSquare,
  Table2,
  Trophy,
} from "lucide-react";

export const NAVIGATION = {
  fll: {
    label: "FLL",
    scorePath: "score",
    menu: [
      { nome: "QuickBrick Studio", path: "quickbrick", icon: Table2 },
      { nome: "Flash Q&A", path: "flash-qa", icon: MessageSquare },
      { nome: "Guias", path: "docs", icon: BookOpen },
      { nome: "Timers", path: "timers", icon: Clock },
    ],
  },

  obr: {
    label: "OBR",
    scorePath: "score",
    menu: [
      { nome: "Arena", path: "arena", icon: Table2 },
      { nome: "Resgate", path: "resgate", icon: MessageSquare },
      { nome: "Guias", path: "docs", icon: BookOpen },
    ],
  },
};