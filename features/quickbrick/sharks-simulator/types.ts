
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

/**
 * Uma missão do tapete: uma zona (polígono em cm, origem no canto inferior
 * esquerdo) e um ponto de ativação. A missão é considerada concluída quando o
 * centro do robô passa a até `radius` cm do ponto de ativação.
 */
export interface Mission {
  id: string;
  name: string;
  vertices: Coordinate[];
  activation: Coordinate;
  radius: number;
}

export interface AnimationSegment {
  startState: RobotState;
  endState: RobotState;
  startTime: number; // ms from start of animation sequence
  endTime: number;   // ms from start of animation sequence
  type: 'reto' | 'giro' | 'start';
}
