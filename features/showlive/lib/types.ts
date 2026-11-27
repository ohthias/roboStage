/**
 * Contrato da API do ShowLive (showlive.robostage.com.br/api/v1/events).
 * O ShowLive é um app separado, com banco próprio; o painel só conversa
 * com ele por essa API, repassando a sessão do Clerk do usuário.
 */

export type ShowLiveFormat = "fll" | "fll_fe" | "obr" | "custom";
export type ShowLiveStatus = "draft" | "live" | "finished";
export type ShowLiveRole = "owner" | "admin" | "scorer" | "viewer";

export type ShowLiveEvent = {
  id: string;
  name: string;
  format: ShowLiveFormat;
  /** "FLL", "OBR", "Contra o tempo"… */
  kind: string;
  /** Temporada ou nome do desafio. */
  detail: string;
  status: ShowLiveStatus;
  role: ShowLiveRole;
  teams: number;
  scores: number;
  code: string | null;
  updatedAt: string;
  hubUrl: string;
  liveUrl: string | null;
};

export type ShowLiveCatalog = {
  seasons: { id: string; label: string; year: string }[];
  presets: { id: string; name: string; type: string; objective?: string }[];
  challengeTypes: { id: string; label: string; short: string }[];
  templates: { id: string; name: string; type: string }[];
  defaults: { format: ShowLiveFormat; season: string; rounds: number };
};

export type ShowLiveOverview = {
  events: ShowLiveEvent[];
  catalog: ShowLiveCatalog;
  hubUrl: string;
};

export type ShowLiveSource =
  | { kind: "preset"; id: string }
  | { kind: "template"; id: string }
  | { kind: "blank"; type: string };

export type CreateShowLiveEventInput = {
  name: string;
  format: ShowLiveFormat;
  season?: string;
  roundCount?: number;
  source?: ShowLiveSource;
};

export type CreatedShowLiveEvent = { id: string; format: ShowLiveFormat; hubUrl: string };
