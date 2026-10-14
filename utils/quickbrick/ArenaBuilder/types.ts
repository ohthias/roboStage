export type Shape =
  | "empty"
  | "straight"
  | "curve"
  | "tee"
  | "cross"
  | "start"
  | "finish"
  | "silver"
  | "black";

export type Hazard = "gap" | "bump" | "obstacle" | "ramp" | "seesaw" | "passage";

/** 0 = 0°, 1 = 90° horário, 2 = 180°, 3 = 270° */
export type Rot = 0 | 1 | 2 | 3;

export interface Tile {
  shape: Shape;
  rot: Rot;
  hazards: Hazard[];
  /** marcação verde à esquerda / direita (para quem chega pelo ramo de base) */
  markL: boolean;
  markR: boolean;
  /** só no cruzamento "+": marcações nos quadrantes superiores */
  markTL?: boolean;
  markTR?: boolean;
}

/** Tablado de 3x3 ladrilhos de 30 cm (90 x 90 cm) */
export interface Board {
  id: number;
  /** posição no espaço de trabalho, em ladrilhos (30 cm) */
  col: number;
  row: number;
  /** 9 ladrilhos, linha a linha */
  tiles: Tile[];
}

export type Wall = "N" | "E" | "S" | "W";
export type Corner = "NW" | "NE" | "SE" | "SW";

export interface Door {
  wall: Wall;
  /** índice do ladrilho de 30 cm ao longo da parede (0 = primeiro) */
  cell: number;
}

export interface Victim {
  id: string;
  kind: "alive" | "dead";
  /** centro em cm, origem no canto superior esquerdo da sala */
  x: number;
  y: number;
}

export interface Rescue {
  size: "3x3" | "3x4";
  entrance: Door;
  exit: Door;
  /** largura do vão das portas, 25 a 30 cm */
  doorWidth: number;
  green: Corner;
  red: Corner;
  victims: Victim[];
}

export interface Project {
  name: string;
  level: 1 | 2;
  boards: Board[];
  rescue: Rescue;
  /** posição da sala de resgate no espaço de trabalho, em ladrilhos */
  roomPos: { col: number; row: number };
}
