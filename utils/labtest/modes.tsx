"use client";

// ---------------------------------------------------------------------------
// Registro de modos do LabTest
// ---------------------------------------------------------------------------
// Para adicionar um modo novo no futuro, basta acrescentar uma entrada aqui.
// Formulário de criação, formulário de resposta e a tela de visualização lêem
// esse registro em vez de terem `if (mode === "...")` espalhado pelo código.
//
// `fieldSource`:
//   - "catalog": os campos vêm de um catálogo fixo (ex: missões da temporada).
//   - "user-defined": o usuário desenha os próprios campos na hora de criar o
//     teste (CalibraBot e Personalizado).
//
// Modos com `fieldSource: "user-defined"` reaproveitam automaticamente o
// mesmo editor de campos e o mesmo motor de lançamento/gráfico — é assim que
// o modo "Personalizado" nasce praticamente de graça a partir do CalibraBot.

import {
  ListOrdered,
  SlidersHorizontal,
  Target,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { FieldDefinition, ModeId } from "@/types/labtest.types";

export type AccentKey = "primary" | "secondary" | "accent" | "info";

export interface LabTestModeDefinition {
  id: ModeId;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  accent: AccentKey;
  fieldSource: "catalog" | "user-defined";
  /** Se true, a ordem dos campos importa e é definida por drag-and-drop na criação. */
  orderedFields: boolean;
  /** Tipos de campo permitidos quando o usuário desenha os próprios campos. */
  allowedFieldTypes: FieldDefinition["type"][];
  /** Requer seleção de temporada na criação (para buscar catálogo de missões). */
  requiresSeason: boolean;
}

export const LAB_TEST_MODES: Record<ModeId, LabTestModeDefinition> = {
  runs: {
    id: "runs",
    label: "Criação de Runs",
    sublabel: "Crie sequências de missões para gerar runs personalizadas",
    icon: ListOrdered,
    accent: "primary",
    fieldSource: "catalog",
    orderedFields: true,
    allowedFieldTypes: ["number"],
    requiresSeason: true,
  },
  custom: {
    id: "custom",
    label: "Personalizado",
    sublabel: "Defina os próprios parâmetros e analise o que quiser",
    icon: Sparkles,
    accent: "info",
    fieldSource: "user-defined",
    orderedFields: false,
    allowedFieldTypes: ["number", "boolean", "text", "select", "duration"],
    requiresSeason: false,
  },
};

export const LAB_TEST_MODE_LIST = Object.values(LAB_TEST_MODES);

export function getModeDefinition(mode: ModeId): LabTestModeDefinition {
  return LAB_TEST_MODES[mode];
}

export const ACCENT_STYLES: Record<
  AccentKey,
  {
    text: string;
    bgSoft: string;
    /** versão mais sutil do bgSoft, usada em cards expandidos (evita gerar classes dinamicamente) */
    bgSoft3: string;
    borderSoft: string;
    btn: string;
    badgeBorder: string;
  }
> = {
  primary: {
    text: "text-primary",
    bgSoft: "bg-primary/12",
    bgSoft3: "bg-primary/3",
    borderSoft: "border-primary/25",
    btn: "btn-primary",
    badgeBorder: "border-primary/30",
  },
  secondary: {
    text: "text-secondary",
    bgSoft: "bg-secondary/12",
    bgSoft3: "bg-secondary/3",
    borderSoft: "border-secondary/25",
    btn: "btn-secondary",
    badgeBorder: "border-secondary/30",
  },
  accent: {
    text: "text-accent",
    bgSoft: "bg-accent/12",
    bgSoft3: "bg-accent/3",
    borderSoft: "border-accent/25",
    btn: "btn-accent",
    badgeBorder: "border-accent/30",
  },
  info: {
    text: "text-info",
    bgSoft: "bg-info/12",
    bgSoft3: "bg-info/3",
    borderSoft: "border-info/25",
    btn: "btn-info",
    badgeBorder: "border-info/30",
  },
};
