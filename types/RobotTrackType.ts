
export interface Coordinate {
  x: number;
  y: number;
}

export interface RobotState extends Coordinate {
  angle: number; // Degrees
}

export interface RobotConfig {
  widthCm: number;
  lengthCm: number;
  shape: 'tank' | '4x4' | 'fwd' | 'rwd' | 'custom';
  color: string;
  customPath?: string; // SVG path data for custom shape
}

export interface PathPoint extends RobotState {
  type: 'start' | 'reto' | 'giro';
  color?: string;
  velocity?: number;
}

export interface SimulationConfig {
  matWidthCm: number;
  matHeightCm: number;
  maxSpeed: number;
}

export interface Command {
  type: 'reto' | 'giro';
  val: number;
  speed: number;
}

export interface AnimationSegment {
  startState: RobotState;
  endState: RobotState;
  startTime: number; // ms from start of animation sequence
  endTime: number;   // ms from start of animation sequence
  type: 'reto' | 'giro' | 'start';
}
