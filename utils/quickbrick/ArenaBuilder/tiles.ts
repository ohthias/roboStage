import type { Hazard, Rot, Shape, Tile } from "./types";

/** lado do ladrilho em cm */
export const CELL = 30;
/** espaço de trabalho em ladrilhos */
export const COLS = 14;
export const ROWS = 10;

export type ShapeGroup = "base" | "straight" | "turn" | "loop" | "double";

export const SHAPE_GROUPS: { id: ShapeGroup; label: string }[] = [
  { id: "base", label: "Básicos" },
  { id: "straight", label: "Atravessam (entrada e saída opostas)" },
  { id: "turn", label: "Viram 90° (entrada embaixo, saída à direita)" },
  { id: "loop", label: "Laços e círculos" },
  { id: "double", label: "Duas linhas independentes" },
];

export const SHAPES: { id: Shape; label: string; hint: string; group: ShapeGroup }[] = [
  { id: "empty", label: "Vazio", hint: "Sem linha (apaga o ladrilho)", group: "base" },
  { id: "straight", label: "Reta", hint: "Linha reta", group: "base" },
  { id: "curve", label: "Curva", hint: "Curva de 90°", group: "base" },
  { id: "tee", label: "Interseção T", hint: "3 ramificações (marcações verdes opcionais)", group: "base" },
  { id: "cross", label: "Interseção +", hint: "4 ramificações (marcações verdes opcionais)", group: "base" },
  { id: "start", label: "Partida", hint: "Ladrilho de partida", group: "base" },
  { id: "finish", label: "Chegada", hint: "Faixa vermelha, 60 pts", group: "base" },
  { id: "silver", label: "Entrada resgate", hint: "Fita prata: linha termina na sala de resgate", group: "base" },
  { id: "black", label: "Saída resgate", hint: "Fita preta: linha recomeça após a sala", group: "base" },

  { id: "dashed", label: "Tracejada", hint: "Trechos de 2,5 / 5 / 2,5 cm com falhas de 10 cm", group: "straight" },
  { id: "spike", label: "Pico", hint: "Desvio em V de 45° no meio da reta", group: "straight" },
  { id: "wave", label: "Ondulada", hint: "Curvas em S (raios de 3 e 4 cm)", group: "straight" },
  { id: "zigzag", label: "Ziguezague", hint: "Ziguezague fechado a 45°", group: "straight" },
  { id: "chevron", label: "Ziguezague largo", hint: "Duas dobras de 90° atravessando o ladrilho", group: "straight" },
  { id: "steps", label: "Degraus", hint: "Desvios em ângulo reto para os dois lados", group: "straight" },
  { id: "stairs", label: "Escada", hint: "Degraus em ângulo reto para um lado só", group: "straight" },
  { id: "meander", label: "Serpentina", hint: "Linha em E, com voltas de 90°", group: "straight" },
  { id: "vee", label: "Seta (V)", hint: "Vai até a borda lateral e volta, a 45°", group: "straight" },
  { id: "uturn", label: "Volta pela borda", hint: "Contorna o ladrilho pela borda em U", group: "straight" },
  { id: "deadEnd", label: "Fim em T", hint: "Linha termina numa barra transversal (beco)", group: "straight" },

  { id: "corner", label: "Canto 90°", hint: "Curva em ângulo reto", group: "turn" },
  { id: "diagonal", label: "Diagonal", hint: "Liga as bordas por uma reta a 45°", group: "turn" },
  { id: "chamfer", label: "Chanfro", hint: "Curva com dois ângulos de 135°", group: "turn" },
  { id: "jog", label: "Degrau", hint: "Curva em dois degraus de 90°", group: "turn" },
  { id: "hook", label: "Gancho", hint: "Recua antes de virar, com quatro dobras", group: "turn" },
  { id: "edgeCorner", label: "Canto na borda", hint: "Linha corre junto às bordas do ladrilho", group: "turn" },

  { id: "loop", label: "Laço", hint: "Volta de 270° antes de sair", group: "loop" },
  { id: "frame", label: "Contorno", hint: "Laço retangular antes de sair", group: "loop" },
  { id: "ring", label: "Círculo", hint: "Círculo de 20 cm com dois ramos (dois caminhos)", group: "loop" },
  { id: "ringCut", label: "Círculo com atalho", hint: "Círculo com atalho reto pelo centro", group: "loop" },

  { id: "doubleDiag", label: "Diagonais", hint: "Duas diagonais separadas: cima–esquerda e baixo–direita", group: "double" },
  { id: "curveDiag", label: "Curva + diagonal", hint: "Curva cima–esquerda e diagonal baixo–direita", group: "double" },
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
  deadEnd: [2],
  dashed: [0, 2],
  spike: [0, 2],
  wave: [0, 2],
  steps: [0, 2],
  meander: [0, 2],
  chevron: [0, 2],
  zigzag: [0, 2],
  stairs: [0, 2],
  vee: [0, 2],
  uturn: [0, 2],
  diagonal: [1, 2],
  corner: [1, 2],
  edgeCorner: [1, 2],
  chamfer: [1, 2],
  jog: [1, 2],
  hook: [1, 2],
  loop: [1, 2],
  frame: [1, 2],
  ring: [1, 2],
  ringCut: [1, 2],
  doubleDiag: [0, 1, 2, 3],
  curveDiag: [0, 1, 2, 3],
};

/**
 * Lados ligados entre si dentro do ladrilho. Por padrão todas as conexões
 * formam um único trecho; ladrilhos com duas linhas independentes listam
 * cada trecho separadamente.
 */
const BASE_GROUPS: Partial<Record<Shape, number[][]>> = {
  doubleDiag: [
    [0, 3],
    [1, 2],
  ],
  curveDiag: [
    [0, 3],
    [1, 2],
  ],
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

/** trechos de linha do ladrilho, já girados (cada um é uma lista de lados ligados) */
export const sideGroups = (t: Tile): number[][] =>
  (BASE_GROUPS[t.shape] ?? [BASE_CONN[t.shape]]).map((g) => g.map((s) => (s + t.rot) % 4));

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