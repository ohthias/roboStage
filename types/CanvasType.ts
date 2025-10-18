interface Point {
  x: number;
  y: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface FreePath {
  points: Point[];
  color: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  lines: Line[];
  freePaths: FreePath[];
}

type Zone = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
};
