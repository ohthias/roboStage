export type MovementType = "giro" | "reto" | "inicio";

export interface Movement {
  type: MovementType;
  value: number;
  speed: number;
}

export interface Point {
  x_cm: number;
  y_cm: number;
  angle: number;
  speed: number;
  type: MovementType;
}

export interface RobotState {
  x_cm: number;
  y_cm: number;
  angle: number;
  isRunning: boolean;
  segmentIndex: number;
  progress: number;
}

export interface CanvasPoint {
  x_px: number;
  y_px: number;
}

export interface MousePosition {
  pixel: CanvasPoint | null;
  cm: { x_cm: number; y_cm: number } | null;
}

export interface CreatorSpeeds {
  straight: number;
  turn: number;
}

export interface CreatorAnalytics {
  totalDistance: number;
  totalRotation: number;
  estimatedTime: number;
}
