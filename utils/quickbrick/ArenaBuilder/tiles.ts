import type { Hazard, Rot, Shape, Tile } from "./types";

/** lado do ladrilho em cm */
export const CELL = 30;
/** espaço de trabalho em ladrilhos */
export const COLS = 14;
export const ROWS = 10;

export const SHAPES: { id: Shape; label: string; hint: string }[] = [
  { id: "empty", label: "Vazio", hint: "Sem linha (apaga o ladrilho)" },
  { id: "straight", label: "Reta", hint: "Linha reta" },
  { id: "curve", label: "Curva", hint: "Curva de 90°" },
  { id: "tee", label: "Interseção T", hint: "3 ramificações (marcações verdes opcionais)" },
  { id: "cross", label: "Interseção +", hint: "4 ramificações (marcações verdes opcionais)" },
  { id: "start", label: "Partida", hint: "Ladrilho de partida" },
  { id: "finish", label: "Chegada", hint: "Faixa vermelha, 60 pts" },
  { id: "silver", label: "Entrada resgate", hint: "Fita prata: linha termina na sala de resgate" },
  { id: "black", label: "Saída resgate", hint: "Fita preta: linha recomeça após a sala" },
];

export const HAZARDS: { id: Hazard; label: string; points: number; hint: string }[] = [
  { id: "gap", label: "Gap", points: 10, hint: "Falha na linha (até 10 cm no Nível 1, 15 cm no Nível 2)" },
  { id: "bump", label: "Lombada", points: 10, hint: "Redutor de velocidade (até 1 cm)" },
  { id: "obstacle", label: "Obstáculo", points: 20, hint: "Bloco sobre a linha reta, altura mín. 15 cm" },
  { id: "ramp", label: "Rampa", points: 10, hint: "Ladrilho inclinado (máx. 25°)" },
  { id: "seesaw", label: "Gangorra", points: 20, hint: "Ladrilho com pivô central (~20°)" },
  { id: "passage", label: "Passagem", points: 0, hint: "Bloco laranja de madeira (0 pts)" },
];

/** lados: 0 = N, 1 = L, 2 = S, 3 = O (com rotação 0) */
export const BASE_CONN: Record<Shape, number[]> = {
  empty: [],
  straight: [0, 2],
  curve: [0, 1],
  tee: [1, 2, 3],
  cross: [0, 1, 2, 3],
  start: [0],
  finish: [2],
  silver: [0, 2],
  black: [0, 2],
};

export const DIRS: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

export const emptyTile = (): Tile => ({
  shape: "empty",
  rot: 0,
  hazards: [],
  markL: false,
  markR: false,
});

export const connections = (t: Tile): number[] => BASE_CONN[t.shape].map((s) => (s + t.rot) % 4);

/** lado onde fica a porta da sala de resgate (fita prata/preta), ou -1 */
export const terminalSide = (t: Tile): number =>
  t.shape === "silver" || t.shape === "black" ? t.rot : -1;

export const canHaveMarks = (shape: Shape) => shape === "tee" || shape === "cross";
export const isCross = (shape: Shape) => shape === "cross";

export function hazardAllowed(shape: Shape, h: Hazard): boolean {
  switch (h) {
    case "gap":
    case "bump":
      // retas, curvas, interseções e ladrilhos de entrada/saída da sala
      return ["straight", "curve", "tee", "cross", "silver", "black"].includes(shape);
    default:
      // obstáculo, rampa, gangorra, passagem: linhas retas
      return shape === "straight";
  }
}

/** perigos que não podem coexistir no mesmo ladrilho */
const EXCLUDES: Record<Hazard, Hazard[]> = {
  seesaw: ["gap", "bump", "obstacle", "ramp", "passage"],
  obstacle: ["ramp", "gap", "bump", "seesaw", "passage"],
  passage: ["gap", "bump", "obstacle", "ramp", "seesaw"],
  ramp: ["seesaw", "obstacle", "passage"],
  gap: ["seesaw", "obstacle", "passage"],
  bump: ["seesaw", "obstacle", "passage"],
};

export function toggleHazard(t: Tile, h: Hazard): Tile {
  if (!hazardAllowed(t.shape, h)) return t;
  if (t.hazards.includes(h)) return { ...t, hazards: t.hazards.filter((x) => x !== h) };
  return { ...t, hazards: [...t.hazards.filter((x) => !EXCLUDES[h].includes(x)), h] };
}

/** troca o formato mantendo apenas o que continua válido */
export function setShape(t: Tile, shape: Shape): Tile {
  if (shape === "empty") return emptyTile();
  const hazards = t.hazards.filter((h) => hazardAllowed(shape, h));
  const marks = canHaveMarks(shape);
  const cross = isCross(shape);
  return {
    ...t,
    shape,
    hazards,
    markL: marks ? t.markL : false,
    markR: marks ? t.markR : false,
    markTL: cross ? !!t.markTL : false,
    markTR: cross ? !!t.markTR : false,
  };
}

export const rotateTile = (t: Tile, d: 1 | -1): Tile => ({
  ...t,
  rot: ((t.rot + d + 4) % 4) as Rot,
});

export const SHAPE_LABEL: Record<Shape, string> = Object.fromEntries(
  SHAPES.map((s) => [s.id, s.label]),
) as Record<Shape, string>;
