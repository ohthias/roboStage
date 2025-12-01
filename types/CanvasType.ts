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

export type ToolType = "hand" | "line" | "free" | "zone" | "robot";

export interface ProjectState {
  layers: Layer[];
  activeLayerId: string;
}

export interface CanvasHandle {
  exportGeneral: () => void;
  exportLayers: () => Promise<void>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}