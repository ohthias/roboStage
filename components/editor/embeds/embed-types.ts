import type {
  FieldDefinition,
  TestEntry,
  TestRecord,
} from "@/types/labtest.types";
import type { CanvasElement } from "@/types/thinklab.types";

/**
 * Blocos "embed" do editor de documentos: referências vivas a itens de outros
 * módulos do Stagebook. O documento guarda só o id (+ um rótulo de reserva);
 * os dados são buscados no momento da exibição, então card, evento, gráfico e
 * quadro sempre aparecem atualizados.
 */
export type EmbedKind =
  | "kanban-card"
  | "calendar-event"
  | "labtest-chart"
  | "thinklab-board";

export const EMBED_KINDS: EmbedKind[] = [
  "kanban-card",
  "calendar-event",
  "labtest-chart",
  "thinklab-board",
];

export const EMBED_LABELS: Record<EmbedKind, string> = {
  "kanban-card": "Card do Kanban",
  "calendar-event": "Evento do calendário",
  "labtest-chart": "Gráfico do LabTest",
  "thinklab-board": "Quadro do ThinkLab",
};

export const EMBED_HREF: Record<EmbedKind, (id: string, extra?: string) => string> = {
  "kanban-card": (_id, boardId) => `/dashboard/kanban/${boardId ?? ""}`,
  "calendar-event": () => `/dashboard/calendar`,
  "labtest-chart": (id) => `/dashboard/labtest/${id}`,
  "thinklab-board": (id) => `/dashboard/thinklab/${id}`,
};

/** Opções por bloco, guardadas junto da referência. */
export type LabTestChartOptions = {
  /** "resumo" = um gráfico compacto; "completo" = mesmos gráficos da página do teste. */
  view?: "resumo" | "completo";
  chartType?: "line" | "bar";
  /** Parâmetros exibidos no resumo (vazio = todos os numéricos). */
  fieldKeys?: string[];
};

export type EmbedOptions = LabTestChartOptions & { boardId?: string };

// ---------------------------------------------------------------------------
// Itens do seletor (listas leves)
// ---------------------------------------------------------------------------

export type CardPickerItem = {
  id: string;
  boardId: string;
  title: string;
  boardName: string;
  columnName: string;
  priority: string;
  dueAt: string | null;
};

export type EventPickerItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: string;
  color: string | null;
};

export type LabTestPickerItem = {
  id: string;
  name: string;
  mode: string;
  season: string | null;
  updatedAt: string;
};

export type ThinkLabPickerItem = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
};

export type PickerItemMap = {
  "kanban-card": CardPickerItem;
  "calendar-event": EventPickerItem;
  "labtest-chart": LabTestPickerItem;
  "thinklab-board": ThinkLabPickerItem;
};

// ---------------------------------------------------------------------------
// Dados completos de cada embed
// ---------------------------------------------------------------------------

export type CardEmbedData = {
  id: string;
  boardId: string;
  boardName: string;
  title: string;
  description: string | null;
  priority: string;
  dueAt: string | null;
  columnName: string;
  columnColor: string | null;
  milestone: { name: string; color: string | null; dueAt: string | null } | null;
  tags: { name: string; color: string | null }[];
  assignees: { userId: string; name: string | null; avatarUrl: string | null }[];
};

export type EventEmbedData = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: string;
  status: string;
  color: string | null;
  location: string | null;
};

export type LabTestEmbedData = {
  test: TestRecord;
  fields: FieldDefinition[];
  entries: TestEntry[];
};

export type ThinkLabEmbedData = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  elements: CanvasElement[];
};

export type EmbedDataMap = {
  "kanban-card": CardEmbedData;
  "calendar-event": EventEmbedData;
  "labtest-chart": LabTestEmbedData;
  "thinklab-board": ThinkLabEmbedData;
};
