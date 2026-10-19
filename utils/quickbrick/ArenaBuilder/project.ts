import { defaultRescue, roomCols, roomRows, wallCells } from "./rescue";
import { canHaveMarks, COLS, emptyTile, hazardAllowed, HAZARDS, isCross, ROWS, SHAPES } from "./tiles";
import type { Board, Corner, Hazard, Project, Rescue, Rot, Shape, Tile, Wall } from "./types";

type Rect = { col: number; row: number; w: number; h: number };

export const rectsOverlap = (a: Rect, b: Rect) =>
  a.col < b.col + b.w && b.col < a.col + a.w && a.row < b.row + b.h && b.row < a.row + a.h;

export const boardRect = (b: Pick<Board, "col" | "row">): Rect => ({ col: b.col, row: b.row, w: 3, h: 3 });

export const roomRect = (p: Pick<Project, "rescue" | "roomPos">): Rect => ({
  col: p.roomPos.col,
  row: p.roomPos.row,
  w: roomCols(p.rescue),
  h: roomRows(p.rescue),
});

export const boardsOverlap = (a: Pick<Board, "col" | "row">, b: Pick<Board, "col" | "row">) =>
  rectsOverlap(boardRect(a), boardRect(b));

/** o retângulo `r` colide com algum tablado (exceto `ignoreBoard`) ou com a sala (se `checkRoom`)? */
export function collides(p: Project, r: Rect, opts: { ignoreBoard?: number; checkRoom?: boolean } = {}) {
  if (p.boards.some((b) => b.id !== opts.ignoreBoard && rectsOverlap(boardRect(b), r))) return true;
  if (opts.checkRoom && rectsOverlap(roomRect(p), r)) return true;
  return false;
}

/** primeira posição livre para a sala (após mudar de tamanho) */
export function findRoomSpot(p: Project, rescue: Rescue, prefer: { col: number; row: number }) {
  const w = roomCols(rescue);
  const h = roomRows(rescue);
  const clamp = (c: number, r: number) => ({
    col: Math.max(0, Math.min(COLS - w, c)),
    row: Math.max(0, Math.min(ROWS - h, r)),
  });
  const start = clamp(prefer.col, prefer.row);
  const free = (pos: { col: number; row: number }) => !collides(p, { ...pos, w, h });
  if (free(start)) return start;
  for (let r = 0; r <= ROWS - h; r++)
    for (let c = 0; c <= COLS - w; c++) if (free({ col: c, row: r })) return { col: c, row: r };
  return start;
}

export function emptyBoard(id: number, col: number, row: number): Board {
  return { id, col, row, tiles: Array.from({ length: 9 }, emptyTile) };
}

export function defaultProject(): Project {
  return {
    name: "Minha arena OBR",
    level: 1,
    boards: [emptyBoard(1, 0, 0), emptyBoard(2, 4, 0), emptyBoard(3, 8, 0)],
    rescue: defaultRescue(),
    roomPos: { col: 0, row: 4 },
  };
}

/** Rotaciona o tablado 90° no sentido horário, girando também cada ladrilho. */
export function rotateBoard(b: Board): Board {
  const tiles = Array.from({ length: 9 }, emptyTile);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const t = b.tiles[r * 3 + c];
      tiles[c * 3 + (2 - r)] = { ...t, rot: ((t.rot + 1) % 4) as Rot };
    }
  }
  return { ...b, tiles };
}

/** índice do ladrilho após girar o tablado 90° horário */
export const rotatedIndex = (idx: number) => {
  const r = Math.floor(idx / 3);
  const c = idx % 3;
  return c * 3 + (2 - r);
};

/* ----------------------------- exemplo ----------------------------- */

export function sampleProject(): Project {
  const p = defaultProject();
  p.name = "Arena de exemplo";
  p.boards = [emptyBoard(1, 0, 0), emptyBoard(2, 3, 0), emptyBoard(3, 3, 3)];
  p.roomPos = { col: 3, row: 6 };
  p.rescue = {
    ...defaultRescue(),
    entrance: { wall: "N", cell: 2 },
    exit: { wall: "N", cell: 0 },
    green: "SW",
    red: "SE",
    victims: [
      { id: "a1", kind: "alive", x: 24, y: 44 },
      { id: "a2", kind: "alive", x: 66, y: 58 },
      { id: "d1", kind: "dead", x: 46, y: 28 },
    ],
  };

  const put = (x: number, y: number, shape: Shape, rot: Rot, hazards: Hazard[] = [], extra: Partial<Tile> = {}) => {
    const b = p.boards.find((bb) => x >= bb.col && x < bb.col + 3 && y >= bb.row && y < bb.row + 3)!;
    b.tiles[(y - b.row) * 3 + (x - b.col)] = { shape, rot, hazards, markL: false, markR: false, ...extra };
  };

  // trajeto de entrada: partida -> fita prata
  put(0, 2, "start", 1);
  put(1, 2, "straight", 1, ["gap"]);
  put(2, 2, "curve", 3);
  put(2, 1, "straight", 0, ["ramp"]);
  put(2, 0, "curve", 1);
  put(3, 0, "straight", 1, ["obstacle"]);
  put(4, 0, "curve", 2, ["bump"]);
  put(4, 1, "straight", 0);
  put(4, 2, "tee", 2, ["gap"], { markL: true });
  put(5, 2, "curve", 2);
  put(5, 3, "straight", 0, ["seesaw"]);
  put(5, 4, "straight", 0, ["bump"]);
  put(5, 5, "silver", 2);
  // trajeto de saída: fita preta -> chegada
  put(3, 5, "black", 2);
  put(3, 4, "straight", 0);
  put(3, 3, "curve", 1);
  put(4, 3, "curve", 2);
  put(4, 4, "finish", 2);

  return p;
}

/* --------------------------- validação de import --------------------------- */

const SHAPE_IDS = SHAPES.map((s) => s.id) as string[];
const HAZARD_IDS = HAZARDS.map((h) => h.id) as string[];
const WALLS: Wall[] = ["N", "E", "S", "W"];
const CORNER_IDS: Corner[] = ["NW", "NE", "SE", "SW"];

function num(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function sanitizeTile(raw: unknown): Tile {
  const t = (raw ?? {}) as Record<string, unknown>;
  const shape = (SHAPE_IDS.includes(t.shape as string) ? t.shape : "empty") as Shape;
  if (shape === "empty") return emptyTile();
  const rot = ((((num(t.rot, 0) % 4) + 4) % 4) | 0) as Rot;
  const hazards = (Array.isArray(t.hazards) ? t.hazards : []).filter(
    (h): h is Hazard => HAZARD_IDS.includes(h as string) && hazardAllowed(shape, h as Hazard),
  );
  const marks = canHaveMarks(shape);
  const cross = isCross(shape);
  return {
    shape,
    rot,
    hazards,
    markL: marks && !!t.markL,
    markR: marks && !!t.markR,
    markTL: cross && !!t.markTL,
    markTR: cross && !!t.markTR,
  };
}

function sanitizeRescue(raw: unknown): Rescue {
  const d = defaultRescue();
  const r = (raw ?? {}) as Record<string, unknown>;
  const out: Rescue = { ...d };
  out.size = r.size === "3x4" ? "3x4" : "3x3";
  const door = (v: unknown, fb: Rescue["entrance"]) => {
    const o = (v ?? {}) as Record<string, unknown>;
    const wall = WALLS.includes(o.wall as Wall) ? (o.wall as Wall) : fb.wall;
    const max = wallCells(out, wall) - 1;
    return { wall, cell: Math.max(0, Math.min(max, Math.round(num(o.cell, fb.cell)))) };
  };
  out.entrance = door(r.entrance, d.entrance);
  out.exit = door(r.exit, d.exit);
  out.doorWidth = Math.max(25, Math.min(30, num(r.doorWidth, 25)));
  out.green = CORNER_IDS.includes(r.green as Corner) ? (r.green as Corner) : d.green;
  out.red = CORNER_IDS.includes(r.red as Corner) ? (r.red as Corner) : d.red;
  if (out.red === out.green) out.red = CORNER_IDS.find((c) => c !== out.green)!;
  if (Array.isArray(r.victims) && r.victims.length === 3) {
    out.victims = (r.victims as Record<string, unknown>[]).map((v, i) => ({
      id: typeof v.id === "string" ? v.id : `v${i}`,
      kind: v.kind === "dead" ? "dead" : "alive",
      x: num(v.x, 45),
      y: num(v.y, 45),
    }));
  }
  return out;
}

export function sanitizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (!Array.isArray(p.boards) || p.boards.length !== 3) return null;
  const boards: Board[] = (p.boards as Record<string, unknown>[]).map((b, i) => ({
    id: i + 1,
    col: Math.max(0, Math.min(COLS - 3, Math.round(num(b.col, i * 4)))),
    row: Math.max(0, Math.min(ROWS - 3, Math.round(num(b.row, 0)))),
    tiles: Array.from({ length: 9 }, (_, k) =>
      sanitizeTile(Array.isArray(b.tiles) ? (b.tiles as unknown[])[k] : null),
    ),
  }));
  const rescue = sanitizeRescue(p.rescue);
  const rp = (p.roomPos ?? {}) as Record<string, unknown>;
  const roomPos = {
    col: Math.max(0, Math.min(COLS - roomCols(rescue), Math.round(num(rp.col, 0)))),
    row: Math.max(0, Math.min(ROWS - roomRows(rescue), Math.round(num(rp.row, 4)))),
  };
  const proj: Project = {
    name: typeof p.name === "string" ? p.name.slice(0, 80) : "Arena importada",
    level: p.level === 2 ? 2 : 1,
    boards,
    rescue,
    roomPos,
  };
  // projetos antigos sem posição da sala: procura um lugar livre
  if (!p.roomPos || collides(proj, roomRect(proj))) proj.roomPos = findRoomSpot(proj, rescue, roomPos);
  return proj;
}
