import { AnimationSegment, Coordinate, Mission, RobotState } from "@/types/SharksSimulator.types";

/**
 * ---------------------------------------------------------------------------
 * MISSÕES
 * ---------------------------------------------------------------------------
 * Todas as coordenadas estão em cm, com origem no canto inferior esquerdo do
 * tapete (mesma convenção do engine.service).
 *
 * Regras:
 * - Uma missão é CONCLUÍDA quando o centro do robô passa a até `radius` cm do
 *   seu ponto de ativação. Depois de concluída, continua concluída até o
 *   reinício da simulação.
 * - O robô está ENCOSTANDO numa missão quando o seu contorno (largura x
 *   comprimento, já rotacionado) toca a zona da missão.
 */

export const DEFAULT_ACTIVATION_RADIUS = 10;

/** Média dos vértices — usada para posicionar o rótulo da missão. */
export const polygonCenter = (vertices: Coordinate[]): Coordinate => {
  if (vertices.length === 0) return { x: 0, y: 0 };
  const sx = vertices.reduce((s, p) => s + p.x, 0);
  const sy = vertices.reduce((s, p) => s + p.y, 0);
  return { x: sx / vertices.length, y: sy / vertices.length };
};

/** Ordena vértices pelo ângulo em torno do centroide (evita polígonos "gravata"). */
export const normalizePolygon = (vertices: Coordinate[]): Coordinate[] => {
  if (vertices.length < 3) return vertices;
  const c = polygonCenter(vertices);
  return [...vertices].sort(
    (a, b) => Math.atan2(a.y - c.y, a.x - c.x) - Math.atan2(b.y - c.y, b.x - c.x),
  );
};

const v = (pts: [number, number][]): Coordinate[] =>
  normalizePolygon(pts.map(([x, y]) => ({ x, y })));

/** Missões padrão (temporada atual). Podem ser editadas na interface. */
export const DEFAULT_MISSIONS: Mission[] = [
  { id: "m1", name: "Missão 1", vertices: v([[58.2, 2.8], [118.7, 2.8], [118.7, 10.3], [58.2, 10.3]]), activation: { x: 56.0, y: 6.6 }, radius: 10 },
  { id: "m2", name: "Missão 2", vertices: v([[59.6, 57.9], [67.1, 57.9], [67.1, 50.5], [59.6, 50.5]]), activation: { x: 56.2, y: 48.9 }, radius: 10 },
  { id: "m3", name: "Missão 3", vertices: v([[2.2, 59], [2.2, 75.1], [14.1, 59], [14.1, 75.1]]), activation: { x: 20.5, y: 65.5 }, radius: 10 },
  { id: "m4", name: "Missão 4", vertices: v([[7.5, 108.5], [25.1, 108.5], [25.1, 95.7], [7.5, 95.7]]), activation: { x: 20.9, y: 93.7 }, radius: 10 },
  { id: "m5", name: "Missão 5", vertices: v([[39.2, 108.2], [41.8, 107.2], [41.8, 112.6], [39.2, 112.6]]), activation: { x: 50.2, y: 93.8 }, radius: 10 },
  { id: "m6", name: "Missão 6", vertices: v([[145.2, 105.2], [150.2, 100.5], [152.2, 113.0], [157.8, 107.0]]), activation: { x: 143.2, y: 95.7 }, radius: 10 },
  { id: "m7", name: "Missão 7", vertices: v([[156.2, 103.2], [161.4, 103.2], [161.6, 107.6], [156.2, 107.6]]), activation: { x: 158.8, y: 98.1 }, radius: 10 },
  { id: "m8", name: "Missão 8", vertices: v([[50.2, 99.5], [50.2, 112.4], [65.3, 112.4], [65.3, 99.5]]), activation: { x: 63.5, y: 98.9 }, radius: 10 },
  { id: "m9", name: "Missão 9", vertices: v([[53.6, 102.7], [56.2, 111.6], [64.7, 109], [59.6, 99.3]]), activation: { x: 56.8, y: 95.7 }, radius: 10 },
  { id: "m10", name: "Missão 10", vertices: v([[69.9, 99], [69.9, 108], [81, 108], [79.9, 99]]), activation: { x: 56.8, y: 95.7 }, radius: 10 },
   {
    "id": "m-mw10e3j8-5u7h",
    "name": "Missão 11",
    "vertices": [
      {
        "x": 95.5,
        "y": 69
      },
      {
        "x": 103.5,
        "y": 69
      },
      {
        "x": 104.4,
        "y": 56.6
      },
      {
        "x": 94.7,
        "y": 56.6
      }
    ],
    "activation": {
      "x": 99.5,
      "y": 63.7
    },
    "radius": 14
  },
  {
    "id": "m-mw10f7hz-eysi",
    "name": "Missão 12",
    "vertices": [
      {
        "x": 123,
        "y": 16.4
      },
      {
        "x": 132.2,
        "y": 16
      },
      {
        "x": 132,
        "y": 5.3
      },
      {
        "x": 123,
        "y": 4
      }
    ],
    "activation": {
      "x": 127.1,
      "y": 9.5
    },
    "radius": 10
  },
  {
    "id": "m-mw10fptl-rykv",
    "name": "Missão 13",
    "vertices": [
      {
        "x": 134.8,
        "y": 59.3
      },
      {
        "x": 140.3,
        "y": 54.3
      },
      {
        "x": 145.6,
        "y": 59.6
      },
      {
        "x": 140.4,
        "y": 65.7
      }
    ],
    "activation": {
      "x": 139.5,
      "y": 60.6
    },
    "radius": 10
  },
  {
    "id": "m-mw10fyep-qt0v",
    "name": "Missão 14",
    "vertices": [
      {
        "x": 189.1,
        "y": 88.8
      },
      {
        "x": 189.2,
        "y": 53.2
      },
      {
        "x": 197.9,
        "y": 52.5
      },
      {
        "x": 195.5,
        "y": 88.9
      }
    ],
    "activation": {
      "x": 193.1,
      "y": 69
    },
    "radius": 17
  },
  {
    "id": "m-mw10gold-r7i7",
    "name": "Missão 15",
    "vertices": [
      {
        "x": 181.2,
        "y": 101.3
      },
      {
        "x": 187.5,
        "y": 96.5
      },
      {
        "x": 195,
        "y": 105.4
      },
      {
        "x": 189.4,
        "y": 111.2
      }
    ],
    "activation": {
      "x": 187.3,
      "y": 102.5
    },
    "radius": 10
  }
];

/** Ray casting: ponto dentro de polígono (convexo ou côncavo). */
export const pointInPolygon = (p: Coordinate, vertices: Coordinate[]): boolean => {
  const n = vertices.length;
  if (n < 3) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = vertices[i];
    const b = vertices[j];
    if (a.y > p.y !== b.y > p.y) {
      const xCross = ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
      if (p.x < xCross) inside = !inside;
    }
  }
  return inside;
};

const cross = (o: Coordinate, a: Coordinate, b: Coordinate) =>
  (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

const onSegment = (p: Coordinate, a: Coordinate, b: Coordinate) =>
  Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) &&
  Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);

export const segmentsIntersect = (p1: Coordinate, p2: Coordinate, q1: Coordinate, q2: Coordinate): boolean => {
  const d1 = cross(q1, q2, p1);
  const d2 = cross(q1, q2, p2);
  const d3 = cross(p1, p2, q1);
  const d4 = cross(p1, p2, q2);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  if (d1 === 0 && onSegment(p1, q1, q2)) return true;
  if (d2 === 0 && onSegment(p2, q1, q2)) return true;
  if (d3 === 0 && onSegment(q1, p1, p2)) return true;
  if (d4 === 0 && onSegment(q2, p1, p2)) return true;
  return false;
};

/** Dois polígonos se tocam se alguma aresta se cruza ou um contém o outro. */
export const polygonsIntersect = (a: Coordinate[], b: Coordinate[]): boolean => {
  if (a.length < 3 || b.length < 3) return false;
  for (let i = 0; i < a.length; i++) {
    const a1 = a[i];
    const a2 = a[(i + 1) % a.length];
    for (let j = 0; j < b.length; j++) {
      if (segmentsIntersect(a1, a2, b[j], b[(j + 1) % b.length])) return true;
    }
  }
  return pointInPolygon(a[0], b) || pointInPolygon(b[0], a);
};

/**
 * Contorno do robô em cm. Ângulo 0 = virado para cima (+Y), positivo no
 * sentido horário — a mesma convenção de calculateTrajectory.
 */
export const robotFootprint = (state: RobotState, widthCm: number, lengthCm: number): Coordinate[] => {
  const rad = (state.angle * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const hw = widthCm / 2;
  const hl = lengthCm / 2;
  // (lateral, frente) no referencial do robô
  const local: [number, number][] = [[-hw, hl], [hw, hl], [hw, -hl], [-hw, -hl]];
  return local.map(([lx, ly]) => ({
    x: state.x + lx * cos + ly * sin,
    y: state.y - lx * sin + ly * cos,
  }));
};

/** IDs das missões cuja zona está sendo tocada pelo robô neste instante. */
export const touchingMissionIds = (
  state: RobotState,
  widthCm: number,
  lengthCm: number,
  missions: Mission[],
): string[] => {
  const footprint = robotFootprint(state, widthCm, lengthCm);
  return missions.filter((m) => polygonsIntersect(footprint, m.vertices)).map((m) => m.id);
};

/**
 * Primeiro instante (ms, na linha do tempo dos segmentos) em que o centro do
 * robô entra no raio de ativação de cada missão; `null` se nunca entra.
 * Cálculo exato: em segmentos retos o centro anda em linha reta, então basta
 * resolver a interseção segmento × círculo; nos giros o centro fica parado.
 */
export const computeMissionCompletionTimes = (
  missions: Mission[],
  segments: AnimationSegment[],
  start: Coordinate,
): Record<string, number | null> => {
  const result: Record<string, number | null> = {};

  for (const m of missions) {
    const { x: ax, y: ay } = m.activation;
    const r2 = m.radius * m.radius;
    const dist2 = (p: Coordinate) => (p.x - ax) ** 2 + (p.y - ay) ** 2;

    let hit: number | null = dist2(start) <= r2 ? 0 : null;

    for (let i = 0; hit === null && i < segments.length; i++) {
      const seg = segments[i];
      const p0 = seg.startState;
      const p1 = seg.endState;
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const fx = p0.x - ax;
      const fy = p0.y - ay;
      const c = fx * fx + fy * fy - r2;

      if (c <= 0) {
        hit = seg.startTime;
        break;
      }
      const a = dx * dx + dy * dy;
      if (a === 0) continue;
      const b = 2 * (fx * dx + fy * dy);
      const disc = b * b - 4 * a * c;
      if (disc < 0) continue;
      const s = (-b - Math.sqrt(disc)) / (2 * a);
      if (s >= 0 && s <= 1) {
        hit = seg.startTime + s * (seg.endTime - seg.startTime);
      }
    }

    result[m.id] = hit;
  }

  return result;
};

/** IDs das missões concluídas até `timeMs`. */
export const completedMissionIds = (
  completionTimes: Record<string, number | null>,
  timeMs: number,
): Set<string> => {
  const done = new Set<string>();
  for (const [id, t] of Object.entries(completionTimes)) {
    if (t !== null && t <= timeMs + 1e-6) done.add(id);
  }
  return done;
};

export const createMission = (existing: Mission[], center: Coordinate = { x: 100, y: 57 }): Mission => {
  let n = existing.length + 1;
  const names = new Set(existing.map((m) => m.name));
  while (names.has(`Missão ${n}`)) n++;
  const half = 6;
  return {
    id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: `Missão ${n}`,
    vertices: [
      { x: center.x - half, y: center.y - half },
      { x: center.x + half, y: center.y - half },
      { x: center.x + half, y: center.y + half },
      { x: center.x - half, y: center.y + half },
    ],
    activation: { x: center.x, y: center.y - half - 4 },
    radius: DEFAULT_ACTIVATION_RADIUS,
  };
};

/** Validação leve para dados vindos do localStorage / importação. */
export const isValidMissionList = (data: unknown): data is Mission[] => {
  if (!Array.isArray(data)) return false;
  const isCoord = (c: any) => c && typeof c.x === "number" && typeof c.y === "number";
  return data.every(
    (m: any) =>
      m &&
      typeof m.id === "string" &&
      typeof m.name === "string" &&
      Array.isArray(m.vertices) &&
      m.vertices.every(isCoord) &&
      isCoord(m.activation) &&
      typeof m.radius === "number",
  );
};
