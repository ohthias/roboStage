import { defaultProject, emptyBoard, sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import type { Rot, Shape, Tile } from "@/utils/quickbrick/ArenaBuilder/types";
import type { Actor, ActorKind, Drawing, Frame, Marking, MarkingKind, Pose, Pt, Resource, Scene, StageDoc } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const ACTOR_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#db2777", "#65a30d"];
export const INK_COLORS = ["#111827", "#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#ffffff"];

export const ACTOR_KIND_LABEL: Record<ActorKind, string> = {
  robot: "Robô",
  human: "Ator",
  prop: "Objeto",
};

export const ACTOR_DEFAULT_SIZE: Record<ActorKind, number> = {
  robot: 25,
  human: 50,
  prop: 30,
};

export const MARKING_LABEL: Record<MarkingKind, string> = {
  tape: "Fita",
  rect: "Área",
  circle: "Círculo",
  cross: "Marca X",
  text: "Texto",
};

/* ------------------------------------------------------------------ */
/*                    regras OBR Robótica Artística 2026               */
/* ------------------------------------------------------------------ */

/**
 * Números do Manual de Regras e Instruções (Regional/Estadual) e do documento
 * "Área de competição" da OBR Robótica Artística 2026.
 */
export const OBR = {
  /** palco quadrado de 2,70 m × 2,70 m (Caderno Verde, p. 26) */
  stage: 270,
  /** fita preta de demarcação de 5 cm no contorno do palco (Área de competição) */
  borderTape: 5,
  /** painéis de MDF de 90 × 90 cm sugeridos para montar o palco */
  panel: 90,
  /** duração mínima: 1:30 — abaixo disso a apresentação vale zero */
  minTime: 90,
  /** duração máxima: 5:00, incluindo recomeços */
  maxTime: 300,
  /** janela no palco: 7 min para montar, apresentar, recomeçar, desmontar e limpar */
  slot: 420,
  teamMin: 2,
  teamMax: 4,
  /** 4 recursos escolhidos, 10 pontos cada */
  resources: 4,
  /** −3 pontos por intervenção não planejada, recomeço ou a cada 10 s de atraso */
  penalty: 3,
} as const;

export const OBR_DOCS = [
  {
    label: "Manual de Regras (Regional/Estadual)",
    url: "https://obr.robocup.org.br/wp-content/uploads/2026/03/2026-Manual-de-Regras-e-Instrucoes-Regional_Estadual-Robotica-Artistica.pptx.pdf",
  },
  {
    label: "Área de competição",
    url: "https://obr.robocup.org.br/wp-content/uploads/2026/03/OBR2026_Area-de-competicao-_-robotica-artistica.pptx.pdf",
  },
];

export const fmtClock = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/*                              criação                               */
/* ------------------------------------------------------------------ */

export function newFrame(poses: Record<string, Pose> = {}, resources: string[] = []): Frame {
  return { id: uid(), poses: clonePoses(poses), note: "", resources: [...resources] };
}

export function newScene(n: number, poses: Record<string, Pose> = {}): Scene {
  return { id: uid(), name: `Cena ${n}`, frameDuration: 5, smooth: true, frames: [newFrame(poses)], notes: "" };
}

export function newActor(kind: ActorKind, index: number): Actor {
  const count = index + 1;
  return {
    id: uid(),
    name: `${ACTOR_KIND_LABEL[kind]} ${count}`,
    kind,
    color: ACTOR_COLORS[index % ACTOR_COLORS.length],
    size: ACTOR_DEFAULT_SIZE[kind],
  };
}

export const newResource = (): Resource => ({ id: uid(), name: "", actorId: null });

export const clonePoses = (p: Record<string, Pose>) =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, { ...v }]));

/** pista vazia: 3 peças de 3×3 (90 cm, como os painéis do palco), sem linha */
function emptyTrack() {
  const p = defaultProject();
  p.name = "Pista do palco";
  p.boards = [emptyBoard(1, 0, 0), emptyBoard(2, 3, 0), emptyBoard(3, 6, 0)];
  p.roomPos = { col: 10, row: 7 };
  return p;
}

export function defaultDoc(): StageDoc {
  return {
    version: 1,
    name: "Minha apresentação",
    stage: { width: OBR.stage, depth: OBR.stage },
    safety: 10,
    markings: [],
    drawings: [],
    actors: [],
    scenes: [newScene(1)],
    resources: Array.from({ length: OBR.resources }, () => newResource()),
    setupTime: 60,
    teardownTime: 45,
    track: emptyTrack(),
    trackVisible: true,
  };
}

/* ------------------------------------------------------------------ */
/*                               exemplo                              */
/* ------------------------------------------------------------------ */

export function sampleDoc(): StageDoc {
  const d = defaultDoc();
  d.name = "Apresentação de exemplo";

  // pista: um circuito fechado 3×3 (um painel de 90 cm) no centro do palco
  const track = emptyTrack();
  track.boards = [emptyBoard(1, 3, 3), emptyBoard(2, 0, 0), emptyBoard(3, 6, 0)];
  const t = (shape: Shape, rot: Rot): Tile => ({ shape, rot, hazards: [], markL: false, markR: false });
  const e = (): Tile => t("empty", 0);
  track.boards[0].tiles = [
    t("curve", 1), t("straight", 1), t("curve", 2),
    t("straight", 0), e(), t("straight", 0),
    t("curve", 0), t("straight", 1), t("curve", 3),
  ];
  d.track = track;

  const robot = { ...newActor("robot", 0), name: "Robô seguidor" };
  const robot2 = { ...newActor("robot", 1), name: "Robô dançarino", size: 30 };
  const ana = { ...newActor("human", 2), name: "Ana" };
  const leo = { ...newActor("human", 3), name: "Léo" };
  d.actors = [robot, robot2, ana, leo];

  const [r1, r2, r3, r4] = d.resources;
  Object.assign(r1, { name: "Seguir a linha", actorId: robot.id });
  Object.assign(r2, { name: "Dançar no ritmo da música", actorId: robot2.id });
  Object.assign(r3, { name: "Reagir à aproximação de um ator", actorId: robot2.id });
  Object.assign(r4, { name: "Expressões na matriz de LED", actorId: robot2.id });

  d.markings = [
    { id: uid(), kind: "cross", points: [{ x: 45, y: 220 }], color: "#f59e0b", width: 3, label: "Ana" },
    { id: uid(), kind: "cross", points: [{ x: 240, y: 220 }], color: "#f59e0b", width: 3, label: "Léo" },
    {
      id: uid(),
      kind: "rect",
      points: [
        { x: 195, y: 15 },
        { x: 255, y: 80 },
      ],
      color: "#3b82f6",
      width: 1.5,
      label: "largada dos robôs",
    },
  ];

  const P = (x: number, y: number, angle = 0): Pose => ({ x, y, angle });

  // (giro 0° = de frente para a plateia; 90° = virado para a esquerda; 180° = fundo; 270° = direita)
  const s1 = newScene(1);
  s1.name = "Abertura";
  s1.frameDuration = 12;
  s1.frames = [
    newFrame({ [robot.id]: P(105, 135, 180), [robot2.id]: P(225, 45, 0), [ana.id]: P(35, 110, 270) }),
    newFrame({ [robot.id]: P(105, 105, 270), [robot2.id]: P(225, 45, 0), [ana.id]: P(40, 170, 315) }, [r1.id]),
    newFrame(
      { [robot.id]: P(165, 105, 0), [robot2.id]: P(220, 95, 30), [ana.id]: P(45, 220, 0), [leo.id]: P(250, 200, 90) },
      [r1.id],
    ),
    newFrame(
      { [robot.id]: P(165, 165, 90), [robot2.id]: P(212, 112, 45), [ana.id]: P(45, 220, 0), [leo.id]: P(240, 220, 0) },
      [r1.id],
    ),
  ];
  s1.frames[0].note = "3-2-1 visível; a música começa. Robô seguidor parte da linha.";
  s1.frames[2].note = "Léo entra pela direita.";

  // cena 2: há uma colisão proposital (Robô dançarino × Léo) para mostrar o verificador
  const s2 = newScene(2);
  s2.name = "Encontro";
  s2.frameDuration = 15;
  s2.frames = [
    newFrame(s1.frames[3].poses),
    newFrame({ [robot.id]: P(105, 165, 180), [robot2.id]: P(185, 195, 60), [ana.id]: P(55, 215, 270), [leo.id]: P(200, 195, 90) }),
    newFrame(
      { [robot.id]: P(105, 135, 180), [robot2.id]: P(140, 190, 0), [ana.id]: P(60, 225, 0), [leo.id]: P(205, 225, 0) },
      [r2.id],
    ),
  ];
  s2.frames[2].note = "Refrão: o robô dançarino gira no ritmo.";

  const s3 = newScene(3);
  s3.name = "Final";
  s3.frameDuration = 20;
  s3.frames = [
    newFrame(s2.frames[2].poses),
    newFrame(
      { [robot.id]: P(105, 105, 270), [robot2.id]: P(135, 165, 180), [ana.id]: P(60, 225, 0), [leo.id]: P(205, 225, 0) },
      [r2.id],
    ),
    newFrame(
      { [robot.id]: P(165, 105, 0), [robot2.id]: P(135, 165, 0), [ana.id]: P(95, 230, 0), [leo.id]: P(200, 230, 0) },
      [r3.id],
    ),
  ];
  s3.frames[2].note = "Ana se aproxima e o robô responde. Sinal claro de fim.";
  d.scenes = [s1, s2, s3];
  return d;
}

/* ------------------------------------------------------------------ */
/*                           interpolação                             */
/* ------------------------------------------------------------------ */

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** menor diferença angular (graus, -180..180) */
export const angleDelta = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;
export const normAngle = (a: number) => ((a % 360) + 360) % 360;

function catmull(p0: number, p1: number, p2: number, p3: number, u: number) {
  const u2 = u * u;
  const u3 = u2 * u;
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
}

export interface PoseAt {
  pose: Pose;
  /** 1 = em cena; entre 0 e 1 = entrando/saindo de cena */
  opacity: number;
}

/** pose de um ator no instante `t` (em quadros, 0..n-1) da cena */
export function poseAt(scene: Scene, actorId: string, t: number): PoseAt | null {
  const fr = scene.frames;
  if (!fr.length) return null;
  const tt = Math.max(0, Math.min(fr.length - 1, t));
  const i = Math.min(fr.length - 1, Math.floor(tt));
  const u = tt - i;
  const a = fr[i]?.poses[actorId];
  const b = fr[i + 1]?.poses[actorId];
  if (u < 1e-6 || !fr[i + 1]) return a ? { pose: a, opacity: 1 } : null;
  if (a && b) {
    if (!scene.smooth) {
      return {
        pose: { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), angle: normAngle(a.angle + angleDelta(a.angle, b.angle) * u) },
        opacity: 1,
      };
    }
    const p0 = fr[i - 1]?.poses[actorId] ?? a;
    const p3 = fr[i + 2]?.poses[actorId] ?? b;
    return {
      pose: {
        x: catmull(p0.x, a.x, b.x, p3.x, u),
        y: catmull(p0.y, a.y, b.y, p3.y, u),
        angle: normAngle(a.angle + angleDelta(a.angle, b.angle) * u),
      },
      opacity: 1,
    };
  }
  if (a) return { pose: a, opacity: 1 - u };
  if (b) return { pose: b, opacity: u };
  return null;
}

/** trechos contínuos da trajetória de um ator numa cena (amostrados) */
export function trajectory(scene: Scene, actorId: string, steps = 12): Pt[][] {
  const out: Pt[][] = [];
  let cur: Pt[] = [];
  const fr = scene.frames;
  for (let i = 0; i < fr.length; i++) {
    const a = fr[i].poses[actorId];
    const b = fr[i + 1]?.poses[actorId];
    if (!a) {
      if (cur.length > 1) out.push(cur);
      cur = [];
      continue;
    }
    if (!cur.length) cur.push({ x: a.x, y: a.y });
    if (b) {
      for (let k = 1; k <= steps; k++) {
        const p = poseAt(scene, actorId, i + k / steps)!.pose;
        cur.push({ x: p.x, y: p.y });
      }
    } else {
      if (cur.length > 1) out.push(cur);
      cur = [];
    }
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

/** raio de colisão: círculo para atores e objetos; círculo circunscrito para robôs (quadrados) */
export const actorRadius = (a: Actor) => (a.kind === "robot" ? (a.size / 2) * Math.SQRT2 : a.size / 2);

export const sceneDuration = (s: Scene) => Math.max(0, s.frames.length - 1) * s.frameDuration;

/* ------------------------------------------------------------------ */
/*                             verificação                            */
/* ------------------------------------------------------------------ */

export type IssueLevel = "error" | "warn" | "info";

export interface Issue {
  id: string;
  level: IssueLevel;
  sceneId: string;
  /** instante (em quadros) onde o problema aparece */
  t: number;
  title: string;
  detail: string;
  at?: Pt;
  actors: string[];
}

export function analyze(doc: StageDoc): Issue[] {
  const issues: Issue[] = [];
  const byId = new Map(doc.actors.map((a) => [a.id, a]));
  const W = doc.stage.width;
  const D = doc.stage.depth;
  const fmtT = (s: Scene, t: number) => `${(t * s.frameDuration).toFixed(1)} s (quadro ${Math.round(t) + 1})`;

  doc.scenes.forEach((scene, si) => {
    const n = scene.frames.length;
    if (n < 2) {
      issues.push({
        id: `${scene.id}-single`,
        level: "info",
        sceneId: scene.id,
        t: 0,
        title: "Cena com um único quadro",
        detail: `“${scene.name}” não tem movimento. Adicione quadros para animar.`,
        actors: [],
      });
    }

    const step = 1 / 20;
    // pares em conflito: chave -> intervalo aberto
    const open = new Map<string, { t0: number; t1: number; min: number; at: Pt; tMin: number; overlap: boolean }>();
    const flush = (key: string) => {
      const c = open.get(key)!;
      open.delete(key);
      const [a, b] = key.split("|");
      const A = byId.get(a)!;
      const B = byId.get(b)!;
      issues.push({
        id: `${scene.id}-${key}-${c.t0.toFixed(2)}`,
        level: c.overlap ? "error" : "warn",
        sceneId: scene.id,
        t: c.tMin,
        title: c.overlap ? `Colisão: ${A.name} × ${B.name}` : `Muito próximos: ${A.name} e ${B.name}`,
        detail: `${scene.name}, por volta de ${fmtT(scene, c.tMin)} — distância livre mínima de ${Math.max(0, c.min).toFixed(0)} cm (folga pedida: ${doc.safety} cm).`,
        at: c.at,
        actors: [a, b],
      });
    };

    const outside = new Map<string, { t: number; at: Pt }>();

    for (let t = 0; t <= n - 1 + 1e-9; t += step) {
      const present: { a: (typeof doc.actors)[number]; p: Pose }[] = [];
      for (const a of doc.actors) {
        const r = poseAt(scene, a.id, t);
        if (r && r.opacity >= 0.5) present.push({ a, p: r.pose });
      }
      const seen = new Set<string>();
      for (let i = 0; i < present.length; i++) {
        const { a, p } = present[i];
        if ((p.x < 0 || p.y < 0 || p.x > W || p.y > D) && !outside.has(a.id)) outside.set(a.id, { t, at: { x: p.x, y: p.y } });
        for (let j = i + 1; j < present.length; j++) {
          const { a: b, p: q } = present[j];
          const gap = Math.hypot(p.x - q.x, p.y - q.y) - actorRadius(a) - actorRadius(b);
          if (gap >= doc.safety) continue;
          const key = [a.id, b.id].sort().join("|");
          seen.add(key);
          const at = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
          const c = open.get(key);
          if (!c) open.set(key, { t0: t, t1: t, min: gap, at, tMin: t, overlap: gap < 0 });
          else {
            c.t1 = t;
            if (gap < c.min) Object.assign(c, { min: gap, at, tMin: t });
            if (gap < 0) c.overlap = true;
          }
        }
      }
      for (const key of [...open.keys()]) if (!seen.has(key)) flush(key);
    }
    for (const key of [...open.keys()]) flush(key);

    for (const [id, o] of outside) {
      const a = byId.get(id)!;
      issues.push({
        id: `${scene.id}-out-${id}`,
        level: "info",
        sceneId: scene.id,
        t: o.t,
        title: `${a.name} sai do palco`,
        detail: `${scene.name}, em ${fmtT(scene, o.t)}. Movimentos fora do palco não são pontuados (nem penalizados).`,
        at: o.at,
        actors: [id],
      });
    }

    // continuidade com a próxima cena
    const next = doc.scenes[si + 1];
    if (next && n && next.frames.length) {
      const last = scene.frames[n - 1].poses;
      const first = next.frames[0].poses;
      for (const a of doc.actors) {
        const p = last[a.id];
        const q = first[a.id];
        if (p && q && (Math.hypot(p.x - q.x, p.y - q.y) > 5 || Math.abs(angleDelta(p.angle, q.angle)) > 15)) {
          issues.push({
            id: `${scene.id}-jump-${a.id}`,
            level: "warn",
            sceneId: next.id,
            t: 0,
            title: `${a.name} “salta” entre cenas`,
            detail: `A posição no fim de “${scene.name}” não bate com o início de “${next.name}” (${Math.hypot(p.x - q.x, p.y - q.y).toFixed(0)} cm de diferença).`,
            at: { x: q.x, y: q.y },
            actors: [a.id],
          });
        }
      }
    }
  });

  issues.push(...ruleIssues(doc));

  const rank: Record<IssueLevel, number> = { error: 0, warn: 1, info: 2 };
  const sceneIdx = new Map(doc.scenes.map((s, i) => [s.id, i]));
  return issues.sort(
    (a, b) => rank[a.level] - rank[b.level] || sceneIdx.get(a.sceneId)! - sceneIdx.get(b.sceneId)! || a.t - b.t,
  );
}

/** soma da duração de todas as cenas (s) */
export const showDuration = (doc: StageDoc) => doc.scenes.reduce((acc, s) => acc + sceneDuration(s), 0);

/** verificações tiradas do Manual de Regras da OBR Robótica Artística 2026 */
function ruleIssues(doc: StageDoc): Issue[] {
  const out: Issue[] = [];
  const first = doc.scenes[0]?.id ?? "";
  const W = doc.stage.width;
  const D = doc.stage.depth;
  const push = (i: Omit<Issue, "id" | "actors" | "sceneId" | "t"> & Partial<Pick<Issue, "actors" | "sceneId" | "t">>, id: string) =>
    out.push({ actors: [], sceneId: first, t: 0, ...i, id: `rule-${id}` });

  /* ---------------------------- tempo ---------------------------- */
  const total = showDuration(doc);
  const hasShow = doc.actors.length > 0;
  if (!hasShow) {
    /* sem elenco ainda: nada a cronometrar */
  } else if (total < OBR.minTime)
    push(
      {
        level: "error",
        title: `Apresentação curta demais (${fmtClock(total)})`,
        detail: `O mínimo é ${fmtClock(OBR.minTime)}: abaixo disso a apresentação recebe zero pontos.`,
      },
      "min",
    );
  else if (hasShow && total < OBR.minTime + 10)
    push(
      {
        level: "warn",
        title: `Pouca margem sobre o mínimo (${fmtClock(total)})`,
        detail: `Com menos de ${fmtClock(OBR.minTime)} a nota é zero. Deixe alguns segundos de folga.`,
      },
      "min-margin",
    );
  if (total > OBR.maxTime)
    push(
      {
        level: "error",
        title: `Passa do máximo de ${fmtClock(OBR.maxTime)} (${fmtClock(total)})`,
        detail: `São −${OBR.penalty} pontos a cada 10 s além do tempo (≈ −${Math.ceil((total - OBR.maxTime) / 10) * OBR.penalty} pts).`,
      },
      "max",
    );
  else if (total > OBR.maxTime - 20)
    push(
      {
        level: "warn",
        title: `Sem folga para recomeços (${fmtClock(total)})`,
        detail: `Os ${fmtClock(OBR.maxTime)} incluem os recomeços (−${OBR.penalty} pts cada). Uma apresentação mais curta dá margem para recomeçar.`,
      },
      "max-margin",
    );
  const slot = doc.setupTime + total + doc.teardownTime;
  if (hasShow && slot > OBR.slot)
    push(
      {
        level: "warn",
        title: `Não cabe na janela de 7 min (${fmtClock(slot)})`,
        detail: `Montagem (${fmtClock(doc.setupTime)}) + apresentação (${fmtClock(total)}) + desmontagem e limpeza (${fmtClock(doc.teardownTime)}) passam de ${fmtClock(OBR.slot)}.`,
      },
      "slot",
    );

  /* ---------------------------- elenco ---------------------------- */
  const humans = doc.actors.filter((a) => a.kind === "human");
  const robots = doc.actors.filter((a) => a.kind === "robot");
  if (doc.actors.length && !humans.length)
    push(
      { level: "error", title: "Nenhum integrante em cena", detail: "Ao menos um membro da equipe deve se apresentar com os robôs no palco." },
      "nohuman",
    );
  if (humans.length > OBR.teamMax)
    push(
      {
        level: "warn",
        title: `${humans.length} pessoas no elenco`,
        detail: `Cada equipe tem de ${OBR.teamMin} a ${OBR.teamMax} integrantes.`,
      },
      "team",
    );
  if (doc.actors.length && !robots.length)
    push({ level: "warn", title: "Nenhum robô no elenco", detail: "A apresentação é avaliada pelos robôs: adicione ao menos um." }, "norobot");

  const inside = (p: Pose) => p.x >= 0 && p.y >= 0 && p.x <= W && p.y <= D;

  // robô que começa fora do palco não é avaliado na apresentação inteira
  for (const r of robots) {
    for (const sc of doc.scenes) {
      const f = sc.frames.find((fr) => fr.poses[r.id]);
      if (!f) continue;
      if (!inside(f.poses[r.id]))
        push(
          {
            level: "error",
            title: `${r.name} começa fora do palco`,
            detail: "Robôs que iniciam fora da área de apresentação não são avaliados durante toda a apresentação.",
            sceneId: sc.id,
            t: sc.frames.indexOf(f),
            at: { x: f.poses[r.id].x, y: f.poses[r.id].y },
            actors: [r.id],
          },
          `start-${r.id}`,
        );
      break;
    }
  }

  for (const sc of doc.scenes) {
    // cena com robôs e sem ninguém da equipe
    const has = (kind: ActorKind) => sc.frames.some((f) => doc.actors.some((a) => a.kind === kind && f.poses[a.id] && inside(f.poses[a.id])));
    if (humans.length && has("robot") && !has("human"))
      push(
        {
          level: "warn",
          title: `“${sc.name}” sem integrante no palco`,
          detail: "Ao menos um membro da equipe deve se apresentar com os robôs.",
          sceneId: sc.id,
        },
        `alone-${sc.id}`,
      );

    const backs = new Set<string>();
    const blocks = new Set<string>();
    sc.frames.forEach((f, fi) => {
      for (const h of humans) {
        const p = f.poses[h.id];
        if (!p || !inside(p)) continue;
        // de costas para a plateia (giro 0° = de frente)
        if (Math.abs(angleDelta(0, p.angle)) > 100 && !backs.has(h.id)) {
          backs.add(h.id);
          push(
            {
              level: "warn",
              title: `${h.name} de costas para a plateia`,
              detail: `${sc.name}, quadro ${fi + 1}. As regras pedem que os integrantes não fiquem de costas para o público.`,
              sceneId: sc.id,
              t: fi,
              at: { x: p.x, y: p.y },
              actors: [h.id],
            },
            `back-${sc.id}-${h.id}`,
          );
        }
        // integrante na frente de um robô, tapando a visão de jurados e plateia
        for (const r of robots) {
          const q = f.poses[r.id];
          const key = `${h.id}|${r.id}`;
          if (!q || blocks.has(key)) continue;
          const dy = p.y - q.y;
          if (dy > 5 && dy < 120 && Math.abs(p.x - q.x) < h.size * 0.35 + r.size * 0.35) {
            blocks.add(key);
            push(
              {
                level: "warn",
                title: `${h.name} encobre ${r.name}`,
                detail: `${sc.name}, quadro ${fi + 1}. Quem está à frente não deve bloquear a visão dos robôs pelo público e pelos jurados.`,
                sceneId: sc.id,
                t: fi,
                at: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 },
                actors: [h.id, r.id],
              },
              `block-${sc.id}-${key}`,
            );
          }
        }
      }
    });
  }

  /* ---------------------------- recursos ---------------------------- */
  const named = doc.resources.filter((r) => r.name.trim());
  if (named.length < OBR.resources)
    push(
      {
        level: "info",
        title: `${named.length} de ${OBR.resources} recursos definidos`,
        detail: "A equipe escolhe 4 recursos (10 pts cada). Cada um deve ser uma ação visível do robô, não só um sensor.",
      },
      "res-count",
    );
  for (const r of named) {
    const shown = doc.scenes.some((sc) => sc.frames.some((f) => f.resources.includes(r.id)));
    if (!shown)
      push(
        {
          level: "warn",
          title: `Recurso “${r.name}” não aparece`,
          detail: "Marque em quais quadros ele é demonstrado. Os jurados só pontuam o que conseguem ver.",
        },
        `res-${r.id}`,
      );
  }

  /* ---------------------------- palco ---------------------------- */
  if (W !== OBR.stage || D !== OBR.stage)
    push(
      {
        level: "info",
        title: `Palco de ${W} × ${D} cm`,
        detail: `O palco oficial tem ${OBR.stage} × ${OBR.stage} cm. Use outra medida só para ensaios em outro espaço.`,
      },
      "size",
    );
  const out_ = doc.markings.filter((m) => m.points.some((p) => p.x < 0 || p.y < 0 || p.x > W || p.y > D));
  if (out_.length)
    push(
      {
        level: "warn",
        title: `${out_.length} marcação(ões) fora do palco`,
        detail: "Marcadores de localização precisam ficar dentro dos limites do palco.",
        at: out_[0].points[0],
      },
      "marks",
    );
  return out;
}

/** velocidade média (cm/s) de um ator entre o quadro `i` e o seguinte */
export function segmentSpeed(scene: Scene, actorId: string, i: number): number | null {
  const a = scene.frames[i]?.poses[actorId];
  const b = scene.frames[i + 1]?.poses[actorId];
  if (!a || !b || scene.frameDuration <= 0) return null;
  // comprimento pela curva amostrada
  let len = 0;
  let prev: Pt = a;
  for (let k = 1; k <= 16; k++) {
    const p = poseAt(scene, actorId, i + k / 16)!.pose;
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len / scene.frameDuration;
}

/* ------------------------------------------------------------------ */
/*                         geometria / desenho                        */
/* ------------------------------------------------------------------ */

/** simplificação Ramer–Douglas–Peucker para traços à mão livre */
export function simplify(pts: Pt[], tol = 0.8): Pt[] {
  if (pts.length < 3) return pts;
  const d2seg = (p: Pt, a: Pt, b: Pt) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const L = dx * dx + dy * dy;
    let u = L ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L : 0;
    u = Math.max(0, Math.min(1, u));
    return Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy));
  };
  let idx = -1;
  let max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = d2seg(pts[i], pts[0], pts[pts.length - 1]);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}

export const pathD = (pts: Pt[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/** caminho suave (curvas quadráticas pelos pontos médios) para desenho livre */
export function smoothD(pts: Pt[]) {
  if (pts.length < 3) return pathD(pts);
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return `${d} L${l.x.toFixed(1)} ${l.y.toFixed(1)}`;
}

export function translateMarking(m: Marking, dx: number, dy: number): Marking {
  return { ...m, points: m.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
}

export function translateDrawing(d: Drawing, dx: number, dy: number): Drawing {
  return { ...d, points: d.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
}

/* ------------------------------------------------------------------ */
/*                              validação                             */
/* ------------------------------------------------------------------ */

const num = (v: unknown, d: number, min = -Infinity, max = Infinity) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : d;
const str = (v: unknown, d: string, max = 200) => (typeof v === "string" ? v.slice(0, max) : d);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const color = (v: unknown, d: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : d);
const pt = (v: unknown): Pt | null => {
  const o = obj(v);
  return typeof o.x === "number" && typeof o.y === "number" && Number.isFinite(o.x) && Number.isFinite(o.y)
    ? { x: o.x, y: o.y }
    : null;
};
const pts = (v: unknown) => arr(v).map(pt).filter((p): p is Pt => !!p);

export function sanitizeDoc(raw: unknown): StageDoc | null {
  const r = obj(raw);
  if (!Array.isArray(r.scenes)) return null;
  const base = defaultDoc();
  const kinds: MarkingKind[] = ["tape", "rect", "circle", "cross", "text"];
  const actorKinds: ActorKind[] = ["robot", "human", "prop"];

  const actors: Actor[] = arr(r.actors).map((v, i) => {
    const a = obj(v);
    const kind = actorKinds.includes(a.kind as ActorKind) ? (a.kind as ActorKind) : "robot";
    return {
      id: str(a.id, uid(), 40) || uid(),
      name: str(a.name, `Ator ${i + 1}`, 60),
      kind,
      color: color(a.color, ACTOR_COLORS[i % ACTOR_COLORS.length]),
      size: num(a.size, ACTOR_DEFAULT_SIZE[kind], 5, 300),
    };
  });
  const ids = new Set(actors.map((a) => a.id));

  const resources: Resource[] = (Array.isArray(r.resources) ? arr(r.resources) : base.resources)
    .slice(0, 8)
    .map((v) => {
      const o = obj(v);
      const actorId = typeof o.actorId === "string" && ids.has(o.actorId) ? o.actorId : null;
      return { id: str(o.id, uid(), 40) || uid(), name: str(o.name, "", 80), actorId };
    });
  const resIds = new Set(resources.map((x) => x.id));

  const scenes: Scene[] = arr(r.scenes).map((v, i) => {
    const s = obj(v);
    const frames: Frame[] = arr(s.frames).map((fv) => {
      const f = obj(fv);
      const poses: Record<string, Pose> = {};
      for (const [k, pv] of Object.entries(obj(f.poses))) {
        const p = obj(pv);
        if (!ids.has(k) || typeof p.x !== "number" || typeof p.y !== "number") continue;
        poses[k] = { x: num(p.x, 0), y: num(p.y, 0), angle: normAngle(num(p.angle, 0)) };
      }
      return {
        id: str(f.id, uid(), 40) || uid(),
        poses,
        note: str(f.note, "", 500),
        resources: arr(f.resources).filter((x): x is string => typeof x === "string" && resIds.has(x)),
      };
    });
    return {
      id: str(s.id, uid(), 40) || uid(),
      name: str(s.name, `Cena ${i + 1}`, 60),
      frameDuration: num(s.frameDuration, 5, 0.1, 120),
      smooth: s.smooth !== false,
      frames: frames.length ? frames : [newFrame()],
      notes: str(s.notes, "", 2000),
    };
  });

  const stage = obj(r.stage);
  return {
    version: 1,
    name: str(r.name, base.name, 80),
    stage: { width: num(stage.width, OBR.stage, 60, 2000), depth: num(stage.depth, OBR.stage, 60, 2000) },
    safety: num(r.safety, 10, 0, 200),
    resources,
    setupTime: num(r.setupTime, base.setupTime, 0, 600),
    teardownTime: num(r.teardownTime, base.teardownTime, 0, 600),
    markings: arr(r.markings)
      .map((v): Marking | null => {
        const m = obj(v);
        const kind = kinds.includes(m.kind as MarkingKind) ? (m.kind as MarkingKind) : null;
        const p = pts(m.points);
        if (!kind || !p.length) return null;
        return {
          id: str(m.id, uid(), 40) || uid(),
          kind,
          points: p,
          color: color(m.color, "#f59e0b"),
          width: num(m.width, 3, 0.5, 40),
          label: str(m.label, "", 80),
        };
      })
      .filter((m): m is Marking => !!m),
    drawings: arr(r.drawings)
      .map((v): Drawing | null => {
        const d = obj(v);
        const p = pts(d.points);
        if (p.length < 2) return null;
        return { id: str(d.id, uid(), 40) || uid(), points: p, color: color(d.color, "#111827"), width: num(d.width, 1.5, 0.3, 40) };
      })
      .filter((d): d is Drawing => !!d),
    actors,
    scenes: scenes.length ? scenes : base.scenes,
    track: sanitizeProject(r.track) ?? base.track,
    trackVisible: r.trackVisible !== false,
  };
}
