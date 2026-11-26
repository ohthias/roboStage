import type { League } from "@/types/league";

export const COMPETICOES = {
  fll: {
    nome: "FLL",
    full: "FIRST LEGO League",
  },
  ftc: {
    nome: "FTC",
    full: "FIRST Tech Challenge",
  },
  obr: {
    nome: "OBR",
    full: "Olimpíada Brasileira de Robótica",
  },
} satisfies Record<League, { nome: string; full: string }>;