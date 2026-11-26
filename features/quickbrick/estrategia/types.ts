export interface Point {
  x: number;
  y: number;
}

export interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface FreePath {
  id: string;
  points: Point[];
  color: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
}

export type RobotType = 'base' | 'forklift' | 'dozer';

export interface Robot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  color: string;
  type: RobotType;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  zonesVisible: boolean;
  lines: Line[];
  freePaths: FreePath[];
  zones: Zone[];
  robots: Robot[];
}

export type ToolType = "hand" | "line" | "free" | "zone" | "robot" | "eraser";

export interface ProjectState {
  layers: Layer[];
  activeLayerId: string;
}

// --- Export ---------------------------------------------------------------

export interface ExportElementCounts {
  lines: number;
  freePaths: number;
  zones: number;
  robots: number;
}

export interface ExportLayerSummary {
  id: string;
  name: string;
  included: boolean;
  /** Motivo de exclusão, presente apenas quando included=false. */
  reason?: string;
  counts: ExportElementCounts;
}

export interface ExportSummary {
  type: "general" | "layers";
  layers: ExportLayerSummary[];
  showZones: boolean;
  showLabels: boolean;
  totalElements: number;
  isEmpty: boolean;
  fileName: string;
}

export interface CanvasHandle {
  exportGeneral: () => void;
  exportLayers: () => Promise<void>;
  /** Calcula, sem exportar nada ainda, o que cada tipo de exportação incluirá. */
  getExportSummary: (type: "general" | "layers") => ExportSummary;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}