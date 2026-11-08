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

  { id: "dashed", label: "Tracejada", hint: "Trechos de 2,5 / 5 / 2,5 cm com falhas de 10 cm (conta como gap)", group: "straight" },
  { id: "spike", label: "Pico", hint: "Desvio em V de 45° no meio da reta", group: "straight" },
  { id: "wave", label: "Ondulada", hint: "Curvas em S (raios de 3 e 4 cm)", group: "straight" },
  { id: "zigzag", label: "Ziguezague", hint: "Ziguezague fechado a 45°", group: "straight" },
  { id: "chevron", label: "Ziguezague largo", hint: "Duas dobras de 90° atravessando o ladrilho", group: "straight" },
  { id: "steps", label: "Degraus", hint: "Desvios em ângulo reto para os dois lados", group: "straight" },
  { id: "stairs", label: "Escada", hint: "Degraus em ângulo reto para um lado só", group: "straight" },
  { id: "meander", label: "Serpentina", hint: "Linha em E, com voltas de 90°", group: "straight" },
  { id: "vee", label: "Seta (V)", hint: "Vai até a borda lateral e volta, a 45°", group: "straight" },
  { id: "uturn", label: "Volta pela borda", hint: "Contorna o ladrilho pela borda em U", group: "straight" },
  { id: "deadEnd", label: "Fim em T", hint: "Linha termina numa barra transversal (beco sem saída, 10 pts)", group: "straight" },

  { id: "corner", label: "Canto 90°", hint: "Curva em ângulo reto", group: "turn" },
  { id: "diagonal", label: "Diagonal", hint: "Liga as bordas por uma reta a 45°", group: "turn" },
  { id: "chamfer", label: "Chanfro", hint: "Curva com dois ângulos de 135°", group: "turn" },
  { id: "jog", label: "Degrau", hint: "Curva em dois degraus de 90°", group: "turn" },
  { id: "hook", label: "Gancho", hint: "Recua antes de virar, com quatro dobras", group: "turn" },
  { id: "edgeCorner", label: "Canto na borda", hint: "Linha corre junto às bordas do ladrilho", group: "turn" },

  { id: "loop", label: "Laço", hint: "Volta de 270° antes de sair", group: "loop" },
  { id: "frame", label: "Contorno", hint: "Laço retangular antes de sair", group: "loop" },
  { id: "ring", label: "Círculo", hint: "Círculo de 20 cm com duas junções (2 interseções)", group: "loop" },
  { id: "ringCut", label: "Círculo com atalho", hint: "Círculo com atalho pelo centro (2 interseções)", group: "loop" },

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

/* -------------------------------------------------------------------------- */
/* marcações verdes                                                           */
/* -------------------------------------------------------------------------- */

export type MarkKey = "markL" | "markR" | "markTL" | "markTR";
export const MARK_KEYS: MarkKey[] = ["markL", "markR", "markTL", "markTR"];

export interface MarkSlot {
  key: MarkKey;
  label: string;
  /** canto superior esquerdo do quadrado verde (2,5 cm), com rotação 0 */
  x: number;
  y: number;
}

/** junções onde a marcação verde tem sentido: perto da junção, no ramo de chegada */
const BASE_MARKS: MarkSlot[] = [
  { key: "markL", label: "Esquerda", x: 11.25, y: 16.25 },
  { key: "markR", label: "Direita", x: 16.25, y: 16.25 },
];
const RING_MARKS: MarkSlot[] = [
  { key: "markL", label: "↓ Esquerda", x: 11.25, y: 25.25 },
  { key: "markR", label: "↓ Direita", x: 16.25, y: 25.25 },
  { key: "markTL", label: "→ Esquerda", x: 25.25, y: 16.25 },
  { key: "markTR", label: "→ Direita", x: 25.25, y: 11.25 },
];

export const MARK_SLOTS: Partial<Record<Shape, MarkSlot[]>> = {
  tee: BASE_MARKS,
  cross: [
    { key: "markTL", label: "↖ Sup. esq.", x: 11.25, y: 11.25 },
    { key: "markTR", label: "↗ Sup. dir.", x: 16.25, y: 11.25 },
    { key: "markL", label: "↙ Inf. esq.", x: 11.25, y: 16.25 },
    { key: "markR", label: "↘ Inf. dir.", x: 16.25, y: 16.25 },
  ],
  deadEnd: BASE_MARKS,
  ring: RING_MARKS,
  ringCut: RING_MARKS,
};

export const MARK_HINT: Partial<Record<Shape, string>> = {
  tee: "Vistas de quem chega pelo ramo de baixo (as duas = beco sem saída).",
  cross: "Um marcador em cada quadrante (até 4).",
  deadEnd: "Antes da barra, vistas de quem chega pela linha (as duas = beco sem saída, o robô volta).",
  ring: "Duas junções: ↓ de quem chega por baixo, → de quem chega pela direita. Indicam para que lado contornar o círculo.",
  ringCut:
    "Duas junções: ↓ de quem chega por baixo, → de quem chega pela direita. Indicam para que lado seguir no círculo.",
};

export const markSlots = (shape: Shape): MarkSlot[] => MARK_SLOTS[shape] ?? [];
export const canHaveMarks = (shape: Shape) => markSlots(shape).length > 0;
export const isCross = (shape: Shape) => shape === "cross";

/** mantém só as marcações que existem no formato */
export function keepMarks(shape: Shape, src: Partial<Record<MarkKey, unknown>>): Pick<Tile, MarkKey> {
  const ok = new Set(markSlots(shape).map((m) => m.key));
  return {
    markL: ok.has("markL") && !!src.markL,
    markR: ok.has("markR") && !!src.markR,
    markTL: ok.has("markTL") && !!src.markTL,
    markTR: ok.has("markTR") && !!src.markTR,
  };
}

/** interseções (ou becos) que o ladrilho contém, 10 pts cada */
const JUNCTIONS: Partial<Record<Shape, number>> = {
  tee: 1,
  cross: 1,
  deadEnd: 1,
  ring: 2,
  ringCut: 2,
};
export const junctionCount = (shape: Shape) => JUNCTIONS[shape] ?? 0;
export const isJunction = (shape: Shape) => junctionCount(shape) > 0;

/* -------------------------------------------------------------------------- */
/* gap e lombada                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Ponto da linha onde o gap ou a lombada é desenhado (rotação 0, em cm).
 * `a` é a direção da linha em graus; o gap é um vão de `len` cm ao longo dela,
 * a lombada são duas faixas de `len` cm atravessando a linha.
 */
export interface Spot {
  x: number;
  y: number;
  a: number;
  len: number;
  /** largura da área apagada pelo gap (padrão 6) */
  w?: number;
  /** desloca o centro das faixas da lombada para o lado (cm) */
  off?: number;
}

const S = (x: number, y: number, a: number, len: number, w?: number, off?: number): Spot => ({ x, y, a, len, w, off });

export const HAZARD_SPOTS: Partial<Record<Shape, { gap?: Spot; bump?: Spot }>> = {
  straight: { gap: S(15, 15, 90, 10), bump: S(15, 24.5, 90, 24) },
  silver: { gap: S(15, 15, 90, 10), bump: S(15, 24.5, 90, 24) },
  black: { gap: S(15, 15, 90, 10), bump: S(15, 24.5, 90, 24) },
  curve: { gap: S(19.1, 10.9, 45, 7, 5), bump: S(26, 15, 0, 9) },
  tee: { gap: S(15, 24, 90, 7), bump: S(24, 15, 0, 9) },
  cross: { gap: S(15, 24, 90, 7), bump: S(24, 15, 0, 9) },

  deadEnd: { gap: S(15, 21.5, 90, 4), bump: S(15, 26.6, 90, 10) },
  dashed: { bump: S(15, 15, 90, 9) },
  spike: { gap: S(15, 25.5, 90, 5), bump: S(15, 4.5, 90, 9) },
  wave: { gap: S(15, 15, 0, 5, 3.2), bump: S(19, 19.5, 90, 7) },
  zigzag: { gap: S(15, 18.6, 45, 4, 2.4), bump: S(15, 9.8, 45, 6) },
  chevron: { gap: S(12, 12, 45, 6, 3.2), bump: S(19, 19, 45, 9) },
  steps: { gap: S(19, 20.5, 90, 6, 3.2), bump: S(11, 9.5, 90, 9) },
  stairs: { gap: S(27, 18, 90, 3, 3.2), bump: S(27, 13.2, 90, 5) },
  meander: { gap: S(15, 15, 90, 5, 3.2), bump: S(8.25, 24, 90, 6) },
  vee: { gap: S(22, 22.5, -47, 7, 3.2), bump: S(22, 7.5, 47, 9) },
  uturn: { gap: S(29.2, 15, 90, 7, 1.6), bump: S(22, 0.75, 0, 4, undefined, 1.4) },
  corner: { gap: S(15, 23, 90, 6, 3.2), bump: S(23, 15, 0, 9) },
  diagonal: { gap: S(24.75, 20.25, -45, 5, 3.2), bump: S(19.5, 25.5, -45, 9) },
  chamfer: { gap: S(25.5, 15, 0, 5, 3.2), bump: S(15, 26, 90, 9) },
  jog: { gap: S(25, 15, 0, 6, 3.2), bump: S(15, 25, 90, 9) },
  hook: { gap: S(25.5, 15, 0, 5, 3.2), bump: S(15, 24.5, 90, 7) },
  edgeCorner: { gap: S(22, 29.2, 0, 6, 1.6), bump: S(29.25, 21, 90, 4, undefined, 1.4) },
  loop: { gap: S(6, 15, 90, 5, 3.2), bump: S(15, 6, 0, 7) },
  frame: { gap: S(6, 14, 90, 7, 3.2), bump: S(15, 6, 0, 7) },
  ring: { gap: S(6, 15, 90, 5, 3.2), bump: S(15, 6, 0, 7) },
  ringCut: { gap: S(8.64, 21.36, 45, 4, 3), bump: S(21.36, 21.36, -45, 6) },
  doubleDiag: { gap: S(22.5, 22.5, -45, 6, 3.2), bump: S(7.5, 7.5, -45, 9) },
  curveDiag: { gap: S(22.5, 22.5, -45, 6, 3.2), bump: S(10.6, 10.6, -45, 7) },
};

/** perigos que já fazem parte do desenho do ladrilho (não saem) */
export const BUILTIN_HAZARDS: Partial<Record<Shape, Hazard[]>> = {
  dashed: ["gap"],
};
const builtin = (shape: Shape): Hazard[] => BUILTIN_HAZARDS[shape] ?? [];
export const isBuiltinHazard = (shape: Shape, h: Hazard) => builtin(shape).includes(h);

export function hazardAllowed(shape: Shape, h: Hazard): boolean {
  switch (h) {
    case "gap":
    case "bump":
      // qualquer linha com ponto definido para o perigo
      return isBuiltinHazard(shape, h) || !!HAZARD_SPOTS[shape]?.[h];
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

/** perigos válidos para o formato, incluindo os embutidos no desenho */
export function keepHazards(shape: Shape, hazards: readonly unknown[]): Hazard[] {
  const out = hazards.filter((h, i): h is Hazard => hazards.indexOf(h) === i && hazardAllowed(shape, h as Hazard));
  for (const h of builtin(shape)) if (!out.includes(h)) out.push(h);
  return out;
}

export function toggleHazard(t: Tile, h: Hazard): Tile {
  if (!hazardAllowed(t.shape, h) || isBuiltinHazard(t.shape, h)) return t;
  if (t.hazards.includes(h)) return { ...t, hazards: t.hazards.filter((x) => x !== h) };
  return { ...t, hazards: [...t.hazards.filter((x) => !EXCLUDES[h].includes(x)), h] };
}

/** troca o formato mantendo apenas o que continua válido */
export function setShape(t: Tile, shape: Shape): Tile {
  if (shape === "empty") return emptyTile();
  return {
    ...t,
    shape,
    // perigos embutidos do formato anterior não passam para o novo
    hazards: keepHazards(
      shape,
      t.hazards.filter((h) => !isBuiltinHazard(t.shape, h)),
    ),
    ...keepMarks(shape, t),
  };
}

export const rotateTile = (t: Tile, d: 1 | -1): Tile => ({
  ...t,
  rot: ((t.rot + d + 4) % 4) as Rot,
});

export const SHAPE_LABEL: Record<Shape, string> = Object.fromEntries(
  SHAPES.map((s) => [s.id, s.label]),
) as Record<Shape, string>;