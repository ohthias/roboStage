import { boardsOverlap, collides, roomRect } from "./project";
import {
  roomCols,
  roomRows,
  doorBlocksCorner,
  doorCenter,
  inTriangle,
  roomH,
  roomW,
  wallCells,
} from "./rescue";
import { connections, DIRS, terminalSide } from "./tiles";
import type { Door, Project, Rescue, Tile, Wall } from "./types";

export type Level = "ok" | "warn" | "error" | "info";
export interface Check {
  level: Level;
  text: string;
}

export interface ScoreLine {
  label: string;
  count: number;
  each: number;
  points: number;
}

export interface Analysis {
  score: ScoreLine[];
  total: number;
  tileCount: number;
  checks: Check[];
}

interface Placed {
  tile: Tile;
  boardId: number;
  x: number;
  y: number;
}

const key = (x: number, y: number) => `${x},${y}`;

function placedMap(p: Project): Map<string, Placed> {
  const m = new Map<string, Placed>();
  for (const b of p.boards) {
    b.tiles.forEach((tile, i) => {
      if (tile.shape === "empty") return;
      const x = b.col + (i % 3);
      const y = b.row + Math.floor(i / 3);
      m.set(key(x, y), { tile, boardId: b.id, x, y });
    });
  }
  return m;
}

function neighborOf(map: Map<string, Placed>, from: Placed, side: number): Placed | null {
  if (terminalSide(from.tile) === side) return null;
  const [dx, dy] = DIRS[side];
  const n = map.get(key(from.x + dx, from.y + dy));
  if (!n) return null;
  const back = (side + 2) % 4;
  if (!connections(n.tile).includes(back)) return null;
  if (terminalSide(n.tile) === back) return null;
  return n;
}

function reach(map: Map<string, Placed>, start: Placed): Set<string> {
  const seen = new Set<string>([key(start.x, start.y)]);
  const queue: Placed[] = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const s of connections(cur.tile)) {
      const n = neighborOf(map, cur, s);
      if (n && !seen.has(key(n.x, n.y))) {
        seen.add(key(n.x, n.y));
        queue.push(n);
      }
    }
  }
  return seen;
}

export function analyzePath(p: Project): Analysis {
  const map = placedMap(p);
  const all = [...map.values()];
  const checks: Check[] = [];

  const count = (f: (t: Tile) => boolean) => all.filter((a) => f(a.tile)).length;
  const hz = (h: string) => count((t) => t.hazards.includes(h as never));

  const nInter = count((t) => t.shape === "tee" || t.shape === "cross");
  const nFinish = count((t) => t.shape === "finish");

  const score: ScoreLine[] = [
    { label: "Interseção / beco sem saída", count: nInter, each: 10, points: nInter * 10 },
    { label: "Gangorra", count: hz("seesaw"), each: 20, points: hz("seesaw") * 20 },
    { label: "Obstáculo", count: hz("obstacle"), each: 20, points: hz("obstacle") * 20 },
    { label: "Ladrilho com gap", count: hz("gap"), each: 10, points: hz("gap") * 10 },
    { label: "Ladrilho de rampa", count: hz("ramp"), each: 10, points: hz("ramp") * 10 },
    { label: "Ladrilho com lombada", count: hz("bump"), each: 10, points: hz("bump") * 10 },
    { label: "Passagem", count: hz("passage"), each: 0, points: 0 },
    { label: "Ladrilho de chegada", count: nFinish, each: 60, points: nFinish ? 60 : 0 },
  ];
  const total = score.reduce((s, l) => s + l.points, 0);

  // tablados sobrepostos
  const overlap = p.boards.some((a, i) => p.boards.some((b, j) => j > i && boardsOverlap(a, b)));
  checks.push(
    overlap
      ? { level: "error", text: "Há tablados sobrepostos." }
      : { level: "ok", text: "3 tablados 3×3 posicionados sem sobreposição." },
  );
  checks.push(
    collides(p, roomRect(p))
      ? { level: "error", text: "A sala de resgate está sobreposta a um tablado." }
      : { level: "ok", text: "Sala de resgate posicionada sem sobreposição." },
  );

  // elementos obrigatórios
  const starts = all.filter((a) => a.tile.shape === "start");
  const finishes = all.filter((a) => a.tile.shape === "finish");
  const silvers = all.filter((a) => a.tile.shape === "silver");
  const blacks = all.filter((a) => a.tile.shape === "black");
  const need = (label: string, n: number) =>
    checks.push(
      n === 1
        ? { level: "ok", text: `${label}: 1` }
        : { level: "error", text: `${label}: ${n} (precisa ser exatamente 1)` },
    );
  need("Ladrilho de partida", starts.length);
  need("Ladrilho de chegada", finishes.length);
  need("Entrada da sala de resgate (fita prata)", silvers.length);
  need("Saída da sala de resgate (fita preta)", blacks.length);


  // fitas prata/preta encostadas nas portas da sala
  const facing: Record<Wall, number> = { N: 2, S: 0, E: 3, W: 1 };
  const outside = (d: Door) => {
    const w = roomCols(p.rescue);
    const h = roomRows(p.rescue);
    const { col, row } = p.roomPos;
    switch (d.wall) {
      case "N":
        return { x: col + d.cell, y: row - 1 };
      case "S":
        return { x: col + d.cell, y: row + h };
      case "E":
        return { x: col + w, y: row + d.cell };
      case "W":
        return { x: col - 1, y: row + d.cell };
    }
  };
  for (const [tileList, door, name] of [
    [silvers, p.rescue.entrance, "prata"],
    [blacks, p.rescue.exit, "preta"],
  ] as const) {
    if (tileList.length !== 1) continue;
    const t = tileList[0];
    const o = outside(door);
    const ok = t.x === o.x && t.y === o.y && t.tile.rot === facing[door.wall];
    checks.push(
      ok
        ? { level: "ok", text: `Ladrilho da fita ${name} está junto à ${name === "prata" ? "entrada" : "saída"} da sala.` }
        : {
            level: "warn",
            text: `O ladrilho da fita ${name} não está encostado na ${name === "prata" ? "entrada" : "saída"} da sala (posição ou giro diferentes da porta).`,
          },
    );
  }

  // mínimo de 8 ladrilhos fora partida/chegada
  const tileCount = count((t) => t.shape !== "start" && t.shape !== "finish");
  checks.push(
    tileCount >= 8
      ? { level: "ok", text: `${tileCount} ladrilhos (mínimo de 8, sem partida/chegada).` }
      : {
          level: "warn",
          text: `Apenas ${tileCount} ladrilhos; o manual pede no mínimo 8, sem contar partida e chegada.`,
        },
  );

  // continuidade da linha
  let openLine = 0;
  let openInter = 0;
  const reachedAll = new Set<string>();
  if (starts.length === 1) {
    const r = reach(map, starts[0]);
    r.forEach((k) => reachedAll.add(k));
    if (silvers.length === 1) {
      const ok = r.has(key(silvers[0].x, silvers[0].y));
      checks.push(
        ok
          ? { level: "ok", text: "A linha liga a partida à entrada da sala de resgate." }
          : { level: "error", text: "A linha não chega até a fita prata (há interrupção no trajeto de entrada)." },
      );
    }
    if (finishes.length === 1 && r.has(key(finishes[0].x, finishes[0].y))) {
      checks.push({
        level: "error",
        text: "A partida está ligada direto à chegada, sem passar pela sala de resgate.",
      });
    }
  }
  if (blacks.length === 1) {
    const r = reach(map, blacks[0]);
    r.forEach((k) => reachedAll.add(k));
    if (finishes.length === 1) {
      const ok = r.has(key(finishes[0].x, finishes[0].y));
      checks.push(
        ok
          ? { level: "ok", text: "A linha liga a saída da sala de resgate à chegada." }
          : { level: "error", text: "A linha não liga a fita preta ao ladrilho de chegada." },
      );
    }
  }
  reachedAll.forEach((k) => {
    const a = map.get(k)!;
    for (const s of connections(a.tile)) {
      if (terminalSide(a.tile) === s) continue;
      if (!neighborOf(map, a, s)) {
        if (a.tile.shape === "tee" || a.tile.shape === "cross") openInter++;
        else openLine++;
      }
    }
  });
  if (openLine > 0)
    checks.push({ level: "warn", text: `${openLine} ponta(s) de linha sem continuação.` });
  if (openInter > 0)
    checks.push({
      level: "info",
      text: `${openInter} ramo(s) de interseção sem continuação (aceitável como beco sem saída).`,
    });

  // tablados vazios
  p.boards.forEach((b) => {
    if (b.tiles.every((t) => t.shape === "empty"))
      checks.push({ level: "info", text: `Tablado ${b.id} está vazio.` });
  });

  return { score, total, tileCount, checks };
}

function doorSpan(r: Rescue, d: Door): [number, number] {
  const c = doorCenter(d);
  return [c - r.doorWidth / 2, c + r.doorWidth / 2];
}

export function analyzeRescue(r: Rescue): Check[] {
  const checks: Check[] = [];
  const W = roomW(r);
  const H = roomH(r);
  checks.push({ level: "ok", text: `Sala de resgate ${W} × ${H} cm (${r.size.replace("x", " × ")} ladrilhos).` });

  for (const [name, d] of [
    ["Entrada", r.entrance],
    ["Saída", r.exit],
  ] as const) {
    if (d.cell >= wallCells(r, d.wall))
      checks.push({ level: "error", text: `${name} fora da parede.` });
  }

  if (r.entrance.wall === r.exit.wall) {
    const [a1, a2] = doorSpan(r, r.entrance);
    const [b1, b2] = doorSpan(r, r.exit);
    if (a1 < b2 && b1 < a2)
      checks.push({ level: "error", text: "Entrada e saída estão sobrepostas." });
  }

  if (r.green === r.red) checks.push({ level: "error", text: "As áreas verde e vermelha estão no mesmo canto." });
  for (const [name, c] of [
    ["verde", r.green],
    ["vermelha", r.red],
  ] as const) {
    if ([r.entrance, r.exit].some((d) => doorBlocksCorner(r, d, c)))
      checks.push({
        level: "error",
        text: `A área ${name} fica num canto com entrada/saída (use um canto livre).`,
      });
  }

  const alive = r.victims.filter((v) => v.kind === "alive").length;
  const dead = r.victims.filter((v) => v.kind === "dead").length;
  checks.push(
    alive === 2 && dead === 1
      ? { level: "ok", text: "2 vítimas vivas (prata) e 1 morta (preta)." }
      : { level: "error", text: "São necessárias exatamente 2 vítimas vivas e 1 morta." },
  );
  const inZone = r.victims.filter((v) => [r.green, r.red].some((c) => inTriangle(r, c, v.x, v.y)));
  if (inZone.length)
    checks.push({ level: "warn", text: "Há vítima já dentro de uma área de resgate." });

  checks.push({
    level: "info",
    text: "Resgate: vítima viva na área verde ×1,3 · vítima morta na área vermelha ×1,3.",
  });
  return checks;
}
