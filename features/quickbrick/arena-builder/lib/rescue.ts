import type { Corner, Door, Rescue, Victim, Wall } from "./types";

export const WALL_T = 3;
export const VICTIM_R = 2.25; // esfera de 4 a 5 cm

export const WALL_LABEL: Record<Wall, string> = {
  N: "Topo",
  E: "Direita",
  S: "Base",
  W: "Esquerda",
};

export const CORNER_LABEL: Record<Corner, string> = {
  NW: "Superior esquerdo",
  NE: "Superior direito",
  SE: "Inferior direito",
  SW: "Inferior esquerdo",
};

export const CORNERS: Corner[] = ["NW", "NE", "SE", "SW"];

export const roomW = (r: Rescue) => (r.size === "3x4" ? 120 : 90);
export const roomH = (_r: Rescue) => 90;
/** tamanho da sala em ladrilhos de 30 cm */
export const roomCols = (r: Rescue) => roomW(r) / 30;
export const roomRows = (_r: Rescue) => 3;

export const wallLength = (r: Rescue, wall: Wall) =>
  wall === "N" || wall === "S" ? roomW(r) : roomH(r);

export const wallCells = (r: Rescue, wall: Wall) => Math.floor(wallLength(r, wall) / 30);

export const doorCenter = (d: Door) => 15 + 30 * d.cell;

/** retângulo do vão da porta (atravessando a espessura da parede) */
export function doorGap(r: Rescue, d: Door) {
  const W = roomW(r);
  const H = roomH(r);
  const c = doorCenter(d);
  const w = r.doorWidth;
  const t = WALL_T + 0.2;
  switch (d.wall) {
    case "N":
      return { x: c - w / 2, y: -WALL_T - 0.1, w, h: t };
    case "S":
      return { x: c - w / 2, y: H - 0.1, w, h: t };
    case "E":
      return { x: W - 0.1, y: c - w / 2, w: t, h: w };
    case "W":
      return { x: -WALL_T - 0.1, y: c - w / 2, w: t, h: w };
  }
}

/** fita de 25 mm x 250 mm sobre o piso, junto ao vão */
export function doorStrip(r: Rescue, d: Door) {
  const W = roomW(r);
  const H = roomH(r);
  const c = doorCenter(d);
  switch (d.wall) {
    case "N":
      return { x: c - 12.5, y: 0, w: 25, h: 2.5 };
    case "S":
      return { x: c - 12.5, y: H - 2.5, w: 25, h: 2.5 };
    case "E":
      return { x: W - 2.5, y: c - 12.5, w: 2.5, h: 25 };
    case "W":
      return { x: 0, y: c - 12.5, w: 2.5, h: 25 };
  }
}

/** linha (traço) que sai da porta para fora da sala */
export function doorStub(r: Rescue, d: Door, len = 10) {
  const W = roomW(r);
  const H = roomH(r);
  const c = doorCenter(d);
  switch (d.wall) {
    case "N":
      return { x1: c, y1: 0, x2: c, y2: -len };
    case "S":
      return { x1: c, y1: H, x2: c, y2: H + len };
    case "E":
      return { x1: W, y1: c, x2: W + len, y2: c };
    case "W":
      return { x1: 0, y1: c, x2: -len, y2: c };
  }
}

/** triângulo retângulo (30 x 30 cm) da área de resgate em um canto */
export function cornerTriangle(r: Rescue, c: Corner) {
  const W = roomW(r);
  const H = roomH(r);
  const L = 30;
  switch (c) {
    case "NW":
      return { corner: [0, 0], a: [L, 0], b: [0, L] } as const;
    case "NE":
      return { corner: [W, 0], a: [W - L, 0], b: [W, L] } as const;
    case "SE":
      return { corner: [W, H], a: [W - L, H], b: [W, H - L] } as const;
    case "SW":
      return { corner: [0, H], a: [L, H], b: [0, H - L] } as const;
  }
}

export function inTriangle(r: Rescue, c: Corner, x: number, y: number, margin = 0) {
  const t = cornerTriangle(r, c);
  return Math.abs(x - t.corner[0]) + Math.abs(y - t.corner[1]) <= 30 + margin;
}

/** o vão da porta invade o trecho de 30 cm do canto? */
export function doorBlocksCorner(r: Rescue, d: Door, c: Corner): boolean {
  const W = roomW(r);
  const H = roomH(r);
  const cc = doorCenter(d);
  const lo = cc - r.doorWidth / 2;
  const hi = cc + r.doorWidth / 2;
  const touchesStart = lo < 30; // 0..30 a partir do início da parede
  const len = d.wall === "N" || d.wall === "S" ? W : H;
  const touchesEnd = hi > len - 30;
  switch (c) {
    case "NW":
      return (d.wall === "N" && touchesStart) || (d.wall === "W" && touchesStart);
    case "NE":
      return (d.wall === "N" && touchesEnd) || (d.wall === "E" && touchesStart);
    case "SE":
      return (d.wall === "S" && touchesEnd) || (d.wall === "E" && touchesEnd);
    case "SW":
      return (d.wall === "S" && touchesStart) || (d.wall === "W" && touchesEnd);
  }
}

export function clampVictim(r: Rescue, x: number, y: number) {
  const m = VICTIM_R + 0.3;
  return {
    x: Math.min(roomW(r) - m, Math.max(m, x)),
    y: Math.min(roomH(r) - m, Math.max(m, y)),
  };
}

export function randomVictims(r: Rescue): Victim[] {
  const kinds: Victim["kind"][] = ["alive", "alive", "dead"];
  const ids = ["a1", "a2", "d1"];
  const out: Victim[] = [];
  for (let i = 0; i < kinds.length; i++) {
    for (let tries = 0; tries < 300; tries++) {
      const x = 6 + Math.random() * (roomW(r) - 12);
      const y = 6 + Math.random() * (roomH(r) - 12);
      const inZone = [r.green, r.red].some((c) => inTriangle(r, c, x, y, 4));
      const near = out.some((v) => Math.hypot(v.x - x, v.y - y) < 12);
      if (!inZone && !near) {
        out.push({ id: ids[i], kind: kinds[i], x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 });
        break;
      }
    }
  }
  return out;
}

export function defaultRescue(): Rescue {
  const base: Rescue = {
    size: "3x3",
    entrance: { wall: "S", cell: 1 },
    exit: { wall: "E", cell: 1 },
    doorWidth: 25,
    green: "NW",
    red: "SW",
    victims: [],
  };
  base.victims = [
    { id: "a1", kind: "alive", x: 62, y: 25 },
    { id: "a2", kind: "alive", x: 28, y: 52 },
    { id: "d1", kind: "dead", x: 48, y: 38 },
  ];
  return base;
}
