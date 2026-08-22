"use client";

import { forwardRef, useMemo } from "react";
import type { Cause, FishboneData, SubCause } from "@/utils/thinklab/types";

const COLORS = {
  paper: "#FBF9F4",
  grid: "#E4DFD2",
  spine: "#14213D",
  body: "#1B3A63",
  bodyLight: "#2A4C7C",
  fin: "#0F2547",
  head: "#E8A33D",
  headText: "#14213D",
  eyeWhite: "#FBF9F4",
  eyePupil: "#0B2545",
  cause: "#C9622F",
  sub: "#1F7A6C",
  detail: "#5B5FC7",
  labelText: "#14213D",
  emptyText: "#7A7461",
};

const BONE_ANGLE = (70 * Math.PI) / 180;

interface Point {
  x: number;
  y: number;
}

interface Layout {
  width: number;
  height: number;
  spineY: number;
  spineXStart: number;
  spineXEnd: number;
  headX: number;
  headY: number;
  headW: number;
  headH: number;
  boneLength: number;
}

function wrapLabel(text: string, maxChars = 20): string[] {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (test.length > maxChars && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines.slice(0, 4) : [""];
}

interface LabelBoxProps {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  maxChars?: number;
  anchor?: "start" | "middle" | "end";
}

function LabelBox({
  x,
  y,
  text,
  fontSize = 13,
  fontWeight = 600,
  color = COLORS.labelText,
  maxChars = 20,
  anchor = "middle",
}: LabelBoxProps) {
  const lines = wrapLabel(text, maxChars);
  const lineHeight = fontSize + 4;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  return (
    <text
      x={x}
      y={startY}
      textAnchor={anchor}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fill={color}
      fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function computeLayout(data: FishboneData): Layout {
  const n = Math.max(data.causes.length, 1);
  const laneWidth = 230;
  const marginLeft = 150;
  const headW = 190;
  const headH = 150;
  const marginRight = headW + 70;
  const width = Math.max(1040, marginLeft + n * laneWidth + marginRight);
  const height = 740;
  const spineY = height / 2;
  const spineXStart = marginLeft;
  const spineXEnd = width - marginRight;
  // a cabeça encosta direto na ponta do corpo, sem "pescoço"
  const headX = spineXEnd;
  const headY = spineY - headH / 2;
  const boneLength = Math.min(155, Math.max(115, laneWidth * 0.58));

  return { width, height, spineY, spineXStart, spineXEnd, headX, headY, headW, headH, boneLength };
}

function mainBoneEnd(attachX: number, spineY: number, side: 1 | -1, length: number): Point {
  const dx = -Math.cos(BONE_ANGLE) * length;
  const dy = side * Math.sin(BONE_ANGLE) * length;
  return { x: attachX + dx, y: spineY + dy };
}

/** Distribui os t's dos filhos entre 12% e 55% do segmento pai — perto da espinha, longe da ponta (onde fica o rótulo do pai). */
function childT(idx: number, k: number): number {
  return 0.12 + 0.43 * ((idx + 1) / (k + 1));
}

/**
 * Ramo filho = a direção do próprio ramo-pai girada por um ângulo fixo.
 * Como o ramo-pai já aponta para longe da espinha, e o ângulo de giro (< 55°)
 * é menor que a folga angular do pai até cruzar de volta o eixo horizontal,
 * o filho NUNCA cruza para o outro lado — geometricamente garantido,
 * independente de qual "side" (1 ou -1) for sorteado.
 */
function perpBranch(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
  side: 1 | -1,
  length: number,
  rotateDeg = 42
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const theta0 = Math.atan2(dy, dx);
  const theta = theta0 + side * ((rotateDeg * Math.PI) / 180);
  const px = x1 + dx * t;
  const py = y1 + dy * t;
  const ex = px + Math.cos(theta) * length;
  const ey = py + Math.sin(theta) * length;
  return { px, py, ex, ey };
}

function renderChildren(
  children: SubCause[] | string[] | undefined,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  level: 1 | 2,
  keyPrefix: string
) {
  if (!children || children.length === 0) return null;
  const k = children.length;
  const color = level === 1 ? COLORS.sub : COLORS.detail;
  const boneLen = level === 1 ? 64 : 40;
  const fontSize = level === 1 ? 12 : 10.5;
  const fontWeight = level === 1 ? 600 : 500;
  const maxChars = level === 1 ? 18 : 15;

  return children.map((child, idx) => {
    const t = childT(idx, k);
    const side: 1 | -1 = idx % 2 === 0 ? 1 : -1;
    const rotateDeg = level === 1 ? (k === 1 ? 54 : 46) : k === 1 ? 44 : 38;
    const { px, py, ex, ey } = perpBranch(x1, y1, x2, y2, t, side, boneLen, rotateDeg);
    const dirx = ex - px;
    const diry = ey - py;
    const dl = Math.hypot(dirx, diry) || 1;
    const ux = dirx / dl;
    const uy = diry / dl;
    const labelX = ex + ux * 12;
    const labelY = ey + uy * 12;
    const label = level === 1 ? (child as SubCause).name : (child as string);
    const grandchildren = level === 1 ? (child as SubCause).details : null;

    return (
      <g key={`${keyPrefix}-${level}-${idx}`}>
        <line
          x1={px}
          y1={py}
          x2={ex}
          y2={ey}
          stroke={color}
          strokeWidth={level === 1 ? 2.2 : 1.5}
          strokeLinecap="round"
        />
        <circle cx={px} cy={py} r={2} fill={color} />
        <LabelBox x={labelX} y={labelY} text={label} fontSize={fontSize} fontWeight={fontWeight} maxChars={maxChars} />
        {level === 1 &&
          grandchildren &&
          grandchildren.length > 0 &&
          renderChildren(grandchildren, px, py, ex, ey, 2, `${keyPrefix}-${idx}`)}
      </g>
    );
  });
}

function renderCauses(data: FishboneData, layout: Layout) {
  const n = Math.max(data.causes.length, 1);
  const usableStart = layout.spineXStart + 55;
  const usableEnd = layout.spineXEnd - 25;

  return data.causes.map((cause: Cause, i: number) => {
    const t = (i + 0.5) / n;
    const attachX = usableStart + t * (usableEnd - usableStart);
    const side: 1 | -1 = i % 2 === 0 ? -1 : 1;
    const end = mainBoneEnd(attachX, layout.spineY, side, layout.boneLength);
    const dirx = end.x - attachX;
    const diry = end.y - layout.spineY;
    const dl = Math.hypot(dirx, diry) || 1;
    const ux = dirx / dl;
    const uy = diry / dl;
    const labelX = end.x + ux * 26;
    const labelY = end.y + uy * 26;

    return (
      <g key={`cause-${i}`}>
        <line
          x1={attachX}
          y1={layout.spineY}
          x2={end.x}
          y2={end.y}
          stroke={COLORS.cause}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={attachX} cy={layout.spineY} r={3} fill={COLORS.spine} />
        <LabelBox x={labelX} y={labelY} text={cause.name} fontSize={14.5} fontWeight={700} maxChars={19} />
        {renderChildren(cause.subcauses, attachX, layout.spineY, end.x, end.y, 1, `c${i}`)}
      </g>
    );
  });
}

function renderFishBody(layout: Layout) {
  const { spineXStart, spineXEnd, spineY } = layout;
  const tailHalf = 3;
  const headHalf = 15;
  const midX = (spineXStart + spineXEnd) / 2;

  // corpo em forma de fuso: fino perto da cauda, mais grosso perto da cabeça
  const d = [
    `M ${spineXStart} ${spineY - tailHalf}`,
    `Q ${midX} ${spineY - headHalf - 4} ${spineXEnd} ${spineY - headHalf}`,
    `L ${spineXEnd} ${spineY + headHalf}`,
    `Q ${midX} ${spineY + headHalf + 4} ${spineXStart} ${spineY + tailHalf}`,
    "Z",
  ].join(" ");

  return (
    <g>
      <path d={d} fill={COLORS.body} />
      <path
        d={`M ${spineXStart + 10} ${spineY - tailHalf - 1} Q ${midX} ${spineY - headHalf - 3} ${
          spineXEnd - 4
        } ${spineY - headHalf + 1}`}
        stroke={COLORS.bodyLight}
        strokeWidth={1.5}
        fill="none"
        opacity={0.6}
      />
    </g>
  );
}

function renderFishTail(layout: Layout) {
  const { spineXStart, spineY } = layout;
  const d = [
    `M ${spineXStart + 4} ${spineY}`,
    `L ${spineXStart - 42} ${spineY - 36}`,
    `L ${spineXStart - 16} ${spineY}`,
    `L ${spineXStart - 42} ${spineY + 36}`,
    "Z",
  ].join(" ");
  return <path d={d} fill={COLORS.fin} stroke={COLORS.spine} strokeWidth={1.5} strokeLinejoin="round" />;
}

function renderFishHead(layout: Layout, problemText: string) {
  const { headX, headW, headH, spineY } = layout;
  const bulge = headH / 2 + 20;
  const tipX = headX + headW;

  const d = [
    `M ${headX} ${spineY - headH / 2}`,
    `Q ${headX + headW * 0.55} ${spineY - bulge} ${tipX} ${spineY}`,
    `Q ${headX + headW * 0.55} ${spineY + bulge} ${headX} ${spineY + headH / 2}`,
    "Z",
  ].join(" ");

  const eyeX = headX + headW * 0.3;
  const eyeY = spineY - headH * 0.16;
  const mouthBaseX = headX + headW * 0.86;

  return (
    <g>
      <path d={d} fill={COLORS.head} stroke={COLORS.spine} strokeWidth={3} strokeLinejoin="round" />

      {/* guelra */}
      <path
        d={`M ${headX + 16} ${spineY - headH / 2 + 14} Q ${headX + 30} ${spineY} ${headX + 16} ${
          spineY + headH / 2 - 14
        }`}
        stroke={COLORS.spine}
        strokeWidth={2}
        fill="none"
        opacity={0.55}
      />

      {/* boca */}
      <path
        d={`M ${mouthBaseX} ${spineY - 7} Q ${tipX - 4} ${spineY} ${mouthBaseX} ${spineY + 7}`}
        stroke={COLORS.spine}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* olho */}
      <circle cx={eyeX} cy={eyeY} r={11} fill={COLORS.eyeWhite} stroke={COLORS.spine} strokeWidth={1.5} />
      <circle cx={eyeX + 3} cy={eyeY} r={5} fill={COLORS.eyePupil} />

      <LabelBox
        x={headX + headW * 0.4}
        y={spineY + headH * 0.28}
        text={problemText || "Escreva o problema com #"}
        fontSize={14.5}
        fontWeight={800}
        color={COLORS.headText}
        maxChars={15}
      />
    </g>
  );
}

function buildAriaSummary(data: FishboneData): string {
  const causeCount = data.causes.length;
  if (causeCount === 0) {
    return "Diagrama de Ishikawa vazio. Adicione causas no editor para preenchê-lo.";
  }
  const causeNames = data.causes.map((c) => c.name || "causa sem nome").join(", ");
  return `Diagrama de Ishikawa para o problema "${data.problem || "não definido"}", com ${causeCount} causa${
    causeCount !== 1 ? "s" : ""
  }: ${causeNames}.`;
}

export interface FishboneDiagramProps {
  data: FishboneData;
  /** Quando true, o SVG ocupa 100% da largura do contêiner (útil em telas pequenas). */
  fitToScreen?: boolean;
}

const FishboneDiagram = forwardRef<SVGSVGElement, FishboneDiagramProps>(function FishboneDiagram(
  { data, fitToScreen = false },
  ref
) {
  const layout = useMemo(() => computeLayout(data), [data]);
  const hasCauses = data.causes.length > 0;
  const ariaSummary = useMemo(() => buildAriaSummary(data), [data]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={fitToScreen ? "100%" : layout.width}
      height={fitToScreen ? "auto" : layout.height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="fishbone-title fishbone-desc"
    >
      <title id="fishbone-title">Diagrama de Ishikawa (espinha de peixe)</title>
      <desc id="fishbone-desc">{ariaSummary}</desc>

      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke={COLORS.grid} strokeWidth="1" />
        </pattern>
      </defs>

      <rect x={0} y={0} width={layout.width} height={layout.height} fill={COLORS.paper} />
      <rect x={0} y={0} width={layout.width} height={layout.height} fill="url(#grid)" />

      {/* corpo (espinha dorsal afunilada) e cauda */}
      {renderFishBody(layout)}
      {renderFishTail(layout)}

      {hasCauses ? (
        renderCauses(data, layout)
      ) : (
        <text
          x={(layout.spineXStart + layout.spineXEnd) / 2}
          y={layout.spineY - 30}
          textAnchor="middle"
          fontSize={15}
          fill={COLORS.emptyText}
          fontFamily="Inter, sans-serif"
        >
          Adicione causas no editor usando ## para vê-las aqui
        </text>
      )}

      {/* cabeça do peixe (problema principal) */}
      {renderFishHead(layout, data.problem)}
    </svg>
  );
});

export default FishboneDiagram;