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
      { nome: "Construtor de Arenas", path: "arena", icon: LayoutDashboard },
      { nome: "Timers", path: "timers", icon: Clock },
      { nome: "Guias", path: "docs", icon: BookOpen },
      { nome: "Comunidade", path: "community", icon: UsersRound },
    ],
  },

  wro: {
    label: "WRO",
    scorePath: "score",
    menu: [
    ]
  },

  tbr: {
    label: "TBR",
    scorePath: "score",
    menu : [
    ]
  },

  showlive: {
    label: "ShowLive",
    menu: [

    ]
  },
};