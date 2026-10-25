/**
 * QuickBrick Studio — tipos e regras compartilhadas (cliente + servidor).
 * Sem dependências de servidor.
 */

import type { Layer } from "@/types/CanvasType";
import type { Risco } from "@/types/MatrizRisco";
import type { Column, Mission } from "@/types/TableAnalytics";
import type { HeatmapConfig, HeatPoint } from "@/types/heatmap";
import type { MilestoneDTO, TagDTO } from "@/types/labels";

export const NOTEBOOK_MAX_PHOTOS = 10;
export const PHOTO_MAX_BYTES = 12 * 1024 * 1024; // 12 MB
export const STUDIO_MAX_BYTES = 60 * 1024 * 1024; // 60 MB
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const DIAGRAM_KINDS = [
  "estrategia",
  "matriz-risco",
  "swot",
  "swot-missoes",
  "tabela-missoes",
  "heatmap",
] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

export const DIAGRAM_META: Record<
  DiagramKind,
  { label: string; short: string; description: string; color: string; needsSeason: boolean }
> = {
  estrategia: {
    label: "Estratégia de Mesa",
    short: "Estratégia",
    description: "Rotas, zonas e lançamentos do robô desenhados sobre a mesa.",
    color: "#cf2a2a",
    needsSeason: false,
  },
  "matriz-risco": {
    label: "Matriz de Risco",
    short: "Riscos",
    description: "Impacto × probabilidade dos riscos do robô e das missões.",
    color: "#e5a52f",
    needsSeason: false,
  },
  swot: {
    label: "Matriz SWOT",
    short: "SWOT",
    description: "Forças, fraquezas, oportunidades e ameaças do projeto.",
    color: "#4f7a2a",
    needsSeason: false,
  },
  "swot-missoes": {
    label: "SWOT de Missões",
    short: "SWOT missões",
    description: "As missões da temporada distribuídas nos quadrantes SWOT.",
    color: "#3b82b6",
    needsSeason: true,
  },
  "tabela-missoes": {
    label: "Tabela de Missões",
    short: "Missões",
    description: "Pontuação, dificuldade, tempo e status de cada missão.",
    color: "#1e459f",
    needsSeason: true,
  },
  heatmap: {
    label: "Mapa de Calor",
    short: "Calor",
    description: "Onde o robô passa e pontua com mais frequência na mesa.",
    color: "#d94a2f",
    needsSeason: false,
  },
};

export const NOTEBOOK_SEASONS = [
  { id: "bioglow", name: "Bioglow (2026/27)" },
  { id: "unearthed", name: "Unearthed (2025/26)" },
  { id: "submerged", name: "Submerged (2024/25)" },
] as const;

export const COVER_COLORS = ["#cf2a2a", "#1e459f", "#4f7a2a", "#e5a52f", "#494234", "#7c3aed"] as const;

export const isDiagramKind = (v: unknown): v is DiagramKind =>
  typeof v === "string" && (DIAGRAM_KINDS as readonly string[]).includes(v);

// ---------------------------------------------------------------------------
// Dados de cada diagrama (jsonb)
// ---------------------------------------------------------------------------

export type SwotQuadrant = "strengths" | "weaknesses" | "opportunities" | "threats";
export type SwotTextItem = { id: string; text: string };
export type SwotMission = { id: string; name: string; image?: string };

export type DiagramData = {
  estrategia: { layers?: Layer[] };
  "matriz-risco": { riscos?: Risco[] };
  swot: { swot?: Record<SwotQuadrant, SwotTextItem[]> };
  "swot-missoes": { swot?: Record<SwotQuadrant, SwotMission[]> };
  "tabela-missoes": { missions?: Mission[]; columns?: Column[] };
  heatmap: { points?: HeatPoint[]; config?: HeatmapConfig };
};

const count = (v: unknown) => (Array.isArray(v) ? v.length : 0);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Resumo curto do conteúdo do diagrama (lista lateral e detalhes). */
export function summarizeDiagram(kind: DiagramKind, raw: unknown): string {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  switch (kind) {
    case "estrategia": {
      const layers = (data.layers as Layer[] | undefined) ?? [];
      const robots = layers.reduce((s, l) => s + count(l.robots), 0);
      const zones = layers.reduce((s, l) => s + count(l.zones), 0);
      return `${plural(layers.length, "camada", "camadas")} · ${plural(robots, "robô", "robôs")} · ${plural(zones, "zona", "zonas")}`;
    }
    case "matriz-risco": {
      const riscos = (data.riscos as Risco[] | undefined) ?? [];
      const criticos = riscos.filter((r) => r.impacto * r.probabilidade >= 15).length;
      return `${plural(riscos.length, "risco", "riscos")} · ${plural(criticos, "crítico", "críticos")}`;
    }
    case "swot":
    case "swot-missoes": {
      const swot = (data.swot as Record<string, unknown[]> | undefined) ?? {};
      const total = Object.values(swot).reduce((s, l) => s + count(l), 0);
      return `${plural(total, "item", "itens")} em 4 quadrantes`;
    }
    case "tabela-missoes": {
      const missions = (data.missions as Mission[] | undefined) ?? [];
      const pts = missions.reduce((s, m) => s + (Number(m.points) || 0), 0);
      return missions.length ? `${plural(missions.length, "missão", "missões")} · ${pts} pts` : "Sem missões carregadas";
    }
    case "heatmap": {
      const points = (data.points as HeatPoint[] | undefined) ?? [];
      return plural(points.length, "ponto marcado", "pontos marcados");
    }
  }
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type NotebookPhotoDTO = {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  title: string | null;
  notes: string | null;
  takenAt: string;
  createdAt: string;
};

export type NotebookDiagramDTO = {
  id: string;
  kind: DiagramKind;
  title: string;
  season: string | null;
  summary: string;
  updatedAt: string;
};

export type NotebookStudioDTO = {
  fileName: string;
  size: number;
  uploadedAt: string;
} | null;

/** Competição do usuário, vista pelo QuickBrick. */
export type QuickbrickLeague = {
  id: string;
  code: string;
  name: string;
  /** Liberado por completo (hoje só FLL Challenge). */
  supported: boolean;
  /** Relação do usuário com a liga (null = liga do caderno que ele não acompanha mais). */
  relation: "participante" | "interessado" | null;
  /** Temporada informada em Ligas e Competições (texto livre). */
  season: string | null;
};

export type NotebookLeagueDTO = { id: string; code: string; name: string; supported: boolean } | null;

export type NotebookDTO = {
  id: string;
  league: NotebookLeagueDTO;
  name: string;
  robotName: string | null;
  description: string | null;
  season: string | null;
  coverColor: string | null;
  createdAt: string;
  updatedAt: string;
  studio: NotebookStudioDTO;
  tags: TagDTO[];
  milestone: MilestoneDTO | null;
};

export type NotebookCardDTO = NotebookDTO & {
  photoCount: number;
  diagramCount: number;
  coverUrl: string | null;
};

export function seasonName(id: string | null | undefined) {
  return NOTEBOOK_SEASONS.find((s) => s.id === id)?.name ?? null;
}

/** Tenta casar a temporada livre do usuário ("Unearthed 25/26") com o id usado aqui. */
export function matchSeason(text: string | null | undefined): string | null {
  const t = (text ?? "").toLowerCase();
  return NOTEBOOK_SEASONS.find((s) => t.includes(s.id))?.id ?? null;
}
