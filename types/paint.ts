export type Tool = "line" | "free";

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface FreePath {
  points: Point[];
  color: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  lines: Line[];
  freePaths: FreePath[];
}
